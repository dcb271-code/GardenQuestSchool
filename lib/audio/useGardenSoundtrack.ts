'use client';

import { useEffect, useRef } from 'react';

/**
 * Soft, warm, garden-inspired ambient soundtrack — synthesized live in
 * the browser via Web Audio. No audio files. Goal: a Miyazaki morning-
 * meadow that breathes naturally without ever feeling like a wobbly LFO.
 *
 * Architecture:
 *   ┌── sub-bass drone (steady C2, very quiet) ──┐
 *   ├── 4 pad voices (triangle, slow chord swap) ┤── lowpass 800Hz ──┐
 *   ├── wind layer (filtered pink noise, swells) ┤                    ├── delay reverb ──┐
 *   └── pentatonic pings (long irregular)         ┘                    │                  │
 *                                                                      │                  │
 *                                                                      └── master ────────┴── destination
 *
 * Differences vs the previous version:
 *  - LFOs are slower (≤ 0.025 Hz) and shallower (±2 cent detune, gain
 *    swings within a non-zero range), so no perceptible wobble
 *  - Voices fade in and out *independently* on different timescales,
 *    so the chord constantly evolves without anything pulsing
 *  - Triangle waves with mild low-pass give warmer, woodier tone than
 *    pure sines
 *  - Slow chord progression (CMaj ↔ Am7) — one voice at a time slides
 *    to a neighbor tone every ~45–80s
 *  - Filtered pink-noise "wind" layer adds organic breath
 *  - Gentle delay-feedback "reverb" tail for spaciousness
 *
 * Mounted from the garden page when settings.gardenSoundtrack is true.
 * Properly cleans up the AudioContext on unmount or when toggled off.
 */
