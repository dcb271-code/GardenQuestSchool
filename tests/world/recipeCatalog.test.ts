import { describe, it, expect } from 'vitest';
import { RECIPE_CATALOG, cookableRecipes, getRecipe } from '@/lib/world/recipeCatalog';
import { PLANT_CATALOG } from '@/lib/world/plantCatalog';
import { SEED_EARN_SCHEDULE } from '@/lib/world/seedEarnSchedule';

const PLANT_CODES = new Set(PLANT_CATALOG.map(p => p.code));

describe('RECIPE_CATALOG', () => {
  it('every ingredient is a real catalog plant with a seed-earn entry', () => {
    for (const r of RECIPE_CATALOG) {
      for (const [plant, count] of Object.entries(r.ingredients)) {
        expect(PLANT_CODES.has(plant), `${r.code}: unknown plant ${plant}`).toBe(true);
        expect(
          SEED_EARN_SCHEDULE.some(s => s.plantCode === plant),
          `${r.code}: ${plant} has no seed-earn entry`,
        ).toBe(true);
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  it('recipes are well-formed: unique codes, 2+ questions, exactly one correct index each', () => {
    const codes = new Set(RECIPE_CATALOG.map(r => r.code));
    expect(codes.size).toBe(RECIPE_CATALOG.length);
    for (const r of RECIPE_CATALOG) {
      expect(r.questions.length).toBeGreaterThanOrEqual(2);
      expect(r.facts.length).toBeGreaterThanOrEqual(2);
      for (const q of r.questions) {
        expect(q.choices.length).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
      }
    }
  });

  it('at least two recipes are cookable from vegetable-garden plants alone', () => {
    // A learner who has not yet opened the fruit grove must still have
    // something to cook — the kitchen can't be all locked doors.
    const vegOnly: Record<string, number> = { radish: 99, mint: 99, lettuce: 99, carrot: 99, tomato: 99, pumpkin: 99 };
    expect(cookableRecipes(vegOnly).length).toBeGreaterThanOrEqual(2);
  });

  it('cookableRecipes respects exact counts', () => {
    expect(cookableRecipes({ mint: 3 }).map(r => r.code)).toContain('mint_tea');
    expect(cookableRecipes({ mint: 2 }).map(r => r.code)).not.toContain('mint_tea');
    expect(cookableRecipes({})).toEqual([]);
  });

  it('getRecipe round-trips codes', () => {
    for (const r of RECIPE_CATALOG) expect(getRecipe(r.code)?.name).toBe(r.name);
  });
});
