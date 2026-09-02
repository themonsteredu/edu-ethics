import type { LessonId, TeacherSession, VoteSubmission } from "../types";

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

function lessonStorageKey(base: string, lessonId: LessonId): string {
  return lessonId === 1 ? base : `${base}:lesson-${lessonId}`;
}

export function loadTeacherSession(lessonId: LessonId = 1): TeacherSession | null {
  return readJson<TeacherSession>(lessonStorageKey(TEACHER_SESSION_KEY, lessonId));
}

export function saveTeacherSession(session: TeacherSession, lessonId: LessonId = 1): void {
  localStorage.setItem(lessonStorageKey(TEACHER_SESSION_KEY, lessonId), JSON.stringify(session));
}

export function loadTeacherVotes(lessonId: LessonId = 1): VoteSubmission[] {
  return readJson<VoteSubmission[]>(lessonStorageKey(TEACHER_VOTES_KEY, lessonId)) ?? [];
}

export function saveTeacherVotes(votes: VoteSubmission[], lessonId: LessonId = 1): void {
  localStorage.setItem(lessonStorageKey(TEACHER_VOTES_KEY, lessonId), JSON.stringify(votes));
}

export function clearTeacherRoom(lessonId: LessonId = 1): void {
  localStorage.removeItem(lessonStorageKey(TEACHER_SESSION_KEY, lessonId));
  localStorage.removeItem(lessonStorageKey(TEACHER_VOTES_KEY, lessonId));
}

export interface StudentProfile {
  roomCode: string;
  nickname: string;
  studentId: string;
  teamId: number;
}

export function loadStudentProfile(): StudentProfile | null {
  return readJson<StudentProfile>(STUDENT_PROFILE_KEY);
}

export function saveStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
}
