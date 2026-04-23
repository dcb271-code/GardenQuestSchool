import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { isValidCell } from '@/lib/world/gardenLayout';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  habitatCode: z.string().min(1),
  position: z.object({ x: z.number().int(), y: z.number().int() }),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  if (!isValidCell(body.position)) {
    return NextResponse.json({ error: 'invalid cell' }, { status: 400 });
  }

  const catalogEntry = HABITAT_CATALOG.find(h => h.code === body.habitatCode);
  if (!catalogEntry) return NextResponse.json({ error: 'unknown habitat' }, { status: 404 });

  const db = createServiceClient();

  // Check prereqs
  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', body.learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code)
  );
  const prereqsMet = catalogEntry.prereqSkillCodes.every(c => mastered.has(c));
  if (!prereqsMet) {
    return NextResponse.json({ error: 'prerequisites not met' }, { status: 403 });
  }

  // Look up habitat_type row
  const { data: habitatType } = await db
    .from('habitat_type').select('id').eq('code', body.habitatCode).single();
  if (!habitatType) return NextResponse.json({ error: 'habitat type row missing' }, { status: 500 });

  // Already placed? (one per habitat type per learner)
  const { data: existing } = await db
    .from('habitat')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('habitat_type_id', habitatType.id);
  if ((existing ?? []).length > 0) {
    return NextResponse.json({ error: 'habitat already placed' }, { status: 409 });
  }

  // Cell occupied?
  const { data: placed } = await db
    .from('habitat')
    .select('position')
    .eq('learner_id', body.learnerId);
  const occupied = (placed ?? []).some((p: any) =>
    p.position?.x === body.position.x && p.position?.y === body.position.y
  );
  if (occupied) return NextResponse.json({ error: 'cell occupied' }, { status: 409 });

  const { data: inserted, error } = await db.from('habitat').insert({
    learner_id: body.learnerId,
    habitat_type_id: habitatType.id,
    position: body.position,
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ placed: { id: inserted.id, code: body.habitatCode, position: body.position } });
}
