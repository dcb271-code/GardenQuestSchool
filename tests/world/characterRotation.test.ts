import { describe, it, expect } from 'vitest';
import {
  todaysAlertCharacter,
  CHARACTER_CODES,
  type CharacterCode,
} from '@/lib/world/characterRotation';

const LEARNER_A = '11111111-1111-1111-1111-111111111111';
const LEARNER_B = '22222222-2222-2222-2222-222222222222';
const DAY_1 = new Date('2026-04-26T10:00:00Z');
const DAY_2 = new Date('2026-04-27T10:00:00Z');

describe('characterRotation', () => {
  it('CHARACTER_CODES is a frozen tuple of three names', () => {
    expect(CHARACTER_CODES).toEqual(['nana', 'hodge', 'signpost']);
  });

  it('returns one of the three character codes', () => {
    const code = todaysAlertCharacter(LEARNER_A, DAY_1);
    expect(CHARACTER_CODES).toContain(code);
  });

  it('is deterministic: same learner + same date → same character', () => {
    const a1 = todaysAlertCharacter(LEARNER_A, DAY_1);
    const a2 = todaysAlertCharacter(LEARNER_A, DAY_1);
    expect(a1).toBe(a2);
  });

  it('time of day does not change the result', () => {
    const morning = new Date('2026-04-26T03:00:00Z');
    const evening = new Date('2026-04-26T22:00:00Z');
    expect(todaysAlertCharacter(LEARNER_A, morning))
      .toBe(todaysAlertCharacter(LEARNER_A, evening));
  });

  it('different learners on the same day can get different characters', () => {
    const seen = new Set<CharacterCode>();
    for (let i = 0; i < 30; i++) {
      const fakeLearner = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
      seen.add(todaysAlertCharacter(fakeLearner, DAY_1));
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it('same learner across many days hits all three characters', () => {
    const seen = new Set<CharacterCode>();
    const start = new Date('2026-04-26T10:00:00Z').getTime();
    for (let i = 0; i < 30; i++) {
      const day = new Date(start + i * 24 * 3600 * 1000);
      seen.add(todaysAlertCharacter(LEARNER_A, day));
    }
    expect(seen.size).toBe(3);
  });

  it('day boundary changes the result deterministically', () => {
    const d1 = todaysAlertCharacter(LEARNER_B, DAY_1);
    const d2 = todaysAlertCharacter(LEARNER_B, DAY_2);
    expect(CHARACTER_CODES).toContain(d1);
    expect(CHARACTER_CODES).toContain(d2);
  });
});
