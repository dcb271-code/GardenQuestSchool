import { describe, it, expect } from 'vitest';
import { computeEligibleSpecies, computeNewArrivals, pickArrivalForSession } from '@/lib/world/arrivals';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

describe('arrivals', () => {
  it('no habitats → no eligible species', () => {
    expect(computeEligibleSpecies([], SPECIES_CATALOG, [])).toEqual([]);
  });

  it('ant hill placed → leafcutter + carpenter ant eligible', () => {
    const eligible = computeEligibleSpecies(['ant_hill'], SPECIES_CATALOG, []);
    const codes = eligible.map(s => s.code).sort();
    expect(codes).toEqual(['carpenter_ant', 'leafcutter_ant']);
  });

  it('multiple habitats cumulative', () => {
    const eligible = computeEligibleSpecies(['ant_hill', 'frog_pond'], SPECIES_CATALOG, []);
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
    const eligible = computeEligibleSpecies(['frog_pond'], SPECIES_CATALOG, []);
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

describe('the queue/validate contract', () => {
  // Cecily hit this on the device: the painted turtle's arrival card
  // came up EVERY time she went back to the garden.
  //
  // Cause: session-end queues an arrival using pickArrivalForSession,
  // which is badge-aware, so it correctly queued the turtle. The
  // arrival route then re-validated the queued code with
  // computeEligibleSpecies but forgot to pass the badges, decided its
  // own queued species was ineligible, returned 400 — and so never
  // reached clearPendingArrival. The pending code stayed in
  // world_state forever and the card fired on every visit.
  //
  // The two functions gate the same thing and must agree. That is the
  // invariant, and it is what these tests pin.

  const ALL_HABITATS = HABITAT_CATALOG.map(h => h.code);
  const BADGE_SETS = [
    [],
    ['frog_pond'],
    ['log_pile'],
    ['butterfly_bush'],
    ['frog_pond', 'log_pile'],
    ALL_HABITATS,
  ];

  it('anything pickArrivalForSession can queue, computeEligibleSpecies accepts', () => {
    for (const badges of BADGE_SETS) {
      const eligible = computeEligibleSpecies(ALL_HABITATS, SPECIES_CATALOG, badges)
        .map(s => s.code);
      for (let seed = 0; seed < 40; seed++) {
        const picked = pickArrivalForSession({
          placedHabitatCodes: ALL_HABITATS,
          alreadyUnlockedSpeciesCodes: [],
          practicedSkillCodes: [],
          speciesCatalog: SPECIES_CATALOG,
          researcherBadgeCodes: badges,
          rngSeed: seed,
        });
        if (!picked) continue;
        expect(
          eligible,
          `queued ${picked.code} with badges [${badges.join(',')}] but validation rejects it`,
        ).toContain(picked.code);
      }
    }
  });

  it('holds when only the rare species are left to find', () => {
    // The exact shape of the bug: everything common already
    // discovered, so the only thing left to queue IS badge-gated.
    const common = SPECIES_CATALOG.filter(s => !s.requiresResearcherBadge).map(s => s.code);
    for (const badges of BADGE_SETS) {
      const eligible = computeEligibleSpecies(ALL_HABITATS, SPECIES_CATALOG, badges)
        .map(s => s.code);
      for (let seed = 0; seed < 20; seed++) {
        const picked = pickArrivalForSession({
          placedHabitatCodes: ALL_HABITATS,
          alreadyUnlockedSpeciesCodes: common,
          practicedSkillCodes: [],
          speciesCatalog: SPECIES_CATALOG,
          researcherBadgeCodes: badges,
          rngSeed: seed,
        });
        if (!picked) continue;
        expect(picked.requiresResearcherBadge).toBe(true);
        expect(eligible, `${picked.code} queued but not validatable`).toContain(picked.code);
      }
    }
  });

  it('the painted turtle specifically round-trips', () => {
    const badges = ['frog_pond'];
    const common = SPECIES_CATALOG.filter(s => !s.requiresResearcherBadge).map(s => s.code);
    const picked = pickArrivalForSession({
      placedHabitatCodes: ['frog_pond'],
      alreadyUnlockedSpeciesCodes: common,
      practicedSkillCodes: [],
      speciesCatalog: SPECIES_CATALOG,
      researcherBadgeCodes: badges,
      rngSeed: 1,
    });
    expect(picked?.code).toBe('painted_turtle');
    expect(computeEligibleSpecies(['frog_pond'], SPECIES_CATALOG, badges).map(s => s.code))
      .toContain('painted_turtle');
  });
});
