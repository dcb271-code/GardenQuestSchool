import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import {
  ART_BUCKET, addPiece, removePiece, validateTitle, decodePngDataUrl,
  type ArtGallery,
} from '@/lib/world/artStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Saving, listing and deleting her pictures. The PNG goes to
 * storage (far too heavy for the jsonb blob); garden.art_gallery
 * keeps the refs. Making is free and pays nothing — no coins, no
 * gems, anywhere in this file.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  action: z.enum(['save', 'delete']),
  dataUrl: z.string().max(2_200_000).optional(),
  title: z.string().max(120).optional(),
  id: z.string().optional(),
});

async function ensureBucket(db: ReturnType<typeof createServiceClient>) {
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.some(b => b.name === ART_BUCKET)) {
    await db.storage.createBucket(ART_BUCKET, {
      public: true, fileSizeLimit: 2 * 1024 * 1024,
    });
  }
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};
  const gallery: ArtGallery = Array.isArray(garden.art_gallery) ? garden.art_gallery : [];

  if (body.action === 'save') {
    if (!body.dataUrl) return NextResponse.json({ error: 'no picture attached' }, { status: 400 });
    const png = decodePngDataUrl(body.dataUrl);
    if ('error' in png) return NextResponse.json({ error: png.error });
    const titled = validateTitle(body.title);
    if ('error' in titled) return NextResponse.json({ error: titled.error });

    await ensureBucket(db);
    const now = new Date().toISOString();
    const stamp = now.replace(/[:.]/g, '-');
    const path = `${body.learnerId}/${stamp}.png`;
    const { error: up } = await db.storage.from(ART_BUCKET)
      .upload(path, png.bytes, { contentType: 'image/png', upsert: false });
    if (up) return NextResponse.json({ error: up.message }, { status: 500 });

    const out = addPiece(gallery, path, now, titled.title);
    garden.art_gallery = out.gallery;
    const { error: we } = await db.from('world_state').upsert(
      { learner_id: body.learnerId, garden, last_updated_at: now },
      { onConflict: 'learner_id' },
    );
    if (we) return NextResponse.json({ error: we.message }, { status: 500 });
    return NextResponse.json({ gallery: out.gallery, saved: out.piece });
  }

  // delete — her art, her call, and the object goes too so storage
  // never accumulates orphans of deleted pictures.
  if (!body.id) return NextResponse.json({ error: 'which picture?' }, { status: 400 });
  const out = removePiece(gallery, body.id);
  if (!out.removed) {
    return NextResponse.json({ error: 'That picture is not in your gallery.', gallery });
  }
  await db.storage.from(ART_BUCKET).remove([out.removed.path]);
  garden.art_gallery = out.gallery;
  const { error: de } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (de) return NextResponse.json({ error: de.message }, { status: 500 });
  return NextResponse.json({ gallery: out.gallery });
}
