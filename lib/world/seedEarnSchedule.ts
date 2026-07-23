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
  { atCorrect: 1400, plantCode: 'lupine' },
  { atCorrect: 1600, plantCode: 'cherry' },
  // ── beyond the trellis ──────────────────────────────────────────
  // These quadrants live on the second grow screen. The screen itself
  // is gated on MASTERY (trellisGating.ts), not on this count — the
  // counts below only pace seed earns / quadrant opens once through.
  { atCorrect: 1800, plantCode: 'peach',          opensQuadrant: 'orchard' },
  { atCorrect: 1950, plantCode: 'pawpaw' },
  { atCorrect: 2100, plantCode: 'raspberry',      opensQuadrant: 'berry' },
  { atCorrect: 2250, plantCode: 'plum' },
  { atCorrect: 2400, plantCode: 'blackberry' },
  { atCorrect: 2550, plantCode: 'basil',          opensQuadrant: 'herb' },
  { atCorrect: 2700, plantCode: 'persimmon' },
  { atCorrect: 2850, plantCode: 'lavender' },
  { atCorrect: 3000, plantCode: 'gooseberry' },
  { atCorrect: 3150, plantCode: 'chamomile' },
  { atCorrect: 3300, plantCode: 'moonflower',     opensQuadrant: 'moon' },
  { atCorrect: 3450, plantCode: 'fig' },
  { atCorrect: 3600, plantCode: 'elderberry' },
  { atCorrect: 3750, plantCode: 'rosemary' },
  { atCorrect: 3900, plantCode: 'eveningprimrose' },
  { atCorrect: 4050, plantCode: 'currant' },
  { atCorrect: 4200, plantCode: 'thyme' },
  { atCorrect: 4350, plantCode: 'fouroclock' },
  { atCorrect: 4500, plantCode: 'nightphlox' },
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
