// scripts/naturalist/wikimediaClient.ts
//
// Thin wrapper around the Wikimedia Commons MediaWiki API for the
// Naturalist Grove photo-harvest pipeline. Pure functions only.
//
// API reference: https://commons.wikimedia.org/w/api.php

type AllowedLicense = 'cc0' | 'cc-by' | 'cc-by-sa';

export interface WikimediaPhoto {
  pageId: number;
  title: string;
  directUrl: string;            // upload.wikimedia.org/...
  sourceUrl: string;            // commons.wikimedia.org/wiki/File:...
  photographer: string;
  licenseCode: AllowedLicense;
}

export function buildWikimediaCategoryUrl(speciesCategory: string): string {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('generator', 'categorymembers');
  u.searchParams.set('gcmtitle', `Category:${speciesCategory}`);
  u.searchParams.set('gcmtype', 'file');
  u.searchParams.set('gcmlimit', '50');
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|extmetadata');
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  return u.toString();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function classifyLicense(shortName: string): AllowedLicense | null {
  const s = shortName.toLowerCase();
  if (s.startsWith('cc0') || s.includes('public domain')) return 'cc0';
  if (s.includes('cc by-sa') || s.includes('cc-by-sa')) return 'cc-by-sa';
  if (s.includes('cc by') || s.includes('cc-by')) {
    // Reject NC + ND variants — design spec keeps strict CC0/CC-BY/CC-BY-SA.
    if (s.includes('-nc') || s.includes(' nc') || s.includes('-nd') || s.includes(' nd')) {
      return null;
    }
    return 'cc-by';
  }
  return null;
}

export function parseWikimediaResponse(raw: unknown): WikimediaPhoto[] {
  const r = raw as { query?: { pages?: unknown } };
  if (!r.query || r.query.pages == null) return [];

  // formatversion=2 returns pages as an array; formatversion=1 returns an object map.
  const pagesIter: Array<{
    pageid?: number;
    title?: string;
    imageinfo?: Array<{
      url?: string;
      descriptionurl?: string;
      extmetadata?: Record<string, { value?: string }>;
    }>;
  }> = Array.isArray(r.query.pages)
    ? (r.query.pages as Array<any>)
    : Object.values(r.query.pages as Record<string, any>);

  const out: WikimediaPhoto[] = [];
  for (const p of pagesIter) {
    const info = p.imageinfo?.[0];
    if (!info?.url || !info.descriptionurl) continue;

    const licenseRaw = info.extmetadata?.LicenseShortName?.value ?? '';
    const licenseCode = classifyLicense(licenseRaw);
    if (!licenseCode) continue;

    const artistRaw = info.extmetadata?.Artist?.value ?? 'Unknown';
    out.push({
      pageId: p.pageid ?? 0,
      title: p.title ?? '',
      directUrl: info.url,
      sourceUrl: info.descriptionurl,
      photographer: stripHtml(artistRaw),
      licenseCode,
    });
  }
  return out;
}
