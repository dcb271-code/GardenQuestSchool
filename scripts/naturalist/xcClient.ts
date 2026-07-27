// scripts/naturalist/xcClient.ts
//
// Thin wrapper around the xeno-canto v3 API for the bird-audio
// harvest pipeline. Pure functions only — no I/O lives here; the
// caller (`scripts/seed-bird-audio.ts`) does fetch + file writes.
//
// Everything in here was verified against the LIVE v3 API on
// 2026-07-26 (see the birds handoff §4), because the traps don't look
// like traps:
//
//   * api/2 is dead. Every blog post and code sample online uses it.
//   * A key is required. The documented `key=demo` only answers the
//     documented example queries — it looks like a dev key and isn't.
//   * Multi-word tag values must be quoted: type:"flight call".
//   * `length` is an "m:ss" STRING, not seconds.
//   * `lic` is a full versioned URL (…/by-nc-sa/4.0/), often
//     protocol-relative. Store it VERBATIM — 4.0, 3.0 and 2.5 sit side
//     by side in one result page and have different attribution rules.
//   * `file` serves the ORIGINAL upload — one verified download was a
//     26.8 MB 24-bit WAV.

import type { VoiceKind } from '../../lib/world/birdCatalog';

export interface XcRecording {
  id: string;                 // '1154497' — bare, no XC prefix
  genus: string;
  species: string;
  englishName: string;
  recordist: string;
  country: string;
  locality: string;
  /** 'A'..'E', or 'no score'. The query filters to >C already. */
  quality: string;
  /** Raw type string, e.g. 'song', 'call', 'flight call'. */
  type: string;
  lengthSec: number;
  /** VERBATIM licence URL, protocol-relative left as-is. */
  licenseUrl: string;
  /** Original upload — can be a large WAV. */
  fileUrl: string;
  /** The upload's file name; CC 3.0/2.5 attribution requires the title. */
  fileName: string;
  /** Species audible in the background. Empty is what we want. */
  also: string[];
  date: string;               // 'YYYY-MM-DD', sometimes zero-padded junk
  url: string;                // page on xeno-canto.org
}

/**
 * Catalog voice kind → the xeno-canto `type` tag value.
 * 'flight call' has a space and MUST be quoted in the query.
 */
export const XC_TYPE: Record<VoiceKind, string> = {
  song: 'song',
  call: 'call',
  drum: 'drumming',
  flight_call: 'flight call',
};

/** Quote a tag value iff it needs it — v3 silently errors on bare spaces. */
function tagValue(v: string): string {
  return v.includes(' ') ? `"${v}"` : v;
}

/**
 * The full query for one bird + voice kind, matching the filter the
 * coverage probe validated: quality above C, share-alike licence
 * (never ND — see licence notes below), recorded in the US.
 */
export function buildXcQuery(xcQuery: string, kind: VoiceKind): string {
  return `${xcQuery} type:${tagValue(XC_TYPE[kind])} q:">C" lic:BY-NC-SA cnt:"United States"`;
}

export function buildXcUrl(query: string, key: string, page = 1): string {
  const u = new URL('https://xeno-canto.org/api/3/recordings');
  u.searchParams.set('query', query);
  u.searchParams.set('key', key);
  if (page > 1) u.searchParams.set('page', String(page));
  return u.toString();
}

/**
 * 'm:ss' (or 'h:mm:ss') → seconds. The API's `length` field is a
 * string; parsing it as a number gives NaN or nonsense minutes.
 */
export function parseLengthSec(length: string): number {
  const parts = String(length).trim().split(':').map(Number);
  if (parts.some(Number.isNaN) || parts.length === 0) return 0;
  return parts.reduce((total, p) => total * 60 + p, 0);
}

/**
 * No-derivatives forbids the trimming, loudness-normalising and
 * filtering the clip pipeline exists to do. The same check backs the
 * CHECK constraint in migration 019 — enforced twice on purpose.
 */
export function isNdLicense(licenseUrl: string): boolean {
  return licenseUrl.includes('-nd/');
}

export function isNcLicense(licenseUrl: string): boolean {
  return licenseUrl.includes('-nc');
}

export interface XcPage {
  numRecordings: number;
  numPages: number;
  recordings: XcRecording[];
}

export function parseXcResponse(raw: unknown): XcPage {
  const empty: XcPage = { numRecordings: 0, numPages: 0, recordings: [] };
  const r = raw as {
    numRecordings?: number | string;
    numPages?: number | string;
    recordings?: Array<Record<string, unknown>>;
  };
  if (!r || typeof r !== 'object' || !Array.isArray(r.recordings)) return empty;

  const recordings: XcRecording[] = [];
  for (const rec of r.recordings) {
    const s = (k: string) => String(rec[k] ?? '');
    const lic = s('lic');
    // Defence in depth: the query already filters to BY-NC-SA, but a
    // licence mistake is not the kind of thing you notice later.
    if (!lic || isNdLicense(lic)) continue;
    if (!s('file') || !s('id')) continue;
    recordings.push({
      id: s('id'),
      genus: s('gen'),
      species: s('sp'),
      englishName: s('en'),
      recordist: s('rec'),
      country: s('cnt'),
      locality: s('loc'),
      quality: s('q'),
      type: s('type'),
      lengthSec: parseLengthSec(s('length')),
      licenseUrl: lic,
      fileUrl: s('file'),
      fileName: s('file-name'),
      also: Array.isArray(rec.also) ? (rec.also as unknown[]).map(String).filter(Boolean) : [],
      date: s('date'),
      url: s('url'),
    });
  }

  return {
    numRecordings: Number(r.numRecordings ?? 0) || 0,
    numPages: Number(r.numPages ?? 0) || 0,
    recordings,
  };
}

/**
 * Rank candidates for a teaching clip. Quality first; then recordings
 * with NO background species — a clip where a louder wren photobombs
 * the cardinal teaches the wrong bird; then a length that gives the
 * window-picker room without downloading a five-minute WAV.
 */
export function rankRecordings(recs: XcRecording[]): XcRecording[] {
  const lengthScore = (sec: number) => {
    if (sec < 8) return 3;               // too short to cut 6s from, kept only as last resort
    if (sec <= 90) return 0;             // the sweet spot
    if (sec <= 180) return 1;
    return 2;                            // budget-buster originals
  };
  return recs.slice().sort((a, b) =>
    a.quality.localeCompare(b.quality) ||
    Math.min(a.also.length, 1) - Math.min(b.also.length, 1) ||
    lengthScore(a.lengthSec) - lengthScore(b.lengthSec) ||
    b.lengthSec - a.lengthSec,
  );
}

/** The canonical xeno-canto citation, used on the Credits page. */
export function xcSourceId(id: string): string {
  return `XC${id}`;
}
