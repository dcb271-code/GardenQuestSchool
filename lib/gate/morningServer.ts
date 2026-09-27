// lib/gate/morningServer.ts
//
// The morning gate's server half: read a child's gate state, decide,
// and redirect a page render to the gate when the garden is not open
// yet. Called from resolveLearnerId, which every child page uses —
// one seam, so a bookmarked /garden URL is gated exactly like a tap
// on the picker.

import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { gateStep, isMorningGated, type GateStep, type MorningState } from './morning';

export const GATE_PATH = '/gate';

export interface MorningRow { firstName: string | null; state: MorningState | null }

export async function loadMorning(db: SupabaseClient, learnerId: string): Promise<MorningRow> {
  const { data: learner } = await db.from('learner').select('first_name').eq('id', learnerId).maybeSingle();
  const firstName = (learner?.first_name as string | null) ?? null;
  if (!isMorningGated(firstName)) return { firstName, state: null };
  const { data: ws } = await db.from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const state = ((ws?.garden as Record<string, unknown>)?.morning as MorningState | undefined) ?? null;
  return { firstName, state };
}

export async function morningStep(db: SupabaseClient, learnerId: string, now = new Date()): Promise<GateStep> {
  const { firstName, state } = await loadMorning(db, learnerId);
  return gateStep(firstName, now, state);
}

/**
 * Page renders call this after resolving the learner. A child whose
 * garden is not open yet is sent to the gate; everyone else passes.
 * `redirect` throws, so this must not run inside a try/catch.
 */
export async function redirectToGateIfNeeded(db: SupabaseClient, learnerId: string): Promise<void> {
  const step = await morningStep(db, learnerId);
  if (step !== 'open') redirect(`${GATE_PATH}?learner=${learnerId}`);
}

/** Write a change to the child's morning state, additively. */
export async function saveMorning(db: SupabaseClient, learnerId: string, patch: Partial<MorningState>): Promise<string | null> {
  const { data: ws } = await db.from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = ((ws?.garden as Record<string, unknown>) ?? {});
  const morning = { ...((garden.morning as MorningState) ?? {}), ...patch };
  const { error } = await db.from('world_state').upsert(
    { learner_id: learnerId, garden: { ...garden, morning }, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  return error?.message ?? null;
}
