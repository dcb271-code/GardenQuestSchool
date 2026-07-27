// tests/world/speciesSeedable.test.ts
//
// SPECIES_CATALOG is one of only two catalogs in this codebase that is
// NOT purely config. `journal_entry` carries a foreign key to the
// `species` table, so a species needs a real database row before
// anyone can discover it.
//
// That exception is easy to forget, because everything else here —
// plants, units, quests, plots, walks — works the moment you append to
// an array. Three rare visitors were added to the catalog and the
// world seed was never re-run, so the arrival route looked up rows
// that did not exist. Cecily got the same painted turtle arriving
// every time she opened the garden, for days.
//
// The route now heals a missing row from the catalog, so the loop
// cannot recur. These tests cover the other half: that a catalog entry
// always HAS everything the row needs, so seeding can't fail on a
// future species either.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

/** Columns seed-world.ts writes, and the catalog field each comes from. */
const REQUIRED: Array<[column: string, field: keyof (typeof SPECIES_CATALOG)[number]]> = [
  ['code', 'code'],
  ['common_name', 'commonName'],
  ['scientific_name', 'scientificName'],
  ['description', 'description'],
  ['fun_fact', 'funFact'],
  ['illustration_key', 'illustrationKey'],
];

describe('every species can be written to the species table', () => {
  it('has a non-empty value for every seeded column', () => {
    for (const s of SPECIES_CATALOG) {
      for (const [column, field] of REQUIRED) {
        const v = s[field];
        expect(typeof v, `${s.code}.${String(field)} → ${column}`).toBe('string');
        expect(String(v).trim().length, `${s.code}.${String(field)} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('has unique codes — the upsert conflict key', () => {
    const codes = SPECIES_CATALOG.map(s => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('only requires habitats that actually exist', () => {
    // habitat_req_codes is written straight into the row and read back
    // by the arrival logic; a typo here silently makes a species
    // undiscoverable rather than erroring.
    const known = new Set(HABITAT_CATALOG.map(h => h.code));
    for (const s of SPECIES_CATALOG) {
      expect(s.habitatReqCodes.length, `${s.code} requires no habitat`).toBeGreaterThan(0);
      for (const h of s.habitatReqCodes) {
        expect(known.has(h), `${s.code} requires unknown habitat "${h}"`).toBe(true);
      }
    }
  });

  it('the world seed derives from the catalog rather than a hand-written list', () => {
    // If someone ever replaces the loop with a literal array, catalog
    // additions start silently missing from the database again — which
    // is exactly how this bug happened.
    const src = readFileSync(join(process.cwd(), 'scripts', 'seed-world.ts'), 'utf8');
    expect(src).toMatch(/for\s*\(\s*const\s+\w+\s+of\s+SPECIES_CATALOG\s*\)/);
    expect(src).toMatch(/onConflict:\s*'code'/);
  });

  it('the arrival route heals a missing species row instead of failing forever', () => {
    // The durable fix for the loop Cecily hit. If this helper is
    // removed, a future catalog addition can strand a child again.
    const src = readFileSync(
      join(process.cwd(), 'app', 'api', 'garden', 'arrival', 'route.ts'), 'utf8',
    );
    expect(src).toMatch(/ensureSpeciesRow/);
    expect(src).toMatch(/from\('species'\)\.upsert|from\('species'\)\s*\.upsert/);
  });
});
