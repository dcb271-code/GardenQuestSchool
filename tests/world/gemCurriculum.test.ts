import { describe, it, expect } from 'vitest';
import {
  GEM_UNITS, buildExercises, getGemUnit, unitPassed,
} from '@/lib/gems/curriculum';
import { GEM_CATALOG, getGem, HARDNESS_TESTS } from '@/lib/world/gemCatalog';

/**
 * The bird rule, applied to stones: every exercise is generated from
 * the catalog, so these tests pin that nothing a unit says can drift
 * from what the catalog knows.
 */

describe('the units and the catalog agree', () => {
  it('every stone a unit names exists in the catalog', () => {
    for (const u of GEM_UNITS) {
      for (const code of u.gemCodes) {
        expect(getGem(code), `${u.code} references unknown stone ${code}`).toBeDefined();
      }
      for (const page of u.teach) {
        if (page.figure?.kind === 'specimen') {
          expect(getGem(page.figure.gemCode)).toBeDefined();
        }
        if (page.figure?.kind === 'shelf') {
          for (const c of page.figure.gemCodes) expect(getGem(c)).toBeDefined();
        }
      }
    }
  });

  it('every seam stone is taught by at least one unit', () => {
    const seam = GEM_CATALOG.filter(g => g.shelf === 'seam').map(g => g.code);
    const taught = new Set(GEM_UNITS.flatMap(u => u.gemCodes));
    for (const code of seam) {
      expect(taught.has(code), `${code} is taught nowhere`).toBe(true);
    }
  });

  it('every reward stone is a real seam stone the child can keep or sell', () => {
    for (const u of GEM_UNITS) {
      const gem = getGem(u.rewardStone);
      expect(gem, `${u.code} pays unknown stone`).toBeDefined();
      expect(gem!.shelf, `${u.code} must not pay a case gem for a lesson`).toBe('seam');
    }
  });

  it('no two units pay the same stone', () => {
    const stones = GEM_UNITS.map(u => u.rewardStone);
    expect(new Set(stones).size).toBe(stones.length);
  });
});

describe('generated exercises', () => {
  it('every unit fills its exercise count, deterministically by seed', () => {
    for (const u of GEM_UNITS) {
      const a = buildExercises(u, 42);
      const b = buildExercises(u, 42);
      expect(a.length, `${u.code} came up short`).toBe(u.exerciseCount);
      expect(a).toEqual(b);
      expect(buildExercises(u, 43)).not.toEqual(a);
    }
  });

  it('every exercise is answerable: one correct index inside its choices', () => {
    for (const u of GEM_UNITS) {
      for (const seed of [1, 7, 99]) {
        for (const ex of buildExercises(u, seed)) {
          expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
          expect(ex.correctIndex).toBeLessThan(ex.choices.length);
          expect(ex.choices.length).toBeGreaterThanOrEqual(2);
          expect(new Set(ex.choices).size).toBe(ex.choices.length);
          expect(ex.hint.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('the correct answer is actually correct, checked against the catalog', () => {
    for (const u of GEM_UNITS) {
      for (const ex of buildExercises(u, 7)) {
        if (ex.kind === 'harder_which') {
          const names = ex.choices.map(n => GEM_CATALOG.find(g => g.name === n)!);
          const winner = names[ex.correctIndex];
          const loser = names[1 - ex.correctIndex];
          expect(winner.mohs).toBeGreaterThan(loser.mohs);
        }
        if (ex.kind === 'scratch_test') {
          const gem = getGem(ex.gemCode!)!;
          const tool = HARDNESS_TESTS.find(t => ex.prompt.includes(t.thing))!;
          const marks = tool.mohs > gem.mohs;
          expect(ex.choices[ex.correctIndex].startsWith(marks ? 'yes' : 'no')).toBe(true);
        }
        if (ex.kind === 'story') {
          // A fact must never name its own stone — it would answer itself.
          const answer = ex.choices[ex.correctIndex];
          expect(ex.prompt.toLowerCase()).not.toContain(answer.toLowerCase());
        }
        if (ex.kind === 'shape_spot') {
          // Exactly one offered stone may grow the asked-about shape.
          const subject = getGem(ex.gemCode!)!;
          const shapeWord = subject.crystalShape.split(/[ —]/)[0];
          const sharing = ex.choices
            .map(n => GEM_CATALOG.find(g => g.name === n)!)
            .filter(g => g.crystalShape.includes(shapeWord));
          expect(sharing.length).toBe(1);
        }
      }
    }
  });

  it('no duplicate prompts within a run', () => {
    for (const u of GEM_UNITS) {
      const prompts = buildExercises(u, 3).map(e => e.prompt);
      expect(new Set(prompts).size).toBe(prompts.length);
    }
  });
});

describe('pass mark', () => {
  it('is 70%, like the birds', () => {
    expect(unitPassed(6, 8)).toBe(true);
    expect(unitPassed(5, 8)).toBe(false);
    expect(unitPassed(0, 0)).toBe(false);
  });

  it('getGemUnit finds real units and rejects nonsense', () => {
    expect(getGemUnit('gem_scratch_test')?.title).toBe('The Scratch Test');
    expect(getGemUnit('gem_nope')).toBeUndefined();
  });
});
