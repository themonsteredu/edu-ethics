import { describe, expect, it } from "vitest";
import {
  aggregateReasons,
  aggregateVotes,
  buildPublicSnapshot,
  createInitialSession,
  normalizeRoomCodeInput,
  percentage,
  voteKey,
} from "./session";
import type { VoteSubmission } from "../types";
import { getLessonConfig } from "../data/lessons";

const votes: VoteSubmission[] = [
  {
    studentId: "a",
    roundId: "consent-dance-video",
    phaseId: "initial",
    choice: "green",
    reasonId: "permission",
    submittedAt: 1,
  },
  {
    studentId: "b",
    roundId: "consent-dance-video",
    phaseId: "initial",
    choice: "yellow",
    reasonId: "permission",
    submittedAt: 2,
  },
  {
    studentId: "c",
    roundId: "consent-dance-video",
    phaseId: "initial",
    choice: "green",
    submittedAt: 3,
  },
];

describe("lesson session helpers", () => {
  it("aggregates signal votes and reasons", () => {
    expect(aggregateVotes(votes)).toEqual({ green: 2, yellow: 1, red: 0 });
    expect(aggregateReasons(votes)).toEqual({ permission: 2 });
  });

  it("replaces a student's vote with a stable key", () => {
    expect(voteKey(votes[0])).toBe("consent-dance-video:initial:a");
  });

  it("hides class results while voting and reveals them after close", () => {
    const voting = createInitialSession("ABC234");
    voting.status = "voting";
    const hidden = buildPublicSnapshot({
      session: voting,
      votes,
      connectedStudents: 3,
      transport: "classroom-demo",
    });
    expect(hidden.counts).toBeNull();
    expect(hidden.responseCount).toBe(3);

    const results = { ...voting, status: "results" as const };
    const revealed = buildPublicSnapshot({
      session: results,
      votes,
      connectedStudents: 3,
      transport: "classroom-demo",
    });
    expect(revealed.counts).toEqual({ green: 2, yellow: 1, red: 0 });
  });

  it("creates and aggregates a lesson-two battle room independently", () => {
    const battleSession = createInitialSession("BATTLE2", 2);
    battleSession.status = "results";
    const battleRound = getLessonConfig(2).rounds[0];
    const battleVotes: VoteSubmission[] = [
      {
        studentId: "team-1-a",
        teamId: 1,
        roundId: battleRound.id,
        phaseId: battleRound.phases[0].id,
        choice: "yellow",
        reasonId: battleRound.phases[0].suggestedReasonTags[0].id,
        submittedAt: 1,
      },
    ];

    const snapshot = buildPublicSnapshot({
      session: battleSession,
      votes: battleVotes,
      connectedStudents: 1,
      transport: "classroom-demo",
    });

    expect(snapshot.lessonId).toBe(2);
    expect(snapshot.counts).toEqual({ green: 0, yellow: 1, red: 0 });
    expect(getLessonConfig(snapshot.lessonId).rounds).toHaveLength(4);
  });

  it("returns safe percentages for empty and populated groups", () => {
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(1, 3)).toBe(33);
  });

  it("extracts an exact room code from direct and legacy copied links", () => {
    expect(normalizeRoomCodeInput("https://edu-ethics.vercel.app/join?room=ABC234")).toBe("ABC234");
    expect(normalizeRoomCodeInput("https://edu-ethics.vercel.app/join  수업코드: ZX9K32")).toBe("ZX9K32");
    expect(normalizeRoomCodeInput("ab c-234")).toBe("ABC234");
  });

  it("keeps overlong plain input invalid instead of silently changing rooms", () => {
    expect(normalizeRoomCodeInput("ABC2345")).toBe("ABC2345");
  });
});
