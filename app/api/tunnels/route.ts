import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getBurrowAnimal, emptyTunnels, type TunnelsState } from '@/lib/world/burrowTunnels';

/**
 * Move an animal into its burrow.
 *
 * The client says which animal; the server decides whether that is a
 * real one. It does NOT re-check the questions — the answers live in
 * the same catalog the client renders from, so re-verifying here would
 * only be theatre. What it does guarantee is that the code is real and
 * that placement is idempotent, so a double-tap cannot corrupt the list.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  animalCode: z.string().min(1),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  if (!getBurrowAnimal(body.animalCode)) {
    return NextResponse.json({ error: 'no such burrow' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: TunnelsState = {
    ...emptyTunnels(), ...((garden.tunnels as TunnelsState) ?? {}),
  };

  if (!state.placed.includes(body.animalCode)) {
    state.placed = [...state.placed, body.animalCode];
  }
  garden.tunnels = state;

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tunnels: state });
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });
  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  return NextResponse.json({
    tunnels: { ...emptyTunnels(), ...((garden.tunnels as TunnelsState) ?? {}) },
  });
}
