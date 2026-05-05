// Pure validation logic shared by the server action and tests. No
// Supabase / Next imports — just data structures so we can unit-test.

import type { GrowState } from '@/lib/world/growGarden';
import { getPlant } from '@/lib/world/plantCatalog';

export type { GrowState };

export type ValidationResult = { ok: true } | { ok: false; reason: string };

export function validatePlantRequest(
  state: GrowState,
  plotCode: string,
  plantCode: string,
): ValidationResult {
  const plotEntry = state.plots.find(p => p.plot.code === plotCode);
  if (!plotEntry) return { ok: false, reason: 'no plot with that code' };
  if (plotEntry.plant) return { ok: false, reason: 'plot is occupied' };
  if (!state.earnedSeeds.some(s => s.code === plantCode)) {
    return { ok: false, reason: 'seed not earned yet' };
  }
  const plant = getPlant(plantCode);
  if (!plant) return { ok: false, reason: 'unknown plant' };
  if (plant.garden !== plotEntry.plot.garden) {
    return { ok: false, reason: `wrong kind of garden — ${plant.commonName} grows in the ${plant.garden} garden` };
  }
  if (!state.openQuadrants.has(plant.garden)) {
    return { ok: false, reason: `that quadrant isn't open yet` };
  }
  return { ok: true };
}
