export function speak(text: string, lang: string = "en-US") {
  if (typeof window === "undefined") return;
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
    // ignore
  }
}
