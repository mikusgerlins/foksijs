import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress";
import { allWords, UNITS, type Word } from "@/data/lessons";
import { speak } from "@/lib/speak";
import { ChoiceGrid } from "@/components/exercises/ChoiceGrid";
import { MascotBubble } from "@/components/MascotBubble";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

type Round = {
  word: Word;
  options: string[];
  prompt: string;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Build a review queue of 8 rounds, prioritising mistake-prone words. */
const buildQueue = (
  learned: string[],
  mistakes: Record<string, number>,
): Round[] => {
  const all = allWords();
  const learnedWords = all.filter((w) => learned.includes(w.en));
  if (learnedWords.length === 0) return [];

  // weight: mistakes count + 1
  const weighted: Word[] = [];
  learnedWords.forEach((w) => {
    const weight = (mistakes[w.en] || 0) * 2 + 1;
    for (let i = 0; i < weight; i++) weighted.push(w);
  });

  const target = Math.min(8, learnedWords.length * 2);
  const picks: Word[] = [];
  const seenInRow = new Set<string>();
  while (picks.length < target) {
    const candidate = weighted[Math.floor(Math.random() * weighted.length)];
    // avoid back-to-back duplicates
    if (picks.length > 0 && picks[picks.length - 1].en === candidate.en) continue;
    seenInRow.add(candidate.en);
    picks.push(candidate);
  }

  return picks.map((word) => {
    const distractors = shuffle(all.filter((w) => w.en !== word.en)).slice(0, 3);
    return {
      word,
      options: shuffle([word.en, ...distractors.map((d) => d.en)]),
      prompt: `Kā angliski "${word.lv}"?`,
    };
  });
};

const Review = () => {
  const { progress, addXp, recordCorrect, recordMistake, touchStreak } = useProgress();
  const [queue, setQueue] = useState<Round[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQueue(buildQueue(progress.learnedWords, progress.mistakes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const round = queue[step];
  const totalSteps = queue.length;
  const progressPct = totalSteps ? (step / totalSteps) * 100 : 0;

  const focusWords = useMemo(() => {
    const top = Object.entries(progress.mistakes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([en]) => en);
    return allWords().filter((w) => top.includes(w.en));
  }, [progress.mistakes]);

  const restart = () => {
    setQueue(buildQueue(progress.learnedWords, progress.mistakes));
    setStep(0);
    setSelected(null);
    setFeedback(null);
    setCorrectCount(0);
    setDone(false);
  };

  // Empty state
  if (queue.length === 0 && !done) {
    return (
      <div className="container py-12 max-w-lg text-center animate-fade-in">
        <Mascot size={140} mood="happy" className="mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold mb-2">Vēl nav vārdu, ko atkārtot 📚</h1>
        <p className="text-muted-foreground mb-6">
          Pabeidz vismaz vienu nodarbību, lai šeit varētu atkārtot iemācītos vārdus.
        </p>
        <Button asChild size="lg" className="rounded-2xl h-14 px-8 btn-chunky font-extrabold">
          <Link to="/macibas">Uz mācībām</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container py-12 max-w-lg text-center animate-fade-in">
        <Mascot size={160} mood="cheer" className="mx-auto mb-3 animate-bounce-soft" />
        <h2 className="text-3xl font-extrabold mb-2">Lieliska atkārtošana! 🌟</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Tu pareizi atbildēji uz {correctCount} no {totalSteps} vārdiem.
        </p>
        <Card className="p-4 rounded-2xl mb-6 inline-flex gap-6">
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">XP</div>
            <div className="text-2xl font-extrabold text-primary">+{correctCount * 5}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">Pareizi</div>
            <div className="text-2xl font-extrabold text-success">{correctCount}/{totalSteps}</div>
          </div>
        </Card>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={restart} size="lg" className="rounded-2xl h-14 px-8 btn-chunky font-extrabold">
            Atkārtot vēlreiz
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl h-14 px-8 font-extrabold">
            <Link to="/">Uz sākumu</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!round) return null;

  const onSelect = (opt: string) => {
    if (feedback) return;
    setSelected(opt);
  };

  const onCheck = () => {
    if (feedback) {
      // continue
      setSelected(null);
      setFeedback(null);
      if (step + 1 >= queue.length) {
        touchStreak();
        setDone(true);
      } else {
        setStep((s) => s + 1);
      }
      return;
    }
    if (!selected) return;
    const correct = selected === round.word.en;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      addXp(5);
      recordCorrect(round.word.en);
      setCorrectCount((c) => c + 1);
    } else {
      recordMistake(round.word.en);
    }
  };

  return (
    <div className="container py-6 max-w-2xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 shrink-0"
          aria-label="Atpakaļ"
        >
          <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <Progress value={progressPct} className="h-4 rounded-full" />
        <div className="flex items-center gap-1 text-sm font-extrabold text-success shrink-0">
          <Sparkles className="h-4 w-4" />
          {correctCount}
        </div>
      </div>

      <div className="mb-3 text-center">
        <h1 className="text-xl font-extrabold flex items-center justify-center gap-2">
          <span className="text-2xl">🔁</span> Atkārtošana
        </h1>
        {focusWords.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Pievērsīsim uzmanību: {focusWords.map((w) => w.en).join(", ")}
          </p>
        )}
      </div>

      {/* Question card */}
      <Card
        key={step}
        className={cn(
          "rounded-3xl border-2 p-5 sm:p-8 mb-6 animate-fade-in",
          feedback === "wrong" && "animate-shake",
        )}
      >
        <h2 className="text-xl sm:text-2xl font-extrabold leading-snug mb-4 text-center">
          {round.prompt}
        </h2>
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 rounded-2xl bg-muted px-5 py-3">
            <span className="text-3xl">{round.word.emoji}</span>
            <span className="text-2xl font-extrabold">{round.word.lv}</span>
          </div>
        </div>

        <ChoiceGrid
          options={round.options}
          onSelect={onSelect}
          selected={selected}
          correctAnswer={round.word.en}
          locked={feedback !== null}
        />
      </Card>

      {/* Feedback / button */}
      <div
        className={cn(
          "rounded-3xl p-4 sm:p-5 transition-all",
          feedback === "correct" && "bg-success/15 border-2 border-success animate-fade-in",
          feedback === "wrong" && "bg-destructive/10 border-2 border-destructive animate-fade-in",
        )}
      >
        {feedback === "correct" && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
              <Check className="h-6 w-6 text-success-foreground" />
            </div>
            <div className="font-extrabold text-success text-lg">Lieliski!</div>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto rounded-full"
              onClick={() => speak(round.word.en)}
              aria-label="Atskaņot"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        )}
        {feedback === "wrong" && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center">
              <X className="h-6 w-6 text-destructive-foreground" />
            </div>
            <div>
              <div className="font-extrabold text-destructive text-lg">Gandrīz!</div>
              <div className="text-sm text-muted-foreground">
                Pareizā atbilde: <span className="font-bold text-foreground">{round.word.en}</span>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto rounded-full"
              onClick={() => speak(round.word.en)}
              aria-label="Atskaņot"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        )}
        <Button
          size="lg"
          disabled={!feedback && !selected}
          onClick={onCheck}
          className={cn(
            "w-full h-14 rounded-2xl text-lg font-extrabold btn-chunky",
            feedback === "correct" && "bg-success hover:bg-success/90",
            feedback === "wrong" && "bg-destructive hover:bg-destructive/90",
          )}
        >
          {feedback ? "Turpināt" : "Pārbaudīt"}
        </Button>
      </div>

      {/* Tiny mascot helper at bottom */}
      <div className="mt-6 flex justify-center opacity-90">
        <MascotBubble
          message={
            feedback === "correct"
              ? "Tev iet super!"
              : feedback === "wrong"
                ? "Nekas, mēģināsim vēlreiz!"
                : "Klausies un izvēlies pareizo angļu vārdu."
          }
          size={64}
        />
      </div>

      {/* Sneak peek of unit progress */}
      <div className="sr-only">
        Kopā nodarbības: {UNITS.length}
      </div>
    </div>
  );
};

export default Review;
