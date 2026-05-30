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

export interface BuildOptions {
  taxonId: number;
  perPage?: number;             // default 100, max 200
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
