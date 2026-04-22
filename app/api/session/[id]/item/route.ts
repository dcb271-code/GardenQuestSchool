import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { chooseDifficultyBand } from '@/lib/engine';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = createServiceClient();

  const { data: session, error: sErr } = await db
    .from('session').select('*').eq('id', params.id).single();
  if (sErr || !session) return NextResponse.json({ error: 'session not found' }, { status: 404 });
  if (session.ended_at) return NextResponse.json({ error: 'session ended' }, { status: 400 });
  if ((session.items_attempted ?? 0) >= 8) {
    return NextResponse.json({ ended: true });
  }

  const { data: skill } = await db
    .from('skill').select('id, code').eq('code', session.skill_planned).single();
  if (!skill) return NextResponse.json({ error: 'skill missing' }, { status: 500 });

  const { data: progress } = await db
    .from('skill_progress')
    .select('student_elo')
    .eq('learner_id', session.learner_id)
    .eq('skill_id', skill.id)
    .maybeSingle();

  const studentElo = progress?.student_elo ?? 1000;
  const band = chooseDifficultyBand(studentElo);

  const { data: alreadyAttempted } = await db
    .from('attempt').select('item_id').eq('session_id', params.id);
  const excludeIds = (alreadyAttempted ?? []).map(r => r.item_id);

  let q = db.from('item')
    .select('id, type, content, answer, difficulty_elo, audio_url')
    .eq('skill_id', skill.id)
    .not('approved_at', 'is', null)
    .gte('difficulty_elo', band.min)
    .lte('difficulty_elo', band.stretchMax)
    .order('usage_count', { ascending: true })
    .limit(1);
  if (excludeIds.length) q = q.not('id', 'in', `(${excludeIds.join(',')})`);

  const { data: items } = await q;
  if (!items || items.length === 0) {
    const { data: fallback } = await db
      .from('item')
      .select('id, type, content, answer, difficulty_elo, audio_url')
      .eq('skill_id', skill.id)
      .not('approved_at', 'is', null)
      .limit(1);
    if (!fallback || fallback.length === 0) {
      return NextResponse.json({ ended: true });
    }
    return NextResponse.json({
      itemId: fallback[0].id,
      type: fallback[0].type,
      content: fallback[0].content,
      audioUrl: fallback[0].audio_url,
    });
  }

  const item = items[0];
  return NextResponse.json({
    itemId: item.id,
    type: item.type,
    content: item.content,
    audioUrl: item.audio_url,
  });
}
