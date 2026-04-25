import { createServiceClient } from '@/lib/supabase/server';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { computeStructureProgress, ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import GardenScene from './GardenScene';

export const dynamic = 'force-dynamic';

export interface StructureState {
  unlocked: boolean;
  completed: boolean;
  isNext: boolean;
  correctCount: number;
  target: number;
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

  const { data: learner } = await db
    .from('learner')
    .select('first_name')
    .eq('id', learnerId)
    .single();
  const firstName = learner?.first_name ?? null;

  // Existing skill-progress query (we still use mastery for habitat gating)
  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code)
  );

  // Cumulative correct attempts per skill, joined via item → skill.
  const { data: attemptRows } = await db
    .from('attempt')
    .select('outcome, item:item_id(skill:skill_id(code))')
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct');
  const correctByCode = new Map<string, number>();
  for (const row of attemptRows ?? []) {
    const code = (row as any).item?.skill?.code;
    if (!code) continue;
    correctByCode.set(code, (correctByCode.get(code) ?? 0) + 1);
  }

  const allSkills = [...MATH_SKILLS, ...READING_SKILLS];
  const skillNameByCode = new Map(allSkills.map(s => [s.code, s.name]));

  // Build skill structure progress via zone rules
  const prereqFallback = (structureCode: string) => {
    const struct = GARDEN_STRUCTURES.find(s => s.code === structureCode);
    if (!struct || !struct.skillCode) return 'more practice';
    const skill = allSkills.find(s => s.code === struct.skillCode);
    const unmet = skill
      ? skill.prereqSkillCodes.filter(c => !mastered.has(c)).map(c => skillNameByCode.get(c) ?? c)
      : [];
    return unmet.length > 0 ? unmet.join(', ') : 'more practice';
  };
  const skillProgress = computeStructureProgress(
    GARDEN_STRUCTURES,
    correctByCode,
    prereqFallback,
  );

  // Habitats: unlock by prereq_skill_codes (mastery), no x/n count
  const structureStates: Record<string, StructureState> = {};
  for (const s of GARDEN_STRUCTURES) {
    if (s.kind === 'skill') {
      const p = skillProgress[s.code];
      structureStates[s.code] = {
        unlocked: p?.unlocked ?? false,
        completed: p?.completed ?? false,
        isNext: p?.isNext ?? false,
        correctCount: p?.correctCount ?? 0,
        target: p?.target ?? ZONE_COMPLETION_TARGET,
        prereqDisplay: p?.prereqDisplay ?? '',
      };
    } else if (s.kind === 'habitat' && s.habitatCode) {
      const habitat = HABITAT_CATALOG.find(h => h.code === s.habitatCode);
      const prereqsMet = habitat ? habitat.prereqSkillCodes.every(c => mastered.has(c)) : false;
      const prereqNames = habitat
        ? habitat.prereqSkillCodes.filter(c => !mastered.has(c)).map(c => skillNameByCode.get(c) ?? c)
        : [];
      structureStates[s.code] = {
        unlocked: prereqsMet,
        completed: false,
        isNext: false,
        correctCount: 0,
        target: 0,
        prereqDisplay: prereqNames.length > 0 ? prereqNames.join(', ') : 'more practice',
      };
    }
  }

  // Auto-place unlocked habitats (for arrival detection)
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

  // Pending arrival is now session-earned, not auto-computed. The
  // session-end API writes a species code into world_state.garden when
  // the learner completes ≥3 correct in a session. We just read it
  // here; the welcome modal will clear it on dismiss.
  const { data: worldStateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  const pendingCode = (worldStateRow?.garden as Record<string, any> | null)
    ?.pendingArrivalSpeciesCode as string | undefined;
  const pendingArrival = pendingCode
    ? SPECIES_CATALOG.find(s => s.code === pendingCode) ?? null
    : null;

  return (
    <GardenScene
      learnerId={learnerId}
      firstName={firstName}
      structureStates={structureStates}
      pendingArrival={pendingArrival}
    />
  );
}
