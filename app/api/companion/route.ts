import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  bondLevelFor, nextLevelAt, computeNeeds, todayString,
} from '@/lib/companion/companionRules';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface CompanionStatus {
  speciesCode: string;
  speciesName: string;
  emoji: string;
  nickname: string | null;
  bondXp: number;
  bondLevel: number;
  nextLevelAt: number | null;
  hungryToday: boolean;
  playedToday: boolean;
  napping: boolean;
}

/**
 * Companion status. "Played today" is derived from the session table
 * at read time — any real completed practice counts. When the learner
 * has played but the companion hasn't been credited for today yet,
 * the credit (+1 bond XP) happens here, idempotently, so the session
 * end route needs no changes.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });
  const db = createServiceClient();

  const { data: rows } = await db
    .from('companion')
    .select('*')
    .eq('learner_id', learnerId);
  const all = rows ?? [];
  let active = all.find(c => c.active) ?? null;

  if (!active) {
    return NextResponse.json({
      active: null,
      all: all.map(c => ({ speciesCode: c.species_code, nickname: c.nickname, bondXp: c.bond_xp })),
    });
  }

  const today = todayString();
  // Local midnight in family time ≈ start of today's date string.
  const { data: sessToday } = await db
    .from('session')
    .select('id')
    .eq('learner_id', learnerId)
    .not('ended_at', 'is', null)
    .gte('ended_at', `${today}T00:00:00-06:00`)
    .gte('items_attempted', 1)
    .limit(1);
  const playedToday = (sessToday?.length ?? 0) > 0;

  if (playedToday && active.last_played_on !== today) {
    const { data: updated } = await db
      .from('companion')
      .update({ last_played_on: today, bond_xp: active.bond_xp + 1 })
      .eq('id', active.id)
      .select('*')
      .single();
    if (updated) active = updated;
  }

  const sp = SPECIES_CATALOG.find(s => s.code === active.species_code);
  const needs = computeNeeds(active, playedToday, today);
  const status: CompanionStatus = {
    speciesCode: active.species_code,
    speciesName: sp?.commonName ?? active.species_code,
    emoji: sp?.emoji ?? '🐾',
    nickname: active.nickname,
    bondXp: active.bond_xp,
    bondLevel: bondLevelFor(active.bond_xp),
    nextLevelAt: nextLevelAt(active.bond_xp),
    ...needs,
  };

  return NextResponse.json({
    active: status,
    all: all.map(c => ({ speciesCode: c.species_code, nickname: c.nickname, bondXp: c.bond_xp })),
  });
}
