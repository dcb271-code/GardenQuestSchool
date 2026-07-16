import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import FocusClient, { type FocusSubjectCard } from './FocusClient';

export const dynamic = 'force-dynamic';

// Presentation for known subject codes. Subjects added to the DB later
// (spelling, science…) fall back to the generic leaf until they get an
// entry here.
const SUBJECT_META: Record<string, { emoji: string; hint: string }> = {
  reading: { emoji: '🌲', hint: 'words, sounds, and stories' },
  math: { emoji: '⛰️', hint: 'numbers, patterns, and puzzles' },
  spelling: { emoji: '✏️', hint: 'building words letter by letter' },
};

export default async function FocusPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: subjects } = await db
    .from('subject')
    .select('code, name')
    .eq('active', true)
    .order('code');

  // Per-subject practice stats: how many skills the learner has met,
  // and how many are due for review — powers the "N to review" chip.
  const { data: progRows } = await db
    .from('skill_progress')
    .select('mastery_state, next_review_at, skill:skill_id(strand:strand_id(subject:subject_id(code)))')
    .eq('learner_id', learnerId);

  const now = Date.now();
  const cards: FocusSubjectCard[] = (subjects ?? []).map(s => {
    const rows = (progRows ?? []).filter(
      (r: any) => r.skill?.strand?.subject?.code === s.code && r.mastery_state !== 'new',
    );
    const dueCount = rows.filter(
      (r: any) => r.next_review_at && new Date(r.next_review_at).getTime() <= now,
    ).length;
    const meta = SUBJECT_META[s.code] ?? { emoji: '🌿', hint: 'a mix of your skills' };
    return {
      code: s.code,
      name: s.name,
      emoji: meta.emoji,
      hint: meta.hint,
      practicedSkills: rows.length,
      dueCount,
    };
  });

  return <FocusClient learnerId={learnerId} subjects={cards} />;
}
