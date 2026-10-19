import type { EthicsRound, LessonId, RoundPhase } from "../types";

export function DiscussionPanel({
  lessonId,
  round,
  phase,
}: {
  lessonId: LessonId;
  round: EthicsRound;
  phase: RoundPhase;
}) {
  return (
    <section className={`discussion-panel discussion-panel--lesson-${lessonId}`}>
      <div className="discussion-panel__case">
        <span>{round.trial?.docket ?? `CASE ${String(round.order).padStart(2, "0")}`} · {phase.label}</span>
        <strong>{round.title}</strong>
      </div>
      <div className={`discussion-card ${lessonId === 2 ? "discussion-card--battle" : ""} ${lessonId === 3 ? "discussion-card--trial" : ""}`}>
        <span>{lessonId === 3 ? "COURTROOM HEARING" : lessonId === 2 ? "30 SECOND TEAM BATTLE" : "ETHICS DEBATE"}</span>
        <h2>{round.discussionPrompt}</h2>
        {lessonId === 3 && round.trial ? (
          <>
            <div className="trial-tension">
              <strong>{round.trial.tension[0]}</strong>
              <i>VS</i>
              <strong>{round.trial.tension[1]}</strong>
            </div>
            <div className="trial-check-grid">
              {round.trial.checks.map((check) => (
                <article key={check.id}>
                  <b>{check.label}</b>
                  <span>{check.question}</span>
                </article>
              ))}
            </div>
            <p className="trial-verdict-prompt">판결문 확인 · {round.trial.verdictPrompt}</p>
          </>
        ) : lessonId === 2 && round.battle ? (
          <>
            <div className="battle-tension">
              <strong>{round.battle.tension[0]}</strong>
              <i>VS</i>
              <strong>{round.battle.tension[1]}</strong>
            </div>
            <div className="battle-stance-prompts">
              <span className="green"><b>GO</b>{round.battle.stancePrompts.green}</span>
              <span className="yellow"><b>WAIT</b>{round.battle.stancePrompts.yellow}</span>
              <span className="red"><b>STOP</b>{round.battle.stancePrompts.red}</span>
            </div>
          </>
        ) : (
          <p>서로 다른 판정을 고른 학생의 이유를 한 명씩 들어보세요.</p>
        )}
      </div>
    </section>
  );
}
