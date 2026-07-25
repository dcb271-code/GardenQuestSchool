// tests/world/musicReview.test.ts
import { describe, it, expect } from 'vitest';
import {
  recordResult, dueUnits, badgeFor, addDays, todayKey,
  BOX_DAYS, MAX_BOX, type ReviewMap,
} from '@/lib/music/review';
import { UNITS, getUnit, buildExercises, unitsOfStrand } from '@/lib/music/curriculum';
import { midiOf, C_POSITION } from '@/lib/music/theory';

const TODAY = '2026-07-25';

describe('spaced review', () => {
  it('a first shaky pass comes back tomorrow', () => {
    const s = recordResult(undefined, 0.6, TODAY);
    expect(s.box).toBe(1);
    expect(s.due).toBe(addDays(TODAY, 1));
  });

  it('a clean run climbs a box and pushes the next review out', () => {
    const first = recordResult(undefined, 1, TODAY);
    expect(first.box).toBe(2);
    expect(first.due).toBe(addDays(TODAY, BOX_DAYS[2]));
    const second = recordResult(first, 1, TODAY);
    expect(second.box).toBe(3);
    expect(second.due).toBe(addDays(TODAY, BOX_DAYS[3]));
  });

  it('a middling run holds its place rather than climbing', () => {
    const prev = recordResult(undefined, 1, TODAY);   // box 2
    const held = recordResult(prev, 0.8, TODAY);
    expect(held.box).toBe(2);
  });

  it('a bad run drops all the way back — this is the point of the whole thing', () => {
    let s = recordResult(undefined, 1, TODAY);
    s = recordResult(s, 1, TODAY);
    s = recordResult(s, 1, TODAY);
    expect(s.box).toBeGreaterThan(1);
    const slipped = recordResult(s, 0.5, TODAY);
    expect(slipped.box).toBe(1);
    expect(slipped.due).toBe(addDays(TODAY, 1));
  });

  it('never climbs past the top box', () => {
    let s = recordResult(undefined, 1, TODAY);
    for (let i = 0; i < 10; i++) s = recordResult(s, 1, TODAY);
    expect(s.box).toBe(MAX_BOX);
  });

  it('remembers her BEST run, so a bad day cannot take a badge away', () => {
    const good = recordResult(undefined, 1, TODAY);
    const bad = recordResult(good, 0.4, TODAY);
    expect(bad.best).toBe(1);
    expect(badgeFor(bad)).toBe('gold');
  });

  it('badges reward first-try accuracy', () => {
    expect(badgeFor(undefined)).toBe('none');
    expect(badgeFor({ box: 1, due: TODAY, best: 0.5 })).toBe('none');
    expect(badgeFor({ box: 1, due: TODAY, best: 0.75 })).toBe('bronze');
    expect(badgeFor({ box: 1, due: TODAY, best: 0.92 })).toBe('silver');
    expect(badgeFor({ box: 1, due: TODAY, best: 1 })).toBe('gold');
  });
});

