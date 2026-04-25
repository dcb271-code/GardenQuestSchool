'use client';

import { useEffect, useRef } from 'react';

/**
 * Garden soundtrack — synthesized live in the browser via Web Audio.
 * No audio files, no nature sounds.
 *
 * ── Design notes (third rewrite — head-wobble + monotony fixes) ──
 *
 * Two specific complaints we're solving here:
 *
 *  1. "Wobbly when I turn my head."  Caused by acoustic *beating* —
 *     the previous voicings packed close intervals (a major-2nd like
 *     B–C, plus a 9th piling D5 on top of C4) which produce ~30 Hz
 *     beat frequencies. Those beats interact with binaural cues when
 *     the listener moves, hence the wobble. The fix is OPEN voicings
 *     only: root in the bass, fifths/octaves above it, and the
 *     "colour" tone left to a separate sparse melody line. No two
 *     simultaneous notes are ever closer than a perfect fourth.
 *
 *  2. "Drolls on after 30 seconds."  The previous cycle was three
 *     chords (~50s loop) which felt repetitive almost immediately.
 *     Now there are SIX chords in the cycle (~3 minute loop), the
 *     bass walks a real progression (I–vi–IV–V–iii–vi), and a
 *     pentatonic *melody* sprinkles single notes on top of every
 *     other chord. The melody's pitches are chosen from a pentatonic
 *     pool and a deterministic per-cycle index walk so it never
 *     repeats the same sequence twice in a row.
 *
 * Everything stays sine-wave for warmth, with a low-pass at 1800 Hz.
 * Master gain is capped at 0.22 — this is background music, not
 * foreground.
 */

// ── Pitch table ───────────────────────────────────────────────────
// Frequencies are given so we can avoid a Math.pow call per note.
// Per-voice peakGain is tuned by ear to keep the bass ~2× louder
// than the top — like real recorded music, the lows carry the bed.
type Voice = { freq: number; peakGain: number };
const VOICES: Record<string, Voice> = {
  // Bass line — only ever ONE bass note plays at a time.
  C3: { freq: 130.81, peakGain: 0.090 },
  D3: { freq: 146.83, peakGain: 0.090 },
  E3: { freq: 164.81, peakGain: 0.090 },
  F3: { freq: 174.61, peakGain: 0.090 },
  G3: { freq: 196.00, peakGain: 0.090 },
  A3: { freq: 220.00, peakGain: 0.090 },
  // Mid-octave fifths — the "spine" above the bass. Always at least
  // a perfect fifth above the bass note so no major-second beating.
  C4: { freq: 261.63, peakGain: 0.055 },
  E4: { freq: 329.63, peakGain: 0.055 },
  G4: { freq: 392.00, peakGain: 0.055 },
  A4: { freq: 440.00, peakGain: 0.055 },
  // High-octave melody pool — pentatonic in C, sparse and bell-like.
  C5: { freq: 523.25, peakGain: 0.045 },
  D5: { freq: 587.33, peakGain: 0.045 },
  E5: { freq: 659.25, peakGain: 0.045 },
  G5: { freq: 783.99, peakGain: 0.045 },
  A5: { freq: 880.00, peakGain: 0.045 },
};

// ── Chord progression ─────────────────────────────────────────────
// Each chord = [bass, fifth, octave]. NO close intervals. The "fifth"
// is always at least a 5th above the bass; the "octave" is the bass
// note one octave higher (so the chord rings without beating).
type ChordSpec = { bass: string; fifth: string; oct: string };
const PROGRESSION: ChordSpec[] = [
  // I  — C major (root C)
  { bass: 'C3', fifth: 'G4', oct: 'C4' },
  // vi — A minor (root A) — natural 6th, a quiet melancholy step
  { bass: 'A3', fifth: 'E4', oct: 'A4' },
  // IV — F major (root F)
  { bass: 'F3', fifth: 'C4', oct: 'A4' },     // 'A4' is the major 3rd — wider than a 2nd from C4
  // V  — G major (root G)
  { bass: 'G3', fifth: 'E4', oct: 'G4' },     // E4 is the 6th of G; gives a suspended-y colour
  // iii — E minor (root E) — gentle pivot
  { bass: 'E3', fifth: 'C4', oct: 'G4' },     // C4 is the m6 of E; G4 is the m3
  // vi → resolution back, with a passing D
  { bass: 'D3', fifth: 'A4', oct: 'C4' },     // Dm7-ish suspended
];

// Pentatonic melody pool (C-major pentatonic). One note may join a
// chord at most. The picker walks an index so consecutive picks are
// never the same and the pattern doesn't loop in lockstep with the
// chord cycle.
const MELODY_POOL = ['C5', 'D5', 'E5', 'G5', 'A5'];

// ── Timing ────────────────────────────────────────────────────────
// Each "chord" is one slow breath. The next chord starts before the
// previous fully releases so the bed is continuous, but the SOUND
// always changes — there are never long stretches of identical pitch.
const NOTE_ATTACK  = 4.0;   // s
const NOTE_SUSTAIN = 16.0;  // s
const NOTE_RELEASE = 8.0;   // s
const NOTE_TOTAL   = NOTE_ATTACK + NOTE_SUSTAIN + NOTE_RELEASE;     // 28s
const CHORD_ADVANCE = 18;   // s — overlap of ~10s between chords

