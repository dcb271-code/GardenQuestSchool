import { describe, it, expect } from 'vitest';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';

describe('habitat interest tags', () => {
  const knownTags = new Set(
    [...MATH_SKILLS, ...READING_SKILLS].flatMap(s => s.themeTags),
  );

  it('every habitat has at least one interest tag', () => {
    for (const h of HABITAT_CATALOG) {
      expect(h.interestTags.length, h.code).toBeGreaterThan(0);
    }
  });

  it('every interest tag matches a real skill themeTag (else it can never bias anything)', () => {
    for (const h of HABITAT_CATALOG) {
      for (const tag of h.interestTags) {
        expect(knownTags.has(tag), `${h.code}: '${tag}' matches no skill themeTag`).toBe(true);
      }
    }
  });
});
