// app/(child)/garden/habitat/[code]/page.tsx
//
// Habitat interior dynamic route. Two interiors are implemented:
//   • bunny_burrow     — single themed skill stop + species
//   • operations_cave  — three skill stops (cave hosts the regrouping
//                        / fluency cluster from Math Mountain) + a
//                        sleepy resident bear

import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { hasHabitatInterior, HABITAT_INTERIORS } from '@/lib/world/habitatInteriors';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { MATH_MOUNTAIN_STRUCTURES } from '@/lib/world/branchMaps';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import BunnyBurrowInterior from './BunnyBurrowInterior';
import CaveInterior, { type CaveSkillStop } from './CaveInterior';

export const dynamic = 'force-dynamic';

// Math Mountain structure codes that live INSIDE the Operations Cave
// when the cave is treated as a routed habitat. Order = render order
// (left wall, center under lantern, right wall).
const CAVE_STOP_CODES = ['mm_hundreds_hollow', 'mm_fast_facts', 'mm_regroup_ridge'];

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

  if (code === 'bunny_burrow') {
    const { data: learnerRow } = await db
      .from('learner')
      .select('grade_level')
      .eq('id', learnerId)
      .single();
    return (
      <BunnyBurrowInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
        learnerLevel={learnerRow?.grade_level ?? 2}
      />
    );
  }

  if (code === 'operations_cave') {
    // Compute per-stop unlock + completion state for the three cave
    // skills. Same logic as math-mountain/page.tsx — kept inline here
    // rather than extracted because both call sites are short and the
    // shape varies (stop record vs. structureState record).
    const { data: progress } = await db
      .from('skill_progress')
      .select('mastery_state, skill:skill_id(code)')
      .eq('learner_id', learnerId);
    const mastered = new Set(
      (progress ?? [])
        .filter((p: any) => p.mastery_state === 'mastered')
        .map((p: any) => p.skill.code),
    );

    const { data: attemptRows } = await db
      .from('attempt')
      .select('outcome, item:item_id(skill:skill_id(code))')
      .eq('learner_id', learnerId)
      .eq('outcome', 'correct');
    const correctByCode = new Map<string, number>();
    for (const row of attemptRows ?? []) {
      const c = (row as any).item?.skill?.code;
      if (!c) continue;
      correctByCode.set(c, (correctByCode.get(c) ?? 0) + 1);
    }

    const skillNameByCode = new Map(MATH_SKILLS.map(s => [s.code, s.name]));

    const skillStops: CaveSkillStop[] = [];
    for (const stopCode of CAVE_STOP_CODES) {
      const struct = MATH_MOUNTAIN_STRUCTURES.find(s => s.code === stopCode);
      if (!struct?.skillCode) continue;
      const skill = MATH_SKILLS.find(x => x.code === struct.skillCode);
      const correctCount = correctByCode.get(struct.skillCode) ?? 0;
      const completed = mastered.has(struct.skillCode) || correctCount >= ZONE_COMPLETION_TARGET;
      const unmetPrereqs = skill
        ? skill.prereqSkillCodes.filter(c => !mastered.has(c))
        : [];
      const unlocked = unmetPrereqs.length === 0;
      const stop: CaveSkillStop = {
        code: struct.code,
        skillCode: struct.skillCode,
        label: struct.label,
        emoji: struct.themeEmoji,
        unlocked,
        completed,
        prereqDisplay: unlocked
          ? ''
          : `Finish ${unmetPrereqs.map(c => skillNameByCode.get(c) ?? c).join(', ')} first`,
      };
      if (struct.subLabel) stop.subLabel = struct.subLabel;
      skillStops.push(stop);
    }

    return (
      <CaveInterior
        learnerId={learnerId}
        skillStops={skillStops}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
      />
    );
  }

  notFound();
}
