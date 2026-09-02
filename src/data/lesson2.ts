import type { EthicsRound } from "../types";

export const lesson2IntroSlides = [
  {
    eyebrow: "MISSION 01 · 근거 찾기",
    title: "오늘은 선택보다 ‘왜’가 더 중요합니다.",
    body: "모둠 친구들과 사건의 중요한 조건을 찾고, 같은 판정을 고른 이유를 한 문장으로 만드세요.",
    prompt: "우리 모둠은 어떤 윤리 열쇠를 근거로 말할까요?",
  },
  {
    eyebrow: "MISSION 02 · 30초 변론",
    title: "다른 판정의 모둠을 설득하세요.",
    body: "GO·WAIT·STOP은 모두 말할 기회가 있습니다. 상대 의견을 끊지 않고 사건 속 조건으로 반론하세요.",
    prompt: "목소리보다 근거가 강한 모둠이 이깁니다.",
  },
  {
    eyebrow: "MISSION 03 · 조건 카드",
    title: "새 사실이 나오면 판정을 바꿔도 됩니다.",
    body: "조건 카드가 공개되면 처음 판단을 다시 살피세요. 근거 있게 바꾸는 것도 훌륭한 윤리 판단입니다.",
    prompt: "유지할까, 바꿀까? 새 근거까지 준비하세요.",
  },
] as const;

