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
// Tuned so "normal" targets 1st-into-2nd grade material by default
// (rather than kindergarten), since the typical user is a 1st-2nd
// grader. "easier" stays in the K / early-1st range.
const CHALLENGE_OFFSET: Record<string, number> = {
  easier: -150,
  normal: 150,
  harder: 300,
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
  const excludeSet = new Set((alreadyAttempted ?? []).map(r => r.item_id));

  // Fetch a healthy pool of candidates and filter / randomize in JS.
  // Doing the exclusion server-side via PostgREST's `not.in.(uuid,…)`
  // syntax has been unreliable for UUID arrays — items the learner
  // just attempted were sometimes returned again. Filtering client-
  // side is bulletproof. We also need randomization among tied
  // usage_counts: right after a (re)seed, every item has
  // usage_count=0 and PostgreSQL's tie-break is by physical row order,
  // which means the same item keeps getting picked first.
  const CANDIDATE_POOL = 50;

  const { data: candidates } = await db.from('item')
    .select('id, type, content, answer, difficulty_elo, audio_url, usage_count')
    .eq('skill_id', skill.id)
    .not('approved_at', 'is', null)
    .gte('difficulty_elo', band.min)
    .lte('difficulty_elo', band.stretchMax)
    .order('usage_count', { ascending: true })
    .limit(CANDIDATE_POOL);

  const eligible = (candidates ?? []).filter(c => !excludeSet.has(c.id));

  let picked: typeof eligible[number] | undefined;
  if (eligible.length > 0) {
    // Among the lowest usage_count, pick at random to break ties.
    const minUsage = eligible[0].usage_count ?? 0;
    const leastUsed = eligible.filter(c => (c.usage_count ?? 0) === minUsage);
    picked = leastUsed[Math.floor(Math.random() * leastUsed.length)];
  }

  if (!picked) {
    // No in-band items left for this skill+session. Try the same
    // pool without the band constraint, still excluding session
    // attempts and still randomizing among least-used.
    const { data: fallback } = await db
      .from('item')
      .select('id, type, content, answer, difficulty_elo, audio_url, usage_count')
      .eq('skill_id', skill.id)
      .not('approved_at', 'is', null)
      .order('usage_count', { ascending: true })
      .limit(CANDIDATE_POOL);
    const eligibleFallback = (fallback ?? []).filter(c => !excludeSet.has(c.id));
    if (eligibleFallback.length === 0) {
      return NextResponse.json({ ended: true, learnerId: session.learner_id });
    }
    const minUsage = eligibleFallback[0].usage_count ?? 0;
    const leastUsed = eligibleFallback.filter(c => (c.usage_count ?? 0) === minUsage);
    picked = leastUsed[Math.floor(Math.random() * leastUsed.length)];
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
