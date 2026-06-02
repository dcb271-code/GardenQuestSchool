import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '@/lib/world/floraCatalog';
import { DICHOTOMOUS_KEY } from '@/lib/world/dichotomousKey';
import { canonicalKeyPath } from '@/lib/naturalist/walkBuilder';
import { selectWalkSpecies, type ReviewRow } from '@/lib/naturalist/walkSelection';
import { publicUrlFor } from '@/lib/naturalist/floraPhotoStorage';
import { currentSeason, floraCodesInSeason } from '@/lib/world/season';
import { tierForExposures, nextRoleForExposure } from '@/lib/naturalist/spacing';

const Body = z.object({
  learnerId: z.string().min(1),
  n: z.number().int().min(2).max(4).optional(),
});

interface PhotoAttribution {
  photographer: string | null;
  licenseCode: string;
  sourceUrl: string;
}
interface PhotoRef {
  url: string;
  alt: string;
  attribution: PhotoAttribution;
}
interface KeyStepResolved {
  nodeId: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: PhotoRef;
  rightPhoto: PhotoRef;
}
interface WalkSpeciesPayload {
  position: number;
  floraCode: string;
  commonName: string;
  scientificName: string;
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  exposures: number;
  showQuickRecognize: boolean;
  heroPhoto: PhotoRef | null;
  heroRole: PhotoRole | null;
  keyPath: KeyStepResolved[];
  revealPhotos: PhotoRef[];
}
interface WalkSessionPayload {
  id: string;
  species: WalkSpeciesPayload[];
}

interface FloraPhotoRow {
  flora_code: string;
  role: string;
  tier: number;
  storage_path: string;
  alt_text: string;
  photographer: string | null;
  license_code: string;
  source_url: string;
}

function toPhotoRef(row: FloraPhotoRow, baseUrl: string): PhotoRef {
  return {
    url: publicUrlFor(baseUrl, row.storage_path, { widthPx: 720 }),
    alt: row.alt_text,
    attribution: {
      photographer: row.photographer,
      licenseCode: row.license_code,
      sourceUrl: row.source_url,
    },
  };
}

// Pick a photo for (code, role) preferring `tier`, falling back to any tier.
// Returns null if no photo of that role exists at all.
function pickRowTiered(
  rows: FloraPhotoRow[],
  floraCode: string,
  role: PhotoRole,
  tier: number,
  rng: () => number,
): FloraPhotoRow | null {
  const sameRole = rows.filter(r => r.flora_code === floraCode && r.role === role);
  if (sameRole.length === 0) return null;
  const preferred = sameRole.filter(r => r.tier === tier);
  const pool = preferred.length > 0 ? preferred : sameRole;
  return pool[Math.floor(rng() * pool.length)];
}

function pickRowAnyRole(
  rows: FloraPhotoRow[],
  floraCode: string,
  tier: number,
  rng: () => number,
): FloraPhotoRow | null {
  const any = rows.filter(r => r.flora_code === floraCode);
  if (any.length === 0) return null;
  const preferred = any.filter(r => r.tier === tier);
  const pool = preferred.length > 0 ? preferred : any;
  return pool[Math.floor(rng() * pool.length)];
}

