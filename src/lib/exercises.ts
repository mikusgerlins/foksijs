import { allWords, type Unit, type Word } from "@/data/lessons";
import { listeningScenes } from "@/data/listening-scenes";

type ChoiceRound<T extends string, Option> = {
  type: T;
  prompt: string;
  word: Word;
  options: Option[];
};

export type Exercise =
  | ChoiceRound<"multiple-choice", string>
  | ChoiceRound<"translation", string>
  | ChoiceRound<"listening", string>
  | ChoiceRound<"listening-picture", Word>
  | ChoiceRound<"listening-meaning", string>
  | ChoiceRound<"picture", Word>
  | { type: "typing"; prompt: string; word: Word }
  | { type: "matching"; prompt: string; pairs: Word[] };

export type ExerciseType = Exercise["type"];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Both greetings use an open hand, and both nature words depict a single tree.
const similarPictures: Record<string, string> = { "🖐️": "👋", "🌲": "🌳" };
const pictureSymbol = (word: Word) => similarPictures[word.emoji] ?? word.emoji;

function choicesFor(target: Word, pool: Word[], pictures = false): Word[] {
  const choices = [target];
  for (const candidate of shuffle(pool)) {
    const alreadyShown = choices.some(choice =>
      choice.en === candidate.en || choice.lv === candidate.lv ||
      (pictures && pictureSymbol(choice) === pictureSymbol(candidate)),
    );
    if (!alreadyShown) choices.push(candidate);
    if (choices.length === 4) break;
  }
  return shuffle(choices);
}

export function generateExercises(unit: Unit): Exercise[] {
  const words = unit.words;
  const vocabularyPool = [...words, ...allWords()];
  const shuffledWords = shuffle(words);
  const sceneTarget = listeningScenes[unit.id]?.target;
  const pictureTarget = words.find(word => word.en === sceneTarget) ?? shuffledWords[0];
  const [heardWord = pictureTarget, meaningWord = heardWord] = shuffledWords.filter(word => word.en !== pictureTarget.en);
  // Retain the original vocabulary targets between the three listening rounds.
  const first = words[0];
  const translate = words[2 % words.length];
  const picture = words[3 % words.length];
  const typeWord = words[4 % words.length];

  return [
    {
      type: "multiple-choice",
      prompt: `Kā angliski "${first.lv}"?`,
      word: first,
      options: choicesFor(first, vocabularyPool).map(w => w.en),
    },
    {
      type: "listening",
      prompt: "Klausies un izvēlies angļu vārdu!",
      word: heardWord,
      options: choicesFor(heardWord, words).map(w => w.en),
    },
    {
      type: "translation",
      prompt: `Ko nozīmē "${translate.en}"?`,
      word: translate,
      options: choicesFor(translate, vocabularyPool).map(w => w.lv),
    },
    {
      type: "listening-picture",
      prompt: sceneTarget === pictureTarget.en
        ? "Noklausies teikumu un izvēlies attēlu!"
        : "Klausies un izvēlies attēlu!",
      word: pictureTarget,
      options: choicesFor(pictureTarget, words, true),
    },
    {
      type: "picture",
      prompt: `Atrodi "${picture.en}"`,
      word: picture,
      options: choicesFor(picture, vocabularyPool, true),
    },
    {
      type: "typing",
      prompt: `Uzraksti angliski "${typeWord.lv}"`,
      word: typeWord,
    },
    {
      type: "listening-meaning",
      prompt: "Klausies un izvēlies, ko šis vārds nozīmē!",
      word: meaningWord,
      options: choicesFor(meaningWord, words).map(w => w.lv),
    },
    {
      type: "matching",
      prompt: "Savieno latviešu vārdu ar angļu vārdu",
      pairs: shuffle(words).slice(0, 4),
    },
  ];
}

export const normalizeAnswer = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");
