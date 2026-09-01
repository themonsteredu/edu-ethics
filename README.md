# AI 윤리 판정소

학교 교실에서 사용하는 3차시 AI 윤리 수업 웹앱입니다. 현재 **1차시 AI 윤리 밸런스 게임쇼**가 구현되어 있습니다.

## 3차시 흐름

| 차시 | 활동 | 학습 흐름 |
|---|---|---|
| 1차시 | AI 윤리 밸런스 게임쇼 | 선택하고 판단의 변화를 확인합니다. |
| 2차시 | AI 윤리 딜레마 배틀 | 근거를 세우고 상대 모둠을 설득합니다. |
| 3차시 | AI 윤리 재판소 | 복합 사건을 판결하고 학급 규칙을 만듭니다. |

## 1차시 구현 범위

- 교사용 진행 화면과 학생용 모바일 투표 화면
- 6자리 수업코드 입장
- 교사 설정 비밀번호 기본값 `3035`
- 투표 중 결과 비공개, 마감 후 실시간 신호등 막대그래프 공개
- 새 조건 공개 후 재투표 및 이전 결과 대비 증감 표시
- 선택 이유 상위 3개 실시간 집계
- 동의·정직·공정·개인정보·책임 윤리 열쇠 5개
- Supabase Realtime Broadcast/Presence
- Supabase 연결 실패 시 같은 브라우저의 여러 창으로 확인 가능한 교실 데모 모드
- S-Core Dream 한글 폰트와 노트북·태블릿·모바일 반응형 UI

투표 내용과 학생 이름은 데이터베이스 테이블에 저장하지 않습니다. Realtime 채널과 교사 브라우저 메모리에서 수업 중에만 집계하며, 교사 화면 새로고침 복구를 위해 해당 브라우저의 `localStorage`에 현재 수업 상태를 보관합니다.

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

### 환경 변수

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_TEACHER_PIN=3035
```

브라우저에는 반드시 Supabase **Publishable key**만 사용합니다. Secret key나 `service_role` 키를 넣으면 안 됩니다.

## 주요 경로

| 경로 | 용도 |
|---|---|
| `/` | 3차시 수업 홈 |
| `/join` | 학생 수업코드 입장 |
| `/play?room=ABC234` | 학생 투표 화면 |
| `/teacher` | 교사 진행 화면 |

## 검증

```bash
npm test
npm run build
npm run test:realtime
```

`test:realtime`은 `.env.local`이 설정된 환경에서 두 Realtime 클라이언트의 채널 연결과 투표 Broadcast 수신을 확인합니다.
