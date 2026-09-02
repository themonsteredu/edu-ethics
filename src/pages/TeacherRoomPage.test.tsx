import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TeacherRoomPage } from "./TeacherRoomPage";

vi.mock("../lib/realtime", () => ({
  hasSupabaseConfig: () => false,
  connectRoom: async ({ roomCode }: { roomCode: string }) => ({
    kind: "classroom-demo" as const,
    roomCode,
    send: async () => undefined,
    updatePresence: async () => undefined,
    disconnect: async () => undefined,
  }),
}));

describe("lesson two teacher flow", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => cleanup());

  it("moves from briefing through first vote, debate, and condition card", () => {
    render(<MemoryRouter><TeacherRoomPage lessonId={2} /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "AI 윤리 딜레마 배틀" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /오프닝 시작/ }));
    expect(screen.getByRole("heading", { name: /오늘은 선택보다/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /다음 브리핑/ }));
    fireEvent.click(screen.getByRole("button", { name: /다음 브리핑/ }));
    fireEvent.click(screen.getByRole("button", { name: /첫 사건 공개/ }));
    expect(screen.getByRole("heading", { name: "AI가 완성한 독서감상문" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /투표 마감/ }));
    expect(screen.getByText("모둠별 판정")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /30초 변론 시작/ }));
    expect(screen.getByText("30 SECOND TEAM BATTLE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /조건 카드 공개/ }));
    expect(screen.getByText(/마지막 글은 자기 말로 다시 써야 한다/)).toBeInTheDocument();
  });

  it("runs the lesson-three court from first verdict to new evidence", () => {
    render(<MemoryRouter><TeacherRoomPage lessonId={3} /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "AI 윤리 재판소" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /오프닝 시작/ }));
    expect(screen.getByRole("heading", { name: /모두가 AI 윤리 배심원/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /다음 브리핑/ }));
    fireEvent.click(screen.getByRole("button", { name: /다음 브리핑/ }));
    fireEvent.click(screen.getByRole("button", { name: /첫 사건 공개/ }));
    expect(screen.getByRole("heading", { name: "교장 선생님이 래퍼가 됐다?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /투표 마감/ }));
    expect(screen.getByRole("heading", { name: "배심원단의 판결" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /세 질문으로 따져보기/ }));
    expect(screen.getByText("COURTROOM HEARING")).toBeInTheDocument();
    expect(screen.getByText("① 피해")).toBeInTheDocument();
    expect(screen.getByText("② 약속")).toBeInTheDocument();
    expect(screen.getByText("③ 책임")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /증거·증언 공개/ }));
    expect(screen.getByText(/축제 무대에서만 보여 주는/)).toBeInTheDocument();
  });
});
