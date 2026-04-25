'use client';

import { useEffect, useRef } from 'react';

/**
 * Soft, warm, garden-inspired ambient soundtrack — synthesized live in
 * the browser via Web Audio. No audio files. The vibe target is a
 * Miyazaki morning-meadow: a slow-breathing chord pad with occasional
 * pentatonic "wind chime" pings drifting in from the distance.
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
  const pingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    let ctx: AudioContext;
    try {
      ctx = new Ctx();
    } catch {
      return;
    }
    ctxRef.current = ctx;

    // Master gain — clamped to a safe ceiling
    const master = ctx.createGain();
    master.gain.value = Math.min(Math.max(volume, 0), 0.5);
    master.connect(ctx.destination);
    masterRef.current = master;

    // Soft low-pass on the whole bus for warmth (no high-frequency edge)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1200;
    lowpass.Q.value = 0.5;
    lowpass.connect(master);

    // ── PAD ──────────────────────────────────────────────
    // A floating chord: C2 (root), G3 (fifth), E4 (third up), B4
    // (extension). Each oscillator pair (left+right) has a slow LFO
    // detune and a slow gain swell that breathes.
    const padNotes = [
      { freq: 130.81, gain: 0.55 },  // C3
      { freq: 196.00, gain: 0.40 },  // G3
      { freq: 329.63, gain: 0.30 },  // E4
      { freq: 493.88, gain: 0.18 },  // B4
    ];

    padNotes.forEach((note, i) => {
      // Two oscillators per voice for a chorus shimmer
      [-1, 1].forEach(side => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        osc.detune.value = side * 4;  // small chorus
        const g = ctx.createGain();
        g.gain.value = 0;

        // Slow LFO on detune for movement
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.07 + i * 0.013;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 6 + i * 1.5;
        lfo.connect(lfoGain).connect(osc.detune);

        // Slow gain breathing LFO so the pad doesn't feel static
        const ampLfo = ctx.createOscillator();
        ampLfo.type = 'sine';
        ampLfo.frequency.value = 0.04 + i * 0.011;
        const ampLfoGain = ctx.createGain();
        ampLfoGain.gain.value = note.gain * 0.4;
        ampLfo.connect(ampLfoGain).connect(g.gain);

        osc.connect(g).connect(lowpass);

        const now = ctx.currentTime;
        // Ramp up slowly to avoid a "click" on start
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(note.gain, now + 4);

        osc.start(now);
        lfo.start(now);
        ampLfo.start(now);

        cleanupFns.current.push(() => {
          try {
            const t = ctx.currentTime;
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(g.gain.value, t);
            g.gain.linearRampToValueAtTime(0, t + 1.5);
            osc.stop(t + 1.6);
            lfo.stop(t + 1.6);
            ampLfo.stop(t + 1.6);
          } catch {}
        });
      });
    });

    // ── WIND-CHIME PINGS ────────────────────────────────────
    // Pentatonic notes at long, irregular intervals. Each ping is a
    // sine note with a long release, low gain, panned around the field.
    const pentatonic = [
      261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 880.00, 1046.50,
    ];
    const playPing = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;
      const c = ctxRef.current;
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const now = c.currentTime;
      const dur = 2.4;

      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      const pan = c.createStereoPanner ? c.createStereoPanner() : null;
      if (pan) {
        pan.pan.value = (Math.random() * 2 - 1) * 0.6;
        osc.connect(g).connect(pan).connect(lowpass);
      } else {
        osc.connect(g).connect(lowpass);
      }
      osc.start(now);
      osc.stop(now + dur + 0.1);

      // 8–24 seconds until next ping (irregular)
      const nextDelay = 8000 + Math.random() * 16000;
      pingTimerRef.current = setTimeout(playPing, nextDelay);
    };
    // First ping after a short settle so the pad starts alone
    pingTimerRef.current = setTimeout(playPing, 6000 + Math.random() * 4000);

    return () => {
      // Run all the per-osc cleanup
      cleanupFns.current.forEach(fn => fn());
      cleanupFns.current = [];
      if (pingTimerRef.current) {
        clearTimeout(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      // Close context after the fade
      const toClose = ctx;
      setTimeout(() => {
        try { toClose.close(); } catch {}
      }, 1800);
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, [enabled]);

  // Update master volume live without restarting the soundtrack
  useEffect(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;
    const v = Math.min(Math.max(volume, 0), 0.5);
    master.gain.setTargetAtTime(v, ctx.currentTime, 0.5);
  }, [volume]);
}
