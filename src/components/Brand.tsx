import { Link } from "react-router-dom";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand ${compact ? "brand--compact" : ""}`} to="/" aria-label="AI 윤리 판정소 홈">
      <span className="brand__signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="brand__copy">
        <strong>AI 윤리 판정소</strong>
        {!compact && <small>ETHICS JUDGEMENT LAB</small>}
      </span>
    </Link>
  );
}
