// scripts/naturalist/inatClient.ts
//
// Thin wrapper around the iNaturalist v1 API for the Naturalist Grove
// photo-harvest pipeline. Pure functions only — no I/O lives here; the
// caller (`scripts/seed-flora-photos.ts`) does fetch + file writes.
//
// API reference: https://api.inaturalist.org/v1/docs/

const ALLOWED_LICENSES = ['cc0', 'cc-by', 'cc-by-sa'] as const;
type AllowedLicense = (typeof ALLOWED_LICENSES)[number];

export interface InatPhoto {
  id: number;
  largeUrl: string;             // resolved /large.jpg variant
  licenseCode: AllowedLicense;
  photographer: string;         // attribution string with "(c) " and license stripped
  attributionRaw: string;
  observationUrl: string;
  width?: number;
  height?: number;
}

/**
 * iNat annotation vocabulary. Only the ones we actually filter on.
 *
 * These are NOT alphabetical and NOT guessable — Female is 10 and Male
 * is 11. Getting them the wrong way round is silent: the API returns
 * plenty of real, research-grade photographs, they are just all of the
 * other sex. Verified against
 * https://api.inaturalist.org/v1/controlled_terms on 2026-07-26.
 */
export const ANNOTATION = {
  SEX: 9,
  FEMALE: 10,
  MALE: 11,
} as const;

export interface BuildOptions {
  taxonId: number;
  perPage?: number;             // default 100, max 200
  /**
   * Optional observation annotation filter, e.g. sex.
   * Birds need this and plants don't: half the confusion a beginner
   * hits is that a male and female cardinal look nothing alike, so the
   * harvester has to be able to ask for each separately.
   */
  termId?: number;
  termValueId?: number;
}

export function buildInatObservationsUrl(opts: BuildOptions): string {
  const perPage = Math.min(opts.perPage ?? 100, 200);
  const u = new URL('https://api.inaturalist.org/v1/observations');
  u.searchParams.set('taxon_id', String(opts.taxonId));
  u.searchParams.set('quality_grade', 'research');
  u.searchParams.set('photos', 'true');
  u.searchParams.set('order_by', 'votes');
  u.searchParams.set('per_page', String(perPage));
  u.searchParams.set('license', ALLOWED_LICENSES.join(','));
  if (opts.termId !== undefined && opts.termValueId !== undefined) {
    u.searchParams.set('term_id', String(opts.termId));
    u.searchParams.set('term_value_id', String(opts.termValueId));
  }
  return u.toString();
}

export function largeUrlFor(squareOrOriginalUrl: string): string {
  // iNat photo URLs follow the pattern:
  //   https://static.inaturalist.org/photos/<id>/<variant>.<ext>?<cache-buster>
  // Variants: square (75px), small (240px), medium (500px), large (1024px), original.
  return squareOrOriginalUrl.replace(
    /\/(square|small|medium|original)\.(jpg|jpeg|png)/i,
    '/large.$2'
  );
}

function stripAttribution(raw: string): string {
  // Typical iNat format: "(c) Pat Patterson, some rights reserved (CC BY)"
  // We extract just "Pat Patterson".
  const m = raw.match(/^\(c\)\s*([^,]+?)\s*,/);
  return m ? m[1].trim() : raw.trim();
}

function isAllowedLicense(code: string): code is AllowedLicense {
  return (ALLOWED_LICENSES as readonly string[]).includes(code);
}

export function parseInatResponse(raw: unknown): InatPhoto[] {
  const r = raw as {
    results?: Array<{
      id: number;
      uri: string;
      photos?: Array<{
        id: number;
        license_code?: string | null;
        attribution?: string;
        url?: string;
        original_dimensions?: { width: number; height: number };
      }>;
    }>;
  };

  const out: InatPhoto[] = [];
  // `raw` is whatever came back over the wire — a null body or an
  // error object are both possible, and neither should take the
  // harvester down mid-run.
  if (!r || typeof r !== 'object') return out;
  if (!Array.isArray(r.results)) return out;

  for (const obs of r.results) {
    if (!Array.isArray(obs.photos)) continue;
    for (const p of obs.photos) {
      const lic = p.license_code ?? '';
      if (!isAllowedLicense(lic)) continue;
      if (!p.url) continue;
      out.push({
        id: p.id,
        largeUrl: largeUrlFor(p.url),
        licenseCode: lic,
        photographer: stripAttribution(p.attribution ?? 'Unknown'),
        attributionRaw: p.attribution ?? '',
        observationUrl: obs.uri,
        width: p.original_dimensions?.width,
        height: p.original_dimensions?.height,
      });
    }
  }
  return out;
}
