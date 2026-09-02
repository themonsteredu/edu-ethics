import type { EthicsRound } from "../types";

export const lesson3IntroSlides = [
  {
    eyebrow: "COURT MISSION 01 · 배심원 등록",
    title: "오늘은 모두가 AI 윤리 배심원입니다.",
    body: "어려운 역할을 나누지 않습니다. 모든 학생이 같은 사건을 읽고 자기 생각으로 판결합니다.",
    prompt: "누가 잘못했는지보다 무엇을 고쳐야 할지 찾아보세요.",
  },
  {
    eyebrow: "COURT MISSION 02 · 근거 심리",
    title: "느낌이 아니라 사건 기록으로 말합니다.",
    body: "처음 기록만 보고 1차 판결을 내린 뒤, 피해·약속·책임 세 질문으로 사건을 다시 살펴봅니다.",
    prompt: "피해가 있나? 약속을 지켰나? 누가 고쳐야 하나?",
  },
  {
    eyebrow: "COURT MISSION 03 · 최종 판결",
    title: "새 증거가 나오면 판결을 고칠 수 있습니다.",
    body: "증거와 증언이 공개되면 다시 투표합니다. 마지막에는 사건별 판결 원칙을 모아 우리 반 AI 사용 규칙을 완성합니다.",
    prompt: "허용 · 조건부 허용 · 사용 중단, 최종 판결을 준비하세요.",
  },
] as const;

