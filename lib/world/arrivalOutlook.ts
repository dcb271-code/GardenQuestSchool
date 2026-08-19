// lib/world/arrivalOutlook.ts
//
// The garden should say "full" out loud.
//
// Cecily wrote "way do the animals not uriveing at their habits" when
// the truth was that every animal her habitats could attract had
// already arrived — the pool was empty, nothing said so, and a full
// garden looks exactly like a broken one. This computes the honest
// answer: how many can still come, and when none can, exactly what
// would change that, in words a child can act on.

import { HABITAT_CATALOG } from './habitatCatalog';
import { computeEligibleSpecies } from './arrivals';
import type { SpeciesData } from './speciesCatalog';

export interface ArrivalOutlook {
  /** Species that can arrive with things as they are. */
  waitingNow: number;
  /** Species she has discovered, out of everything habitats attract. */
  discovered: number;
  attractable: number;
  /**
   * When waitingNow is 0: each way to bring more, with a count.
   * Sorted most-animals-first so the best move leads.
   */
  unlocks: Array<{
    kind: 'build' | 'badge';
    habitatCode: string;
    habitatName: string;
    speciesCount: number;
  }>;
}

export function arrivalOutlook(
  builtHabitatCodes: string[],
  discoveredCodes: string[],
  researcherBadgeCodes: string[],
  catalog: SpeciesData[],
): ArrivalOutlook {
  const built = new Set(builtHabitatCodes);
  const have = new Set(discoveredCodes);
  const badges = new Set(researcherBadgeCodes);

  // Everything a habitat can attract, whether hers is built or not.
  // Species with no habitat (the night moths arrive via a bloom, the
  // cave creatures via digging) are not the arrival system's to
  // promise, so they are not counted against it.
  const attractableAll = catalog.filter(s => s.habitatReqCodes.length > 0);

  const eligible = computeEligibleSpecies(
    builtHabitatCodes, catalog, researcherBadgeCodes,
  );
  const waitingNow = eligible.filter(s => !have.has(s.code)).length;

  // What would each missing thing unlock? A species may need a
  // habitat built, a badge earned, or both — it counts toward each
  // missing piece, because doing that piece moves it closer.
  const byUnlock = new Map<string, { kind: 'build' | 'badge'; habitatCode: string; count: number }>();
  for (const s of attractableAll) {
    if (have.has(s.code)) continue;
    for (const h of s.habitatReqCodes) {
      if (!built.has(h)) {
        const key = `build:${h}`;
        const cur = byUnlock.get(key) ?? { kind: 'build' as const, habitatCode: h, count: 0 };
        cur.count++;
        byUnlock.set(key, cur);
      } else if (s.requiresResearcherBadge && !badges.has(h)) {
        const key = `badge:${h}`;
        const cur = byUnlock.get(key) ?? { kind: 'badge' as const, habitatCode: h, count: 0 };
        cur.count++;
        byUnlock.set(key, cur);
      }
    }
  }

  const unlocks = Array.from(byUnlock.values())
    .map(u => ({
      kind: u.kind,
      habitatCode: u.habitatCode,
      habitatName:
        HABITAT_CATALOG.find(h => h.code === u.habitatCode)?.name ?? u.habitatCode,
      speciesCount: u.count,
    }))
    .sort((a, b) => b.speciesCount - a.speciesCount);

  return {
    waitingNow,
    discovered: attractableAll.filter(s => have.has(s.code)).length,
    attractable: attractableAll.length,
    unlocks,
  };
}

/**
 * The sentence the journal shows. Null while animals can still
 * arrive on their own — a garden that is not full needs no sign.
 */
export function outlookMessage(o: ArrivalOutlook): string | null {
  if (o.waitingNow > 0) return null;
  if (o.unlocks.length === 0) {
    return `Every animal in the whole world has arrived — ${o.discovered} of ${o.attractable}. You found them all.`;
  }
  const parts = o.unlocks.map(u =>
    u.kind === 'build'
      ? `build the ${u.habitatName.toLowerCase()} (${u.speciesCount} waiting)`
      : `earn the researcher badge at the ${u.habitatName.toLowerCase()} (${u.speciesCount} waiting)`,
  );
  return `Your garden is full — every animal it can attract has arrived, all ${o.discovered}. More are out there: ${parts.join(', ')}.`;
}
