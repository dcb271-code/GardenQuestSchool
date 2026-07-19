import { describe, it, expect } from 'vitest';
import { computeStructureProgress, ZONE_SKILL_ORDER } from '@/lib/world/zoneProgress';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';

const noPrereqHint = () => 'more practice';

describe('zoneProgress — baseline mastery counts as completed', () => {
  const readingOrder = ZONE_SKILL_ORDER.reading;
  const firstStop = GARDEN_STRUCTURES.find(s => s.code === readingOrder[0])!;
  const secondStop = GARDEN_STRUCTURES.find(s => s.code === readingOrder[1])!;

  it('fresh learner: first zone stop is next, later stops locked', () => {
    const progress = computeStructureProgress(
      GARDEN_STRUCTURES, new Map(), noPrereqHint, new Set(),
    );
    expect(progress[firstStop.code].isNext).toBe(true);
    expect(progress[firstStop.code].unlocked).toBe(true);
    expect(progress[secondStop.code].unlocked).toBe(false);
  });

  it('a mastered skill is completed with zero recorded attempts', () => {
    const mastered = new Set([firstStop.skillCode!]);
    const progress = computeStructureProgress(
      GARDEN_STRUCTURES, new Map(), noPrereqHint, mastered,
    );
    expect(progress[firstStop.code].completed).toBe(true);
    // The zone pointer advances past the mastered stop.
    expect(progress[secondStop.code].isNext).toBe(true);
    expect(progress[secondStop.code].unlocked).toBe(true);
  });

  it('a fully-baselined learner has the whole zone open, nothing forced', () => {
    const mastered = new Set(
      readingOrder
        .map(code => GARDEN_STRUCTURES.find(s => s.code === code)?.skillCode)
        .filter((c): c is string => !!c),
    );
    const progress = computeStructureProgress(
      GARDEN_STRUCTURES, new Map(), noPrereqHint, mastered,
    );
    for (const code of readingOrder) {
      expect(progress[code].completed).toBe(true);
      expect(progress[code].unlocked).toBe(true);
      expect(progress[code].isNext).toBe(false);
    }
  });

  it('attempt-count completion still works without mastery', () => {
    const correct = new Map([[firstStop.skillCode!, 10]]);
    const progress = computeStructureProgress(
      GARDEN_STRUCTURES, correct, noPrereqHint, new Set(),
    );
    expect(progress[firstStop.code].completed).toBe(true);
    expect(progress[secondStop.code].isNext).toBe(true);
  });
});
