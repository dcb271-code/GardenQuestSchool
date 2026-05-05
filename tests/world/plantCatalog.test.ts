// tests/world/plantCatalog.test.ts
import { describe, it, expect } from 'vitest';
import { PLANT_CATALOG, getPlant, plantStageFor } from '@/lib/world/plantCatalog';
import { SEED_EARN_SCHEDULE } from '@/lib/world/seedEarnSchedule';

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
    const validGardens = new Set(['vegetable', 'flower', 'fruit', 'japanese']);
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
