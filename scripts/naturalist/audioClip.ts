// scripts/naturalist/audioClip.ts
//
// The ffmpeg side of the bird-audio pipeline: propose a 6-second
// window, cut a clip, draw its spectrogram. Shared by the proposer
// (birds:audio-clips), the audition server's nudge endpoint, and the
// final cut in birds:audio-upload — so a nudged window and the
// uploaded clip go through the IDENTICAL filter chain, and what was
// auditioned is what ships.
//
// Hard-won facts from the handoff, encoded here so they stay true:
//   * libopus REJECTS 44100 Hz — 48000 it is.
//   * -ss and -t must come BEFORE -i, or ffmpeg decodes the whole
//     original (sometimes a 26 MB WAV) before seeking.
//   * highpass=f=200 removes wind and traffic rumble — a large
//     perceived-quality win on field recordings.
//   * The API's `length` is an "m:ss" string; real duration comes
//     from ffprobe.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

export const CLIP_LEN_SEC = 6;

/**
 * The one filter chain. Trim → de-rumble → broadcast loudness → short
 * fades so the cut doesn't click. Recorded in bird_audio.modifications
 * because CC 4.0 §3(a)(1) requires saying the work was modified.
 */
const FILTER =
  'highpass=f=200,loudnorm=I=-16:TP=-1.5:LRA=11,' +
  `afade=t=in:st=0:d=0.15,afade=t=out:st=${CLIP_LEN_SEC - 0.15}:d=0.15`;

/** Human-readable record of the same chain, for the licence row. */
export const MODIFICATIONS_TEXT =
  `trimmed to ${CLIP_LEN_SEC}s, high-pass filtered at 200 Hz, loudness-normalised, faded, re-encoded`;

export async function probeDurationSec(file: string): Promise<number> {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const sec = Number(stdout.trim());
  if (!Number.isFinite(sec) || sec <= 0) throw new Error(`ffprobe could not read ${file}`);
  return sec;
}

/**
 * Propose a clip window: band-pass to where songbirds actually sing
 * (~1.5–9 kHz — below that is wind, traffic and the recordist's
 * footsteps; above is hiss), then take the loudest contiguous six
 * seconds. In a quality-A recording the bird is the loud foreground
 * event, so this is a reasonable proxy — but it is a PROPOSAL. Nothing
 * here can hear whether the loudest window is the cardinal or a car
 * door; the audition page exists so a human confirms every one.
 */
export async function proposeWindowSec(file: string, durationSec: number): Promise<number> {
  if (durationSec <= CLIP_LEN_SEC) return 0;

  const RATE = 16000;                       // keeps the 9 kHz band while staying small
  const FRAME_SEC = 0.25;
  const frameSamples = RATE * FRAME_SEC;

  const { stdout } = await run('ffmpeg', [
    '-v', 'error',
    '-i', file,
    '-af', 'highpass=f=1500,lowpass=f=9000',
    '-ac', '1', '-ar', String(RATE),
    '-f', 's16le', '-',
  ], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });

  const samples = new Int16Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.byteLength / 2));
  const frames: number[] = [];
  for (let f = 0; (f + 1) * frameSamples <= samples.length; f++) {
    let energy = 0;
    const base = f * frameSamples;
    for (let i = 0; i < frameSamples; i++) {
      const v = samples[base + i];
      energy += v * v;
    }
    frames.push(energy);
  }

  const windowFrames = Math.round(CLIP_LEN_SEC / FRAME_SEC);
  if (frames.length <= windowFrames) return 0;

  let sum = 0;
  for (let i = 0; i < windowFrames; i++) sum += frames[i];
  let best = sum, bestStart = 0;
  for (let i = windowFrames; i < frames.length; i++) {
    sum += frames[i] - frames[i - windowFrames];
    if (sum > best) { best = sum; bestStart = i - windowFrames + 1; }
  }

  const start = bestStart * FRAME_SEC;
  return Math.max(0, Math.min(start, durationSec - CLIP_LEN_SEC));
}

/** Clamp then round a start to one decimal, the resolution nudges use. */
export function normaliseStart(startSec: number, durationSec: number): number {
  const max = Math.max(0, durationSec - CLIP_LEN_SEC);
  return Math.round(Math.max(0, Math.min(startSec, max)) * 10) / 10;
}

/** '12.5' → 's125' — a start baked into a filename, dot-free. */
export function startTag(startSec: number): string {
  return `s${Math.round(startSec * 10)}`;
}

async function cut(src: string, startSec: number, codecArgs: string[], out: string): Promise<void> {
  await run('ffmpeg', [
    '-y', '-v', 'error',
    '-ss', String(startSec), '-t', String(CLIP_LEN_SEC),
    '-i', src,
    '-af', FILTER,
    '-ac', '1', '-ar', '48000',
    ...codecArgs,
    out,
  ]);
}

/** AAC in an .m4a — plays in every browser, used for audition previews
 *  and as the shipped fallback for older Safari. */
export async function cutM4a(src: string, startSec: number, out: string): Promise<void> {
  await cut(src, startSec, ['-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart'], out);
}

/** The shipped clip: mono Opus at 48 kHz — ~35 KB for six seconds. */
export async function cutOpus(src: string, startSec: number, out: string): Promise<void> {
  await cut(src, startSec, ['-c:a', 'libopus', '-b:a', '48k'], out);
}

/**
 * Spectrogram of a cut clip. Readable as an image, which makes it the
 * one check on a clip that CAN be made without ears — and it doubles
 * as a teaching asset: Cornell's Bird Song Hero works by matching
 * sound to spectrogram (a whistle is one clean line, a nasal note is
 * stacked lines).
 */
/**
 * The display settings, and why each one is there.
 *
 * `fscale=log` is the load-bearing one. On a linear scale the birds do
 * not fit on one picture: a Mourning Dove coos near 500 Hz and a
 * Carolina Chickadee whistles near 6 kHz, so any linear range that
 * shows the chickadee squashes the dove into the bottom few pixels —
 * which is exactly what the first version did, leaving the dove's
 * spectrogram a blank purple rectangle. A log scale is also what
 * Cornell uses, for the same reason.
 *
 * `drange=70` drops the noise floor to black instead of the red wash
 * that made every clip look identical, and `gain=2` lifts what is
 * left so a quiet chickadee still reads. `start=350` trims rumble
 * below anything here sings; 12 kHz leaves headroom above the highest
 * whistles so a note is never clipped at the top edge.
 */
const SPECTRUM =
  'showspectrumpic=s=640x256:legend=0:fscale=log:start=350:stop=12000:drange=70:gain=2';

export async function spectrogram(clip: string, outPng: string): Promise<void> {
  await run('ffmpeg', ['-y', '-v', 'error', '-i', clip, '-lavfi', SPECTRUM, outPng]);
}
