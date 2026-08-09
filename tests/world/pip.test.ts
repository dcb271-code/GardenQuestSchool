import { describe, it, expect } from 'vitest';
import {
  PIP, PIP_PREREQ_SKILLS, pipAppears, pipLockedReason, skipCountLine, pipPraise,
} from '@/lib/world/pip';
import { MATH_SKILLS } from '@/lib/packs/math/skills';

const ALL = new Set(MATH_SKILLS.map(s => s.code));

const base = {
  level: 3,
  mathMountainUnlocked: true,
  masteredCodes: [...PIP_PREREQ_SKILLS],
  correctBySkill: new Map<string, number>(),
};

describe('Pip', () => {
  it('gates on skills that actually exist', () => {
    for (const code of PIP_PREREQ_SKILLS) {
      expect(ALL.has(code), `${code} is not a real skill`).toBe(true);
    }
  });

  it('comes out for a level 3 climber with the base skills', () => {
    expect(pipAppears(base)).toBe(true);
  });

  it('stays in below level 3, however good the maths', () => {
    expect(pipAppears({ ...base, level: 2 })).toBe(false);
    expect(pipAppears({ ...base, level: 1 })).toBe(false);
  });

  it('stays in until Math Mountain is open', () => {
    expect(pipAppears({ ...base, mathMountainUnlocked: false })).toBe(false);
  });

  it('needs every prerequisite, not just some', () => {
    for (const missing of PIP_PREREQ_SKILLS) {
      const codes = PIP_PREREQ_SKILLS.filter(c => c !== missing);
      expect(pipAppears({ ...base, masteredCodes: [...codes] }),
        `should stay in without ${missing}`).toBe(false);
    }
  });

  // Mastery decays. A teacher who vanishes because a child did not
  // practise for a fortnight is a punishment dressed as a feature.
  it('stays out on lifetime correct once mastery has decayed', () => {
    const decayed = {
      ...base,
      masteredCodes: [],
      correctBySkill: new Map(PIP_PREREQ_SKILLS.map(c => [c as string, 20])),
    };
    expect(pipAppears(decayed)).toBe(true);
  });

  it('does not open on almost-enough practice', () => {
    const nearly = {
      ...base,
      masteredCodes: [],
      correctBySkill: new Map(PIP_PREREQ_SKILLS.map(c => [c as string, 19])),
    };
    expect(pipAppears(nearly)).toBe(false);
  });

  it('explains itself while locked', () => {
    expect(pipLockedReason({ level: 2, mathMountainUnlocked: true })).toMatch(/Level 3/);
    expect(pipLockedReason({ level: 3, mathMountainUnlocked: false })).toMatch(/Math Mountain/);
  });

  describe('what he says', () => {
    it('chants a table as bare products', () => {
      expect(skipCountLine(7)).toBe('7. 14. 21. 28. 35. 42. 49. 56. 63. 70.');
    });

    it('varies praise instead of repeating one phrase', () => {
      const said = new Set([0, 1, 2, 3, 4].map(pipPraise));
      expect(said.size).toBeGreaterThan(3);
    });

    it('is a chipmunk, and says so where it matters', () => {
      expect(PIP.species).toContain('chipmunk');
      expect(PIP.scientificName).toBe('Tamias striatus');
    });
  });
});
