import { describe, it, expect } from 'vitest';
import { updateElo, chooseDifficultyBand } from '@/lib/engine/adaptiveDifficulty';

describe('adaptiveDifficulty — Elo', () => {
  it('correct on easier item: small drift up for student, small drift down for item', () => {
    const r = updateElo({ itemRating: 900, studentRating: 1000, correct: true });
    expect(r.newStudentRating).toBeGreaterThan(1000);
    expect(r.newItemRating).toBeLessThan(900);
    expect(Math.round(r.newStudentRating)).toBe(1012);
    expect(Math.round(r.newItemRating)).toBe(888);
  });

  it('incorrect on harder item: small drift down for student, small drift up for item', () => {
    const r = updateElo({ itemRating: 1100, studentRating: 1000, correct: false });
    expect(r.newStudentRating).toBeLessThan(1000);
    expect(r.newItemRating).toBeGreaterThan(1100);
  });

  it('chooseDifficultyBand centers on student with ±150 band', () => {
    const b = chooseDifficultyBand(1000);
    expect(b).toEqual({ min: 850, max: 1150, stretchMax: 1200 });
  });
});
