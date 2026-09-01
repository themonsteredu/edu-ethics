import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readLocalEnv() {
  const values = {};
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index > 0) values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function subscribe(channel) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Realtime subscribe timeout")), 10_000);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timer);
        resolve();
      }
      if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
        clearTimeout(timer);
        reject(new Error(`Realtime channel ${status}`));
      }
    });
  });
}

function expectOk(result, action) {
  if (result !== "ok") throw new Error(`${action} failed: ${result}`);
}

async function waitFor(predicate, message, timeout = 5_000) {
  const deadline = Date.now() + timeout;
  while (!predicate() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!predicate()) throw new Error(message);
}

const env = readLocalEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Missing VITE_SUPABASE_URL or publishable key");

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};
const teacher = createClient(url, key, clientOptions);
const student = createClient(url, key, clientOptions);
const room = `ethics-smoke-${Date.now()}`;

let receivedSnapshot = null;
let receivedVote = null;
let receivedVoteReceipt = null;
let teacherReplyError = null;
let teacherPresenceCount = 0;
let studentPresenceCount = 0;
const teacherSnapshot = {
  roomCode: room.replace("ethics-smoke-", "").slice(-6).toUpperCase(),
  status: "lobby",
  introIndex: 0,
  roundIndex: 0,
  phaseIndex: 0,
  votingEndsAt: null,
  unlockedKeyIds: [],
  updatedAt: Date.now(),
  connectedStudents: 1,
  responseCount: 0,
  counts: null,
  previousCounts: null,
  reasonCounts: null,
  transport: "supabase",
};
const teacherChannel = teacher
  .channel(room, { config: { private: false, broadcast: { ack: true }, presence: { key: "teacher-smoke" } } })
  .on("broadcast", { event: "room-event" }, ({ payload }) => {
    if (payload.kind === "state-request") {
      void teacherChannel.send({
        type: "broadcast",
        event: "room-event",
        payload: {
          kind: "teacher-state",
          senderId: "teacher-smoke",
          sentAt: Date.now(),
          snapshot: teacherSnapshot,
        },
      }).then((result) => expectOk(result, "teacher-state send")).catch((error) => {
        teacherReplyError = error;
      });
    }
    if (payload.kind === "vote-submit") {
      receivedVote = payload.vote;
      void teacherChannel.send({
        type: "broadcast",
        event: "room-event",
        payload: {
          kind: "vote-accepted",
          senderId: "teacher-smoke",
          sentAt: Date.now(),
          studentId: payload.vote.studentId,
          receiptId: payload.receiptId,
        },
      }).then((result) => expectOk(result, "vote-accepted send")).catch((error) => {
        teacherReplyError = error;
      });
    }
  })
  .on("presence", { event: "sync" }, () => {
    teacherPresenceCount = Object.values(teacherChannel.presenceState()).flat().length;
  });
const studentChannel = student
  .channel(room, {
    config: { private: false, broadcast: { ack: true }, presence: { key: "student-smoke" } },
  })
  .on("broadcast", { event: "room-event" }, ({ payload }) => {
    if (payload.kind === "teacher-state") receivedSnapshot = payload.snapshot;
    if (payload.kind === "vote-accepted") receivedVoteReceipt = payload.receiptId;
  })
  .on("presence", { event: "sync" }, () => {
    studentPresenceCount = Object.values(studentChannel.presenceState()).flat().length;
  });

try {
  await Promise.all([subscribe(teacherChannel), subscribe(studentChannel)]);
  const trackResults = await Promise.all([
    teacherChannel.track({ id: "teacher-smoke", role: "teacher", onlineAt: Date.now() }),
    studentChannel.track({ id: "student-smoke", role: "student", onlineAt: Date.now() }),
  ]);
  trackResults.forEach((result) => expectOk(result, "presence track"));

  await waitFor(
    () => teacherPresenceCount >= 2 && studentPresenceCount >= 2,
    "Presence did not synchronize both classroom members",
  );

  expectOk(await studentChannel.send({
    type: "broadcast",
    event: "room-event",
    payload: { kind: "state-request", senderId: "student-smoke", sentAt: Date.now() },
  }), "state-request send");

  await waitFor(
    () => Boolean(receivedSnapshot) || Boolean(teacherReplyError),
    "Student did not receive the teacher classroom snapshot",
  );
  if (teacherReplyError) throw teacherReplyError;
  if (receivedSnapshot.roomCode !== teacherSnapshot.roomCode || receivedSnapshot.status !== "lobby") {
    throw new Error("Teacher snapshot did not match the requested classroom");
  }

  expectOk(await studentChannel.send({
    type: "broadcast",
    event: "room-event",
    payload: {
      kind: "vote-submit",
      senderId: "student-smoke",
      sentAt: Date.now(),
      receiptId: "smoke-receipt",
      vote: {
        studentId: "student-smoke",
        roundId: "consent-dance-video",
        phaseId: "initial",
        choice: "yellow",
        reasonId: "permission",
        submittedAt: Date.now(),
      },
    },
  }), "vote-submit send");

  await waitFor(() => Boolean(receivedVote), "Teacher did not receive the student vote");
  if (receivedVote.studentId !== "student-smoke" || receivedVote.choice !== "yellow") {
    throw new Error("Vote payload did not match the student submission");
  }
  await waitFor(
    () => receivedVoteReceipt === "smoke-receipt" || Boolean(teacherReplyError),
    "Student did not receive the teacher vote acknowledgement",
  );
  if (teacherReplyError) throw teacherReplyError;

  console.log("Realtime smoke PASS: room handshake, presence, snapshot, vote, and teacher acknowledgement verified.");
} finally {
  await Promise.all([
    teacher.removeChannel(teacherChannel),
    student.removeChannel(studentChannel),
  ]);
}
