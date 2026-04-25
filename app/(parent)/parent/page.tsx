import Link from 'next/link';
import AuthGate from '@/components/shared/AuthGate';
import { createServiceClient } from '@/lib/supabase/server';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import LearnerCard, { type LearnerSummary } from './LearnerCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TOTAL_SPECIES = SPECIES_CATALOG.length;
const TOTAL_HABITATS = HABITAT_CATALOG.length;
const TOTAL_SKILLS = MATH_SKILLS.length + READING_SKILLS.length;

export default async function ParentDashboardPage() {
  const db = createServiceClient();

  const { data: learners } = await db
    .from('learner')
    .select('id, first_name, avatar_key, created_at')
    .order('created_at', { ascending: true });

  const summaries: LearnerSummary[] = [];

  for (const l of learners ?? []) {
    // sessions
    const { data: sessions } = await db
      .from('session')
      .select('id, started_at, ended_at, items_attempted, items_correct')
      .eq('learner_id', l.id)
      .order('started_at', { ascending: false })
      .limit(50);

    const sevenDayCutoff = Date.now() - SEVEN_DAYS_MS;
    const sessionsAll = (sessions ?? []).length;
    const sessionsThisWeek = (sessions ?? []).filter(
      s => s.started_at && new Date(s.started_at).getTime() > sevenDayCutoff,
    ).length;

    // total correct attempts (for the headline number)
    const { count: correctCount } = await db
      .from('attempt')
      .select('id', { count: 'exact', head: true })
      .eq('learner_id', l.id)
      .eq('outcome', 'correct');

    // skills mastered + in-progress
    const { data: skillProgress } = await db
      .from('skill_progress')
      .select('mastery_state, skill:skill_id(code, name)')
      .eq('learner_id', l.id);
    const masteryCounts = { new: 0, learning: 0, review: 0, mastered: 0 };
    for (const sp of skillProgress ?? []) {
      const state = (sp as any).mastery_state as keyof typeof masteryCounts;
      if (state in masteryCounts) masteryCounts[state] += 1;
    }

    // habitats built
    const { count: habitatsBuilt } = await db
      .from('habitat')
      .select('id', { count: 'exact', head: true })
      .eq('learner_id', l.id);

    // species discovered
    const { count: speciesFound } = await db
      .from('journal_entry')
      .select('id', { count: 'exact', head: true })
      .eq('learner_id', l.id);

    // virtue gems
    const { data: gems } = await db
      .from('virtue_gem')
      .select('virtue, granted_at, evidence')
      .eq('learner_id', l.id)
      .order('granted_at', { ascending: false })
      .limit(10);

    // recent activity — last 5 sessions with skill name (best effort)
    const recentSessions = (sessions ?? []).slice(0, 5);

    // For each recent session, fetch the most-used skill name
    const sessionDetails: LearnerSummary['recentSessions'] = [];
    for (const s of recentSessions) {
      const { data: sessionAttempts } = await db
        .from('attempt')
        .select('item:item_id(skill:skill_id(name))')
        .eq('session_id', s.id);
      const skillTally = new Map<string, number>();
      for (const a of sessionAttempts ?? []) {
        const name = (a as any).item?.skill?.name as string | undefined;
        if (name) skillTally.set(name, (skillTally.get(name) ?? 0) + 1);
      }
      const topSkill = Array.from(skillTally.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      sessionDetails.push({
        id: s.id,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        itemsAttempted: s.items_attempted ?? 0,
        itemsCorrect: s.items_correct ?? 0,
        skillName: topSkill ?? 'mixed',
      });
    }

    summaries.push({
      id: l.id,
      firstName: l.first_name,
      avatarKey: l.avatar_key ?? 'fox',
      sessionsAll,
      sessionsThisWeek,
      correctTotal: correctCount ?? 0,
      masteryCounts,
      totalSkills: TOTAL_SKILLS,
      habitatsBuilt: habitatsBuilt ?? 0,
      totalHabitats: TOTAL_HABITATS,
      speciesFound: speciesFound ?? 0,
      totalSpecies: TOTAL_SPECIES,
      gemsTotal: (gems ?? []).length,
      gemsRecent: (gems ?? []).slice(0, 3).map(g => ({
        virtue: g.virtue,
        narrativeText: (g.evidence as any)?.narrativeText ?? '',
        grantedAt: g.granted_at,
      })),
      recentSessions: sessionDetails,
    });
  }

  return (
    <AuthGate>
      <div className="space-y-6">
        <header className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                A glance at what each learner has been working on. Tap a card for actions.
              </p>
            </div>
            <Link
              href="/parent/family"
              className="text-sm text-blue-700 hover:underline"
            >
              Manage family →
            </Link>
          </div>
        </header>

        {summaries.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-gray-600">No learners yet.</div>
            <Link
              href="/parent/family"
              className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
            >
              + Add a learner
            </Link>
          </div>
        )}

        {summaries.map(s => (
          <LearnerCard key={s.id} summary={s} />
        ))}
      </div>
    </AuthGate>
  );
}
