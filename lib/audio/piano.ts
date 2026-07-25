// lib/audio/piano.ts
//
// A small synthesized piano for the music lessons. Same Web Audio
// approach as sfx.ts — no audio files — but with its own context and
// its own on/off, because here the sound IS the lesson. Turning off
// game sound effects should not make ear training impossible.
//
// The timbre is a struck-string caricature: a sine fundamental plus a
// quieter octave and twelfth, a fast attack, and a long gentle decay.
// It won't fool anyone, but the PITCH is exact, which is all ear
// training needs.

'use client';

import { freqOf } from '@/lib/music/theory';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx && ctx.state !== 'closed') {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  try { ctx = new Ctx(); } catch { return null; }
  return ctx;
}

/** Partials: [frequency multiple, relative loudness]. */
const PARTIALS: Array<[number, number]> = [[1, 1], [2, 0.28], [3, 0.1]];

/**
 * Play one pitch. `when` is an offset in seconds from now, so callers
 * can schedule a melody precisely instead of using setTimeout.
 */
export function playPitch(midi: number, durationSec = 0.85, when = 0, gain = 0.32): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const freq = freqOf(midi);

  for (const [mult, level] of PARTIALS) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;

    const g = c.createGain();
    const peak = gain * level;
    // Fast strike, then a long decay — a struck string, not an organ.
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(Math.max(peak * 0.25, 0.0001), t0 + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);

    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + durationSec + 0.05);
  }
}

/** Play notes one after another. Returns roughly how long it will take. */
export function playSequence(
  midis: number[],
  gapSec = 0.62,
  durationSec = 0.8,
): number {
  midis.forEach((m, i) => playPitch(m, durationSec, i * gapSec));
  return midis.length * gapSec;
}

/** Play two notes at once — for "same or different" and later chords. */
export function playTogether(midis: number[], durationSec = 1.1): void {
  for (const m of midis) playPitch(m, durationSec, 0, 0.26);
}

/**
 * A rhythm on one repeated pitch — a woodblock-ish tick so the child
 * hears the DURATIONS rather than a tune. Returns total seconds.
 */
export function playRhythm(beats: number[], bpm = 92, midi = 72): number {
  const beatSec = 60 / bpm;
  let t = 0;
  for (const b of beats) {
    // Sound the attack, then rest for the remainder of the value.
    playPitch(midi, Math.min(b * beatSec * 0.9, 0.5), t, 0.26);
    t += b * beatSec;
  }
  return t;
}

/** A soft metronome count-in, so a tap-back starts in time. */
export function playCountIn(bpm = 92, beats = 4): number {
  const beatSec = 60 / bpm;
  for (let i = 0; i < beats; i++) {
    playPitch(i === 0 ? 84 : 79, 0.09, i * beatSec, 0.12);
  }
  return beats * beatSec;
}

/** Warm, "that's it" cadence for a finished exercise. */
export function playSuccessCadence(): void {
  playPitch(67, 0.5, 0);      // G4
  playPitch(72, 0.7, 0.12);   // C5
  playPitch(76, 0.9, 0.24);   // E5
}
