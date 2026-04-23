import { describe, it, expect } from 'vitest';
import { isValidCell, cellsEqual, allCells, adjacentCells, GRID_COLS, GRID_ROWS } from '@/lib/world/gardenLayout';

describe('gardenLayout', () => {
  it('isValidCell accepts in-bounds integer coords', () => {
    expect(isValidCell({ x: 0, y: 0 })).toBe(true);
    expect(isValidCell({ x: GRID_COLS - 1, y: GRID_ROWS - 1 })).toBe(true);
  });

  it('isValidCell rejects out-of-bounds', () => {
    expect(isValidCell({ x: -1, y: 0 })).toBe(false);
    expect(isValidCell({ x: GRID_COLS, y: 0 })).toBe(false);
    expect(isValidCell({ x: 0, y: GRID_ROWS })).toBe(false);
  });

  it('isValidCell rejects non-integers', () => {
    expect(isValidCell({ x: 0.5, y: 0 })).toBe(false);
  });

  it('cellsEqual compares coords', () => {
    expect(cellsEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    expect(cellsEqual({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false);
  });

  it('allCells enumerates every grid cell', () => {
    expect(allCells().length).toBe(GRID_COLS * GRID_ROWS);
  });

  it('adjacentCells returns in-bound neighbors', () => {
    const adj = adjacentCells({ x: 0, y: 0 });
    expect(adj.length).toBe(2); // corner
    const adjCenter = adjacentCells({ x: 2, y: 2 });
    expect(adjCenter.length).toBe(4);
  });
});
