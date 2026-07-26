// tests/world/birdCurriculum.test.ts
import { describe, it, expect } from 'vitest';
import {
  UNITS, getUnit, buildExercises, isUnitUnlocked, nextUnit,
  birdsLearned, choiceCount, unitsOfCrew,
  type BirdExercise,
} from '@/lib/birds/curriculum';
import { getBird, sizeComparison, BILL_HINT } from '@/lib/world/birdCatalog';

const SEEDS = [1, 7, 42, 99, 1234, 5150, 20260726];

/** Every exercise this unit can generate across many seeds. */
function allExercises(unitCode: string): BirdExercise[] {
  const unit = getUnit(unitCode)!;
  return SEEDS.flatMap(s => buildExercises(unit, s));
}

describe('bird units', () => {
  it('every unit references only real birds', () => {
    for (const u of UNITS) {
      expect(u.birdCodes.length, u.code).toBeGreaterThan(0);
      for (const code of u.birdCodes) {
        expect(getBird(code), `${u.code} → ${code}`).toBeDefined();
      }
    }
  });

  it('every teach-page figure points at a real bird', () => {
    for (const u of UNITS) {
      for (const p of u.teach) {
        const f = p.figure;
        if (!f) continue;
        if (f.kind === 'photo') expect(getBird(f.ref.birdCode), u.code).toBeDefined();
        if (f.kind === 'marks') expect(getBird(f.birdCode), u.code).toBeDefined();
      }
    }
  });

  it('teaches a bird before it quizzes on it', () => {
    // A figure may only show a bird the unit actually covers, or one
    // from an earlier unit she has already met.
    const metByUnit = new Map<string, Set<string>>();
    const seen = new Set<string>();
    for (const u of UNITS) {
      u.birdCodes.forEach(c => seen.add(c));
      metByUnit.set(u.code, new Set(seen));
    }
    for (const u of UNITS) {
      const met = metByUnit.get(u.code)!;
      for (const p of u.teach) {
        const f = p.figure;
        const code = f?.kind === 'photo' ? f.ref.birdCode
          : f?.kind === 'marks' ? f.birdCode : null;
        if (code) expect(met.has(code), `${u.code} shows unmet ${code}`).toBe(true);
      }
    }
  });

  it('unlocks strictly in order, one at a time', () => {
    expect(isUnitUnlocked(UNITS[0].code, [])).toBe(true);
    expect(isUnitUnlocked(UNITS[1].code, [])).toBe(false);
    expect(isUnitUnlocked(UNITS[1].code, [UNITS[0].code])).toBe(true);
    // Completing a later unit must not unlock a skipped earlier one.
    expect(isUnitUnlocked(UNITS[2].code, [UNITS[0].code])).toBe(false);
  });

  it('look comes before know within a crew', () => {
    for (const crew of ['crew1', 'crew2']) {
      const stages = unitsOfCrew(crew).map(u => u.stage);
      expect(stages[0], crew).toBe('look');
      expect(stages).toContain('know');
      expect(stages.indexOf('look')).toBeLessThan(stages.indexOf('know'));
    }
  });

  it('nextUnit walks the whole course and then stops', () => {
    const done: string[] = [];
    for (let i = 0; i < UNITS.length; i++) {
      const n = nextUnit(done)!;
      expect(n.code).toBe(UNITS[i].code);
      done.push(n.code);
    }
    expect(nextUnit(done)).toBeUndefined();
  });

  it('birdsLearned accumulates as units are completed', () => {
    expect(birdsLearned([])).toEqual([]);
    const afterFirst = birdsLearned(['crew1_look']);
    expect(afterFirst).toHaveLength(5);
    expect(afterFirst).toContain('northern_cardinal');
    expect(birdsLearned(['crew1_look', 'crew2_look'])).toHaveLength(10);
    // The know unit covers the same birds — no double counting.
    expect(birdsLearned(['crew1_look', 'crew1_know'])).toHaveLength(5);
  });
});

describe('choiceCount', () => {
  it('ramps 2 → 3 → 4 across a unit', () => {
    const counts = Array.from({ length: 9 }, (_, i) => choiceCount(i, 9));
    expect(counts[0]).toBe(2);
    expect(counts[8]).toBe(4);
    // Never goes backwards.
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
  });

  it('never offers four choices in a two-question unit', () => {
    expect(choiceCount(0, 2)).toBe(2);
    expect(choiceCount(1, 2)).toBe(2);
  });
});

