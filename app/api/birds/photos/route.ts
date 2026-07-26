import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { birdPhotoUrl } from '@/lib/birds/photoStorage';
import type { BirdPhotoRole } from '@/lib/birds/curriculum';

/**
 * Every curated bird photo, grouped by bird and role.
 *
 * One call for the whole catalog rather than per-exercise lookups:
 * this is a couple of dozen rows of static content, and the scene
 * needs arbitrary birds the moment a generated exercise asks for them.
 * Fetching per question would put a network round trip between "next
 * question" and seeing it.
 *
 * Exercises carry {birdCode, role} references, not URLs, precisely so
 * that a bird whose photos are not curated yet resolves to nothing and
 * the scene can skip that exercise — rather than rendering a broken
 * image.
 */

export const revalidate = 3600;

export interface PhotoAttribution {
  photographer: string | null;
  licenseCode: string;
  sourceUrl: string;
}

export interface BirdPhoto {
  url: string;
  alt: string;
  tier: number;
  attribution: PhotoAttribution;
}

export type BirdPhotoIndex = Record<string, Partial<Record<BirdPhotoRole, BirdPhoto[]>>>;

interface Row {
  bird_code: string;
  role: BirdPhotoRole;
  tier: number;
  storage_path: string;
  source_url: string;
  photographer: string | null;
  license_code: string;
  alt_text: string;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: 'storage not configured' }, { status: 500 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('bird_photo')
    .select('bird_code, role, tier, storage_path, source_url, photographer, license_code, alt_text')
    .order('tier', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const photos: BirdPhotoIndex = {};
  for (const row of (data ?? []) as Row[]) {
    const byRole = (photos[row.bird_code] ??= {});
    (byRole[row.role] ??= []).push({
      url: birdPhotoUrl(baseUrl, row.storage_path, { widthPx: 720 }),
      alt: row.alt_text,
      tier: row.tier,
      attribution: {
        photographer: row.photographer,
        licenseCode: row.license_code,
        sourceUrl: row.source_url,
      },
    });
  }

  return NextResponse.json({ photos });
}
