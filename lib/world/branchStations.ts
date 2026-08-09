// lib/world/branchStations.ts
//
// Stations (the collapse/expand landmarks) and the tap geometry of
// everything on a branch map, in one place that a test can read.
//
// Why this file exists: there were THREE independent position systems
// — `MapStructure` x/y in branchMaps.ts, station boxes hardcoded in
// each scene component, and standalone signpost groups written inline
// as `translate(...)` literals — and nothing compared them. Three real
// collisions shipped as a result:
//
//   * Mirror Tarns' centre landed inside the High Meadow close box, so
//     tapping the stop collapsed the station instead of opening it.
//   * "Paragraph Pavers" was painted over the Nature Walk signpost and,
//     being later in document order, stole its taps.
//   * The Ee/Ea Glade's centre sits inside the Phonics Path box.
//
// None of that is visible to a logic test, and none of it is visible in
// a rendered still either — it is hit-testing, not painting. So the
// geometry has to be data, and tests/world/branchLayout.test.ts asserts
// it doesn't overlap.

export type BranchCode = 'math_mountain' | 'reading_forest';

export interface Box { x0: number; y0: number; x1: number; y1: number }
export interface Circle { cx: number; cy: number; r: number }

export interface BranchStation {
  key: string;
  branch: BranchCode;
  codes: string[];
  x: number;
  y: number;
  label: string;
  /**
   * The cave draws its own silhouette as the target, so it gets no
   * invisible rect. Everything else does.
   */
  noTapTarget?: boolean;
}

/** Marker geometry shared by every branch scene. Keep in step with the scenes. */
export const MARKER = {
  UNIFORM: 38,     // icon font size
  HIT: 34,         // transparent tap circle radius
  LABEL_Y: 28,     // label pill offset below center
  LABEL_W: 92,
  LABEL_H: 17,
} as const;

/**
 * Collapsed: the whole landmark is the target, because there is nothing
 * else there to hit.
 *
 * Height was 108 and reached down to y+62, far below the art, which is
 * how it stole taps from Mountain Heights and Round to 100 even when
 * the station was shut.
 */
export const STATION_OPEN_BOX = { dx: -60, dy: -46, w: 120, h: 86 } as const;

/**
 * Expanded: ONLY the visible "tap to close" pill, padded for fingers.
 *
 * This is the fix for Mirror Tarns. The close target used to stay at
 * the full 120×108 while the station was open, so it sat on top of the
 * stops it had just revealed — roughly ten times the area of the pill
 * that looks like the close button, and offset upward from it.
 */
export const STATION_CLOSE_BOX = { dx: -50, dy: 24, w: 100, h: 28 } as const;

export const MATH_STATIONS: BranchStation[] = [
  { key: 'cottage', branch: 'math_mountain', x: 140, y: 476, label: 'Stories Cabin',
    codes: ['mm_stories_plus', 'mm_stories_minus', 'mm_long_stories'] },
  { key: 'cave', branch: 'math_mountain', x: 110, y: 760, label: 'Operations Cave',
    noTapTarget: true,
    codes: ['mm_hundreds_hollow', 'mm_fast_facts', 'mm_regroup_ridge'] },
  { key: 'orchard', branch: 'math_mountain', x: 1150, y: 595, label: 'Apple Orchard',
    codes: ['mm_equal_garden', 'mm_array_orchard', 'mm_times_to_5', 'mm_times_to_10'] },
  // Division's own station, replacing the old Division Glen. The marker
  // sits in the middle of its 2x2 block so the close pill, when open,
  // lands in the gap between the rows rather than on a stop — which is
  // the Mirror Tarns failure, and the reason this file exists.
  // Tucked into the RIGHT FLANK OF PEAK 2 — the solid right
  // mid-distance mountain with the snow cap (x 1020-1310, apex ~1180).
  //
  // Three placements to get here. Down at (1305, 370) it sat on rolling
  // meadow, which is not a cliffside. Moved to the far-right peak it
  // still read as floating, and the reason turned out to be that that
  // peak is the FAINTEST one on the map — 46% opacity — so anything on
  // it looks like it is on sky. Peak 2 is drawn at 70% and has a snow
  // cap, so a marker on its flank reads as being on a mountain.
  //
  // Placed so the buttress's long edge runs DOWN THE FLANK: its
  // top-left vertex lands on the mountain's edge at (1228, 186) and
  // the edge below it follows the same 46-degree slope, so the marker
  // reads as jutting from the mountainside rather than hovering
  // beside it.
  { key: 'cliffside', branch: 'math_mountain', x: 1250, y: 196, label: 'Cliffside Point',
    codes: ['mm_sharing_squirrels', 'mm_division_facts',
            'mm_missing_number', 'mm4_leftover_rocks'] },
  { key: 'measurement', branch: 'math_mountain', x: 845, y: 565, label: 'Measurement Meadow',
    codes: ['mm_even_odd', 'mm_garden_clock', 'mm_sundial', 'mm_hourglass',
            'mm_pebble_coins', 'mm_pie_slices', 'mm_bigger_slice'] },
  { key: 'high_meadow', branch: 'math_mountain', x: 860, y: 305, label: 'High Meadow Waystation',
    codes: ['mm4_valley_thousands', 'mm4_windy_tens', 'mm4_eagle_ledge',
            'mm4_factor_firs', 'mm4_mirror_tarns',
            'mm4_granite_sums', 'mm4_cloud_rounding', 'mm4_slice_share',
            'mm4_long_shadows', 'mm4_dewdrop_decimals', 'mm4_double_eagle',
            'mm4_frost_compare', 'mm4_terrace_gardens', 'mm4_tall_tales'] },
  { key: 'summit', branch: 'math_mountain', x: 725, y: 128, label: 'Summit Cairn',
    codes: ['mm5_summit_product', 'mm5_long_stair', 'mm5_meadow_portions',
            'mm5_uneven_slices', 'mm5_half_of_half', 'mm5_snowmelt_sums',
            'mm5_tenfold_falls', 'mm5_rule_stones', 'mm5_crystal_boxes',
            'mm5_storytellers_peak'] },
];

