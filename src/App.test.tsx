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

  it("renders the three-lesson home and lesson-one calls to action", () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(screen.getByRole("heading", { name: /판단이 움직이는 순간/ })).toBeInTheDocument();
    expect(screen.getByText("AI 윤리 밸런스 게임쇼")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /수업코드로 입장/ })).toHaveAttribute("href", "/join");
  });

  it("validates a short classroom code on the student join route", () => {
    window.history.replaceState({}, "", "/join");
    render(<App />);

    fireEvent.change(screen.getByLabelText("수업코드"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("이름 또는 별명"), { target: { value: "민지" } });
    fireEvent.click(screen.getByRole("button", { name: /판정소 입장/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("6자리 수업코드");
  });

  it("protects teacher controls behind the configured PIN gate", () => {
    window.history.replaceState({}, "", "/teacher");
    render(<App />);

    expect(screen.getByRole("heading", { name: "교사 설정" })).toBeInTheDocument();
    expect(screen.getByLabelText("교사용 비밀번호")).toHaveAttribute("type", "password");
  });
});
