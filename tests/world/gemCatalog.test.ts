// tests/world/gemCatalog.test.ts
import { describe, it, expect } from 'vitest';
import {
  GEM_CATALOG, getGem, gemsOnShelf, scratchTestFor, byHardness,
  HARDNESS_TESTS, KENTUCKY_MIXUP,
} from '@/lib/world/gemCatalog';

describe('GEM_CATALOG', () => {
  it('has unique codes and names — they are the quiz answers', () => {
    expect(new Set(GEM_CATALOG.map(g => g.code)).size).toBe(GEM_CATALOG.length);
    expect(new Set(GEM_CATALOG.map(g => g.name)).size).toBe(GEM_CATALOG.length);
  });

  it('every gem carries the teaching content the lessons need', () => {
    for (const g of GEM_CATALOG) {
      expect(g.facts.length, g.code).toBeGreaterThanOrEqual(3);
      expect(g.colours.length, g.code).toBeGreaterThan(0);
      expect(g.formationStory.length, g.code).toBeGreaterThan(60);
      expect(g.whereFound.length, g.code).toBeGreaterThan(10);
      expect(g.crystalShape.length, g.code).toBeGreaterThan(3);
    }
  });

  it('hardness is a real Mohs number', () => {
    for (const g of GEM_CATALOG) {
      expect(g.mohs, g.code).toBeGreaterThanOrEqual(1);
      expect(g.mohs, g.code).toBeLessThanOrEqual(10);
    }
    // Anchors that must be true or the scratch tests lie.
    expect(getGem('diamond')!.mohs).toBe(10);
    expect(getGem('ruby')!.mohs).toBe(9);
    expect(getGem('quartz')!.mohs).toBe(7);
  });

  it('confusion is mutual, as it is for the birds', () => {
    for (const g of GEM_CATALOG) {
      for (const code of g.confusableWith ?? []) {
        const other = getGem(code);
        expect(other, `${g.code} → ${code}`).toBeDefined();
        expect(code).not.toBe(g.code);
      }
    }
  });

  it('the local shelf leads, and Kentucky is genuinely on it', () => {
    // The rule that made the birds work: the local thing first.
    const seam = gemsOnShelf('seam');
    expect(seam.length).toBeGreaterThanOrEqual(gemsOnShelf('case').length);
    expect(GEM_CATALOG[0].shelf).toBe('seam');
    const kentuckyMentions = seam.filter(g => /kentucky/i.test(g.whereFound));
    expect(kentuckyMentions.length).toBeGreaterThanOrEqual(6);
  });

  it('ruby is honest about not being a Kentucky stone', () => {
    // She asked for ruby and there are none here. Pretending otherwise
    // would break the rule the whole app is built on.
    const ruby = getGem('ruby')!;
    expect(ruby.shelf).toBe('case');
    expect(ruby.whereFound).not.toMatch(/kentucky/i);
    // …and it tells her where she COULD actually dig one up.
    expect(ruby.whereFound).toMatch(/North Carolina/);
  });

  it('teaches that ruby and sapphire are one mineral', () => {
    const ruby = getGem('ruby')!, sapphire = getGem('sapphire')!;
    expect(ruby.mohs).toBe(sapphire.mohs);
    expect(ruby.facts.join(' ')).toMatch(/same mineral/i);
    expect(sapphire.facts.join(' ')).toMatch(/not red/i);
    expect(ruby.confusableWith).toContain('sapphire');
  });

  it('records the state-symbol mix-up correctly', () => {
    // Coal is a ROCK and agate is a MINERAL — Kentucky had it backwards
    // from 1998 until 2024. Getting this wrong here would teach a child
    // the error the state spent 24 years making.
    expect(getGem(KENTUCKY_MIXUP.nowMineral)!.kind).toBe('mineral');
    expect(getGem(KENTUCKY_MIXUP.nowRock)!.kind).toBe('rock');
    expect(KENTUCKY_MIXUP.correctedIn).toBe(2024);
    expect(getGem('kentucky_agate')!.facts.join(' ')).toMatch(/state mineral/i);
  });

  it('the pearl is the odd one out, and says so', () => {
    const pearl = getGem('freshwater_pearl')!;
    expect(pearl.kind).toBe('organic');
    expect(pearl.formedBy).toBe('biological');
    expect(pearl.facts.join(' ')).toMatch(/not a mineral/i);
  });

  it('value keeps the right ORDER, which is all it is for', () => {
    const v = (c: string) => getGem(c)!.valuePerGram;
    expect(v('coal')).toBeLessThan(v('kentucky_agate'));
    expect(v('kentucky_agate')).toBeLessThan(v('ruby'));
    expect(v('ruby')).toBeLessThan(v('diamond'));
    for (const g of GEM_CATALOG) expect(g.valuePerGram, g.code).toBeGreaterThan(0);
  });
});

describe('hardness as something she can test', () => {
  it('names an everyday thing that will scratch a soft gem', () => {
    // Coal is 2.5; a copper coin (3.5) beats it.
    expect(scratchTestFor(getGem('coal')!)).toBe('a copper coin');
    expect(scratchTestFor(getGem('calcite')!)).toBe('a copper coin');
  });

  it('admits when nothing in a pocket will do it', () => {
    // That IS the lesson for a ruby: you cannot scratch it with
    // anything you own.
    expect(scratchTestFor(getGem('ruby')!)).toBeNull();
    expect(scratchTestFor(getGem('diamond')!)).toBeNull();
  });

  it('every scratch test is a thing a child actually has', () => {
    for (const t of HARDNESS_TESTS) {
      expect(t.thing.length).toBeGreaterThan(3);
      expect(t.mohs).toBeGreaterThan(0);
    }
  });

  it('byHardness walks softest to hardest', () => {
    const order = byHardness();
    for (let i = 1; i < order.length; i++) {
      expect(order[i].mohs).toBeGreaterThanOrEqual(order[i - 1].mohs);
    }
    expect(order[order.length - 1].code).toBe('diamond');
  });
});
