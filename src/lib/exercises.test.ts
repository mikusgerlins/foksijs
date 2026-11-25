import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import path from "node:path";
import { UNITS } from "@/data/lessons";
import { listeningScenes } from "@/data/listening-scenes";
import { generateExercises } from "./exercises";

describe("listening in the vocabulary lessons", () => {
  it("ships a recording for every word, picture scene and Latvian direction", () => {
    const clips = (folder: string) => readdirSync(path.join("public", "listening", folder))
      .filter(file => file.endsWith(".mp3")).sort();
    const words = UNITS.flatMap(unit => unit.words.map(word => word.en.toLowerCase().replace(/\s+/g, "-") + ".mp3"));
    expect(clips(".")).toEqual([...new Set(words)].sort());
    expect(clips("scenes")).toEqual(UNITS.map(unit => unit.id + ".mp3").sort());
    expect(clips("instructions")).toEqual(["meaning.mp3", "picture.mp3", "word.mp3"]);
  });
  it.each(UNITS)("$id has three distinct listening targets and unambiguous in-unit choices", unit => {
    const rounds = generateExercises(unit);
    expect(rounds.map(ex => ex.type)).toEqual([
      "multiple-choice", "listening", "translation", "listening-picture",
      "picture", "typing", "listening-meaning", "matching",
    ]);
    const [, heard, , scene, , , meaning] = rounds;
    if (heard.type !== "listening" || scene.type !== "listening-picture" || meaning.type !== "listening-meaning") {
      throw new Error("Unexpected listening round order");
    }
    expect(new Set([heard.word.en, scene.word.en, meaning.word.en]).size).toBe(3);
    expect(unit.words.filter(w => w.en === listeningScenes[unit.id].target)).toEqual([scene.word]);
    expect(listeningScenes[unit.id].line.toLowerCase()).toContain(scene.word.en.toLowerCase());

    for (const [round, language] of [[heard, "en"], [meaning, "lv"]] as const) {
      expect(round.options).toHaveLength(4);
      expect(new Set(round.options).size).toBe(round.options.length);
      expect(round.options).toContain(round.word[language]);
      expect(round.options.every(label => unit.words.some(word => word[language] === label))).toBe(true);
    }
    expect(scene.options.length).toBeGreaterThanOrEqual(3);
    expect(scene.options.length).toBeLessThanOrEqual(4);
    expect(scene.options).toContain(scene.word);
    expect(scene.options.every(word => unit.words.includes(word))).toBe(true);
    for (const field of ["en", "lv", "emoji"] as const) {
      expect(new Set(scene.options.map(w => w[field])).size).toBe(scene.options.length);
    }
    if (unit.id === "greetings") {
      expect(scene.options.filter(w => ["hello", "goodbye"].includes(w.en))).toHaveLength(1);
    }
  });

  it("uses the new unit's own words when it has no scene yet", () => {
    const unit = { ...UNITS[0], id: "extra-greetings" };
    const round = generateExercises(unit)[3];
    if (round.type !== "listening-picture") throw new Error("Expected a picture choice");
    expect(unit.words).toContain(round.word);
    expect(round.prompt).toBe("Klausies un izvēlies attēlu!");
  });
});
