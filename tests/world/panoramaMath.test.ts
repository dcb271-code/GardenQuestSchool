import { describe, it, expect } from 'vitest';
import { panWindow, clampPan, centeredPan } from '@/lib/world/panoramaMath';

describe('panoramaMath — portrait panorama viewport', () => {
  it('inactive in landscape: full world, no pan', () => {
    const w = panWindow(1440, 800, 1280, 720);
    expect(w.active).toBe(false);
    expect(w.visibleW).toBe(1440);
    expect(w.maxPan).toBe(0);
  });

  it('active on a portrait wall tablet (1080×1920)', () => {
    const w = panWindow(1440, 800, 1080, 1920);
    expect(w.active).toBe(true);
    // window fills the height: visibleW = 800 * (1080/1920) = 450
    expect(w.visibleW).toBeCloseTo(450);
    expect(w.maxPan).toBeCloseTo(1440 - 450);
  });

  it('stays inactive for mildly-narrow near-landscape shapes', () => {
    // 4:3 monitor — letterboxing is mild, keep the whole-world view.
    const w = panWindow(1440, 800, 1024, 768);
    expect(w.active).toBe(false);
  });

  it('handles zero-size containers safely (pre-measure SSR)', () => {
    const w = panWindow(1440, 800, 0, 0);
    expect(w.active).toBe(false);
    expect(w.maxPan).toBe(0);
  });

  it('clampPan bounds the window to the world', () => {
    expect(clampPan(-50, 990)).toBe(0);
    expect(clampPan(400, 990)).toBe(400);
    expect(clampPan(2000, 990)).toBe(990);
  });

  it('centeredPan centers a landmark and clamps at edges', () => {
    // 450-wide window centered on x=320 → pan 95
    expect(centeredPan(320, 450, 990)).toBeCloseTo(95);
    // near the left edge → clamped to 0
    expect(centeredPan(100, 450, 990)).toBe(0);
    // near the right edge → clamped to maxPan
    expect(centeredPan(1400, 450, 990)).toBe(990);
  });
});
