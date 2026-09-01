import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Brand } from "../components/Brand";
import { Countdown } from "../components/Countdown";
import { SignalVote } from "../components/SignalVote";
import { introSlides, lesson1Rounds, voteOptions } from "../data/lesson1";
import { connectRoom, type RoomConnection, type TransportKind } from "../lib/realtime";
import { normalizeRoomCodeInput } from "../lib/session";
import { loadStudentProfile } from "../lib/storage";
import type { PresenceMember, PublicSessionSnapshot, RoomEvent, VoteChoice } from "../types";

export function StudentRoomPage() {
  const [searchParams] = useSearchParams();
  const profile = useMemo(loadStudentProfile, []);
  const requestedRoom = normalizeRoomCodeInput(searchParams.get("room") ?? profile?.roomCode ?? "");

  const [snapshot, setSnapshot] = useState<PublicSessionSnapshot | null>(null);
  const [connection, setConnection] = useState<RoomConnection | null>(null);
  const [transport, setTransport] = useState<TransportKind>("classroom-demo");
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const [connectionIssue, setConnectionIssue] = useState("");
  const [roomLookupTimedOut, setRoomLookupTimedOut] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const connectionRef = useRef<RoomConnection | null>(null);
  const snapshotRef = useRef<PublicSessionSnapshot | null>(null);
  const pendingReceiptRef = useRef<string | null>(null);
  const voteAckTimerRef = useRef<number | null>(null);

  const round = snapshot ? lesson1Rounds[snapshot.roundIndex] : null;
  const phase = round && snapshot ? round.phases[snapshot.phaseIndex] : null;
  const introSlide = snapshot ? introSlides[snapshot.introIndex] ?? introSlides[0] : null;
  const phaseKey = round && phase ? `${round.id}:${phase.id}` : "waiting";

  useEffect(() => {
    pendingReceiptRef.current = null;
    if (voteAckTimerRef.current !== null) window.clearTimeout(voteAckTimerRef.current);
    voteAckTimerRef.current = null;
    setChoice(null);
    setReasonId(null);
    setSubmitted(false);
    setNotice("");
  }, [phaseKey]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (!profile || !requestedRoom || profile.roomCode !== requestedRoom) return;
    let cancelled = false;
    let active: RoomConnection | null = null;
    let requestTimer: number | null = null;
    let lookupTimer: number | null = null;
    let retryTimer: number | null = null;
    let reconnectRequested = false;
    const member: PresenceMember = {
      id: profile.studentId,
      role: "student",
      nickname: profile.nickname,
      onlineAt: Date.now(),
    };

    setConnection(null);
    setConnectionIssue("");
    setRoomLookupTimedOut(false);

    const requestReconnect = (message: string) => {
      if (cancelled || reconnectRequested) return;
      reconnectRequested = true;
      setConnectionIssue(message);
      setRetryVersion((value) => value + 1);
    };

    const acceptSnapshot = (nextSnapshot: PublicSessionSnapshot) => {
      if (nextSnapshot.roomCode !== requestedRoom) return;
      const current = snapshotRef.current;
      if (current && nextSnapshot.updatedAt < current.updatedAt) return;
      snapshotRef.current = nextSnapshot;
      setSnapshot(nextSnapshot);
      setRoomLookupTimedOut(false);
      setConnectionIssue("");
    };

    const onEvent = (event: RoomEvent) => {
      if (event.kind === "teacher-state" && event.snapshot.roomCode === requestedRoom) {
        acceptSnapshot(event.snapshot);
      }
      if (
        event.kind === "vote-accepted" &&
        event.studentId === profile.studentId &&
        event.receiptId === pendingReceiptRef.current
      ) {
        pendingReceiptRef.current = null;
        if (voteAckTimerRef.current !== null) window.clearTimeout(voteAckTimerRef.current);
        voteAckTimerRef.current = null;
        setSubmitted(true);
        setNotice("교사가 판정을 확인했습니다. 투표가 끝나기 전까지 바꿀 수 있어요.");
      }
    };

    const requestState = async () => {
      const currentConnection = connectionRef.current;
      if (!currentConnection || snapshotRef.current) return;
      try {
        await currentConnection.send({
          kind: "state-request",
          senderId: profile.studentId,
          sentAt: Date.now(),
        });
        if (!cancelled) setConnectionIssue("");
      } catch {
        requestReconnect("교실 연결을 확인하고 있습니다.");
      }
    };

    void connectRoom({
      roomCode: requestedRoom,
      member,
      onEvent,
      onPresence: (members) => {
        const teacher = members.find((presence) => presence.role === "teacher" && presence.snapshot);
        if (teacher?.snapshot) acceptSnapshot(teacher.snapshot);
      },
      onDisconnect: () => requestReconnect("실시간 교실 연결이 끊겼습니다."),
    }).then((roomConnection) => {
      if (cancelled) {
        void roomConnection.disconnect();
        return;
      }
      active = roomConnection;
      connectionRef.current = roomConnection;
      setConnection(roomConnection);
      setTransport(roomConnection.kind);
      void requestState();
      requestTimer = window.setInterval(() => void requestState(), 2500);
      lookupTimer = window.setTimeout(() => {
        if (!snapshotRef.current && !cancelled) setRoomLookupTimedOut(true);
      }, 8000);
    }).catch(() => {
      if (cancelled) return;
      connectionRef.current = null;
      setConnection(null);
      setConnectionIssue("실시간 교실에 연결하지 못했습니다.");
      retryTimer = window.setTimeout(() => setRetryVersion((value) => value + 1), 2500);
    });

    return () => {
      cancelled = true;
      if (requestTimer !== null) window.clearInterval(requestTimer);
      if (lookupTimer !== null) window.clearTimeout(lookupTimer);
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      if (voteAckTimerRef.current !== null) window.clearTimeout(voteAckTimerRef.current);
      pendingReceiptRef.current = null;
      voteAckTimerRef.current = null;
      if (connectionRef.current === active) connectionRef.current = null;
      if (active) void active.disconnect();
    };
  }, [profile, requestedRoom, retryVersion]);

  if (!profile || requestedRoom.length !== 6 || profile.roomCode !== requestedRoom) {
    return <Navigate to="/join" replace />;
  }

  const submitVote = async () => {
    if (!connection || !round || !phase || !choice || !reasonId || snapshot?.status !== "voting") return;
    const receiptId = `vote-${crypto.randomUUID()}`;
    pendingReceiptRef.current = receiptId;
    if (voteAckTimerRef.current !== null) window.clearTimeout(voteAckTimerRef.current);
    setSubmitted(false);
    setNotice("판정을 전송하고 있어요.");
    try {
      await connection.send({
        kind: "vote-submit",
        senderId: profile.studentId,
        sentAt: Date.now(),
        receiptId,
        vote: {
          studentId: profile.studentId,
          roundId: round.id,
          phaseId: phase.id,
          choice,
          reasonId,
          submittedAt: Date.now(),
        },
      });
      if (pendingReceiptRef.current === receiptId) {
        setNotice("교사의 수신 확인을 기다리고 있어요.");
        voteAckTimerRef.current = window.setTimeout(() => {
          if (pendingReceiptRef.current !== receiptId) return;
          pendingReceiptRef.current = null;
          voteAckTimerRef.current = null;
          setSubmitted(false);
          setNotice("교사가 판정을 확인하지 못했습니다. 다시 눌러 주세요.");
        }, 5000);
      }
    } catch {
      pendingReceiptRef.current = null;
      if (voteAckTimerRef.current !== null) window.clearTimeout(voteAckTimerRef.current);
      voteAckTimerRef.current = null;
      setSubmitted(false);
      setNotice("판정을 보내지 못했습니다. 연결을 확인한 뒤 다시 눌러 주세요.");
      setRetryVersion((value) => value + 1);
    }
  };

  return (
    <main className={`student-page student-page--${snapshot?.status ?? "connecting"}`}>
      <header className="student-header">
        <Brand compact />
        <div className="student-header__meta">
          <span>{profile.nickname} 판정관</span>
          <strong>{requestedRoom}</strong>
          <i
            className={connection && !connectionIssue ? "is-online" : connectionIssue ? "is-error" : ""}
            title={connection
              ? connectionIssue || (transport === "supabase" ? "실시간 연결" : "같은 기기 데모 연결")
              : connectionIssue || "연결 중"}
          />
        </div>
      </header>

      {!snapshot && (
        <section className={`student-waiting ${connectionIssue ? "student-waiting--error" : ""}`}>
          {!connectionIssue && !roomLookupTimedOut && (
            <div className="waiting-radar" aria-hidden="true"><i /><i /><span /></div>
          )}
          <span className="eyebrow">
            {connectionIssue ? "CONNECTION RETRY" : roomLookupTimedOut ? "ROOM CHECK" : "CONNECTING TO CLASS"}
          </span>
          <h1>
            {connectionIssue
              ? "실시간 교실에 다시 연결하고 있어요."
              : roomLookupTimedOut ? "교사 화면을 찾지 못했어요." : "교사 화면을 찾고 있어요."}
          </h1>
          <p>
            {connectionIssue
              ? "잠시 후 자동으로 다시 연결합니다. 학교 Wi-Fi가 불안정하면 모바일 데이터도 확인해 주세요."
              : roomLookupTimedOut
                ? <>코드 <strong>{requestedRoom}</strong>가 맞는지, 교사 화면이 열려 있는지 확인해 주세요.</>
                : <>수업코드 <strong>{requestedRoom}</strong>에 연결되면 사건이 자동으로 나타납니다.</>}
          </p>
          {(connectionIssue || roomLookupTimedOut) && (
            <button
              className="button button--primary student-retry-button"
              type="button"
              onClick={() => setRetryVersion((value) => value + 1)}
            >
              지금 다시 연결
            </button>
          )}
          <Link to={`/join?room=${requestedRoom}`}>수업코드 다시 입력</Link>
        </section>
      )}

      {snapshot?.status === "lobby" && (
        <section className="student-lobby">
          <div className="student-pass">
            <span>AI ETHICS JUDGE</span>
            <strong>{profile.nickname}</strong>
            <small>ROOM {requestedRoom}</small>
          </div>
          <h1>판정관 등록 완료</h1>
          <p>교사가 수업을 시작할 때까지 전면 화면을 봐 주세요.</p>
          <div className="waiting-dots"><i /><i /><i /></div>
        </section>
      )}

      {snapshot?.status === "briefing" && introSlide && (
        <section className="student-briefing">
          <span className="eyebrow">{introSlide.eyebrow}</span>
          <strong className="mobile-slide-number">0{snapshot.introIndex + 1}</strong>
          <h1>{introSlide.title}</h1>
          <p>{introSlide.prompt}</p>
          <div className="student-instruction">전면 화면을 함께 봐 주세요.</div>
        </section>
      )}

      {snapshot && round && phase && snapshot.status === "voting" && (
        <>
          <section className="student-case">
            <div className="student-case__meta">
              <span>CASE {String(round.order).padStart(2, "0")}</span>
              <span>{phase.label}</span>
              <Countdown endsAt={snapshot.votingEndsAt} quiet />
            </div>
            <h1>{round.title}</h1>
            <p>{phase.situation}</p>
            <strong className="student-question">{round.voteQuestion}</strong>
          </section>
          <SignalVote
            selectedChoice={choice}
            selectedReason={reasonId}
            reasonTags={phase.suggestedReasonTags}
            submitted={submitted}
            onChoice={(nextChoice) => {
              pendingReceiptRef.current = null;
              if (voteAckTimerRef.current !== null) window.clearTimeout(voteAckTimerRef.current);
              voteAckTimerRef.current = null;
              setChoice(nextChoice);
              setReasonId(null);
              setSubmitted(false);
              setNotice("");
            }}
            onReason={(nextReason) => {
              setReasonId(nextReason);
              setSubmitted(false);
            }}
            onSubmit={submitVote}
          />
          {notice && <div className="student-notice" role="status">✓ {notice}</div>}
        </>
      )}

      {snapshot && round && phase && snapshot.status === "results" && (
        <section className="student-result">
          <span className="eyebrow">DECISION RECEIVED</span>
          <div className={`my-signal my-signal--${choice ?? "none"}`}>
            <i />
            <span>나의 판정</span>
            <strong>{voteOptions.find((option) => option.id === choice)?.label ?? "미응답"}</strong>
          </div>
          <h1>우리 반 결과는 전면 화면에서 확인하세요.</h1>
          {snapshot.phaseIndex < round.phases.length - 1 ? (
            <p>잠시 후 새로운 조건이 공개됩니다. 판단을 바꿔도 괜찮아요.</p>
          ) : (
            <p>다른 선택을 한 친구의 이유를 들어볼 준비를 하세요.</p>
          )}
        </section>
      )}

      {snapshot && round && snapshot.status === "discussion" && (
        <section className="student-discussion">
          <span className="eyebrow">ETHICS DEBATE</span>
          <h1>{round.discussionPrompt}</h1>
          <div className="debate-signals">
            <span className="green">괜찮다</span>
            <i>VS</i>
            <span className="red">안 된다</span>
          </div>
          <p>내 판정을 말할 때 사건 속 조건을 근거로 설명해 보세요.</p>
        </section>
      )}

      {snapshot && round && snapshot.status === "key" && (
        <section className="student-key">
          <div className="student-key__symbol" aria-hidden="true">◆</div>
          <span className="eyebrow">ETHICS KEY UNLOCKED</span>
          <h1>{round.ethicsKey.name}</h1>
          <p>{round.ethicsKey.unlockLine}</p>
          <div className="student-key__count">{snapshot.unlockedKeyIds.length} / {lesson1Rounds.length}</div>
        </section>
      )}

      {snapshot?.status === "complete" && (
        <section className="student-complete">
          <span className="eyebrow">MISSION COMPLETE</span>
          <h1>AI 윤리 판정관 1차시 완료</h1>
          <div className="student-complete__keys">
            {lesson1Rounds.map((item) => <span key={item.id}>{item.ethicsKey.name}</span>)}
          </div>
          <blockquote>AI를 사용할 때 내가 꼭 지킬 규칙 한 가지를 생각해 보세요.</blockquote>
          <Link to="/">처음 화면으로</Link>
        </section>
      )}
    </main>
  );
}
