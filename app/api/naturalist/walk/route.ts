import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '@/lib/world/floraCatalog';
import { DICHOTOMOUS_KEY } from '@/lib/world/dichotomousKey';
import {
  canonicalKeyPath, canonicalKeySteps, keyEvidenceRoles, dedupeWalkSteps,
  type KeySide,
} from '@/lib/naturalist/walkBuilder';
import { selectWalkSpecies, type ReviewRow } from '@/lib/naturalist/walkSelection';
import { publicUrlFor } from '@/lib/naturalist/floraPhotoStorage';
import { pickPhotoRow } from '@/lib/naturalist/photoPick';
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
  correctSide: KeySide;
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
  quizOptions: string[];
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

  // Curated per-node-side photos (key_node_photo, node_id 'nodeId.left').
  // When present these win over the dynamic pick — they exist precisely
  // because the dynamic pick can contradict the label (a pink trillium
  // illustrating "three large white petals").
  const { data: curatedRows } = await db
    .from('key_node_photo')
    .select('node_id, storage_path, alt_text, photographer, license_code, source_url');
  const curatedBySide = new Map(
    (curatedRows ?? []).map(r => [r.node_id as string, r]),
  );

  // Steps per species, with shared-prefix steps the child already
  // answered identically earlier in this walk dropped (asking "broad
  // flat leaves?" three times in one walk teaches nothing — but a node
  // where the answer DIFFERS is kept: that's real discrimination).
  const stepsBySpecies = dedupeWalkSteps(picked.map(code => canonicalKeySteps(code)));

  // 4. Build each species payload.
  const speciesPayloads: WalkSpeciesPayload[] = picked.map((code, idx) => {
    const sp = FLORA_CATALOG.find(f => f.code === code) as FloraData;
    const review = reviewByCode.get(code);
    const exposures = review?.exposures ?? 0;
    const rolesSeen = review?.photo_roles_seen ?? [];
    const tier = tierForExposures(exposures);
    const showQuickRecognize = exposures >= 5;

    // Photos already shown for this species this walk — every pick
    // below avoids these when the pool allows, so the mystery photo
    // never doubles as a key choice (a giveaway) or a reveal thumbnail.
    const used = new Set<string>();

    // Hero photo: when the child will work the key, the mystery photo
    // MUST show the features the questions ask about (a wildflower
    // keyed by flower color needs its flowers visible — not a young
    // leaves-only shot). Quick-recognize skips the key, so the full
    // role rotation stays in play there for varied exposure.
    const evidenceRoles = keyEvidenceRoles(code)
      .filter(r => (sp.photoRoles as readonly string[]).includes(r)) as typeof sp.photoRoles[number][];
    const heroRolePool = (showQuickRecognize || evidenceRoles.length === 0)
      ? sp.photoRoles
      : evidenceRoles;
    const heroRole = nextRoleForExposure(heroRolePool, rolesSeen);
    const heroRow = pickPhotoRow(rows, { floraCode: code, role: heroRole, tier, used, rng })
      ?? pickPhotoRow(rows, { floraCode: code, tier, used, rng });
    if (heroRow) used.add(heroRow.storage_path);
    const heroPhoto = heroRow ? toPhotoRef(heroRow, baseUrl) : null;

    // Name-quiz options for quick-recognize: the real name plus two
    // distractors, same kind (flower/tree) when possible so the choice
    // is a real discrimination and not "obviously not a tree".
    let quizOptions: string[] = [];
    if (showQuickRecognize) {
      const others = FLORA_CATALOG.filter(f => f.code !== code);
      const sameKind = others.filter(f => f.kind === sp.kind);
      const pool = [...(sameKind.length >= 2 ? sameKind : others)];
      const distractors: string[] = [];
      while (distractors.length < 2 && pool.length > 0) {
        const [d] = pool.splice(Math.floor(rng() * pool.length), 1);
        distractors.push(d.commonName);
      }
      quizOptions = [sp.commonName, ...distractors];
      for (let i = quizOptions.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [quizOptions[i], quizOptions[j]] = [quizOptions[j], quizOptions[i]];
      }
    }

    // KeyPath: resolve each node's photo pair (key comparison photos
    // always use tier 1 reference shots regardless of learner exposure).
    // A curated key_node_photo row for 'nodeId.side' wins outright.
    const resolveSide = (nid: string, side: KeySide): PhotoRef => {
      const node = DICHOTOMOUS_KEY[nid];
      const ref = side === 'left' ? node.leftPhoto : node.rightPhoto;
      const label = side === 'left' ? node.leftLabel : node.rightLabel;
      const curated = curatedBySide.get(`${nid}.${side}`);
      if (curated) {
        return {
          url: publicUrlFor(baseUrl, curated.storage_path, { widthPx: 720 }),
          alt: curated.alt_text,
          attribution: {
            photographer: curated.photographer,
            licenseCode: curated.license_code,
            sourceUrl: curated.source_url,
          },
        };
      }
      const row = pickPhotoRow(rows, { floraCode: ref.floraCode, role: ref.role, tier: 1, used, rng })
        ?? pickPhotoRow(rows, { floraCode: ref.floraCode, tier: 1, used, rng });
      if (row) used.add(row.storage_path);
      return row ? toPhotoRef(row, baseUrl) : placeholderPhoto(label);
    };

    const keyPath: KeyStepResolved[] = stepsBySpecies[idx].map(({ nodeId: nid, correctSide }) => {
      const node = DICHOTOMOUS_KEY[nid];
      return {
        nodeId: nid,
        question: node.question,
        leftLabel: node.leftLabel,
        rightLabel: node.rightLabel,
        leftPhoto: resolveSide(nid, 'left'),
        rightPhoto: resolveSide(nid, 'right'),
        correctSide,
      };
    });

    // RevealPhotos: up to 3 distinct roles for this species. Skip the
    // hero photo outright — the reveal screen already shows it large.
    const revealRows: FloraPhotoRow[] = [];
    for (const role of sp.photoRoles) {
      const r = pickPhotoRow(rows, { floraCode: code, role, tier, used, rng });
      if (
        r &&
        r.storage_path !== heroRow?.storage_path &&
        !revealRows.find(x => x.storage_path === r.storage_path)
      ) {
        revealRows.push(r);
        used.add(r.storage_path);
      }
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
      showQuickRecognize,
      quizOptions,
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
