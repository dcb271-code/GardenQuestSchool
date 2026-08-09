// app/(child)/garden/tunnels/page.tsx
//
// Reached through the door in the bunny burrow.

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { emptyTunnels, type TunnelsState } from '@/lib/world/burrowTunnels';
import TunnelsScene from './TunnelsScene';

export const dynamic = 'force-dynamic';

export default async function TunnelsPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) redirect('/');

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: TunnelsState = {
    ...emptyTunnels(), ...((garden.tunnels as TunnelsState) ?? {}),
  };

  return <TunnelsScene learnerId={learnerId} placed={state.placed} />;
}