describe('what is due', () => {
  const review: ReviewMap = {
    a: { box: 3, due: '2026-07-20', best: 0.9 },   // overdue, fairly solid
    b: { box: 1, due: '2026-07-25', best: 0.5 },   // due today, shaky
    c: { box: 4, due: '2026-08-30', best: 1 },     // not for weeks
  };

  it('returns everything due or overdue, shakiest first', () => {
    expect(dueUnits(review, TODAY)).toEqual(['b', 'a']);
  });

  it('leaves the future alone', () => {
    expect(dueUnits(review, TODAY)).not.toContain('c');
  });

  it('nothing is due for a learner who has never practised', () => {
    expect(dueUnits({}, TODAY)).toEqual([]);
  });

  it('todayKey is a plain yyyy-mm-dd that sorts correctly', () => {
    expect(todayKey(new Date('2026-07-25T22:00:00Z'))).toBe('2026-07-25');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('echo units', () => {
  const echoCodes = ['echo_three', 'echo_five', 'echo_by_ear', 'echo_with_rhythm'];

  it('all four echo units exist and live in the ear strand', () => {
    for (const code of echoCodes) {
      const u = getUnit(code);
      expect(u, code).toBeDefined();
      expect(u!.strand).toBe('ear');
    }
  });

  it('melodies stay inside C position, so every note is reachable', () => {
    const playable = new Set(C_POSITION.map(midiOf));
    for (const code of echoCodes) {
      for (const seed of [1, 5, 9, 23, 71]) {
        for (const ex of buildExercises(getUnit(code)!, seed)) {
          expect(ex.kind).toBe('echo_melody');
          if (ex.kind !== 'echo_melody') continue;
          for (const m of ex.midis) {
            expect(playable.has(m), `${code}: ${m} is not under the hand`).toBe(true);
          }
        }
      }
    }
  });

  it('melodies get longer as the units progress', () => {
    const len = (code: string) => {
      const ex = buildExercises(getUnit(code)!, 3)[0];
      return ex.kind === 'echo_melody' ? ex.midis.length : 0;
    };
    expect(len('echo_five')).toBeGreaterThan(len('echo_three'));
  });

  it('melodies never leap further than a third — singable, not random', () => {
    for (const code of echoCodes) {
      for (const seed of [2, 13, 44]) {
        for (const ex of buildExercises(getUnit(code)!, seed)) {
          if (ex.kind !== 'echo_melody') continue;
          for (let i = 1; i < ex.midis.length; i++) {
            const leap = Math.abs(ex.midis[i] - ex.midis[i - 1]);
            expect(leap, `${code}: leap of ${leap} semitones`).toBeLessThanOrEqual(4);
          }
        }
      }
    }
  });

  it('phrases come to rest on a note of the tonic chord', () => {
    const restful = new Set([60, 64, 67]);   // C, E, G
    for (const code of echoCodes) {
      for (const seed of [4, 17, 39]) {
        for (const ex of buildExercises(getUnit(code)!, seed)) {
          if (ex.kind !== 'echo_melody') continue;
          expect(restful.has(ex.midis[ex.midis.length - 1]), `${code}: unsettled ending`).toBe(true);
        }
      }
    }
  });

  it('the by-ear unit really does withhold the lights', () => {
    for (const ex of buildExercises(getUnit('echo_by_ear')!, 6)) {
      if (ex.kind !== 'echo_melody') continue;
      expect(ex.showLights).toBe(false);
    }
    for (const ex of buildExercises(getUnit('echo_three')!, 6)) {
      if (ex.kind !== 'echo_melody') continue;
      expect(ex.showLights).toBe(true);
    }
  });

  it('the rhythm echo carries one duration per note', () => {
    for (const ex of buildExercises(getUnit('echo_with_rhythm')!, 8)) {
      if (ex.kind !== 'echo_melody') continue;
      expect(ex.beats).toBeDefined();
      expect(ex.beats!.length).toBe(ex.midis.length);
      expect(ex.beats![ex.beats!.length - 1]).toBeGreaterThanOrEqual(1);  // settles long
    }
  });
});

describe('new reading units', () => {
  it('bass clef units read in bass clef', () => {
    for (const code of ['bass_clef_intro', 'bass_reading']) {
      for (const ex of buildExercises(getUnit(code)!, 4)) {
        expect(ex.kind).toBe('read_note');
        if (ex.kind !== 'read_note') continue;
        expect(ex.clef, code).toBe('bass');
      }
    }
  });

  it('intervals are named by number and stay within a 5th', () => {
    for (const seed of [1, 6, 15]) {
      for (const ex of buildExercises(getUnit('intervals_by_number')!, seed)) {
        if (ex.kind !== 'read_note') continue;
        expect(ex.choices[ex.correctIndex]).toMatch(/^a (2nd|3rd|4th|5th)$/);
      }
    }
  });

  it('the course grew but every unit still teaches first', () => {
    expect(UNITS.length).toBeGreaterThanOrEqual(19);
    for (const u of UNITS) expect(u.teach.length, u.code).toBeGreaterThan(0);
    // Echo is a real chunk of the ear strand now.
    expect(unitsOfStrand('ear').length).toBeGreaterThanOrEqual(7);
  });
});
