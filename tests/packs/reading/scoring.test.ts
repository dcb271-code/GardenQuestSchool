import { describe, it, expect } from 'vitest';
import {
  scoreSightWordTap, scorePhonemeBlend, scoreDigraphSort, scoreReadAloudSimple,
} from '@/lib/packs/reading/scoring';
import type { Item } from '@/lib/types';

const mk = (type: string, content: any, answer: any): Item => ({
  id: 'i', skillId: 's', type, content, answer,
  difficultyElo: 1000, generatedBy: 'seed', approvedAt: new Date(),
});

describe('reading scoring', () => {
  describe('SightWordTap', () => {
    const item = mk('SightWordTap',
      { type: 'SightWordTap', word: 'the', distractors: ['she', 'them'], promptText: "Which word says 'the'?" },
      { word: 'the' });
    it('correct', () => expect(scoreSightWordTap(item, { chosen: 'the' })).toEqual({ outcome: 'correct' }));
    it('incorrect', () => expect(scoreSightWordTap(item, { chosen: 'she' })).toEqual({ outcome: 'incorrect' }));
  });

  describe('PhonemeBlend', () => {
    const item = mk('PhonemeBlend',
      { type: 'PhonemeBlend', phonemes: ['c', 'a', 't'], word: 'cat', distractors: ['bat', 'cut'], promptText: 'Blend the sounds.' },
      { word: 'cat' });
    it('correct', () => expect(scorePhonemeBlend(item, { chosen: 'cat' })).toEqual({ outcome: 'correct' }));
    it('incorrect', () => expect(scorePhonemeBlend(item, { chosen: 'bat' })).toEqual({ outcome: 'incorrect' }));
  });

  describe('DigraphSort', () => {
    const item = mk('DigraphSort',
      {
        type: 'DigraphSort',
        digraphs: ['ch', 'sh', 'th'],
        words: [{ word: 'chip', digraph: 'ch' }, { word: 'ship', digraph: 'sh' }, { word: 'thin', digraph: 'th' }],
        promptText: 'Drop each word into its bucket.',
      },
      { placements: { chip: 'ch', ship: 'sh', thin: 'th' } });
    it('all correct', () => expect(scoreDigraphSort(item, { placements: { chip: 'ch', ship: 'sh', thin: 'th' } })).toEqual({ outcome: 'correct' }));
    it('any wrong is incorrect', () => expect(scoreDigraphSort(item, { placements: { chip: 'ch', ship: 'th', thin: 'sh' } })).toEqual({ outcome: 'incorrect' }));
    it('empty is incorrect', () => expect(scoreDigraphSort(item, {})).toEqual({ outcome: 'incorrect' }));
  });

  describe('ReadAloudSimple', () => {
    const item = mk('ReadAloudSimple',
      { type: 'ReadAloudSimple', word: 'fish', promptText: 'Say it out loud.' },
      {});
    it('claimed -> correct', () => expect(scoreReadAloudSimple(item, { claimed: true })).toEqual({ outcome: 'correct' }));
    it('not claimed -> incorrect', () => expect(scoreReadAloudSimple(item, { claimed: false })).toEqual({ outcome: 'incorrect' }));
  });
});
