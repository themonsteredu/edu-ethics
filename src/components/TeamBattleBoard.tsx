import { voteOptions } from "../data/lessons";
import type { PresenceMember, VoteChoice, VoteSubmission } from "../types";

type TeamDecision = VoteChoice | "split" | "waiting";

function decideTeam(votes: VoteSubmission[]): TeamDecision {
  if (votes.length === 0) return "waiting";
  const counts: Record<VoteChoice, number> = { green: 0, yellow: 0, red: 0 };
  for (const vote of votes) counts[vote.choice] += 1;
  const highest = Math.max(counts.green, counts.yellow, counts.red);
  const leaders = voteOptions.filter((option) => counts[option.id] === highest);
  return leaders.length === 1 ? leaders[0].id : "split";
}

function decisionLabel(decision: TeamDecision): string {
  if (decision === "waiting") return "응답 대기";
  if (decision === "split") return "의견 갈림";
  return voteOptions.find((option) => option.id === decision)?.shortLabel ?? "응답 대기";
}

export function TeamBattleBoard({
  currentVotes,
  previousVotes,
  members,
}: {
  currentVotes: VoteSubmission[];
  previousVotes: VoteSubmission[];
  members: PresenceMember[];
}) {
  return (
    <section className="team-battle-board" aria-label="모둠별 판정">
      <div className="team-battle-board__heading">
        <div>
          <span>TEAM SIGNAL</span>
          <strong>모둠별 판정</strong>
        </div>
        <small>모둠 안에서도 의견이 다를 수 있어요.</small>
      </div>
      <div className="team-battle-grid">
        {[1, 2, 3, 4, 5, 6].map((teamId) => {
          const teamVotes = currentVotes.filter((vote) => vote.teamId === teamId);
          const previousTeamVotes = previousVotes.filter((vote) => vote.teamId === teamId);
          const decision = decideTeam(teamVotes);
          const previousDecision = decideTeam(previousTeamVotes);
          const changed = previousVotes.length > 0 && previousDecision !== "waiting" && decision !== previousDecision;
          const online = members.filter((member) => member.role === "student" && member.teamId === teamId).length;
          return (
            <article className={`team-tile team-tile--${decision} ${changed ? "has-changed" : ""}`} key={teamId}>
              <span>{teamId}모둠 · {online}명</span>
              <strong>{decisionLabel(decision)}</strong>
              {changed ? <small>판정 이동 ↗</small> : <small>{teamVotes.length}명 응답</small>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
