// lib/gate/morningServer.ts
//
// The morning gate's server half: read a child's gate state and the
// family's settings, decide, and redirect a page render to the gate
// when the garden is not open yet. Called from resolveLearnerId,
// which every child page uses — one seam, so a bookmarked /garden
// URL is gated exactly like a tap on the picker.

import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  gateStep, isMorningGated, normalizeMorningConfig, DEFAULT_MORNING_CONFIG,
  type GateStep, type MorningConfig, type MorningState,
} from './morning';

export const GATE_PATH = '/gate';

export interface MorningRow { firstName: string | null; state: MorningState | null; config: MorningConfig }

/**
 * The family's morning settings: parent.settings.morning. Until
 * migration 023 is applied the column does not exist and the select
 * errors — that is the defaults, not a failure.
 */
export async function loadMorningConfig(db: SupabaseClient): Promise<MorningConfig> {
  const { data, error } = await db.from('parent').select('settings').order('created_at').limit(1).maybeSingle();
  if (error || !data) return DEFAULT_MORNING_CONFIG;
  return normalizeMorningConfig((data.settings as Record<string, unknown> | null)?.morning);
}

export async function saveMorningConfig(db: SupabaseClient, config: MorningConfig): Promise<string | null> {
  const { data: parent, error: pe } = await db.from('parent').select('id, settings').order('created_at').limit(1).maybeSingle();
  if (pe) return pe.message;
  if (!parent) return 'no parent row';
  const settings = { ...((parent.settings as Record<string, unknown>) ?? {}), morning: config };
  const { error } = await db.from('parent').update({ settings }).eq('id', parent.id);
  return error?.message ?? null;
}

export async function loadMorning(db: SupabaseClient, learnerId: string): Promise<MorningRow> {
  const { data: learner } = await db.from('learner').select('first_name').eq('id', learnerId).maybeSingle();
  const firstName = (learner?.first_name as string | null) ?? null;
  if (!isMorningGated(firstName)) return { firstName, state: null, config: DEFAULT_MORNING_CONFIG };
  const [{ data: ws }, config] = await Promise.all([
    db.from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle(),
    loadMorningConfig(db),
  ]);
  const state = ((ws?.garden as Record<string, unknown>)?.morning as MorningState | undefined) ?? null;
  return { firstName, state, config };
}

export async function morningStep(db: SupabaseClient, learnerId: string, now = new Date()): Promise<GateStep> {
  const { firstName, state, config } = await loadMorning(db, learnerId);
  return gateStep(firstName, now, state, config);
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
