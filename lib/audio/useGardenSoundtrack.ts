'use client';

import { useEffect, useRef } from 'react';

/**
 * Soft, warm garden soundtrack — synthesized live in the browser via
 * Web Audio. No audio files, no nature sounds.
 *
 * Three diatonic chords in C major cycle slowly with a descending bass
 * line (do — la — fa). Each chord is played as a fresh "breath" of
 * sine-wave notes that gently swell in and fade out (attack 3s,
 * sustain 14s with a subtle decay, release 8s) — so each chord feels
 * like a soft piano-pedal moment rather than a continuous drone.
 * Successive chords overlap by ~8 seconds so the music never goes
 * fully silent.
 *
 *   Chord 1: Cmaj9   bass C3   upper C4 E4 G4 B4 D5
 *   Chord 2: Am9     bass A3   upper C4 E4 G4 A4 B4
 *   Chord 3: Fmaj9   bass F3   upper C4 E4 G4 A4 F4
 *   ↻ loop
 *
 * Sine waves (rather than triangle) keep the timbre clean — no
 * upper-harmonic cloud that would otherwise build into a drone.
 */

const VOICES: Record<string, { freq: number; peakGain: number }> = {
  // Bass
  C3: { freq: 130.81, peakGain: 0.075 },
  A3: { freq: 220.00, peakGain: 0.070 },
  F3: { freq: 174.61, peakGain: 0.070 },
  // Spine
  C4: { freq: 261.63, peakGain: 0.070 },
  E4: { freq: 329.63, peakGain: 0.060 },
  G4: { freq: 392.00, peakGain: 0.055 },
  // Colour tones
  B4: { freq: 493.88, peakGain: 0.040 },
  D5: { freq: 587.33, peakGain: 0.035 },
  A4: { freq: 440.00, peakGain: 0.040 },
  F4: { freq: 349.23, peakGain: 0.035 },
};

const CHORDS: string[][] = [
  ['C3', 'C4', 'E4', 'G4', 'B4', 'D5'],   // Cmaj9
  ['A3', 'C4', 'E4', 'G4', 'A4', 'B4'],   // Am9
  ['F3', 'C4', 'E4', 'G4', 'A4', 'F4'],   // Fmaj9
];

// Per-note envelope (each chord-note is a discrete "breath")
const NOTE_ATTACK  = 3.0;
const NOTE_SUSTAIN = 14.0;
const NOTE_RELEASE = 8.0;
const NOTE_TOTAL   = NOTE_ATTACK + NOTE_SUSTAIN + NOTE_RELEASE;  // 25s

// How long after a chord starts before the next chord begins.
// CHORD_ADVANCE < NOTE_TOTAL means consecutive chords overlap.
const CHORD_ADVANCE = 17;
const CYCLE = CHORDS.length * CHORD_ADVANCE;          // 51s per cycle
const SCHEDULE_BATCH = 6;                             // ~5 min ahead
const RESCHEDULE_INTERVAL_MS = (SCHEDULE_BATCH - 2) * CYCLE * 1000;

export function useGardenSoundtrack({
  enabled, volume,
}: {
  enabled: boolean;
  volume: number;  // 0..0.5 (clamped to 0.22 ceiling internally)
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const cleanupRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    let ctx: AudioContext;
    try { ctx = new Ctx(); } catch { return; }
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = clampVol(volume);
    master.connect(ctx.destination);
    masterRef.current = master;

    // Soft low-pass for warmth — also tames the very top of the spectrum
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = 1800;
    warmth.Q.value = 0.5;
    warmth.connect(master);

    /**
     * Schedule a single note: oscillator + gain envelope. The
     * oscillator and its gain node are disconnected when the note
     * ends so they can be garbage-collected.
     */
    const playNote = (startTime: number, voiceName: string) => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const spec = VOICES[voiceName];
      if (!spec) return;

      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = spec.freq;

      const gain = c.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(warmth);

      const t0 = startTime;
      const peak = spec.peakGain;

      // Soft attack
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + NOTE_ATTACK);
      // Sustain with subtle decay (peak → 65% peak) — gives the note
      // a sense of "settling" rather than holding rigidly
      gain.gain.linearRampToValueAtTime(peak * 0.65, t0 + NOTE_ATTACK + NOTE_SUSTAIN);
      // Release back to silence
      gain.gain.linearRampToValueAtTime(0, t0 + NOTE_TOTAL);

      osc.start(t0);
      osc.stop(t0 + NOTE_TOTAL + 0.1);
      osc.onended = () => {
        try { osc.disconnect(); } catch {}
        try { gain.disconnect(); } catch {}
      };
    };

    /**
     * Schedule SCHEDULE_BATCH cycles of the chord progression starting
     * at `startTime`. Returns the time the last cycle ends.
     */
    const scheduleBatch = (startTime: number): number => {
      for (let cycle = 0; cycle < SCHEDULE_BATCH; cycle++) {
        for (let i = 0; i < CHORDS.length; i++) {
          const chordStart = startTime + cycle * CYCLE + i * CHORD_ADVANCE;
          for (const noteName of CHORDS[i]) {
            playNote(chordStart, noteName);
          }
        }
      }
      return startTime + SCHEDULE_BATCH * CYCLE;
    };

    const startTime = ctx.currentTime + 1.5;
    let scheduledUpTo = scheduleBatch(startTime);

    const reschedTimer = setInterval(() => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      scheduledUpTo = scheduleBatch(scheduledUpTo);
    }, RESCHEDULE_INTERVAL_MS);
    cleanupRef.current.push(() => clearInterval(reschedTimer));

    return () => {
      cleanupRef.current.forEach(fn => { try { fn(); } catch {} });
      cleanupRef.current = [];
      // Smoothly fade master to silence to avoid a click, then close
      // the context (which stops all in-flight oscillators).
      const m = masterRef.current;
      const toClose = ctx;
      if (m) {
        const t = ctx.currentTime;
        try {
          m.gain.cancelScheduledValues(t);
          m.gain.setValueAtTime(m.gain.value, t);
          m.gain.linearRampToValueAtTime(0, t + 0.6);
        } catch {}
      }
      setTimeout(() => { try { toClose.close(); } catch {} }, 800);
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;
    master.gain.setTargetAtTime(clampVol(volume), ctx.currentTime, 0.5);
  }, [volume]);
}

function clampVol(v: number): number {
  // Lowered from 0.35 → 0.22 after user feedback that the soundtrack
  // sat too loud even at the default slider position. The slider in
  // settings still goes 0..0.5 visually; this just caps the actual
  // applied gain so the music sits as background, never foreground.
  return Math.min(Math.max(v, 0), 0.22);
}
