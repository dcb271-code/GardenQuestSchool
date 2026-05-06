// lib/world/plotLayout.ts
//
// 16 fixed plot positions for the Tiny Garden reward-game. Plots are
// grouped into 4 quadrants of 4 plots each. The plot's `garden` field
// matches the quadrant — and constrains which seeds can be planted in it
// (radish only in vegetable plots, etc.). See spec §7.

import type { GardenType } from './plantCatalog';

export interface PlotData {
  code: string;          // 'veg-1' .. 'japanese-4'
  garden: GardenType;
  x: number;             // plot center x in viewBox (1440 wide)
  y: number;             // plot center y in viewBox (900 tall)
}

export const PLOTS: PlotData[] = [
  // Vegetable (top-left): 2x2 — top row pushed below the fence (y:138-154)
  // and tree canopies (y:100-115). Bottom row stays put.
  { code: 'veg-1',      garden: 'vegetable', x: 220,  y: 200 },
  { code: 'veg-2',      garden: 'vegetable', x: 480,  y: 200 },
  { code: 'veg-3',      garden: 'vegetable', x: 220,  y: 355 },
  { code: 'veg-4',      garden: 'vegetable', x: 480,  y: 355 },
  // Fruit (top-right): 2x2 — trees are larger but use same plot count
  { code: 'fruit-1',    garden: 'fruit',     x: 940,  y: 200 },
  { code: 'fruit-2',    garden: 'fruit',     x: 1200, y: 200 },
  { code: 'fruit-3',    garden: 'fruit',     x: 940,  y: 355 },
  { code: 'fruit-4',    garden: 'fruit',     x: 1200, y: 355 },
  // Flower (bottom-left): 2x2
  { code: 'flower-1',   garden: 'flower',    x: 220,  y: 500 },
  { code: 'flower-2',   garden: 'flower',    x: 480,  y: 500 },
  { code: 'flower-3',   garden: 'flower',    x: 220,  y: 680 },
  { code: 'flower-4',   garden: 'flower',    x: 480,  y: 680 },
  // Japanese (bottom-right): 2x2
  { code: 'japanese-1', garden: 'japanese',  x: 940,  y: 500 },
  { code: 'japanese-2', garden: 'japanese',  x: 1200, y: 500 },
  { code: 'japanese-3', garden: 'japanese',  x: 940,  y: 680 },
  { code: 'japanese-4', garden: 'japanese',  x: 1200, y: 680 },
];

export function plotsForGarden(garden: GardenType): PlotData[] {
  return PLOTS.filter(p => p.garden === garden);
}

export function getPlot(code: string): PlotData | undefined {
  return PLOTS.find(p => p.code === code);
}

// Quadrant centroids (used to position the title pill / locked-overlay).
// Top pills sit between the back fence (y:138-154) and the new top plot
// row (y:200) — leaves the sky band clear and stops the pills from
// floating in front of the trees.
export const QUADRANT_LAYOUT: Record<GardenType, { x: number; y: number; label: string }> = {
  vegetable: { x: 350,  y: 178, label: 'vegetable patch' },
  fruit:     { x: 1070, y: 178, label: 'fruit grove' },
  flower:    { x: 350,  y: 444, label: 'flower garden' },
  japanese:  { x: 1070, y: 444, label: 'japanese garden' },
};
