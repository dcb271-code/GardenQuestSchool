import Link from 'next/link';
import HabitatCard from '@/components/child/HabitatCard';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HabitatsPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();

  let learnerId = searchParams.learner;
  if (!learnerId) {
    const { data: firstLearner } = await db.from('learner').select('id').limit(1).single();
    learnerId = firstLearner?.id;
  }

  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId!);

  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code)
  );

  const allSkills = [...MATH_SKILLS, ...READING_SKILLS];
  const nameBySkillCode = new Map(allSkills.map(s => [s.code, s.name]));

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back to profile picker"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="text-kid-lg text-center flex-1">🏠 Habitats</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <p className="text-kid-sm text-center text-bark/70">
        Each habitat attracts different creatures to your garden.
      </p>

      <div className="space-y-3">
        {HABITAT_CATALOG.map(h => {
          const prereqsMet = h.prereqSkillCodes.every(c => mastered.has(c));
          const prereqNames = h.prereqSkillCodes.map(c => nameBySkillCode.get(c) ?? c);
          return (
            <HabitatCard
              key={h.code}
              habitat={h}
              unlocked={prereqsMet}
              prereqDisplayNames={prereqsMet ? [] : prereqNames}
            />
          );
        })}
      </div>
    </main>
  );
}
