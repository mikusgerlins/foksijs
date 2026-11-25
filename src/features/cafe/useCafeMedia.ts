import { useCallback, useEffect, useRef, useState } from "react";

const assetRoot = `${import.meta.env.BASE_URL}cafe/`;
export const cafePicture = (name: string) => `${assetRoot}${name}.jpg`;
const maxRecordingMs = 15_000;

type MicState = "idle" | "requesting" | "recording" | "ready" | "denied" | "unavailable";

export function useCafeMedia() {
  const player = useRef<HTMLAudioElement | null>(null);
  const playbackId = useRef(0);
  const micRequestId = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordingUrl = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const [mic, setMic] = useState<MicState>("idle");
  const [audioFailed, setAudioFailed] = useState(false);

  const stopPlayer = useCallback(() => {
    playbackId.current++;
    const element = player.current;
    if (element) {
      element.onended = null;
      element.onerror = null;
      element.pause();
      if (element.getAttribute("src")?.startsWith("blob:")) {
        element.removeAttribute("src");
        element.load();
      }
    }
  }, []);

  const discard = useCallback(() => {
    micRequestId.current++;
    window.clearTimeout(timer.current);
    const current = recorder.current;
    if (current) {
      current.ondataavailable = null;
      current.onstop = null;
      current.onerror = null;
      if (current.state !== "inactive") current.stop();
    }
    recorder.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (recordingUrl.current) URL.revokeObjectURL(recordingUrl.current);
    recordingUrl.current = null;
    setMic("idle");
  }, []);

  const reset = useCallback(() => {
    stopPlayer();
    discard();
    setAudioFailed(false);
  }, [discard, stopPlayer]);

  useEffect(() => {
    const onVisibilityChange = () => { if (document.hidden) reset(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", reset);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", reset);
      reset();
      player.current?.removeAttribute("src");
      player.current = null;
    };
  }, [reset]);

  const playUrls = useCallback((urls: string[]) => {
    stopPlayer();
    setAudioFailed(false);
    if (document.hidden || !urls.length) return;
    const id = playbackId.current;
    const element = player.current ??= new Audio();
    const failed = () => {
      if (id === playbackId.current) setAudioFailed(true);
    };
    const playAt = (index: number) => {
      if (id !== playbackId.current || index >= urls.length || document.hidden) return;
      element.onended = () => playAt(index + 1);
      element.onerror = failed;
      element.src = urls[index];
      void element.play().catch(failed);
    };
    playAt(0);
  }, [stopPlayer]);

  const playPrompt = useCallback((...names: string[]) => {
    // Interrupt even a pending permission request when another sound is requested.
    micRequestId.current++;
    if (recorder.current || stream.current) discard();
    else setMic(state => state === "requesting" ? "idle" : state);
    playUrls(names.map(name => `${assetRoot}${name}.wav`));
  }, [discard, playUrls]);

  const stopRecording = useCallback(() => {
    const current = recorder.current;
    if (current?.state === "recording") current.stop();
    window.clearTimeout(timer.current);
    stream.current?.getTracks().forEach(track => track.stop());
  }, []);

  const startRecording = useCallback(async () => {
    reset();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMic("unavailable");
      return;
    }
    const id = micRequestId.current;
    setMic("requesting");
    try {
      const captured = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (id !== micRequestId.current || document.hidden) {
        captured.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = captured;
      const current = new MediaRecorder(captured);
      recorder.current = current;
      const chunks: Blob[] = [];
      current.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      current.onerror = () => {
        if (id !== micRequestId.current) return;
        discard();
        setMic("unavailable");
      };
      current.onstop = () => {
        if (id !== micRequestId.current) return;
        window.clearTimeout(timer.current);
        captured.getTracks().forEach(track => track.stop());
        stream.current = null;
        recorder.current = null;
        if (chunks.length === 0) {
          setMic("unavailable");
          return;
        }
        recordingUrl.current = URL.createObjectURL(new Blob(chunks, { type: current.mimeType }));
        setMic("ready");
      };
      current.start();
      setMic("recording");
      timer.current = window.setTimeout(stopRecording, maxRecordingMs);
    } catch (error) {
      if (id !== micRequestId.current) return;
      discard();
      const denied = error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      setMic(denied ? "denied" : "unavailable");
    }
  }, [discard, reset, stopRecording]);

  const playRecording = () => {
    if (recordingUrl.current) playUrls([recordingUrl.current]);
  };

  return { mic, audioFailed, playPrompt, reset, startRecording, stopRecording, playRecording };
}
