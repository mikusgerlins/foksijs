import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { restoreAndroidProgress, useProgress } from "./useProgress";

const bridge = vi.hoisted(() => ({ getAll: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/androidProgress", () => ({ androidProgress: bridge }));

it("keeps the current exercise visible until Android commits, then restores the completion after a cold start", async () => {
  localStorage.clear();
  localStorage.setItem("rudis-active-profile-v1", "kid-1");
  const key = "rudis-progress-v2-kid-1";
  localStorage.setItem(key, JSON.stringify({ cafeStep: 2, xp: 20 }));
  let release: () => void;
  bridge.set.mockImplementation(() => new Promise<void>(resolve => { release = resolve; }));
  const screen = renderHook(useProgress, { wrapper: ProfileProvider });
  const completing = screen.result.current.finishCafe();
  expect(screen.result.current.progress.cafeStep).toBe(2);
  await act(async () => { release(); expect(await completing).toBe(true); });
  const durable = bridge.set.mock.calls[0][0];
  expect(durable.profileId).toBe("kid-1");
  expect(screen.result.current.progress).toMatchObject({ cafeStep: null, cafeCompletedCount: 1, xp: 20 });
  screen.unmount();

  localStorage.removeItem(key);
  bridge.getAll.mockResolvedValue({ values: { "kid-1": durable.value } });
  await restoreAndroidProgress();
  const reopened = renderHook(useProgress, { wrapper: ProfileProvider });
  expect(reopened.result.current.progress).toMatchObject({ cafeStep: null, cafeCompletedCount: 1, xp: 20 });
  bridge.set.mockRejectedValueOnce(new Error("Disk write failed"));
  await act(async () => { expect(await reopened.result.current.setCafeStep(0)).toBe(false); });
  expect(reopened.result.current.progress.cafeStep).toBeNull();
});
