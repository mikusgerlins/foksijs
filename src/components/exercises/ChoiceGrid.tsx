import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  options: string[];
  onSelect: (option: string) => void;
  selected: string | null;
  correctAnswer: string;
  locked: boolean;
  big?: boolean;
};

export const ChoiceGrid = ({
  options,
  onSelect,
  selected,
  correctAnswer,
  locked,
  big,
}: Props) => {
  return (
    <div className={cn("grid gap-3", options.length > 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
      {options.map((opt) => {
        const isSelected = selected === opt;
        const isCorrect = opt === correctAnswer;
        let stateClass = "border-border bg-card hover:bg-muted hover:border-primary/50";
        if (locked && isCorrect) stateClass = "border-success bg-success/15 text-success-foreground";
        else if (locked && isSelected && !isCorrect)
          stateClass = "border-destructive bg-destructive/15 text-destructive-foreground";
        else if (isSelected)
          stateClass = "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 scale-[1.02]";

        return (
          <Button
            key={opt}
            type="button"
            variant="outline"
            disabled={locked}
            onClick={() => onSelect(opt)}
            className={cn(
              "h-auto min-h-[64px] py-4 px-5 rounded-2xl border-2 text-base sm:text-lg font-bold whitespace-normal",
              "transition-all justify-center",
              stateClass,
              big && "text-2xl",
            )}
          >
            {opt}
          </Button>
        );
      })}
    </div>
  );
};
