// tests/world/birdCatalog.test.ts
import { describe, it, expect } from 'vitest';
import {
  BIRD_CATALOG, getBird, birdsOfCrew, crewCodes, sizeComparison,
  voicesOfKind, ANCHOR_INCHES, BILL_HINT,
} from '@/lib/world/birdCatalog';

describe('BIRD_CATALOG', () => {
  it('has no duplicate codes', () => {
    const codes = BIRD_CATALOG.map(b => b.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('has no duplicate common names — they are the quiz answers', () => {
    // Two birds sharing a display name would make a multiple-choice
    // question unanswerable.
    const names = BIRD_CATALOG.map(b => b.commonName);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every confusableWith reference resolves to a real bird', () => {
    for (const b of BIRD_CATALOG) {
      for (const code of b.confusableWith ?? []) {
        expect(getBird(code), `${b.code} → ${code}`).toBeDefined();
        expect(code).not.toBe(b.code);
      }
    }
  });

  it('confusion is mutual — if A looks like B, B looks like A', () => {
    // Asymmetric confusion means one direction gets easy distractors
    // and the other gets hard ones, for no reason.
    for (const b of BIRD_CATALOG) {
      for (const code of b.confusableWith ?? []) {
        const other = getBird(code)!;
        expect(
          other.confusableWith ?? [],
          `${code} does not list ${b.code} back`,
        ).toContain(b.code);
      }
    }
  });

  it('every bird has the teaching content the exercises need', () => {
    for (const b of BIRD_CATALOG) {
      expect(b.fieldMarks.length, b.code).toBeGreaterThan(0);
      expect(b.behavior.length, b.code).toBeGreaterThan(0);
      expect(b.habitat.length, b.code).toBeGreaterThan(0);
      expect(b.facts.length, b.code).toBeGreaterThan(0);
      expect(b.voices.length, b.code).toBeGreaterThan(0);
      expect(b.colourHook.length, b.code).toBeGreaterThan(20);
    }
  });

  it('has a plausible iNat taxon id for every bird', () => {
    for (const b of BIRD_CATALOG) {
      expect(Number.isInteger(b.inatTaxonId), b.code).toBe(true);
      expect(b.inatTaxonId, b.code).toBeGreaterThan(0);
    }
    expect(new Set(BIRD_CATALOG.map(b => b.inatTaxonId)).size)
      .toBe(BIRD_CATALOG.length);
  });

  it('xeno-canto queries use v3 tag syntax', () => {
    // v3 rejects tag-less queries outright, so a bare species name here
    // would fail at harvest time with a confusing error.
    for (const b of BIRD_CATALOG) {
      expect(b.xcQuery, b.code).toMatch(/^gen:[a-z]+ sp:[a-z]+$/);
      const [, gen, sp] = b.xcQuery.match(/^gen:(\S+) sp:(\S+)$/)!;
      const [sciGen, sciSp] = b.scientificName.toLowerCase().split(' ');
      expect(gen, b.code).toBe(sciGen);
      expect(sp, b.code).toBe(sciSp);
    }
  });

  it('a mnemonic is either a real phrase or honestly absent', () => {
    // Null is a deliberate signal that no phrase works (a crow just
    // caws), and the note carries the teaching instead. An empty string
    // would silently render as a blank hint.
    for (const b of BIRD_CATALOG) {
      for (const v of b.voices) {
        if (v.mnemonic !== null) expect(v.mnemonic.trim().length).toBeGreaterThan(0);
        expect(v.note.trim().length, `${b.code}/${v.kind}`).toBeGreaterThan(10);
      }
    }
  });

  it('sizeComparison agrees with the actual measurements', () => {
    for (const b of BIRD_CATALOG) {
      const anchor = ANCHOR_INCHES[b.sizeAnchor];
      const said = sizeComparison(b);
      if (b.lengthInches < anchor * 0.85) expect(said).toContain('smaller');
      else if (b.lengthInches > anchor * 1.15) expect(said).toContain('bigger');
      else expect(said).toContain('about the size');
      expect(said).toContain(b.sizeAnchor);
    }
  });

  it('the chickadee really is smaller than a sparrow', () => {
    // A spot-check that the ladder says something true, not just
    // something self-consistent.
    expect(sizeComparison(getBird('carolina_chickadee')!)).toBe('smaller than a sparrow');
    expect(sizeComparison(getBird('american_robin')!)).toBe('about the size of a robin');
  });

  it('every bill shape used has a hint written for it', () => {
    for (const b of BIRD_CATALOG) {
      expect(BILL_HINT[b.bill], b.code).toBeTruthy();
    }
  });

  it('groups into crews of five, in frequency order', () => {
    // Not pinned to a list: adding a crew should make this test CHECK
    // the new crew, not fail an equality and get the list edited.
    const crews = crewCodes();
    expect(crews.length).toBeGreaterThanOrEqual(2);
    expect(crews).toEqual(crews.slice().sort());   // crew1, crew2, crew3…
    for (const c of crews) expect(birdsOfCrew(c).length, c).toBe(5);
  });

  it('a crew is all one season — a winter crew must not hide a resident', () => {
    // Crew 3 exists to ARRIVE. If a year-round bird were mixed in, the
    // crew could not be season-gated honestly.
    for (const c of crewCodes()) {
      const seasons = new Set(birdsOfCrew(c).map(b => b.season));
      expect(seasons.size, `${c} mixes seasons: ${Array.from(seasons).join(', ')}`).toBe(1);
    }
  });

  it('crew 1 is all commonest-tier or the robin', () => {
    // The whole premise is frequency-first: nothing rare in the first
    // lesson. The robin has no feeder score because the Louisville
    // guide only covers feeder birds — it is not a rare bird.
    for (const b of birdsOfCrew('crew1')) {
      expect(b.localPoints === 20 || b.localPoints === null, b.code).toBe(true);
    }
  });

  it('the Kentucky state bird is in the very first crew', () => {
    const cardinal = getBird('northern_cardinal')!;
    expect(cardinal.crew).toBe('crew1');
    expect(cardinal.facts.join(' ')).toMatch(/Kentucky/);
  });

  it('the Carolina Wren is marked as singing all year', () => {
    // It is the anchor for the Listen stage precisely because it is
    // the one bird here that sings in February.
    const wren = getBird('carolina_wren')!;
    expect(wren.facts.join(' ')).toMatch(/all year/i);
    expect(wren.voices.some(v => v.mnemonic?.includes('teakettle'))).toBe(true);
  });

  it('does not teach the Black-capped Chickadee mnemonic', () => {
    // "Cheeseburger" belongs to a bird that does not live in
    // Louisville. Teaching it would train a wrong answer.
    const all = JSON.stringify(BIRD_CATALOG).toLowerCase();
    expect(all).not.toContain('cheeseburger');
  });

  it('dimorphic birds say so, and the obvious ones are flagged', () => {
    expect(getBird('northern_cardinal')!.dimorphic).toBe(true);
    expect(getBird('american_goldfinch')!.dimorphic).toBe(true);
    expect(getBird('house_finch')!.dimorphic).toBe(true);
    expect(getBird('blue_jay')!.dimorphic).toBe(false);
  });

  it('finds voices by kind for the audio harvester', () => {
    const songs = voicesOfKind('song');
    expect(songs.length).toBeGreaterThan(4);
    expect(songs.every(s => s.voice.kind === 'song')).toBe(true);
    expect(voicesOfKind('flight_call').map(v => v.bird.code))
      .toContain('american_goldfinch');
  });
});
