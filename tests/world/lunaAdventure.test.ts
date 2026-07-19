import { describe, it, expect } from 'vitest';
import { LUNA_EPISODES, getEpisode, defaultAdventureState } from '@/lib/world/lunaAdventure';

describe('lunaAdventure — episode content', () => {
  it('episodes are numbered sequentially from 1 and resolvable', () => {
    LUNA_EPISODES.forEach((e, i) => {
      expect(e.episode).toBe(i + 1);
      expect(getEpisode(e.episode)).toBe(e);
    });
    expect(defaultAdventureState().episode).toBe(1);
  });

  it('every episode has unique scene ids and ends on narration', () => {
    for (const e of LUNA_EPISODES) {
      const ids = e.scenes.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(e.scenes[e.scenes.length - 1].kind).toBe('narration');
      expect(e.scenes.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('gates target a real subject and carry invite + after text', () => {
    for (const e of LUNA_EPISODES) {
      const gates = e.scenes.filter(s => s.kind === 'gate');
      expect(gates.length).toBeGreaterThanOrEqual(1);
      for (const g of gates) {
        if (g.kind !== 'gate') continue;
        expect(['math', 'reading']).toContain(g.focusSubject);
        expect(g.inviteText.length).toBeGreaterThan(20);
        expect(g.afterText.length).toBeGreaterThan(20);
      }
    }
  });

  it('choices have 2-3 options with response text', () => {
    for (const e of LUNA_EPISODES) {
      for (const s of e.scenes) {
        if (s.kind !== 'choice') continue;
        expect(s.options.length).toBeGreaterThanOrEqual(2);
        expect(s.options.length).toBeLessThanOrEqual(3);
        for (const o of s.options) expect(o.responseText.length).toBeGreaterThan(20);
      }
    }
  });
});
