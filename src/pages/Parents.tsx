import { useMemo, useState } from "react";
import { Star, Trophy, Flame, BookOpen, AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProgress } from "@/hooks/useProgress";
import { UNITS, allWords } from "@/data/lessons";
import { ParentGate } from "@/components/ParentGate";
import { useProfiles, type Profile } from "@/contexts/ProfileContext";
import { cn } from "@/lib/utils";

const bgClasses: Record<Profile["color"], string> = {
  primary: "bg-primary/15",
  secondary: "bg-secondary/15",
  accent: "bg-accent/25",
  success: "bg-success/15",
};

type ChildSummary = {
  profile: Profile;
  xp: number;
  level: number;
  streak: number;
  completed: number;
  learnedCount: number;
  learnedWords: { lv: string; en: string; emoji: string }[];
  needsPractice: { lv: string; en: string; emoji: string; count: number }[];
  completedUnits: typeof UNITS;
  unitStars: Record<string, number>;
};

const ChildPanel = ({
  summary,
  onReset,
}: {
  summary: ChildSummary;
  onReset: () => void;
}) => {
  const [wordsOpen, setWordsOpen] = useState(false);

  return (
    <Card className="rounded-3xl border-2 p-5 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-card",
            bgClasses[summary.profile.color],
          )}
        >
          {summary.profile.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-extrabold truncate">{summary.profile.name}</div>
          <div className="text-xs text-muted-foreground">Līmenis {summary.level}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-2xl bg-primary/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
            <Star className="h-3.5 w-3.5" /> XP
          </div>
          <div className="text-2xl font-extrabold text-primary mt-1">{summary.xp}</div>
        </div>
        <div className="rounded-2xl bg-secondary/15 p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
            <Flame className="h-3.5 w-3.5" /> Sērija
          </div>
          <div className="text-2xl font-extrabold mt-1">{summary.streak} d.</div>
        </div>
        <div className="rounded-2xl bg-success/15 p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
            <Trophy className="h-3.5 w-3.5" /> Pabeigtas
          </div>
          <div className="text-2xl font-extrabold mt-1">{summary.completed}</div>
        </div>
        <div className="rounded-2xl bg-accent/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
            <BookOpen className="h-3.5 w-3.5" /> Vārdi
          </div>
          <div className="text-2xl font-extrabold mt-1">{summary.learnedCount}</div>
        </div>
      </div>

      {/* Completed units */}
      <div className="mb-4">
        <h3 className="text-sm font-extrabold mb-2 uppercase text-muted-foreground tracking-wide">
          Pabeigtās nodarbības
        </h3>
        {summary.completedUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Vēl nav pabeigtu nodarbību.</p>
        ) : (
          <ul className="space-y-1.5">
            {summary.completedUnits.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/50 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-lg">{u.emoji}</span>
                  <span className="font-bold truncate">{u.title}</span>
                </span>
                <span className="flex gap-0.5 shrink-0">
                  {[0, 1, 2].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < (summary.unitStars[u.id] || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Words learned */}
      <div className="mb-4">
        <button
          type="button"
          className="flex items-center justify-between w-full mb-2"
          onClick={() => setWordsOpen((v) => !v)}
        >
          <h3 className="text-sm font-extrabold uppercase text-muted-foreground tracking-wide">
            Iemācītie vārdi ({summary.learnedCount})
          </h3>
          {wordsOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {wordsOpen && (
          <div className="grid grid-cols-2 gap-1.5 animate-fade-in">
            {summary.learnedWords.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">Vēl nav apgūtu vārdu.</p>
            )}
            {summary.learnedWords.map((w) => (
              <div
                key={w.en}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 text-xs"
              >
                <span className="text-base">{w.emoji}</span>
                <div className="min-w-0">
                  <div className="font-bold truncate">{w.en}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{w.lv}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Needs practice */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="h-4 w-4 text-accent-foreground" />
          <h3 className="text-sm font-extrabold uppercase text-muted-foreground tracking-wide">
            Jāatkārto
          </h3>
        </div>
        {summary.needsPractice.length === 0 ? (
          <p className="text-sm text-muted-foreground">Lieliski! Nav vārdu, kas jāatkārto.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-1.5">
            {summary.needsPractice.map((w) => (
              <li
                key={w.en}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-accent/15 text-xs"
              >
                <span className="text-base">{w.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{w.en}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{w.lv}</div>
                </div>
                <span className="text-[10px] font-bold text-destructive">×{w.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reset */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full rounded-xl gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Atiestatīt {summary.profile.name}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Atiestatīt {summary.profile.name} progresu?</AlertDialogTitle>
            <AlertDialogDescription>
              Tas izdzēsīs visus XP, sērijas un pabeigtās nodarbības šim profilam. Šo darbību nevar atsaukt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Atcelt</AlertDialogCancel>
            <AlertDialogAction onClick={onReset} className="rounded-xl bg-destructive hover:bg-destructive/90">
              Jā, atiestatīt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const Parents = () => {
  const { readProfileProgress } = useProgress();
  const { profiles } = useProfiles();
  const [unlocked, setUnlocked] = useState(false);
  // bump key to force re-read after a reset
  const [refreshKey, setRefreshKey] = useState(0);

  const summaries = useMemo<ChildSummary[]>(() => {
    return profiles.map((profile) => {
      const p = readProfileProgress(profile.id);
      const completedUnits = UNITS.filter((u) => p.units[u.id]?.completed);
      const unitStars: Record<string, number> = {};
      Object.entries(p.units).forEach(([id, v]) => {
        unitStars[id] = v.stars;
      });
      const learnedWords = allWords().filter((w) => p.learnedWords.includes(w.en));
      const needsPractice = Object.entries(p.mistakes)
        .map(([en, count]) => {
          const w = allWords().find((ww) => ww.en === en);
          return w ? { ...w, count } : null;
        })
        .filter(Boolean)
        .sort((a, b) => (b!.count - a!.count))
        .slice(0, 6) as ChildSummary["needsPractice"];

      return {
        profile,
        xp: p.xp,
        level: Math.floor(p.xp / 200) + 1,
        streak: p.streak,
        completed: completedUnits.length,
        learnedCount: p.learnedWords.length,
        learnedWords,
        needsPractice,
        completedUnits,
        unitStars,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, refreshKey]);

  const resetProfile = (id: string) => {
    try {
      localStorage.removeItem(`rudis-progress-v2-${id}`);
    } catch {
      // ignore
    }
    setRefreshKey((k) => k + 1);
  };

  if (!unlocked) {
    return <ParentGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="container py-8 sm:py-12 max-w-5xl">
      <header className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Vecākiem 👨‍👩‍👧</h1>
        <p className="text-muted-foreground text-lg">
          Katra bērna progress un sasniegumi.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {summaries.map((s) => (
          <ChildPanel
            key={s.profile.id}
            summary={s}
            onReset={() => resetProfile(s.profile.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Parents;
