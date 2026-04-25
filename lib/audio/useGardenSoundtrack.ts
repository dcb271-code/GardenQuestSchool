'use client';

import { useEffect, useRef } from 'react';

/**
 * Soft, warm, garden-inspired ambient soundtrack — synthesized live in
 * the browser via Web Audio. No audio files.
 *
 * Design rules (after several rounds of feedback — the brief is "no
 * vertigo"):
 *   - NO stereo panning anywhere. Everything is mono and centered. No
 *     left-right movement = no swirl.
 *   - NO detune / chorus on the chord. Single oscillator per voice. No
 *     beat-frequency wobble.
 *   - NO swelling sweeps. Wind is replaced by a short, soft "leaf
 *     rustle" with a snappy attack and quick decay — a dry texture
 *     event, not a sweep.
 *   - Delay reverb is dialed almost to zero feedback so tails don't
 *     swirl back on themselves.
 *
 * The result: a held Cmaj add9 chord that just sits there, with
 * occasional discrete nature events (rustle / bird / frog / cricket)
 * sprinkled in at slow random intervals.
 */
export function useGardenSoundtrack({
  enabled, volume,
}: {
  enabled: boolean;
  volume: number;  // 0..0.5 (clamped to 0.35 ceiling internally)
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const cleanupFns = useRef<Array<() => void>>([]);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    let ctx: AudioContext;
    try { ctx = new Ctx(); } catch { return; }
    ctxRef.current = ctx;

    // ── BUS ──────────────────────────────────────────────────────────
    const master = ctx.createGain();
    master.gain.value = clampVol(volume);
    master.connect(ctx.destination);
    masterRef.current = master;

    // Very subtle ambience — short tail, almost no feedback so it
    // doesn't create swirling repeats.
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.22;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.04;
    const wet = ctx.createGain();
    wet.gain.value = 0.08;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(master);

    // Whole-bus warmth (soft cap on highs)
    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = 2200;
    warmFilter.Q.value = 0.5;
    warmFilter.connect(master);
    warmFilter.connect(delay);

    // Pad uses a SECOND bus that's lower-passed harder, so the pad
    // stays warm/dark while the nature events keep their natural
    // sparkle.
    const padBus = ctx.createBiquadFilter();
    padBus.type = 'lowpass';
    padBus.frequency.value = 1100;
    padBus.Q.value = 0.5;
    padBus.connect(master);
    padBus.connect(delay);

    // ── PAD: Cmaj add9, held steady, NO detune ──────────────────────
    // Single sine per voice — no chorus, no beat-frequency wobble.
    const padVoices = [
      { freq: 261.63, peakGain: 0.13 },  // C4
      { freq: 329.63, peakGain: 0.11 },  // E4
      { freq: 392.00, peakGain: 0.10 },  // G4
      { freq: 587.33, peakGain: 0.07 },  // D5 (the sweetening 9th)
    ];

    padVoices.forEach((voice, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = voice.freq;

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0;
      osc.connect(voiceGain);
      voiceGain.connect(padBus);

      const startTime = ctx.currentTime;
      const initialDelay = 1.5 + idx * 1.5;
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(voice.peakGain, startTime + initialDelay + 6);

      osc.start();

      cleanupFns.current.push(() => {
        const t = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(t);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, t);
        voiceGain.gain.linearRampToValueAtTime(0, t + 1.5);
        try { osc.stop(t + 1.6); } catch {}
      });
    });

    // ── NATURE EVENTS (all mono, no panning) ─────────────────────────

    // Reusable noise buffer (4 seconds of pink-ish noise)
    const noiseBuf = makeNoiseBuffer(ctx, 4);

    // 1) RUSTLE — replaces the swelling wind. Brief soft burst of
    //    bandpassed noise with a quick attack/decay — like a breeze
    //    moving leaves once, not blowing.
    const playRustle = () => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const now = c.currentTime;
      const dur = 1.2 + Math.random() * 0.8;  // 1.2–2.0s

      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;

      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 800 + Math.random() * 400;  // higher = drier rustle, not wind
      bp.Q.value = 0.9;

      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.018, now + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

      src.connect(bp).connect(g).connect(warmFilter);
      src.start(now);
      src.stop(now + dur + 0.1);

      // Schedule next: 60–150 seconds
      const next = 60000 + Math.random() * 90000;
      timersRef.current.push(setTimeout(playRustle, next));
    };
    timersRef.current.push(setTimeout(playRustle, 25000 + Math.random() * 30000));

    // 2) BIRD CHIRP — short pitched sine sweeps, sometimes paired
    const playBird = () => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const now = c.currentTime;
      // 1 to 3 little tweets in quick succession
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const start = now + i * (0.12 + Math.random() * 0.08);
        const baseFreq = 1800 + Math.random() * 1400;
        const sweepUp = baseFreq + 200 + Math.random() * 400;
        const dur = 0.09 + Math.random() * 0.08;

        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.linearRampToValueAtTime(sweepUp, start + dur);

        const g = c.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.04, start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0005, start + dur);

        osc.connect(g).connect(warmFilter);
        osc.start(start);
        osc.stop(start + dur + 0.05);
      }

      // Schedule next: 35–110 seconds
      const next = 35000 + Math.random() * 75000;
      timersRef.current.push(setTimeout(playBird, next));
    };
    timersRef.current.push(setTimeout(playBird, 18000 + Math.random() * 20000));

    // 3) FROG CROAK — low pulsing tone with vibrato (mono)
    const playFrog = () => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const now = c.currentTime;
      const dur = 0.45 + Math.random() * 0.3;
      const baseFreq = 130 + Math.random() * 30;  // ~C3-D3

      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = baseFreq;

      // Fast amplitude modulation gives the "ribbit" texture
      const am = c.createOscillator();
      am.type = 'sine';
      am.frequency.value = 22 + Math.random() * 8;  // ~22-30 Hz "ribbit" rate
      const amGain = c.createGain();
      amGain.gain.value = 0.5;
      am.connect(amGain);

      const g = c.createGain();
      g.gain.value = 0;
      // Modulate gain via the AM
      amGain.connect(g.gain);
      // Base envelope
      const env = c.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.05, now + 0.04);
      env.gain.linearRampToValueAtTime(0.05, now + dur - 0.08);
      env.gain.exponentialRampToValueAtTime(0.0005, now + dur);

      // Low-pass to keep it bottomy
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 380;
      lp.Q.value = 1.4;

      osc.connect(lp).connect(g).connect(env).connect(warmFilter);

      osc.start(now);
      am.start(now);
      osc.stop(now + dur + 0.1);
      am.stop(now + dur + 0.1);

      // Schedule next: 80–220 seconds (rare)
      const next = 80000 + Math.random() * 140000;
      timersRef.current.push(setTimeout(playFrog, next));
    };
    timersRef.current.push(setTimeout(playFrog, 50000 + Math.random() * 40000));

    // 4) CRICKET — high stridulating ticks (mono, gentler density)
    const playCricket = () => {
      const c = ctxRef.current;
      if (!c || c.state === 'closed') return;
      const now = c.currentTime;
      // 3–5 quick ticks
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const start = now + i * 0.08;
        const dur = 0.025;

        const src = c.createBufferSource();
        src.buffer = noiseBuf;

        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 4500 + Math.random() * 800;
        bp.Q.value = 8;

        const g = c.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.022, start + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0005, start + dur);

        src.connect(bp).connect(g).connect(warmFilter);
        src.start(start);
        src.stop(start + dur + 0.05);
      }

      // Schedule next: 50–140 seconds
      const next = 50000 + Math.random() * 90000;
      timersRef.current.push(setTimeout(playCricket, next));
    };
    timersRef.current.push(setTimeout(playCricket, 40000 + Math.random() * 30000));

    return () => {
      cleanupFns.current.forEach(fn => { try { fn(); } catch {} });
      cleanupFns.current = [];
      timersRef.current.forEach(t => clearTimeout(t as any));
      timersRef.current = [];
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

function makeNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * durationSec, ctx.sampleRate);
  const data = buf.getChannelData(0);
  // Voss-style pink-ish noise
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.0990460;
    b1 = 0.96300 * b1 + white * 0.2965164;
    b2 = 0.57000 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
  }
  return buf;
}
