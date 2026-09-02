import type { PresenceMember, TrialRole, VoteChoice, VoteOption, VoteSubmission } from "../types";

function decisionFor(votes: VoteSubmission[]): VoteChoice | "split" | "waiting" {
  if (votes.length === 0) return "waiting";
  const counts: Record<VoteChoice, number> = { green: 0, yellow: 0, red: 0 };
  for (const vote of votes) counts[vote.choice] += 1;
  const highest = Math.max(counts.green, counts.yellow, counts.red);
  const leaders = (Object.keys(counts) as VoteChoice[]).filter((choice) => counts[choice] === highest);
  return leaders.length === 1 ? leaders[0] : "split";
}

function decisionLabel(
  decision: VoteChoice | "split" | "waiting",
  options: VoteOption[],
): string {
  if (decision === "waiting") return "심리 대기";
  if (decision === "split") return "의견 갈림";
  return options.find((option) => option.id === decision)?.shortLabel ?? "심리 대기";
}

export function TrialRoleBoard({
  roles,
  votes,
  members,
  options,
}: {
  roles: TrialRole[];
  votes: VoteSubmission[];
  members: PresenceMember[];
  options: VoteOption[];
}) {
  return (
    <section className="trial-role-board" aria-label="모둠별 법정 역할">
      <div className="trial-role-board__heading">
        <div>
          <span>COURT ROLES</span>
          <strong>역할별 심리석</strong>
        </div>
        <small>각자의 관점으로 같은 사건을 살펴봅니다.</small>
      </div>
      <div className="trial-role-grid">
        {roles.map((role) => {
          const roleVotes = votes.filter((vote) => vote.teamId === role.teamId);
          const online = members.filter((member) => member.role === "student" && member.teamId === role.teamId).length;
          const decision = decisionFor(roleVotes);
          return (
            <article className={`trial-role-tile trial-role-tile--${decision}`} key={role.teamId}>
              <span>{role.teamId}모둠 · {online}명</span>
              <strong>{role.name}</strong>
              <small>{role.lens} · {decisionLabel(decision, options)}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}
