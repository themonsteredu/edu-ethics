import type { EthicsRound, RoundPhase, SessionStatus } from "../types";

export function SituationPanel({
  round,
  phase,
  status,
}: {
  round: EthicsRound;
  phase: RoundPhase;
  status: SessionStatus;
}) {
  const isCondition = phase.id !== "initial";
  return (
    <section className={`situation-panel ${isCondition ? "situation-panel--condition" : ""}`}>
      <div className="case-meta">
        <span>CASE {String(round.order).padStart(2, "0")}</span>
        <span>{phase.label}</span>
      </div>
      <div className="case-copy">
        <span className="case-kicker">{isCondition ? "판정을 다시 검토하세요" : round.hook}</span>
        <h1>{round.title}</h1>
        <blockquote>{phase.situation}</blockquote>
        <div className="case-question">
          <span>YOUR DECISION</span>
          <strong>{round.voteQuestion}</strong>
        </div>
      </div>
      {status === "voting" && (
        <div className="case-status">
          <i /> 투표 진행 중
        </div>
      )}
    </section>
  );
}
