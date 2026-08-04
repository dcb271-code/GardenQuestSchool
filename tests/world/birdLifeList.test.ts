// tests/world/birdLifeList.test.ts
import { describe, it, expect } from 'vitest';
import {
  recordSighting, lifeListRows, lifeListCount, rarityLabel, friendlyDate, sightingFact,
  type LifeList,
} from '@/lib/birds/lifeList';
import { BIRD_CATALOG, getBird } from '@/lib/world/birdCatalog';

describe('recordSighting', () => {
  it('a first sighting starts an entry and reports itself as first', () => {
    const { list, isFirst } = recordSighting({}, 'northern_cardinal', '2026-08-02');
    expect(isFirst).toBe(true);
    expect(list.northern_cardinal).toEqual({
      firstSeen: '2026-08-02', lastSeen: '2026-08-02', count: 1, note: undefined,
    });
  });

  it('seeing the same bird again is NOT a first — one gem per species, ever', () => {
    // The whole anti-farm rule: tapping the same cardinal all afternoon
    // builds the record but mints nothing.
    const one = recordSighting({}, 'northern_cardinal', '2026-08-02').list;
    const { list, isFirst } = recordSighting(one, 'northern_cardinal', '2026-08-05');
    expect(isFirst).toBe(false);
    expect(list.northern_cardinal.count).toBe(2);
    expect(list.northern_cardinal.firstSeen).toBe('2026-08-02');
    expect(list.northern_cardinal.lastSeen).toBe('2026-08-05');
  });

  it('keeps her note, and never wipes it with an empty one', () => {
    const withNote = recordSighting({}, 'blue_jay', '2026-08-02', 'it screamed at the cat').list;
    expect(withNote.blue_jay.note).toBe('it screamed at the cat');
    const later = recordSighting(withNote, 'blue_jay', '2026-08-03', '   ').list;
    expect(later.blue_jay.note).toBe('it screamed at the cat');
    const replaced = recordSighting(later, 'blue_jay', '2026-08-04', 'two of them').list;
    expect(replaced.blue_jay.note).toBe('two of them');
  });

  it('does not mutate the list it was given', () => {
    const before: LifeList = {};
    recordSighting(before, 'american_robin', '2026-08-02');
    expect(before).toEqual({});
  });
});

describe('lifeListRows', () => {
  it('puts seen birds above unseen ones', () => {
    const list = recordSighting({}, 'northern_cardinal', '2026-08-02').list;
    const rows = lifeListRows(list);
    expect(rows[0].bird.code).toBe('northern_cardinal');
    expect(rows.slice(1).every(r => !r.entry)).toBe(true);
  });

  it('sorts the seen ones RAREST first, so a good find feels like one', () => {
    // localPoints is the Louisville feeder guide's own frequency score:
    // 20 = commonest at feeders, 100 = rarest.
    let list: LifeList = {};
    list = recordSighting(list, 'northern_cardinal', '2026-08-02').list;
    list = recordSighting(list, 'american_goldfinch', '2026-08-02').list;
    const seen = lifeListRows(list).filter(r => r.entry).map(r => r.bird.code);
    // Both score 20, so they tie and fall back to alphabetical — the
    // point is that neither is claimed to be rarer than it is.
    expect(seen).toEqual(['american_goldfinch', 'northern_cardinal']);
  });

  it('an unscored bird is not treated as rare — the robin is everywhere', () => {
    // localPoints is null for the robin because the guide scores FEEDER
    // birds and robins eat worms, not seed. Reading null as 100 put
    // "a rare one" under a robin, which teaches a child something
    // false about the commonest bird on the lawn.
    let list: LifeList = {};
    list = recordSighting(list, 'american_robin', '2026-08-02').list;
    list = recordSighting(list, 'northern_cardinal', '2026-08-02').list;
    const seen = lifeListRows(list).filter(r => r.entry).map(r => r.bird.code);
    expect(seen[0]).toBe('american_robin');   // 40 vs 20 — common, not rare
    expect(rarityLabel(getBird('american_robin')!)).not.toMatch(/rare/);
  });

  it('lists every bird in the catalog, seen or not', () => {
    expect(lifeListRows({})).toHaveLength(BIRD_CATALOG.length);
  });
});

describe('lifeListCount', () => {
  it('counts species, not sightings', () => {
    let list: LifeList = {};
    list = recordSighting(list, 'blue_jay', '2026-08-02').list;
    list = recordSighting(list, 'blue_jay', '2026-08-03').list;
    expect(lifeListCount(list)).toBe(1);
  });

  it('ignores a code that is no longer in the catalog', () => {
    // Stored progress outlives content. A bird removed from the
    // catalog must not inflate her count or crash the screen.
    expect(lifeListCount({ pterodactyl: { firstSeen: 'x', count: 1 } })).toBe(0);
  });
});

describe('rarityLabel', () => {
  it('is gentle about the everyday birds and honest about rare ones', () => {
    expect(rarityLabel(getBird('northern_cardinal')!)).toBe('one you will see often');
    // No feeder score → say why, rather than guessing at rarity.
    expect(rarityLabel(getBird('american_robin')!))
      .toBe('look on the lawn, not at the feeder');
  });

  it('friendlyDate reads like a date a child would say', () => {
    expect(friendlyDate('2026-08-02')).toBe('2 Aug');
    expect(friendlyDate('2026-12-25')).toBe('25 Dec');
    // Never crashes on something unexpected in stored progress.
    expect(friendlyDate('who knows')).toBe('who knows');
  });

  it('gives every catalogued bird a label', () => {
    for (const b of BIRD_CATALOG) {
      expect(rarityLabel(b).length, b.code).toBeGreaterThan(3);
    }
  });
});

describe('sightingFact', () => {
  it('never hands back the fact the lesson already taught', () => {
    // The teach pages lead with facts[0]. Seeing a real bird should
    // reward her with something she does not already know.
    for (const b of BIRD_CATALOG) {
      if (b.facts.length < 2) continue;
      expect(sightingFact(b, 1), b.code).not.toBe(b.facts[0]);
    }
  });

  it('gives a different fact on a repeat sighting, then wraps', () => {
    const cardinal = getBird('northern_cardinal')!;   // 3 facts
    const first = sightingFact(cardinal, 1);
    const second = sightingFact(cardinal, 2);
    expect(second).not.toBe(first);
    // Wraps back round rather than running out.
    expect(sightingFact(cardinal, 3)).toBe(first);
  });

  it('always returns something, whatever the count', () => {
    for (const b of BIRD_CATALOG) {
      for (const n of [1, 2, 5, 40]) {
        expect(sightingFact(b, n).length, `${b.code}/${n}`).toBeGreaterThan(10);
      }
    }
  });
});