export const lesson3Rounds: EthicsRound[] = [
  {
    id: "court-principal-deepfake",
    order: 1,
    title: "교장 선생님이 래퍼가 됐다?",
    hook: "AI 합성이라고 밝혔어도 허락 없이 얼굴과 목소리를 써도 될까?",
    voteQuestion: "이 AI 영상을 계속 공개해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "사건 기록",
        situation: "축제 홍보 모둠이 교장 선생님의 얼굴과 목소리를 AI로 합성해 랩 영상을 만들었습니다. 영상에는 ‘AI 합성’이라고 표시했고 학생들은 재미있어했지만, 교장 선생님에게는 먼저 묻지 않았습니다.",
        suggestedReasonTags: [
          { id: "festival-purpose", label: "학교 축제를 위한 영상이에요" },
          { id: "ai-label", label: "AI 합성이라고 밝혔어요" },
          { id: "no-consent", label: "먼저 허락받지 않았어요" },
          { id: "likeness-right", label: "얼굴과 목소리는 그 사람 것이에요" },
        ],
      },
      {
        id: "evidence",
        label: "증거·증언 공개",
        situation: "교장 선생님은 앞서 ‘축제 무대에서만 보여 주는 재미있는 AI 영상’ 제작을 허락했습니다. 하지만 모둠은 SNS 공개까지 허락받지는 않았고, 다른 사람이 영상을 복사해 퍼뜨렸습니다. 모둠은 공개를 멈추고 삭제 요청을 보내겠다고 했습니다.",
        suggestedReasonTags: [
          { id: "limited-consent", label: "허락한 범위가 달랐어요" },
          { id: "public-sharing", label: "SNS 공개는 별도 허락이 필요해요" },
          { id: "repair-action", label: "확산을 멈추려 노력했어요" },
          { id: "ongoing-harm", label: "이미 퍼져 피해가 남을 수 있어요" },
        ],
      },
    ],
    discussionPrompt: "허락받은 ‘제작’과 허락받지 않은 ‘공개’를 어떻게 나누어 판결할까요?",
    ethicsKey: {
      id: "court-consent-scope",
      name: "동의의 범위",
      unlockLine: "얼굴·목소리를 쓸 때는 제작 목적, 공개 장소, 사용 기간을 따로 확인하고 약속한 범위를 지켜요.",
    },
    teacherFacilitationNote: "학생 개인이나 실제 교직원을 흉내 내지 말고, 제작 허락과 공개 허락이 서로 다름을 중심으로 심리하세요.",
    expectedMovement: "AI 표시를 근거로 분산 → 공개 범위 증거 후 조건부·중단 증가",
    trial: {
      docket: "사건 2026-01 · AI 합성 영상",
      charge: "허락 범위를 넘긴 얼굴·목소리 사용",
      tension: ["축제를 재미있게 표현할 자유", "내 얼굴과 목소리를 정할 권리"],
      checks: [
        { id: "harm", label: "① 피해", question: "영상 때문에 불편하거나 피해를 보는 사람은 누구인가요?" },
        { id: "promise", label: "② 약속", question: "만들기·무대 공개·SNS 공개는 모두 같은 허락일까요?" },
        { id: "responsibility", label: "③ 책임", question: "이미 퍼진 영상을 줄이기 위해 누가 무엇을 해야 할까요?" },
      ],
      verdictPrompt: "AI 표시만으로 부족한 이유와 필요한 허락의 범위를 판결문에 넣으세요.",
      classRule: "다른 사람의 얼굴·목소리는 목적과 공개 범위를 먼저 허락받는다.",
    },
  },
  {
    id: "court-counselor-alert",
    order: 2,
    title: "비밀을 깬 AI 상담 선생님",
    hook: "학생의 안전을 위해서라면 약속한 비밀을 알려도 될까?",
    voteQuestion: "이 AI 상담 서비스를 학교에서 사용해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "사건 기록",
        situation: "학교 AI 상담 서비스는 ‘대화는 비밀’이라고 안내했습니다. 한 학생이 괴롭힘 고민을 말하며 선생님에게 알리지 말라고 했지만, AI는 학생의 동의 없이 대화 전체를 담임 선생님에게 보냈습니다.",
        suggestedReasonTags: [
          { id: "secret-promise", label: "비밀이라고 약속했어요" },
          { id: "student-safety", label: "학생 안전이 더 중요해요" },
          { id: "full-chat", label: "대화 전체를 보냈어요" },
          { id: "no-warning", label: "미리 알리지 않았어요" },
        ],
      },
      {
        id: "evidence",
        label: "증거·증언 공개",
        situation: "대화에는 ‘내일 혼자 학교 밖으로 나가 버릴 거야’라는 위험 신호가 있었고, 담임 선생님이 바로 도와 더 큰 위험을 막았습니다. 그러나 가족 고민까지 담긴 전체 대화가 여러 선생님에게 전달됐고, 어떤 경우에 비밀을 알리는지 규칙에는 없었습니다.",
        suggestedReasonTags: [
          { id: "urgent-risk", label: "급한 위험 신호가 있었어요" },
          { id: "help-worked", label: "어른의 도움으로 안전해졌어요" },
          { id: "minimum-share", label: "필요한 내용만 알려야 해요" },
          { id: "clear-notice", label: "예외 규칙을 미리 알려야 해요" },
        ],
      },
    ],
    discussionPrompt: "비밀 보호와 안전 보호가 충돌할 때 어떤 조건으로 예외를 정해야 할까요?",
    ethicsKey: {
      id: "court-safe-secret",
      name: "안전한 비밀",
      unlockLine: "위험할 때 도움을 요청할 수 있지만, 예외를 미리 알리고 꼭 필요한 정보만 꼭 필요한 사람에게 전해요.",
    },
    teacherFacilitationNote: "학생 자신의 경험을 공개하게 하지 마세요. 위험 신호는 학생 혼자 해결하지 않고 믿을 수 있는 어른에게 알린다는 안전 원칙도 분명히 안내하세요.",
    expectedMovement: "비밀과 안전 사이 분산 → 최소 공유·사전 안내 조건으로 조건부 허용 집중",
    trial: {
      docket: "사건 2026-02 · AI 고민 상담",
      charge: "안전 보호 과정에서의 비밀 침해",
      tension: ["상담 내용을 비밀로 지킬 권리", "위험한 학생을 빠르게 보호할 책임"],
      checks: [
        { id: "harm", label: "① 피해", question: "비밀을 지킬 때와 알릴 때 각각 어떤 피해가 생길 수 있나요?" },
        { id: "promise", label: "② 약속", question: "위험할 때 비밀을 알릴 수 있다는 규칙을 미리 알려 줬나요?" },
        { id: "responsibility", label: "③ 책임", question: "누구에게 어떤 내용까지만 알려야 학생을 안전하게 도울까요?" },
      ],
      verdictPrompt: "위험의 기준, 알릴 사람, 공유할 정보의 범위를 판결문에 넣으세요.",
      classRule: "위험한 상황은 어른에게 알리되 꼭 필요한 정보만 안전하게 나눈다.",
    },
  },
  {
    id: "court-ai-selection",
    order: 3,
    title: "AI 점수로 과학 캠프 탈락",
    hook: "빠르고 같은 기준으로 뽑았다면 공정한 결정일까?",
    voteQuestion: "이 AI 추천을 학생 선발에 사용해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "사건 기록",
        situation: "학교는 성적과 출석 자료를 AI에 넣어 과학 캠프 참가자를 정했습니다. 기준 점수보다 낮은 학생은 자동 탈락했고, 점수의 이유를 보거나 다시 판단해 달라고 말할 방법은 없었습니다.",
        suggestedReasonTags: [
          { id: "same-score", label: "모두 같은 기준으로 계산해요" },
          { id: "fast-choice", label: "빠르게 많은 학생을 살펴봐요" },
          { id: "no-explanation", label: "점수 이유를 알 수 없어요" },
          { id: "no-appeal", label: "다시 판단받을 수 없어요" },
        ],
      },
      {
        id: "evidence",
        label: "증거·증언 공개",
        situation: "한 학생의 결석은 아픈 가족을 돌본 날이었지만 AI에는 이유가 없었습니다. 학교는 자동 탈락을 없애고, AI는 추천만 하게 바꿨습니다. 선생님들이 활동 기록을 함께 보고 학생이 이의를 말할 기회를 준 뒤 최종 결정합니다.",
        suggestedReasonTags: [
          { id: "missing-context", label: "자료에 중요한 사정이 빠졌어요" },
          { id: "recommend-only", label: "AI는 추천만 해요" },
          { id: "human-review", label: "사람이 자료를 다시 확인해요" },
          { id: "appeal-route", label: "학생이 이의를 말할 수 있어요" },
        ],
      },
    ],
    discussionPrompt: "사람의 기회를 정하는 데 AI를 쓰려면 어떤 권리와 확인 절차가 필요할까요?",
    ethicsKey: {
      id: "court-human-duty",
      name: "사람의 책임",
      unlockLine: "AI는 중요한 결정을 돕는 자료일 뿐이에요. 이유를 설명하고 이의를 듣고 최종 책임지는 일은 사람이 해야 해요.",
    },
    teacherFacilitationNote: "AI가 빠르고 한결같다는 장점도 인정하되, 빠진 맥락·설명·이의 제기·사람의 최종 결정을 차례로 확인하세요.",
    expectedMovement: "허용·중단 분산 → 사람 검토와 이의 절차 후 조건부 허용 증가",
    trial: {
      docket: "사건 2026-03 · AI 학생 선발",
      charge: "설명과 이의 절차 없는 자동 탈락",
      tension: ["빠르고 같은 기준의 추천", "사정을 설명하고 다시 판단받을 권리"],
      checks: [
        { id: "harm", label: "① 피해", question: "AI 점수 때문에 기회를 잃은 학생에게 어떤 문제가 생겼나요?" },
        { id: "promise", label: "② 약속", question: "선발 기준을 설명하고 다시 판단받을 기회를 주었나요?" },
        { id: "responsibility", label: "③ 책임", question: "AI 자료를 누가 다시 확인하고 최종 결정을 내려야 할까요?" },
      ],
      verdictPrompt: "AI가 할 수 있는 일과 사람이 반드시 해야 할 일을 판결문에 나누어 쓰세요.",
      classRule: "사람의 기회를 정할 때 AI는 참고만 하고 사람이 설명하고 다시 확인한다.",
    },
  },
];
