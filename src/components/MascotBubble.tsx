import { cn } from "@/lib/utils";
import { Mascot } from "./Mascot";

type Props = {
  message: string;
  mood?: "happy" | "cheer" | "wave" | "sleepy";
  size?: number;
  side?: "left" | "right";
  className?: string;
};

/**
 * Foksijs with a friendly speech bubble. Bubble grows from the side
 * with a subtle pop animation.
 */
export const MascotBubble = ({
  message,
  mood = "happy",
  size = 96,
  side = "right",
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "flex items-end gap-3",
        side === "left" && "flex-row-reverse",
        className,
      )}
    >
      <div className="shrink-0 animate-bounce-soft">
        <Mascot size={size} mood={mood} />
      </div>
      <div
        className={cn(
          "relative rounded-3xl bg-card border-2 border-border px-4 py-3 shadow-card",
          "max-w-[260px] sm:max-w-xs animate-pop",
        )}
        role="status"
      >
        <p className="text-sm sm:text-base font-bold leading-snug">{message}</p>
        {/* tail */}
        <span
          aria-hidden
          className={cn(
            "absolute bottom-4 h-4 w-4 rotate-45 bg-card border-border",
            side === "right"
              ? "-left-2 border-l-2 border-b-2"
              : "-right-2 border-r-2 border-t-2",
          )}
        />
      </div>
    </div>
  );
};
