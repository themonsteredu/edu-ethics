import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("application routes", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the three-lesson home and all lesson calls to action", () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(screen.getByRole("heading", { name: /판단이 움직이는 순간/ })).toBeInTheDocument();
    expect(screen.getByText("AI 윤리 밸런스 게임쇼")).toBeInTheDocument();
    expect(screen.getByText("AI 윤리 딜레마 배틀")).toBeInTheDocument();
    expect(screen.getByText("AI 윤리 재판소")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /수업코드로 입장/ })).toHaveAttribute("href", "/join");
    expect(screen.getAllByRole("link", { name: /교사 수업 열기/ }).some((link) => link.getAttribute("href") === "/teacher?lesson=2")).toBe(true);
    expect(screen.getAllByRole("link", { name: /교사 수업 열기/ }).some((link) => link.getAttribute("href") === "/teacher?lesson=3")).toBe(true);
  });

  it("validates a short classroom code on the student join route", () => {
    window.history.replaceState({}, "", "/join");
    render(<App />);

    fireEvent.change(screen.getByLabelText("수업코드"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("이름 또는 별명"), { target: { value: "민지" } });
    fireEvent.click(screen.getByRole("button", { name: /판정소 입장/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("수업코드 6자리");
  });

  it("rejects an overlong classroom code instead of entering the wrong room", () => {
    window.history.replaceState({}, "", "/join");
    render(<App />);

    fireEvent.change(screen.getByLabelText("수업코드"), { target: { value: "ABC2345" } });
    fireEvent.change(screen.getByLabelText("이름 또는 별명"), { target: { value: "민지" } });
    fireEvent.click(screen.getByRole("button", { name: /판정소 입장/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("수업코드 6자리");
  });

  it("prefills an exact classroom code from the teacher's direct join link", () => {
    window.history.replaceState({}, "", "/join?room=ZX9K32");
    render(<App />);

    expect(screen.getByLabelText("수업코드")).toHaveValue("ZX9K32");
  });

  it("protects teacher controls behind the configured PIN gate", () => {
    window.history.replaceState({}, "", "/teacher");
    render(<App />);

    expect(screen.getByRole("heading", { name: "교사 설정" })).toBeInTheDocument();
    expect(screen.getByLabelText("교사용 비밀번호")).toHaveAttribute("type", "password");
  });

  it("opens the lesson-two teacher gate from the lesson route", () => {
    window.history.replaceState({}, "", "/teacher?lesson=2");
    render(<App />);

    expect(screen.getByText(/2차시 수업 생성/)).toBeInTheDocument();
  });

  it("opens the lesson-three teacher gate from the lesson route", () => {
    window.history.replaceState({}, "", "/teacher?lesson=3");
    render(<App />);

    expect(screen.getByText(/3차시 수업 생성/)).toBeInTheDocument();
  });
});
