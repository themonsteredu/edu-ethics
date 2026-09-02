import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PresenceMember, PublicSessionSnapshot, RoomEvent, VoteSubmission } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export type TransportKind = "supabase" | "classroom-demo";

export interface RoomConnection {
  kind: TransportKind;
  roomCode: string;
  send: (event: RoomEvent) => Promise<void>;
  updatePresence: (member: PresenceMember) => Promise<void>;
  disconnect: () => Promise<void>;
}

interface ConnectRoomOptions {
  roomCode: string;
  member: PresenceMember;
  onEvent: (event: RoomEvent) => void;
  onPresence: (members: PresenceMember[]) => void;
  onDisconnect?: () => void;
}

function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function ensureRealtimeResult(result: string, action: string): void {
  if (result !== "ok") {
    throw new Error(`${action} failed: ${result}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVoteSubmission(value: unknown): value is VoteSubmission {
  if (!isRecord(value)) return false;
  return (
    typeof value.studentId === "string" &&
    (value.teamId === undefined || (Number.isInteger(value.teamId) && Number(value.teamId) >= 1 && Number(value.teamId) <= 6)) &&
    typeof value.roundId === "string" &&
    typeof value.phaseId === "string" &&
    (value.choice === "green" || value.choice === "yellow" || value.choice === "red") &&
    (value.reasonId === undefined || typeof value.reasonId === "string") &&
    typeof value.submittedAt === "number"
  );
}

function isPublicSnapshot(value: unknown): value is PublicSessionSnapshot {
  if (!isRecord(value)) return false;
  const statuses = new Set(["lobby", "briefing", "voting", "results", "discussion", "key", "complete"]);
  const isCounts = (counts: unknown) => (
    counts === null || (
      isRecord(counts) &&
      typeof counts.green === "number" &&
      typeof counts.yellow === "number" &&
      typeof counts.red === "number"
    )
  );
  return (
    typeof value.roomCode === "string" &&
    (value.lessonId === undefined || value.lessonId === 1 || value.lessonId === 2) &&
    statuses.has(String(value.status)) &&
    Number.isInteger(value.introIndex) &&
    Number.isInteger(value.roundIndex) &&
    Number.isInteger(value.phaseIndex) &&
    (value.votingEndsAt === null || typeof value.votingEndsAt === "number") &&
    Array.isArray(value.unlockedKeyIds) &&
    value.unlockedKeyIds.every((key) => typeof key === "string") &&
    typeof value.updatedAt === "number" &&
    Number.isInteger(value.connectedStudents) &&
    Number.isInteger(value.responseCount) &&
    isCounts(value.counts) &&
    isCounts(value.previousCounts) &&
    (value.reasonCounts === null || (
      isRecord(value.reasonCounts) &&
      Object.values(value.reasonCounts).every((count) => typeof count === "number")
    )) &&
    (value.transport === "supabase" || value.transport === "classroom-demo")
  );
}

export function isRoomEvent(value: unknown): value is RoomEvent {
  if (
    !isRecord(value) ||
    typeof value.kind !== "string" ||
    typeof value.senderId !== "string" ||
    typeof value.sentAt !== "number"
  ) {
    return false;
  }

  if (value.kind === "state-request") return true;
  if (value.kind === "teacher-state") return isPublicSnapshot(value.snapshot);
  if (value.kind === "vote-submit") {
    return typeof value.receiptId === "string" && isVoteSubmission(value.vote);
  }
  if (value.kind === "vote-accepted") {
    return typeof value.studentId === "string" && typeof value.receiptId === "string";
  }
  return false;
}

async function connectSupabase(options: ConnectRoomOptions): Promise<RoomConnection> {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase browser configuration is not set.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const normalizedRoomCode = normalizeCode(options.roomCode);
  const roomName = `ethics-${normalizedRoomCode}`;
  let intentionallyClosed = false;
  let subscribed = false;
  const channel: RealtimeChannel = supabase.channel(roomName, {
    config: {
      private: false,
      broadcast: { ack: true, self: false },
      presence: { key: options.member.id },
    },
  });

  channel
    .on("broadcast", { event: "room-event" }, ({ payload }) => {
      if (isRoomEvent(payload)) options.onEvent(payload);
    })
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceMember>();
      const members = Object.values(state)
        .flat()
        .filter((member) => (
          Boolean(member) &&
          typeof member.id === "string" &&
          (member.role === "teacher" || member.role === "student") &&
          typeof member.onlineAt === "number"
        ))
        .map((member) => ({
          id: member.id,
          role: member.role,
          nickname: member.nickname,
          teamId: Number.isInteger(member.teamId) ? member.teamId : undefined,
          onlineAt: member.onlineAt,
          snapshot: isPublicSnapshot(member.snapshot) ? member.snapshot : undefined,
        } satisfies PresenceMember));
      options.onPresence(members);
    });

  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        callback();
      };
      const timeout = window.setTimeout(
        () => finish(() => reject(new Error("Realtime connection timed out."))),
        10_000,
      );

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            const result = await channel.track(options.member);
            ensureRealtimeResult(result, "Presence track");
            subscribed = true;
            finish(resolve);
          } catch (error) {
            finish(() => reject(error));
          }
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          if (subscribed && !intentionallyClosed) options.onDisconnect?.();
          finish(() => reject(new Error(`Realtime channel status: ${status}`)));
        }
      });
    });
  } catch (error) {
    await supabase.removeChannel(channel);
    throw error;
  }

  return {
    kind: "supabase",
    roomCode: normalizedRoomCode,
    async send(event) {
      const result = await channel.send({
        type: "broadcast",
        event: "room-event",
        payload: event,
      });
      ensureRealtimeResult(result, "Realtime send");
    },
    async updatePresence(member) {
      const result = await channel.track(member);
      ensureRealtimeResult(result, "Presence update");
    },
    async disconnect() {
      intentionallyClosed = true;
      await channel.untrack();
      await supabase.removeChannel(channel);
    },
  };
}

type PresenceWireMessage =
  | { scope: "event"; event: RoomEvent }
  | {
      scope: "presence";
      action: "join" | "heartbeat" | "leave";
      member: PresenceMember;
    };

function connectClassroomDemo(options: ConnectRoomOptions): RoomConnection {
  const channel = new BroadcastChannel(`edu-ethics:${normalizeCode(options.roomCode)}`);
  const members = new Map<string, PresenceMember>();
  let selfMember = options.member;
  let closed = false;

  const publishPresence = (action: "join" | "heartbeat" | "leave") => {
    const message: PresenceWireMessage = {
      scope: "presence",
      action,
      member: { ...selfMember, onlineAt: Date.now() },
    };
    channel.postMessage(message);
  };

  const notifyPresence = () => {
    const cutoff = Date.now() - 15_000;
    for (const [id, member] of members) {
      if (member.onlineAt < cutoff) members.delete(id);
    }
    options.onPresence([selfMember, ...members.values()].filter(
      (member, index, list) => list.findIndex((candidate) => candidate.id === member.id) === index,
    ));
  };

  channel.onmessage = (message: MessageEvent<PresenceWireMessage>) => {
    if (message.data.scope === "event") {
      options.onEvent(message.data.event);
      return;
    }

    const { action, member } = message.data;
    if (action === "leave") {
      members.delete(member.id);
    } else {
      members.set(member.id, { ...member, onlineAt: Date.now() });
      if (action === "join") publishPresence("heartbeat");
    }
    notifyPresence();
  };

  const heartbeat = window.setInterval(() => {
    publishPresence("heartbeat");
    notifyPresence();
  }, 5_000);

  members.set(selfMember.id, selfMember);
  publishPresence("join");
  notifyPresence();

  return {
    kind: "classroom-demo",
    roomCode: normalizeCode(options.roomCode),
    async send(event) {
      if (!closed) channel.postMessage({ scope: "event", event } satisfies PresenceWireMessage);
    },
    async updatePresence(member) {
      if (closed) throw new Error("Classroom demo channel is closed.");
      selfMember = member;
      members.set(member.id, member);
      publishPresence("heartbeat");
      notifyPresence();
    },
    async disconnect() {
      if (closed) return;
      closed = true;
      publishPresence("leave");
      window.clearInterval(heartbeat);
      channel.close();
    },
  };
}

export async function connectRoom(options: ConnectRoomOptions): Promise<RoomConnection> {
  if (!supabaseUrl || !supabasePublishableKey) {
    return connectClassroomDemo(options);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await connectSupabase(options);
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      }
    }
  }

  throw new Error("Supabase Realtime connection failed.", { cause: lastError });
}

export function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