export const READING_STATIONS: BranchStation[] = [
  { key: 'phonics_band', branch: 'reading_forest', x: 840, y: 195, label: 'Phonics Path',
    codes: ['rf_digraphs', 'rf_initial_blends', 'rf_silent_e',
            'rf_vowel_ee_ea', 'rf_vowel_ai_ay', 'rf_vowel_oa_ow',
            'rf_r_controlled', 'rf_diphthongs'] },
];

/**
 * Interactive things drawn straight into a scene rather than coming
 * from `MapStructure` — signposts, doorways. They own taps too, and
 * nothing knew about them before, which is how a structure ended up
 * painted across the Nature Walk sign.
 */
export interface SceneHotspot {
  key: string;
  branch: BranchCode;
  label: string;
  box: Box;
}

export const SCENE_HOTSPOTS: SceneHotspot[] = [
  {
    key: 'nature_walk_signpost',
    branch: 'reading_forest',
    label: 'Nature Walk signpost',
    // translate(720, 752) with rect x -60 y -46 w 120 h 86
    box: { x0: 660, y0: 706, x1: 780, y1: 792 },
  },
];

export function stationsFor(branch: BranchCode): BranchStation[] {
  return branch === 'math_mountain' ? MATH_STATIONS : READING_STATIONS;
}

export function stationOpenBox(s: BranchStation): Box {
  return {
    x0: s.x + STATION_OPEN_BOX.dx,
    y0: s.y + STATION_OPEN_BOX.dy,
    x1: s.x + STATION_OPEN_BOX.dx + STATION_OPEN_BOX.w,
    y1: s.y + STATION_OPEN_BOX.dy + STATION_OPEN_BOX.h,
  };
}

export function stationCloseBox(s: BranchStation): Box {
  return {
    x0: s.x + STATION_CLOSE_BOX.dx,
    y0: s.y + STATION_CLOSE_BOX.dy,
    x1: s.x + STATION_CLOSE_BOX.dx + STATION_CLOSE_BOX.w,
    y1: s.y + STATION_CLOSE_BOX.dy + STATION_CLOSE_BOX.h,
  };
}

export function structureHit(st: { x: number; y: number }): Circle {
  return { cx: st.x, cy: st.y, r: MARKER.HIT };
}

export function structureLabelBox(st: { x: number; y: number }): Box {
  return {
    x0: st.x - MARKER.LABEL_W / 2,
    y0: st.y + MARKER.LABEL_Y,
    x1: st.x + MARKER.LABEL_W / 2,
    y1: st.y + MARKER.LABEL_Y + MARKER.LABEL_H,
  };
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

export function boxContainsPoint(b: Box, x: number, y: number): boolean {
  return x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;
}

/** How much of a circle's bounding box a rect steals — a cheap proxy. */
export function circleBoxOverlapArea(c: Circle, b: Box): number {
  const cb: Box = { x0: c.cx - c.r, y0: c.cy - c.r, x1: c.cx + c.r, y1: c.cy + c.r };
  const w = Math.max(0, Math.min(cb.x1, b.x1) - Math.max(cb.x0, b.x0));
  const h = Math.max(0, Math.min(cb.y1, b.y1) - Math.max(cb.y0, b.y0));
  return w * h;
}
