// tests/world/plantCatalog.test.ts
import { describe, it, expect } from 'vitest';
import { PLANT_CATALOG, getPlant, plantStageFor } from '@/lib/world/plantCatalog';
import { SEED_EARN_SCHEDULE, getEarnedSeedCodes } from '@/lib/world/seedEarnSchedule';

describe('PLANT_CATALOG', () => {
  it('has an entry for every plant code in the earn schedule', () => {
    for (const earn of SEED_EARN_SCHEDULE) {
      const plant = getPlant(earn.plantCode);
      expect(plant, `missing plant ${earn.plantCode}`).toBeDefined();
    }
  });

  it('every plant has 2-3 facts', () => {
    for (const p of PLANT_CATALOG) {
      expect(p.facts.length, p.code).toBeGreaterThanOrEqual(2);
      expect(p.facts.length, p.code).toBeLessThanOrEqual(3);
    }
  });

  it('every plant has stages sorted ascending by atProgress, starting at 0, ending at 1', () => {
    for (const p of PLANT_CATALOG) {
      expect(p.stages.length, p.code).toBeGreaterThanOrEqual(3);
      expect(p.stages[0].atProgress, p.code).toBe(0);
      expect(p.stages[p.stages.length - 1].atProgress, p.code).toBe(1);
      for (let i = 1; i < p.stages.length; i++) {
        expect(p.stages[i].atProgress, p.code).toBeGreaterThan(p.stages[i - 1].atProgress);
      }
    }
  });

  it('every plant declares a positive growthCost and valid garden type', () => {
    const validGardens = new Set([
      'vegetable', 'flower', 'fruit', 'japanese',
      'orchard', 'berry', 'herb', 'moon',
    ]);
    for (const p of PLANT_CATALOG) {
      expect(p.growthCost, p.code).toBeGreaterThan(0);
      expect(validGardens.has(p.garden), `${p.code} → ${p.garden}`).toBe(true);
    }
  });
});

describe('plantStageFor', () => {
  const radish = getPlant('radish')!;

  it('returns the seed stage at progress 0', () => {
    expect(plantStageFor(radish, 0).illustration).toBe('plant_radish_seed');
  });

  it('returns the mature stage at full growthCost', () => {
    expect(plantStageFor(radish, radish.growthCost).illustration).toBe('plant_radish_mature');
  });

  it('clamps overshoot — progress > growthCost still mature', () => {
    expect(plantStageFor(radish, radish.growthCost * 4).illustration).toBe('plant_radish_mature');
  });

  it('picks the highest stage threshold below the current ratio', () => {
    // radish stages at 0, 0.2, 0.5, 1.0
    expect(plantStageFor(radish, radish.growthCost * 0.4).illustration).toBe('plant_radish_sprout');
    expect(plantStageFor(radish, radish.growthCost * 0.6).illustration).toBe('plant_radish_leaves');
  });
});

describe('japanese garden', () => {
  const japanesePlants = PLANT_CATALOG.filter(p => p.garden === 'japanese');

  it('has at least as many species as the bed has plots (6)', () => {
    expect(japanesePlants.length).toBeGreaterThanOrEqual(6);
  });

  it('every japanese-garden plant carries a kanji name; no other garden does', () => {
    for (const p of PLANT_CATALOG) {
      if (p.garden === 'japanese') {
        expect(p.japanese, `${p.code} is missing its japanese name`).toBeDefined();
      } else {
        expect(p.japanese, `${p.code} should not have a japanese name`).toBeUndefined();
      }
    }
  });

  it('kanji entries are well-formed: real characters, a reading, a gloss and a note', () => {
    for (const p of japanesePlants) {
      const j = p.japanese!;
      expect(j.kanji.length, p.code).toBeGreaterThanOrEqual(1);
      // CJK ideographs only — catches a stray romaji/kana typo in the field.
      expect(j.kanji, p.code).toMatch(/^[一-鿿]+$/);
      expect(j.romaji, p.code).toMatch(/^[a-z]+$/);
      expect(j.gloss.length, p.code).toBeGreaterThan(2);
      expect(j.note.length, p.code).toBeGreaterThan(20);
    }
  });

  it('the bed fills soon after it opens — a cheap plant is earnable at the unlock', () => {
    const openAt = SEED_EARN_SCHEDULE.find(s => s.opensQuadrant === 'japanese')!;
    const opener = getPlant(openAt.plantCode)!;
    expect(opener.garden).toBe('japanese');
    // Whatever opens the bed must be quick to mature, so the plots
    // aren't bare while the child waits on a 400-cost tree.
    expect(opener.growthCost).toBeLessThanOrEqual(100);
  });

  it('6 japanese species are earnable by 1300 correct — one per plot', () => {
    const earnedBy1300 = getEarnedSeedCodes(1300)
      .map(c => getPlant(c)!)
      .filter(p => p.garden === 'japanese');
    expect(earnedBy1300.length).toBeGreaterThanOrEqual(6);
  });
});
