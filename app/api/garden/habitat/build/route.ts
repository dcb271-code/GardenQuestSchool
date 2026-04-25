import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  habitatCode: z.string().min(1),
});

/**
 * Marks a habitat as BUILT for a learner — i.e. records that the
 * ecological mini-lesson was completed. Inserts a `habitat` row at
 * the structure's map position. Idempotent: re-completing does
 * nothing.
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  // Verify the habitat exists in the catalog
  const habitat = HABITAT_CATALOG.find(h => h.code === body.habitatCode);
  if (!habitat) {
    return NextResponse.json({ error: 'unknown habitat' }, { status: 400 });
  }

  // Verify the learner has met the skill prereqs (server-side check)
  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', body.learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill?.code)
      .filter(Boolean),
  );
  const prereqsMet = habitat.prereqSkillCodes.every(c => mastered.has(c));
  if (!prereqsMet) {
    return NextResponse.json({ error: 'skill prereqs not met' }, { status: 403 });
  }

  // Find the map structure for this habitat to get its position
  const struct = GARDEN_STRUCTURES.find(
    s => s.kind === 'habitat' && s.habitatCode === body.habitatCode,
  );
  if (!struct) {
    return NextResponse.json({ error: 'no map placement for habitat' }, { status: 404 });
  }

  // Look up habitat_type id
  const { data: ht } = await db
    .from('habitat_type')
    .select('id')
    .eq('code', body.habitatCode)
    .single();
  if (!ht) {
    return NextResponse.json({ error: 'habitat_type row missing — re-seed' }, { status: 500 });
  }

  // Already built? (idempotent)
  const { data: existing } = await db
    .from('habitat')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('habitat_type_id', ht.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ built: true, alreadyBuilt: true, habitatId: existing.id });
  }

  // Build it
  const { data: inserted, error } = await db
    .from('habitat')
    .insert({
      learner_id: body.learnerId,
      habitat_type_id: ht.id,
      position: { x: struct.x, y: struct.y },
    })
    .select('id')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ built: true, alreadyBuilt: false, habitatId: inserted.id });
}
