// lib/level0/attempts.ts
//
// Server-side: every Level 0 attempt row a child has, in the shape
// the curriculum's mastery function wants. One place, because the
// games depend on each other's rows — the bunny's baskets open once
// she has counted a ladybug.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PreSkillAttempt } from './curriculum';

export const LEVEL0_SOURCES = ['ladybug', 'basket', 'signature'] as const;
export type Level0Source = typeof LEVEL0_SOURCES[number];

export async function level0Attempts(db: SupabaseClient, learnerId: string): Promise<PreSkillAttempt[]> {
  const { data, error } = await db
    .from('attempt')
    .select('outcome, response, attempted_at')
    .eq('learner_id', learnerId)
    .in('response->>source', [...LEVEL0_SOURCES])   // the crow's proven filter shape
    .order('attempted_at', { ascending: true })
    .limit(4000);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    preSkill: String(r.response?.preSkill ?? ''),
    correct: r.outcome === 'correct',
    at: String(r.attempted_at),
  }));
}

/** A null-item attempt row, the established game pattern. */
export function attemptRow(
  learnerId: string, source: Level0Source, correct: boolean, response: Record<string, unknown>,
) {
  return {
    learner_id: learnerId,
    session_id: null,
    item_id: null,
    outcome: correct ? 'correct' : 'incorrect',
    response: { source, ...response },
    time_ms: null,
    retry_count: 0,
  };
}
