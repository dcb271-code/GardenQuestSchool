import Link from 'next/link';
import HabitatCard from '@/components/child/HabitatCard';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';

export const dynamic = 'force-dynamic';

export default async function HabitatsPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();

  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
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

  const unlockedCount = HABITAT_CATALOG.filter(h =>
    h.prereqSkillCodes.every(c => mastered.has(c))
  ).length;

  const backHref = learnerId ? `/garden?learner=${learnerId}` : '/picker';

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back to garden"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">🏠</div>
          <h1
            className="font-display text-[28px] text-bark leading-none"
            style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
          >
            <span className="italic text-forest">habitats</span>
          </h1>
        </div>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="bg-white/70 border-2 border-ochre rounded-xl p-4 text-center">
        <div className="font-display italic text-[13px] tracking-[0.2em] uppercase text-bark/60">
          your garden has
        </div>
        <div className="font-display text-[32px] text-bark mt-1" style={{ fontWeight: 600 }}>
          <span className="text-forest">{unlockedCount}</span>
          <span className="text-bark/40"> / {HABITAT_CATALOG.length}</span>
        </div>
        <p className="font-display italic text-[15px] text-bark/70 mt-1">
          habitats built — each one invites different little creatures
        </p>
      </div>

      <section>
        <h2 className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase mb-3">
          all the homes you can build
        </h2>
        <div className="space-y-3">
          {HABITAT_CATALOG.map((h, i) => {
            const prereqsMet = h.prereqSkillCodes.every(c => mastered.has(c));
            const prereqNames = h.prereqSkillCodes.map(c => nameBySkillCode.get(c) ?? c);
            return (
              <HabitatCard
                key={h.code}
                habitat={h}
                unlocked={prereqsMet}
                prereqDisplayNames={prereqsMet ? [] : prereqNames}
                index={i}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
