import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getResearcherQuest, RESEARCHER_MIN_LEVEL } from '@/lib/world/researcherQuests';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  habitatCode: z.string().min(1),
});

/**
 * Records that the learner completed a habitat's RESEARCHER quest —
 * the harder Level-3+ science chain that runs after a habitat is
 * built. Appends the habitat to world_state.garden.researcher_badges
 * and grants a 'wondering' virtue gem (1/day cap in the helper).
 * Idempotent: re-completing changes nothing and grants nothing.
 *
 * Badged habitats can attract rare visitors — see
 * speciesCatalog.requiresResearcherBadge + arrivals.
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const quest = getResearcherQuest(body.habitatCode);
  if (!quest) {
    return NextResponse.json({ error: 'no researcher quest for that habitat' }, { status: 400 });
  }

  // Level gate — server-side mirror of the UI gate.
  const { data: learner } = await db
    .from('learner')
    .select('grade_level')
    .eq('id', body.learnerId)
    .single();
  if ((learner?.grade_level ?? 2) < RESEARCHER_MIN_LEVEL) {
    return NextResponse.json({ error: 'researcher quests open at Level 3' }, { status: 403 });
  }

  // The habitat must actually be BUILT for this learner.
  const { data: ht } = await db
    .from('habitat_type')
    .select('id')
    .eq('code', body.habitatCode)
    .single();
  if (!ht) {
    return NextResponse.json({ error: 'habitat_type row missing — re-seed' }, { status: 500 });
  }
  const { data: built } = await db
    .from('habitat')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('habitat_type_id', ht.id)
    .maybeSingle();
  if (!built) {
    return NextResponse.json({ error: 'habitat not built yet' }, { status: 403 });
  }

  // Append the badge (idempotent).
  const { data: stateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', body.learnerId)
    .maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const badges: string[] = Array.isArray(garden.researcher_badges) ? garden.researcher_badges : [];
  if (badges.includes(body.habitatCode)) {
    return NextResponse.json({ badged: true, alreadyBadged: true, gemGranted: false });
  }
  garden.researcher_badges = [...badges, body.habitatCode];
  const { error: stateErr } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (stateErr) {
    return NextResponse.json({ error: stateErr.message }, { status: 500 });
  }

  const gemGranted = await grantVirtueGem(
    db, body.learnerId, 'wondering', quest.gemLine,
    { habitatCode: body.habitatCode, source: 'researcher_quest' },
  );

  return NextResponse.json({ badged: true, alreadyBadged: false, gemGranted });
}
