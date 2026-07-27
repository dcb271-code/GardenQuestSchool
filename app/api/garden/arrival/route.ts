import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { SPECIES_CATALOG, type SpeciesData } from '@/lib/world/speciesCatalog';
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

  // Researcher badges gate the rare visitors, and they live in
  // world_state.garden. Leaving them out here was a real bug: the
  // session-end route queues an arrival WITH badges, so it can queue a
  // painted turtle — and then this route re-validated WITHOUT them,
  // decided the turtle was ineligible, returned 400, and never reached
  // clearPendingArrival. The pending code stayed in world_state and the
  // arrival card fired again on every single visit to the garden.
  //
  // These two must agree. See the invariant in tests/world/arrivals.test.ts.
  const { data: stateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', body.learnerId)
    .maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const researcherBadgeCodes: string[] = Array.isArray(garden.researcher_badges)
    ? garden.researcher_badges
    : [];

  const eligible = computeEligibleSpecies(placedCodes, SPECIES_CATALOG, researcherBadgeCodes);
  const target = eligible.find(s => s.code === body.speciesCode);
  if (!target) return NextResponse.json({ error: 'species not eligible' }, { status: 400 });

  const speciesId = await ensureSpeciesRow(db, target);
  if (!speciesId) return NextResponse.json({ error: 'species row missing' }, { status: 500 });

  // Already unlocked?
  const { data: existing } = await db
    .from('journal_entry')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('species_id', speciesId)
    .maybeSingle();
  if (existing) {
    await clearPendingArrival(db, body.learnerId, body.speciesCode);
    return NextResponse.json({ arrived: target, journalEntryId: existing.id, alreadyUnlocked: true });
  }

  const { data: inserted, error } = await db.from('journal_entry').insert({
    learner_id: body.learnerId,
    species_id: speciesId,
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await clearPendingArrival(db, body.learnerId, body.speciesCode);

  return NextResponse.json({ arrived: target, journalEntryId: inserted.id });
}

/**
 * Get the species row id, creating the row from the catalog if it is
 * missing.
 *
 * Almost every catalog in this codebase is pure config — add an entry
 * and it works. `species` is one of the two exceptions, because
 * journal_entry carries a foreign key to it, so a new species needs a
 * real row before anyone can discover it.
 *
 * That exception cost Cecily a week of a turtle arriving over and over.
 * The three rare visitors were added to SPECIES_CATALOG and nobody
 * re-ran the world seed, so this route looked up a row that did not
 * exist, 500'd, and never cleared the pending arrival.
 *
 * Healing it here rather than only fixing the data means adding a
 * species to the catalog can never again strand a child in that loop.
 * SPECIES_CATALOG is the source of truth; the table is a projection of
 * it. Still run `npm run db:seed` — this is a safety net, not the
 * mechanism.
 */
async function ensureSpeciesRow(db: any, species: SpeciesData): Promise<string | null> {
  const { data: existing } = await db
    .from('species').select('id').eq('code', species.code).maybeSingle();
  if (existing?.id) return existing.id;

  console.warn(`[arrival] species row missing for ${species.code} — creating from catalog`);
  const { data: created, error } = await db.from('species').upsert({
    code: species.code,
    common_name: species.commonName,
    scientific_name: species.scientificName,
    description: species.description,
    fun_fact: species.funFact,
    illustration_key: species.illustrationKey,
    habitat_req_codes: species.habitatReqCodes,
  }, { onConflict: 'code' }).select('id').single();
  if (error) {
    console.error(`[arrival] could not create species ${species.code}: ${error.message}`);
    return null;
  }
  return created?.id ?? null;
}

// Helper: remove the queued arrival species from world_state so the
// welcome modal doesn't fire again on the next garden visit.
async function clearPendingArrival(db: any, learnerId: string, speciesCode: string) {
  const { data: existingState } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  if (existingState?.garden) {
    const garden = { ...(existingState.garden as Record<string, any>) };
    if (garden.pendingArrivalSpeciesCode === speciesCode) {
      delete garden.pendingArrivalSpeciesCode;
      await db.from('world_state')
        .update({ garden, last_updated_at: new Date().toISOString() })
        .eq('learner_id', learnerId);
    }
  }
}
