import { describe, it, expect } from 'vitest';
import { selectWalkSpecies, type ReviewRow } from '@/lib/naturalist/walkSelection';

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEASON_POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const NOW = new Date('2026-06-02T12:00:00.000Z');

describe('selectWalkSpecies', () => {
  it('returns n distinct codes from the season pool', () => {
    const picked = selectWalkSpecies({
      seasonPool: SEASON_POOL,
      reviewRows: [],
      n: 3,
      now: NOW,
      rng: seededRng(1),
    });
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    for (const c of picked) expect(SEASON_POOL).toContain(c);
  });

  it('is deterministic given the same seed', () => {
    const opts = { seasonPool: SEASON_POOL, reviewRows: [] as ReviewRow[], n: 4, now: NOW };
    const a = selectWalkSpecies({ ...opts, rng: seededRng(7) });
    const b = selectWalkSpecies({ ...opts, rng: seededRng(7) });
    expect(a).toEqual(b);
  });

  it('only picks season-appropriate species (never out-of-season)', () => {
    const reviewRows: ReviewRow[] = [
      // a due row that is OUT of season must not be selected
      { flora_code: 'OUT_OF_SEASON', exposures: 2, next_review_at: '2026-01-01T00:00:00.000Z', photo_roles_seen: [] },
    ];
    const picked = selectWalkSpecies({
      seasonPool: SEASON_POOL, reviewRows, n: 4, now: NOW, rng: seededRng(2),
    });
    expect(picked).not.toContain('OUT_OF_SEASON');
  });

  it('prefers DUE species when many are due', () => {
    // Make a,b,c,d,e all due; f-j are new. With n=3 and 50% due weight,
    // at least one due species should appear across deterministic runs.
    const reviewRows: ReviewRow[] = ['a', 'b', 'c', 'd', 'e'].map(code => ({
      flora_code: code, exposures: 2,
      next_review_at: '2026-05-01T00:00:00.000Z', // past = due
      photo_roles_seen: [],
    }));
    const due = new Set(['a', 'b', 'c', 'd', 'e']);
    let dueHits = 0;
    for (let seed = 0; seed < 20; seed++) {
      const picked = selectWalkSpecies({
        seasonPool: SEASON_POOL, reviewRows, n: 3, now: NOW, rng: seededRng(seed),
      });
      if (picked.some(c => due.has(c))) dueHits++;
    }
    expect(dueHits).toBeGreaterThan(15); // due appears in the vast majority
  });

  it('falls back gracefully when n exceeds distinct available', () => {
    const picked = selectWalkSpecies({
      seasonPool: ['x', 'y'], reviewRows: [], n: 4, now: NOW, rng: seededRng(3),
    });
    // Can only return 2 distinct even though 4 requested.
    expect(picked).toHaveLength(2);
    expect(new Set(picked).size).toBe(2);
  });

  it('does not select a future-review species into the DUE bucket but may still wildcard it', () => {
    const reviewRows: ReviewRow[] = [
      { flora_code: 'a', exposures: 3, next_review_at: '2026-12-31T00:00:00.000Z', photo_roles_seen: [] },
    ];
    // 'a' is not due, but it IS season-appropriate, so wildcard may still pick it.
    // Just assert no crash and valid output.
    const picked = selectWalkSpecies({
      seasonPool: SEASON_POOL, reviewRows, n: 3, now: NOW, rng: seededRng(4),
    });
    expect(picked).toHaveLength(3);
    for (const c of picked) expect(SEASON_POOL).toContain(c);
  });

  it('throws if n < 1', () => {
    expect(() => selectWalkSpecies({
      seasonPool: SEASON_POOL, reviewRows: [], n: 0, now: NOW, rng: seededRng(0),
    })).toThrow(/at least 1/i);
  });

  it('returns empty array when season pool is empty', () => {
    const picked = selectWalkSpecies({
      seasonPool: [], reviewRows: [], n: 3, now: NOW, rng: seededRng(0),
    });
    expect(picked).toEqual([]);
  });
});
