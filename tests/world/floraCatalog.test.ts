import { describe, it, expect } from 'vitest';
import { FLORA_CATALOG, type FloraData } from '@/lib/world/floraCatalog';

describe('FLORA_CATALOG — shape', () => {
  it('is an array', () => {
    expect(Array.isArray(FLORA_CATALOG)).toBe(true);
  });

  it('every entry has a non-empty string code', () => {
    for (const f of FLORA_CATALOG) {
      expect(typeof f.code).toBe('string');
      expect(f.code.length).toBeGreaterThan(0);
    }
  });

  it('every code is unique', () => {
    const codes = FLORA_CATALOG.map(f => f.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('FloraData type is importable', () => {
    const sample: FloraData = {
      code: 'sample',
      commonName: 'Sample',
      scientificName: 'Sampleus testus',
      kind: 'tree',
      localTier: 'hyper_local',
      emoji: '🌳',
      seasons: ['spring'],
      notableFeatures: ['none'],
      facts: ['none'],
      wikiSpecies: 'Sampleus_testus',
      inatTaxonId: 1,
      photoRoles: ['whole'],
    };
    expect(sample.code).toBe('sample');
  });
});

describe('FLORA_CATALOG — invariants per entry', () => {
  const VALID_KINDS = new Set(['tree', 'flower', 'fern', 'shrub']);
  const VALID_SEASONS = new Set(['spring', 'summer', 'fall', 'winter']);
  const VALID_LOCAL_TIERS = new Set(['hyper_local', 'canonical_native']);
  const VALID_PHOTO_ROLES = new Set(['whole', 'leaf', 'bark', 'flower', 'fruit']);

  it('catalog is defined (invariant suite ready)', () => {
    expect(FLORA_CATALOG).toBeDefined();
  });

  for (const f of FLORA_CATALOG) {
    describe(`${f.code}`, () => {
      it('has valid kind', () => {
        expect(VALID_KINDS.has(f.kind)).toBe(true);
      });
      it('has valid localTier', () => {
        expect(VALID_LOCAL_TIERS.has(f.localTier)).toBe(true);
      });
      it('has at least one season', () => {
        expect(f.seasons.length).toBeGreaterThan(0);
      });
      it('every season is valid', () => {
        for (const s of f.seasons) expect(VALID_SEASONS.has(s)).toBe(true);
      });
      it('has at least one notable feature', () => {
        expect(f.notableFeatures.length).toBeGreaterThan(0);
      });
      it('has 1-3 facts', () => {
        expect(f.facts.length).toBeGreaterThanOrEqual(1);
        expect(f.facts.length).toBeLessThanOrEqual(3);
      });
      it('wikiSpecies is non-empty', () => {
        expect(f.wikiSpecies.length).toBeGreaterThan(0);
      });
      it('inatTaxonId is a positive integer', () => {
        expect(Number.isInteger(f.inatTaxonId)).toBe(true);
        expect(f.inatTaxonId).toBeGreaterThan(0);
      });
      it('has at least one photoRole', () => {
        expect(f.photoRoles.length).toBeGreaterThan(0);
      });
      it('every photoRole is valid', () => {
        for (const r of f.photoRoles) expect(VALID_PHOTO_ROLES.has(r)).toBe(true);
      });
      it('photoRoles are unique', () => {
        expect(new Set(f.photoRoles).size).toBe(f.photoRoles.length);
      });
    });
  }
});

describe('FLORA_CATALOG — pilot composition', () => {
  it('contains exactly 10 species', () => {
    expect(FLORA_CATALOG.length).toBe(10);
  });

  it('contains 5 trees and 5 flowers', () => {
    const trees = FLORA_CATALOG.filter(f => f.kind === 'tree');
    const flowers = FLORA_CATALOG.filter(f => f.kind === 'flower');
    expect(trees.length).toBe(5);
    expect(flowers.length).toBe(5);
  });

  it('covers all four seasons across the catalog', () => {
    const allSeasons = new Set(FLORA_CATALOG.flatMap(f => f.seasons));
    expect(allSeasons.has('spring')).toBe(true);
    expect(allSeasons.has('summer')).toBe(true);
    expect(allSeasons.has('fall')).toBe(true);
    expect(allSeasons.has('winter')).toBe(true);
  });
});
