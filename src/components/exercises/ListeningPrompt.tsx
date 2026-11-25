import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listeningScenes } from "@/data/listening-scenes";
import type { Exercise } from "@/lib/exercises";

type ListeningRound = Extract<Exercise, { type: "listening" | "listening-picture" | "listening-meaning" }>;
const instructions = { listening: "word", "listening-picture": "picture", "listening-meaning": "meaning" };
const audioRoot = `${import.meta.env.BASE_URL}listening/`;

export function ListeningPrompt({ round, unitId, answered }: { round: ListeningRound; unitId: string; answered: boolean }) {
  const scene = round.type === "listening-picture" && listeningScenes[unitId]?.target === round.word.en
    ? listeningScenes[unitId] : undefined;
  const clip = scene ? `scenes/${unitId}` : round.word.en.trim().toLowerCase().replace(/\s+/g, "-");
  const instruction = round.type === "listening-picture" && !scene ? null : instructions[round.type];
  const transcript = scene?.line ?? round.word.en;
  const player = useRef<HTMLAudioElement>(null);
  const generation = useRef(0);
  const heardInstruction = useRef(false);
  const [status, setStatus] = useState<"ready" | "blocked" | "unavailable">("ready");

  const stop = useCallback(() => {
    generation.current++;
    const audio = player.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
    }
  }, []);

  const play = useCallback(() => {
    stop();
    const audio = player.current;
    if (!audio || document.hidden) return;
    window.speechSynthesis?.cancel();
    setStatus("ready");
    const id = generation.current;
    const playClip = (intro: boolean) => {
      if (id !== generation.current) return;
      const failed = (blocked: boolean) => {
        if (id !== generation.current) return;
        if (intro && !blocked) { playClip(false); return; }
        setStatus(blocked ? "blocked" : "unavailable");
      };
      audio.onended = () => {
        if (id !== generation.current) return;
        if (intro) {
          heardInstruction.current = true;
          playClip(false);
        } else {
          setStatus("ready");
        }
      };
      audio.onerror = () => failed(false);
      audio.src = `${audioRoot}${intro ? `instructions/${instruction}` : clip}.mp3`;
      // Ignore rejections from a source that was replaced or interrupted.
      const source = audio.src;
      void audio.play().catch(error => {
        if (audio.src === source && error?.name !== "AbortError") failed(error?.name === "NotAllowedError");
      });
    };
    playClip(Boolean(instruction && !heardInstruction.current));
  }, [clip, instruction, stop]);

  useEffect(() => {
    const audio = player.current;
    heardInstruction.current = false;
    play();
    const onHide = () => {
      if (document.hidden) { stop(); setStatus("ready"); }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", stop);
    return () => {
      stop();
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      }
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", stop);
    };
  }, [play, stop]);

  return (
    <div className="mb-5 flex flex-col items-center gap-2 text-center">
      <audio ref={player} preload="none" />
      <Button type="button" size="lg" onClick={play}
        className="min-h-14 rounded-2xl bg-orange-800 px-6 text-lg font-extrabold text-white hover:bg-orange-900">
        <Volume2 aria-hidden="true" /> {status === "blocked" ? "Klausīties" : "Klausīties vēlreiz"}
      </Button>
      {status === "unavailable" && <p role="status" className="text-sm">Skaņu neizdevās atskaņot. Lasi angliski vai mēģini vēlreiz.</p>}
      {(answered || status === "unavailable") && <p lang="en" className="text-lg font-bold">{transcript}</p>}
    </div>
  );
}
