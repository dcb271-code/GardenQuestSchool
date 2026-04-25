'use client';

import { useEffect, useRef } from 'react';

/**
 * Soft, warm, garden-inspired ambient soundtrack — synthesized live in
 * the browser via Web Audio. No audio files.
 *
 * Design goal v3: GROUNDED, not active. The previous versions had
 * overlapping motion (gain swells + wind swells + chord shifts +
 * frequent pings) that read as vertigo. This version is closer to
 * Brian Eno "Music for Airports" — a single held chord with very rare
 * pentatonic chimes drifting in. You should barely notice it.
 *
 * Layers:
 *   - 4 pad voices in Cmaj add9 (C4, E4, G4, D5) — held STEADY after
 *     fade-in. No gain LFOs, no swells, no chord swaps.
 *   - 4 sustained voices that stay where they are.
 *   - Occasional pentatonic chime (every 30–80s, very soft, only when
 *     consonant with the chord).
 *   - Subtle delay tail for spaciousness.
 *
 * That's it. No sub-bass, no wind layer, no chord shifts. The chord
 * just holds — same way the garden visual just sits there breathing.
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

    // Master — hard cap at 0.35 so even maxed it stays peripheral
    const master = ctx.createGain();
    master.gain.value = clampVol(volume);
    master.connect(ctx.destination);
    masterRef.current = master;

    // Subtle delay for spaciousness — no aggressive feedback
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.18;
    const wet = ctx.createGain();
    wet.gain.value = 0.18;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(master);

    // Whole-bus warmth
    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = 1100;
    warmFilter.Q.value = 0.5;
    warmFilter.connect(master);
    warmFilter.connect(delay);

    // ── PAD: Cmaj add9, held steady ─────────────────────────────────
    // C4, E4, G4, D5 — bright, hopeful, never minor.
    // Each voice is two slightly-detuned triangles for chorus shimmer,
    // then ramps to peak gain over a slow fade-in and STAYS there.
    const padVoices = [
      { freq: 261.63, peakGain: 0.13 },  // C4
      { freq: 329.63, peakGain: 0.11 },  // E4
      { freq: 392.00, peakGain: 0.10 },  // G4
      { freq: 587.33, peakGain: 0.07 },  // D5 (the sweetening 9th)
    ];

    padVoices.forEach((voice, idx) => {
      const oscs: OscillatorNode[] = [];
      [-1, 1].forEach(side => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = voice.freq;
        osc.detune.value = side * 2;  // very subtle chorus
        oscs.push(osc);
      });
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0;
      oscs.forEach(o => o.connect(voiceGain));
      voiceGain.connect(warmFilter);

      // Slow staggered fade-in. Then HOLD. No swells.
      const startTime = ctx.currentTime;
      const initialDelay = 1.5 + idx * 1.5;
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(voice.peakGain, startTime + initialDelay + 6);
      // Do nothing else. The voice just holds.

      oscs.forEach(o => o.start());

      cleanupFns.current.push(() => {
        const t = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(t);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, t);
        voiceGain.gain.linearRampToValueAtTime(0, t + 1.5);
        oscs.forEach(o => { try { o.stop(t + 1.6); } catch {} });
      });
    });

    // ── PINGS: rare, soft, consonant ────────────────────────────────
    // Only notes that land sweetly on a Cmaj add9 chord: C major
    // pentatonic (C, D, E, G, A) across two octaves.
    const consonantPings = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00,
    ];
    const playPing = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;
      const c = ctxRef.current;
      const freq = consonantPings[Math.floor(Math.random() * consonantPings.length)];
      const dur = 3.0;
      const now = c.currentTime;

      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09, now + 0.05);  // softer peak
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      const pan = c.createStereoPanner ? c.createStereoPanner() : null;
      if (pan) {
        pan.pan.value = (Math.random() * 2 - 1) * 0.5;
        osc.connect(g).connect(pan).connect(warmFilter);
      } else {
        osc.connect(g).connect(warmFilter);
      }
      osc.start(now);
      osc.stop(now + dur + 0.2);

      // 30–80 seconds until next ping (very sparse, meditative)
      const nextDelay = 30000 + Math.random() * 50000;
      const t = setTimeout(playPing, nextDelay);
      timersRef.current.push(t);
    };
    // First ping after the pad has fully settled
    timersRef.current.push(setTimeout(playPing, 35000 + Math.random() * 20000));

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

  // Live volume update
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
