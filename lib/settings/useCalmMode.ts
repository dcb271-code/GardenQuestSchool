'use client';

// Calm mode: trims the DECORATIVE animation load (ambient creature
// swarms, pulsing glow rings, wandering chickens) on devices that
// can't keep up — wall-mounted calendar tablets, old iPads — while
// leaving interaction feedback (tap scales, walk-to-structure,
// celebrations) fully animated. Distinct from reducedMotion, which is
// an accessibility choice that stills everything.
//
// 'auto' measures reality instead of sniffing user agents: on first
// visit we sample ~50 animation frames and look at the MEDIAN frame
// time. A healthy 60fps device medians ~16.7ms; anything over 22ms
// (≈45fps under idle load) will visibly chug once the garden's
// ambient layer piles on, so it gets calm mode. The verdict is cached
// per device for a week.

import { useEffect, useState } from 'react';
import { useAccessibilitySettings } from './useAccessibilitySettings';

const VERDICT_KEY = 'gqs:calm-verdict';
const VERDICT_TTL_MS = 7 * 24 * 3600 * 1000;
const SAMPLE_FRAMES = 50;
const SLOW_MEDIAN_MS = 22;

interface CachedVerdict { calm: boolean; at: number }

function readCachedVerdict(): CachedVerdict | null {
  try {
    const raw = window.localStorage.getItem(VERDICT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedVerdict;
    if (typeof parsed.calm !== 'boolean' || typeof parsed.at !== 'number') return null;
    if (Date.now() - parsed.at > VERDICT_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function medianFrameIsSlow(deltas: number[], threshold = SLOW_MEDIAN_MS): boolean {
  if (deltas.length === 0) return false;
  const sorted = [...deltas].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] > threshold;
}

/** True when decorative animations should be trimmed. */
export function useCalmMode(): boolean {
  const { settings } = useAccessibilitySettings();
  const [autoCalm, setAutoCalm] = useState(false);

  useEffect(() => {
    if (settings.animationLevel !== 'auto') return;
    const cached = readCachedVerdict();
    if (cached) {
      setAutoCalm(cached.calm);
      return;
    }
    // Measure. Skip the first few frames (page settle), then sample.
    let raf = 0;
    let last = 0;
    let warmup = 8;
    const deltas: number[] = [];
    const tick = (t: number) => {
      if (last > 0) {
        if (warmup > 0) warmup -= 1;
        else deltas.push(t - last);
      }
      last = t;
      if (deltas.length < SAMPLE_FRAMES) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const calm = medianFrameIsSlow(deltas);
      setAutoCalm(calm);
      try {
        window.localStorage.setItem(VERDICT_KEY, JSON.stringify({ calm, at: Date.now() }));
      } catch { /* private mode etc. */ }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [settings.animationLevel]);

  if (settings.animationLevel === 'calm') return true;
  if (settings.animationLevel === 'full') return false;
  return autoCalm;
}
