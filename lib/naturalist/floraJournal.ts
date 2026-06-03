// lib/naturalist/floraJournal.ts
//
// Pure merge helper for the Field Journal's "Trees & Flowers" section.
// Combines the static FLORA_CATALOG with the learner's discovered codes
// (+ exposure counts) and a hero-photo-URL map into a render-ready list,
// discovered species sorted first.

import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

export interface FloraJournalEntry {
  code: string;
  commonName: string;
  scientificName: string;
  emoji: string;
  discovered: boolean;
  identifiedCount: number;
  heroUrl: string | null;
}

export interface BuildFloraJournalInput {
  discovered: Map<string, number>;       // flora_code → exposures
  heroUrlByCode: Map<string, string>;    // flora_code → public hero photo URL
}

export function buildFloraJournal(input: BuildFloraJournalInput): FloraJournalEntry[] {
  const { discovered, heroUrlByCode } = input;

  const entries: FloraJournalEntry[] = FLORA_CATALOG.map(sp => ({
    code: sp.code,
    commonName: sp.commonName,
    scientificName: sp.scientificName,
    emoji: sp.emoji,
    discovered: discovered.has(sp.code),
    identifiedCount: discovered.get(sp.code) ?? 0,
    heroUrl: heroUrlByCode.get(sp.code) ?? null,
  }));

  // Stable sort: discovered first, otherwise preserve catalog order.
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      if (a.e.discovered !== b.e.discovered) return a.e.discovered ? -1 : 1;
      return a.i - b.i;
    })
    .map(x => x.e);
}
