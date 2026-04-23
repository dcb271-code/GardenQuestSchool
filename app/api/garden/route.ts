import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();

  const { data: placed } = await db
    .from('habitat')
    .select('id, position, habitat_type:habitat_type_id(code)')
    .eq('learner_id', learnerId);

  const placedHabitats = (placed ?? []).map((h: any) => ({
    id: h.id,
    code: h.habitat_type?.code,
    position: h.position,
  })).filter(h => !!h.code);

  const { data: journal } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const unlockedSpeciesCodes = (journal ?? []).map((r: any) => r.species?.code).filter(Boolean);

  const { data: worldState } = await db
    .from('world_state')
    .select('cat_companion')
    .eq('learner_id', learnerId)
    .maybeSingle();

  const luna = (worldState?.cat_companion as any) ?? null;

  return NextResponse.json({
    placedHabitats,
    unlockedSpeciesCodes,
    luna,
  });
}
