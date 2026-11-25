# Listening recordings

The vocabulary words and short scenes use the same English narrator as “Kafejnīcā”. The clips were generated with Piper's **en_US-ljspeech-high** voice, trained by Bryce Beattie on the public-domain LJ Speech Dataset. [Model card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/high/MODEL_CARD) · [Dataset](https://keithito.com/LJ-Speech-Dataset/)

Google Cloud Text-to-Speech generated the Latvian audio with **lv-LV-Chirp3-HD-Kore**. The word-recognition round uses a full direction recorded for this lesson format. The picture and meaning rounds use “Klausies!” from the opening of the café recording `lv_listen.wav`. [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)

The text for the English clips comes from `src/data/lessons.ts` and `src/data/listening-scenes.ts`. To regenerate them, use Node 24, Python with `piper-tts`, `numpy` and `lameenc`, and the voice model with its matching JSON configuration. Run `python scripts/render-listening.py path/to/en_US-ljspeech-high.onnx` from the repository root. The English MP3s are mono, 22.05 kHz and 64 kbps.
