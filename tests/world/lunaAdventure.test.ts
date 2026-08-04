import { describe, it, expect } from 'vitest';
import { LUNA_EPISODES, getEpisode, defaultAdventureState } from '@/lib/world/lunaAdventure';
import { getSpeciesByCode } from '@/lib/world/speciesCatalog';

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

describe('lunaAdventure — cross-episode integrity', () => {
  it('scene ids are unique ACROSS episodes, not just within one', () => {
    // gatesPassed is a flat string[] and choices is a flat
    // Record<sceneId, optionId> — both keyed by scene id alone. A gate
    // id reused in a later episode would arrive already passed, and
    // the child would be skipped straight past a practice session.
    const all = LUNA_EPISODES.flatMap(e => e.scenes.map(s => s.id));
    const dupes = all.filter((id, i) => all.indexOf(id) !== i);
    expect(dupes, `reused scene ids: ${dupes.join(', ')}`).toEqual([]);
  });

  it('each episode names itself in its scene ids, so a stray id is obvious', () => {
    for (const e of LUNA_EPISODES) {
      for (const s of e.scenes) {
        expect(s.id.startsWith(`ep${e.episode}_`), `${s.id} is not in episode ${e.episode}`).toBe(true);
      }
    }
  });

  it('every species artwork points at a real species', () => {
    // The art router returns null for an unknown code, which would
    // leave a scene with a blank space where the creature should be.
    for (const e of LUNA_EPISODES) {
      for (const s of e.scenes) {
        if (s.art.type !== 'species') continue;
        expect(getSpeciesByCode(s.art.code), `${s.id} → unknown species ${s.art.code}`).toBeDefined();
      }
    }
  });

  it('an episode asks for both subjects, so the story cannot become one-sided practice', () => {
    for (const e of LUNA_EPISODES) {
      const subjects = new Set(
        e.scenes.flatMap(s => (s.kind === 'gate' ? [s.focusSubject] : [])),
      );
      expect(Array.from(subjects).sort(), `episode ${e.episode}`).toEqual(['math', 'reading']);
    }
  });

  it('episode 2 keeps faith with what the field journal says about luna moths', () => {
    // The episode teaches that the moth has no mouth and lives about a
    // week — straight from SPECIES_CATALOG — and then hinges its
    // ending on turning lights off. If the catalog fact ever changes,
    // the story becomes a lie told to a child, so pin them together.
    const moth = getSpeciesByCode('luna_moth')!;
    expect(moth.funFact).toMatch(/no mouth/i);
    expect(moth.funFact).toMatch(/porch light/i);

    const ep2 = getEpisode(2)!;
    const text = ep2.scenes.map(s =>
      s.kind === 'narration' ? s.text : s.kind === 'gate' ? `${s.inviteText} ${s.afterText}` : s.prompt,
    ).join(' ');
    expect(text).toMatch(/NO MOUTH/);
    // And it must never show the moth feeding, which is the obvious
    // warm ending and would contradict the fact it just taught.
    expect(text).not.toMatch(/\b(drinks|sips|feeds|nectar)\b/i);
  });
});
