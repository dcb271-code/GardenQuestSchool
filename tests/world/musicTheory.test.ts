// tests/world/musicTheory.test.ts
import { describe, it, expect } from 'vitest';
import {
  midiOf, freqOf, freqOfNote, diatonicOf, noteFromDiatonic, stepOrSkip, directionOf,
  staffPosition, needsLedger, totalBeats, isFullBar, countAloud, octaveKeys,
  C_POSITION, MIDDLE_C, BEATS, type Note,
} from '@/lib/music/theory';
import {
  UNITS, getUnit, unitsOfStrand, isUnitUnlocked, buildExercises, totalExercises,
} from '@/lib/music/curriculum';

describe('pitch', () => {
  it('middle C is MIDI 60 and A4 is 440Hz', () => {
    expect(midiOf(MIDDLE_C)).toBe(60);
    expect(freqOf(69)).toBeCloseTo(440, 6);
    expect(freqOfNote({ letter: 'A', octave: 4 })).toBeCloseTo(440, 6);
  });

  it('an octave up doubles the frequency', () => {
    expect(freqOf(72) / freqOf(60)).toBeCloseTo(2, 6);
  });

  it('black keys sit a semitone above their letter', () => {
    expect(midiOf({ letter: 'C', octave: 4, sharp: true })).toBe(61);
    expect(midiOf({ letter: 'F', octave: 4, sharp: true })).toBe(66);
  });

  it('C position is five consecutive white keys from middle C', () => {
    expect(C_POSITION.map(midiOf)).toEqual([60, 62, 64, 65, 67]);
  });
});

describe('the diatonic line vs semitones', () => {
  it('E→F is one letter step even though it is only one semitone', () => {
    const e: Note = { letter: 'E', octave: 4 }, f: Note = { letter: 'F', octave: 4 };
    expect(midiOf(f) - midiOf(e)).toBe(1);          // a semitone in the ear
    expect(stepOrSkip(e, f)).toBe('step');           // still a step on the page
  });

  it('C→D is a step and C→E is a skip', () => {
    const c: Note = { letter: 'C', octave: 4 };
    expect(stepOrSkip(c, { letter: 'D', octave: 4 })).toBe('step');
    expect(stepOrSkip(c, { letter: 'E', octave: 4 })).toBe('skip');
    expect(stepOrSkip(c, { letter: 'G', octave: 4 })).toBe('leap');
    expect(stepOrSkip(c, c)).toBe('same');
  });

  it('direction follows pitch, not letters', () => {
    expect(directionOf({ letter: 'C', octave: 4 }, { letter: 'B', octave: 3 })).toBe('down');
    expect(directionOf({ letter: 'B', octave: 3 }, { letter: 'C', octave: 4 })).toBe('up');
  });

  it('diatonic round-trips', () => {
    for (const n of [MIDDLE_C, { letter: 'G', octave: 5 } as Note, { letter: 'A', octave: 3 } as Note]) {
      const back = noteFromDiatonic(diatonicOf(n));
      expect(back.letter).toBe(n.letter);
      expect(back.octave).toBe(n.octave);
    }
  });
});

describe('the staff', () => {
  it('E4 sits on the bottom line of the treble staff', () => {
    expect(staffPosition({ letter: 'E', octave: 4 })).toBe(0);
  });

  it('the treble lines are E G B D F', () => {
    const lines = [
      { letter: 'E', octave: 4 }, { letter: 'G', octave: 4 }, { letter: 'B', octave: 4 },
      { letter: 'D', octave: 5 }, { letter: 'F', octave: 5 },
    ] as Note[];
    expect(lines.map(n => staffPosition(n))).toEqual([0, 2, 4, 6, 8]);
  });

  it('the treble spaces spell FACE', () => {
    const spaces = [
      { letter: 'F', octave: 4 }, { letter: 'A', octave: 4 },
      { letter: 'C', octave: 5 }, { letter: 'E', octave: 5 },
    ] as Note[];
    expect(spaces.map(n => staffPosition(n))).toEqual([1, 3, 5, 7]);
  });

  it('middle C hangs one ledger line below the treble staff', () => {
    expect(staffPosition(MIDDLE_C)).toBe(-2);
    expect(needsLedger(MIDDLE_C)).toBe(true);
    expect(needsLedger({ letter: 'G', octave: 4 })).toBe(false);
  });

  it('bass clef puts middle C above the staff instead', () => {
    expect(staffPosition({ letter: 'G', octave: 2 }, 'bass')).toBe(0);
    expect(staffPosition(MIDDLE_C, 'bass')).toBe(10);
  });
});

describe('rhythm', () => {
  it('note values are worth the right number of beats', () => {
    expect(BEATS.whole).toBe(4);
    expect(BEATS.half).toBe(2);
    expect(BEATS.quarter).toBe(1);
  });

  it('a bar of 4/4 must total four beats', () => {
    expect(isFullBar(['quarter', 'quarter', 'quarter', 'quarter'])).toBe(true);
    expect(isFullBar(['half', 'quarter', 'quarter'])).toBe(true);
    expect(isFullBar(['whole'])).toBe(true);
    expect(isFullBar(['half', 'quarter'])).toBe(false);
    expect(totalBeats(['half', 'half'])).toBe(4);
  });

  it('counting aloud matches the value', () => {
    expect(countAloud('half')).toContain('2');
    expect(countAloud('whole')).toContain('4');
  });
});

