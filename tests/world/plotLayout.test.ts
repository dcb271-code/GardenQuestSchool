// tests/world/plotLayout.test.ts
import { describe, it, expect } from 'vitest';
import { PLOTS, plotsForGarden, getPlot } from '@/lib/world/plotLayout';

describe('PLOTS', () => {
  it('contains exactly 16 plots', () => {
    expect(PLOTS).toHaveLength(16);
  });
  it('has 4 plots per quadrant', () => {
    for (const garden of ['vegetable', 'flower', 'fruit', 'japanese'] as const) {
      expect(plotsForGarden(garden)).toHaveLength(4);
    }
  });
  it('all plot codes are unique', () => {
    const codes = new Set(PLOTS.map(p => p.code));
    expect(codes.size).toBe(16);
  });
  it('plot codes follow the convention <garden>-<n>', () => {
    for (const p of PLOTS) {
      expect(p.code).toMatch(new RegExp(`^${p.garden === 'vegetable' ? 'veg' : p.garden}-[1-4]$`));
    }
  });
});

describe('getPlot', () => {
  it('returns the plot for a known code', () => {
    expect(getPlot('veg-1')?.garden).toBe('vegetable');
  });
  it('returns undefined for unknown', () => {
    expect(getPlot('nope-9')).toBeUndefined();
  });
});
