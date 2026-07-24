import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { detectVirtuesFromSession } from '@/lib/engine/virtueDetector';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';
import { computeNarratorMomentsFromSession } from '@/lib/engine/narrator';
import { pickArrivalForSession } from '@/lib/world/arrivals';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

// Min correct answers in a session to "earn" a creature arrival. Anything
// less feels like a brief tap-around, not engaged practice.
const ARRIVAL_THRESHOLD_CORRECT = 3;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  reason: z.enum(['completed', 'user_stopped', 'soft_timeout']).default('completed'),
  journalTaps: z.number().int().nonnegative().default(0),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = Body.parse(await req.json().catch(() => ({})));
  const db = createServiceClient();

  const { data: session } = await db
    .from('session').update({
      ended_at: new Date().toISOString(),
      ended_reason: body.reason,
    })
    .eq('id', params.id)
    .select('learner_id, items_attempted, items_correct, started_at, earns_rewards, skill_planned')
    .single();

  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  const { data: attemptRows } = await db
    .from('attempt')
    .select('item_id, outcome, retry_count, item:item_id(difficulty_elo, skill:skill_id(code))')
    .eq('session_id', params.id);

  const attempts = (attemptRows ?? []).map((a: any) => ({
    itemId: a.item_id,
    outcome: a.outcome,
    retryCount: a.retry_count ?? 0,
    skillCode: a.item?.skill?.code ?? '',
  }));

  const { data: skillProgress } = await db
    .from('skill_progress')
    .select('skill:skill_id(code), state_transitions, last_attempted_at')
    .eq('learner_id', session.learner_id);

  const sessionStart = new Date(session.started_at);
  const transitions: Array<{ skillCode: string; from: any; to: any }> = [];
  for (const sp of skillProgress ?? []) {
    const st = ((sp as any).state_transitions ?? []) as Array<{ at: string; from: string; to: string }>;
    for (const entry of st) {
      if (new Date(entry.at).getTime() >= sessionStart.getTime()) {
        transitions.push({
          skillCode: (sp as any).skill.code,
          from: entry.from,
          to: entry.to,
        });
      }
    }
  }

  // Courage/noticing inputs: the planned skill's state at session
  // start (earliest transition's `from` for it this session, else its
  // current state) and how far above the learner the items sat.
  let plannedSkillStateAtStart: any = undefined;
  let avgItemEloGap: number | undefined = undefined;
  if (session.skill_planned && !session.skill_planned.startsWith('focus.')) {
    const plannedTransition = transitions.find(t => t.skillCode === session.skill_planned);
    if (plannedTransition) {
      plannedSkillStateAtStart = plannedTransition.from;
    } else {
      const { data: plannedProg } = await db
        .from('skill_progress')
        .select('mastery_state, student_elo, skill:skill_id!inner(code)')
        .eq('learner_id', session.learner_id)
        .eq('skill.code', session.skill_planned)
        .maybeSingle();
      plannedSkillStateAtStart = plannedProg?.mastery_state ?? 'new';
    }
    const { data: eloProg } = await db
      .from('skill_progress')
      .select('student_elo, skill:skill_id!inner(code)')
      .eq('learner_id', session.learner_id)
      .eq('skill.code', session.skill_planned)
      .maybeSingle();
    const itemElos = (attemptRows ?? [])
      .map((a: any) => a.item?.difficulty_elo)
      .filter((e: any): e is number => typeof e === 'number');
    if (eloProg?.student_elo && itemElos.length > 0) {
      const avgItemElo = itemElos.reduce((s: number, e: number) => s + e, 0) / itemElos.length;
      avgItemEloGap = Math.round(avgItemElo - eloProg.student_elo);
    }
  }

  const detectedGems = detectVirtuesFromSession({
    sessionId: params.id,
    learnerId: session.learner_id,
    attempts,
    masteryTransitions: transitions as any,
    journalTaps: body.journalTaps,
    plannedSkillStateAtStart,
    avgItemEloGap,
  });

  // Route through grantVirtueGem so per-day caps apply uniformly.
  const grantedGems: typeof detectedGems = [];
  for (const g of detectedGems) {
    const granted = await grantVirtueGem(
      db, session.learner_id, g.virtue,
      (g.evidence as any).narrativeText ?? '',
      g.evidence as any,
    );
    if (granted) grantedGems.push(g);
  }

  const narratorMoments = computeNarratorMomentsFromSession({
    masteryTransitions: transitions as any,
    attempts,
  });

  const observations: string[] = [];
  const correctCount = attempts.filter(a => a.outcome === 'correct').length;
  const persistentCount = attempts.filter(a => a.retryCount >= 2 && a.outcome === 'correct').length;

  if (correctCount > 0) {
    observations.push(`You solved ${correctCount} question${correctCount === 1 ? '' : 's'} today.`);
  }
  if (persistentCount > 0) {
    observations.push(`${persistentCount} time${persistentCount === 1 ? '' : 's'} you came back to a question until it clicked.`);
  }
  if (observations.length === 0) {
    observations.push('You explored.');
  }

  // ── Earned arrival ─────────────────────────────────────────────────
  // If this was a real session (≥ ARRIVAL_THRESHOLD_CORRECT correct),
  // pick a creature themed to the skills they practiced and queue it
  // in world_state. The garden will show it on the next visit.
  // Comfort replays of mastered, not-yet-due skills (earns_rewards =
  // false, decided at session start) never pay out — otherwise farming
  // the easiest structure is the best creature strategy. Null = session
  // predates the flag; treat as earning.
  let queuedArrivalCode: string | null = null;
  if (session.earns_rewards !== false && correctCount >= ARRIVAL_THRESHOLD_CORRECT) {
    // Habitats they currently have placed
    const { data: placedRows } = await db
      .from('habitat')
      .select('habitat_type:habitat_type_id(code)')
      .eq('learner_id', session.learner_id);
    const placedCodes = (placedRows ?? [])
      .map((r: any) => r.habitat_type?.code)
      .filter(Boolean) as string[];

    // Species already discovered
    const { data: journalRows } = await db
      .from('journal_entry')
      .select('species:species_id(code)')
      .eq('learner_id', session.learner_id);
    const unlockedCodes = (journalRows ?? [])
      .map((r: any) => r.species?.code)
      .filter(Boolean) as string[];

    const practicedSkillCodes = Array.from(new Set(attempts.map(a => a.skillCode).filter(Boolean)));

    // Researcher badges gate the rare visitors (Level-3+ science quests).
    const { data: existingState } = await db
      .from('world_state')
      .select('garden')
      .eq('learner_id', session.learner_id)
      .maybeSingle();
    const existingGarden = (existingState?.garden as Record<string, any>) ?? {};
    const researcherBadgeCodes: string[] = Array.isArray(existingGarden.researcher_badges)
      ? existingGarden.researcher_badges
      : [];

    const arrival = pickArrivalForSession({
      placedHabitatCodes: placedCodes,
      alreadyUnlockedSpeciesCodes: unlockedCodes,
      practicedSkillCodes,
      speciesCatalog: SPECIES_CATALOG,
      researcherBadgeCodes,
      rngSeed: new Date(session.started_at).getTime(),
    });

    if (arrival) {
      // Stash on world_state.garden so the garden picks it up next visit.
      const garden = existingGarden;
      garden.pendingArrivalSpeciesCode = arrival.code;
      await db.from('world_state').upsert(
        { learner_id: session.learner_id, garden, last_updated_at: new Date().toISOString() },
        { onConflict: 'learner_id' },
      );
      queuedArrivalCode = arrival.code;
    }
  }

  return NextResponse.json({
    itemsAttempted: session.items_attempted,
    itemsCorrect: session.items_correct,
    observations,
    gems: grantedGems,
    narratorMoments,
    queuedArrivalCode,
  });
}
