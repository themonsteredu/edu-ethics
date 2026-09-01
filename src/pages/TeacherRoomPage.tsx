import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "../components/Brand";
import { Countdown } from "../components/Countdown";
import { SituationPanel } from "../components/SituationPanel";
import { VoteGraph } from "../components/VoteGraph";
import { introSlides, lesson1Rounds } from "../data/lesson1";
import { connectRoom, hasSupabaseConfig, type RoomConnection, type TransportKind } from "../lib/realtime";
import {
  buildPublicSnapshot,
  createClientId,
  createInitialSession,
  createRoomCode,
  voteKey,
} from "../lib/session";
import {
  clearTeacherRoom,
  loadTeacherSession,
  loadTeacherVotes,
  saveTeacherSession,
  saveTeacherVotes,
} from "../lib/storage";
import type { PresenceMember, PublicSessionSnapshot, RoomEvent, TeacherSession, VoteSubmission } from "../types";

const TEACHER_ID_KEY = "edu-ethics:teacher-id";

function getTeacherId(): string {
  const saved = sessionStorage.getItem(TEACHER_ID_KEY);
  if (saved) return saved;
  const id = createClientId("teacher");
  sessionStorage.setItem(TEACHER_ID_KEY, id);
  return id;
}

function sessionIsUsable(session: TeacherSession | null): session is TeacherSession {
  return Boolean(
    session &&
      session.roomCode &&
      session.roundIndex >= 0 &&
      session.roundIndex < lesson1Rounds.length,
  );
}

