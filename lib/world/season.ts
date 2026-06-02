// lib/world/season.ts
//
// Season helpers for the Naturalist Grove walk picker. Pure functions.
// Northern-hemisphere meteorological seasons (Louisville KY / RRG).
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §6

import { FLORA_CATALOG, type Season } from './floraCatalog';

// month is 1-12 (January = 1). Caller passes new Date().getMonth() + 1.
export function currentSeason(month: number): Season {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`currentSeason: month must be 1-12, got ${month}`);
  }
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // 12, 1, 2
}

// All flora codes whose `seasons` array includes the given season.
export function floraCodesInSeason(season: Season): string[] {
  return FLORA_CATALOG
    .filter(f => f.seasons.includes(season))
    .map(f => f.code);
}
