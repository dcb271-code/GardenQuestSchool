import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { allStatuses, offerable, type PreSkillAttempt } from '@/lib/level0/curriculum';
import { level0Attempts, attemptRow } from '@/lib/level0/attempts';
import {
  buildRound, judgeBasketTaps, judgeNumeralTaps, isBasketPreSkill, type BasketRound,
} from '@/lib/level0/basket';
import { BASKET } from '@/lib/level0/words';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Bunny's Basket.
 *
 * GET  ?learner=…   → the next round. The pre-skill comes from her
 *                     rows: more_fewer until it is practicing, then
 *                     one_more joins the rotation. A child who has
 *                     never counted a ladybug still gets baskets —
 *                     the bunny is on her map, and a creature that
 *                     asks and then refuses is the trap this whole
 *                     band exists to avoid.
 * POST              → which baskets and numerals she tapped, in
 *                     order. The server regrows the round and judges
 *                     everything itself. One null-item attempt per
 *                     tap, source 'basket'.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });
  const db = createServiceClient();

  let attempts: PreSkillAttempt[];
  try { attempts = await level0Attempts(db, learnerId); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }

  const statuses = allStatuses(attempts);
  const offers = offerable('basket', statuses);
  // A one_more round begins with which-has-more, so it practices both;
  // serve it the moment it is open. Otherwise the plain round.
  const preSkill = offers.includes('one_more') ? 'one_more' : 'more_fewer';
  const seed = Math.floor(Math.random() * (2 ** 31 - 1));
  const round = buildRound(seed, preSkill);
  return NextResponse.json({ round, statuses });
}

const Body = z.object({
  learnerId: z.string().min(1),
  seed: z.number().int().min(0).max(2 ** 31 - 1),
  preSkill: z.string().min(1).max(40),
  basketTaps: z.array(z.enum(['left', 'right'])).min(1).max(12),
  numeralTaps: z.array(z.number().int().min(0).max(10)).max(12).default([]),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  if (!isBasketPreSkill(body.preSkill)) {
    return NextResponse.json({ error: BASKET.refused }, { status: 400 });
  }
  const round: BasketRound = buildRound(body.seed, body.preSkill);
  const baskets = judgeBasketTaps(round, body.basketTaps);
  const numerals = judgeNumeralTaps(round, body.numeralTaps);
  if (numerals === null) {
    return NextResponse.json({ error: BASKET.refused }, { status: 400 });
  }

  const db = createServiceClient();
  const rows = [
    ...baskets.map(j => attemptRow(body.learnerId, 'basket', j.correct, {
      preSkill: 'more_fewer', left: round.left, right: round.right, chosen: j.chosen,
    })),
    ...numerals.map(j => attemptRow(body.learnerId, 'basket', j.correct, {
      preSkill: 'one_more', from: round.oneMore!.from, asked: round.oneMore!.to, chosen: j.chosen,
    })),
  ];
  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lastBasket = baskets[baskets.length - 1];
  const lastNumeral = numerals[numerals.length - 1];
  return NextResponse.json({
    finished: lastBasket.correct && (round.oneMore === null || !!lastNumeral?.correct),
    tries: rows.length,
  });
}
