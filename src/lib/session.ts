import { lesson1Rounds } from "../data/lesson1";
import type {
  PublicSessionSnapshot,
  TeacherSession,
  VoteCounts,
  VoteSubmission,
} from "../types";

const ROOM_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function createRoomCode(length = 6): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => ROOM_CHARS[value % ROOM_CHARS.length]).join("");
}

export function createClientId(prefix: "teacher" | "student"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createInitialSession(roomCode: string): TeacherSession {
  return {
    roomCode,
    status: "lobby",
    introIndex: 0,
    roundIndex: 0,
    phaseIndex: 0,
    votingEndsAt: null,
    unlockedKeyIds: [],
    updatedAt: Date.now(),
  };
}

export function voteKey(vote: Pick<VoteSubmission, "studentId" | "roundId" | "phaseId">) {
  return `${vote.roundId}:${vote.phaseId}:${vote.studentId}`;
}

export function emptyCounts(): VoteCounts {
  return { green: 0, yellow: 0, red: 0 };
}

export function aggregateVotes(votes: VoteSubmission[]): VoteCounts {
  return votes.reduce<VoteCounts>((counts, vote) => {
    counts[vote.choice] += 1;
    return counts;
  }, emptyCounts());
}

export function aggregateReasons(votes: VoteSubmission[]): Record<string, number> {
  return votes.reduce<Record<string, number>>((counts, vote) => {
    if (vote.reasonId) {
      counts[vote.reasonId] = (counts[vote.reasonId] ?? 0) + 1;
    }
    return counts;
  }, {});
}

export function votesForPhase(
  votes: VoteSubmission[],
  roundId: string,
  phaseId: string,
): VoteSubmission[] {
  return votes.filter((vote) => vote.roundId === roundId && vote.phaseId === phaseId);
}

export function buildPublicSnapshot({
  session,
  votes,
  connectedStudents,
  transport,
}: {
  session: TeacherSession;
  votes: VoteSubmission[];
  connectedStudents: number;
  transport: PublicSessionSnapshot["transport"];
}): PublicSessionSnapshot {
  const round = lesson1Rounds[session.roundIndex] ?? lesson1Rounds[0];
  const phase = round.phases[session.phaseIndex] ?? round.phases[0];
  const currentVotes = votesForPhase(votes, round.id, phase.id);
  const canReveal = ["results", "discussion", "key", "complete"].includes(session.status);

  const previousPhase = session.phaseIndex > 0 ? round.phases[session.phaseIndex - 1] : null;
  const previousVotes = previousPhase
    ? votesForPhase(votes, round.id, previousPhase.id)
    : [];

  return {
    ...session,
    connectedStudents,
    responseCount: currentVotes.length,
    counts: canReveal ? aggregateVotes(currentVotes) : null,
    previousCounts: canReveal && previousPhase ? aggregateVotes(previousVotes) : null,
    reasonCounts: canReveal ? aggregateReasons(currentVotes) : null,
    transport,
  };
}

export function countTotal(counts: VoteCounts): number {
  return counts.green + counts.yellow + counts.red;
}

export function percentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function remainingSeconds(endsAt: number | null, now = Date.now()): number | null {
  if (!endsAt) return null;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}
