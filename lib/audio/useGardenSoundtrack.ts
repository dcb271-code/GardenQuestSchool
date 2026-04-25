'use client';

import { useEffect, useRef } from 'react';

/**
 * Soft, warm garden soundtrack — synthesized live in the browser via
 * Web Audio. No audio files, no nature sounds.
 *
 * Musicality comes from a slow three-chord progression in C major
 * with a real descending bass line (do — la — fa) and shared upper
 * voices that crossfade in and out. Each voice is a single triangle
 * wave (no detune, no chorus = no wobble), routed through a soft
 * low-pass for warmth.
 *
 *   Chord 1: Cmaj9   bass C3   upper C4 E4 G4 B4 D5
 *   Chord 2: Am9     bass A3   upper C4 E4 G4 A4 B4
 *   Chord 3: Fmaj9   bass F3   upper C4 E4 G4 A4 F4
 *   ↻ loop
 *
 * The bass note clearly changes (C → A → F) every ~22 seconds, so
 * the harmony moves audibly. Upper voices C4, E4, G4 are common to
 * all three chords (the spine) and just hold; the other voices
 * fade in/out across the chord changes via cosine-like ramps. The
 * full cycle is 66 seconds.
 *
 * Aesthetic reference: the slowest, calmest passages of Joe Hisaishi
 * — sustained pads with a tonal centre that drifts.
 */

const VOICES: Record<string, { freq: number; peakGain: number }> = {
  // Bass — only one bass note sounds per chord
  C3: { freq: 130.81, peakGain: 0.11 },
  A3: { freq: 220.00, peakGain: 0.10 },
  F3: { freq: 174.61, peakGain: 0.10 },
  // Spine — present in every chord
  C4: { freq: 261.63, peakGain: 0.10 },
  E4: { freq: 329.63, peakGain: 0.09 },
  G4: { freq: 392.00, peakGain: 0.08 },
  // Colour tones
  B4: { freq: 493.88, peakGain: 0.06 },
  D5: { freq: 587.33, peakGain: 0.05 },
  A4: { freq: 440.00, peakGain: 0.06 },
  F4: { freq: 349.23, peakGain: 0.05 },
};

const CHORDS: string[][] = [
  ['C3', 'C4', 'E4', 'G4', 'B4', 'D5'],   // Cmaj9
  ['A3', 'C4', 'E4', 'G4', 'A4', 'B4'],   // Am9
  ['F3', 'C4', 'E4', 'G4', 'A4', 'F4'],   // Fmaj9
];

const CHORD_DURATION = 22;          // seconds each chord holds before next begins
const CROSSFADE = 5;                // seconds for fade in/out at chord boundaries
const CYCLE = CHORDS.length * CHORD_DURATION;   // 66s per full progression
const SCHEDULE_BATCH = 8;           // schedule 8 cycles upfront (~9 minutes)
const RESCHEDULE_INTERVAL_MS = (SCHEDULE_BATCH - 2) * CYCLE * 1000;

export function useGardenSoundtrack({
  enabled, volume,
}: {
  enabled: boolean;
  volume: number;  // 0..0.5 (clamped to 0.35 ceiling internally)
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

    // Soft low-pass for warmth — tames triangle's upper harmonics
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = 1600;
    warmth.Q.value = 0.5;
    warmth.connect(master);

    // Build one oscillator + gain per voice. They run for the lifetime
    // of the hook; the chord progression is performed by scheduling
    // gain ramps into the future.
    const voices: Record<string, { osc: OscillatorNode; gain: GainNode }> = {};
    Object.entries(VOICES).forEach(([name, spec]) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = spec.freq;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(warmth);
      osc.start();
      voices[name] = { osc, gain };
    });

    /**
     * Schedule SCHEDULE_BATCH cycles of the progression starting at
     * `startTime` (in AudioContext time). Returns the time at which
     * the last scheduled cycle ends.
     */
    const scheduleBatch = (startTime: number, isFirstBatch: boolean): number => {
      for (let cycle = 0; cycle < SCHEDULE_BATCH; cycle++) {
        for (let i = 0; i < CHORDS.length; i++) {
          const chordStart = startTime + cycle * CYCLE + i * CHORD_DURATION;
          const peakReached = chordStart + CROSSFADE;
          const peakEnd = chordStart + CHORD_DURATION;
          const fadeOutEnd = peakEnd + CROSSFADE;

          const isVeryFirstChord = isFirstBatch && cycle === 0 && i === 0;
          const prevChord = CHORDS[(i - 1 + CHORDS.length) % CHORDS.length];
          const nextChord = CHORDS[(i + 1) % CHORDS.length];

          Object.keys(VOICES).forEach((name) => {
            if (!CHORDS[i].includes(name)) return;
            const inPrev = prevChord.includes(name);
            const inNext = nextChord.includes(name);
            const peak = VOICES[name].peakGain;
            const g = voices[name].gain.gain;

            // Fade in if entering (wasn't in prev) or this is the
            // very first chord we're scheduling.
            if (!inPrev || isVeryFirstChord) {
              g.linearRampToValueAtTime(0, chordStart);
              g.linearRampToValueAtTime(peak, peakReached);
            }
            // Fade out if leaving (won't be in next).
            if (!inNext) {
              g.linearRampToValueAtTime(peak, peakEnd);
              g.linearRampToValueAtTime(0, fadeOutEnd);
            }
            // Voices in both prev AND next (the spine) get no automation
            // here — they simply hold their current value.
          });
        }
      }
      return startTime + SCHEDULE_BATCH * CYCLE;
    };

    const startTime = ctx.currentTime + 1.5;  // brief lead-in
    let scheduledUpTo = scheduleBatch(startTime, true);

    // Keep the music going by appending another batch periodically.
    const reschedTimer = setInterval(() => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      scheduledUpTo = scheduleBatch(scheduledUpTo, false);
    }, RESCHEDULE_INTERVAL_MS);
    cleanupRef.current.push(() => clearInterval(reschedTimer));

    cleanupRef.current.push(() => {
      const t = ctx.currentTime;
      Object.values(voices).forEach(({ osc, gain }) => {
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 1.5);
        try { osc.stop(t + 1.6); } catch {}
      });
    });

    return () => {
      cleanupRef.current.forEach(fn => { try { fn(); } catch {} });
      cleanupRef.current = [];
      const toClose = ctx;
      setTimeout(() => { try { toClose.close(); } catch {} }, 1800);
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
  return Math.min(Math.max(v, 0), 0.35);
}
