import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Brand } from "../components/Brand";
import { TeacherRoomPage } from "./TeacherRoomPage";

const UNLOCK_KEY = "edu-ethics:teacher-unlocked";

export function TeacherGate() {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lesson") === "2" ? 2 : 1;
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === "yes");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (unlocked) return <TeacherRoomPage key={lessonId} lessonId={lessonId} />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const expectedPin = import.meta.env.VITE_TEACHER_PIN || "3035";
    if (pin === expectedPin) {
      sessionStorage.setItem(UNLOCK_KEY, "yes");
      setUnlocked(true);
      return;
    }
    setError("비밀번호가 맞지 않습니다.");
    setPin("");
  };

  return (
    <main className="entry-page entry-page--teacher">
      <div className="entry-shell entry-shell--narrow">
        <Brand />
        <section className="entry-card teacher-pin-card">
          <span className="eyebrow">TEACHER CONTROL</span>
          <h1>교사 설정</h1>
          <p>{lessonId}차시 수업 생성, 사건 공개와 실시간 결과 관리는 교사 화면에서 진행합니다.</p>
          <form onSubmit={submit}>
            <label>
              <span>교사용 비밀번호</span>
              <input
                className="pin-input"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                autoFocus
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary button--wide" type="submit">교사 화면 열기</button>
          </form>
        </section>
        <Link className="back-link" to="/">← 처음 화면으로</Link>
      </div>
    </main>
  );
}
