import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileProvider, useProfiles } from "@/contexts/ProfileContext";
import { useProgress } from "./useProgress";

const key = "rudis-progress-v2-kid-1";
const renderProgress = () => renderHook(() => ({
  ...useProgress(),
  selectProfile: useProfiles().setActive,
}), { wrapper: ProfileProvider });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("rudis-active-profile-v1", "kid-1");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 24, 23, 55));
});

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("café progress", () => {
  it("resumes the selected picture and keeps each child's saved steps separate", () => {
    const first = renderProgress();
    act(() => {
      first.result.current.setCafeStep(0);
      first.result.current.setCafeWaterChosen();
    });
    first.unmount();
    const { result } = renderProgress();
    expect(result.current.progress).toMatchObject({ cafeStep: 0, cafeWaterChosen: true });
    act(() => result.current.selectProfile("kid-2"));
    expect(result.current.progress.cafeStep).toBeNull();
    act(() => result.current.setCafeStep(1));
    act(() => result.current.selectProfile("kid-1"));
    expect(result.current.progress).toMatchObject({ cafeStep: 0, cafeWaterChosen: true });
  });

  it("counts a real replay but gives one day of streak credit, even across different lesson types", () => {
    const { result } = renderProgress();
    act(() => {
      result.current.touchStreak();
      result.current.setCafeStep(2);
      result.current.finishCafe();
      result.current.finishCafe();
    });
    expect(result.current.progress).toMatchObject({ cafeStep: null, streak: 1, cafeCompletedCount: 1 });
    act(() => { result.current.setCafeStep(2); result.current.finishCafe(); });
    expect(result.current.progress).toMatchObject({
      streak: 1, cafeCompletedCount: 2, cafePracticeDays: ["2026-11-24"],
    });
  });

  it("advances at local midnight and starts a new streak after a missed day", () => {
    const { result } = renderProgress();
    const finish = () => act(() => { result.current.setCafeStep(2); result.current.finishCafe(); });
    finish();
    vi.setSystemTime(new Date(2026, 10, 25, 0, 5));
    finish();
    expect(result.current.progress).toMatchObject({ streak: 2, lastActive: "2026-11-25" });
    vi.setSystemTime(new Date(2026, 10, 27, 12, 0));
    finish();
    expect(result.current.progress).toMatchObject({
      streak: 1, lastActive: "2026-11-27", cafePracticeDays: ["2026-11-24", "2026-11-25", "2026-11-27"],
    });
  });

  it.each([key, "rudis-progress-v1"])("preserves vocabulary progress from %s and syncs all mounted views", (oldKey) => {
    localStorage.setItem(oldKey, JSON.stringify({ xp: 70, learnedWords: ["milk"], units: { drinks: { completed: true, stars: 2, bestMistakes: 1 } } }));
    const screen = renderProgress();
    const nav = renderProgress();
    act(() => {
      screen.result.current.setCafeStep(2);
      screen.result.current.finishCafe();
      nav.result.current.addXp(10);
    });
    expect(screen.result.current.progress).toEqual(nav.result.current.progress);
    expect(JSON.parse(localStorage.getItem(key)!)).toMatchObject({
      xp: 80, learnedWords: ["milk"], units: { drinks: { completed: true } }, cafeCompletedCount: 1,
    });
    act(() => screen.result.current.resetProfileProgress("kid-1"));
    expect(nav.result.current.progress).toMatchObject({ xp: 0, streak: 0, cafeStep: null, cafeCompletedCount: 0 });
  });
});
