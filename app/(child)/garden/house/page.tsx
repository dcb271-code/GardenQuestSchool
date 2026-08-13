// app/(child)/garden/house/page.tsx
//
// The family's house. The one door on the map that belongs to the
// children, and the first interior with NO GATE of any kind — no
// level, no mastery, no counts. Nobody earns their own front door.
//
// Spec: docs/superpowers/specs/2026-08-12-house-spec.md

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { emptyHouse, type HouseState } from '@/lib/world/house';
import { emptyCavern, type CavernState } from '@/lib/world/cavern';
import type { LifeList } from '@/lib/birds/lifeList';
import {
  defaultAdventureState, type LunaAdventureState,
} from '@/lib/world/lunaAdventure';
import { canFeed } from '@/lib/world/lunaTreats';
import { todayKey } from '@/lib/learning/review';
import HouseScene from './HouseScene';

export const dynamic = 'force-dynamic';

export default async function HousePage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};

  const house: HouseState = { ...emptyHouse(), ...((garden.house as HouseState) ?? {}) };
  const cavern: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };
  const lifeList = (garden.bird_lifelist as LifeList) ?? {};
  const adventure: LunaAdventureState = {
    ...defaultAdventureState(),
    ...((garden.lunaAdventure as LunaAdventureState) ?? {}),
  };
  // Saves from before completedEpisodes existed recorded a finish only
  // by advancing `episode`. Standing on episode 3 means 1 and 2 are
  // done; her first finished chapter must not be missing from the
  // hearth basket because it was finished too early to be counted.
  const completedEpisodes = Array.from(new Set([
    ...(adventure.completedEpisodes ?? []),
    ...Array.from({ length: Math.max(adventure.episode - 1, 0) }, (_, i) => i + 1),
  ])).sort((a, b) => a - b);
  const lunaState = (garden.luna ?? {}) as { lastFed?: string };

  // Every child's coat hangs by the door, whoever is signed in — it
  // is the family's hall, not a profile screen.
  const { data: learners } = await db
    .from('learner').select('id, first_name').order('first_name');
  const coatNames = (learners ?? []).map(l => l.first_name as string);
  const learnerName =
    (learners ?? []).find(l => l.id === learnerId)?.first_name as string ?? '';

  return (
    <HouseScene
      learnerId={learnerId}
      learnerName={learnerName}
      coatNames={coatNames}
      house={house}
      kept={cavern.kept ?? {}}
      lifeListCodes={Object.keys(lifeList)}
      completedEpisodes={completedEpisodes}
      choices={adventure.choices ?? {}}
      lunaCanFeedToday={canFeed(lunaState, todayKey())}
    />
  );
}