export function TeacherRoomPage() {
  const teacherId = useMemo(getTeacherId, []);
  const [session, setSession] = useState<TeacherSession>(() => {
    const saved = loadTeacherSession();
    return sessionIsUsable(saved) ? saved : createInitialSession(createRoomCode());
  });
  const [votes, setVotes] = useState<VoteSubmission[]>(loadTeacherVotes);
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [connection, setConnection] = useState<RoomConnection | null>(null);
  const [transport, setTransport] = useState<TransportKind>(
    hasSupabaseConfig() ? "supabase" : "classroom-demo",
  );
  const [connectionIssue, setConnectionIssue] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const connectionRef = useRef<RoomConnection | null>(null);
  const sessionRef = useRef(session);
  const snapshotRef = useRef<PublicSessionSnapshot | null>(null);

  const connectedStudents = useMemo(
    () => new Set(members.filter((member) => member.role === "student").map((member) => member.id)).size,
    [members],
  );

  const snapshot = useMemo(
    () => buildPublicSnapshot({ session, votes, connectedStudents, transport }),
    [session, votes, connectedStudents, transport],
  );

  const round = lesson1Rounds[session.roundIndex] ?? lesson1Rounds[0];
  const phase = round.phases[session.phaseIndex] ?? round.phases[0];
  const joinUrl = `${window.location.origin}/join?room=${session.roomCode}`;

  useEffect(() => {
    sessionRef.current = session;
    saveTeacherSession(session);
  }, [session]);

  useEffect(() => {
    saveTeacherVotes(votes);
  }, [votes]);

  const handleRoomEvent = useCallback((event: RoomEvent) => {
    if (event.kind === "state-request") {
      const current = snapshotRef.current;
      if (current) {
        void connectionRef.current?.send({
          kind: "teacher-state",
          senderId: teacherId,
          sentAt: Date.now(),
          snapshot: current,
        }).catch(() => {
          setConnectionIssue("학생 화면과 다시 연결하고 있습니다.");
          setRetryVersion((value) => value + 1);
        });
      }
      return;
    }

    if (event.kind !== "vote-submit") return;
    const currentSession = sessionRef.current;
    const currentRound = lesson1Rounds[currentSession.roundIndex];
    const currentPhase = currentRound?.phases[currentSession.phaseIndex];
    if (
      currentSession.status !== "voting" ||
      event.senderId !== event.vote.studentId ||
      event.vote.roundId !== currentRound?.id ||
      event.vote.phaseId !== currentPhase?.id ||
      !currentPhase.suggestedReasonTags.some((reason) => reason.id === event.vote.reasonId)
    ) {
      return;
    }

    setVotes((currentVotes) => {
      const key = voteKey(event.vote);
      const next = currentVotes.filter((vote) => voteKey(vote) !== key);
      next.push(event.vote);
      return next;
    });

    void connectionRef.current?.send({
      kind: "vote-accepted",
      senderId: teacherId,
      sentAt: Date.now(),
      studentId: event.vote.studentId,
      receiptId: event.receiptId,
    }).catch(() => {
      setConnectionIssue("학생 화면과 다시 연결하고 있습니다.");
      setRetryVersion((value) => value + 1);
    });
  }, [teacherId]);

  useEffect(() => {
    let cancelled = false;
    let active: RoomConnection | null = null;
    let retryTimer: number | null = null;
    const member: PresenceMember = {
      id: teacherId,
      role: "teacher",
      onlineAt: Date.now(),
    };

    setConnectionIssue("");

    void connectRoom({
      roomCode: session.roomCode,
      member,
      onEvent: handleRoomEvent,
      onPresence: setMembers,
      onDisconnect: () => {
        if (cancelled) return;
        setConnectionIssue("실시간 연결이 끊겨 다시 연결하고 있습니다.");
        setRetryVersion((value) => value + 1);
      },
    }).then((roomConnection) => {
      if (cancelled) {
        void roomConnection.disconnect();
        return;
      }
      active = roomConnection;
      connectionRef.current = roomConnection;
      setConnection(roomConnection);
      setTransport(roomConnection.kind);
      setConnectionIssue("");
    }).catch(() => {
      if (cancelled) return;
      connectionRef.current = null;
      setConnection(null);
      setMembers([]);
      setConnectionIssue("실시간 연결을 다시 시도하고 있습니다.");
      retryTimer = window.setTimeout(() => setRetryVersion((value) => value + 1), 2500);
    });

    return () => {
      cancelled = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      if (connectionRef.current === active) connectionRef.current = null;
      if (active) void active.disconnect();
      setConnection(null);
      setMembers([]);
    };
  }, [session.roomCode, teacherId, handleRoomEvent, retryVersion]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (!connection || connection.roomCode !== session.roomCode) return;
    const current = snapshotRef.current;
    if (!current) return;

    const teacherPresence: PresenceMember = {
      id: teacherId,
      role: "teacher",
      onlineAt: Date.now(),
      snapshot: current,
    };

    void Promise.all([
      connection.updatePresence(teacherPresence),
      connection.send({
        kind: "teacher-state",
        senderId: teacherId,
        sentAt: Date.now(),
        snapshot: current,
      }),
    ]).then(() => setConnectionIssue("")).catch(() => {
      setConnectionIssue("학생 화면과 다시 연결하고 있습니다.");
      setRetryVersion((value) => value + 1);
    });
  }, [connection, session.roomCode, session.updatedAt, teacherId, transport]);

  const updateSession = (patch: Partial<TeacherSession>) => {
    setSession((current) => ({ ...current, ...patch, updatedAt: Date.now() }));
  };

  const beginVote = (overrides: Partial<TeacherSession> = {}) => {
    updateSession({
      status: "voting",
      votingEndsAt: Date.now() + 30_000,
      ...overrides,
    });
  };

  const revealKey = () => {
    const keys = session.unlockedKeyIds.includes(round.ethicsKey.id)
      ? session.unlockedKeyIds
      : [...session.unlockedKeyIds, round.ethicsKey.id];
    updateSession({ status: "key", unlockedKeyIds: keys, votingEndsAt: null });
  };

  const nextRound = () => {
    if (session.roundIndex >= lesson1Rounds.length - 1) {
      updateSession({ status: "complete", votingEndsAt: null });
      return;
    }
    beginVote({
      roundIndex: session.roundIndex + 1,
      phaseIndex: 0,
    });
  };

  const newRoom = () => {
    if (!window.confirm("현재 수업 결과를 닫고 새 수업코드를 만들까요?")) return;
    clearTeacherRoom();
    setVotes([]);
    setSession(createInitialSession(createRoomCode()));
  };

  const copyJoinInfo = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const renderControl = () => {
    if (session.status === "lobby") {
      return (
        <button className="teacher-action teacher-action--primary" onClick={() => updateSession({ status: "briefing", introIndex: 0 })}>
          오프닝 시작 <span>→</span>
        </button>
      );
    }
    if (session.status === "briefing") {
      const isLast = session.introIndex === introSlides.length - 1;
      return (
        <button
          className="teacher-action teacher-action--primary"
          onClick={() => isLast ? beginVote({ roundIndex: 0, phaseIndex: 0 }) : updateSession({ introIndex: session.introIndex + 1 })}
        >
          {isLast ? "첫 사건 공개" : "다음 브리핑"} <span>→</span>
        </button>
      );
    }
    if (session.status === "voting") {
      return (
        <>
          <button className="teacher-action teacher-action--secondary" onClick={() => updateSession({ votingEndsAt: (session.votingEndsAt ?? Date.now()) + 10_000 })}>
            +10초
          </button>
          <button className="teacher-action teacher-action--primary" onClick={() => updateSession({ status: "results", votingEndsAt: null })}>
            투표 마감 · 결과 공개 <span>→</span>
          </button>
        </>
      );
    }
    if (session.status === "results") {
      if (session.phaseIndex < round.phases.length - 1) {
        return (
          <button className="teacher-action teacher-action--alert" onClick={() => beginVote({ phaseIndex: session.phaseIndex + 1 })}>
            새 조건 공개 <span>!</span>
          </button>
        );
      }
      return (
        <button className="teacher-action teacher-action--primary" onClick={() => updateSession({ status: "discussion" })}>
          토론 질문 열기 <span>→</span>
        </button>
      );
    }
    if (session.status === "discussion") {
      return (
        <button className="teacher-action teacher-action--key" onClick={revealKey}>
          윤리 열쇠 해제 <span>◆</span>
        </button>
      );
    }
    if (session.status === "key") {
      return (
        <button className="teacher-action teacher-action--primary" onClick={nextRound}>
          {session.roundIndex === lesson1Rounds.length - 1 ? "최종 결과 보기" : "다음 사건으로"} <span>→</span>
        </button>
      );
    }
    return (
      <button className="teacher-action teacher-action--primary" onClick={newRoom}>
        새 수업 시작 <span>↻</span>
      </button>
    );
  };

  return (
    <main className={`teacher-page teacher-page--${session.status}`}>
      <header className="teacher-header">
        <Brand compact />
        <div className="teacher-room-meta">
          <button className="room-code-badge" onClick={copyJoinInfo} title="입장 주소와 코드 복사">
            <span>ROOM</span>
            <strong>{session.roomCode}</strong>
            <small>{copied ? "복사됨" : "복사"}</small>
          </button>
          <div className={`connection-badge ${connectionIssue ? "is-error" : ""}`} title={connectionIssue || undefined}>
            <i className={connection && !connectionIssue ? "is-online" : ""} />
            {connectionIssue
              ? "연결 재시도 중"
              : connection
              ? transport === "supabase" ? "실시간 연결" : "같은 기기 데모"
              : "연결 중"}
          </div>
          <div className="student-count"><span>접속</span><strong>{connectedStudents}</strong>명</div>
          <Countdown endsAt={session.votingEndsAt} />
        </div>
      </header>

      {session.status === "lobby" && (
        <section className="teacher-lobby">
          <div className="lobby-copy">
            <span className="eyebrow">LESSON 01 · LIVE CLASS</span>
            <h1>AI 윤리 밸런스 게임쇼</h1>
            <p>학생들이 입장하면 오프닝을 시작하세요. 결과는 모든 학생이 먼저 판정할 때까지 공개되지 않습니다.</p>
          </div>
          <div className="lobby-code-panel">
            <span>학생 입장</span>
            <strong>{joinUrl.replace(/^https?:\/\//, "")}</strong>
            <div className="lobby-room-code">{session.roomCode}</div>
            <p>링크를 복사해 보내거나 수업코드 6자리를 입력합니다.</p>
            <div className="lobby-live-count"><i /> 현재 {connectedStudents}명 입장</div>
          </div>
        </section>
      )}

      {session.status === "briefing" && (
        <section className="briefing-screen">
          <div className="briefing-progress">
            {introSlides.map((_, index) => <i className={index <= session.introIndex ? "is-active" : ""} key={index} />)}
          </div>
          <div className="briefing-number">0{session.introIndex + 1}</div>
          <div className="briefing-copy">
            <span className="eyebrow">{introSlides[session.introIndex].eyebrow}</span>
            <h1>{introSlides[session.introIndex].title}</h1>
            <p>{introSlides[session.introIndex].body}</p>
            <blockquote>{introSlides[session.introIndex].prompt}</blockquote>
          </div>
        </section>
      )}

      {!["lobby", "briefing", "key", "complete"].includes(session.status) && (
        <section className={`teacher-stage teacher-stage--${session.status}`}>
          <VoteGraph
            counts={snapshot.counts}
            previousCounts={snapshot.previousCounts}
            responseCount={snapshot.responseCount}
            connectedStudents={connectedStudents}
            reasonCounts={snapshot.reasonCounts}
            reasonTags={phase.suggestedReasonTags}
          />
          <div className="teacher-case-area">
            <SituationPanel round={round} phase={phase} status={session.status} />
            {session.status === "discussion" && (
              <div className="discussion-card">
                <span>ETHICS DEBATE</span>
                <h2>{round.discussionPrompt}</h2>
                <p>서로 다른 판정을 고른 학생의 이유를 한 명씩 들어보세요.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {session.status === "key" && (
        <section className="key-reveal-screen">
          <div className="key-reveal-screen__index">KEY {String(session.roundIndex + 1).padStart(2, "0")}</div>
          <div className="ethics-key-symbol" aria-hidden="true"><span>◆</span></div>
          <span className="eyebrow">오늘의 윤리 열쇠 획득</span>
          <h1>{round.ethicsKey.name}</h1>
          <p>{round.ethicsKey.unlockLine}</p>
          <div className="key-progress">
            {lesson1Rounds.map((item) => (
              <span className={session.unlockedKeyIds.includes(item.ethicsKey.id) ? "is-unlocked" : ""} key={item.id}>
                {item.ethicsKey.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {session.status === "complete" && (
        <section className="complete-screen">
          <span className="eyebrow">LESSON 01 COMPLETE</span>
          <h1>우리 반은 다섯 가지 판단 기준을 발견했습니다.</h1>
          <div className="complete-keys">
            {lesson1Rounds.map((item, index) => (
              <article key={item.id}>
                <span>0{index + 1}</span>
                <strong>{item.ethicsKey.name}</strong>
                <p>{item.ethicsKey.unlockLine}</p>
              </article>
            ))}
          </div>
          <blockquote>AI를 사용할 때 우리 반이 꼭 지켜야 할 규칙 한 가지는 무엇인가요?</blockquote>
        </section>
      )}

      <footer className="teacher-controls">
        <div className="round-progress" aria-label="사건 진행도">
          {lesson1Rounds.map((item, index) => (
            <span className={index < session.roundIndex ? "is-done" : index === session.roundIndex ? "is-current" : ""} key={item.id}>
              {index + 1}
            </span>
          ))}
        </div>
        <button className="teacher-note-toggle" onClick={() => setShowNotes((value) => !value)}>
          {showNotes ? "진행 메모 닫기" : "진행 메모"}
        </button>
        <div className="teacher-control-actions">{renderControl()}</div>
        <button className="teacher-new-room" onClick={newRoom}>새 수업</button>
      </footer>

      {showNotes && (
        <aside className="teacher-note-panel">
          <span className="eyebrow">TEACHER NOTE</span>
          <h3>{round.title}</h3>
          <p>{round.teacherFacilitationNote}</p>
          <dl>
            <div><dt>예상 이동</dt><dd>{round.expectedMovement}</dd></div>
            <div><dt>운영 원칙</dt><dd>판단 변경은 감점이 아니라 좋은 근거를 발견한 증거입니다.</dd></div>
          </dl>
          <button onClick={() => setShowNotes(false)}>확인</button>
        </aside>
      )}
    </main>
  );
}
