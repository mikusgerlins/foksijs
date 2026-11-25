import { afterEach, expect, it, vi } from "vitest";
import { speak } from "./speak";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("plays the bundled recording for a lesson phrase when the speaker is tapped", () => {
  const playedSources: string[] = [];
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    playedSources.push(this.src);
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  speak("good morning");
  expect(new URL(playedSources[0]).pathname).toBe("/listening/good-morning.mp3");
  expect(play).toHaveBeenCalledOnce();
});

it("stops the previous recording when another word is requested", () => {
  const played: HTMLMediaElement[] = [];
  const paused: HTMLMediaElement[] = [];
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    played.push(this);
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    paused.push(this);
  });
  speak("hello");
  const first = played.at(-1);
  speak("goodbye");
  expect(paused).toContain(first);
  expect(new URL(played.at(-1)!.src).pathname).toBe("/listening/goodbye.mp3");
});
