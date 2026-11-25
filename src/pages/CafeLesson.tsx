import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Flame, Home, Mic, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import lesson from "@/features/cafe/cafe_01.json";
import { cafePicture, useCafeMedia } from "@/features/cafe/useCafeMedia";

type Step = 0 | 1 | 2;
const prompts = [lesson.listen.prompt, lesson.repeat.prompt, lesson.order.prompt];
const mainButton = "h-auto min-h-14 rounded-2xl px-6 py-3 text-lg font-extrabold bg-orange-700 hover:bg-orange-800 text-white shadow-card";
const minorButton = "h-auto min-h-12 rounded-2xl border-2 px-4 py-2 whitespace-normal font-bold";
const panel = "rounded-3xl border-2 bg-card p-4 shadow-card sm:p-6";

function AudioButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" className={minorButton} onClick={onClick}>
      <Volume2 aria-hidden="true" />{children}
    </Button>
  );
}

function SpeakingPractice({ media, advance }: {
  media: ReturnType<typeof useCafeMedia>; advance: () => void;
}) {
  const { mic, startRecording, stopRecording, playRecording } = media;
  const denied = mic === "denied";
  const failed = mic === "unavailable";
  const recording = mic === "recording";
  return (
    <section className="space-y-3 rounded-2xl bg-muted/70 p-4" aria-label="Runāšanas vingrinājums">
      <p aria-live="polite" className="font-semibold">
        {denied ? "Mikrofons ir izslēgts. Vari atbildēt skaļi bez ieraksta."
          : failed ? "Ieraksts neizdevās. Vari mēģināt vēlreiz vai atbildēt skaļi."
          : recording ? "Runā tagad! Kad pabeidz, apturi ierakstu."
          : mic === "requesting" ? "Gaida mikrofona atļauju…"
          : mic === "ready" ? "Ieraksts gatavs. Paklausies, kā tev sanāca!"
          : "Pasaki to skaļi! Ja vēlies, ieraksti savu balsi."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className={minorButton} disabled={mic === "requesting"}
          onClick={recording ? stopRecording : startRecording}>
          {recording ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
          {recording ? "Apturēt ierakstu" : mic === "ready" ? "Ierakstīt vēlreiz" : "Ierakstīt"}
        </Button>
        {mic === "ready" && (
          <Button type="button" variant="outline" className={minorButton} onClick={playRecording}>
            <Play aria-hidden="true" /> Klausīties savu balsi
          </Button>
        )}
        {(denied || failed) && (
          <Button type="button" variant="ghost" className="min-h-12 rounded-2xl font-bold" onClick={advance}>
            Izlaist <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </section>
  );
}

export default function CafeLesson() {
  const { progress, setCafeStep, setCafeWaterChosen, finishCafe } = useProgress();
  const step: Step | null = progress.cafeStep ?? null;
  const [finished, setFinished] = useState(false);
  const [mistake, setMistake] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const saving = useRef(false);
  const mounted = useRef(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const media = useCafeMedia();
  const { playPrompt, reset } = media;
  const firstPrompt = useRef(step === null ? [lesson.welcome] : prompts[step]);

  useEffect(() => {
    mounted.current = true;
    playPrompt(...firstPrompt.current);
    return () => { mounted.current = false; };
  }, [playPrompt]);

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [step, finished]);

  useEffect(() => {
    if (!finished) return;
    const timer = window.setTimeout(() => setCanReplay(true), 500);
    return () => window.clearTimeout(timer);
  }, [finished]);

  const checkpoint = async (write: () => Promise<boolean>) => {
    if (saving.current) return false;
    saving.current = true;
    setSaveFailed(false);
    const saved = await write();
    saving.current = false;
    if (!mounted.current) return false;
    setSaveFailed(!saved);
    return saved;
  };

  const goTo = async (next: Step) => {
    if (!(await checkpoint(() => setCafeStep(next)))) return;
    reset();
    setFinished(false);
    setCanReplay(false);
    setMistake(null);
    setRevealed(false);
    playPrompt(...prompts[next]);
  };

  const complete = async () => {
    if (!(await checkpoint(finishCafe))) return;
    reset();
    setFinished(true);
    playPrompt(lesson.finish);
  };

  const choose = async (id: string) => {
    if (saving.current || progress.cafeWaterChosen) return;
    if (id === lesson.listen.target) {
      if (!(await checkpoint(setCafeWaterChosen))) return;
      setMistake(null);
      playPrompt(lesson.listen.correct);
    } else {
      setMistake(id);
      playPrompt(lesson.listen.retry, lesson.listen.prompt[1]);
    }
  };

  const revealModels = () => {
    setRevealed(true);
    playPrompt(lesson.order.models[0].clip);
  };

  const title = finished ? "Nodarbība pabeigta!" : step === 0 ? lesson.listen.instruction
    : step === 1 ? lesson.repeat.instruction : step === 2 ? lesson.order.instruction : lesson.title;
  const streak = progress.streak;
  const dayLabel = streak % 10 === 1 && streak % 100 !== 11 ? "diena" : "dienas";

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 px-4 py-5 sm:space-y-5 sm:py-8" lang="lv">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="inline-flex min-h-11 items-center gap-1 rounded-lg pr-2 font-bold">
            <ArrowLeft aria-hidden="true" size={18} /> Uz sākumu
          </Link>
          {step !== null && !finished && <span className="text-sm font-bold">{step + 1}. solis no 3</span>}
        </div>
        {step !== null && !finished && (
          <div aria-hidden="true" className="flex gap-1.5">
            {[0, 1, 2].map(index => <span key={index} className={cn("h-2 flex-1 rounded-full", index <= step ? "bg-orange-600" : "bg-border")} />)}
          </div>
        )}
      </header>

      {step === null && !finished && (
        <img className="aspect-[2/1] w-full rounded-3xl object-cover" src={cafePicture(lesson.cover)}
          alt="Foksijs sagaida tevi kafejnīcā" />
      )}
      <div className="space-y-1.5">
        <p className="text-sm font-extrabold text-muted-foreground">
          {step === null && !finished ? `${lesson.level}. līmenis` : lesson.title}
        </p>
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-extrabold leading-tight outline-none sm:text-4xl">{title}</h1>
      </div>

      {finished ? (
        <>
          <div className={cn(panel, "flex items-center gap-4")}>
            <div className="relative shrink-0">
              <img src={cafePicture(lesson.host)} alt="" className="size-20 rounded-full object-cover" />
              <CheckCircle2 className="absolute -bottom-1 -right-1 size-7 rounded-full bg-card text-green-700" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold">Tu šodien vingrinājies runāt angliski.</p>
              <p className="flex items-center gap-1.5 font-bold"><Flame aria-hidden="true" size={18} className="text-orange-700" />
                Dienu sērija · {streak} {dayLabel}
              </p>
            </div>
          </div>
          <AudioButton onClick={() => playPrompt(lesson.finish)}>Atkārtot audio</AudioButton>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" className={mainButton} disabled={!canReplay} onClick={() => goTo(0)}>
              <RotateCcw aria-hidden="true" /> Spēlēt vēlreiz
            </Button>
            <Button asChild variant="outline" className={minorButton}>
              <Link to="/"><Home aria-hidden="true" /> Uz sākumu</Link>
            </Button>
          </div>
        </>
      ) : step === null ? (
        <>
          <p className="text-lg">{lesson.summary}</p>
          <AudioButton onClick={() => playPrompt(lesson.welcome)}>Klausīties ievadu</AudioButton>
          <Button type="button" className={cn(mainButton, "w-full")} onClick={() => goTo(0)}>
            Sākt <ArrowRight aria-hidden="true" />
          </Button>
        </>
      ) : (
        <>
          {step === 0 && (
            <>
              <div className="flex items-center gap-3">
                <img src={cafePicture(lesson.host)} alt="" className="size-14 rounded-full object-cover" />
                <AudioButton onClick={() => playPrompt(...lesson.listen.prompt)}>Atkārtot audio</AudioButton>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Izvēlies dzērienu">
                {lesson.listen.choices.map(drink => {
                  const correct = progress.cafeWaterChosen && drink.id === lesson.listen.target;
                  return (
                    <button type="button" key={drink.id} disabled={progress.cafeWaterChosen} onClick={() => choose(drink.id)}
                      className={cn("min-w-0 rounded-2xl border-[3px] bg-card p-1 shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                        correct ? "border-green-700 bg-green-50" : mistake === drink.id ? "border-orange-600" : "border-border")}>
                      <img src={cafePicture(drink.picture)} alt="" className="aspect-square w-full rounded-xl object-cover" />
                      <span className="flex min-h-12 items-center justify-center gap-1 px-0.5 text-center text-base font-extrabold leading-tight">
                        {correct && <Check aria-hidden="true" size={18} />}{drink.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p role="status" className="font-bold">
                {progress.cafeWaterChosen ? lesson.listen.correctText : mistake ? lesson.listen.retryText : ""}
              </p>
            </>
          )}
          {step === 1 && (
            <div className={cn(panel, "flex items-center gap-4")}>
              <img src={cafePicture(lesson.host)} alt="" className="size-16 rounded-full object-cover" />
              <div className="space-y-3">
                <p className="text-xl font-extrabold" lang="en">{lesson.repeat.model}</p>
                <AudioButton onClick={() => playPrompt(...lesson.repeat.prompt)}>Atkārtot audio</AudioButton>
              </div>
            </div>
          )}
          {step === 2 && (
            <>
              <div className={cn(panel, "grid grid-cols-[2fr_3fr] items-center gap-3")}>
                <img src={cafePicture(lesson.order.picture)} alt={lesson.order.pictureDescription}
                  className="aspect-square w-full rounded-2xl object-cover" />
                <div className="space-y-3">
                  <p className="text-xl font-extrabold" lang="en">{lesson.order.question}</p>
                  <AudioButton onClick={() => playPrompt(...lesson.order.prompt)}>Atkārtot audio</AudioButton>
                </div>
              </div>
              {revealed ? (
                <section className="space-y-2" aria-label="Atbilžu piemēri">
                  <h2 className="font-extrabold">Vari teikt arī tā</h2>
                  <div className="flex flex-wrap gap-2">
                    {lesson.order.models.map(model => (
                      <AudioButton key={model.clip} onClick={() => playPrompt(model.clip)}><span lang="en">{model.text}</span></AudioButton>
                    ))}
                  </div>
                </section>
              ) : <AudioButton onClick={revealModels}>Klausīties atbildi</AudioButton>}
            </>
          )}
          {step !== 0 && <SpeakingPractice media={media} advance={step === 1 ? () => goTo(2) : complete} />}
          {(step !== 0 || progress.cafeWaterChosen) && (
            <Button type="button" className={cn(mainButton, "w-full")}
              onClick={step === 2 ? complete : () => goTo(step === 0 ? 1 : 2)}>
              {step === 2 ? "Pabeigt" : "Turpināt"} <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </>
      )}
      {media.audioFailed && <p role="status" className="text-sm font-semibold">Lai dzirdētu, pieskaries klausīšanās pogai.</p>}
      {saveFailed && <p role="alert" className="text-sm font-semibold">Neizdevās saglabāt progresu. Mēģini vēlreiz.</p>}
    </div>
  );
}
