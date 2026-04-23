import Link from 'next/link';
import JournalSpeciesCard from '@/components/child/JournalSpeciesCard';
import VirtueGemMoment from '@/components/child/VirtueGemMoment';
import { createServiceClient } from '@/lib/supabase/server';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

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

  let learnerId = searchParams.learner;
  if (!learnerId) {
    const { data: firstLearner } = await db.from('learner').select('id').limit(1).single();
    learnerId = firstLearner?.id;
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

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back to profile picker"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="text-kid-lg text-center flex-1">📖 Field Journal</h1>
        <div style={{ width: 44 }}></div>
      </div>

      <section>
        <h2 className="text-kid-sm uppercase tracking-wider opacity-70 mb-3">Virtue Gems</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(VIRTUE_EMOJI).map(([v, e]) => {
            const count = gemsByVirtue[v] ?? 0;
            return (
              <div
                key={v}
                className={`border-4 rounded-2xl p-3 text-center ${count > 0 ? 'bg-rose/10 border-rose' : 'bg-gray-50 border-gray-200 opacity-60'}`}
              >
                <div className="text-3xl">{e}</div>
                <div className="text-xs mt-1 capitalize">{v}</div>
                <div className="text-kid-sm font-bold">{count}</div>
              </div>
            );
          })}
        </div>
      </section>

      {(gemRows ?? []).slice(0, 3).length > 0 && (
        <section>
          <h2 className="text-kid-sm uppercase tracking-wider opacity-70 mb-3">Recent moments</h2>
          <div className="space-y-3">
            {(gemRows ?? []).slice(0, 3).map((g: any, i: number) => (
              <VirtueGemMoment key={i} virtue={g.virtue} narrativeText={g.evidence?.narrativeText ?? ''} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-kid-sm uppercase tracking-wider opacity-70 mb-3">Possible discoveries</h2>
        <div className="space-y-3">
          {SPECIES_CATALOG.map(s => (
            <JournalSpeciesCard key={s.code} species={s} unlocked={unlocked.has(s.code)} />
          ))}
        </div>
      </section>
    </main>
  );
}
