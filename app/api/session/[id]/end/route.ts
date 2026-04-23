import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { detectVirtuesFromSession } from '@/lib/engine/virtueDetector';
import { computeNarratorMomentsFromSession } from '@/lib/engine/narrator';

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
    .select('learner_id, items_attempted, items_correct, started_at')
    .single();

  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  const { data: attemptRows } = await db
    .from('attempt')
    .select('item_id, outcome, retry_count, item:item_id(skill:skill_id(code))')
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

  const detectedGems = detectVirtuesFromSession({
    sessionId: params.id,
    learnerId: session.learner_id,
    attempts,
    masteryTransitions: transitions as any,
    journalTaps: body.journalTaps,
  });

  if (detectedGems.length > 0) {
    await db.from('virtue_gem').insert(
      detectedGems.map(g => ({
        learner_id: session.learner_id,
        virtue: g.virtue,
        evidence: g.evidence,
      }))
    );
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

  return NextResponse.json({
    itemsAttempted: session.items_attempted,
    itemsCorrect: session.items_correct,
    observations,
    gems: detectedGems,
    narratorMoments,
  });
}