describe('buildExercises', () => {
  it('generates the requested number for every unit', () => {
    for (const u of UNITS) {
      for (const seed of SEEDS) {
        expect(buildExercises(u, seed).length, `${u.code}/${seed}`)
          .toBe(u.exerciseCount);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    for (const u of UNITS) {
      expect(buildExercises(u, 42)).toEqual(buildExercises(u, 42));
    }
  });

  it('different seeds give different question sets', () => {
    const a = JSON.stringify(buildExercises(getUnit('crew1_look')!, 1));
    const b = JSON.stringify(buildExercises(getUnit('crew1_look')!, 2));
    expect(a).not.toBe(b);
  });

  it('every multiple choice has a valid, unique, in-range answer', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind === 'true_false') continue;
        const options = ex.kind === 'name_photo' ? ex.photos : ex.choices;
        expect(options.length, ex.kind).toBeGreaterThanOrEqual(2);
        expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
        expect(ex.correctIndex).toBeLessThan(options.length);
        // No repeated option — a duplicate makes two answers correct.
        const keys = options.map(o => typeof o === 'string' ? o : `${o.birdCode}/${o.role}`);
        expect(new Set(keys).size, `${ex.kind}: ${keys.join(' | ')}`).toBe(keys.length);
      }
    }
  });

  it('every exercise carries a hint worth reading', () => {
    // A wrong tap never advances; the hint is what makes the retry
    // teach instead of just costing a guess.
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        expect(ex.hint.trim().length, ex.kind).toBeGreaterThan(10);
      }
    }
  });

  it('size questions state the true size', () => {
    for (const ex of allExercises('crew1_look')) {
      if (ex.kind !== 'size_anchor') continue;
      const bird = getBird(ex.birdCode)!;
      expect(ex.choices[ex.correctIndex]).toBe(sizeComparison(bird));
    }
  });

  it('bill questions state the true bill', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'bill_face') continue;
        const bird = getBird(ex.birdCode)!;
        expect(ex.choices[ex.correctIndex]).toBe(BILL_HINT[bird.bill]);
      }
    }
  });

  it('name_photo shows the target bird exactly once', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'name_photo') continue;
        const hits = ex.photos.filter(p => p.birdCode === ex.birdCode);
        expect(hits).toHaveLength(1);
        expect(ex.photos[ex.correctIndex].birdCode).toBe(ex.birdCode);
      }
    }
  });

  it('behaviour distractors are never also true of the bird asked about', () => {
    // The bug this guards: two birds in a crew can honestly share a
    // behaviour, and offering it as the wrong answer marks a right
    // answer wrong.
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'behaviour') continue;
        const bird = getBird(ex.birdCode)!;
        ex.choices.forEach((c, i) => {
          if (i === ex.correctIndex) return;
          expect(bird.behaviour, `${bird.code} also does "${c}"`).not.toContain(c);
        });
      }
    }
  });

  it('habitat distractors are never also true of the bird asked about', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'habitat') continue;
        const bird = getBird(ex.birdCode)!;
        ex.choices.forEach((c, i) => {
          if (i === ex.correctIndex) return;
          expect(bird.habitat).not.toContain(c);
        });
      }
    }
  });

  it('a false true/false statement is actually false', () => {
    // It borrows another bird's field mark. If that mark happened to
    // also be true of this bird, the "correct" answer would be wrong.
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'true_false' || ex.answer) continue;
        const bird = getBird(ex.birdCode)!;
        for (const mark of bird.fieldMarks) {
          expect(ex.prompt, `${bird.code}: "${mark}" is true of it`).not.toContain(mark);
        }
      }
    }
  });

  it('a true true/false statement is actually true', () => {
    for (const u of UNITS) {
      for (const ex of allExercises(u.code)) {
        if (ex.kind !== 'true_false' || !ex.answer) continue;
        const bird = getBird(ex.birdCode)!;
        expect(bird.fieldMarks.some(m => ex.prompt.includes(m))).toBe(true);
      }
    }
  });

  it('asks about every bird in the crew, not just a favourite', () => {
    for (const u of UNITS) {
      const asked = new Set<string>();
      for (const ex of allExercises(u.code)) {
        const code = 'birdCode' in ex ? ex.birdCode : ex.photo.birdCode;
        asked.add(code);
      }
      for (const code of u.birdCodes) {
        expect(asked.has(code), `${u.code} never asks about ${code}`).toBe(true);
      }
    }
  });

  it('look units lead with shape before they lead with colour', () => {
    // Cornell's ordering is the whole pedagogical claim. If the
    // generator drifts to name-the-photo only, the claim is false.
    const kinds = new Set(allExercises('crew1_look').map(e => e.kind));
    expect(kinds).toContain('size_anchor');
    expect(kinds).toContain('bill_face');
    expect(kinds).toContain('photo_name');
  });

  it('know units ask about living, not about looks', () => {
    const kinds = new Set(allExercises('crew1_know').map(e => e.kind));
    expect(kinds.has('behaviour') || kinds.has('habitat')).toBe(true);
    expect(kinds).not.toContain('size_anchor');
    expect(kinds).not.toContain('photo_name');
  });
});
