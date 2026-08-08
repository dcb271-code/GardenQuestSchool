// app/(child)/garden/math-mountain/page.tsx
//
// Math Mountain server component — mirrors the central garden's data
// fetching pattern. Computes per-structure unlock state for every
// math-mountain structure, then hands off to MathMountainScene.

import { correctCountsBySkill } from '@/lib/world/cumulativeProgress';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { MATH_MOUNTAIN_STRUCTURES, MATH_MOUNTAIN_CLUSTERS } from '@/lib/world/branchMaps';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import MathMountainScene from './MathMountainScene';

export const dynamic = 'force-dynamic';

export interface MathMountainStructureState {
  unlocked: boolean;
  completed: boolean;
  correctCount: number;
  target: number;
  prereqDisplay: string;
  /** Cross-session mastery — with 30 correct, earns the "fully done" nudge. */
  mastered: boolean;
}

export default async function MathMountainPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
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
      .map((p: any) => p.skill.code),
  );

  const correctByCode = await correctCountsBySkill(db, learnerId);

/**
 * Crystal Cavern's gate, using the SAME rule as every other habitat:
 * the prereq is met if it is mastered OR she has 20+ lifetime correct
 * answers at it.
 *
 * It used to check mastery alone, and that was a real bug she reported
 * herself: "I wont to know way crystal cavern is locked". Mastery
 * DECAYS — `math.multiply.facts_to_10` slipped from mastered back to
 * learning two days after she first walked in, and the mountain shut a
 * door she had already been through. A correct-count is monotonic, so
 * a place she has earned stays earned.
 */

  const skillNameByCode = new Map(MATH_SKILLS.map(s => [s.code, s.name]));

  const structureStates: Record<string, MathMountainStructureState> = {};
  for (const s of MATH_MOUNTAIN_STRUCTURES) {
    if (!s.skillCode) continue;
    const skill = MATH_SKILLS.find(x => x.code === s.skillCode);
    const correctCount = correctByCode.get(s.skillCode) ?? 0;
    const completed = mastered.has(s.skillCode) || correctCount >= ZONE_COMPLETION_TARGET;
    // A structure is unlocked when its skill's prereqs are all mastered.
    const unmetPrereqs = skill
      ? skill.prereqSkillCodes.filter(c => !mastered.has(c))
      : [];
    const unlocked = unmetPrereqs.length === 0;
    structureStates[s.code] = {
      unlocked,
      completed,
      correctCount,
      mastered: mastered.has(s.skillCode),
      target: ZONE_COMPLETION_TARGET,
      prereqDisplay: unlocked
        ? ''
        : `Finish ${unmetPrereqs.map(c => skillNameByCode.get(c) ?? c).join(', ')} first`,
    };
  }

  const CAVERN_PREREQ = 'math.multiply.facts_to_10';
  const CAVERN_UNLOCK_CORRECT = 20;
  const cavernUnlocked =
    mastered.has(CAVERN_PREREQ) ||
    (correctByCode.get(CAVERN_PREREQ) ?? 0) >= CAVERN_UNLOCK_CORRECT;

  return (
    <MathMountainScene
      learnerId={learnerId}
      structures={MATH_MOUNTAIN_STRUCTURES}
      clusters={MATH_MOUNTAIN_CLUSTERS}
      structureStates={structureStates}
      masteredCodes={Array.from(mastered)}
      cavernUnlocked={cavernUnlocked}
    />
  );
}
