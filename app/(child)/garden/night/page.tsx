// app/(child)/garden/night/page.tsx
//
// The moon garden after dark. Reached from the garden when a
// moon-quadrant flower is actually open.
//
// The bloom check runs here on the server, not in the component, for
// the same reason the API repeats it: whether a flower is open is the
// gate, and a gate the browser computes is a suggestion.

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { getPlant } from '@/lib/world/plantCatalog';
import { todayKey } from '@/lib/learning/review';
import {
  emptyNightGarden, canVisitTonight, nightGardenOpen, type NightGardenState,
} from '@/lib/world/nightGarden';
import NightGardenScene from './NightGardenScene';

export const dynamic = 'force-dynamic';

export default async function NightGardenPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) redirect('/');

  const { count } = await db.from('attempt')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId).eq('outcome', 'correct');
  const correct = count ?? 0;

  const { data: plots } = await db.from('garden_plot')
    .select('plant_code, planted_at_correct')
    .eq('learner_id', learnerId).is('harvested_at', null);

  const blooming = (plots ?? [])
    .filter(p => {
      const plant = getPlant(p.plant_code as string);
      if (!plant || plant.garden !== 'moon') return false;
      return (correct - (p.planted_at_correct as number)) >= plant.growthCost;
    })
    .map(p => p.plant_code as string);

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: NightGardenState = {
    ...emptyNightGarden(),
    ...((garden.nightGarden as NightGardenState) ?? {}),
  };

  return (
    <NightGardenScene
      learnerId={learnerId}
      initial={{ ...state, canVisitTonight: canVisitTonight(state, todayKey()) }}
      blooming={blooming}
      open={nightGardenOpen(blooming)}
    />
  );
}
