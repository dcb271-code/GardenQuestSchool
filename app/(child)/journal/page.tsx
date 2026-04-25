import Link from 'next/link';
import VirtueGemMoment from '@/components/child/VirtueGemMoment';
import { createServiceClient } from '@/lib/supabase/server';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import SpeciesGrid from './SpeciesGrid';

export const dynamic = 'force-dynamic';

const VIRTUE_EMOJI: Record<string, string> = {
  persistence: '💎', curiosity: '🔍', noticing: '👁️',
  care: '💗', practice: '🔁', courage: '🦁', wondering: '❓',
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();

  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: gemRows } = await db
    .from('virtue_gem')
    .select('virtue, evidence, granted_at')
    .eq('learner_id', learnerId!)
    .order('granted_at', { ascending: false });
  const gemsByVirtue: Record<string, number> = {};
  for (const g of gemRows ?? []) {
    gemsByVirtue[g.virtue] = (gemsByVirtue[g.virtue] ?? 0) + 1;
  }

  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId!);
  const unlocked = new Set((journalRows ?? []).map((r: any) => r.species.code));

  const backHref = learnerId ? `/garden?learner=${learnerId}` : '/picker';

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back to garden"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">📖</div>
          <h1
            className="font-display text-[28px] text-bark leading-none"
            style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
          >
            <span className="italic text-forest">field</span> journal
          </h1>
        </div>
        <div style={{ width: 44 }}></div>
      </div>

      <section>
        <h2 className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase mb-3">
          virtue gems
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(VIRTUE_EMOJI).map(([v, e]) => {
            const count = gemsByVirtue[v] ?? 0;
            return (
              <div
                key={v}
                className={`border-4 rounded-2xl p-3 text-center ${count > 0 ? 'bg-rose/10 border-rose' : 'bg-gray-50 border-gray-200 opacity-60'}`}
              >
                <div className="text-3xl">{e}</div>
                <div className="font-display italic text-xs text-bark/70 mt-1 capitalize">{v}</div>
                <div className="font-display text-[18px] text-bark" style={{ fontWeight: 700 }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {(gemRows ?? []).slice(0, 3).length > 0 && (
        <section>
          <h2 className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase mb-3">
            recent moments
          </h2>
          <div className="space-y-3">
            {(gemRows ?? []).slice(0, 3).map((g: any, i: number) => (
              <VirtueGemMoment key={i} virtue={g.virtue} narrativeText={g.evidence?.narrativeText ?? ''} index={i} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase">
            discoveries
          </h2>
          <div className="font-display text-[14px] text-bark/65">
            <span className="font-bold text-forest">{unlocked.size}</span>
            <span className="text-bark/40"> / {SPECIES_CATALOG.length}</span>
          </div>
        </div>

        {/* Empty / nearly-empty hero — warm copy when no creatures yet */}
        {unlocked.size === 0 && (
          <div className="relative mb-5 bg-gradient-to-br from-cream to-ochre/20 border-4 border-ochre/50 rounded-2xl p-5 overflow-hidden">
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-5xl shrink-0">🌱</div>
              <div className="flex-1">
                <div className="font-display text-[22px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                  <span className="italic text-forest">your journal</span> is waiting
                </div>
                <p className="font-display italic text-[15px] text-bark/70 mt-2 leading-snug">
                  practice at any glowing spot in the garden — when you finish a real session, a creature will come to visit.
                  every one you welcome lands here.
                </p>
              </div>
            </div>
            {/* tiny faded silhouettes of upcoming species */}
            <div className="flex gap-2 mt-4 opacity-40 text-2xl flex-wrap">
              {SPECIES_CATALOG.slice(0, 8).map(s => (
                <span key={s.code}>❓</span>
              ))}
            </div>
          </div>
        )}

        <SpeciesGrid unlockedCodes={Array.from(unlocked)} />

        {unlocked.size > 0 && (
          <div className="mt-4 text-center font-display italic text-[13px] text-bark/55">
            tap a creature you&apos;ve discovered to learn more about it
          </div>
        )}
      </section>
    </main>
  );
}
