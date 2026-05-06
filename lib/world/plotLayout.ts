// lib/world/plotLayout.ts
//
// 24 fixed plot positions for the Tiny Garden reward-game. Plots are
// grouped into 4 quadrants — each with its OWN character-driven layout
// instead of a 2x2 grid:
//   • Vegetable patch  (6) — two staggered furrow rows of 3
//   • Fruit grove      (5) — loose orchard, cross-pattern
//   • Flower garden    (7) — scattered along a winding S-curve
//   • Japanese garden  (6) — moss islands between stepping stones
// The plot's `garden` field matches the quadrant — and constrains which
// seeds can be planted in it (radish only in vegetable plots, etc.).
// See spec §7.

import type { GardenType } from './plantCatalog';

export interface PlotData {
  code: string;          // 'veg-1' .. 'japanese-6'
  garden: GardenType;
  x: number;             // plot center x in viewBox (1440 wide)
  y: number;             // plot center y in viewBox (900 tall)
}

export const PLOTS: PlotData[] = [
  // VEGETABLE PATCH (top-left) — 6 plots in two staggered furrow rows.
  // The offset between rows reads like a hand-tilled bed, not a spreadsheet.
  // Top row tucked safely below the fence (y:138-154) and tree canopies
  // (y:100-115); bottom row leaves the lower edge clear for the wheelbarrow.
  { code: 'veg-1', garden: 'vegetable', x: 165, y: 220 },
  { code: 'veg-2', garden: 'vegetable', x: 290, y: 220 },
  { code: 'veg-3', garden: 'vegetable', x: 415, y: 220 },
  { code: 'veg-4', garden: 'vegetable', x: 220, y: 360 },
  { code: 'veg-5', garden: 'vegetable', x: 345, y: 360 },
  { code: 'veg-6', garden: 'vegetable', x: 470, y: 360 },

  // FRUIT GROVE (top-right) — 5 plots in a loose orchard cross-pattern.
  // Wider spacing than the vegetable rows because mature apple canopies
  // need room to breathe. Center tree slightly forward to break symmetry.
  { code: 'fruit-1', garden: 'fruit', x: 905,  y: 225 },
  { code: 'fruit-2', garden: 'fruit', x: 1185, y: 225 },
  { code: 'fruit-3', garden: 'fruit', x: 1045, y: 305 },
  { code: 'fruit-4', garden: 'fruit', x: 905,  y: 385 },
  { code: 'fruit-5', garden: 'fruit', x: 1185, y: 385 },

  // FLOWER GARDEN (bottom-left) — 7 plots scattered along a winding
  // S-curve, as if planted along a meandering footpath through the bed.
  // Deliberately NOT a grid — the eye traces the curve from upper-left
  // down to the lower-right corner.
  { code: 'flower-1', garden: 'flower', x: 155, y: 525 },
  { code: 'flower-2', garden: 'flower', x: 235, y: 560 },
  { code: 'flower-3', garden: 'flower', x: 310, y: 610 },
  { code: 'flower-4', garden: 'flower', x: 260, y: 690 },
  { code: 'flower-5', garden: 'flower', x: 380, y: 650 },
  { code: 'flower-6', garden: 'flower', x: 455, y: 595 },
  { code: 'flower-7', garden: 'flower', x: 530, y: 535 },

  // JAPANESE GARDEN (bottom-right) — 6 plots as MOSS ISLANDS arranged
  // AROUND the central sand garden + along the stepping-stone path.
  // The right edge is reserved for the koi stream + moon bridge, so
  // plots stay clear of the water. No grid — each plot reads as a
  // deliberately-placed mound of moss the gardener decided would look
  // best right *there*.
  { code: 'japanese-1', garden: 'japanese', x: 895,  y: 520 },
  { code: 'japanese-2', garden: 'japanese', x: 1010, y: 540 },
  { code: 'japanese-3', garden: 'japanese', x: 1150, y: 520 },
  { code: 'japanese-4', garden: 'japanese', x: 1180, y: 635 },
  { code: 'japanese-5', garden: 'japanese', x: 975,  y: 690 },
  { code: 'japanese-6', garden: 'japanese', x: 860,  y: 630 },
];

export function plotsForGarden(garden: GardenType): PlotData[] {
  return PLOTS.filter(p => p.garden === garden);
}

export function getPlot(code: string): PlotData | undefined {
  return PLOTS.find(p => p.code === code);
}

// Quadrant centroids (used to position the title pill / locked-overlay).
// Top pills sit between the back fence (y:138-154) and the new top plot
// row (y:220) — leaves the sky band clear and stops the pills from
// floating in front of the trees. Bottom pills sit just above each
// quadrant's first plot row.
export const QUADRANT_LAYOUT: Record<GardenType, { x: number; y: number; label: string }> = {
  vegetable: { x: 320,  y: 178, label: 'vegetable patch' },
  fruit:     { x: 1045, y: 178, label: 'fruit grove' },
  flower:    { x: 340,  y: 478, label: 'flower garden' },
  japanese:  { x: 1075, y: 478, label: 'japanese garden' },
};
