// app/(child)/garden/grow/actions.ts
//
// Server actions for planting + harvesting. Both validate via the
// shared helper, then write to garden_plot.

'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { loadGrowState } from '@/lib/world/growGarden';
import { validatePlantRequest } from './actions.shared';

export async function plantSeed(
  learnerId: string,
  plotCode: string,
  plantCode: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createServiceClient();
  const state = await loadGrowState(db, learnerId);
  const valid = validatePlantRequest(state, plotCode, plantCode);
  if (!valid.ok) return valid;

  const { error } = await db.from('garden_plot').insert({
    learner_id: learnerId,
    plot_code: plotCode,
    plant_code: plantCode,
    planted_at_correct: state.cumulativeCorrect,
  });
  if (error) return { ok: false, reason: error.message };

  revalidatePath('/garden/grow');
  return { ok: true };
}

export async function harvestPlant(
  learnerId: string,
  plotCode: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createServiceClient();
  const state = await loadGrowState(db, learnerId);
  const plotEntry = state.plots.find(p => p.plot.code === plotCode);
  if (!plotEntry?.plant) return { ok: false, reason: 'nothing planted here' };
  if (!plotEntry.plant.isMature) return { ok: false, reason: 'not ready yet' };

  const { error } = await db
    .from('garden_plot')
    .update({ harvested_at: new Date().toISOString() })
    .eq('learner_id', learnerId)
    .eq('plot_code', plotCode)
    .is('harvested_at', null);
  if (error) return { ok: false, reason: error.message };

  revalidatePath('/garden/grow');
  return { ok: true };
}
