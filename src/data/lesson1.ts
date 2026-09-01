import type { EthicsRound, VoteChoice } from "../types";

export const voteOptions: Array<{
  id: VoteChoice;
  signal: string;
  label: string;
  shortLabel: string;
}> = [
  { id: "green", signal: "GO", label: "괜찮아요", shortLabel: "괜찮다" },
  { id: "yellow", signal: "WAIT", label: "조건이 필요해요", shortLabel: "고민 필요" },
  { id: "red", signal: "STOP", label: "하면 안 돼요", shortLabel: "안 된다" },
];

export const introSlides = [
  {
    eyebrow: "MISSION 01 · 가짜의 시대",
    title: "눈으로 본 것이 언제나 진짜일까요?",
    body: "AI는 실제로 존재하지 않는 얼굴을 만들고, 사람의 표정과 목소리까지 진짜처럼 바꿀 수 있습니다.",
    prompt: "사진과 영상만 보고 100% 확신할 수 있을까요?",
  },
  {
    eyebrow: "MISSION 02 · 딥페이크",
    title: "같은 기술도 사용법에 따라 결과가 달라집니다.",
    body: "딥페이크는 AI로 사람의 얼굴·목소리·움직임을 다른 콘텐츠에 합성하는 기술입니다.",
    prompt: "영화와 교육에 쓰일 때, 친구를 속일 때의 판단은 같을까요?",
  },
  {
    eyebrow: "MISSION 03 · 오늘의 역할",
    title: "정답을 맞히지 말고, 판단의 근거를 찾으세요.",
    body: "새로운 조건이 공개되면 마음을 바꿔도 됩니다. 좋은 판정관은 끝까지 같은 답을 고집하는 사람이 아닙니다.",
    prompt: "당신은 오늘 AI 윤리 판정관입니다.",
  },
] as const;

