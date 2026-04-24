import { Link } from "react-router-dom";
import { Star, Trophy, Flame, CheckCircle2, Volume2, Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";
import { UNITS, allWords } from "@/data/lessons";
import { speak } from "@/lib/speak";
import { useMemo } from "react";
import { MascotBubble } from "@/components/MascotBubble";

const StatCard = ({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Star;
  value: string | number;
  label: string;
  tone: "primary" | "secondary" | "accent" | "success";
}) => {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/15 text-secondary",
    accent: "bg-accent/25 text-accent-foreground",
    success: "bg-success/15 text-success",
  };
  return (
    <Card className="p-4 sm:p-5 flex items-center gap-3 rounded-2xl border-2 animate-fade-in hover:scale-[1.02] transition-transform">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground font-semibold mt-1">{label}</div>
      </div>
    </Card>
  );
};

const Home = () => {
  const { progress, level } = useProgress();

  const nextUnit = useMemo(() => {
    return UNITS.find((u) => !progress.units[u.id]?.completed) ?? UNITS[0];
  }, [progress.units]);

  const completedCount = Object.values(progress.units).filter((u) => u.completed).length;
  const isReturning = progress.xp > 0;

  const welcomeMessage = (() => {
    if (!isReturning) return "Čau! Es esmu Foksijs. Mācīsimies angļu valodu kopā!";
    if (completedCount === 0) return `Sveiks! Tu jau nopelnīji ${progress.xp} XP. Turpinām!`;
    if (completedCount === UNITS.length) return "Tu esi īsts angļu valodas zinātājs! 🌟";
    return `${nextUnit.title} ir nākamais piedzīvojums!`;
  })();

  const wordOfDay = useMemo(() => {
    const words = allWords();
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return words[day % words.length];
  }, []);

  return (
    <div className="container py-6 sm:py-12 max-w-4xl">
      {/* Welcome hero with speech bubble */}
      <section className="grid sm:grid-cols-[auto_1fr] gap-6 items-center mb-8">
        <div className="flex justify-center sm:justify-start">
          <MascotBubble message={welcomeMessage} size={140} />
        </div>
        <div className="text-center sm:text-left animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            {isReturning ? "Ar atgriešanos!" : "Sveiks!"} 🦊
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {isReturning
              ? "Ejam tālāk piedzīvojumā!"
              : "Mācīsimies angļu valodu kopā. Tas būs jautri."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-lg h-14 px-8 rounded-2xl btn-chunky font-extrabold">
              <Link to={`/macibas/${nextUnit.id}`}>
                {isReturning ? "Turpināt mācīties! 🚀" : "Sākt mācīties! 🚀"}
              </Link>
            </Button>
            {progress.learnedWords.length >= 4 && (
              <Button asChild size="lg" variant="outline" className="text-lg h-14 px-6 rounded-2xl font-extrabold gap-2">
                <Link to="/atkartot">
                  <Repeat className="h-5 w-5" />
                  Atkārtot vārdus
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard icon={Star} value={progress.xp} label="XP punkti" tone="primary" />
        <StatCard icon={Trophy} value={level} label="Līmenis" tone="accent" />
        <StatCard icon={Flame} value={progress.streak} label="Dienu sērija" tone="secondary" />
        <StatCard icon={CheckCircle2} value={completedCount} label="Pabeigtas" tone="success" />
      </section>

      {/* Word of the day */}
      <Card className="p-6 rounded-3xl border-2 bg-gradient-to-br from-accent/30 to-primary/10 animate-scale-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Šodienas vārds
            </div>
            <div className="mt-1 flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl">{wordOfDay.emoji}</span>
              <span className="text-3xl font-extrabold">{wordOfDay.en}</span>
              <span className="text-xl text-muted-foreground">— {wordOfDay.lv}</span>
            </div>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="rounded-2xl h-14 w-14 p-0 shadow-soft hover:scale-110 transition-transform"
            onClick={() => speak(wordOfDay.en)}
            aria-label="Klausīties"
          >
            <Volume2 className="h-6 w-6" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Home;
