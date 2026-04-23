import { describe, it, expect } from 'vitest';
import { computeEligibleSpecies, computeNewArrivals } from '@/lib/world/arrivals';
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
