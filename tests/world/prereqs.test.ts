// tests/world/prereqs.test.ts — outgrown skills still count.

import { describe, it, expect } from 'vitest';
import { effectivelyMastered, unmetPrereqs, type SkillNode } from '@/lib/world/prereqs';

// A slice of the real math ladder, including the edge that matters:
// place value tens/ones stands on counting to fifty.
const SKILLS: SkillNode[] = [
  { code: 'math.counting.to_20', prereqSkillCodes: [] },
  { code: 'math.counting.to_50', prereqSkillCodes: ['math.counting.to_20'] },
  { code: 'math.placevalue.tens_ones', prereqSkillCodes: ['math.counting.to_50'] },
  { code: 'math.add.within_100.no_regrouping', prereqSkillCodes: ['math.placevalue.tens_ones'] },
  { code: 'reading.phonics.cvc_blend', prereqSkillCodes: [] },
];

describe('effectivelyMastered', () => {
  it('credits a skill the learner stands on without having a row for it', () => {
    const have = effectivelyMastered(['math.placevalue.tens_ones'], SKILLS);
    expect(have.has('math.counting.to_50')).toBe(true);
    expect(have.has('math.counting.to_20')).toBe(true);
  });

  it('walks the whole ladder down, not just one rung', () => {
    const have = effectivelyMastered(['math.add.within_100.no_regrouping'], SKILLS);
    expect(have.has('math.counting.to_50')).toBe(true);
    expect(have.has('math.counting.to_20')).toBe(true);
  });

  it('never credits sideways or upward — only what a skill stands on', () => {
    const have = effectivelyMastered(['math.counting.to_50'], SKILLS);
    expect(have.has('math.placevalue.tens_ones')).toBe(false);
    expect(have.has('reading.phonics.cvc_blend')).toBe(false);
  });

  it('survives a cycle in the skill graph rather than hanging', () => {
    const cyclic: SkillNode[] = [
      { code: 'a', prereqSkillCodes: ['b'] },
      { code: 'b', prereqSkillCodes: ['a'] },
    ];
    expect(effectivelyMastered(['a'], cyclic)).toEqual(new Set(['a', 'b']));
  });

  it('is empty for a learner who has mastered nothing', () => {
    expect(effectivelyMastered([], SKILLS).size).toBe(0);
  });
});

describe('unmetPrereqs — the ant hill case', () => {
  const ANT_HILL = ['math.counting.to_50'];

  it('opens the ant hill for a learner who outgrew counting to fifty', () => {
    // Esme, 2026-09-10: no counting.to_50 row at all, but tens_ones mastered.
    expect(unmetPrereqs(ANT_HILL, ['math.placevalue.tens_ones'], SKILLS)).toEqual([]);
  });

  it('still refuses a learner who has not got there yet', () => {
    expect(unmetPrereqs(ANT_HILL, ['reading.phonics.cvc_blend'], SKILLS))
      .toEqual(['math.counting.to_50']);
    expect(unmetPrereqs(ANT_HILL, [], SKILLS)).toEqual(['math.counting.to_50']);
  });

  it('accepts the plain case: she simply mastered the skill itself', () => {
    expect(unmetPrereqs(ANT_HILL, ['math.counting.to_50'], SKILLS)).toEqual([]);
  });
});
