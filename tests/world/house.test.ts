import { describe, it, expect } from 'vitest';
import {
  emptyHouse, setMantelStone, setMantelBird, storybookPages, coatColorsFor,
} from '@/lib/world/house';
import { LUNA_EPISODES } from '@/lib/world/lunaAdventure';

describe('the mantel displays what she owns, never what a client names', () => {
  it('puts a kept stone up, and refuses one she does not have', () => {
    const kept = { kentucky_agate: 1 };
    expect(setMantelStone(emptyHouse(), kept, 'kentucky_agate')?.mantelStone)
      .toBe('kentucky_agate');
    expect(setMantelStone(emptyHouse(), kept, 'diamond')).toBeNull();
    expect(setMantelStone(emptyHouse(), { diamond: 0 }, 'diamond')).toBeNull();
  });

  it('puts a life-list bird up, and refuses one she has never seen', () => {
    const lifeList = { northern_cardinal: { firstSeen: '2026-08-01', count: 3 } };
    expect(setMantelBird(emptyHouse(), lifeList, 'northern_cardinal')?.mantelBird)
      .toBe('northern_cardinal');
    expect(setMantelBird(emptyHouse(), lifeList, 'blue_jay')).toBeNull();
  });

  it('takes a piece down without touching the other slot', () => {
    const house = { mantelStone: 'quartz', mantelBird: 'blue_jay' };
    const down = setMantelStone(house, {}, null);
    expect(down?.mantelStone).toBeUndefined();
    expect(down?.mantelBird).toBe('blue_jay');
  });
});

describe('a finished chapter becomes a book that remembers her path', () => {
  const episode = LUNA_EPISODES[0];

  it('turns every scene into pages, with her choice printed as what happened', () => {
    const choice = episode.scenes.find(s => s.kind === 'choice');
    expect(choice).toBeDefined();
    if (choice?.kind !== 'choice') return;
    const picked = choice.options[1];

    const pages = storybookPages(episode, { [choice.id]: picked.id });
    expect(pages.length).toBeGreaterThan(episode.scenes.length);
    expect(pages.some(p => p.text === picked.responseText)).toBe(true);
    // The road not taken is not in her book.
    expect(pages.some(p => p.text === choice.options[0].responseText)).toBe(false);
  });

  it('falls back to the first option rather than tearing out a page', () => {
    const pages = storybookPages(episode, {});
    const choice = episode.scenes.find(s => s.kind === 'choice');
    if (choice?.kind !== 'choice') return;
    expect(pages.some(p => p.text === choice.options[0].responseText)).toBe(true);
  });

  it('a gate re-reads as story, not as work: invite then after, no session', () => {
    const gate = episode.scenes.find(s => s.kind === 'gate');
    if (gate?.kind !== 'gate') return;
    const pages = storybookPages(episode, {});
    const inviteIdx = pages.findIndex(p => p.text === gate.inviteText);
    expect(inviteIdx).toBeGreaterThanOrEqual(0);
    expect(pages[inviteIdx + 1]?.text).toBe(gate.afterText);
  });

  it('every episode in the catalog can be bound into a readable book', () => {
    for (const ep of LUNA_EPISODES) {
      const pages = storybookPages(ep, {});
      expect(pages.length).toBeGreaterThan(0);
      for (const p of pages) {
        expect(p.text.length).toBeGreaterThan(0);
        expect(p.art).toBeDefined();
      }
    }
  });
});

describe('coat hooks', () => {
  it('gives every child a distinct color, stably', () => {
    const names = ['Cecily', 'Esme', 'Otto'];
    const a = coatColorsFor(names);
    const b = coatColorsFor([...names].reverse());
    expect(a).toEqual(b);
    expect(new Set(Object.values(a)).size).toBe(3);
  });
});
