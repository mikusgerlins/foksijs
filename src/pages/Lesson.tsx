import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Volume2, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { findUnit } from "@/data/lessons";
import { generateExercises, normalizeAnswer, type Exercise } from "@/lib/exercises";
import { speak } from "@/lib/speak";
import { useProgress } from "@/hooks/useProgress";
import { ChoiceGrid } from "@/components/exercises/ChoiceGrid";
import { PictureChoice } from "@/components/exercises/PictureChoice";
import { Matching } from "@/components/exercises/Matching";
import { Mascot } from "@/components/Mascot";
import { Confetti } from "@/components/Confetti";
import { cn } from "@/lib/utils";

const MAX_HEARTS = 3;
const ENCOURAGE_CORRECT = ["Lieliski!", "Tu to vari!", "Super!", "Brīnišķīgi!", "Malacis!"];

const Lesson = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const unit = unitId ? findUnit(unitId) : undefined;

  const { addXp, touchStreak, recordCorrect, recordMistake, completeUnit } = useProgress();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [step, setStep] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ en: string; lv: string; emoji: string } | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (unit) setExercises(generateExercises(unit));
  }, [unit]);

  const ex = exercises[step];

  // auto-play listening exercises
  useEffect(() => {
    if (ex?.type === "listening") {
      const t = setTimeout(() => speak(ex.word.en), 300);
      return () => clearTimeout(t);
    }
  }, [ex]);

  const totalSteps = exercises.length;
  const progressPct = totalSteps ? ((step) / totalSteps) * 100 : 0;

  const encouragement = useMemo(
    () => ENCOURAGE_CORRECT[Math.floor(Math.random() * ENCOURAGE_CORRECT.length)],
    [step],
  );

  if (!unit) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-extrabold mb-4">Nodarbība nav atrasta</h1>
        <Button asChild><Link to="/macibas">Atpakaļ uz mācībām</Link></Button>
      </div>
    );
  }

  const handleAnswer = (correct: boolean, wordEn: string) => {
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      addXp(10);
      recordCorrect(wordEn);
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setMistakes((m) => m + 1);
      recordMistake(wordEn);
    }
  };

  const handleContinue = () => {
    setSelected(null);
    setSelectedWord(null);
    setTypedAnswer("");
    setFeedback(null);

    if (step + 1 >= exercises.length) {
      // finish lesson
      addXp(50);
      touchStreak();
      completeUnit(unit.id, mistakes);
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const restartLesson = () => {
    setStep(0);
    setHearts(MAX_HEARTS);
    setMistakes(0);
    setSelected(null);
    setSelectedWord(null);
    setTypedAnswer("");
    setFeedback(null);
    setExercises(generateExercises(unit));
  };

  // out of hearts -> gentle reset
  if (hearts === 0 && !done) {
    return (
      <div className="container py-12 max-w-lg text-center animate-fade-in">
        <Mascot size={140} mood="sleepy" className="mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold mb-2">Mazliet atpūsīsimies! 💛</h2>
        <p className="text-muted-foreground mb-6">
          Nekas slikts! Mēģināsim vēlreiz — tu vari!
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" onClick={restartLesson} className="rounded-2xl h-14 px-8 btn-chunky font-extrabold">
            Mēģināt vēlreiz
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/macibas")} className="rounded-2xl h-14 px-8 font-bold">
            Uz mācībām
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    const correctAnswers = exercises.length - mistakes;
    const xpEarned = Math.max(0, correctAnswers * 10) + 50;
    return (
      <div className="container py-12 max-w-lg text-center animate-fade-in relative">
        <Confetti />
        <Mascot size={180} mood="cheer" className="mx-auto mb-4 animate-bounce-soft" />
        <h2 className="text-3xl font-extrabold mb-2">Apsveicam! 🎉</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Tu pabeidzi nodarbību "{unit.title}"
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative">
              <Star
                className={cn(
                  "h-14 w-14",
                  i < stars
                    ? "fill-accent text-accent opacity-0 animate-star-pop"
                    : "text-muted-foreground/25",
                )}
                style={{ animationDelay: `${300 + i * 200}ms` }}
              />
              {i < stars && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-sparkle"
                  style={{ animationDelay: `${600 + i * 200}ms` }}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-4 rounded-2xl mb-6 inline-flex gap-6">
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">XP</div>
            <div className="text-2xl font-extrabold text-primary">+{xpEarned}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">Kļūdas</div>
            <div className="text-2xl font-extrabold">{mistakes}</div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-2xl h-14 px-8 btn-chunky font-extrabold">
            <Link to="/macibas">Turpināt</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl h-14 px-6 font-extrabold">
            <Link to="/atkartot">Atkārtot vārdus</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!ex) return null;

  const renderExercise = () => {
    switch (ex.type) {
      case "multiple-choice":
      case "listening":
        return (
          <ChoiceGrid
            options={ex.options}
            onSelect={(o) => setSelected(o)}
            selected={selected}
            correctAnswer={ex.word.en}
            locked={feedback !== null}
          />
        );
      case "translation":
        return (
          <ChoiceGrid
            options={ex.options}
            onSelect={(o) => setSelected(o)}
            selected={selected}
            correctAnswer={ex.word.lv}
            locked={feedback !== null}
          />
        );
      case "picture":
        return (
          <PictureChoice
            options={ex.options}
            onSelect={(w) => setSelectedWord(w)}
            selected={selectedWord as never}
            correct={ex.word}
            locked={feedback !== null}
          />
        );
      case "typing":
        return (
          <div className="flex flex-col gap-3">
            <Input
              autoFocus
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Raksti šeit..."
              disabled={feedback !== null}
              className="h-16 rounded-2xl text-2xl text-center font-bold border-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && typedAnswer.trim() && !feedback) {
                  const correct = normalizeAnswer(typedAnswer) === normalizeAnswer(ex.word.en);
                  handleAnswer(correct, ex.word.en);
                }
              }}
            />
            {feedback === "wrong" && (
              <p className="text-center text-sm text-muted-foreground">
                Pareizā atbilde: <span className="font-bold text-foreground">{ex.word.en}</span>
              </p>
            )}
          </div>
        );
      case "matching":
        return (
          <Matching
            pairs={ex.pairs}
            onComplete={(m) => {
              addXp(10 * ex.pairs.length);
              setMistakes((prev) => prev + m);
              if (m > 0) setHearts((h) => Math.max(0, h - Math.min(m, 1)));
              ex.pairs.forEach((p) => recordCorrect(p.en));
              setFeedback("correct");
            }}
          />
        );
    }
  };

  const canCheck = (() => {
    if (feedback) return true;
    switch (ex.type) {
      case "multiple-choice":
      case "listening":
      case "translation":
        return selected !== null;
      case "picture":
        return selectedWord !== null;
      case "typing":
        return typedAnswer.trim().length > 0;
      case "matching":
        return false; // self-completing
    }
  })();

  const onCheck = () => {
    if (feedback) {
      handleContinue();
      return;
    }
    switch (ex.type) {
      case "multiple-choice":
      case "listening":
        handleAnswer(selected === ex.word.en, ex.word.en);
        break;
      case "translation":
        handleAnswer(selected === ex.word.lv, ex.word.en);
        break;
      case "picture":
        handleAnswer(selectedWord?.en === ex.word.en, ex.word.en);
        break;
      case "typing":
        handleAnswer(normalizeAnswer(typedAnswer) === normalizeAnswer(ex.word.en), ex.word.en);
        break;
    }
  };

  return (
    <div className="container py-6 max-w-2xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 shrink-0"
          onClick={() => navigate("/macibas")}
          aria-label="Atpakaļ"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Progress value={progressPct} className="h-4 rounded-full" />
        <div className="flex items-center gap-1 shrink-0">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "h-5 w-5 transition-all",
                i < hearts ? "fill-destructive text-destructive" : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>

      {/* Exercise card */}
      <Card
        key={step}
        className={cn(
          "rounded-3xl border-2 p-5 sm:p-8 mb-6 animate-fade-in",
          feedback === "wrong" && "animate-shake",
        )}
      >
        <div className="flex items-start gap-3 mb-6">
          <span className="text-3xl">{unit.emoji}</span>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">{ex.prompt}</h2>
        </div>

        {ex.type === "listening" && (
          <div className="flex justify-center mb-6">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={() => speak(ex.word.en)}
              className="h-24 w-24 rounded-full shadow-soft"
              aria-label="Atskaņot vēlreiz"
            >
              <Volume2 className="!h-10 !w-10" />
            </Button>
          </div>
        )}

        {ex.type === "translation" && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 rounded-2xl bg-muted px-6 py-4">
              <span className="text-3xl">{ex.word.emoji}</span>
              <span className="text-3xl font-extrabold">{ex.word.en}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => speak(ex.word.en)}
                aria-label="Atskaņot"
                className="rounded-full"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {ex.type === "typing" && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 rounded-2xl bg-muted px-6 py-4">
              <span className="text-3xl">{ex.word.emoji}</span>
              <span className="text-3xl font-extrabold">{ex.word.lv}</span>
            </div>
          </div>
        )}

        {renderExercise()}
      </Card>

      {/* Feedback / check button */}
      <div
        className={cn(
          "rounded-3xl p-4 sm:p-5 transition-all",
          feedback === "correct" && "bg-success/15 border-2 border-success animate-fade-in",
          feedback === "wrong" && "bg-destructive/10 border-2 border-destructive animate-fade-in",
          !feedback && "bg-transparent",
        )}
      >
        {feedback === "correct" && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
              <Check className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <div className="font-extrabold text-success text-lg">{encouragement}</div>
            </div>
          </div>
        )}
        {feedback === "wrong" && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center">
              <X className="h-6 w-6 text-destructive-foreground" />
            </div>
            <div>
              <div className="font-extrabold text-destructive text-lg">Gandrīz!</div>
              {ex.type !== "matching" && "word" in ex && (
                <div className="text-sm text-muted-foreground">
                  Pareizā atbilde: <span className="font-bold text-foreground">
                    {ex.type === "translation" ? ex.word.lv : ex.word.en}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          size="lg"
          disabled={!canCheck}
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
    </div>
  );
};

export default Lesson;
