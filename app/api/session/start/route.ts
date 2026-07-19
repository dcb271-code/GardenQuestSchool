import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { FOCUS_SKILL_PREFIX, sessionEarnsRewards } from '@/lib/engine';

const Body = z.object({
  learnerId: z.string().min(1),
  // Exactly one of these: a single skill (exploration) or a subject
  // for a focused mixed-review session ("just practice Reading").
  skillCode: z.string().min(1).optional(),
  focusSubject: z.string().min(1).optional(),
}).refine(b => !!b.skillCode !== !!b.focusSubject, {
  message: 'provide exactly one of skillCode or focusSubject',
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  if (body.focusSubject) {
    const { data: subject } = await db
      .from('subject').select('code').eq('code', body.focusSubject)
      .eq('active', true).single();
    if (!subject) return NextResponse.json({ error: 'subject not found' }, { status: 404 });

    const { data: session, error: sErr } = await db
      .from('session')
      .insert({
        learner_id: body.learnerId,
        mode: 'focus',
        subject_planned: subject.code,
        skill_planned: `${FOCUS_SKILL_PREFIX}${subject.code}`,
        // Focus sessions serve due reviews and weak skills first —
        // always real work.
        earns_rewards: true,
      })
      .select('id')
      .single();
    if (sErr || !session) return NextResponse.json({ error: sErr?.message }, { status: 500 });
    return NextResponse.json({ sessionId: session.id });
  }

  const { data: skill, error: skErr } = await db
    .from('skill').select('id, code').eq('code', body.skillCode!).single();
  if (skErr || !skill) return NextResponse.json({ error: 'skill not found' }, { status: 404 });

  const { data: strand } = await db
    .from('skill')
    .select('strand:strand_id(subject:subject_id(code))')
    .eq('code', body.skillCode!)
    .single();
  const subjectCode = (strand as any)?.strand?.subject?.code ?? 'math';

  const { data: prog } = await db
    .from('skill_progress')
    .select('mastery_state, next_review_at')
    .eq('learner_id', body.learnerId)
    .eq('skill_id', skill.id)
    .maybeSingle();
  const earnsRewards = sessionEarnsRewards(
    prog
      ? {
          masteryState: prog.mastery_state,
          nextReviewAt: prog.next_review_at ? new Date(prog.next_review_at) : null,
        }
      : null,
  );

  const { data: session, error: sErr } = await db
    .from('session')
    .insert({
      learner_id: body.learnerId,
      mode: 'expedition',
      subject_planned: subjectCode,
      skill_planned: body.skillCode!,
      earns_rewards: earnsRewards,
    })
    .select('id')
    .single();
  if (sErr || !session) return NextResponse.json({ error: sErr?.message }, { status: 500 });

  return NextResponse.json({ sessionId: session.id });
}
