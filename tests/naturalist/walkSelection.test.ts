import { describe, it, expect } from 'vitest';
import { pickWalkSpecies, type Rng } from '@/lib/naturalist/walkSelection';

function seededRng(seed: number): Rng {
  // Mulberry32 — small deterministic PRNG, no deps.
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

describe('pickWalkSpecies', () => {
  it('returns n distinct codes from the pool', () => {
    const picked = pickWalkSpecies(ALL, 3, seededRng(42));
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    for (const code of picked) expect(ALL).toContain(code);
  });

  it('is deterministic given the same seed', () => {
    const a = pickWalkSpecies(ALL, 3, seededRng(99));
    const b = pickWalkSpecies(ALL, 3, seededRng(99));
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = pickWalkSpecies(ALL, 4, seededRng(1));
    const b = pickWalkSpecies(ALL, 4, seededRng(2));
    expect(a).not.toEqual(b);
  });

  it('throws if n > pool size', () => {
    expect(() => pickWalkSpecies(['x'], 2, seededRng(0))).toThrow(/not enough/i);
  });

  it('throws if n < 1', () => {
    expect(() => pickWalkSpecies(ALL, 0, seededRng(0))).toThrow(/at least 1/i);
  });

  it('handles n = pool size by returning all (shuffled)', () => {
    const picked = pickWalkSpecies(['a', 'b'], 2, seededRng(7));
    expect(picked.sort()).toEqual(['a', 'b']);
  });
});
