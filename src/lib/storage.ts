import type { TeacherSession, VoteSubmission } from "../types";

const TEACHER_SESSION_KEY = "edu-ethics:teacher-session:v1";
const TEACHER_VOTES_KEY = "edu-ethics:teacher-votes:v1";
const STUDENT_PROFILE_KEY = "edu-ethics:student-profile:v1";

function readJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function loadTeacherSession(): TeacherSession | null {
  return readJson<TeacherSession>(TEACHER_SESSION_KEY);
}

export function saveTeacherSession(session: TeacherSession): void {
  localStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(session));
}

export function loadTeacherVotes(): VoteSubmission[] {
  return readJson<VoteSubmission[]>(TEACHER_VOTES_KEY) ?? [];
}

export function saveTeacherVotes(votes: VoteSubmission[]): void {
  localStorage.setItem(TEACHER_VOTES_KEY, JSON.stringify(votes));
}

export function clearTeacherRoom(): void {
  localStorage.removeItem(TEACHER_SESSION_KEY);
  localStorage.removeItem(TEACHER_VOTES_KEY);
}

export interface StudentProfile {
  roomCode: string;
  nickname: string;
  studentId: string;
}

export function loadStudentProfile(): StudentProfile | null {
  return readJson<StudentProfile>(STUDENT_PROFILE_KEY);
}

export function saveStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
}
