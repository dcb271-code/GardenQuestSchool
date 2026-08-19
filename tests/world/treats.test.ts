import { describe, it, expect } from 'vitest';
import {
  TREAT_KINDS, treatKindFor, feedAnimal, canFeedToday, pantryCount, factFor,
} from '@/lib/world/treats';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

const TODAY = '2026-08-18';

function speciesIn(habitat: string) {
  const sp = SPECIES_CATALOG.find(s => s.habitatReqCodes.includes(habitat));
  expect(sp, `no species found for habitat ${habitat}`).toBeDefined();
  return sp!;
}

describe('what each animal eats', () => {
  it('every habitat with residents has a treat that suits it', () => {
    const covered = Array.from(new Set(TREAT_KINDS.flatMap(t => t.habitatCodes)));
    for (const habitat of covered) {
      const sp = SPECIES_CATALOG.find(s => s.habitatReqCodes.includes(habitat));
      if (sp) expect(treatKindFor(sp)).not.toBeNull();
    }
  });

  it('a bird eats seed cake, a bunny eats greens', () => {
    expect(treatKindFor(speciesIn('bird_feeder'))?.code).toBe('treat_seed_cake');
    expect(treatKindFor(speciesIn('bunny_burrow'))?.code).toBe('treat_garden_greens');
  });

  it('a species with no habitat wants no treat', () => {
    const wanderer = SPECIES_CATALOG.find(s => s.habitatReqCodes.length === 0);
    if (wanderer) expect(treatKindFor(wanderer)).toBeNull();
  });

  it('treats cost a few pennies, never nothing, never a fortune', () => {
    for (const t of TREAT_KINDS) {
      expect(t.price).toBeGreaterThanOrEqual(5);
      expect(t.price).toBeLessThanOrEqual(15);
    }
  });
});

describe('feeding', () => {
  const bird = speciesIn('bird_feeder');
  const stocked = { pantry: { treat_seed_cake: 2 } };

  it('feeds a stocked animal once, spends the treat, tells a truth', () => {
    const out = feedAnimal(stocked, bird.code, TODAY);
    expect(out).not.toBeNull();
    expect(pantryCount(out!.state, 'treat_seed_cake')).toBe(1);
    expect(out!.fact.length).toBeGreaterThan(0);
    expect(out!.state.animalsFed![bird.code]).toBe(TODAY);
  });

  it('refuses a second feeding the same day', () => {
    const once = feedAnimal(stocked, bird.code, TODAY)!;
    expect(canFeedToday(once.state, bird.code, TODAY)).toBe(false);
    expect(feedAnimal(once.state, bird.code, TODAY)).toBeNull();
  });

  it('feeds again tomorrow, with a different truth', () => {
    const once = feedAnimal(stocked, bird.code, TODAY)!;
    const again = feedAnimal(once.state, bird.code, '2026-08-19');
    expect(again).not.toBeNull();
    expect(again!.fact).not.toBe(once.fact);
  });

  it('refuses with an empty pantry, and spends nothing', () => {
    expect(feedAnimal({}, bird.code, TODAY)).toBeNull();
    expect(feedAnimal({ pantry: { treat_garden_greens: 3 } }, bird.code, TODAY)).toBeNull();
  });

  it('facts rotate and repeat honestly', () => {
    expect(factFor(bird, 0)).toBe(bird.funFact);
    expect(factFor(bird, 1)).toBe(bird.description);
    expect(factFor(bird, 2)).toBe(bird.funFact);
  });
});
