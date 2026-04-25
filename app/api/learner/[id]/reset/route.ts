import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  scope: z.enum(['habitats', 'journal', 'sessions', 'all']),
});

/**
 * Reset a learner's progress at varying levels of nuclear-ness.
 *
 *   habitats  → wipes built habitats AND queued arrival, AND journal
 *               (since arrivals are gated on built habitats and we
 *                want to re-experience them too).
 *   journal   → wipes journal_entry only + queued arrival.
 *   sessions  → wipes attempts + sessions + skill_progress (so the
 *               learner gets to re-do skills from scratch). Leaves
 *               habitats and journal alone.
 *   all       → everything except the learner row itself: habitats,
 *               journal, virtue gems, attempts, sessions, skill
 *               progress, world_state.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const learnerId = params.id;

  const wiped: string[] = [];

  // Helper: clear pendingArrivalSpeciesCode in world_state.garden
  const clearPendingArrival = async () => {
    const { data: existing } = await db
      .from('world_state')
      .select('garden')
      .eq('learner_id', learnerId)
      .maybeSingle();
    if (existing?.garden) {
      const garden = { ...(existing.garden as Record<string, any>) };
      if (garden.pendingArrivalSpeciesCode) {
        delete garden.pendingArrivalSpeciesCode;
        await db.from('world_state')
          .update({ garden, last_updated_at: new Date().toISOString() })
          .eq('learner_id', learnerId);
      }
    }
  };

  if (body.scope === 'habitats' || body.scope === 'all') {
    await db.from('habitat').delete().eq('learner_id', learnerId);
    await db.from('journal_entry').delete().eq('learner_id', learnerId);
    await clearPendingArrival();
    wiped.push('habitats', 'journal');
  }

  if (body.scope === 'journal' && !wiped.includes('journal')) {
    await db.from('journal_entry').delete().eq('learner_id', learnerId);
    await clearPendingArrival();
    wiped.push('journal');
  }

  if (body.scope === 'sessions' || body.scope === 'all') {
    // Need to delete attempts before sessions due to FK
    const { data: sessRows } = await db.from('session').select('id').eq('learner_id', learnerId);
    const sessIds = (sessRows ?? []).map(s => s.id);
    if (sessIds.length > 0) {
      await db.from('attempt').delete().in('session_id', sessIds);
    }
    await db.from('session').delete().eq('learner_id', learnerId);
    await db.from('skill_progress').delete().eq('learner_id', learnerId);
    wiped.push('sessions', 'attempts', 'skill_progress');
  }

  if (body.scope === 'all') {
    await db.from('virtue_gem').delete().eq('learner_id', learnerId);
    // Reset world_state to default (don't delete the row itself, the
    // garden auto-place logic creates one anyway)
    await db.from('world_state').update({
      garden: {},
      last_updated_at: new Date().toISOString(),
    }).eq('learner_id', learnerId);
    wiped.push('virtue_gems', 'world_state');
  }

  return NextResponse.json({ ok: true, scope: body.scope, wiped });
}
