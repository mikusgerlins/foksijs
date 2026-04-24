import { Link } from "react-router-dom";
import { Lock, Star, Play, Check, ArrowRight } from "lucide-react";
import { UNITS } from "@/data/lessons";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { MascotBubble } from "@/components/MascotBubble";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const colorClasses: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
};

const ringClasses: Record<string, string> = {
  primary: "ring-primary/40",
  secondary: "ring-secondary/40",
  accent: "ring-accent/50",
  success: "ring-success/40",
};

const LessonMap = () => {
  const { progress } = useProgress();

  const isUnlocked = (idx: number) => {
    if (idx === 0) return true;
    return !!progress.units[UNITS[idx - 1].id]?.completed;
  };

  const currentIdx = UNITS.findIndex((u) => !progress.units[u.id]?.completed);
  const completedCount = UNITS.filter((u) => progress.units[u.id]?.completed).length;
  const unlockedCount = UNITS.filter((_, i) => isUnlocked(i)).length;
  const overallPct = (completedCount / UNITS.length) * 100;

  const tipMessage = (() => {
    if (completedCount === 0) return "Čau! Izvēlies pirmo nodarbību un sākam!";
    if (completedCount === UNITS.length) return "Vau! Tu pabeidzi visas nodarbības! 🎉";
    const next = UNITS[currentIdx];
    return `${next.title} ir nākamais piedzīvojums! 🚀`;
  })();

  return (
    <div className="container py-6 sm:py-10 max-w-2xl">
      <header className="text-center mb-4 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">Mācību ceļš 🗺️</h1>
        <p className="text-muted-foreground">
          {unlockedCount} no {UNITS.length} nodarbībām atvērtas
        </p>
      </header>

      {/* Overall progress */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1.5">
          <span>Kopējais progress</span>
          <span>{completedCount} / {UNITS.length} pabeigtas</span>
        </div>
        <Progress value={overallPct} className="h-3 rounded-full" />
      </div>

      {/* Foksijs tip */}
      <div className="flex justify-center mb-8 animate-fade-in">
        <MascotBubble message={tipMessage} size={88} />
      </div>

      <ol className="relative flex flex-col items-center gap-2">
        {UNITS.map((unit, idx) => {
          const unlocked = isUnlocked(idx);
          const stars = progress.units[unit.id]?.stars ?? 0;
          const completed = !!progress.units[unit.id]?.completed;
          const isCurrent = idx === currentIdx;
          const offset = idx % 2 === 0 ? "sm:translate-x-[-60px]" : "sm:translate-x-[60px]";

          return (
            <li
              key={unit.id}
              className={cn("relative w-full flex flex-col items-center", offset)}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {idx > 0 && <div className="h-8 w-1 bg-border rounded-full" aria-hidden />}

              {unlocked ? (
                <Link
                  to={`/macibas/${unit.id}`}
                  aria-label={`${completed ? "Pabeigta nodarbība" : isCurrent ? "Turpināt nodarbību" : "Sākt nodarbību"}: ${unit.title}`}
                  className={cn(
                    "group relative flex flex-col gap-3 rounded-3xl px-5 py-5 w-full max-w-sm",
                    "border-2 bg-card hover:scale-[1.03] transition-transform shadow-card animate-pop",
                    isCurrent
                      ? cn("border-primary ring-4 scale-[1.02]", ringClasses[unit.color])
                      : "border-border",
                  )}
                >
                  {/* Status badge */}
                  <div className="absolute -top-3 left-5">
                    {completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success text-success-foreground text-xs font-extrabold px-2.5 py-1 shadow-soft">
                        <Check className="h-3 w-3" /> Pabeigts
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-xs font-extrabold px-2.5 py-1 shadow-soft animate-bounce-soft">
                        <Play className="h-3 w-3 fill-primary-foreground" /> Turpināt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground text-xs font-extrabold px-2.5 py-1">
                        Sākt
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full">
                    <div
                      className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-soft",
                        colorClasses[unit.color],
                      )}
                    >
                      {unit.emoji}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-extrabold text-lg leading-tight">{unit.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{unit.subtitle}</div>
                      <div className="flex gap-0.5 mt-1.5" aria-label={`${stars} no 3 zvaigznēm`}>
                        {[0, 1, 2].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4 transition-all",
                              i < stars
                                ? "fill-accent text-accent"
                                : "text-muted-foreground/25",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <Button
                      size="sm"
                      className="w-full rounded-2xl h-11 font-extrabold gap-1 btn-chunky"
                    >
                      {completed ? "Atkārtot" : "Sākt nodarbību"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </Link>
              ) : (
                <div className="relative flex flex-col gap-2 rounded-3xl px-5 py-5 w-full max-w-sm border-2 border-dashed border-border bg-muted/40">
                  <div className="absolute -top-3 left-5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted-foreground/20 text-muted-foreground text-xs font-extrabold px-2.5 py-1">
                      <Lock className="h-3 w-3" /> Bloķēts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 w-full opacity-70">
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-muted shrink-0">
                      <Lock className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-extrabold text-lg leading-tight">{unit.title}</div>
                      <div className="text-xs text-muted-foreground leading-snug mt-1">
                        Pabeidz "<span className="font-bold">{UNITS[idx - 1].title}</span>", lai atvērtu šo nodarbību.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default LessonMap;
