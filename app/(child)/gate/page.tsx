// app/(child)/gate/page.tsx
//
// The morning gate. resolveLearnerId sends a gated child here; this
// page must NOT call it back (it would loop), so it reads the learner
// from the URL and decides the step itself. A child whose garden is
// already open is sent straight in.
//
// Rules: lib/gate/morning.ts. Spec: the owner's ask of 2026-09-27.

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { gateStep, waitRemainingMs } from '@/lib/gate/morning';
import { loadMorning } from '@/lib/gate/morningServer';
import GateScene from './GateScene';

export const dynamic = 'force-dynamic';

export default async function GatePage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const learnerId = searchParams.learner;
  if (!learnerId) redirect('/picker');
  const db = createServiceClient();
  const { firstName, state, config } = await loadMorning(db, learnerId);
  if (!firstName) redirect('/picker');
  const now = new Date();
  const step = gateStep(firstName, now, state, config);
  if (step === 'open') redirect(`/garden?learner=${learnerId}`);
  return (
    <GateScene
      learnerId={learnerId}
      firstName={firstName}
      config={config}
      initialStep={step}
      initialWaitMs={step === 'wait' ? waitRemainingMs(now, state) : 0}
      initialChores={state?.chores ?? null}
    />
  );
}
