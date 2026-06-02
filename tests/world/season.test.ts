import { describe, it, expect } from 'vitest';
import { currentSeason, floraCodesInSeason } from '@/lib/world/season';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

describe('currentSeason', () => {
  it('maps spring months (Mar–May)', () => {
    expect(currentSeason(3)).toBe('spring');
    expect(currentSeason(4)).toBe('spring');
    expect(currentSeason(5)).toBe('spring');
  });
  it('maps summer months (Jun–Aug)', () => {
    expect(currentSeason(6)).toBe('summer');
    expect(currentSeason(7)).toBe('summer');
    expect(currentSeason(8)).toBe('summer');
  });
  it('maps fall months (Sep–Nov)', () => {
    expect(currentSeason(9)).toBe('fall');
    expect(currentSeason(10)).toBe('fall');
    expect(currentSeason(11)).toBe('fall');
  });
  it('maps winter months (Dec, Jan, Feb)', () => {
    expect(currentSeason(12)).toBe('winter');
    expect(currentSeason(1)).toBe('winter');
    expect(currentSeason(2)).toBe('winter');
  });
  it('throws on out-of-range months', () => {
    expect(() => currentSeason(0)).toThrow(/month/i);
    expect(() => currentSeason(13)).toThrow(/month/i);
  });
});

describe('floraCodesInSeason', () => {
  it('returns only species whose seasons include the given season', () => {
    const spring = floraCodesInSeason('spring');
    for (const code of spring) {
      const sp = FLORA_CATALOG.find(f => f.code === code)!;
      expect(sp.seasons).toContain('spring');
    }
  });
  it('summer includes cardinal_flower (summer bloomer)', () => {
    expect(floraCodesInSeason('summer')).toContain('cardinal_flower');
  });
  it('winter excludes spring-only ephemerals like virginia_bluebells', () => {
    expect(floraCodesInSeason('winter')).not.toContain('virginia_bluebells');
  });
  it('winter still has content (evergreen trees seeded all-season)', () => {
    expect(floraCodesInSeason('winter').length).toBeGreaterThan(0);
  });
  it('every returned code is a real catalog code', () => {
    const all = new Set(FLORA_CATALOG.map(f => f.code));
    for (const code of floraCodesInSeason('fall')) {
      expect(all.has(code)).toBe(true);
    }
  });
});
