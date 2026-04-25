'use client';

/**
 * Tiny SFX library — synthesized via Web Audio API so we don't ship any
 * audio files. Each sound is a short envelope on a sine/triangle
 * oscillator (sometimes a chord), shaped to feel warm and Miyazaki-ish
 * (no harsh edges, no metal, no cartoon sting).
 *
 * Respects the global soundEffects setting via `setSfxEnabled()`. All
 * play* functions are no-ops when disabled or when no AudioContext is
 * available.
 *
 * The AudioContext is lazy-created on first play so we don't trigger
 * iOS' autoplay policy until a user gesture has happened.
 */

let audioCtx: AudioContext | null = null;
let enabled = true;

export function setSfxEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    // close active context to free resources
    try {
      audioCtx?.close();
    } catch {}
    audioCtx = null;
  }
}

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (typeof window === 'undefined') return null;
  if (audioCtx && audioCtx.state !== 'closed') {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  try {
    audioCtx = new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

interface NoteSpec {
  freq: number;          // Hz
  type?: OscillatorType; // sine, triangle, etc.
  start?: number;        // seconds offset from "now"
  duration?: number;     // seconds
  attack?: number;       // seconds
  release?: number;      // seconds
  gain?: number;         // peak gain (multiplied by master)
  filterFreq?: number;   // optional low-pass
}

/** Schedule a single tone with a soft attack-release envelope. */
function playNote(ctx: AudioContext, master: GainNode, n: NoteSpec) {
  const now = ctx.currentTime + (n.start ?? 0);
  const dur = n.duration ?? 0.25;
  const att = Math.min(n.attack ?? 0.015, dur * 0.45);
  const rel = Math.min(n.release ?? 0.18, dur);
  const peak = (n.gain ?? 0.5);

  const osc = ctx.createOscillator();
  osc.type = n.type ?? 'sine';
  osc.frequency.value = n.freq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + att);
  gain.gain.linearRampToValueAtTime(peak * 0.6, now + dur - rel);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  let last: AudioNode = osc;
  if (n.filterFreq) {
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = n.filterFreq;
    last.connect(filt);
    last = filt;
  }
  last.connect(gain).connect(master);

  osc.start(now);
  osc.stop(now + dur + 0.05);
}

function makeMaster(ctx: AudioContext, gainValue: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = gainValue;
  g.connect(ctx.destination);
  return g;
}

// ─── PUBLIC SOUNDS ────────────────────────────────────────────────────

/**
 * Soft 2-note rising chime — used on correct answers.
 * E5 → A5 (a perfect 4th up). Sine waves with low-pass for warmth.
 */
export function playCorrectChime() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.35);
  playNote(ctx, master, { freq: 659.25, type: 'sine', start: 0,    duration: 0.32, attack: 0.012, release: 0.22, filterFreq: 3000, gain: 0.55 });
  playNote(ctx, master, { freq: 880.00, type: 'sine', start: 0.10, duration: 0.40, attack: 0.012, release: 0.30, filterFreq: 3000, gain: 0.55 });
  // Sparkle harmonic (very soft)
  playNote(ctx, master, { freq: 1318.51, type: 'sine', start: 0.18, duration: 0.5, attack: 0.04, release: 0.4, gain: 0.18 });
}

/**
 * Soft, lower-pitched single note — for "moving on" or gentle wrong.
 * Not punishing — more like "let's set this aside."
 */
export function playGentleTone() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.3);
  playNote(ctx, master, { freq: 329.63, type: 'sine', duration: 0.5, attack: 0.05, release: 0.4, filterFreq: 1500, gain: 0.5 });
}

/**
 * Tiny click for retry shake or button feedback.
 */
export function playSoftTap() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.18);
  playNote(ctx, master, { freq: 880, type: 'triangle', duration: 0.08, attack: 0.005, release: 0.06, filterFreq: 4000, gain: 0.35 });
}

/**
 * Magical sparkle — for petal burst, gem reveal, species arrival.
 * A small ascending pentatonic arpeggio on sine waves.
 */
export function playSparkle() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.25);
  // C5, E5, G5, A5, C6 — pentatonic up
  const notes = [523.25, 659.25, 783.99, 880.00, 1046.50];
  notes.forEach((freq, i) => {
    playNote(ctx, master, {
      freq, type: 'sine',
      start: i * 0.05,
      duration: 0.4,
      attack: 0.01,
      release: 0.3,
      filterFreq: 4500,
      gain: 0.35,
    });
  });
}

/**
 * Page-turn / item transition — soft filtered noise burst.
 */
export function playPageTurn() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.25);
  // Brief filtered noise
  const dur = 0.18;
  const now = ctx.currentTime;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = Math.exp(-i / (ctx.sampleRate * 0.06));
    data[i] = (Math.random() * 2 - 1) * env * 0.4;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 2000;
  filt.Q.value = 1.2;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  src.connect(filt).connect(gain).connect(master);
  src.start(now);
  src.stop(now + dur + 0.05);
}

/**
 * Bigger arrival sting for species arriving — a soft chord.
 */
export function playArrival() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.3);
  // C5, E5, G5 chord, then a sparkle on top
  [523.25, 659.25, 783.99].forEach((freq) => {
    playNote(ctx, master, { freq, type: 'sine', duration: 0.9, attack: 0.06, release: 0.7, filterFreq: 3000, gain: 0.4 });
  });
  playNote(ctx, master, { freq: 1567.98, type: 'sine', start: 0.2, duration: 0.8, attack: 0.04, release: 0.6, gain: 0.18 });
}

/** A tiny "leaf settling" sound for the moving-on / soft-fail moment. */
export function playSettle() {
  const ctx = getCtx();
  if (!ctx) return;
  const master = makeMaster(ctx, 0.25);
  playNote(ctx, master, { freq: 440, type: 'sine', duration: 0.5, attack: 0.04, release: 0.4, filterFreq: 1800, gain: 0.4 });
  playNote(ctx, master, { freq: 329.63, type: 'sine', start: 0.08, duration: 0.5, attack: 0.04, release: 0.4, filterFreq: 1800, gain: 0.35 });
}
