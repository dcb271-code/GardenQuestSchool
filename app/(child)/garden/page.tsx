import { createServiceClient } from '@/lib/supabase/server';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { computeNewArrivals } from '@/lib/world/arrivals';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import GardenScene from './GardenScene';

export const dynamic = 'force-dynamic';

interface StructureState {
  unlocked: boolean;
  prereqDisplay: string;
}

export default async function GardenPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();

  let learnerId = searchParams.learner;
  if (!learnerId) {
    const { data: first } = await db.from('learner').select('id').limit(1).single();
    learnerId = first?.id;
  }
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code)
  );
  const inProgress = new Set(
    (progress ?? [])
      .filter((p: any) => ['learning', 'review'].includes(p.mastery_state))
      .map((p: any) => p.skill.code)
  );

  const allSkills = [...MATH_SKILLS, ...READING_SKILLS];
  const skillNameByCode = new Map(allSkills.map(s => [s.code, s.name]));
  const skillByCode = new Map(allSkills.map(s => [s.code, s]));

  const structureStates: Record<string, StructureState> = {};

  for (const s of GARDEN_STRUCTURES) {
    if (s.kind === 'skill' && s.skillCode) {
      const skill = skillByCode.get(s.skillCode);
      const prereqsMet = skill ? skill.prereqSkillCodes.every(c => mastered.has(c)) : false;
      const isMasteredAlready = mastered.has(s.skillCode);
      const unlocked = prereqsMet || isMasteredAlready || inProgress.has(s.skillCode);
      const prereqNames = skill
        ? skill.prereqSkillCodes.filter(c => !mastered.has(c)).map(c => skillNameByCode.get(c) ?? c)
        : [];
      structureStates[s.code] = {
        unlocked,
        prereqDisplay: prereqNames.length > 0 ? prereqNames.join(', ') : 'more practice',
      };
    } else if (s.kind === 'habitat' && s.habitatCode) {
      const habitat = HABITAT_CATALOG.find(h => h.code === s.habitatCode);
      const prereqsMet = habitat ? habitat.prereqSkillCodes.every(c => mastered.has(c)) : false;
      const prereqNames = habitat
        ? habitat.prereqSkillCodes.filter(c => !mastered.has(c)).map(c => skillNameByCode.get(c) ?? c)
        : [];
      structureStates[s.code] = {
        unlocked: prereqsMet,
        prereqDisplay: prereqNames.length > 0 ? prereqNames.join(', ') : 'more practice',
      };
    }
  }

  // Auto-place unlocked habitats on first visit (needed for arrival detection)
  const placedCodesList: string[] = [];
  {
    const { data: existing } = await db
      .from('habitat')
      .select('habitat_type:habitat_type_id(code)')
      .eq('learner_id', learnerId);
    const existingSet = new Set((existing ?? []).map((r: any) => r.habitat_type?.code).filter(Boolean));
    const toInsert: Array<{ learner_id: string; habitat_type_id: string; position: any }> = [];

    for (const s of GARDEN_STRUCTURES) {
      if (s.kind !== 'habitat' || !s.habitatCode) continue;
      if (!structureStates[s.code]?.unlocked) continue;
      placedCodesList.push(s.habitatCode);
      if (existingSet.has(s.habitatCode)) continue;
      const { data: ht } = await db.from('habitat_type').select('id').eq('code', s.habitatCode).single();
      if (ht) {
        toInsert.push({
          learner_id: learnerId,
          habitat_type_id: ht.id,
          position: { x: s.x, y: s.y },
        });
      }
    }
    if (toInsert.length > 0) {
      await db.from('habitat').insert(toInsert);
    }
  }

  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const unlockedCodes = (journalRows ?? []).map((r: any) => r.species?.code).filter(Boolean);

  const newArrivals = computeNewArrivals(placedCodesList, unlockedCodes, SPECIES_CATALOG);
  const pendingArrival = newArrivals.length > 0 ? newArrivals[0] : null;

  return (
    <GardenScene
      learnerId={learnerId}
      structureStates={structureStates}
      pendingArrival={pendingArrival}
    />
  );
}
