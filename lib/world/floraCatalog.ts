// lib/world/floraCatalog.ts
//
// Catalog of trees + wildflowers + ferns + shrubs that Cecily can
// identify in the Naturalist Grove module. Parallel to
// speciesCatalog.ts (which covers fauna like ants + butterflies).
//
// Phase 1 pilot: 10 species (5 trees, 5 flowers) covering spring,
// summer, fall, winter so the seasonal walk-selection algorithm in
// Phase 3 has content year-round. Phase 5 expands to ~55.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §5

export type FloraKind = 'tree' | 'flower' | 'fern' | 'shrub';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type LocalTier = 'hyper_local' | 'canonical_native';
export type PhotoRole = 'whole' | 'leaf' | 'bark' | 'flower' | 'fruit';

export interface FloraData {
  code: string;                  // 'red_maple', 'eastern_redbud'
  commonName: string;            // "Red Maple"
  scientificName: string;        // "Acer rubrum"
  kind: FloraKind;
  localTier: LocalTier;
  emoji: string;                 // fallback / journal chip
  seasons: Season[];             // when this species is visibly identifiable
  notableFeatures: string[];     // ['lobed leaf', 'red samaras', 'smooth grey bark']
  facts: string[];               // 2-3 short kid-readable facts
  wikiSpecies: string;           // 'Acer_rubrum' — for Wikimedia category lookup
  inatTaxonId: number;           // iNaturalist taxon id
  photoRoles: PhotoRole[];       // which photo roles exist for this species
}

export const FLORA_CATALOG: FloraData[] = [];
