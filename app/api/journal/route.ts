import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();

  const { data: gemRows } = await db
    .from('virtue_gem')
    .select('virtue, evidence, granted_at')
    .eq('learner_id', learnerId)
    .order('granted_at', { ascending: false });

  const gemsByVirtue: Record<string, number> = {};
  for (const g of gemRows ?? []) {
    gemsByVirtue[g.virtue] = (gemsByVirtue[g.virtue] ?? 0) + 1;
  }

  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);

  const unlockedSpeciesCodes = new Set((journalRows ?? []).map((r: any) => r.species.code));

  const species = SPECIES_CATALOG.map(s => ({
    ...s,
    unlocked: unlockedSpeciesCodes.has(s.code),
  }));

  return NextResponse.json({
    gemsByVirtue,
    totalGems: (gemRows ?? []).length,
    recentGems: (gemRows ?? []).slice(0, 5),
    species,
  });
}
