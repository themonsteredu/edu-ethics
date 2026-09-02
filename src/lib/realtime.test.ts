import { describe, expect, it } from "vitest";
import { isRoomEvent } from "./realtime";

describe("realtime event validation", () => {
  it("accepts a complete vote submission and teacher acknowledgement", () => {
    expect(isRoomEvent({
      kind: "vote-submit",
      senderId: "student-1",
      sentAt: 1,
      receiptId: "vote-1",
      vote: {
        studentId: "student-1",
        teamId: 2,
        roundId: "round-1",
        phaseId: "phase-1",
        choice: "yellow",
        reasonId: "permission",
        submittedAt: 1,
      },
    })).toBe(true);

    expect(isRoomEvent({
      kind: "vote-accepted",
      senderId: "teacher-1",
      sentAt: 2,
      studentId: "student-1",
      receiptId: "vote-1",
    })).toBe(true);
  });

  it("rejects malformed or unknown public-channel payloads", () => {
    expect(isRoomEvent({ kind: "vote-submit", senderId: "student-1", sentAt: 1 })).toBe(false);
    expect(isRoomEvent({ kind: "vote-submit", senderId: "student-1", sentAt: 1, receiptId: "x", vote: null })).toBe(false);
    expect(isRoomEvent({ kind: "erase-room", senderId: "student-1", sentAt: 1 })).toBe(false);
    expect(isRoomEvent({
      kind: "teacher-state",
      senderId: "teacher-1",
      sentAt: 1,
      snapshot: { roomCode: "ABC234", status: "briefing", updatedAt: 1 },
    })).toBe(false);
  });
});
