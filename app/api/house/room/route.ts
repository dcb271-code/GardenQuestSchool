import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import {
  emptyRoom, setQuilt, setShelf, pruneShelf,
  type RoomState, type Collections,
} from '@/lib/world/room';
import { emptyCavern, type CavernState } from '@/lib/world/cavern';
import type { LifeList } from '@/lib/birds/lifeList';
import type { MunchState } from '@/lib/packs/math/munch';

/**
 * Her bedroom's choices: the quilt on the bed and what stands on the
 * treasure shelf. Ownership is checked HERE, the cavern banking rule
 * again — a client naming a diamond is not a child owning one. The
 * shelf is pruned on every write so a stone sold downstairs quietly
 * leaves the shelf instead of haunting it.
 *
 * Free, no gates. Hanging pictures goes through /api/art with
 * `wall: 'bedroom'` — one hanging system for the whole house.
 *
 * Spec: docs/superpowers/specs/2026-08-29-upstairs-spec.md
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.discriminatedUnion('action', [
  z.object({
    learnerId: z.string().min(1),
    action: z.literal('quilt'),
    quilt: z.string().min(1),
  }),
  z.object({
    learnerId: z.string().min(1),
    action: z.literal('shelf'),
    spot: z.number().int(),
    /** null clears the spot. */
    item: z.object({
      kind: z.enum(['stone', 'bird', 'veggie']),
      code: z.string().min(1),
    }).nullable(),
  }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'That did not make sense to the room.' }, { status: 400 });
  }
  const body = parsed.data;
  const db = createServiceClient();

  const { data: row, error: re } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  if (re) return NextResponse.json({ error: re.message }, { status: 500 });
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const room: RoomState = { ...emptyRoom(), ...((garden.room as RoomState) ?? {}) };

  const cavern: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };
  const lifeList = (garden.bird_lifelist as LifeList) ?? {};
  const munch = ((garden.arcade as { munch?: MunchState } | undefined)?.munch) ?? {};
  const owns: Collections = {
    kept: cavern.kept ?? {},
    lifeList: Object.keys(lifeList),
    prizes: (munch.prizes ?? []).map(p => p.code),
  };

  const out = body.action === 'quilt'
    ? setQuilt(room, body.quilt)
    : setShelf(room, body.spot, body.item, owns);

  if ('error' in out) {
    return NextResponse.json({ error: out.error, room: pruneShelf(room, owns) });
  }

  const next = pruneShelf(out.room, owns);
  garden.room = next;
  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ room: next });
}
