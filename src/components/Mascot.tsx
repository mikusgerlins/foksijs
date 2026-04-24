import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  mood?: "happy" | "cheer" | "wave" | "sleepy";
  className?: string;
};

/**
 * Foksijs — original friendly fox mascot, drawn in SVG.
 * No external dependencies, fully themeable via design tokens.
 */
export const Mascot = ({ size = 160, mood = "happy", className }: Props) => {
  const eyesClosed = mood === "sleepy";
  const cheering = mood === "cheer";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("select-none", className)}
      role="img"
      aria-label="Foksijs the fox mascot"
    >
      {/* arms (cheer pose) */}
      {cheering && (
        <>
          <ellipse cx="35" cy="100" rx="14" ry="22" fill="hsl(var(--primary))" transform="rotate(-30 35 100)" />
          <ellipse cx="165" cy="100" rx="14" ry="22" fill="hsl(var(--primary))" transform="rotate(30 165 100)" />
        </>
      )}

      {/* body */}
      <ellipse cx="100" cy="155" rx="50" ry="35" fill="hsl(var(--primary))" />
      <ellipse cx="100" cy="160" rx="34" ry="22" fill="hsl(36 100% 95%)" />

      {/* tail */}
      <path
        d="M 145 160 Q 185 140 175 105 Q 168 130 150 135 Z"
        fill="hsl(var(--primary))"
      />
      <path d="M 170 115 Q 175 122 168 130 Z" fill="hsl(36 100% 95%)" />

      {/* head */}
      <circle cx="100" cy="90" r="55" fill="hsl(var(--primary))" />

      {/* ears */}
      <path d="M 55 55 L 45 15 L 80 45 Z" fill="hsl(var(--primary))" />
      <path d="M 145 55 L 155 15 L 120 45 Z" fill="hsl(var(--primary))" />
      <path d="M 58 50 L 55 28 L 72 45 Z" fill="hsl(20 50% 25%)" />
      <path d="M 142 50 L 145 28 L 128 45 Z" fill="hsl(20 50% 25%)" />

      {/* face cream */}
      <path
        d="M 60 95 Q 100 145 140 95 Q 130 115 100 118 Q 70 115 60 95 Z"
        fill="hsl(36 100% 95%)"
      />
      <ellipse cx="100" cy="115" rx="22" ry="14" fill="hsl(36 100% 97%)" />

      {/* cheeks */}
      <circle cx="65" cy="105" r="7" fill="hsl(0 80% 75% / 0.55)" />
      <circle cx="135" cy="105" r="7" fill="hsl(0 80% 75% / 0.55)" />

      {/* eyes */}
      {eyesClosed ? (
        <>
          <path d="M 78 88 Q 85 94 92 88" stroke="hsl(20 50% 20%)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 108 88 Q 115 94 122 88" stroke="hsl(20 50% 20%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="85" cy="88" r="7" fill="hsl(20 50% 15%)" />
          <circle cx="115" cy="88" r="7" fill="hsl(20 50% 15%)" />
          <circle cx="87" cy="86" r="2.5" fill="white" />
          <circle cx="117" cy="86" r="2.5" fill="white" />
        </>
      )}

      {/* nose */}
      <ellipse cx="100" cy="105" rx="6" ry="4.5" fill="hsl(20 50% 18%)" />

      {/* mouth */}
      {cheering ? (
        <path
          d="M 88 115 Q 100 130 112 115 Q 100 122 88 115 Z"
          fill="hsl(0 70% 50%)"
        />
      ) : (
        <path
          d="M 92 115 Q 100 122 108 115"
          stroke="hsl(20 50% 20%)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};
