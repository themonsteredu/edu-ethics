import { useEffect, useState } from "react";
import { remainingSeconds } from "../lib/session";

export function useCountdown(endsAt: number | null): number | null {
  const [seconds, setSeconds] = useState(() => remainingSeconds(endsAt));

  useEffect(() => {
    setSeconds(remainingSeconds(endsAt));
    if (!endsAt) return;
    const timer = window.setInterval(() => setSeconds(remainingSeconds(endsAt)), 250);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  return seconds;
}

export function Countdown({ endsAt, quiet = false }: { endsAt: number | null; quiet?: boolean }) {
  const seconds = useCountdown(endsAt);
  if (seconds === null) return null;
  return (
    <span className={`countdown ${seconds <= 5 ? "countdown--urgent" : ""} ${quiet ? "countdown--quiet" : ""}`}>
      <span aria-hidden="true">◷</span>
      <strong>{String(seconds).padStart(2, "0")}</strong>
    </span>
  );
}
