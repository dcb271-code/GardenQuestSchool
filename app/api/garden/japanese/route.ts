import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getUnit, isUnitUnlocked } from '@/lib/world/japaneseSchool';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Which units has this learner finished? */
export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};
  const completed: string[] = Array.isArray(garden.japanese_units) ? garden.japanese_units : [];

  return NextResponse.json({ completed });
}

const Body = z.object({
  learnerId: z.string().min(1),
  unitCode: z.string().min(1),
});

/**
 * Record a finished unit. Appends to world_state.garden.japanese_units
 * and grants a 'curiosity' gem (1/day cap lives in grantVirtueGem, so
 * re-drilling old units for gems doesn't work). Idempotent — finishing
 * a unit twice changes nothing.
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const unit = getUnit(body.unitCode);
  if (!unit) return NextResponse.json({ error: 'unknown unit' }, { status: 400 });

  const { data: row } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', body.learnerId)
    .maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};
  const completed: string[] = Array.isArray(garden.japanese_units) ? garden.japanese_units : [];

  // Server-side mirror of the UI's ordering rule, so a hand-made
  // request can't skip ahead to kanji.
  if (!isUnitUnlocked(body.unitCode, completed)) {
    return NextResponse.json({ error: 'finish the unit before this one first' }, { status: 403 });
  }

  if (completed.includes(body.unitCode)) {
    return NextResponse.json({ completed, alreadyDone: true, gemGranted: false });
  }

  garden.japanese_units = [...completed, body.unitCode];
  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const gemGranted = await grantVirtueGem(
    db, body.learnerId, 'curiosity',
    unit.kind === 'kanji'
      ? `You learned to read ${unit.subtitle} — real kanji, in your own garden.`
      : `You learned ${unit.subtitle}. A whole row of a new writing system.`,
    { source: 'japanese_school', unitCode: unit.code },
  );

  return NextResponse.json({ completed: garden.japanese_units, alreadyDone: false, gemGranted });
}
