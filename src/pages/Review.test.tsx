import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Review from "./Review";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function openReview(learnedWords: string[]) {
  // A repeated draw must terminate, even when the curriculum repeats an English word.
  let draws = 0;
  vi.spyOn(Math, "random").mockImplementation(() => {
    if (++draws > 2000) throw new Error("Review kept drawing candidates");
    return 0;
  });
  localStorage.setItem("rudis-active-profile-v1", "kid-1");
  localStorage.setItem("rudis-progress-v2-kid-1", JSON.stringify({ learnedWords }));
  render(<MemoryRouter><ProfileProvider><Review /></ProfileProvider></MemoryRouter>);
}

function answer(word: string) {
  for (const name of [word, "Pārbaudīt", "Turpināt"]) {
    fireEvent.click(screen.getByRole("button", { name }));
  }
}

it.each(["hello", "orange"])("finishes a review with %s as the only learned English word", (word) => {
  openReview([word]);
  answer(word);
  expect(screen.getByText("1/1")).toBeVisible();
});

it("alternates two known words when the random draw keeps picking the first candidate", () => {
  openReview(["hello", "goodbye"]);
  for (const word of ["hello", "goodbye", "hello", "goodbye"]) answer(word);
  expect(screen.getByText("4/4")).toBeVisible();
});
