import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '@/lib/world/floraCatalog';
import { DICHOTOMOUS_KEY, isSpeciesLeaf } from '@/lib/world/dichotomousKey';
import { canonicalKeyPath } from '@/lib/naturalist/walkBuilder';
import { pickWalkSpecies } from '@/lib/naturalist/walkSelection';
import { publicUrlFor } from '@/lib/naturalist/floraPhotoStorage';

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
  heroPhoto: PhotoRef | null;
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

function pickRow(rows: FloraPhotoRow[], floraCode: string, role: PhotoRole): FloraPhotoRow | null {
  const candidates = rows.filter(r => r.flora_code === floraCode && r.role === role);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickRowAnyRole(rows: FloraPhotoRow[], floraCode: string): FloraPhotoRow | null {
  const candidates = rows.filter(r => r.flora_code === floraCode);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
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
  const n = body.n ?? (2 + Math.floor(Math.random() * 3)); // 2..4

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return NextResponse.json({ error: 'supabase url missing' }, { status: 500 });

  // 1. Pick species
  const picked = pickWalkSpecies(FLORA_CATALOG.map(f => f.code), n, Math.random);

  // 2. Load ALL relevant photo rows in one shot (avoids N round-trips)
  const db = createServiceClient();
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
    .in('flora_code', Array.from(referencedCodes))
    .eq('tier', 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows: FloraPhotoRow[] = photoRows ?? [];

  // 3. Build each species payload
  const speciesPayloads: WalkSpeciesPayload[] = picked.map((code, idx) => {
    const sp = FLORA_CATALOG.find(f => f.code === code) as FloraData;

    // Hero: a 'whole' photo if present, else any photo
    const heroRow = pickRow(rows, code, 'whole') ?? pickRowAnyRole(rows, code);
    const heroPhoto = heroRow ? toPhotoRef(heroRow, baseUrl) : null;

    // KeyPath: resolve each node's photo pair
    const pathNodeIds = canonicalKeyPath(code);
    const keyPath: KeyStepResolved[] = pathNodeIds.map(nid => {
      const node = DICHOTOMOUS_KEY[nid];
      const lRow = pickRow(rows, node.leftPhoto.floraCode, node.leftPhoto.role)
        ?? pickRowAnyRole(rows, node.leftPhoto.floraCode);
      const rRow = pickRow(rows, node.rightPhoto.floraCode, node.rightPhoto.role)
        ?? pickRowAnyRole(rows, node.rightPhoto.floraCode);
      return {
        nodeId: nid,
        question: node.question,
        leftLabel: node.leftLabel,
        rightLabel: node.rightLabel,
        leftPhoto: lRow
          ? toPhotoRef(lRow, baseUrl)
          : placeholderPhoto(node.leftLabel),
        rightPhoto: rRow
          ? toPhotoRef(rRow, baseUrl)
          : placeholderPhoto(node.rightLabel),
      };
    });

    // RevealPhotos: up to 3 different roles for this species
    const revealRows: FloraPhotoRow[] = [];
    for (const role of sp.photoRoles) {
      const r = pickRow(rows, code, role);
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
      heroPhoto,
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
