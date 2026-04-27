// app/(child)/garden/reading-forest/page.tsx
//
// Reading Forest server component — mirrors Math Mountain. Same data-
// fetch pattern, different skill catalog and structure list.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { READING_FOREST_STRUCTURES, READING_FOREST_CLUSTERS } from '@/lib/world/branchMaps';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import ReadingForestScene from './ReadingForestScene';

export const dynamic = 'force-dynamic';

export interface ReadingForestStructureState {
  unlocked: boolean;
  completed: boolean;
  correctCount: number;
  target: number;
  prereqDisplay: string;
}

export default async function ReadingForestPage({
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

  const skillNameByCode = new Map(READING_SKILLS.map(s => [s.code, s.name]));

  const structureStates: Record<string, ReadingForestStructureState> = {};
  for (const s of READING_FOREST_STRUCTURES) {
    if (!s.skillCode) continue;
    const skill = READING_SKILLS.find(x => x.code === s.skillCode);
    const correctCount = correctByCode.get(s.skillCode) ?? 0;
    const completed = mastered.has(s.skillCode) || correctCount >= ZONE_COMPLETION_TARGET;
    const unmetPrereqs = skill
      ? skill.prereqSkillCodes.filter(c => !mastered.has(c))
      : [];
    const unlocked = unmetPrereqs.length === 0;
    structureStates[s.code] = {
      unlocked,
      completed,
      correctCount,
      target: ZONE_COMPLETION_TARGET,
      prereqDisplay: unlocked
        ? ''
        : `Finish ${unmetPrereqs.map(c => skillNameByCode.get(c) ?? c).join(', ')} first`,
    };
  }

  return (
    <ReadingForestScene
      learnerId={learnerId}
      structures={READING_FOREST_STRUCTURES}
      clusters={READING_FOREST_CLUSTERS}
      structureStates={structureStates}
    />
  );
}
