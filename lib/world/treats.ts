// lib/world/treats.ts
//
// Treats — phase three of the shop, and the answer to a letter:
// "Way can't I feed the browing animals?"
//
// A treat is bought for pennies in the shop, carried in the pantry,
// and given to a discovered animal standing beside its habitat on the
// garden map. The animal eats, and tells her one true thing — the
// mechanic Luna proved: affection is cheap, and a fact a day sticks
// where thirty in a sitting do not.
//
// THE CAPS, in the house style. One treat per animal per day,
// enforced server-side against her home-timezone day. No coin is ever
// paid for feeding — treats COST money, they never make it — so the
// shop's anti-farming ledger gains no new source.

import { SPECIES_CATALOG, type SpeciesData } from './speciesCatalog';

export interface TreatKind {
  code: string;
  name: string;
  emoji: string;
  /** Pennies. "A few pennies" was the promise — 5 to 15. */
  price: number;
  blurb: string;
  /** Habitats whose residents eat this. */
  habitatCodes: string[];
}

export const TREAT_KINDS: TreatKind[] = [
  {
    code: 'treat_seed_cake', name: 'Seed cake', emoji: '🌻', price: 10,
    blurb: 'Pressed sunflower and millet. Birds line up for it.',
    habitatCodes: ['bird_feeder', 'owl_box'],
  },
  {
    code: 'treat_garden_greens', name: 'Garden greens', emoji: '🥕', price: 5,
    blurb: 'Carrot tops and clover. The burrowers\' favorite.',
    habitatCodes: ['bunny_burrow', 'ant_hill'],
  },
  {
    code: 'treat_bug_tin', name: 'Bug tin', emoji: '🪱', price: 8,
    blurb: 'Mealworms and grubs. For animals that hunt in the dark and the damp.',
    habitatCodes: ['frog_pond', 'log_pile', 'crystal_cavern', 'operations_cave'],
  },
  {
    code: 'treat_nectar_drop', name: 'Nectar drop', emoji: '🍯', price: 6,
    blurb: 'A drop of sugar water in a little cup. For wings that hover.',
    habitatCodes: ['bee_hotel', 'butterfly_bush'],
  },
];

export function getTreatKind(code: string): TreatKind | undefined {
  return TREAT_KINDS.find(t => t.code === code);
}

/**
 * Which treat this species eats — matched through the habitat that
 * attracted it. Null for a species no treat suits (a moth that only
 * drinks from the moonflower does not want a seed cake, and offering
 * one would teach the wrong thing).
 */
export function treatKindFor(species: SpeciesData): TreatKind | null {
  return TREAT_KINDS.find(t =>
    species.habitatReqCodes.some(h => t.habitatCodes.includes(h)),
  ) ?? null;
}

/** Pantry and feeding log live inside garden.shop. */
export interface TreatsState {
  /** treatCode -> how many she is carrying. */
  pantry?: Record<string, number>;
  /** speciesCode -> ISO date last fed, for the one-a-day cap. */
  animalsFed?: Record<string, string>;
  /** speciesCode -> lifetime feeds, so the facts rotate. */
  fedCount?: Record<string, number>;
}

export function canFeedToday(state: TreatsState, speciesCode: string, today: string): boolean {
  return (state.animalsFed ?? {})[speciesCode] !== today;
}

export function pantryCount(state: TreatsState, treatCode: string): number {
  return (state.pantry ?? {})[treatCode] ?? 0;
}

/**
 * The true thing the animal tells her. Rotates between its fun fact
 * and its field description, so the second feeding is not a rerun of
 * the first.
 */
export function factFor(species: SpeciesData, fedCount: number): string {
  const facts = [species.funFact, species.description].filter(Boolean);
  return facts[fedCount % facts.length];
}

/**
 * Feed one animal. Pure — the route owns the clock and the save.
 * Returns null (with no state change) if she has no suitable treat,
 * the animal was already fed today, or no treat suits this species.
 */
export function feedAnimal(
  state: TreatsState, speciesCode: string, today: string,
): { state: TreatsState; fact: string; treat: TreatKind } | null {
  const species = SPECIES_CATALOG.find(s => s.code === speciesCode);
  if (!species) return null;
  const treat = treatKindFor(species);
  if (!treat) return null;
  if (!canFeedToday(state, speciesCode, today)) return null;
  if (pantryCount(state, treat.code) <= 0) return null;

  const pantry = { ...(state.pantry ?? {}) };
  pantry[treat.code] = pantry[treat.code] - 1;
  if (pantry[treat.code] <= 0) delete pantry[treat.code];
  const fedCount = ((state.fedCount ?? {})[speciesCode] ?? 0);

  return {
    state: {
      ...state,
      pantry,
      animalsFed: { ...(state.animalsFed ?? {}), [speciesCode]: today },
      fedCount: { ...(state.fedCount ?? {}), [speciesCode]: fedCount + 1 },
    },
    fact: factFor(species, fedCount),
    treat,
  };
}
