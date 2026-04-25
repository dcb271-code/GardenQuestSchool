import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { chooseDifficultyBand } from '@/lib/engine';
import { getThemeHeader as getMathThemeHeader } from '@/lib/packs/math/themes';
import { getReadingThemeHeader } from '@/lib/packs/reading/themes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SESSION_ITEM_CAP = 5;

function getThemeHeader(skillCode: string) {
  if (skillCode.startsWith('math.')) return getMathThemeHeader(skillCode);
  if (skillCode.startsWith('reading.')) return getReadingThemeHeader(skillCode);
  return { title: skillCode, themeEmoji: '🌿', skillHint: '' };
}

// Elo offsets must mirror lib/settings/useAccessibilitySettings.ts.
const CHALLENGE_OFFSET: Record<string, number> = {
  easier: -120,
  normal: 0,
  harder: 150,
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const db = createServiceClient();
  const url = new URL(req.url);
  const level = url.searchParams.get('challenge') ?? 'normal';
  const eloOffset = CHALLENGE_OFFSET[level] ?? 0;

  const { data: session, error: sErr } = await db
    .from('session').select('*').eq('id', params.id).single();
  if (sErr || !session) return NextResponse.json({ error: 'session not found' }, { status: 404 });
  if (session.ended_at) return NextResponse.json({ error: 'session ended' }, { status: 400 });
  if ((session.items_attempted ?? 0) >= SESSION_ITEM_CAP) {
    return NextResponse.json({ ended: true, learnerId: session.learner_id });
  }

  const theme = getThemeHeader(session.skill_planned);

  const { data: skill } = await db
    .from('skill').select('id, code').eq('code', session.skill_planned).single();
  if (!skill) return NextResponse.json({ error: 'skill missing' }, { status: 500 });

  const { data: progress } = await db
    .from('skill_progress')
    .select('student_elo')
    .eq('learner_id', session.learner_id)
    .eq('skill_id', skill.id)
    .maybeSingle();

  // Apply the learner's challenge-level preference on top of their
  // adaptive Elo so "easier" / "harder" actually shifts the band.
  const studentElo = (progress?.student_elo ?? 1000) + eloOffset;
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
  let picked = items?.[0];

  if (!picked) {
    const { data: fallback } = await db
      .from('item')
      .select('id, type, content, answer, difficulty_elo, audio_url')
      .eq('skill_id', skill.id)
      .not('approved_at', 'is', null)
      .limit(1);
    if (!fallback || fallback.length === 0) {
      return NextResponse.json({ ended: true, learnerId: session.learner_id });
    }
    picked = fallback[0];
  }

  return NextResponse.json({
    itemId: picked.id,
    type: picked.type,
    content: picked.content,
    audioUrl: picked.audio_url,
    learnerId: session.learner_id,
    skillCode: session.skill_planned,
    themeTitle: theme.title,
    themeEmoji: theme.themeEmoji,
    progress: {
      attempted: session.items_attempted ?? 0,
      cap: SESSION_ITEM_CAP,
    },
  });
}
