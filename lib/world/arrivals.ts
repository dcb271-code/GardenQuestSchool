import type { SpeciesData } from './speciesCatalog';

export function computeEligibleSpecies(
  placedHabitatCodes: string[],
  catalog: SpeciesData[]
): SpeciesData[] {
  const placedSet = new Set(placedHabitatCodes);
  return catalog.filter(s =>
    s.habitatReqCodes.length > 0 &&
    s.habitatReqCodes.every(h => placedSet.has(h))
  );
}

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