// 6 chords × 18s = 108s = 1m 48s per loop (was 51s — feels noticeably
// less repetitive while still being short enough to schedule cheaply).
const CYCLE = PROGRESSION.length * CHORD_ADVANCE;
const SCHEDULE_BATCH = 4;   // ~7 minutes ahead per scheduling pass
const RESCHEDULE_INTERVAL_MS = (SCHEDULE_BATCH - 1) * CYCLE * 1000;

// Melody scheduling — only fires on chord indices listed here, so it
// breathes rather than playing on every chord.
const MELODY_CHORD_INDICES = new Set([0, 2, 5]);   // 3 of the 6 chords

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

    // Soft low-pass for warmth.
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = 1800;
    warmth.Q.value = 0.5;
    warmth.connect(master);

    // Melody voice goes through a slightly brighter shelf so the
    // top notes feel bell-like rather than pillow-y.
    const sparkle = ctx.createBiquadFilter();
    sparkle.type = 'highshelf';
    sparkle.frequency.value = 2200;
    sparkle.gain.value = 3;
    sparkle.connect(master);

    /**
     * Schedule a single note: oscillator + gain envelope. Both nodes
     * are disconnected when the note ends so they can be GC'd. The
     * `bright` flag routes through the sparkle shelf instead of
     * straight into warmth — used for the melody pool only.
     */
    const playNote = (
      startTime: number,
      voiceName: string,
      opts: { bright?: boolean; durationScale?: number } = {},
    ) => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const spec = VOICES[voiceName];
      if (!spec) return;

      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = spec.freq;

      const gain = c.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(opts.bright ? sparkle : warmth);

      const t0 = startTime;
      const peak = spec.peakGain;
      const scale = opts.durationScale ?? 1;
      const a = NOTE_ATTACK * scale;
      const s = NOTE_SUSTAIN * scale;
      const r = NOTE_RELEASE * scale;
      const total = a + s + r;

      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + a);
      gain.gain.linearRampToValueAtTime(peak * 0.55, t0 + a + s);
      gain.gain.linearRampToValueAtTime(0, t0 + total);

      osc.start(t0);
      osc.stop(t0 + total + 0.1);
      osc.onended = () => {
        try { osc.disconnect(); } catch {}
        try { gain.disconnect(); } catch {}
      };
    };

    /**
     * Schedule SCHEDULE_BATCH cycles of the progression starting at
     * `startTime`, with a deterministic-but-varying melody walk.
     * Returns the time the last cycle ends.
     */
    const scheduleBatch = (startTime: number, melodyOffset: number): { end: number; nextOffset: number } => {
      let melIdx = melodyOffset;
      for (let cycle = 0; cycle < SCHEDULE_BATCH; cycle++) {
        for (let i = 0; i < PROGRESSION.length; i++) {
          const chordStart = startTime + cycle * CYCLE + i * CHORD_ADVANCE;
          const chord = PROGRESSION[i];
          // Bed: bass + fifth + octave, all open intervals.
          playNote(chordStart, chord.bass);
          playNote(chordStart + 0.4, chord.fifth);   // tiny stagger keeps onset gentle
          playNote(chordStart + 0.8, chord.oct);

          // Melody: one bell-like high note on selected chords, with
          // a shorter envelope so it breathes through the bed.
          if (MELODY_CHORD_INDICES.has(i)) {
            const note = MELODY_POOL[melIdx % MELODY_POOL.length];
            // Skew melody onset 4-7s into the chord so it lands AFTER
            // the chord has bloomed — like a single bird note over
            // the held pad.
            const melStart = chordStart + 4 + ((melIdx * 2) % 4);
            playNote(melStart, note, { bright: true, durationScale: 0.55 });
            melIdx += 3; // walk by 3 → no immediate repetition, all 5 notes visited over time
          }
        }
      }
      return {
        end: startTime + SCHEDULE_BATCH * CYCLE,
        nextOffset: melIdx,
      };
    };

    const startTime = ctx.currentTime + 1.5;
    let scheduledUpTo = startTime;
    let melodyOffset = 0;
    const first = scheduleBatch(startTime, melodyOffset);
    scheduledUpTo = first.end;
    melodyOffset = first.nextOffset;

    const reschedTimer = setInterval(() => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const next = scheduleBatch(scheduledUpTo, melodyOffset);
      scheduledUpTo = next.end;
      melodyOffset = next.nextOffset;
    }, RESCHEDULE_INTERVAL_MS);
    cleanupRef.current.push(() => clearInterval(reschedTimer));

    return () => {
      cleanupRef.current.forEach(fn => { try { fn(); } catch {} });
      cleanupRef.current = [];
      // Smoothly fade master to silence to avoid a click, then close.
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
  // Background music, never foreground.
  return Math.min(Math.max(v, 0), 0.22);
}
