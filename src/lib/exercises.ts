import { Unit, Word, allWords } from "@/data/lessons";

export type ExerciseType =
  | "multiple-choice"
  | "translation"
  | "listening"
  | "typing"
  | "picture"
  | "matching";

export type Exercise =
  | {
      type: "multiple-choice";
      prompt: string; // Latvian instruction
      word: Word;
      options: string[]; // English options
    }
  | {
      type: "translation";
      prompt: string;
      word: Word;
      options: string[]; // Latvian options
    }
  | {
      type: "listening";
      prompt: string;
      word: Word;
      options: string[]; // English options
    }
  | {
      type: "typing";
      prompt: string;
      word: Word;
    }
  | {
      type: "picture";
      prompt: string;
      word: Word;
      options: Word[]; // emoji choices
    }
  | {
      type: "matching";
      prompt: string;
      pairs: Word[]; // 4 pairs to match
    };

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickDistractors = (correct: Word, pool: Word[], count: number): Word[] => {
  const candidates = pool.filter((w) => w.en !== correct.en);
  return shuffle(candidates).slice(0, count);
};

export function generateExercises(unit: Unit): Exercise[] {
  const words = unit.words;
  const pool = [...words, ...allWords()]; // distractors can come from anywhere
  const types: ExerciseType[] = [
    "multiple-choice",
    "listening",
    "translation",
    "picture",
    "typing",
  ];

  const exercises: Exercise[] = [];

  // one of each type, cycling through the unit's words
  types.forEach((type, i) => {
    const word = words[i % words.length];
    const distractors = pickDistractors(word, pool, 3);

    if (type === "multiple-choice") {
      exercises.push({
        type,
        prompt: `Kā angliski "${word.lv}"?`,
        word,
        options: shuffle([word.en, ...distractors.map((d) => d.en)]),
      });
    } else if (type === "translation") {
      exercises.push({
        type,
        prompt: `Ko nozīmē "${word.en}"?`,
        word,
        options: shuffle([word.lv, ...distractors.map((d) => d.lv)]),
      });
    } else if (type === "listening") {
      exercises.push({
        type,
        prompt: "Klausies un izvēlies pareizo vārdu",
        word,
        options: shuffle([word.en, ...distractors.map((d) => d.en)]),
      });
    } else if (type === "picture") {
      exercises.push({
        type,
        prompt: `Atrodi "${word.en}"`,
        word,
        options: shuffle([word, ...distractors]),
      });
    } else if (type === "typing") {
      exercises.push({
        type,
        prompt: `Uzraksti angliski "${word.lv}"`,
        word,
      });
    }
  });

  // matching exercise (always last) using up to 4 unit words
  const matchPairs = shuffle(words).slice(0, Math.min(4, words.length));
  exercises.push({
    type: "matching",
    prompt: "Savieno latviešu vārdu ar angļu vārdu",
    pairs: matchPairs,
  });

  return exercises;
}

export const normalizeAnswer = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");
