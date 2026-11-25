import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useCafeMedia } from "./useCafeMedia";

// Permissions can resolve after the child has already left the exercise.
function mockMicrophone(getUserMedia: () => Promise<MediaStream>) {
  vi.stubGlobal("navigator", Object.assign(Object.create(navigator), {
    mediaDevices: { getUserMedia },
  }));
  vi.stubGlobal("MediaRecorder", vi.fn());
}

afterEach(() => vi.unstubAllGlobals());

it("allows practice to continue after the user denies recording", async () => {
  const getUserMedia = vi.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
  mockMicrophone(getUserMedia);
  const { result } = renderHook(useCafeMedia);
  expect(getUserMedia).not.toHaveBeenCalled();
  await act(() => result.current.startRecording());
  expect(result.current.mic).toBe("denied");
  act(() => result.current.reset());
  expect(result.current.mic).toBe("idle");
});

it("releases a late microphone grant after leaving the lesson", async () => {
  let grant: (stream: MediaStream) => void;
  mockMicrophone(() => new Promise(resolve => { grant = resolve; }));
  const { result, unmount } = renderHook(useCafeMedia);
  let pending: Promise<void>;
  act(() => { pending = result.current.startRecording(); });
  expect(result.current.mic).toBe("requesting");
  unmount();
  const stop = vi.fn();
  grant({ getTracks: () => [{ stop }] } as unknown as MediaStream);
  await pending;
  expect(stop).toHaveBeenCalledOnce();
  expect(MediaRecorder).not.toHaveBeenCalled();
});

it("stops recording and releases all tracks when the page is hidden", async () => {
  const stopTrack = vi.fn();
  const stream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;
  const stopRecording = vi.fn();
  mockMicrophone(async () => stream);
  vi.stubGlobal("MediaRecorder", class {
    state = "inactive";
    start() { this.state = "recording"; }
    stop() { this.state = "inactive"; stopRecording(); }
  });
  const { result } = renderHook(useCafeMedia);
  await act(() => result.current.startRecording());
  expect(result.current.mic).toBe("recording");
  act(() => window.dispatchEvent(new Event("pagehide")));
  expect(stopRecording).toHaveBeenCalledOnce();
  expect(stopTrack).toHaveBeenCalledOnce();
  expect(result.current.mic).toBe("idle");
});
