// tests/world/japaneseSchool.test.ts
import { describe, it, expect } from 'vitest';
import {
  JAPANESE_UNITS, getUnit, isUnitUnlocked, nextUnit, isSchoolOpen, buildDrill,
} from '@/lib/world/japaneseSchool';
import { PLANT_CATALOG } from '@/lib/world/plantCatalog';

describe('JAPANESE_UNITS', () => {
  it('unit codes are unique and every unit has characters', () => {
    const codes = new Set(JAPANESE_UNITS.map(u => u.code));
    expect(codes.size).toBe(JAPANESE_UNITS.length);
    for (const u of JAPANESE_UNITS) {
      expect(u.chars.length, u.code).toBeGreaterThanOrEqual(3);
      expect(u.intro.length, u.code).toBeGreaterThan(10);
      expect(u.outro.length, u.code).toBeGreaterThan(10);
    }
  });

  it('every character has a reading and a mnemonic; kanji also carry a meaning', () => {
    for (const u of JAPANESE_UNITS) {
      for (const c of u.chars) {
        expect(c.romaji, `${u.code}/${c.char}`).toMatch(/^[a-z]+$/);
        expect(c.mnemonic.length, `${u.code}/${c.char}`).toBeGreaterThan(15);
        if (u.kind === 'kanji') {
          expect(c.meaning, `${u.code}/${c.char} needs a meaning`).toBeTruthy();
        } else {
          expect(c.meaning, `${u.code}/${c.char} is a sound, not a word`).toBeUndefined();
        }
      }
    }
  });

  it('hiragana units use hiragana, kanji units use CJK ideographs', () => {
    for (const u of JAPANESE_UNITS) {
      for (const c of u.chars) {
        if (u.kind === 'hiragana') expect(c.char, c.char).toMatch(/^[぀-ゟ]$/);
        else expect(c.char, c.char).toMatch(/^[一-鿿]$/);
      }
    }
  });

  it('the subtitle lists exactly the unit\'s characters', () => {
    for (const u of JAPANESE_UNITS) {
      expect(u.subtitle.split(' ')).toEqual(u.chars.map(c => c.char));
    }
  });

  it('the first kanji unit teaches plants the child actually grows', () => {
    const garden = getUnit('kanji_garden')!;
    const grown = new Map(
      PLANT_CATALOG.filter(p => p.japanese).map(p => [p.japanese!.kanji, p.japanese!.romaji]),
    );
    for (const c of garden.chars) {
      expect(grown.has(c.char), `${c.char} is not on any plant card`).toBe(true);
      // the school and the plant card must agree on the reading
      expect(grown.get(c.char), c.char).toBe(c.romaji);
    }
  });
});

describe('unit progression', () => {
  it('the first unit is open and the rest are not', () => {
    expect(isUnitUnlocked(JAPANESE_UNITS[0].code, [])).toBe(true);
    expect(isUnitUnlocked(JAPANESE_UNITS[1].code, [])).toBe(false);
  });

  it('finishing a unit opens exactly the next one', () => {
    const done = [JAPANESE_UNITS[0].code];
    expect(isUnitUnlocked(JAPANESE_UNITS[1].code, done)).toBe(true);
    expect(isUnitUnlocked(JAPANESE_UNITS[2].code, done)).toBe(false);
  });

  it('nextUnit points at the first unfinished unit, and runs out at the end', () => {
    expect(nextUnit([])?.code).toBe(JAPANESE_UNITS[0].code);
    expect(nextUnit([JAPANESE_UNITS[0].code])?.code).toBe(JAPANESE_UNITS[1].code);
    expect(nextUnit(JAPANESE_UNITS.map(u => u.code))).toBeUndefined();
  });

  it('unknown codes are never unlocked', () => {
    expect(isUnitUnlocked('nope', JAPANESE_UNITS.map(u => u.code))).toBe(false);
  });
});

describe('isSchoolOpen', () => {
  it('needs the bed open AND something growing in it', () => {
    expect(isSchoolOpen(false, 0)).toBe(false);
    expect(isSchoolOpen(true, 0)).toBe(false);
    expect(isSchoolOpen(false, 3)).toBe(false);
    expect(isSchoolOpen(true, 1)).toBe(true);
  });
});

describe('buildDrill', () => {
  const unit = JAPANESE_UNITS[0];

  it('asks about every character in both directions', () => {
    const drill = buildDrill(unit, 1);
    expect(drill).toHaveLength(unit.chars.length * 2);
    for (const c of unit.chars) {
      expect(drill.some(q => q.kind === 'read' && q.prompt === c.char), c.char).toBe(true);
      expect(drill.some(q => q.kind === 'write' && q.choices.includes(c.char)), c.char).toBe(true);
    }
  });

  it('every question has 4 distinct choices and a correct index that points at the answer', () => {
    for (const u of JAPANESE_UNITS) {
      for (const q of buildDrill(u, 3)) {
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices).size, `${u.code}: duplicate choices`).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
        expect(q.hint.length).toBeGreaterThan(10);
      }
    }
  });

  it('distractors come from the same unit, so the choices are genuinely confusable', () => {
    const drill = buildDrill(unit, 5);
    const chars = new Set(unit.chars.map(c => c.char));
    for (const q of drill.filter(q => q.kind === 'write')) {
      for (const choice of q.choices) expect(chars.has(choice), choice).toBe(true);
    }
  });

  it('is deterministic for a given seed, so a retry drills the same way', () => {
    expect(buildDrill(unit, 42)).toEqual(buildDrill(unit, 42));
  });
});
