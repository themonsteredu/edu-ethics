import { voteOptions } from "../data/lesson1";
import type { ReasonTag, VoteChoice } from "../types";

interface SignalVoteProps {
  selectedChoice: VoteChoice | null;
  selectedReason: string | null;
  reasonTags: ReasonTag[];
  submitted: boolean;
  onChoice: (choice: VoteChoice) => void;
  onReason: (reasonId: string) => void;
  onSubmit: () => void;
}

export function SignalVote({
  selectedChoice,
  selectedReason,
  reasonTags,
  submitted,
  onChoice,
  onReason,
  onSubmit,
}: SignalVoteProps) {
  return (
    <div className="signal-vote">
      <div className="signal-buttons" aria-label="판정 선택">
        {voteOptions.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`signal-button signal-button--${option.id} ${selectedChoice === option.id ? "is-selected" : ""}`}
            onClick={() => onChoice(option.id)}
            aria-pressed={selectedChoice === option.id}
          >
            <span className="signal-button__light" aria-hidden="true" />
            <span>
              <small>{option.signal}</small>
              <strong>{option.label}</strong>
            </span>
          </button>
        ))}
      </div>

      {selectedChoice && (
        <div className="reason-picker">
          <div className="reason-picker__heading">
            <strong>왜 그렇게 생각했나요?</strong>
            <span>한 가지를 골라 주세요.</span>
          </div>
          <div className="reason-chips">
            {reasonTags.map((reason) => (
              <button
                type="button"
                key={reason.id}
                className={selectedReason === reason.id ? "is-selected" : ""}
                onClick={() => onReason(reason.id)}
              >
                {reason.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="submit-judgement"
            onClick={onSubmit}
            disabled={!selectedReason}
          >
            {submitted ? "판정 다시 보내기" : "판정 확정"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
