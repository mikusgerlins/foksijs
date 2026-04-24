import { useMemo, useState, useEffect } from "react";
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

  useEffect(() => {
    if (selectedLv && selectedEn) {
      const pair = pairs.find((p) => p.lv === selectedLv);
      if (pair && pair.en === selectedEn) {
        setMatched((prev) => {
          const next = new Set(prev);
          next.add(selectedLv);
          if (next.size === pairs.length) {
            setTimeout(() => onComplete(mistakes), 400);
          }
          return next;
        });
        setSelectedLv(null);
        setSelectedEn(null);
      } else {
        setWrongFlash({ lv: selectedLv, en: selectedEn });
        setMistakes((m) => m + 1);
        setTimeout(() => {
          setWrongFlash(null);
          setSelectedLv(null);
          setSelectedEn(null);
        }, 600);
      }
    }
  }, [selectedLv, selectedEn, pairs, mistakes, onComplete]);

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
      isMatched && "bg-success/20 border-success text-success-foreground opacity-60 cursor-default",
      !isMatched && !isSelected && "bg-card border-border hover:border-primary/50",
      isSelected && "bg-primary/15 border-primary scale-105",
      isWrong && "bg-destructive/20 border-destructive animate-shake",
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex flex-col gap-2">
        {left.map((lv) => (
          <button
            key={lv}
            type="button"
            disabled={matched.has(lv)}
            onClick={() => setSelectedLv(lv)}
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
              disabled={isMatched}
              onClick={() => setSelectedEn(en)}
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
