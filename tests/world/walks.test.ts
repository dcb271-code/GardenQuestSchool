// tests/world/walks.test.ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { WALK_KINDS, getWalk, walkHref } from '@/lib/world/walks';
import type { Season } from '@/lib/world/floraCatalog';

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

describe('WALK_KINDS', () => {
  it('has unique codes and titles', () => {
    expect(new Set(WALK_KINDS.map(w => w.code)).size).toBe(WALK_KINDS.length);
    expect(new Set(WALK_KINDS.map(w => w.title)).size).toBe(WALK_KINDS.length);
  });

  it('every walk points at a route that actually exists', () => {
    // The whole point of this file is that adding mushrooms is one
    // array entry. That only works if a typo'd path fails here rather
    // than as a 404 in front of a seven-year-old.
    for (const w of WALK_KINDS) {
      expect(w.path.startsWith('/'), w.code).toBe(true);
      const segments = w.path.replace(/^\//, '').split('/');
      const candidates = [
        join(process.cwd(), 'app', '(child)', ...segments, 'page.tsx'),
        join(process.cwd(), 'app', ...segments, 'page.tsx'),
      ];
      expect(
        candidates.some(existsSync),
        `${w.code} → ${w.path} has no page.tsx (looked in ${candidates.join(' , ')})`,
      ).toBe(true);
    }
  });

  it('covers both of the walks that exist today', () => {
    expect(WALK_KINDS.map(w => w.code).sort()).toEqual(['birds', 'flora']);
  });

  it('every walk says something useful in every season', () => {
    for (const w of WALK_KINDS) {
      for (const s of SEASONS) {
        const note = w.note(s);
        // Null is allowed by the type — nothing worth saying beats
        // filler — but a blank string is just a bug.
        if (note !== null) expect(note.trim().length, `${w.code}/${s}`).toBeGreaterThan(10);
      }
    }
  });

  it('the seasonal notes actually differ by season', () => {
    // If they were constant they would be blurbs, not seasonal notes,
    // and the whole reason for the season argument would be a lie.
    for (const w of WALK_KINDS) {
      const notes = SEASONS.map(s => w.note(s));
      expect(new Set(notes).size, `${w.code} says the same thing all year`).toBeGreaterThan(1);
    }
  });

  it('tells the truth about bird song being seasonal', () => {
    // Songs are territorial and mostly March–July; calls are
    // year-round. Getting this backwards would send her out listening
    // for the wrong thing.
    const birds = getWalk('birds')!;
    expect(birds.note('spring')!.toLowerCase()).toMatch(/sing/);
    expect(birds.note('winter')!.toLowerCase()).toMatch(/call/);
    expect(birds.note('fall')!.toLowerCase()).toMatch(/call/);
  });

  it('resolves by code, and not by nonsense', () => {
    expect(getWalk('birds')?.path).toBe('/birds');
    expect(getWalk('mushrooms')).toBeUndefined();
  });

  it('builds an href carrying the learner', () => {
    const href = walkHref(getWalk('flora')!, 'abc-123');
    expect(href).toBe('/naturalist/walk?learner=abc-123');
  });

  it('escapes a learner id that needs it', () => {
    expect(walkHref(getWalk('birds')!, 'a b&c')).toBe('/birds?learner=a%20b%26c');
  });
});