describe('keyboard layout', () => {
  it('an octave has 7 white keys and 5 black ones', () => {
    const keys = octaveKeys(4);
    expect(keys).toHaveLength(7);
    expect(keys.filter(k => k.blackAfter)).toHaveLength(5);
  });

  it('the black keys really do fall into a 2 then 3 pattern', () => {
    // No black key after E or B — that gap is what creates the groups.
    const keys = octaveKeys(4);
    const gaps = keys.filter(k => !k.blackAfter).map(k => k.note.letter);
    expect(gaps).toEqual(['E', 'B']);
  });
});

describe('curriculum', () => {
  it('unit codes are unique and every strand is represented', () => {
    expect(new Set(UNITS.map(u => u.code)).size).toBe(UNITS.length);
    for (const strand of ['keyboard', 'notation', 'ear', 'rhythm'] as const) {
      expect(unitsOfStrand(strand).length, strand).toBeGreaterThan(0);
    }
  });

  it('every unit teaches before it tests', () => {
    for (const u of UNITS) {
      expect(u.teach.length, u.code).toBeGreaterThan(0);
      expect(u.exerciseCount, u.code).toBeGreaterThanOrEqual(5);
      expect(u.outro.length, u.code).toBeGreaterThan(10);
      for (const page of u.teach) {
        expect(page.body.length, u.code).toBeGreaterThan(40);
      }
    }
  });

  it('strands unlock independently, so she can follow her lesson', () => {
    const firstKeyboard = unitsOfStrand('keyboard')[0].code;
    const firstRhythm = unitsOfStrand('rhythm')[0].code;
    // Both strands open from the start...
    expect(isUnitUnlocked(firstKeyboard, [])).toBe(true);
    expect(isUnitUnlocked(firstRhythm, [])).toBe(true);
    // ...but within a strand the order holds.
    const secondRhythm = unitsOfStrand('rhythm')[1].code;
    expect(isUnitUnlocked(secondRhythm, [])).toBe(false);
    expect(isUnitUnlocked(secondRhythm, [firstRhythm])).toBe(true);
  });

  it('unknown units are never unlocked', () => {
    expect(isUnitUnlocked('nope', UNITS.map(u => u.code))).toBe(false);
  });

  it('builds the promised number of exercises, deterministically', () => {
    for (const u of UNITS) {
      const a = buildExercises(u, 7);
      expect(a, u.code).toHaveLength(u.exerciseCount);
      expect(buildExercises(u, 7), u.code).toEqual(a);
    }
  });

  it('every generated exercise is answerable and has a hint', () => {
    for (const u of UNITS) {
      for (const seed of [1, 2, 3, 11, 29]) {
        for (const ex of buildExercises(u, seed)) {
          expect(ex.prompt.length, u.code).toBeGreaterThan(4);
          expect(ex.hint.length, u.code).toBeGreaterThan(10);
          if ('choices' in ex) {
            expect(ex.choices.length, u.code).toBeGreaterThanOrEqual(2);
            expect(new Set(ex.choices).size, `${u.code}: duplicate choices`).toBe(ex.choices.length);
            expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
            expect(ex.correctIndex).toBeLessThan(ex.choices.length);
          }
          if (ex.kind === 'tap_rhythm') {
            expect(isFullBar(ex.pattern), `${u.code}: rhythm must fill a bar`).toBe(true);
            expect(ex.bpm).toBeGreaterThan(40);
          }
          if (ex.kind === 'listen') {
            expect(ex.midis.length).toBeGreaterThanOrEqual(1);
            for (const m of ex.midis) {
              expect(m, 'playable range').toBeGreaterThan(35);
              expect(m, 'playable range').toBeLessThan(100);
            }
          }
        }
      }
    }
  });

  it('the ear-training answers actually match the sound played', () => {
    const unit = getUnit('high_and_low')!;
    for (const seed of [3, 8, 21, 44]) {
      for (const ex of buildExercises(unit, seed)) {
        if (ex.kind !== 'listen') continue;
        const [a, b] = ex.midis;
        const truth = b > a ? 'higher' : 'lower';
        expect(ex.choices[ex.correctIndex], `seed ${seed}`).toBe(truth);
      }
    }
  });

  it('step-or-skip by ear matches the actual interval', () => {
    const unit = getUnit('hear_step_or_skip')!;
    for (const seed of [5, 13, 27]) {
      for (const ex of buildExercises(unit, seed)) {
        if (ex.kind !== 'listen') continue;
        const [a, b] = ex.midis;
        const semitones = Math.abs(b - a);
        // A diatonic step is 1–2 semitones; a skip is 3–4.
        const truth = semitones <= 2 ? 'a step' : 'a skip';
        expect(ex.choices[ex.correctIndex], `seed ${seed}, ${semitones} semitones`).toBe(truth);
      }
    }
  });

  it('the course is a real amount of practice', () => {
    expect(totalExercises()).toBeGreaterThanOrEqual(60);
  });
});