export const lesson1Rounds: EthicsRound[] = [
  {
    id: "consent-dance-video",
    order: 1,
    title: "전설의 춤짤 탄생",
    hook: "반 단톡방 업로드 3초 전! 이 영상, 올려도 될까?",
    voteQuestion: "이렇게 AI 영상을 만들어 사용해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "처음 사건",
        situation:
          "민지가 자기 사진을 보내며 ‘내 얼굴로 히어로 캐릭터를 만들어 줘!’라고 했습니다. 준호는 AI로 캐릭터를 만들어 민지에게만 보여줬습니다.",
        suggestedReasonTags: [
          { id: "permission", label: "허락받았어요" },
          { id: "own-face", label: "친구의 얼굴이에요" },
          { id: "private", label: "둘만 봤어요" },
          { id: "fun", label: "재미있는 장난이에요" },
        ],
      },
      {
        id: "condition-1",
        label: "새로운 사실 1",
        situation:
          "준호는 같은 얼굴로 우스꽝스러운 춤 영상을 다시 만들고, 민지에게 묻지 않은 채 반 단톡방에 올렸습니다.",
        suggestedReasonTags: [
          { id: "different-purpose", label: "처음 허락과 달라요" },
          { id: "sharing", label: "여럿에게 공유했어요" },
          { id: "humor", label: "친구도 웃을 수 있어요" },
          { id: "harm", label: "놀림이 될 수 있어요" },
        ],
      },
      {
        id: "condition-2",
        label: "마지막 반전",
        situation:
          "민지도 처음에는 웃었지만 다음 날 ‘이제 싫어. 전부 지워 줘.’라고 했습니다. 준호는 ‘처음에 허락했잖아.’라며 영상을 계속 보관했습니다.",
        suggestedReasonTags: [
          { id: "withdrawal", label: "허락을 취소했어요" },
          { id: "keep-promise", label: "처음 허락은 유효해요" },
          { id: "control", label: "내 얼굴은 내가 결정해요" },
          { id: "already-shared", label: "이미 퍼졌어요" },
        ],
      },
    ],
    discussionPrompt:
      "한 번의 ‘응’은 만들기·공유하기·계속 보관하기를 모두 허락한 걸까요?",
    ethicsKey: {
      id: "consent",
      name: "동의",
      unlockLine:
        "동의는 목적과 범위가 분명해야 하고, 마음이 바뀌면 철회할 수 있어요.",
    },
    teacherFacilitationNote:
      "캐릭터 제작 허락, 영상 제작 허락, 단톡방 공유 허락이 서로 다른지 질문하세요.",
    expectedMovement: "초록 우세 → 노랑·빨강 증가 → 빨강 우세",
  },
  {
    id: "ai-assignment-upgrade",
    order: 2,
    title: "마감 10분 전, AI 완성 버튼",
    hook: "AI가 내가 쓴 글보다 훨씬 잘 썼다. 이대로 내면 내 글일까?",
    voteQuestion: "이 글을 수행평가로 제출해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "처음 사건",
        situation:
          "서윤이는 수행평가 글의 초안을 직접 쓴 뒤 AI에게 ‘이해하기 어려운 문장 세 곳만 알려 줘.’라고 부탁했습니다. 알려 준 내용을 보고 스스로 고쳤습니다.",
        suggestedReasonTags: [
          { id: "own-draft", label: "초안은 직접 썼어요" },
          { id: "feedback", label: "조언만 받았어요" },
          { id: "learning", label: "배우면서 고쳤어요" },
          { id: "ai-used", label: "AI를 사용했어요" },
        ],
      },
      {
        id: "condition-1",
        label: "마감 임박",
        situation:
          "AI가 ‘전체를 더 멋지게 바꿔 줄까요?’라고 묻자 서윤이는 승낙했습니다. AI가 다시 쓴 글이 더 좋아 보여 거의 그대로 복사했습니다.",
        suggestedReasonTags: [
          { id: "amount", label: "AI가 너무 많이 썼어요" },
          { id: "idea-owner", label: "생각은 서윤이 것이에요" },
          { id: "unchanged-copy", label: "그대로 복사했어요" },
          { id: "deadline", label: "시간이 부족했어요" },
        ],
      },
      {
        id: "condition-2",
        label: "제출 직전",
        situation:
          "학교 규칙에는 AI 사용 부분과 과정을 밝히면 참고 도구로 쓸 수 있다고 적혀 있었습니다. 서윤이는 AI가 바꾼 부분을 표시하고 자기 말로 다시 고친 뒤, 사용 기록과 배운 점을 함께 제출했습니다.",
        suggestedReasonTags: [
          { id: "disclosure", label: "사용 사실을 밝혔어요" },
          { id: "rules", label: "학교 규칙에 맞아요" },
          { id: "rewrite", label: "자기 말로 다시 썼어요" },
          { id: "too-much-help", label: "도움이 여전히 많아요" },
        ],
      },
    ],
    discussionPrompt:
      "AI에게 도움받은 글과 AI가 대신 만든 글의 경계는 어디일까요?",
    ethicsKey: {
      id: "honesty",
      name: "정직",
      unlockLine:
        "중요한 것은 AI를 썼다는 사실보다 내 생각의 몫과 사용 과정을 숨기지 않는 거예요.",
    },
    teacherFacilitationNote:
      "AI를 무조건 금지하지 말고 초안, 수정량, 학습 여부, 사용 공개와 수업 규칙을 비교하세요.",
    expectedMovement: "초록 우세 → 빨강 증가 → 초록·노랑으로 재이동",
  },
  {
    id: "ai-mascot-contest",
    order: 3,
    title: "AI 캐릭터로 상금 10만 원",
    hook: "만든 사람은 학생일까, AI일까? 1등 상금은 줘야 할까?",
    voteQuestion: "이 작품에 1등과 상금을 줘도 될까요?",
    phases: [
      {
        id: "initial",
        label: "처음 사건",
        situation:
          "학교 캐릭터 공모전에서 AI로 만든 캐릭터가 1등을 차지했습니다. 우승 상금은 10만 원입니다.",
        suggestedReasonTags: [
          { id: "ai-created", label: "AI가 그림을 만들었어요" },
          { id: "student-idea", label: "아이디어는 학생 것이에요" },
          { id: "contest", label: "공모전 작품이에요" },
          { id: "prize", label: "상금이 걸려 있어요" },
        ],
      },
      {
        id: "condition-1",
        label: "규칙 확인",
        situation:
          "공모전 안내문에는 ‘직접 창작한 작품’이라고만 적혀 있고 AI 금지 조항은 없었습니다. 2등 학생은 손으로 그리는 데 3주가 걸렸습니다.",
        suggestedReasonTags: [
          { id: "no-ban", label: "금지 규정이 없어요" },
          { id: "original-work", label: "직접 창작 조건이 있어요" },
          { id: "effort", label: "노력의 양이 달라요" },
          { id: "same-chance", label: "기회가 같았는지 중요해요" },
        ],
      },
      {
        id: "condition-2",
        label: "제작 기록 공개",
        situation:
          "우승 학생은 아이디어를 스케치한 뒤 명령을 70번 바꾸고 여러 결과를 합성해 직접 수정했습니다. 출품 설명서에 AI 사용 과정도 밝혔고 심사위원들은 이를 알고 뽑았습니다.",
        suggestedReasonTags: [
          { id: "human-work", label: "사람의 작업이 많았어요" },
          { id: "transparent", label: "AI 사용을 밝혔어요" },
          { id: "judge-knew", label: "심사위원도 알고 있었어요" },
          { id: "access-fairness", label: "모두가 AI를 쓸 수 있었나요?" },
        ],
      },
    ],
    discussionPrompt:
      "규칙, 노력한 시간, AI 사용 공개, 아이디어 중 공정한 심사에 가장 중요한 것은 무엇일까요?",
    ethicsKey: {
      id: "fairness",
      name: "공정",
      unlockLine:
        "공정하려면 같은 규칙과 기회가 주어지고, 심사에 필요한 정보가 공개되어야 해요.",
    },
    teacherFacilitationNote:
      "이 라운드는 정답을 고정하지 말고 규칙·접근 기회·공개·창작 기여도를 근거로 말하게 하세요.",
    expectedMovement: "의견 분산 → 노랑·빨강 증가 → 세 의견 논쟁 유지",
  },
  {
    id: "ai-secret-message",
    order: 4,
    title: "AI야, 이건 우리끼리 비밀이야",
    hook: "사람에게 말하지 않고 AI에게만 보여줘도 비밀을 지킨 걸까?",
    voteQuestion: "친구의 정보를 AI에게 보여줘도 될까요?",
    phases: [
      {
        id: "initial",
        label: "처음 사건",
        situation:
          "지호는 좋아하는 사람에게 보낼 메시지를 고민하는 친구를 도와주려고 AI에게 물었습니다. 이름이나 학교는 말하지 않고 상황만 설명했습니다.",
        suggestedReasonTags: [
          { id: "anonymous", label: "이름을 말하지 않았어요" },
          { id: "help", label: "도와주려는 목적이에요" },
          { id: "friend-secret", label: "친구의 비밀이에요" },
          { id: "identifiable", label: "상황만으로 알아볼 수 있어요" },
        ],
      },
      {
        id: "condition-1",
        label: "AI의 추가 질문",
        situation:
          "AI가 ‘대화 내용을 보면 더 잘 도울 수 있어요.’라고 하자 지호는 친구의 이름과 프로필 사진이 보이는 채팅 화면을 그대로 올렸습니다.",
        suggestedReasonTags: [
          { id: "screenshot", label: "대화 캡처를 올렸어요" },
          { id: "name-photo", label: "이름과 사진이 보여요" },
          { id: "better-answer", label: "더 정확한 도움을 받아요" },
          { id: "no-consent", label: "친구에게 묻지 않았어요" },
        ],
      },
      {
        id: "condition-2",
        label: "숨겨진 약속",
        situation:
          "사실 친구가 먼저 ‘AI랑 같이 문장을 다듬어 줘도 돼.’라고 허락했습니다. 지호는 업로드 전에 이름·사진·다른 사람의 메시지를 가리고 필요한 한 문장만 사용했습니다.",
        suggestedReasonTags: [
          { id: "specific-consent", label: "구체적으로 허락받았어요" },
          { id: "minimum-data", label: "필요한 정보만 썼어요" },
          { id: "storage-risk", label: "그래도 저장될 수 있어요" },
          { id: "others-data", label: "다른 사람 정보도 살펴야 해요" },
        ],
      },
    ],
    discussionPrompt:
      "이름을 지워도 친구를 알아볼 수 있다면 개인정보가 아닌 걸까요?",
    ethicsKey: {
      id: "privacy",
      name: "개인정보",
      unlockLine:
        "도움이 목적이어도 다른 사람의 정보는 허락받고 꼭 필요한 만큼만 사용해야 해요.",
    },
    teacherFacilitationNote:
      "실제 비밀이나 채팅 내용을 발표시키지 말고, 입력한 정보는 다시 통제하기 어려울 수 있음을 안내하세요.",
    expectedMovement: "초록·노랑 분산 → 빨강 우세 → 초록·노랑으로 재이동",
  },
  {
    id: "ai-leader-score",
    order: 5,
    title: "AI가 나를 ‘리더 42점’으로 찍었다",
    hook: "축제 탈출방 팀장 탈락! 그런데 AI는 이유를 알려 주지 않는다.",
    voteQuestion: "이 방식으로 학생의 역할을 정해도 될까요?",
    phases: [
      {
        id: "initial",
        label: "처음 사건",
        situation:
          "축제 탈출방을 준비하며 AI가 관심 분야 설문을 보고 기획·디자인·진행 역할을 추천했습니다. 선생님은 추천을 보여 준 뒤 학생이 원하는 역할을 다시 선택하게 했습니다.",
        suggestedReasonTags: [
          { id: "recommend-only", label: "추천만 했어요" },
          { id: "student-choice", label: "학생이 다시 선택해요" },
          { id: "efficient", label: "빠르고 편리해요" },
          { id: "limited-data", label: "설문만으로 판단했어요" },
        ],
      },
      {
        id: "condition-1",
        label: "자동 탈락",
        situation:
          "새 버전에서는 AI가 ‘리더십 42점’이라고 평가한 학생을 팀장 지원에서 자동 탈락시켰습니다. 점수가 낮은 이유는 아무도 확인할 수 없고 이의를 제기할 버튼도 없습니다.",
        suggestedReasonTags: [
          { id: "high-impact", label: "중요한 기회를 결정해요" },
          { id: "no-explanation", label: "이유를 알 수 없어요" },
          { id: "no-appeal", label: "다시 판단받을 수 없어요" },
          { id: "consistent", label: "모두에게 같은 기준이에요" },
        ],
      },
      {
        id: "condition-2",
        label: "사람의 재검토",
        situation:
          "선생님은 그 점수가 결석했던 하루의 자료만으로 계산됐다는 것을 발견했습니다. 자동 탈락을 취소하고 면담과 실제 활동 기록을 함께 본 뒤, AI는 참고 자료로만 사용하기로 했습니다.",
        suggestedReasonTags: [
          { id: "bad-data", label: "자료가 부족했어요" },
          { id: "human-review", label: "사람이 다시 확인했어요" },
          { id: "appeal-restored", label: "이의를 말할 기회가 생겼어요" },
          { id: "ai-reference", label: "AI는 참고만 했어요" },
        ],
      },
    ],
    discussionPrompt:
      "AI가 사람에게 영향을 주는 결정을 내릴 때 반드시 사람이 해야 할 일은 무엇일까요?",
    ethicsKey: {
      id: "responsibility",
      name: "책임",
      unlockLine:
        "AI 결과를 그대로 따르지 않고 설명하고, 다시 확인하고, 고칠 책임은 사람에게 있어요.",
    },
    teacherFacilitationNote:
      "AI 추천과 AI 자동 결정을 구분하고, 설명·이의 제기·데이터 품질·사람의 최종 판단을 찾게 하세요.",
    expectedMovement: "초록 우세 → 빨강 우세 → 초록·노랑으로 재이동",
  },
];
