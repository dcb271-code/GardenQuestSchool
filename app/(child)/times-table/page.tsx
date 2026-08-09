// app/(child)/times-table/page.tsx
//
// The Times Table Workshop, reachable from Math Mountain.
//
// Per-fact accuracy is computed on the server because the chart is
// useless without it: the whole point is showing HER table, with the
// facts she actually misses in red, rather than a generic poster.

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { multiplicationFactAccuracy } from '@/lib/packs/math/factAccuracy';
import TimesTableWorkshop from './TimesTableWorkshop';

export const dynamic = 'force-dynamic';

export default async function TimesTablePage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) redirect('/');

  const acc = await multiplicationFactAccuracy(db, learnerId);
  const accuracy: Record<string, [number, number]> = {};
  for (const [k, v] of Array.from(acc.entries())) accuracy[k] = [v.correct, v.total];

  return <TimesTableWorkshop learnerId={learnerId} accuracy={accuracy} />;
}
