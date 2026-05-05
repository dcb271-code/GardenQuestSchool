// tests/world/growActions.test.ts
//
// Server actions are tested via the helpers they delegate to. We
// extract the plant + harvest LOGIC into pure functions that the
// actions wrap, so we can test them without spinning up a Next runtime.
import { describe, it, expect } from 'vitest';
import {
  validatePlantRequest,
  type GrowState,
} from '@/app/(child)/garden/grow/actions.shared';

const baseState: GrowState = {
  cumulativeCorrect: 100,
  earnedSeeds: [
    { code: 'radish' } as any,
    { code: 'tulip' } as any,
  ] as any,
  openQuadrants: new Set(['vegetable'] as any),
  plots: [
    { plot: { code: 'veg-1', garden: 'vegetable', x: 0, y: 0 } },
    { plot: { code: 'veg-2', garden: 'vegetable', x: 0, y: 0 } },
    { plot: { code: 'flower-1', garden: 'flower', x: 0, y: 0 } },
  ] as any,
};

describe('validatePlantRequest', () => {
  it('accepts a valid plant in an empty plot of matching garden type', () => {
    const r = validatePlantRequest(baseState, 'veg-1', 'radish');
    expect(r.ok).toBe(true);
  });
  it('rejects when plot is occupied', () => {
    const occupied = { ...baseState, plots: [
      { plot: baseState.plots[0].plot, plant: { data: { code: 'radish' } } as any },
    ]};
    const r = validatePlantRequest(occupied as any, 'veg-1', 'radish');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/occupied/i);
  });
  it('rejects when seed not earned', () => {
    const r = validatePlantRequest(baseState, 'veg-1', 'cherry');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not earned/i);
  });
  it('rejects when plot does not exist', () => {
    const r = validatePlantRequest(baseState, 'veg-99', 'radish');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/no plot/i);
  });
  it('rejects flower seed in vegetable plot (garden mismatch)', () => {
    const r = validatePlantRequest(baseState, 'veg-1', 'tulip');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/wrong kind/i);
  });
  it('rejects when quadrant is locked', () => {
    // locked flower (not in openQuadrants)
    const r = validatePlantRequest(baseState, 'flower-1', 'tulip');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/quadrant/i);
  });
});
