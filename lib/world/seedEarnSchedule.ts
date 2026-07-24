// lib/world/seedEarnSchedule.ts
//
// When the learner earns each seed in the Tiny Garden reward-game.
// Thresholds are cumulative correct attempts (lifetime). Three of the
// thresholds also OPEN a new garden quadrant — those use the
// `opensQuadrant` field to drive a stronger session-end celebration.
//
// See docs/superpowers/specs/2026-05-01-tiny-garden-design.md §6.

export type GardenType =
  // home screen — the original four beds
  | 'vegetable' | 'flower' | 'fruit' | 'japanese'
  // beyond-the-trellis screen — see lib/world/trellisGating.ts
  | 'orchard' | 'berry' | 'herb' | 'moon';

export interface SeedEarn {
  atCorrect: number;
  plantCode: string;
  opensQuadrant?: Exclude<GardenType, 'vegetable'>;
}

export const SEED_EARN_SCHEDULE: SeedEarn[] = [
  { atCorrect: 25,   plantCode: 'radish' },
  { atCorrect: 75,   plantCode: 'mint' },
  { atCorrect: 100,  plantCode: 'carrot' },
  { atCorrect: 150,  plantCode: 'lettuce' },
  { atCorrect: 200,  plantCode: 'tomato' },
  { atCorrect: 250,  plantCode: 'tulip',     opensQuadrant: 'flower' },
  { atCorrect: 325,  plantCode: 'pumpkin' },
  { atCorrect: 375,  plantCode: 'daisy' },
  { atCorrect: 425,  plantCode: 'blackeyedsusan' },
  { atCorrect: 500,  plantCode: 'sunflower' },
  { atCorrect: 575,  plantCode: 'coneflower' },
  { atCorrect: 700,  plantCode: 'apple',     opensQuadrant: 'fruit' },
  { atCorrect: 750,  plantCode: 'strawberry' },
  { atCorrect: 800,  plantCode: 'milkweed' },
  { atCorrect: 850,  plantCode: 'blueberry' },
  { atCorrect: 950,  plantCode: 'bamboo',    opensQuadrant: 'japanese' },
  { atCorrect: 1100, plantCode: 'beebalm' },
  { atCorrect: 1250, plantCode: 'bonsai' },
  // lupine + cherry moved slightly EARLIER (1400→1350, 1600→1550) to
  // free their old slots for the orchard/berry quadrant opens below —
  // strictly more generous, no learner can lose an earned seed.
  { atCorrect: 1350, plantCode: 'lupine' },
  // ── beyond the trellis ──────────────────────────────────────────
  // These quadrants live on the second grow screen. The screen itself
  // is gated on MASTERY (trellisGating.ts), not on this count — the
  // counts below only pace seed earns / quadrant opens once through.
  // Quadrants wake at 1400 and then every 200: 1600 / 1800 / 2000.
  { atCorrect: 1400, plantCode: 'peach',          opensQuadrant: 'orchard' },
  { atCorrect: 1500, plantCode: 'pawpaw' },
  { atCorrect: 1550, plantCode: 'cherry' },
  { atCorrect: 1600, plantCode: 'raspberry',      opensQuadrant: 'berry' },
  { atCorrect: 1700, plantCode: 'plum' },
  { atCorrect: 1750, plantCode: 'blackberry' },
  { atCorrect: 1800, plantCode: 'basil',          opensQuadrant: 'herb' },
  { atCorrect: 1875, plantCode: 'persimmon' },
  { atCorrect: 1950, plantCode: 'lavender' },
  { atCorrect: 2000, plantCode: 'moonflower',     opensQuadrant: 'moon' },
  { atCorrect: 2100, plantCode: 'gooseberry' },
  { atCorrect: 2200, plantCode: 'chamomile' },
  { atCorrect: 2300, plantCode: 'fig' },
  { atCorrect: 2400, plantCode: 'elderberry' },
  { atCorrect: 2500, plantCode: 'rosemary' },
  { atCorrect: 2600, plantCode: 'eveningprimrose' },
  { atCorrect: 2700, plantCode: 'currant' },
  { atCorrect: 2800, plantCode: 'thyme' },
  { atCorrect: 2900, plantCode: 'fouroclock' },
  { atCorrect: 3000, plantCode: 'nightphlox' },
];

export function getEarnedSeedCodes(cumulativeCorrect: number): string[] {
  return SEED_EARN_SCHEDULE
    .filter(s => cumulativeCorrect >= s.atCorrect)
    .map(s => s.plantCode);
}

export function getOpenQuadrants(cumulativeCorrect: number): Set<GardenType> {
  const open = new Set<GardenType>(['vegetable']);
  for (const s of SEED_EARN_SCHEDULE) {
    if (s.opensQuadrant && cumulativeCorrect >= s.atCorrect) open.add(s.opensQuadrant);
  }
  return open;
}

// Used at session-end to decide whether to render any celebration cards.
// Returns the schedule entries whose threshold was crossed BY this session
// (i.e. > beforeCorrect AND ≤ afterCorrect).
export function getSessionSeedEarns(beforeCorrect: number, afterCorrect: number): SeedEarn[] {
  return SEED_EARN_SCHEDULE.filter(s => s.atCorrect > beforeCorrect && s.atCorrect <= afterCorrect);
}
