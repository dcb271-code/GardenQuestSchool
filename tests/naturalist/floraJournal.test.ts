import { describe, it, expect } from 'vitest';
import { buildFloraJournal, type FloraJournalEntry } from '@/lib/naturalist/floraJournal';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

describe('buildFloraJournal', () => {
  it('returns one entry per catalog species', () => {
    const out = buildFloraJournal({ discovered: new Map(), heroUrlByCode: new Map() });
    expect(out).toHaveLength(FLORA_CATALOG.length);
  });

  it('marks discovered species and carries exposures + hero url', () => {
    const discovered = new Map([['trillium', 4]]);
    const heroUrlByCode = new Map([['trillium', 'https://x/trillium.jpg']]);
    const out = buildFloraJournal({ discovered, heroUrlByCode });
    const t = out.find(e => e.code === 'trillium')!;
    expect(t.discovered).toBe(true);
    expect(t.identifiedCount).toBe(4);
    expect(t.heroUrl).toBe('https://x/trillium.jpg');
  });

  it('marks undiscovered species with discovered=false, count 0, null hero', () => {
    const out = buildFloraJournal({ discovered: new Map(), heroUrlByCode: new Map() });
    const any = out[0];
    expect(any.discovered).toBe(false);
    expect(any.identifiedCount).toBe(0);
    expect(any.heroUrl).toBeNull();
  });

  it('sorts discovered species before undiscovered', () => {
    // Discover the LAST catalog species; it should jump to the front.
    const lastCode = FLORA_CATALOG[FLORA_CATALOG.length - 1].code;
    const discovered = new Map([[lastCode, 1]]);
    const out = buildFloraJournal({ discovered, heroUrlByCode: new Map() });
    expect(out[0].code).toBe(lastCode);
    expect(out[0].discovered).toBe(true);
    // everything after the first should be undiscovered
    for (let i = 1; i < out.length; i++) expect(out[i].discovered).toBe(false);
  });

  it('carries commonName, scientificName, emoji from the catalog', () => {
    const out = buildFloraJournal({ discovered: new Map(), heroUrlByCode: new Map() });
    for (const e of out) {
      const sp = FLORA_CATALOG.find(f => f.code === e.code)!;
      expect(e.commonName).toBe(sp.commonName);
      expect(e.scientificName).toBe(sp.scientificName);
      expect(e.emoji).toBe(sp.emoji);
    }
  });

  it('counts discovered correctly', () => {
    const discovered = new Map([
      [FLORA_CATALOG[0].code, 2],
      [FLORA_CATALOG[1].code, 7],
    ]);
    const out = buildFloraJournal({ discovered, heroUrlByCode: new Map() });
    expect(out.filter(e => e.discovered)).toHaveLength(2);
  });
});
