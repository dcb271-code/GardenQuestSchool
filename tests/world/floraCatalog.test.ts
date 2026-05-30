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
