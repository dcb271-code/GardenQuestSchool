import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/learning/review';
import {
  addJoke, removeJoke, readJokes, jokesToTell, checkRiddle, countRiddle,
  RIDDLES, MAX_SETUP_LENGTH, MAX_PUNCHLINE_LENGTH, RIDDLE_SEEDS_PER_DAY,
  type RiddleDay,
} from '@/lib/world/jokeStump';

/**
 * The Silly Stump — Cecily's idea (letter 2026-10-06).
 *
 * GET   every child's jokes (shared, signed), plus her riddle tally.
 * POST  { action: 'add' }     — add one of her jokes
 *       { action: 'remove' }  — take one of HER jokes back out
 *       { action: 'riddle' }  — answer a math riddle
 *
 * Jokes live in world_state.garden.jokes per child; the riddle tally in
 * world_state.garden.joke_stump. No migration.
 *
 * A riddle answer becomes an `attempt` row with null item/session —
 * the music-room pattern — so riddles grow plants like any practice.
 * Capped at RIDDLE_SEEDS_PER_DAY so the stump can't be farmed.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('add'),
    learnerId: z.string().min(1),
    setup: z.string().max(MAX_SETUP_LENGTH * 2),
    punchline: z.string().max(MAX_PUNCHLINE_LENGTH * 2).optional(),
  }),
  z.object({
    action: z.literal('remove'),
    learnerId: z.string().min(1),
    jokeId: z.string().min(1),
  }),
  z.object({
    action: z.literal('riddle'),
    learnerId: z.string().min(1),
    riddleId: z.string().min(1),
    answer: z.number().int(),
    timeMs: z.number().int().min(0).max(600000).optional(),
  }),
]);

type Db = ReturnType<typeof createServiceClient>;

async function loadGarden(db: Db, learnerId: string) {
  const { data } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  return (data?.garden as Record<string, unknown>) ?? {};
}

async function saveGarden(db: Db, learnerId: string, garden: Record<string, unknown>) {
  return db.from('world_state').upsert(
    { learner_id: learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
}

/** Every child's jokes, signed — the stump is shared. */
async function allJokes(db: Db) {
  const { data: learners } = await db.from('learner').select('id, first_name');
  const ids = (learners ?? []).map(l => l.id as string);
  const { data: worlds } = await db
    .from('world_state').select('learner_id, garden').in('learner_id', ids);
  return jokesToTell((learners ?? []).map(l => ({
    learnerId: l.id as string,
    name: l.first_name as string,
    jokes: readJokes(((worlds ?? []).find(w => w.learner_id === l.id)?.garden as
      Record<string, unknown> | undefined)?.jokes),
  })));
}

function riddlesLeft(garden: Record<string, unknown>): number {
  const tally = garden.joke_stump as { riddles?: RiddleDay } | undefined;
  const counted = tally?.riddles?.day === todayKey() ? tally.riddles.counted : 0;
  return Math.max(0, RIDDLE_SEEDS_PER_DAY - counted);
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });
  const db = createServiceClient();
  const garden = await loadGarden(db, learnerId);
  return NextResponse.json({
    jokes: await allJokes(db),
    mine: readJokes(garden.jokes),
    seedsLeftToday: riddlesLeft(garden),
  });
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'The stump didn’t understand that.' }, { status: 400 });
  }
  const body = parsed.data;
  const db = createServiceClient();
  const garden = await loadGarden(db, body.learnerId);

  if (body.action === 'add') {
    const r = addJoke(readJokes(garden.jokes), body.setup, body.punchline, new Date().toISOString());
    if ('error' in r) return NextResponse.json({ error: r.error }, { status: 400 });
    garden.jokes = r.list;
    const { error } = await saveGarden(db, body.learnerId, garden);
    if (error) return NextResponse.json({ error: 'The stump forgot it — try again in a bit.' }, { status: 500 });
    return NextResponse.json({ added: r.joke, mine: r.list, jokes: await allJokes(db) });
  }

  if (body.action === 'remove') {
    const mine = removeJoke(readJokes(garden.jokes), body.jokeId);
    garden.jokes = mine;
    const { error } = await saveGarden(db, body.learnerId, garden);
    if (error) return NextResponse.json({ error: 'The stump couldn’t let go of that one. Try again.' }, { status: 500 });
    return NextResponse.json({ mine, jokes: await allJokes(db) });
  }

  // ── a riddle answer ─────────────────────────────────────────────
  const correct = checkRiddle(body.riddleId, body.answer);
  if (correct === null) {
    return NextResponse.json({ error: 'The stump doesn’t know that riddle.' }, { status: 400 });
  }
  const riddle = RIDDLES.find(r => r.id === body.riddleId)!;
  const tally = (garden.joke_stump as { riddles?: RiddleDay } | undefined) ?? {};
  const { counts, next } = countRiddle(tally.riddles, todayKey());

  if (counts) {
    const { error } = await db.from('attempt').insert({
      learner_id: body.learnerId,
      session_id: null,
      item_id: null,
      outcome: correct ? 'correct' : 'incorrect',
      response: { source: 'joke_stump', riddle: riddle.id, answer: body.answer },
      time_ms: body.timeMs ?? null,
      retry_count: 0,
    });
    if (error) {
      return NextResponse.json({
        correct, because: riddle.because, counted: false,
        seedsLeftToday: riddlesLeft(garden),
        note: 'The stump heard you, but the garden didn’t write it down. It won’t count this time.',
      });
    }
    garden.joke_stump = { ...tally, riddles: next };
    await saveGarden(db, body.learnerId, garden);
  }

  return NextResponse.json({
    correct,
    because: riddle.because,
    counted: counts,
    seedsLeftToday: riddlesLeft(garden),
  });
}
