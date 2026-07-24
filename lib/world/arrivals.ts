import { HABITAT_CATALOG } from './habitatCatalog';
import type { SpeciesData } from './speciesCatalog';

/**
 * Species become "eligible" once at least one of their required habitats
 * is placed in the learner's garden.
 */
export function computeEligibleSpecies(
  placedHabitatCodes: string[],
  catalog: SpeciesData[],
  researcherBadgeCodes: string[] = []
): SpeciesData[] {
  const placedSet = new Set(placedHabitatCodes);
  const badgeSet = new Set(researcherBadgeCodes);
  return catalog.filter(s =>
    s.habitatReqCodes.length > 0 &&
    s.habitatReqCodes.every(h => placedSet.has(h)) &&
    (!s.requiresResearcherBadge || s.habitatReqCodes.every(h => badgeSet.has(h)))
  );
}

/**
 * @deprecated Arrivals no longer fire on garden load. Use
 *   `pickArrivalForSession` at session-end instead so a new creature
 *   feels earned by the practice the child just did.
 */
export function computeNewArrivals(
  placedHabitatCodes: string[],
  alreadyUnlockedCodes: string[],
  catalog: SpeciesData[]
): SpeciesData[] {
  const unlocked = new Set(alreadyUnlockedCodes);
  return computeEligibleSpecies(placedHabitatCodes, catalog).filter(
    s => !unlocked.has(s.code)
  );
}

/**
 * Pick the most thematically-appropriate species to arrive after a
 * session. Strategy:
 *
 *   1. Build the set of habitats whose prereqSkillCodes overlap with
 *      a skill the child practiced this session ("themed habitats").
 *   2. From eligible (placed) habitats, prefer themed ones; fall back
 *      to any eligible habitat.
 *   3. Pick the first species attached to that habitat that the
 *      learner hasn't discovered yet.
 *
 * Returns null if there's no creature left to discover.
 */
export function pickArrivalForSession({
  placedHabitatCodes,
  alreadyUnlockedSpeciesCodes,
  practicedSkillCodes,
  speciesCatalog,
  researcherBadgeCodes = [],
  rngSeed = Date.now(),
}: {
  placedHabitatCodes: string[];
  alreadyUnlockedSpeciesCodes: string[];
  practicedSkillCodes: string[];
  speciesCatalog: SpeciesData[];
  /** Habitats whose researcher quest is complete — gates rare visitors. */
  researcherBadgeCodes?: string[];
  rngSeed?: number;
}): SpeciesData | null {
  const placedSet = new Set(placedHabitatCodes);
  const unlockedSet = new Set(alreadyUnlockedSpeciesCodes);
  const practicedSet = new Set(practicedSkillCodes);
  const badgeSet = new Set(researcherBadgeCodes);

  // Themed habitats — placed AND prereqSkillCodes intersect practicedSkills
  const themedHabitatCodes = HABITAT_CATALOG
    .filter(h =>
      placedSet.has(h.code) &&
      h.prereqSkillCodes.some(s => practicedSet.has(s)),
    )
    .map(h => h.code);

  const eligibleSpecies = speciesCatalog.filter(s =>
    s.habitatReqCodes.length > 0 &&
    s.habitatReqCodes.every(h => placedSet.has(h)) &&
    // Rare visitors wait until every required habitat is badge-researched.
    (!s.requiresResearcherBadge || s.habitatReqCodes.every(h => badgeSet.has(h))) &&
    !unlockedSet.has(s.code),
  );

  // Prefer species whose habitat is themed
  const themed = eligibleSpecies.filter(s =>
    s.habitatReqCodes.some(h => themedHabitatCodes.includes(h)),
  );
  const pool = themed.length > 0 ? themed : eligibleSpecies;
  if (pool.length === 0) return null;

  // Deterministic-ish pick from the pool so the same session doesn't
  // produce different arrivals on retry.
  const idx = Math.abs(rngSeed) % pool.length;
  return pool[idx];
}
