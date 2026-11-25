import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Matching } from "./Matching";

afterEach(() => { cleanup(); vi.useRealTimers(); });

it("counts one wrong pair once and completes after the remaining correct pairs", () => {
  vi.useFakeTimers();
  const onComplete = vi.fn();
  const pairs = [
    { lv: "zils", en: "blue", emoji: "🟦" },
    { lv: "zaļš", en: "green", emoji: "🟩" },
  ];
  render(<Matching pairs={pairs} onComplete={onComplete} />);
  const tap = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
  tap("zils"); tap("green");
  expect(screen.getByRole("button", { name: "blue" })).toBeDisabled();
  act(() => vi.advanceTimersByTime(600));
  tap("blue"); tap("zils");
  tap("zaļš"); tap("green");
  expect(onComplete.mock.calls).toEqual([[1]]);
});
