import { useMemo, useRef, useState, useEffect } from "react";
import type { Word } from "@/data/lessons";
import { cn } from "@/lib/utils";

type Props = {
  pairs: Word[];
  onComplete: (mistakes: number) => void;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const Matching = ({ pairs, onComplete }: Props) => {
  const left = useMemo(() => shuffle(pairs.map((p) => p.lv)), [pairs]);
  const right = useMemo(() => shuffle(pairs.map((p) => p.en)), [pairs]);

  const [selectedLv, setSelectedLv] = useState<string | null>(null);
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set()); // lv values matched
  const [wrongFlash, setWrongFlash] = useState<{ lv: string; en: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function choose(lv: string | null, en: string | null) {
    setSelectedLv(lv);
    setSelectedEn(en);
    if (!lv || !en) return;
    if (pairs.some(pair => pair.lv === lv && pair.en === en)) {
      const next = new Set(matched).add(lv);
      setMatched(next);
      setSelectedLv(null);
      setSelectedEn(null);
      if (next.size === pairs.length) onComplete(mistakes);
    } else {
      setWrongFlash({ lv, en });
      setMistakes(m => m + 1);
      timer.current = window.setTimeout(() => {
        setWrongFlash(null);
        setSelectedLv(null);
        setSelectedEn(null);
      }, 600);
    }
  }

  const cellClass = (val: string, type: "lv" | "en") => {
    const isMatched =
      type === "lv" ? matched.has(val) : pairs.some((p) => p.en === val && matched.has(p.lv));
    const isSelected = (type === "lv" ? selectedLv : selectedEn) === val;
    const isWrong =
      wrongFlash &&
      ((type === "lv" && wrongFlash.lv === val) ||
        (type === "en" && wrongFlash.en === val));

    return cn(
      "rounded-2xl border-2 px-4 py-4 text-base sm:text-lg font-bold transition-all min-h-[60px]",
      isMatched && "bg-success border-success text-success-foreground opacity-70 cursor-default ring-2 ring-success/40",
      !isMatched && !isSelected && "bg-card border-border hover:border-primary/50",
      isSelected && "bg-primary text-primary-foreground border-primary ring-4 ring-primary/40 shadow-lg scale-105",
      isWrong && "bg-destructive text-destructive-foreground border-destructive ring-4 ring-destructive/40 animate-shake",
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex flex-col gap-2">
        {left.map((lv) => (
          <button
            key={lv}
            type="button"
            disabled={Boolean(wrongFlash) || matched.has(lv)}
            onClick={() => choose(lv, selectedEn)}
            className={cellClass(lv, "lv")}
          >
            {lv}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {right.map((en) => {
          const isMatched = pairs.some((p) => p.en === en && matched.has(p.lv));
          return (
            <button
              key={en}
              type="button"
              disabled={Boolean(wrongFlash) || isMatched}
              onClick={() => choose(selectedLv, en)}
              className={cellClass(en, "en")}
            >
              {en}
            </button>
          );
        })}
      </div>
    </div>
  );
};
