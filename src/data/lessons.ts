import { introSlides, lesson1Rounds, voteOptions } from "./lesson1";
import { lesson2IntroSlides, lesson2Rounds } from "./lesson2";
import type { EthicsRound, LessonId } from "../types";

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
    introSlides: lesson2IntroSlides,
    rounds: lesson2Rounds,
  },
};

export function getLessonConfig(lessonId: LessonId | number | undefined): LessonConfig {
  return lessonId === 2 ? lessonConfigs[2] : lessonConfigs[1];
}

export { voteOptions };
