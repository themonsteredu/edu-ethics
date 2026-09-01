import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Brand } from "../components/Brand";
import { Countdown } from "../components/Countdown";
import { SignalVote } from "../components/SignalVote";
import { introSlides, lesson1Rounds, voteOptions } from "../data/lesson1";
import { connectRoom, type RoomConnection, type TransportKind } from "../lib/realtime";
import { loadStudentProfile } from "../lib/storage";
import type { PresenceMember, PublicSessionSnapshot, RoomEvent, VoteChoice } from "../types";

export function StudentRoomPage() {
  const [searchParams] = useSearchParams();
  const profile = useMemo(loadStudentProfile, []);
  const requestedRoom = (searchParams.get("room") ?? profile?.roomCode ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  const [snapshot, setSnapshot] = useState<PublicSessionSnapshot | null>(null);
  const [connection, setConnection] = useState<RoomConnection | null>(null);
  const [transport, setTransport] = useState<TransportKind>("classroom-demo");
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const connectionRef = useRef<RoomConnection | null>(null);

  const round = snapshot ? lesson1Rounds[snapshot.roundIndex] : null;
  const phase = round && snapshot ? round.phases[snapshot.phaseIndex] : null;
  const phaseKey = round && phase ? `${round.id}:${phase.id}` : "waiting";

  useEffect(() => {
    setChoice(null);
    setReasonId(null);
    setSubmitted(false);
    setNotice("");
  }, [phaseKey]);

  useEffect(() => {
    if (!profile || !requestedRoom || profile.roomCode !== requestedRoom) return;
    let cancelled = false;
    let active: RoomConnection | null = null;
    const member: PresenceMember = {
      id: profile.studentId,
      role: "student",
      nickname: profile.nickname,
      onlineAt: Date.now(),
    };

    const onEvent = (event: RoomEvent) => {
      if (event.kind === "teacher-state" && event.snapshot.roomCode === requestedRoom) {
        setSnapshot(event.snapshot);
      }
    };

    void connectRoom({
      roomCode: requestedRoom,
      member,
      onEvent,
      onPresence: () => undefined,
    }).then((roomConnection) => {
      if (cancelled) {
        void roomConnection.disconnect();
        return;
      }
      active = roomConnection;
      connectionRef.current = roomConnection;
      setConnection(roomConnection);
      setTransport(roomConnection.kind);
      void roomConnection.send({
        kind: "state-request",
        senderId: profile.studentId,
        sentAt: Date.now(),
      });
    });

    const requestTimer = window.setInterval(() => {
      void connectionRef.current?.send({
        kind: "state-request",
        senderId: profile.studentId,
        sentAt: Date.now(),
      });
    }, 4_000);

    return () => {
      cancelled = true;
      window.clearInterval(requestTimer);
      if (connectionRef.current === active) connectionRef.current = null;
      if (active) void active.disconnect();
    };
  }, [profile, requestedRoom]);

  if (!profile || requestedRoom.length < 6 || profile.roomCode !== requestedRoom) {
    return <Navigate to="/join" replace />;
  }

  const submitVote = async () => {
    if (!connection || !round || !phase || !choice || !reasonId || snapshot?.status !== "voting") return;
    await connection.send({
      kind: "vote-submit",
      senderId: profile.studentId,
      sentAt: Date.now(),
      vote: {
        studentId: profile.studentId,
        roundId: round.id,
        phaseId: phase.id,
        choice,
        reasonId,
        submittedAt: Date.now(),
      },
    });
    setSubmitted(true);
    setNotice("판정이 전송되었습니다. 투표가 끝나기 전까지 바꿀 수 있어요.");
  };

  return (
    <main className={`student-page student-page--${snapshot?.status ?? "connecting"}`}>
      <header className="student-header">
        <Brand compact />
        <div className="student-header__meta">
          <span>{profile.nickname} 판정관</span>
          <strong>{requestedRoom}</strong>
          <i className={connection ? "is-online" : ""} title={transport === "supabase" ? "실시간 연결" : "교실 데모 연결"} />
        </div>
      </header>

      {!snapshot && (
        <section className="student-waiting">
          <div className="waiting-radar" aria-hidden="true"><i /><i /><span /></div>
          <span className="eyebrow">CONNECTING TO CLASS</span>
          <h1>교사 화면을 찾고 있어요.</h1>
          <p>수업코드 <strong>{requestedRoom}</strong>에 연결되면 사건이 자동으로 나타납니다.</p>
          <Link to="/join">수업코드 다시 입력</Link>
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

      {snapshot?.status === "briefing" && (
        <section className="student-briefing">
          <span className="eyebrow">{introSlides[snapshot.introIndex].eyebrow}</span>
          <strong className="mobile-slide-number">0{snapshot.introIndex + 1}</strong>
          <h1>{introSlides[snapshot.introIndex].title}</h1>
          <p>{introSlides[snapshot.introIndex].prompt}</p>
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