function placeholderPhoto(alt: string): PhotoRef {
  return {
    url: '',
    alt,
    attribution: { photographer: null, licenseCode: 'cc0', sourceUrl: '' },
  };
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const rng = Math.random;
  const n = body.n ?? (2 + Math.floor(rng() * 3)); // 2..4

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return NextResponse.json({ error: 'supabase url missing' }, { status: 500 });

  const db = createServiceClient();

  // 1. Load this learner's review history.
  const { data: reviewData, error: reviewErr } = await db
    .from('flora_review')
    .select('flora_code, exposures, next_review_at, photo_roles_seen')
    .eq('learner_id', body.learnerId);
  if (reviewErr) return NextResponse.json({ error: reviewErr.message }, { status: 500 });
  const reviewRows: ReviewRow[] = (reviewData ?? []).map(r => ({
    flora_code: r.flora_code,
    exposures: r.exposures ?? 0,
    next_review_at: r.next_review_at,
    photo_roles_seen: Array.isArray(r.photo_roles_seen) ? r.photo_roles_seen : [],
  }));
  const reviewByCode = new Map(reviewRows.map(r => [r.flora_code, r]));

  // 2. Spacing-aware species pick (seasonal + due/new/wildcard buckets).
  const now = new Date();
  const season = currentSeason(now.getMonth() + 1);
  const seasonPool = floraCodesInSeason(season);
  const picked = selectWalkSpecies({ seasonPool, reviewRows, n, now, rng });

  if (picked.length === 0) {
    return NextResponse.json({ error: 'no species available this season' }, { status: 500 });
  }

  // 3. Load all referenced photo rows in one shot — NO tier filter so
  //    tier 2/3 requests can gracefully fall back to whatever exists.
  const referencedCodes = new Set<string>(picked);
  for (const code of picked) {
    for (const nodeId of canonicalKeyPath(code)) {
      const node = DICHOTOMOUS_KEY[nodeId];
      referencedCodes.add(node.leftPhoto.floraCode);
      referencedCodes.add(node.rightPhoto.floraCode);
    }
  }
  const { data: photoRows, error } = await db
    .from('flora_photo')
    .select('flora_code, role, tier, storage_path, alt_text, photographer, license_code, source_url')
    .in('flora_code', Array.from(referencedCodes));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows: FloraPhotoRow[] = photoRows ?? [];

  // 4. Build each species payload.
  const speciesPayloads: WalkSpeciesPayload[] = picked.map((code, idx) => {
    const sp = FLORA_CATALOG.find(f => f.code === code) as FloraData;
    const review = reviewByCode.get(code);
    const exposures = review?.exposures ?? 0;
    const rolesSeen = review?.photo_roles_seen ?? [];
    const tier = tierForExposures(exposures);

    // Hero photo: role chosen by interleaved-practice rotation.
    const heroRole = nextRoleForExposure(sp.photoRoles, rolesSeen);
    const heroRow = pickRowTiered(rows, code, heroRole, tier, rng)
      ?? pickRowAnyRole(rows, code, tier, rng);
    const heroPhoto = heroRow ? toPhotoRef(heroRow, baseUrl) : null;

    // KeyPath: resolve each node's photo pair (key comparison photos
    // always use tier 1 reference shots regardless of learner exposure).
    const pathNodeIds = canonicalKeyPath(code);
    const keyPath: KeyStepResolved[] = pathNodeIds.map(nid => {
      const node = DICHOTOMOUS_KEY[nid];
      const lRow = pickRowTiered(rows, node.leftPhoto.floraCode, node.leftPhoto.role, 1, rng)
        ?? pickRowAnyRole(rows, node.leftPhoto.floraCode, 1, rng);
      const rRow = pickRowTiered(rows, node.rightPhoto.floraCode, node.rightPhoto.role, 1, rng)
        ?? pickRowAnyRole(rows, node.rightPhoto.floraCode, 1, rng);
      return {
        nodeId: nid,
        question: node.question,
        leftLabel: node.leftLabel,
        rightLabel: node.rightLabel,
        leftPhoto: lRow ? toPhotoRef(lRow, baseUrl) : placeholderPhoto(node.leftLabel),
        rightPhoto: rRow ? toPhotoRef(rRow, baseUrl) : placeholderPhoto(node.rightLabel),
      };
    });

    // RevealPhotos: up to 3 distinct roles for this species (tier-preferred).
    const revealRows: FloraPhotoRow[] = [];
    for (const role of sp.photoRoles) {
      const r = pickRowTiered(rows, code, role, tier, rng);
      if (r && !revealRows.find(x => x.storage_path === r.storage_path)) revealRows.push(r);
      if (revealRows.length === 3) break;
    }
    const revealPhotos = revealRows.map(r => toPhotoRef(r, baseUrl));

    return {
      position: idx + 1,
      floraCode: code,
      commonName: sp.commonName,
      scientificName: sp.scientificName,
      notableFeatures: sp.notableFeatures,
      facts: sp.facts,
      emoji: sp.emoji,
      exposures,
      showQuickRecognize: exposures >= 5,
      heroPhoto,
      heroRole: heroRow ? heroRole : null,
      keyPath,
      revealPhotos,
    };
  });

  const payload: WalkSessionPayload = {
    id: randomUUID(),
    species: speciesPayloads,
  };
  return NextResponse.json(payload);
}
