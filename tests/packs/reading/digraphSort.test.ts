// tests/packs/reading/digraphSort.test.ts
import { describe, it, expect } from 'vitest';
import { isListeningSort, poolOrder } from '@/lib/packs/reading/digraphSort';

const W = (word: string, digraph: string, emoji = '🙂') => ({ word, digraph, emoji });

describe('which sorts are done by ear', () => {
  it('ch/sh/th with pictures: listen, the word hidden', () => {
    expect(isListeningSort({
      digraphs: ['ch', 'sh', 'th'],
      words: [W('chip', 'ch'), W('ship', 'sh'), W('thin', 'th')],
    })).toBe(true);
  });

  it('vowel teams sound the same, so they keep the word', () => {
    // "feet" and "meat" cannot be told apart by ear.
    for (const digraphs of [['ee', 'ea'], ['ai', 'ay'], ['oa', 'ow']]) {
      expect(isListeningSort({
        digraphs, words: [W('a', digraphs[0]), W('b', digraphs[1])],
      })).toBe(false);
    }
  });

  it('a word with no picture keeps the word (nothing else to show)', () => {
    expect(isListeningSort({
      digraphs: ['ch', 'sh'],
      words: [W('chip', 'ch'), { word: 'ship', digraph: 'sh' }],
    })).toBe(false);
  });

  it('prefix sorts keep the word', () => {
    expect(isListeningSort({
      digraphs: ['dis', 'mis', 'non'],
      words: [{ word: 'dislike', digraph: 'dis' }],
    })).toBe(false);
  });
});

describe('the pool order', () => {
  const rounds = [
    [W('chip', 'ch'), W('ship', 'sh'), W('thin', 'th')],
    [W('chin', 'ch'), W('fish', 'sh'), W('thumb', 'th')],
    [W('chick', 'ch'), W('shoe', 'sh'), W('three', 'th')],
    [W('cheese', 'ch'), W('shell', 'sh'), W('thick', 'th')],
    [W('cherry', 'ch'), W('shark', 'sh'), W('think', 'th')],
    [W('chair', 'ch'), W('sheep', 'sh'), W('thorn', 'th')],
    [W('chain', 'ch'), W('shop', 'sh'), W('thirty', 'th')],
  ];

  it('is never the bucket order — that order was the answer', () => {
    for (const r of rounds) {
      expect(poolOrder(r, ['ch', 'sh', 'th']).map(w => w.digraph)).not.toEqual(['ch', 'sh', 'th']);
    }
    expect(poolOrder([W('feet', 'ee'), W('meat', 'ea')], ['ee', 'ea']).map(w => w.word))
      .toEqual(['meat', 'feet']);
  });

  it('keeps every word, and is stable so server and client agree', () => {
    for (const r of rounds) {
      const a = poolOrder(r, ['ch', 'sh', 'th']);
      expect([...a].sort((x, y) => x.word.localeCompare(y.word)))
        .toEqual([...r].sort((x, y) => x.word.localeCompare(y.word)));
      expect(poolOrder(r, ['ch', 'sh', 'th'])).toEqual(a);
    }
  });

  it('does not always put the same bucket first', () => {
    const firsts = new Set(rounds.map(r => poolOrder(r, ['ch', 'sh', 'th'])[0].digraph));
    expect(firsts.size).toBeGreaterThan(1);
  });
});
