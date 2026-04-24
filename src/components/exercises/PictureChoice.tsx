import { cn } from "@/lib/utils";
import type { Word } from "@/data/lessons";

type Props = {
  options: Word[];
  onSelect: (word: Word) => void;
  selected: Word | null;
  correct: Word;
  locked: boolean;
};

export const PictureChoice = ({ options, onSelect, selected, correct, locked }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((opt) => {
        const isSelected = selected?.en === opt.en;
        const isCorrect = opt.en === correct.en;
        let stateClass = "border-border bg-card hover:border-primary/50";
        if (locked && isCorrect) stateClass = "border-success bg-success/15";
        else if (locked && isSelected && !isCorrect)
          stateClass = "border-destructive bg-destructive/15";

        return (
          <button
            key={opt.en}
            type="button"
            disabled={locked}
            onClick={() => onSelect(opt)}
            className={cn(
              "rounded-3xl border-2 p-4 sm:p-6 flex flex-col items-center justify-center gap-2",
              "transition-all hover:scale-[1.03] disabled:hover:scale-100 min-h-[120px]",
              stateClass,
            )}
          >
            <span className="text-5xl sm:text-6xl">{opt.emoji}</span>
            <span className="text-sm font-semibold text-muted-foreground">{opt.lv}</span>
          </button>
        );
      })}
    </div>
  );
};
