// tests/world/plotLayout.test.ts
import { describe, it, expect } from 'vitest';
import { PLOTS, plotsForGarden, plotsForScreen, getPlot, GARDEN_SCREEN } from '@/lib/world/plotLayout';

describe('PLOTS', () => {
  it('contains exactly 45 plots', () => {
    expect(PLOTS).toHaveLength(45);
  });
  it('has the expected per-quadrant counts', () => {
    expect(plotsForGarden('vegetable')).toHaveLength(6);
    expect(plotsForGarden('fruit')).toHaveLength(5);
    expect(plotsForGarden('flower')).toHaveLength(8);
    expect(plotsForGarden('japanese')).toHaveLength(6);
    expect(plotsForGarden('orchard')).toHaveLength(5);
    expect(plotsForGarden('berry')).toHaveLength(5);
    expect(plotsForGarden('herb')).toHaveLength(5);
    expect(plotsForGarden('moon')).toHaveLength(5);
  });
  it('all plot codes are unique', () => {
    const codes = new Set(PLOTS.map(p => p.code));
    expect(codes.size).toBe(45);
  });
  it('splits cleanly across the two screens', () => {
    expect(plotsForScreen('home')).toHaveLength(25);
    expect(plotsForScreen('beyond')).toHaveLength(20);
    for (const p of plotsForScreen('beyond')) {
      expect(GARDEN_SCREEN[p.garden]).toBe('beyond');
    }
  });
  it('plot codes follow the convention <garden>-<n>', () => {
    for (const p of PLOTS) {
      const prefix = p.garden === 'vegetable' ? 'veg' : p.garden;
      expect(p.code).toMatch(new RegExp(`^${prefix}-[1-9]$`));
    }
  });
});

describe('getPlot', () => {
  it('returns the plot for a known code', () => {
    expect(getPlot('veg-1')?.garden).toBe('vegetable');
    expect(getPlot('flower-7')?.garden).toBe('flower');
    expect(getPlot('japanese-6')?.garden).toBe('japanese');
  });
  it('returns undefined for unknown', () => {
    expect(getPlot('nope-9')).toBeUndefined();
    expect(getPlot('veg-9')).toBeUndefined();   // out of range
  });
});
