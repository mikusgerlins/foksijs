let player: HTMLAudioElement | null = null;
let request = 0;

function speakWithSystemVoice(text: string, lang: string) {
  if (!("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.85;
    utter.pitch = 1.1;
    synth.speak(utter);
  } catch {
    // The device may not have an installed speech voice.
  }
}

export function speak(text: string, lang: string = "en-US") {
  if (typeof window === "undefined") return;
  const id = ++request;
  if (player) {
    player.onerror = null;
    player.pause();
    player = null;
  }
  window.speechSynthesis?.cancel();

  if (!lang.toLowerCase().startsWith("en")) {
    speakWithSystemVoice(text, lang);
    return;
  }

  const clip = text.trim().toLowerCase().replace(/\s+/g, "-");
  const audio = new Audio(`${import.meta.env.BASE_URL}listening/${clip}.mp3`);
  player = audio;
  let failed = false;
  const fallback = () => {
    if (id !== request || failed) return;
    failed = true;
    speakWithSystemVoice(text, lang);
  };
  audio.onerror = fallback;
  try {
    void audio.play().catch(fallback);
  } catch {
    fallback();
  }
}
