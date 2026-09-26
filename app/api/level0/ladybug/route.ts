import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { allStatuses, offerable, type PreSkillAttempt, type PreSkillCode } from '@/lib/level0/curriculum';
import { level0Attempts, attemptRow } from '@/lib/level0/attempts';
import { buildLeaf, judgeTaps, isLadybugPreSkill } from '@/lib/level0/ladybug';
import { LADYBUG } from '@/lib/level0/words';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * The Ladybug Count.
 *
 * GET  ?learner=…   → the next leaf: the server picks the pre-skill
 *                     from her attempt rows (offerable order, rotated
 *                     by how many leaves she has done) and a seed,
 *                     and grows the leaf. The client draws it.
 * POST              → she tapped numerals. The server REGROWS THE
 *                     EXACT LEAF from (seed, preSkill) and judges the
 *                     taps itself; correctness is never in the
 *                     payload. One null-item attempt per tap, source
 *                     'ladybug' — the birds/gems/munch pattern.
 *
 * No prize, no cap, no clock. The garden grows from the correct rows
 * the way it grows from anything else.
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
  const offers = offerable('ladybug', statuses);
  // Rotate through what is offerable by leaves FINISHED (every leaf
  // ends with exactly one correct row), so a sitting mixes counting
  // with numerals and a glance instead of ten of one — and a wrong
  // tap does not skip her ahead in the rotation.
  const finished = attempts.filter(a => isLadybugPreSkill(a.preSkill) && a.correct).length;
  const preSkill = offers[finished % offers.length] as PreSkillCode;
  const seed = Math.floor(Math.random() * (2 ** 31 - 1));
  const leaf = buildLeaf(seed, preSkill);
  return NextResponse.json({ leaf, statuses });
}

const Body = z.object({
  learnerId: z.string().min(1),
  seed: z.number().int().min(0).max(2 ** 31 - 1),
  preSkill: z.string().min(1).max(40),
  /** Every numeral she tapped, in order, ending with the right one. */
  taps: z.array(z.number().int().min(0).max(10)).min(1).max(12),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  if (!isLadybugPreSkill(body.preSkill)) {
    return NextResponse.json({ error: LADYBUG.refused }, { status: 400 });
  }
  const leaf = buildLeaf(body.seed, body.preSkill);
  const judged = judgeTaps(leaf, body.taps);
  if (!judged) {
    return NextResponse.json({ error: LADYBUG.refused }, { status: 400 });
  }

  const db = createServiceClient();
  const rows = judged.map(j => attemptRow(body.learnerId, 'ladybug', j.correct, {
    preSkill: leaf.preSkill, mode: leaf.mode, asked: leaf.count, chosen: j.chosen,
  }));
  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    finished: judged[judged.length - 1].correct,
    tries: judged.length,
  });
}
