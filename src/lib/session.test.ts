import { describe, expect, it } from "vitest";
import {
  aggregateReasons,
  aggregateVotes,
  buildPublicSnapshot,
  createInitialSession,
  percentage,
  voteKey,
} from "./session";
import type { VoteSubmission } from "../types";

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

  it("returns safe percentages for empty and populated groups", () => {
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(1, 3)).toBe(33);
  });
});
