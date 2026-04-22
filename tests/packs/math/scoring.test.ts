import { describe, it, expect } from 'vitest';
import { scoreMathResponse } from '@/lib/packs/math/scoring';
import type { Item } from '@/lib/types';

const mkItem = (type: string, content: any, answer: any): Item => ({
  id: 'i', skillId: 's', type, content, answer,
  difficultyElo: 1000, generatedBy: 'seed', approvedAt: new Date(),
});

describe('math scoring', () => {
  describe('NumberBonds', () => {
    const item = mkItem('NumberBonds',
      { type: 'NumberBonds', whole: 10, knownPart: 7, promptText: '7 and what make 10?' },
      { missing: 3 });

    it('correct', () => {
      expect(scoreMathResponse(item, { missing: 3 })).toEqual({ outcome: 'correct' });
    });
    it('incorrect', () => {
      expect(scoreMathResponse(item, { missing: 4 })).toEqual({ outcome: 'incorrect' });
    });
  });

  describe('CountingTiles', () => {
    const item = mkItem('CountingTiles',
      { type: 'CountingTiles', emoji: '🐜', count: 5, promptText: 'How many ants?' },
      { count: 5 });

    it('correct', () => {
      expect(scoreMathResponse(item, { count: 5 })).toEqual({ outcome: 'correct' });
    });
    it('incorrect', () => {
      expect(scoreMathResponse(item, { count: 4 })).toEqual({ outcome: 'incorrect' });
    });
  });

  describe('EquationTap', () => {
    const item = mkItem('EquationTap',
      { type: 'EquationTap', equation: '3 + 5 = ?', choices: [6, 7, 8, 9], promptText: '3 plus 5 is?' },
      { correct: 8 });

    it('correct', () => {
      expect(scoreMathResponse(item, { chosen: 8 })).toEqual({ outcome: 'correct' });
    });
    it('incorrect', () => {
      expect(scoreMathResponse(item, { chosen: 7 })).toEqual({ outcome: 'incorrect' });
    });
  });
});
