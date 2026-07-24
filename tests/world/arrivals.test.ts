import { describe, it, expect } from 'vitest';
import { computeEligibleSpecies, computeNewArrivals, pickArrivalForSession } from '@/lib/world/arrivals';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

describe('arrivals', () => {
  it('no habitats → no eligible species', () => {
    expect(computeEligibleSpecies([], SPECIES_CATALOG)).toEqual([]);
  });

  it('ant hill placed → leafcutter + carpenter ant eligible', () => {
    const eligible = computeEligibleSpecies(['ant_hill'], SPECIES_CATALOG);
    const codes = eligible.map(s => s.code).sort();
    expect(codes).toEqual(['carpenter_ant', 'leafcutter_ant']);
  });

  it('multiple habitats cumulative', () => {
    const eligible = computeEligibleSpecies(['ant_hill', 'frog_pond'], SPECIES_CATALOG);
    const codes = new Set(eligible.map(s => s.code));
    expect(codes.has('leafcutter_ant')).toBe(true);
    expect(codes.has('tree_frog')).toBe(true);
    expect(codes.has('spring_peeper')).toBe(true);
  });

  it('newArrivals excludes already-unlocked species', () => {
    const arrivals = computeNewArrivals(
      ['ant_hill'],
      ['leafcutter_ant'],
      SPECIES_CATALOG
    );
    expect(arrivals.map(s => s.code)).toEqual(['carpenter_ant']);
  });

  it('newArrivals is empty when everything is already unlocked', () => {
    const arrivals = computeNewArrivals(
      ['ant_hill'],
      ['leafcutter_ant', 'carpenter_ant'],
      SPECIES_CATALOG
    );
    expect(arrivals).toEqual([]);
  });
});

describe('researcher-badge gated rare visitors', () => {
  it('rare species are NOT eligible from a built habitat without its badge', () => {
    const eligible = computeEligibleSpecies(['frog_pond'], SPECIES_CATALOG);
    expect(eligible.map(s => s.code)).not.toContain('painted_turtle');
  });

  it('rare species become eligible once every required habitat is badged', () => {
    const eligible = computeEligibleSpecies(['frog_pond'], SPECIES_CATALOG, ['frog_pond']);
    expect(eligible.map(s => s.code)).toContain('painted_turtle');
  });

  it('a dual-habitat rare species needs BOTH badges', () => {
    const oneBadge = computeEligibleSpecies(
      ['frog_pond', 'log_pile'], SPECIES_CATALOG, ['log_pile'],
    );
    expect(oneBadge.map(s => s.code)).not.toContain('spotted_salamander');
    const bothBadges = computeEligibleSpecies(
      ['frog_pond', 'log_pile'], SPECIES_CATALOG, ['log_pile', 'frog_pond'],
    );
    expect(bothBadges.map(s => s.code)).toContain('spotted_salamander');
  });

  it('pickArrivalForSession never picks a rare species without the badge', () => {
    // Everything common already discovered — only the turtle remains.
    const commonPondCodes = SPECIES_CATALOG
      .filter(s => !s.requiresResearcherBadge)
      .map(s => s.code);
    const withoutBadge = pickArrivalForSession({
      placedHabitatCodes: ['frog_pond'],
      alreadyUnlockedSpeciesCodes: commonPondCodes,
      practicedSkillCodes: [],
      speciesCatalog: SPECIES_CATALOG,
      rngSeed: 1,
    });
    expect(withoutBadge).toBeNull();

    const withBadge = pickArrivalForSession({
      placedHabitatCodes: ['frog_pond'],
      alreadyUnlockedSpeciesCodes: commonPondCodes,
      practicedSkillCodes: [],
      speciesCatalog: SPECIES_CATALOG,
      researcherBadgeCodes: ['frog_pond'],
      rngSeed: 1,
    });
    expect(withBadge?.code).toBe('painted_turtle');
  });
});