export function useGardenSoundtrack({
  enabled, volume,
}: {
  enabled: boolean;
  volume: number;  // 0..0.5
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

    // ── Master + warm low-pass + soft delay reverb ───────────────────
    const master = ctx.createGain();
    master.gain.value = clampVol(volume);
    master.connect(ctx.destination);
    masterRef.current = master;

    // Gentle delay → feedback for "small wooden room" reverb feel
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.32;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;  // moderate tail; not muddy
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(feedback).connect(delay);   // feedback loop
    delay.connect(wet).connect(master);

    // Whole bus warmth — keep highs out so it never feels brittle
    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = 850;
    warmFilter.Q.value = 0.6;
    warmFilter.connect(master);
    warmFilter.connect(delay);  // also feeds the reverb

    // ── 1) Sub-bass drone (steady, very quiet) ───────────────────────
    {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 65.41;  // C2
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 6);
      osc.connect(g).connect(warmFilter);
      osc.start();
      cleanupFns.current.push(() => {
        const t = ctx.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + 1.5);
        try { osc.stop(t + 1.6); } catch {}
      });
    }

    // ── 2) Four pad voices — independently fading + slow chord swap ─
    //
    // Two chords share three notes (C, E, G). The fourth voice slowly
    // alternates between B (Cmaj7-ish) and A (Am7), giving the pad
    // a tide-like harmonic motion without any single voice oscillating.
    //
    // Voice 0: C  (130.81 Hz)  — steady
    // Voice 1: E  (164.81 Hz)  — steady, but fades in/out
    // Voice 2: G  (196.00 Hz)  — steady, fades on a different period
    // Voice 3: B/A (246.94 / 220.00) — slowly alternates
    //
    const padVoices = [
      { freq: 130.81, peakGain: 0.18, fadePeriodSec: 47, fadeOffsetSec: 0,  alt: null },
      { freq: 164.81, peakGain: 0.14, fadePeriodSec: 53, fadeOffsetSec: 11, alt: null },
      { freq: 196.00, peakGain: 0.12, fadePeriodSec: 61, fadeOffsetSec: 23, alt: null },
      { freq: 246.94, peakGain: 0.10, fadePeriodSec: 71, fadeOffsetSec: 38, alt: 220.00 }, // B↔A
    ];

    padVoices.forEach((voice, idx) => {
      // Two slightly-detuned triangle oscillators per voice for chorus
      const oscs: OscillatorNode[] = [];
      [-1, 1].forEach(side => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = voice.freq;
        osc.detune.value = side * 2;  // very subtle
        oscs.push(osc);
      });
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0;  // started silent, swelled below
      oscs.forEach(o => o.connect(voiceGain));
      voiceGain.connect(warmFilter);

      // Slow per-voice gain swell — uses scheduled ramps (not an LFO)
      // so different voices breathe at different rhythms without ever
      // sounding like the same wobble. Range: 25%..100% of peak gain
      // (never silent → no fade-in clicks).
      const startTime = ctx.currentTime;
      const initialDelay = 2 + idx * 1.5;  // staggered intro
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(voice.peakGain * 0.6, startTime + initialDelay + 4);

      let phase = 0;
      const swellTimer = setInterval(() => {
        if (!ctxRef.current) return;
        const t = ctxRef.current.currentTime;
        const targetMul = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos((phase + voice.fadeOffsetSec) * 2 * Math.PI / voice.fadePeriodSec));
        const target = voice.peakGain * targetMul;
        // Long target ramp so changes are imperceptibly slow
        voiceGain.gain.setTargetAtTime(target, t, 8);
        phase += 4;  // 4 seconds since last tick
      }, 4000);
      timersRef.current.push(swellTimer as any);

      // Voice 3: alternate between B and A every ~80s
      if (voice.alt !== null) {
        let onAlt = false;
        const swapTimer = setInterval(() => {
          if (!ctxRef.current) return;
          const t = ctxRef.current.currentTime;
          const next = onAlt ? voice.freq : (voice.alt as number);
          oscs.forEach((o, k) => {
            o.frequency.cancelScheduledValues(t);
            o.frequency.setValueAtTime(o.frequency.value, t);
            o.frequency.linearRampToValueAtTime(next, t + 6);  // 6-second slide
          });
          onAlt = !onAlt;
        }, 80000);
        timersRef.current.push(swapTimer as any);
      }

      oscs.forEach(o => o.start());

      cleanupFns.current.push(() => {
        const t = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(t);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, t);
        voiceGain.gain.linearRampToValueAtTime(0, t + 1.5);
        oscs.forEach(o => { try { o.stop(t + 1.6); } catch {} });
      });
    });

    // ── 3) Wind layer — filtered pink noise that swells in waves ────
    {
      const dur = 4;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buf.getChannelData(0);
      // Voss-style pink-ish noise (cheap)
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;

      // Bandpass → only mid-low frequencies → gentle wind whoosh
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 350;
      bp.Q.value = 0.9;

      const windGain = ctx.createGain();
      windGain.gain.value = 0;

      noise.connect(bp).connect(windGain).connect(warmFilter);
      noise.start();

      // Slowly swell the wind in/out over ~60s cycles
      const startTime = ctx.currentTime;
      windGain.gain.setValueAtTime(0, startTime);
      windGain.gain.linearRampToValueAtTime(0.04, startTime + 8);
      let phase = 0;
      const windTimer = setInterval(() => {
        if (!ctxRef.current) return;
        const t = ctxRef.current.currentTime;
        // Range 0.01..0.06, slow cosine
        const target = 0.035 + 0.025 * Math.cos(phase * 2 * Math.PI / 67);
        windGain.gain.setTargetAtTime(target, t, 6);
        phase += 4;
      }, 4000);
      timersRef.current.push(windTimer as any);

      cleanupFns.current.push(() => {
        const t = ctx.currentTime;
        windGain.gain.cancelScheduledValues(t);
        windGain.gain.setValueAtTime(windGain.gain.value, t);
        windGain.gain.linearRampToValueAtTime(0, t + 1.5);
        try { noise.stop(t + 1.6); } catch {}
      });
    }

    // ── 4) Pentatonic chime pings — irregular, soft, with reverb ────
    const pentatonic = [
      261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 880.00, 1046.50,
    ];
    const playPing = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;
      const c = ctxRef.current;
      // Sometimes a single tone, sometimes a soft 3rd-apart dyad
      const useDyad = Math.random() < 0.25;
      const baseIdx = Math.floor(Math.random() * (pentatonic.length - 2));
      const freqs = useDyad ? [pentatonic[baseIdx], pentatonic[baseIdx + 2]] : [pentatonic[baseIdx]];
      const dur = 3.0;
      const now = c.currentTime;

      freqs.forEach((freq, i) => {
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.14, now + 0.06 + i * 0.04);
        g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
        const pan = c.createStereoPanner ? c.createStereoPanner() : null;
        if (pan) {
          pan.pan.value = (Math.random() * 2 - 1) * 0.55;
          osc.connect(g).connect(pan).connect(warmFilter);
        } else {
          osc.connect(g).connect(warmFilter);
        }
        osc.start(now);
        osc.stop(now + dur + 0.2);
      });

      // 14–38 seconds until next ping (more sparse than before)
      const nextDelay = 14000 + Math.random() * 24000;
      const t = setTimeout(playPing, nextDelay);
      timersRef.current.push(t);
    };
    // First ping after the pad has a chance to settle
    timersRef.current.push(setTimeout(playPing, 18000 + Math.random() * 10000));

    // ── Cleanup ──────────────────────────────────────────────────────
    return () => {
      cleanupFns.current.forEach(fn => { try { fn(); } catch {} });
      cleanupFns.current = [];
      timersRef.current.forEach(t => clearTimeout(t as any));
      timersRef.current.forEach(t => clearInterval(t as any));
      timersRef.current = [];
      const toClose = ctx;
      setTimeout(() => { try { toClose.close(); } catch {} }, 1800);
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, [enabled]);

  // Update master volume live without restarting the soundtrack
  useEffect(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;
    master.gain.setTargetAtTime(clampVol(volume), ctx.currentTime, 0.5);
  }, [volume]);
}

function clampVol(v: number): number {
  return Math.min(Math.max(v, 0), 0.5);
}
