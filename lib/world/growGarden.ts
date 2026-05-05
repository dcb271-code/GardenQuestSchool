// lib/world/growGarden.ts
//
// Single aggregator that loads everything the /garden/grow page
// renders. Returns cumulativeCorrect (universal growth tick),
// derived earned seeds, open quadrants, and 16 plots each
// optionally annotated with the plant currently growing in it.
//
// Per-plant progress = cumulativeCorrect - planted_at_correct.
// All plants grow at the same rate (1 correct = +1 to every planted
// plant) — this falls naturally out of the math; no per-plant tick.

import type { SupabaseClient } from '@supabase/supabase-js';
import { getCumulativeCorrect } from './cumulativeProgress';
import {
  getEarnedSeedCodes,
  getOpenQuadrants,
  type GardenType,
} from './seedEarnSchedule';
import { PLANT_CATALOG, getPlant, type PlantData } from './plantCatalog';
import { PLOTS, type PlotData } from './plotLayout';

export interface PlantInPlot {
  data: PlantData;
  progress: number;          // current correct attempts since planted
  isMature: boolean;         // progress >= data.growthCost
  plantedAt: Date;
}

export interface PlotWithPlant {
  plot: PlotData;
  plant?: PlantInPlot;
}

export interface GrowState {
  cumulativeCorrect: number;
  earnedSeeds: PlantData[];                // seeds the learner can plant
  openQuadrants: Set<GardenType>;
  plots: PlotWithPlant[];                  // always 16, plant optional
}

interface GardenPlotRow {
  plot_code: string;
  plant_code: string;
  planted_at_correct: number;
  planted_at?: string;
}

export async function loadGrowState(
  db: SupabaseClient,
  learnerId: string,
): Promise<GrowState> {
  const cumulativeCorrect = await getCumulativeCorrect(db, learnerId);

  const { data: plotRows, error } = await db
    .from('garden_plot')
    .select('plot_code, plant_code, planted_at_correct, planted_at')
    .eq('learner_id', learnerId)
    .is('harvested_at', null);
  // FAIL-SOFT: if the garden_plot table doesn't exist yet (the
  // migration `010_garden_plot.sql` hasn't been applied), don't
  // crash the whole /garden/grow page — just treat it as having
  // zero plots planted. Cecily can still see the layout, the
  // earned-seeds inventory, and the tap-empty-plot prompt. Planting
  // actions will surface the real error inline. Once the migration
  // is applied this branch is no longer exercised.
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[growGarden] garden_plot read failed (migration not applied?):', error.message);
    }
    return {
      cumulativeCorrect,
      earnedSeeds: getEarnedSeedCodes(cumulativeCorrect)
        .map(c => getPlant(c))
        .filter((p): p is PlantData => !!p),
      openQuadrants: getOpenQuadrants(cumulativeCorrect),
      plots: PLOTS.map(plot => ({ plot })),
    };
  }

  const byPlotCode = new Map<string, GardenPlotRow>();
  for (const row of (plotRows ?? []) as GardenPlotRow[]) {
    byPlotCode.set(row.plot_code, row);
  }

  const plots: PlotWithPlant[] = PLOTS.map(plot => {
    const row = byPlotCode.get(plot.code);
    if (!row) return { plot };
    const data = getPlant(row.plant_code);
    if (!data) return { plot };  // guard: orphan plant_code (shouldn't happen)
    const progress = Math.max(0, cumulativeCorrect - row.planted_at_correct);
    return {
      plot,
      plant: {
        data,
        progress,
        isMature: progress >= data.growthCost,
        plantedAt: row.planted_at ? new Date(row.planted_at) : new Date(0),
      },
    };
  });

  const earnedCodes = getEarnedSeedCodes(cumulativeCorrect);
  const earnedSeeds = earnedCodes
    .map(c => getPlant(c))
    .filter((p): p is PlantData => !!p);

  return {
    cumulativeCorrect,
    earnedSeeds,
    openQuadrants: getOpenQuadrants(cumulativeCorrect),
    plots,
  };
}
