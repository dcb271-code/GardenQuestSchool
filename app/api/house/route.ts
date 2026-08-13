import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { emptyHouse, setMantelStone, setMantelBird, type HouseState } from '@/lib/world/house';
import { emptyCavern, type CavernState } from '@/lib/world/cavern';
import type { LifeList } from '@/lib/birds/lifeList';

/**
 * The mantel shelf. Two slots — a stone from her case, a bird from
 * her life list — chosen by her. Ownership is checked HERE: the
 * mantel displays what she really has, and a client naming a diamond
 * is not a child owning one. Same lesson as the cavern, kept.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  slot: z.enum(['stone', 'bird']),
  /** null takes the piece down; a code puts it up. */
  code: z.string().nullable(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const house: HouseState = { ...emptyHouse(), ...((garden.house as HouseState) ?? {}) };
  const cavern: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };
  const lifeList = (garden.bird_lifelist as LifeList) ?? {};

  const next = body.slot === 'stone'
    ? setMantelStone(house, cavern.kept ?? {}, body.code)
    : setMantelBird(house, lifeList, body.code);

  if (!next) {
    return NextResponse.json({
      error: body.slot === 'stone'
        ? 'That stone is not in your case, so it cannot stand on the mantel.'
        : 'The mantel only holds birds from your life list — ones you have really seen.',
      house,
    });
  }

  garden.house = next;
  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ house: next });
}
