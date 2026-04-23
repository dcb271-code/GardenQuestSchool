import { describe, it, expect } from 'vitest';
import { getItemHandler, scoreAnyItem, getPromptText } from '@/lib/packs';
import type { Item } from '@/lib/types';

const mkItem = (type: string, content: any, answer: any): Item => ({
  id: 'i', skillId: 's', type, content, answer,
  difficultyElo: 1000, generatedBy: 'seed', approvedAt: new Date(),
});

describe('packs registry', () => {
  it('returns Math handlers for Math item types', () => {
    expect(getItemHandler('NumberBonds')).toBeDefined();
    expect(getItemHandler('CountingTiles')).toBeDefined();
    expect(getItemHandler('EquationTap')).toBeDefined();
  });

  it('returns undefined for unknown types', () => {
    expect(getItemHandler('MysteryType')).toBeUndefined();
  });

  it('scoreAnyItem dispatches to the right pack', () => {
    const item = mkItem(
      'NumberBonds',
      { type: 'NumberBonds', whole: 10, knownPart: 7, promptText: '7 and what make 10?' },
      { missing: 3 }
    );
    expect(scoreAnyItem(item, { missing: 3 })).toEqual({ outcome: 'correct' });
    expect(scoreAnyItem(item, { missing: 4 })).toEqual({ outcome: 'incorrect' });
  });

  it('getPromptText falls back to item.content.promptText for unregistered types', () => {
    const item = mkItem('MysteryType', { promptText: 'fallback text' }, {});
    expect(getPromptText(item)).toBe('fallback text');
  });

  it('scoreAnyItem throws for unregistered type', () => {
    const item = mkItem('MysteryType', {}, {});
    expect(() => scoreAnyItem(item, {})).toThrow(/No handler registered/);
  });

  it('returns Reading handlers for Reading item types', () => {
    expect(getItemHandler('SightWordTap')).toBeDefined();
    expect(getItemHandler('PhonemeBlend')).toBeDefined();
    expect(getItemHandler('DigraphSort')).toBeDefined();
    expect(getItemHandler('ReadAloudSimple')).toBeDefined();
  });

  it('scoreAnyItem dispatches to Reading pack', () => {
    const item = mkItem(
      'SightWordTap',
      { type: 'SightWordTap', word: 'the', distractors: ['she'], promptText: '' },
      { word: 'the' }
    );
    expect(scoreAnyItem(item, { chosen: 'the' })).toEqual({ outcome: 'correct' });
    expect(scoreAnyItem(item, { chosen: 'she' })).toEqual({ outcome: 'incorrect' });
  });
});
