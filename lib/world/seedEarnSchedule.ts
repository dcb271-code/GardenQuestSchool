// lib/world/seedEarnSchedule.ts
//
// When the learner earns each seed in the Tiny Garden reward-game.
// Thresholds are cumulative correct attempts (lifetime). Three of the
// thresholds also OPEN a new garden quadrant — those use the
// `opensQuadrant` field to drive a stronger session-end celebration.
//
// See docs/superpowers/specs/2026-05-01-tiny-garden-design.md §6.

export type GardenType = 'vegetable' | 'flower' | 'fruit' | 'japanese';

export interface SeedEarn {
  atCorrect: number;
  plantCode: string;
  opensQuadrant?: 'flower' | 'fruit' | 'japanese';
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
