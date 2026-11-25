import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ListeningPrompt } from "./ListeningPrompt";

const round = {
  type: "listening-picture" as const, prompt: "Noklausies teikumu un izvēlies attēlu!",
  word: { lv: "ar labu nakti", en: "good night", emoji: "🌙" }, options: [],
};

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("plays the direction, then the sentence, and replays only the sentence", async () => {
  const played: string[] = [];
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    played.push(new URL(this.src).pathname);
    return Promise.resolve();
  });
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  const view = render(<ListeningPrompt round={round} unitId="greetings" answered={false} />);
  const audio = view.container.querySelector("audio")!;
  expect(played[0]).toMatch(/instructions\/picture\.mp3$/);
  expect(screen.queryByText(/time for bed/i)).toBeNull();
  fireEvent.ended(audio);
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(played.slice(1)).toEqual(["/listening/scenes/greetings.mp3", "/listening/scenes/greetings.mp3"]));
  view.rerender(<ListeningPrompt round={round} unitId="greetings" answered />);
  expect(screen.getByText(/time for bed/i)).toBeVisible();
  pause.mockClear();
  view.unmount();
  expect(pause).toHaveBeenCalled();
  expect(audio.onended).toBeNull();
});

it("offers tap-to-play when autoplay is blocked and a readable prompt when the English clip fails", async () => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play")
    .mockRejectedValueOnce(new DOMException("Tap required", "NotAllowedError"))
    .mockResolvedValue(undefined);
  const view = render(<ListeningPrompt round={round} unitId="greetings" answered={false} />);
  fireEvent.click(await screen.findByRole("button", { name: "Klausīties" }));
  const audio = view.container.querySelector("audio")!;
  fireEvent.ended(audio);
  fireEvent.error(audio);
  expect(await screen.findByText(/time for bed/i)).toBeVisible();
});
