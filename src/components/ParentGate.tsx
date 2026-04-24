import { useMemo, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onUnlock: () => void;
};

/**
 * Simple "are you a parent?" gate — a basic math problem
 * that's hard enough for a young child to immediately bypass,
 * but trivial for an adult.
 */
export const ParentGate = ({ onUnlock }: Props) => {
  const challenge = useMemo(() => {
    const a = 4 + Math.floor(Math.random() * 6); // 4–9
    return { a, answer: a * a };
  }, []);

  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (parseInt(value, 10) === challenge.answer) {
      onUnlock();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div className="container py-12 max-w-md animate-fade-in">
      <Card className="rounded-3xl border-2 p-6 sm:p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center mb-4">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Tikai vecākiem 🔒</h1>
        <p className="text-muted-foreground mb-6">
          Lūdzu, atrisini šo uzdevumu, lai turpinātu.
        </p>

        <div className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wider">
          {challenge.a}<sup className="text-2xl">2</sup> = ?
        </div>

        <Input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Atbilde"
          className="h-14 text-2xl text-center font-extrabold rounded-2xl border-2 mb-3"
          autoFocus
        />

        {error && (
          <p className="text-destructive text-sm font-bold mb-3 animate-shake">
            Nepareizi. Mēģini vēlreiz.
          </p>
        )}

        <Button
          onClick={submit}
          disabled={!value}
          size="lg"
          className="w-full h-14 rounded-2xl text-lg font-extrabold btn-chunky gap-2"
        >
          <ShieldCheck className="h-5 w-5" />
          Turpināt
        </Button>
      </Card>
    </div>
  );
};
