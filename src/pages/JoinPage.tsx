import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { createClientId } from "../lib/session";
import { loadStudentProfile, saveStudentProfile } from "../lib/storage";

export function JoinPage() {
  const navigate = useNavigate();
  const saved = loadStudentProfile();
  const [roomCode, setRoomCode] = useState(saved?.roomCode ?? "");
  const [nickname, setNickname] = useState(saved?.nickname ?? "");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    const cleanNickname = nickname.trim().slice(0, 10);

    if (normalizedCode.length < 6) {
      setError("교사 화면의 6자리 수업코드를 확인해 주세요.");
      return;
    }
    if (cleanNickname.length < 2) {
      setError("친구들이 알아볼 수 있는 이름을 두 글자 이상 적어 주세요.");
      return;
    }

    const profile = {
      roomCode: normalizedCode,
      nickname: cleanNickname,
      studentId: saved?.studentId ?? createClientId("student"),
    };
    saveStudentProfile(profile);
    navigate(`/play?room=${normalizedCode}`);
  };

  return (
    <main className="entry-page">
      <div className="entry-shell">
        <Brand />
        <section className="entry-card">
          <span className="eyebrow">STUDENT CHECK-IN</span>
          <h1>AI 윤리 판정관 입장</h1>
          <p>교사 화면에 표시된 수업코드와 수업에서 사용할 이름을 입력하세요.</p>

          <form onSubmit={submit}>
            <label>
              <span>수업코드</span>
              <input
                className="room-code-input"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                inputMode="text"
                autoComplete="off"
                maxLength={8}
                placeholder="A2B4C6"
                autoFocus
              />
            </label>
            <label>
              <span>이름 또는 별명</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoComplete="off"
                maxLength={10}
                placeholder="예: 민지"
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary button--wide" type="submit">
              판정소 입장 <span>→</span>
            </button>
          </form>
          <small className="privacy-note">입력한 이름은 현재 수업의 접속 확인에만 사용됩니다.</small>
        </section>
        <Link className="back-link" to="/">← 처음 화면으로</Link>
      </div>
    </main>
  );
}
