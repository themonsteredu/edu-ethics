export type VoteChoice = "green" | "yellow" | "red";

export type SessionStatus =
  | "lobby"
  | "briefing"
  | "voting"
  | "results"
  | "discussion"
  | "key"
  | "complete";

export interface ReasonTag {
  id: string;
  label: string;
}

export interface RoundPhase {
  id: string;
  label: string;
  situation: string;
  suggestedReasonTags: ReasonTag[];
}

export interface EthicsKey {
  id: string;
  name: string;
  unlockLine: string;
}

export interface EthicsRound {
  id: string;
  order: number;
  title: string;
  hook: string;
  voteQuestion: string;
  phases: RoundPhase[];
  discussionPrompt: string;
  ethicsKey: EthicsKey;
  teacherFacilitationNote: string;
  expectedMovement: string;
}

export interface VoteCounts {
  green: number;
  yellow: number;
  red: number;
}

export interface VoteSubmission {
  studentId: string;
  roundId: string;
  phaseId: string;
  choice: VoteChoice;
  reasonId?: string;
  submittedAt: number;
}

export interface TeacherSession {
  roomCode: string;
  status: SessionStatus;
  introIndex: number;
  roundIndex: number;
  phaseIndex: number;
  votingEndsAt: number | null;
  unlockedKeyIds: string[];
  updatedAt: number;
}

export interface PublicSessionSnapshot extends TeacherSession {
  connectedStudents: number;
  responseCount: number;
  counts: VoteCounts | null;
  previousCounts: VoteCounts | null;
  reasonCounts: Record<string, number> | null;
  transport: "supabase" | "classroom-demo";
}

export type RoomEvent =
  | {
      kind: "state-request";
      senderId: string;
      sentAt: number;
    }
  | {
      kind: "teacher-state";
      senderId: string;
      sentAt: number;
      snapshot: PublicSessionSnapshot;
    }
  | {
      kind: "vote-submit";
      senderId: string;
      sentAt: number;
      receiptId: string;
      vote: VoteSubmission;
    }
  | {
      kind: "vote-accepted";
      senderId: string;
      sentAt: number;
      studentId: string;
      receiptId: string;
    };

export interface PresenceMember {
  id: string;
  role: "teacher" | "student";
  nickname?: string;
  onlineAt: number;
  snapshot?: PublicSessionSnapshot;
}