export const lesson2Rounds: EthicsRound[] = [
  {
    id: "battle-homework-helper",
    order: 1,
    title: "AI가 완성한 독서감상문",
    hook: "내용은 내 생각인데 문장은 AI가 썼다. 내 과제일까?",
    voteQuestion: "이 감상문을 내 이름으로 제출해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "첫 판정",
        situation: "하린이는 책을 읽고 떠오른 생각을 세 문장으로 적었습니다. 글을 더 잘 쓰고 싶어서 AI에게 감상문 전체를 완성해 달라고 했고, 나온 글을 그대로 제출하려고 합니다.",
        suggestedReasonTags: [
          { id: "own-idea", label: "생각은 하린이 것이에요" },
          { id: "ai-wrote", label: "문장은 AI가 썼어요" },
          { id: "learning-goal", label: "글쓰기 공부가 안 돼요" },
          { id: "help-tool", label: "AI도 도움 도구예요" },
        ],
      },
      {
        id: "condition",
        label: "조건 카드",
        situation: "선생님은 ‘AI에게 조언받을 수 있지만, 사용한 부분을 표시하고 마지막 글은 자기 말로 다시 써야 한다.’고 안내했습니다. 하린이는 AI 문장을 비교해 보고 자기 말로 고쳐 쓴 뒤 사용 과정도 밝혔습니다.",
        suggestedReasonTags: [
          { id: "rule-followed", label: "수업 규칙을 지켰어요" },
          { id: "rewritten", label: "자기 말로 다시 썼어요" },
          { id: "disclosed", label: "AI 사용을 밝혔어요" },
          { id: "still-assisted", label: "AI 도움은 여전히 컸어요" },
        ],
      },
    ],
    discussionPrompt: "‘도움받기’와 ‘대신 시키기’의 경계는 어디일까요?",
    ethicsKey: {
      id: "battle-honesty",
      name: "정직",
      unlockLine: "내가 한 일과 AI가 한 일을 구분하고, 사용 과정과 수업 규칙을 숨기지 않아요.",
    },
    teacherFacilitationNote: "아이디어의 주인, 실제 글쓰기의 주인, 수업 목표, 사용 공개를 나누어 질문하세요.",
    expectedMovement: "첫 판정 분산 → 조건 공개 후 GO·WAIT 증가",
    battle: {
      tension: ["AI는 유용한 도움 도구", "과제는 내 실력을 보여 주는 일"],
      stancePrompts: {
        green: "생각이 자기 것이라면 왜 제출해도 될까요?",
        yellow: "어떤 조건을 지키면 제출할 수 있을까요?",
        red: "AI가 대신한 부분이 왜 문제가 될까요?",
      },
      debriefPrompt: "초안·수정·공개 중 정직한 AI 사용에 가장 필요한 것은 무엇인가요?",
    },
  },
  {
    id: "battle-contest-poster",
    order: 2,
    title: "AI 포스터가 학교 대표작",
    hook: "규칙에는 AI 이야기가 없다. 그래도 공정한 걸까?",
    voteQuestion: "이 작품을 학교 대표작으로 뽑아도 될까요?",
    phases: [
      {
        id: "initial",
        label: "첫 판정",
        situation: "학교 축제 포스터 공모전에서 유진이가 AI로 만든 작품이 가장 많은 표를 받았습니다. 공모전 안내에는 ‘직접 만든 작품’이라고만 쓰여 있고 AI 사용 규칙은 없습니다.",
        suggestedReasonTags: [
          { id: "no-rule", label: "금지 규칙이 없어요" },
          { id: "direct-work", label: "직접 만든 작품이 아니에요" },
          { id: "best-result", label: "가장 좋은 작품이에요" },
          { id: "unequal-tools", label: "도구 사용 기회가 달라요" },
        ],
      },
      {
        id: "condition",
        label: "조건 카드",
        situation: "모든 참가자가 학교 태블릿의 같은 AI를 사용할 수 있었습니다. 유진이는 직접 그린 스케치로 40번 수정했고, 작품 설명에 AI를 사용한 과정도 적었습니다. 심사위원은 이 사실을 알고 평가했습니다.",
        suggestedReasonTags: [
          { id: "same-chance", label: "모두에게 기회가 같아요" },
          { id: "human-effort", label: "사람의 작업도 많았어요" },
          { id: "transparent", label: "사용 과정을 밝혔어요" },
          { id: "rule-gap", label: "먼저 규칙을 정해야 해요" },
        ],
      },
    ],
    discussionPrompt: "공정한 공모전을 위해 가장 먼저 정해야 할 규칙은 무엇일까요?",
    ethicsKey: {
      id: "battle-fairness",
      name: "공정",
      unlockLine: "같은 기회와 분명한 규칙을 마련하고, 판단에 필요한 정보를 공개해요.",
    },
    teacherFacilitationNote: "결과의 멋짐보다 규칙, 도구 접근 기회, 사용 공개, 사람의 기여를 비교하세요.",
    expectedMovement: "STOP·WAIT 우세 → 조건 공개 후 세 판정으로 재분산",
    battle: {
      tension: ["새로운 도구도 창작의 일부", "같은 기준으로 경쟁해야 공정"],
      stancePrompts: {
        green: "AI를 썼어도 직접 만든 작품이라고 볼 근거는 무엇인가요?",
        yellow: "대표작이 되려면 어떤 조건이 더 필요할까요?",
        red: "금지 규칙이 없어도 불공정하다고 보는 이유는 무엇인가요?",
      },
      debriefPrompt: "규칙·기회·공개·노력 중 공정성을 가장 크게 바꾼 조건은 무엇인가요?",
    },
  },
  {
    id: "battle-secret-chat",
    order: 3,
    title: "AI에게 보여 준 친구의 비밀",
    hook: "사람에게 퍼뜨리지 않았다면 비밀을 지킨 걸까?",
    voteQuestion: "친구의 대화를 AI에게 보여줘도 될까요?",
    phases: [
      {
        id: "initial",
        label: "첫 판정",
        situation: "도윤이는 친구와 다툰 뒤 해결 방법을 알고 싶었습니다. AI가 ‘대화 내용을 보여 달라.’고 하자 친구 이름과 사진이 보이는 채팅 화면을 그대로 올렸습니다. 다른 친구에게는 보내지 않았습니다.",
        suggestedReasonTags: [
          { id: "good-purpose", label: "화해하려는 목적이에요" },
          { id: "private-chat", label: "친구의 대화예요" },
          { id: "not-shared", label: "사람에게 퍼뜨리지 않았어요" },
          { id: "identifiers", label: "이름과 사진이 보여요" },
        ],
      },
      {
        id: "condition",
        label: "조건 카드",
        situation: "도윤이는 친구에게 AI로 해결 방법을 찾아봐도 되는지 먼저 물어 허락받았습니다. 이름·사진·학교·다른 사람의 말은 가리고, 꼭 필요한 한 문장만 입력했습니다.",
        suggestedReasonTags: [
          { id: "consent", label: "친구에게 허락받았어요" },
          { id: "minimum", label: "필요한 정보만 썼어요" },
          { id: "masked", label: "알아볼 정보를 가렸어요" },
          { id: "ai-risk", label: "AI 입력은 여전히 조심해야 해요" },
        ],
      },
    ],
    discussionPrompt: "도움을 받으려는 좋은 목적이면 다른 사람의 정보를 써도 될까요?",
    ethicsKey: {
      id: "battle-privacy",
      name: "동의와 개인정보",
      unlockLine: "다른 사람의 정보는 먼저 허락받고, 알아볼 수 없게 하며, 꼭 필요한 만큼만 사용해요.",
    },
    teacherFacilitationNote: "실제 학생의 비밀을 말하게 하지 말고 가상 사건의 허락·식별 가능성·최소 사용만 다루세요.",
    expectedMovement: "STOP 우세 → 조건 공개 후 GO·WAIT 증가",
    battle: {
      tension: ["문제 해결을 위한 도움", "친구가 자기 정보를 정할 권리"],
      stancePrompts: {
        green: "화해를 위한 사용이 괜찮다고 보는 이유는 무엇인가요?",
        yellow: "어떤 정보를 가리고 어떤 허락을 받아야 할까요?",
        red: "사람에게 보내지 않아도 왜 비밀 침해일까요?",
      },
      debriefPrompt: "허락·가리기·최소 사용 중 빠지면 안 되는 조건을 골라 보세요.",
    },
  },
  {
    id: "battle-ai-captain",
    order: 4,
    title: "AI가 정한 우리 반 팀장",
    hook: "모두에게 같은 점수를 매기면 정말 공정할까?",
    voteQuestion: "AI 점수로 팀장을 정해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "첫 판정",
        situation: "선생님은 모둠 활동 기록을 AI에게 보여 주고 팀장 점수를 계산하게 했습니다. 가장 높은 점수를 받은 학생이 자동으로 팀장이 되었지만, 왜 그 점수인지 확인할 수 없습니다.",
        suggestedReasonTags: [
          { id: "same-standard", label: "모두 같은 기준이에요" },
          { id: "fast", label: "빠르고 편리해요" },
          { id: "no-reason", label: "점수 이유를 몰라요" },
          { id: "important-choice", label: "사람의 기회를 정해요" },
        ],
      },
      {
        id: "condition",
        label: "조건 카드",
        situation: "AI는 팀장 후보를 추천만 합니다. 선생님은 추천 이유와 사용 자료를 확인하고, 학생 의견과 실제 활동을 함께 살핍니다. 잘못된 자료가 있으면 고친 뒤 사람이 최종 결정합니다.",
        suggestedReasonTags: [
          { id: "recommend", label: "AI는 추천만 해요" },
          { id: "explain", label: "이유와 자료를 확인해요" },
          { id: "human-final", label: "사람이 최종 결정해요" },
          { id: "student-voice", label: "학생 의견도 들어요" },
        ],
      },
    ],
    discussionPrompt: "AI가 사람에게 영향을 주는 판단을 할 때 누가 끝까지 책임져야 할까요?",
    ethicsKey: {
      id: "battle-responsibility",
      name: "책임",
      unlockLine: "AI의 이유와 자료를 사람이 다시 확인하고, 이의를 듣고, 최종 결정과 수정에 책임져요.",
    },
    teacherFacilitationNote: "추천과 자동 결정의 차이, 설명, 이의 제기, 사람의 최종 책임을 찾게 하세요.",
    expectedMovement: "STOP 우세 → 조건 공개 후 GO·WAIT 증가",
    battle: {
      tension: ["빠르고 같은 기준의 판단", "설명받고 다시 판단받을 권리"],
      stancePrompts: {
        green: "AI 추천이 사람보다 도움이 될 수 있는 점은 무엇인가요?",
        yellow: "AI를 쓰려면 사람이 어떤 확인을 해야 할까요?",
        red: "중요한 결정을 AI에게 맡기면 안 되는 이유는 무엇인가요?",
      },
      debriefPrompt: "추천·설명·이의 제기·최종 결정 중 사람에게 꼭 남겨야 할 역할은 무엇인가요?",
    },
  },
];
