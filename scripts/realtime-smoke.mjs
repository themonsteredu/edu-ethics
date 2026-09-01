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

let receivedPayload = null;
const teacherChannel = teacher
  .channel(room, { config: { broadcast: { ack: true }, presence: { key: "teacher-smoke" } } })
  .on("broadcast", { event: "room-event" }, ({ payload }) => {
    receivedPayload = payload;
  });
const studentChannel = student.channel(room, {
  config: { broadcast: { ack: true }, presence: { key: "student-smoke" } },
});

try {
  await Promise.all([subscribe(teacherChannel), subscribe(studentChannel)]);
  await Promise.all([
    teacherChannel.track({ id: "teacher-smoke", role: "teacher", onlineAt: Date.now() }),
    studentChannel.track({ id: "student-smoke", role: "student", onlineAt: Date.now() }),
  ]);
  await studentChannel.send({
    type: "broadcast",
    event: "room-event",
    payload: { kind: "vote-submit", choice: "yellow", reasonId: "rules" },
  });

  const deadline = Date.now() + 5_000;
  while (!receivedPayload && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!receivedPayload || receivedPayload.choice !== "yellow") {
    throw new Error("Realtime broadcast payload was not received");
  }
  console.log("Realtime smoke PASS: 2 clients connected and vote broadcast received.");
} finally {
  await Promise.all([
    teacher.removeChannel(teacherChannel),
    student.removeChannel(studentChannel),
  ]);
}
