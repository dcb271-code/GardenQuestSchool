import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Body = z.object({
  learnerId: z.string().uuid(),
  skillCode: z.string(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: skill, error: skErr } = await db
    .from('skill').select('id, code').eq('code', body.skillCode).single();
  if (skErr || !skill) return NextResponse.json({ error: 'skill not found' }, { status: 404 });

  const { data: strand } = await db
    .from('skill')
    .select('strand:strand_id(subject:subject_id(code))')
    .eq('code', body.skillCode)
    .single();
  const subjectCode = (strand as any)?.strand?.subject?.code ?? 'math';

  const { data: session, error: sErr } = await db
    .from('session')
    .insert({
      learner_id: body.learnerId,
      mode: 'expedition',
      subject_planned: subjectCode,
      skill_planned: body.skillCode,
    })
    .select('id')
    .single();
  if (sErr || !session) return NextResponse.json({ error: sErr?.message }, { status: 500 });

  return NextResponse.json({ sessionId: session.id });
}
