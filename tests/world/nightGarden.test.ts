import { describe, it, expect } from 'vitest';
import {
  NIGHT_MOTHS, CONSTELLATIONS, canVisitTonight, mothForTonight,
  nightGardenOpen, moonPlantCodes, getConstellation,
} from '@/lib/world/nightGarden';
import { getSpeciesByCode } from '@/lib/world/speciesCatalog';

describe('night garden', () => {
  it('every moth it can send exists in the species catalog', () => {
    for (const code of NIGHT_MOTHS) {
      expect(getSpeciesByCode(code), `${code} missing from catalog`).toBeDefined();
    }
  });

  // The moonflower's own pollinator has to come first, or the first
  // thing she learns is not why any of this happens.
  it('sends the moonflower pollinator first', () => {
    expect(mothForTonight([])).toBe('pink_spotted_hawkmoth');
  });

  it('walks the roster in order and never repeats', () => {
    const seen: string[] = [];
    for (let i = 0; i < NIGHT_MOTHS.length; i++) {
      const next = mothForTonight(seen)!;
      expect(seen).not.toContain(next);
      seen.push(next);
    }
    expect(seen).toEqual([...NIGHT_MOTHS]);
    expect(mothForTonight(seen)).toBeNull();
  });

  it('allows one visit a night and no more', () => {
    expect(canVisitTonight({}, '2026-08-08')).toBe(true);
    expect(canVisitTonight({ lastVisit: '2026-08-08' }, '2026-08-08')).toBe(false);
    expect(canVisitTonight({ lastVisit: '2026-08-07' }, '2026-08-08')).toBe(true);
  });

  it('stays shut unless a moon plant is blooming', () => {
    expect(nightGardenOpen([])).toBe(false);
    expect(nightGardenOpen(['tulip', 'sunflower'])).toBe(false);
    expect(nightGardenOpen(['moonflower'])).toBe(true);
  });

  it('knows the moon quadrant', () => {
    expect(moonPlantCodes()).toContain('moonflower');
    expect(moonPlantCodes()).not.toContain('tulip');
  });

  describe('the sky', () => {
    it('every constellation line joins stars that exist', () => {
      for (const c of CONSTELLATIONS) {
        for (const [a, b] of c.lines) {
          expect(c.stars[a], `${c.code} line start ${a}`).toBeDefined();
          expect(c.stars[b], `${c.code} line end ${b}`).toBeDefined();
        }
      }
    });

    it('keeps every star inside the drawing box', () => {
      for (const c of CONSTELLATIONS) {
        for (const s of c.stars) {
          expect(s.x).toBeGreaterThanOrEqual(0);
          expect(s.x).toBeLessThanOrEqual(100);
          expect(s.y).toBeGreaterThanOrEqual(0);
          expect(s.y).toBeLessThanOrEqual(100);
        }
      }
    });

    // A constellation with an unjoined star draws a floating dot that
    // is not part of the shape she is being told to look for.
    it('joins every star into the figure', () => {
      for (const c of CONSTELLATIONS) {
        const joined = new Set(c.lines.flat());
        for (let i = 0; i < c.stars.length; i++) {
          expect(joined.has(i), `${c.code} star ${i} is not connected`).toBe(true);
        }
      }
    });

    it('has unique codes and is retrievable', () => {
      const codes = CONSTELLATIONS.map(c => c.code);
      expect(new Set(codes).size).toBe(codes.length);
      expect(getConstellation('big_dipper')?.name).toBe('The Big Dipper');
    });
  });
});
