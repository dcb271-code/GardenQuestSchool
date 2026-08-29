import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import {
  addLetter, addSiblingLetter, markRepliesRead, MAX_LETTER_LENGTH, type Letterbox,
} from '@/lib/world/letters';

/**
 * The letterbox. She writes; it is kept; a reply may come back.
 *
 * Lives in world_state.garden.letters like every other bit of her
 * state — no migration, so it works the day it deploys.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  text: z.string().min(1).max(MAX_LETTER_LENGTH),
  /** A sibling's learner id — the letter goes to THEIR box. Absent:
   *  the letter goes to the garden-builder, as ever. */
  to: z.string().optional(),
});

async function loadGarden(db: ReturnType<typeof createServiceClient>, learnerId: string) {
  const { data } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  return (data?.garden as Record<string, unknown>) ?? {};
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  // ── kid-to-kid mail: the letter lands in the SIBLING's box ──────
  if (body.to && body.to !== body.learnerId) {
    const { data: sender } = await db
      .from('learner').select('first_name').eq('id', body.learnerId).maybeSingle();
    const { data: recipient } = await db
      .from('learner').select('id, first_name').eq('id', body.to).maybeSingle();
    if (!sender || !recipient) {
      return NextResponse.json({ error: 'That letterbox does not exist.' }, { status: 400 });
    }
    const theirGarden = await loadGarden(db, recipient.id as string);
    const theirBox = (theirGarden.letters as Letterbox) ?? [];
    const added = addSiblingLetter(
      theirBox, body.text, sender.first_name as string, new Date().toISOString(),
    );
    if (!added) return NextResponse.json({ error: 'empty letter' }, { status: 400 });
    theirGarden.letters = added.box;
    const { error } = await db.from('world_state').upsert(
      { learner_id: recipient.id, garden: theirGarden, last_updated_at: new Date().toISOString() },
      { onConflict: 'learner_id' },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ delivered: true, toName: recipient.first_name });
  }

  const garden = await loadGarden(db, body.learnerId);
  const box = (garden.letters as Letterbox) ?? [];

  const added = addLetter(box, body.text, new Date().toISOString());
  if (!added) return NextResponse.json({ error: 'empty letter' }, { status: 400 });
  garden.letters = added.box;

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ letters: added.box, sent: added.letter });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const garden = await loadGarden(db, learnerId);
  let box = (garden.letters as Letterbox) ?? [];

  // Opening the letterbox is what marks replies as read — the badge
  // should clear because she LOOKED, not because time passed.
  if (url.searchParams.get('open') === '1') {
    const marked = markRepliesRead(box, new Date().toISOString());
    if (JSON.stringify(marked) !== JSON.stringify(box)) {
      garden.letters = marked;
      await db.from('world_state').upsert(
        { learner_id: learnerId, garden, last_updated_at: new Date().toISOString() },
        { onConflict: 'learner_id' },
      );
      box = marked;
    }
  }

  return NextResponse.json({ letters: box });
}
