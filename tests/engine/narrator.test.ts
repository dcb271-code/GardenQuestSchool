import { describe, it, expect } from 'vitest';
import { computeNarratorMomentsFromSession } from '@/lib/engine/narrator';

describe('narrator — session-end moments', () => {
  it('fires remember_when_hard on review → mastered', () => {
    const moments = computeNarratorMomentsFromSession({
      masteryTransitions: [{ skillCode: 'math.add.within_20.crossing_ten', from: 'review', to: 'mastered' }],
      attempts: [],
    });
    expect(moments.length).toBeGreaterThanOrEqual(1);
    expect(moments[0].kind).toBe('remember_when_hard');
    expect(moments[0].skillCode).toBe('math.add.within_20.crossing_ten');
    expect(moments[0].text).toMatch(/remember|used to|felt|new/i);
  });

  it('fires practice_is_working when 2+ hard retries resolved correct', () => {
    const moments = computeNarratorMomentsFromSession({
      masteryTransitions: [],
      attempts: [
        { itemId: 'i1', outcome: 'correct', retryCount: 3, skillCode: 's' },
        { itemId: 'i2', outcome: 'correct', retryCount: 2, skillCode: 's' },
      ],
    });
    const practice = moments.find(m => m.kind === 'practice_is_working');
    expect(practice).toBeDefined();
    expect(practice!.text).toMatch(/practice|hard part|clicked/i);
  });

  it('returns empty array for boring sessions', () => {
    const moments = computeNarratorMomentsFromSession({
      masteryTransitions: [],
      attempts: [{ itemId: 'i1', outcome: 'correct', retryCount: 0, skillCode: 's' }],
    });
    expect(moments).toEqual([]);
  });
});
