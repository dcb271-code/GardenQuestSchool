// app/(child)/garden/habitat/[code]/page.tsx
//
// Habitat interior dynamic route. Currently only `bunny_burrow` is
// implemented — the spec defers other interiors to Phase 2. Returns a
// 404-style fallback for unmapped habitat codes.

import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { hasHabitatInterior, HABITAT_INTERIORS } from '@/lib/world/habitatInteriors';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import BunnyBurrowInterior from './BunnyBurrowInterior';

export const dynamic = 'force-dynamic';

export default async function HabitatInteriorPage({
  params, searchParams,
}: {
  params: { code: string };
  searchParams: { learner?: string };
}) {
  const code = params.code;
  if (!hasHabitatInterior(code)) notFound();

  const habitat = HABITAT_CATALOG.find(h => h.code === code);
  if (!habitat) notFound();

  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  // Which species belong to this habitat? Derived from the in-memory
  // SPECIES_CATALOG: any species whose habitatReqCodes array includes
  // this habitat's code.
  const allHabitatSpecies = SPECIES_CATALOG.filter(s =>
    s.habitatReqCodes.includes(code),
  );

  // Which of those has the learner discovered? Look up journal_entry rows.
  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const discoveredCodes = new Set(
    (journalRows ?? []).map((r: any) => r.species?.code).filter(Boolean),
  );

  const discoveredSpecies = allHabitatSpecies.filter(s => discoveredCodes.has(s.code));
  const undiscoveredCount = allHabitatSpecies.length - discoveredSpecies.length;

  const cfg = HABITAT_INTERIORS[code];

  // For now we only have one interior implementation — Bunny Burrow —
  // so the dispatch is hardcoded. When Phase 2 adds more, dispatch
  // becomes a switch.
  if (code === 'bunny_burrow') {
    return (
      <BunnyBurrowInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
      />
    );
  }

  notFound();
}
