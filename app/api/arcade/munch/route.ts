import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/learning/review';
import {
  makeBoard, ruleKey, recordClear, BOARD_SIZE,
  type MunchRule, type MunchState,
} from '@/lib/packs/math/munch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * The Munch Patch referee. The client reports the seed and which
 * tiles were munched; the server REGROWS THE EXACT BOARD from
 * (rule, seed) and judges everything itself — which tile held which
 * face, which munches were right, and whether the patch was truly
 * cleared. A client that invents munches for faces the board never
 * grew is refused in words; a client that lies about correctness
 * cannot, because correctness is never in the payload.
 *
 * Attempts land as null-item rows, source 'munch' — the established
 * pattern (birds, gems, crow, hummingbird, music). The prize veggie
 * is capped at one per day; later clears are cheerfully allowed and
 * pay nothing, exactly like the hummingbird's flower.
 */

const Rule = z.discriminatedUnion('type', [
  z.object({ type: z.literal('eat_number'), target: z.number().int().min(2).max(10) }),
  z.object({ type: z.literal('bigger_than'), pivot: z.number().int().min(15).max(75) }),
  z.object({ type: z.literal('sum_equals'), target: z.number().int().min(8).max(99) }),
  z.object({ type: z.literal('multiple_of'), k: z.number().int().min(2).max(9) }),
]);

const Body = z.object({
  learnerId: z.string().min(1),
  rule: Rule,
  seed: z.number().int().min(0).max(2 ** 31 - 1),
  munches: z.array(z.object({
    tile: z.number().int().min(0).max(BOARD_SIZE - 1),
    face: z.string().max(8),
  })).min(1).max(40),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const rule = body.rule as MunchRule;
  const board = makeBoard(rule, body.seed);

  // Judge every munch against the server's own board. A face that
  // does not match its tile means the client and server disagree
  // about what grew there — nothing is recorded on a disputed board.
  const seen = new Set<number>();
  const judged: Array<{ tile: number; face: string; correct: boolean }> = [];
  for (const m of body.munches) {
    if (board.tiles[m.tile].face !== m.face) {
      return NextResponse.json(
        { error: 'That board does not match the one the garden grew. Nothing was recorded — try a fresh round.' },
        { status: 400 },
      );
    }
    if (seen.has(m.tile)) continue; // munching a tile twice changes nothing
    seen.add(m.tile);
    judged.push({ tile: m.tile, face: m.face, correct: board.tiles[m.tile].correct });
  }

  const key = ruleKey(rule);
  const rows = judged.map(j => ({
    learner_id: body.learnerId,
    session_id: null,
    item_id: null,
    outcome: j.correct ? 'correct' : 'incorrect',
    response: { source: 'munch', rule: key, face: j.face },
    time_ms: null,
    retry_count: 0,
  }));
  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cleared = every correct TILE (by index — numeral faces repeat)
  // munched by the bunny. The client's opinion was never asked.
  const cleared = board.tiles.every((t, i) => !t.correct || seen.has(i));

  let prize = null;
  if (cleared) {
    const { data: stateRow } = await db
      .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
    const garden = (stateRow?.garden as Record<string, any>) ?? {};
    const arcade = (garden.arcade as Record<string, any>) ?? {};
    const munchState: MunchState = (arcade.munch as MunchState) ?? {};

    const out = recordClear(munchState, key, todayKey());
    prize = out.prize;
    garden.arcade = { ...arcade, munch: out.state };

    const { error: we } = await db.from('world_state').upsert(
      { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
      { onConflict: 'learner_id' },
    );
    if (we) return NextResponse.json({ error: we.message }, { status: 500 });
  }

  return NextResponse.json({
    cleared,
    prize,
    correctMunches: judged.filter(j => j.correct).length,
    tastedCount: judged.filter(j => !j.correct).length,
  });
}
