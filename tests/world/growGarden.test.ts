// tests/world/growGarden.test.ts
import { describe, it, expect, vi } from 'vitest';
import { loadGrowState } from '@/lib/world/growGarden';

function mockDb(plotRows: any[], correctCount: number) {
  // Build a chainable mock that handles both 'attempt' and 'garden_plot' calls.
  const attemptChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ data: plotRows, error: null }),
    then: undefined,
  };
  const plotChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ data: plotRows, error: null }),
  };
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'attempt') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: correctCount, error: null }),
            }),
          }),
        };
      }
      // garden_plot
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: plotRows, error: null }),
          }),
        }),
      };
    }),
  } as any;
}

describe('loadGrowState', () => {
  it('returns 0 cumulative + empty plots + only vegetable open at zero progress', async () => {
    const db = mockDb([], 0);
    const state = await loadGrowState(db, 'l');
    expect(state.cumulativeCorrect).toBe(0);
    expect(state.openQuadrants.has('vegetable')).toBe(true);
    expect(state.openQuadrants.has('flower')).toBe(false);
    expect(state.earnedSeeds).toEqual([]);
    expect(state.plots).toHaveLength(24);
    for (const p of state.plots) expect(p.plant).toBeUndefined();
  });

  it('attaches plant data + computes progress relative to planted_at_correct', async () => {
    const db = mockDb(
      [{ plot_code: 'veg-1', plant_code: 'radish', planted_at_correct: 30 }],
      45,
    );
    const state = await loadGrowState(db, 'l');
    const veg1 = state.plots.find(p => p.plot.code === 'veg-1');
    expect(veg1?.plant?.data.code).toBe('radish');
    expect(veg1?.plant?.progress).toBe(15);     // 45 - 30
    expect(veg1?.plant?.isMature).toBe(false);  // radish growthCost is 20
  });

  it('marks mature when progress >= growthCost', async () => {
    const db = mockDb(
      [{ plot_code: 'veg-2', plant_code: 'radish', planted_at_correct: 0 }],
      25,
    );
    const state = await loadGrowState(db, 'l');
    const veg2 = state.plots.find(p => p.plot.code === 'veg-2');
    expect(veg2?.plant?.isMature).toBe(true);
  });

  it('opens flower quadrant at 250 cumulative correct', async () => {
    const db = mockDb([], 260);
    const state = await loadGrowState(db, 'l');
    expect(state.openQuadrants.has('flower')).toBe(true);
    expect(state.openQuadrants.has('fruit')).toBe(false);
    expect(state.earnedSeeds.map(s => s.code)).toContain('tulip');
  });
});
