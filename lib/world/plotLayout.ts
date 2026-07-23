// lib/world/plotLayout.ts
//
// 45 fixed plot positions for the Tiny Garden reward-game, across two
// screens. Plots are grouped into 8 quadrants — each with its OWN
// character-driven layout instead of a grid:
//   home screen:
//   • Vegetable patch  (6) — two staggered furrow rows of 3
//   • Fruit grove      (5) — loose orchard, cross-pattern
//   • Flower garden    (8) — scattered along a winding S-curve
//   • Japanese garden  (6) — moss islands between stepping stones
//   beyond the trellis:
//   • Orchard          (5) — wide zig-zag, room for big canopies
//   • Berry patch      (5) — two bowed picking rows
//   • Herb & tea       (5) — close arc around the potting table
//   • Moon garden      (5) — crescent opening toward the lantern
// The plot's `garden` field matches the quadrant — and constrains which
// seeds can be planted in it (radish only in vegetable plots, etc.).
// See spec §7.

import type { GardenType } from './plantCatalog';

export interface PlotData {
  code: string;          // 'veg-1' .. 'moon-5'
  garden: GardenType;
  x: number;             // plot center x in viewBox (1440 wide)
  y: number;             // plot center y in viewBox (900 tall)
}

// The grow game spans two screens: the original four beds ('home') and
// the four beds beyond the trellis gate ('beyond'). Both use the same
// 1440×900 viewBox — each scene renders only its own screen's plots.
export type GrowScreen = 'home' | 'beyond';

export const GARDEN_SCREEN: Record<GardenType, GrowScreen> = {
  vegetable: 'home',
  fruit:     'home',
  flower:    'home',
  japanese:  'home',
  orchard:   'beyond',
  berry:     'beyond',
  herb:      'beyond',
  moon:      'beyond',
};

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

  // FLOWER GARDEN (bottom-left) — 8 plots scattered along a winding
  // S-curve, as if planted along a meandering footpath through the bed.
  // Deliberately NOT a grid — the eye traces the curve from upper-left
  // down to the lower-right corner. flower-8 tucks into the curve's
  // inner elbow (clear of the bird bath at ~527,699 and the lavender
  // spikes), so every flower species can be in the ground at once.
  { code: 'flower-1', garden: 'flower', x: 155, y: 525 },
  { code: 'flower-2', garden: 'flower', x: 235, y: 560 },
  { code: 'flower-3', garden: 'flower', x: 310, y: 610 },
  { code: 'flower-4', garden: 'flower', x: 260, y: 690 },
  { code: 'flower-5', garden: 'flower', x: 380, y: 650 },
  { code: 'flower-6', garden: 'flower', x: 455, y: 595 },
  { code: 'flower-7', garden: 'flower', x: 530, y: 535 },
  { code: 'flower-8', garden: 'flower', x: 390, y: 545 },

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

  // ── BEYOND THE TRELLIS (screen 2) ──────────────────────────────────

  // ORCHARD (top-left) — 5 tree plots in a loose zig-zag. Widest
  // spacing of any bed: mature peach/pawpaw canopies are BIG, and the
  // gaps leave room for the ladder + basket anchors at the edges.
  { code: 'orchard-1', garden: 'orchard', x: 170, y: 230 },
  { code: 'orchard-2', garden: 'orchard', x: 330, y: 210 },
  { code: 'orchard-3', garden: 'orchard', x: 490, y: 230 },
  { code: 'orchard-4', garden: 'orchard', x: 250, y: 365 },
  { code: 'orchard-5', garden: 'orchard', x: 415, y: 365 },

  // BERRY PATCH (top-right) — 5 plots in two picking rows that bow
  // gently outward, like canes trained along low wires.
  { code: 'berry-1', garden: 'berry', x: 890,  y: 235 },
  { code: 'berry-2', garden: 'berry', x: 1035, y: 215 },
  { code: 'berry-3', garden: 'berry', x: 1180, y: 235 },
  { code: 'berry-4', garden: 'berry', x: 960,  y: 360 },
  { code: 'berry-5', garden: 'berry', x: 1110, y: 360 },

  // HERB & TEA GARDEN (bottom-left) — 5 plots hugging a gentle arc
  // around the potting-table corner, close-spaced like a kitchen bed
  // you tend without stepping in.
  { code: 'herb-1', garden: 'herb', x: 170, y: 545 },
  { code: 'herb-2', garden: 'herb', x: 315, y: 525 },
  { code: 'herb-3', garden: 'herb', x: 460, y: 545 },
  { code: 'herb-4', garden: 'herb', x: 240, y: 665 },
  { code: 'herb-5', garden: 'herb', x: 395, y: 672 },

  // MOON GARDEN (bottom-right) — 5 plots along a crescent that opens
  // toward the stone lantern, so the planted bed itself reads as a
  // waxing moon from above.
  { code: 'moon-1', garden: 'moon', x: 900,  y: 545 },
  { code: 'moon-2', garden: 'moon', x: 1020, y: 515 },
  { code: 'moon-3', garden: 'moon', x: 1145, y: 545 },
  { code: 'moon-4', garden: 'moon', x: 960,  y: 655 },
  { code: 'moon-5', garden: 'moon', x: 1100, y: 660 },
];

export function plotsForGarden(garden: GardenType): PlotData[] {
  return PLOTS.filter(p => p.garden === garden);
}

export function plotsForScreen(screen: GrowScreen): PlotData[] {
  return PLOTS.filter(p => GARDEN_SCREEN[p.garden] === screen);
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
  // beyond the trellis — same pill positions, second screen
  orchard:   { x: 320,  y: 178, label: 'orchard' },
  berry:     { x: 1045, y: 178, label: 'berry patch' },
  herb:      { x: 340,  y: 478, label: 'herb & tea garden' },
  moon:      { x: 1075, y: 478, label: 'moon garden' },
};
