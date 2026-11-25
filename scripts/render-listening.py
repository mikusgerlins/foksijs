"""Render the bundled listening MP3s from the Foksijs curriculum.

Install piper-tts, numpy and lameenc. Pass the en_US-ljspeech-high ONNX
model with its .onnx.json configuration alongside it. Requires Node 24.
"""

import argparse
import json
from pathlib import Path
import subprocess

import lameenc
import numpy as np
import onnxruntime as ort
from piper.config import PiperConfig, SynthesisConfig
from piper.voice import PiperVoice


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "listening"


def curriculum():
    export = """
        import { UNITS } from './src/data/lessons.ts';
        import { listeningScenes } from './src/data/listening-scenes.ts';
        const words = [...new Set(UNITS.flatMap(unit => unit.words.map(word => word.en)))];
        console.log(JSON.stringify({ words, scenes: listeningScenes }));
    """
    return json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", export], cwd=ROOT, encoding="utf-8"
    ))


def encode(voice, text, path):
    # These two isolated one-syllable takes benefit from a longer held vowel.
    length = 1.85 if text in {"bed.", "eye."} else 1.16
    if text == "eye.":
        text = "Eye"
    settings = SynthesisConfig(length_scale=length, noise_scale=0.57, noise_w_scale=0.66)
    rate = voice.config.sample_rate
    parts = []
    for part in voice.synthesize(text, syn_config=settings):
        if parts:
            parts.append(np.zeros(round(rate * 0.18), dtype=np.float32))
        parts.append(part.audio_float_array)
    signal = np.concatenate(parts)
    voiced = signal[np.abs(signal) > 0.02]
    if not len(voiced):
        raise ValueError(f"Empty utterance: {text}")
    rms = np.sqrt(np.mean(voiced ** 2))
    signal *= min(0.21 / rms, 0.84 / np.max(np.abs(signal)))
    # Preserve quiet consonants and word endings, including on immediate replay.
    signal = np.pad(signal, (round(rate * 0.06), round(rate * 0.14)))
    pcm = np.rint(signal * 32767).astype("<i2")
    encoder = lameenc.Encoder()
    encoder.set_channels(1)
    encoder.set_in_sample_rate(rate)
    encoder.set_out_sample_rate(rate)
    encoder.set_bit_rate(64)
    encoder.set_quality(2)
    data = encoder.encode(pcm.tobytes()) + encoder.flush()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.with_suffix(".tmp").write_bytes(data)
    path.with_suffix(".tmp").replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", type=Path)
    parser.add_argument("--group", choices=["words", "scenes"], help="Render one group")
    args = parser.parse_args()
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    config = json.loads(args.model.with_suffix(".onnx.json").read_text(encoding="utf-8"))
    voice = PiperVoice(
        session=ort.InferenceSession(str(args.model), sess_options=options,
                                     providers=["CPUExecutionProvider"]),
        config=PiperConfig.from_dict(config),
    )
    data = curriculum()
    if args.group != "scenes":
        for word in data["words"]:
            name = "-".join(word.lower().split())
            encode(voice, word + ".", OUTPUT / f"{name}.mp3")
        print(f"Rendered {len(data['words'])} words.", flush=True)
    if args.group != "words":
        for unit, scene in data["scenes"].items():
            encode(voice, scene["line"], OUTPUT / "scenes" / f"{unit}.mp3")
        print(f"Rendered {len(data['scenes'])} scenes.", flush=True)


if __name__ == "__main__":
    main()
