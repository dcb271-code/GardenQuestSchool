import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { computeEligibleSpecies } from '@/lib/world/arrivals';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  speciesCode: z.string().min(1),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  // Validate eligible
  const { data: placed } = await db
    .from('habitat')
    .select('habitat_type:habitat_type_id(code)')
    .eq('learner_id', body.learnerId);
  const placedCodes = (placed ?? []).map((h: any) => h.habitat_type?.code).filter(Boolean);

  const eligible = computeEligibleSpecies(placedCodes, SPECIES_CATALOG);
  const target = eligible.find(s => s.code === body.speciesCode);
  if (!target) return NextResponse.json({ error: 'species not eligible' }, { status: 400 });

  const { data: species } = await db.from('species').select('id').eq('code', body.speciesCode).single();
  if (!species) return NextResponse.json({ error: 'species row missing' }, { status: 500 });

  // Already unlocked?
  const { data: existing } = await db
    .from('journal_entry')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('species_id', species.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ arrived: target, journalEntryId: existing.id, alreadyUnlocked: true });
  }

  const { data: inserted, error } = await db.from('journal_entry').insert({
    learner_id: body.learnerId,
    species_id: species.id,
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ arrived: target, journalEntryId: inserted.id });
}
