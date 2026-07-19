// Central virtue-gem granting with per-day caps.
//
// Every insert into virtue_gem goes through grantVirtueGem so the caps
// apply uniformly. Caps exist because a gem that fires every session
// (noticing did, ×158) stops being a reward and becomes wallpaper —
// once a day keeps each virtue a small event.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { VirtueName } from './types';

// null = uncapped. persistence/practice stay uncapped: their triggers
// are naturally rare and tied to real effort.
export const DAILY_CAP: Record<VirtueName, number | null> = {
  persistence: null,
  practice: null,
  noticing: 1,
  curiosity: 1,
  courage: 1,
  care: 1,
  wondering: 1,
};

export function isUnderDailyCap(
  virtue: VirtueName,
  grantedTodayCount: number,
): boolean {
  const cap = DAILY_CAP[virtue];
  return cap === null || grantedTodayCount < cap;
}

/**
 * Insert a virtue gem unless today's cap for that virtue is already
 * reached. Returns true when the gem was granted. Never throws —
 * badge-granting must not break the flow it decorates.
 */
export async function grantVirtueGem(
  db: SupabaseClient,
  learnerId: string,
  virtue: VirtueName,
  narrativeText: string,
  evidence: Record<string, unknown> = {},
): Promise<boolean> {
  try {
    const cap = DAILY_CAP[virtue];
    if (cap !== null) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count } = await db
        .from('virtue_gem')
        .select('id', { count: 'exact', head: true })
        .eq('learner_id', learnerId)
        .eq('virtue', virtue)
        .gte('granted_at', startOfDay.toISOString());
      if (!isUnderDailyCap(virtue, count ?? 0)) return false;
    }

    const { error } = await db.from('virtue_gem').insert({
      learner_id: learnerId,
      virtue,
      evidence: {
        narrativeText,
        observedAt: new Date().toISOString(),
        ...evidence,
      },
    });
    if (error) {
      console.error('virtue_gem insert failed:', error.message, { virtue, learnerId });
      return false;
    }
    return true;
  } catch (err) {
    console.error('grantVirtueGem failed:', err);
    return false;
  }
}
