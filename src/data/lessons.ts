import { introSlides, lesson1Rounds, voteOptions } from "./lesson1";
import { lesson2IntroSlides, lesson2Rounds } from "./lesson2";
import { lesson3IntroSlides, lesson3Rounds } from "./lesson3";
import type { EthicsRound, LessonId, VoteOption } from "../types";

export interface LessonIntroSlide {
  eyebrow: string;
  title: string;
  body: string;
  prompt: string;
}

export interface LessonConfig {
  id: LessonId;
  eyebrow: string;
  title: string;
  shortTitle: string;
  lobbyGuide: string;
  completionTitle: string;
  completionPrompt: string;
  voteOptions: VoteOption[];
  introSlides: readonly LessonIntroSlide[];
  rounds: EthicsRound[];
}

const lessonConfigs: Record<LessonId, LessonConfig> = {
  1: {
    id: 1,
    eyebrow: "LESSON 01 · LIVE CLASS",
    title: "AI 윤리 밸런스 게임쇼",
    shortTitle: "AI 윤리 판정관",
    lobbyGuide: "학생들이 입장하면 오프닝을 시작하세요. 결과는 모든 학생이 먼저 판정할 때까지 공개되지 않습니다.",
    completionTitle: "우리 반은 다섯 가지 판단 기준을 발견했습니다.",
    completionPrompt: "AI를 사용할 때 우리 반이 꼭 지켜야 할 규칙 한 가지는 무엇인가요?",
    voteOptions,
    introSlides,
    rounds: lesson1Rounds,
  },
  2: {
    id: 2,
    eyebrow: "LESSON 02 · TEAM BATTLE",
    title: "AI 윤리 딜레마 배틀",
    shortTitle: "AI 윤리 배틀러",
    lobbyGuide: "모둠을 확인한 뒤 오프닝을 시작하세요. 첫 판정과 조건 공개 후 재판정을 비교합니다.",
    completionTitle: "우리 반은 근거로 판단하고, 다른 의견을 들으며 판정을 보완했습니다.",
    completionPrompt: "다른 모둠의 말 때문에 새롭게 발견한 조건은 무엇인가요?",
    voteOptions,
    introSlides: lesson2IntroSlides,
    rounds: lesson2Rounds,
  },
  3: {
    id: 3,
    eyebrow: "LESSON 03 · AI ETHICS COURT",
    title: "AI 윤리 재판소",
    shortTitle: "AI 윤리 배심원",
    lobbyGuide: "모든 학생이 배심원이 되어 참여합니다. 1차 판결, 세 가지 확인 질문, 증거 공개, 최종 판결 순서로 진행합니다.",
    completionTitle: "세 개의 판결 원칙으로 우리 반 AI 사용 규칙을 완성했습니다.",
    completionPrompt: "우리 반 AI 윤리 헌장에 가장 먼저 넣을 규칙은 무엇인가요?",
    voteOptions: [
      { id: "green", signal: "ALLOW", label: "사용을 허용해요", shortLabel: "허용" },
      { id: "yellow", signal: "CONDITION", label: "조건부로 허용해요", shortLabel: "조건부" },
      { id: "red", signal: "STOP", label: "사용을 중단해요", shortLabel: "중단" },
    ],
    introSlides: lesson3IntroSlides,
    rounds: lesson3Rounds,
  },
};

export function getLessonConfig(lessonId: LessonId | number | undefined): LessonConfig {
  if (lessonId === 2) return lessonConfigs[2];
  if (lessonId === 3) return lessonConfigs[3];
  return lessonConfigs[1];
}

export { voteOptions };
