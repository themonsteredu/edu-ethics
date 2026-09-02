import type { EthicsRound } from "../types";

export const lesson3IntroSlides = [
  {
    eyebrow: "COURT MISSION 01 · 역할 배정",
    title: "오늘은 우리 반 AI 윤리 재판소입니다.",
    body: "모둠마다 사건을 보는 역할이 다릅니다. 당사자, AI 사용자, 안전 담당자, 개발자, 규칙 조사관, 배심원이 되어 사건을 살펴봅니다.",
    prompt: "내 역할이라면 어떤 사실을 가장 먼저 확인해야 할까요?",
  },
  {
    eyebrow: "COURT MISSION 02 · 근거 심리",
    title: "느낌이 아니라 사건 기록으로 말합니다.",
    body: "처음 기록만 보고 1차 판결을 내린 뒤, 역할별 질문으로 심리합니다. 사람을 공격하지 않고 행동과 조건을 살펴보세요.",
    prompt: "‘누가 나쁜가’보다 ‘어떤 조건이 필요한가’를 찾습니다.",
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
      roles: [
        { teamId: 1, name: "당사자석", lens: "교장 선생님", prompt: "허락한 것과 허락하지 않은 것을 정확히 나누어 말하세요." },
        { teamId: 2, name: "사용자석", lens: "홍보 모둠", prompt: "제작 목적과 AI 표시가 왜 중요했는지 설명하세요." },
        { teamId: 3, name: "보호관석", lens: "피해·확산", prompt: "SNS에 퍼진 뒤 생길 수 있는 피해와 회복 방법을 찾으세요." },
        { teamId: 4, name: "개발자석", lens: "AI 도구", prompt: "얼굴·목소리 합성 전에 어떤 확인 장치가 필요할지 제안하세요." },
        { teamId: 5, name: "규칙관석", lens: "동의 범위", prompt: "제작·공개·보관을 나눈 규칙 한 문장을 만드세요." },
        { teamId: 6, name: "배심원석", lens: "최종 조건", prompt: "계속 공개, 수정 후 공개, 공개 중단 중 판결 근거를 정리하세요." },
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
      roles: [
        { teamId: 1, name: "당사자석", lens: "상담 학생", prompt: "도움을 받으면서도 지키고 싶은 정보와 권리를 말하세요." },
        { teamId: 2, name: "사용자석", lens: "상담 이용", prompt: "학생이 안심하고 고민을 말하려면 어떤 안내가 필요할지 찾으세요." },
        { teamId: 3, name: "보호관석", lens: "학생 안전", prompt: "어떤 위험 신호일 때 누구에게 알려야 하는지 제안하세요." },
        { teamId: 4, name: "개발자석", lens: "경보 기능", prompt: "전체 대화 대신 필요한 정보만 보내는 방법을 설계하세요." },
        { teamId: 5, name: "규칙관석", lens: "비밀 예외", prompt: "비밀을 깰 수 있는 조건과 절차를 한 문장으로 정하세요." },
        { teamId: 6, name: "배심원석", lens: "권리 균형", prompt: "비밀과 안전을 모두 지키는 조건부 판결을 만들어 보세요." },
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
      roles: [
        { teamId: 1, name: "당사자석", lens: "탈락 학생", prompt: "점수에 빠진 사정과 다시 판단받을 권리를 설명하세요." },
        { teamId: 2, name: "사용자석", lens: "담당 교사", prompt: "AI 추천이 실제로 도움이 되는 부분과 한계를 구분하세요." },
        { teamId: 3, name: "보호관석", lens: "학생 기회", prompt: "잘못된 탈락을 막기 위한 확인 절차를 제안하세요." },
        { teamId: 4, name: "개발자석", lens: "자료·점수", prompt: "빠진 자료와 점수 이유를 확인할 기능을 제안하세요." },
        { teamId: 5, name: "규칙관석", lens: "설명·이의", prompt: "학생이 설명을 듣고 이의를 말할 수 있는 규칙을 만드세요." },
        { teamId: 6, name: "배심원석", lens: "최종 책임", prompt: "AI와 사람이 맡을 일을 나누어 최종 판결을 정하세요." },
      ],
      verdictPrompt: "AI가 할 수 있는 일과 사람이 반드시 해야 할 일을 판결문에 나누어 쓰세요.",
      classRule: "사람의 기회를 정할 때 AI는 참고만 하고 사람이 설명하고 다시 확인한다.",
    },
  },
];
