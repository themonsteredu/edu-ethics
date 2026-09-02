import { voteOptions } from "../data/lessons";
import { countTotal, percentage } from "../lib/session";
import type { ReasonTag, VoteCounts } from "../types";

interface VoteGraphProps {
  counts: VoteCounts | null;
  previousCounts?: VoteCounts | null;
  responseCount: number;
  connectedStudents: number;
  reasonCounts?: Record<string, number> | null;
  reasonTags?: ReasonTag[];
  title?: string;
}

export function VoteGraph({
  counts,
  previousCounts,
  responseCount,
  connectedStudents,
  reasonCounts,
  reasonTags = [],
  title = "우리 반의 선택",
}: VoteGraphProps) {
  if (!counts) {
    return (
      <section className="vote-graph vote-graph--locked" aria-live="polite">
        <div className="graph-kicker">LIVE RESPONSE</div>
        <div className="locked-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
          <b>{responseCount}</b>
        </div>
        <h2>친구들의 선택은 잠시 비공개</h2>
        <p>내 생각을 먼저 정한 뒤 결과를 확인합니다.</p>
        <div className="response-meter">
          <span
            style={{
              width: connectedStudents > 0
                ? `${Math.min(100, (responseCount / connectedStudents) * 100)}%`
                : "0%",
            }}
          />
        </div>
        <strong className="response-copy">
          {responseCount}명 응답
          {connectedStudents > 0 && ` · ${connectedStudents}명 접속`}
        </strong>
      </section>
    );
  }

  const total = countTotal(counts);
  const previousTotal = previousCounts ? countTotal(previousCounts) : 0;
  const topReasons = reasonTags
    .map((tag) => ({ ...tag, count: reasonCounts?.[tag.id] ?? 0 }))
    .filter((tag) => tag.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <section className="vote-graph vote-graph--revealed" aria-live="polite">
      <div className="graph-heading">
        <div>
          <span className="graph-kicker">CLASS DECISION</span>
          <h2>{title}</h2>
        </div>
        <span className="answer-count">{total}명</span>
      </div>

      <div className="bars">
        {voteOptions.map((option) => {
          const value = counts[option.id];
          const percent = percentage(value, total);
          const before = previousCounts
            ? percentage(previousCounts[option.id], previousTotal)
            : null;
          const delta = before === null ? null : percent - before;
          return (
            <div className={`bar-row bar-row--${option.id}`} key={option.id}>
              <div className="bar-label">
                <span className="signal-dot" aria-hidden="true" />
                <strong>{option.shortLabel}</strong>
                <span>{value}명</span>
              </div>
              <div className="bar-track">
                <span className="bar-fill" style={{ width: `${percent}%` }} />
              </div>
              <div className="bar-number">
                <strong>{percent}%</strong>
                {delta !== null && delta !== 0 && (
                  <small className={delta > 0 ? "delta-up" : "delta-down"}>
                    {delta > 0 ? "▲" : "▼"}{Math.abs(delta)}
                  </small>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {previousCounts && (
        <div className="movement-note">
          <span aria-hidden="true">↗</span>
          조건 공개 전과 비교한 판단 이동입니다.
        </div>
      )}

      {topReasons.length > 0 && (
        <div className="reason-ranking">
          <span className="graph-kicker">친구들이 주목한 이유</span>
          <div className="reason-ranking__list">
            {topReasons.map((reason, index) => (
              <span key={reason.id}>
                <b>{index + 1}</b>
                {reason.label}
                <strong>{reason.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
