import { countTotal, emptyCounts, percentage } from "../lib/session";
import type { ReasonTag, VoteCounts, VoteOption } from "../types";

interface VoteGraphProps {
  counts: VoteCounts | null;
  previousCounts?: VoteCounts | null;
  responseCount: number;
  connectedStudents: number;
  reasonChoiceCounts?: Record<string, VoteCounts> | null;
  reasonTags?: ReasonTag[];
  options: VoteOption[];
  title?: string;
}

export function VoteGraph({
  counts,
  previousCounts,
  responseCount,
  connectedStudents,
  reasonChoiceCounts,
  reasonTags = [],
  options,
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
        {reasonTags.length > 0 && (
          <div className="reason-preview">
            <span className="graph-kicker">학생 화면의 이유 선택지</span>
            <ul>
              {reasonTags.map((reason) => <li key={reason.id}>{reason.label}</li>)}
            </ul>
            <small>투표를 마감하면 이유별로 몇 명이 골랐는지 공개됩니다.</small>
          </div>
        )}
      </section>
    );
  }

  const total = countTotal(counts);
  const previousTotal = previousCounts ? countTotal(previousCounts) : 0;
  const reasons = reasonTags
    .map((tag) => {
      const choiceCounts = reasonChoiceCounts?.[tag.id] ?? emptyCounts();
      return { ...tag, choiceCounts, count: countTotal(choiceCounts) };
    })
    .sort((a, b) => b.count - a.count);

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
        {options.map((option) => {
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

      {reasons.length > 0 && (
        <div className="reason-breakdown">
          <div className="reason-breakdown__heading">
            <span className="graph-kicker">친구들이 고른 이유</span>
            <div className="reason-legend" aria-hidden="true">
              {options.map((option) => (
                <span className={`reason-legend--${option.id}`} key={option.id}>{option.shortLabel}</span>
              ))}
            </div>
          </div>
          <ol className="reason-breakdown__list">
            {reasons.map((reason, index) => (
              <li className={reason.count === 0 ? "is-empty" : ""} key={reason.id}>
                <b>{index + 1}</b>
                <span className="reason-breakdown__label">{reason.label}</span>
                <strong className="reason-breakdown__count">{reason.count}명</strong>
                <div
                  className="reason-breakdown__track"
                  role="img"
                  aria-label={options.map((option) => `${option.shortLabel} ${reason.choiceCounts[option.id]}명`).join(", ")}
                >
                  {reason.count > 0 && (
                    <div className="reason-breakdown__bar" style={{ width: `${(reason.count / Math.max(total, 1)) * 100}%` }}>
                      {options.filter((option) => reason.choiceCounts[option.id] > 0).map((option) => (
                        <span
                          className={`reason-segment reason-segment--${option.id}`}
                          style={{ flexGrow: reason.choiceCounts[option.id] }}
                          key={option.id}
                        >
                          {reason.choiceCounts[option.id]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
