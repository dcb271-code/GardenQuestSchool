import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateExpeditionCandidates } from '@/lib/engine';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getThemeHeader as getMathThemeHeader } from '@/lib/packs/math/themes';
import { getReadingThemeHeader } from '@/lib/packs/reading/themes';

function getThemeHeader(skillCode: string) {
  if (skillCode.startsWith('math.')) return getMathThemeHeader(skillCode);
  if (skillCode.startsWith('reading.')) return getReadingThemeHeader(skillCode);
  return { title: skillCode, themeEmoji: '🌿', skillHint: '' };
}
import type { SkillDefinition, SkillProgressRow } from '@/lib/engine/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();

  const { data: skillRows, error: sErr } = await db
    .from('skill')
    .select('code, name, level, prereq_skill_codes, curriculum_refs, theme_tags, sort_order, strand!inner(code)');
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const skills: SkillDefinition[] = (skillRows ?? []).map((r: any) => ({
    code: r.code,
    name: r.name,
    strandCode: r.strand.code,
    level: Number(r.level ?? 0.5),
    prereqSkillCodes: r.prereq_skill_codes ?? [],
    curriculumRefs: r.curriculum_refs ?? {},
    themeTags: r.theme_tags ?? [],
    sortOrder: r.sort_order ?? 0,
  }));

  const { data: progressRows } = await db
    .from('skill_progress')
    .select('skill_id, mastery_state, leitner_box, student_elo, streak_correct, total_attempts, total_correct, last_attempted_at, next_review_at, skill:skill_id(code)')
    .eq('learner_id', learnerId);

  const progress: SkillProgressRow[] = (progressRows ?? []).map((r: any) => ({
    learnerId,
    skillId: r.skill_id,
    skillCode: r.skill.code,
    masteryState: r.mastery_state,
    leitnerBox: r.leitner_box,
    studentElo: r.student_elo,
    streakCorrect: r.streak_correct,
    totalAttempts: r.total_attempts,
    totalCorrect: r.total_correct,
    lastAttemptedAt: r.last_attempted_at ? new Date(r.last_attempted_at) : null,
    nextReviewAt: r.next_review_at ? new Date(r.next_review_at) : null,
  }));

  const candidates = generateExpeditionCandidates({
    skills,
    progress,
    getThemeHeader,
    interestTagDecay: [],
  });

  // Cumulative correct attempts per skill — drives the x/n badge so the
  // compass cards show the SAME progress as their twin garden structures.
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

  // Enrich each candidate with its garden structure (label, zone) and
  // its real progress so the compass and the garden agree.
  const enriched = candidates.map(c => {
    const struct = GARDEN_STRUCTURES.find(s => s.kind === 'skill' && s.skillCode === c.skillCode);
    const correctCount = correctByCode.get(c.skillCode) ?? 0;
    return {
      ...c,
      structureCode: struct?.code ?? null,
      structureLabel: struct?.label ?? c.skillName,
      zone: struct?.zone ?? 'meadow',
      correctCount,
      target: ZONE_COMPLETION_TARGET,
      completed: correctCount >= ZONE_COMPLETION_TARGET,
    };
  });

  return NextResponse.json({ candidates: enriched });
}
