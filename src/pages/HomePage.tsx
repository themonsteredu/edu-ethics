import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";

const lessons = [
  {
    number: "01",
    tag: "선택",
    title: "AI 윤리 밸런스 게임쇼",
    description: "조건이 바뀔 때마다 신호등 판정을 내리고 우리 반 판단의 움직임을 확인합니다.",
    active: true,
  },
  {
    number: "02",
    tag: "대결",
    title: "AI 윤리 딜레마 배틀",
    description: "모둠별로 근거를 세우고 상대 팀의 판정을 바꾸는 설득 대결을 진행합니다.",
    active: false,
  },
  {
    number: "03",
    tag: "판결",
    title: "AI 윤리 재판소",
    description: "복합 사건을 판결하고 우리 반이 지킬 AI 사용 규칙을 직접 제정합니다.",
    active: false,
  },
];

export function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Brand />
        <nav aria-label="빠른 시작">
          <Link to="/join">학생 입장</Link>
          <Link className="header-teacher-link" to="/teacher">교사 설정</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">3-LESSON AI ETHICS EXPERIENCE</span>
          <h1>
            정답을 외우지 않고,
            <em>판단이 움직이는 순간</em>을 봅니다.
          </h1>
          <p>
            같은 AI 기술도 허락, 목적, 공개 여부와 책임에 따라 판단이 달라집니다.
            학생들이 고르고, 바꾸고, 서로의 이유를 발견하는 실시간 윤리 수업입니다.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/join">
              수업코드로 입장 <span>→</span>
            </Link>
            <Link className="button button--ghost" to="/teacher">
              1차시 수업 열기
            </Link>
          </div>
        </div>

        <div className="hero__visual" aria-label="실시간 신호등 판정 예시">
          <div className="visual-topline">
            <span>CLASS SIGNAL</span>
            <b>28 / 30</b>
          </div>
          <div className="visual-case">
            <span>CASE 03</span>
            <h2>AI로 만든 작품이 공모전에서 1등했다.</h2>
          </div>
          <div className="visual-bars">
            <div className="visual-bar visual-bar--green"><i style={{ width: "18%" }} /><b>18%</b></div>
            <div className="visual-bar visual-bar--yellow"><i style={{ width: "47%" }} /><b>47%</b></div>
            <div className="visual-bar visual-bar--red"><i style={{ width: "35%" }} /><b>35%</b></div>
          </div>
          <div className="visual-alert">
            <span>NEW CONDITION</span>
            금지 규정은 없었고, AI 사용 사실도 밝혔습니다.
          </div>
        </div>
      </section>

      <section className="lesson-series" aria-labelledby="series-title">
        <div className="section-heading">
          <span className="eyebrow">LESSON SERIES</span>
          <h2 id="series-title">선택에서 우리 반의 규칙까지</h2>
        </div>
        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <article className={`lesson-card ${lesson.active ? "lesson-card--active" : ""}`} key={lesson.number}>
              <div className="lesson-card__meta">
                <span>{lesson.number}</span>
                <b>{lesson.tag}</b>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <div className="lesson-card__status">
                {lesson.active ? "NOW OPEN · 45분" : "NEXT LESSON"}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <strong>AI ETHICS JUDGEMENT LAB</strong>
        <span>선택 → 대결 → 판결</span>
      </footer>
    </main>
  );
}
