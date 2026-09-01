import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PresenceMember, RoomEvent } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export type TransportKind = "supabase" | "classroom-demo";

export interface RoomConnection {
  kind: TransportKind;
  send: (event: RoomEvent) => Promise<void>;
  disconnect: () => Promise<void>;
}

interface ConnectRoomOptions {
  roomCode: string;
  member: PresenceMember;
  onEvent: (event: RoomEvent) => void;
  onPresence: (members: PresenceMember[]) => void;
}

function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
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

  const roomName = `ethics-${normalizeCode(options.roomCode)}`;
  const channel: RealtimeChannel = supabase.channel(roomName, {
    config: {
      broadcast: { ack: true, self: false },
      presence: { key: options.member.id },
    },
  });

  channel
    .on("broadcast", { event: "room-event" }, ({ payload }) => {
      options.onEvent(payload as RoomEvent);
    })
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceMember>();
      const members = Object.values(state)
        .flat()
        .filter((member) => Boolean(member && member.id && member.role))
        .map((member) => ({
          id: member.id,
          role: member.role,
          nickname: member.nickname,
          onlineAt: member.onlineAt,
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
        6500,
      );

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(options.member);
          finish(resolve);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
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
    async send(event) {
      await channel.send({
        type: "broadcast",
        event: "room-event",
        payload: event,
      });
    },
    async disconnect() {
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
  let closed = false;

  const publishPresence = (action: "join" | "heartbeat" | "leave") => {
    const message: PresenceWireMessage = {
      scope: "presence",
      action,
      member: { ...options.member, onlineAt: Date.now() },
    };
    channel.postMessage(message);
  };

  const notifyPresence = () => {
    const cutoff = Date.now() - 15_000;
    for (const [id, member] of members) {
      if (member.onlineAt < cutoff) members.delete(id);
    }
    options.onPresence([options.member, ...members.values()]);
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

  members.set(options.member.id, options.member);
  publishPresence("join");
  notifyPresence();

  return {
    kind: "classroom-demo",
    async send(event) {
      if (!closed) channel.postMessage({ scope: "event", event } satisfies PresenceWireMessage);
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
  if (supabaseUrl && supabasePublishableKey) {
    try {
      return await connectSupabase(options);
    } catch (error) {
      console.warn("Supabase Realtime unavailable; using classroom demo transport.", error);
    }
  }
  return connectClassroomDemo(options);
}

export function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
