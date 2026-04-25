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
        let labelClass = "text-muted-foreground";
        if (locked && isCorrect) {
          stateClass = "border-success bg-success ring-4 ring-success/40 shadow-lg scale-[1.03]";
          labelClass = "text-success-foreground";
        } else if (locked && isSelected && !isCorrect) {
          stateClass = "border-destructive bg-destructive ring-4 ring-destructive/40 shadow-lg";
          labelClass = "text-destructive-foreground";
        } else if (isSelected) {
          stateClass = "border-primary bg-primary ring-4 ring-primary/40 shadow-lg scale-[1.04]";
          labelClass = "text-primary-foreground";
        }

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
            <span className={cn("text-sm font-semibold", labelClass)}>{opt.lv}</span>
          </button>
        );
      })}
    </div>
  );
};
