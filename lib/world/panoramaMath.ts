// Pure math for the portrait "panorama" viewport.
//
// The garden worlds are wide landscape paintings (e.g. 1440×800). On a
// portrait screen, letterboxing the whole painting makes everything
// tiny. Instead we show a full-height vertical window onto the world
// and let the child drag sideways. The window is expressed directly in
// SVG viewBox units, so tap coordinates keep working untouched.

export interface PanWindow {
  /** True when the container is meaningfully narrower than the world —
   *  i.e. panning mode should engage. */
  active: boolean;
  /** Width of the visible window in world units (= worldW when inactive). */
  visibleW: number;
  /** Highest allowed pan offset (0 when inactive). */
  maxPan: number;
}

/**
 * Compute the pan window for a container. Activates only for clearly
 * tall shapes (portrait tablets/phones). 4:3 landscape (iPad) must
 * stay on the whole-world letterboxed fit it has always had — its
 * aspect (1.33) sits above worldAspect(1.8) × 0.7 = 1.26.
 */
export function panWindow(
  worldW: number, worldH: number,
  containerW: number, containerH: number,
): PanWindow {
  if (containerW <= 0 || containerH <= 0) {
    return { active: false, visibleW: worldW, maxPan: 0 };
  }
  const containerAspect = containerW / containerH;
  const worldAspect = worldW / worldH;
  const active = containerAspect < worldAspect * 0.7;
  if (!active) return { active: false, visibleW: worldW, maxPan: 0 };
  const visibleW = worldH * containerAspect;
  return { active: true, visibleW, maxPan: Math.max(0, worldW - visibleW) };
}

export function clampPan(panX: number, maxPan: number): number {
  return Math.min(Math.max(panX, 0), maxPan);
}

/** Pan offset that centers the window on a world x-coordinate. */
export function centeredPan(centerX: number, visibleW: number, maxPan: number): number {
  return clampPan(centerX - visibleW / 2, maxPan);
}
