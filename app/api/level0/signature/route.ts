import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { attemptRow } from '@/lib/level0/attempts';
import { signatureLetters } from '@/lib/level0/signature';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Sign Her Name. She traced some or all of the letters of her name
 * on a painting; each finished letter is one attempt row, source
 * 'signature', pre-skill letters.own_name — always correct, because
 * there is no wrong signature, only finished and not yet.
 *
 * The referee's one check: the letters must be the START of her own
 * name as the guide draws it. A client cannot sign someone else's
 * name, or letters the easel never offered.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  letters: z.array(z.string().regex(/^[A-Z]$/)).min(1).max(8),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: learner } = await db
    .from('learner').select('first_name').eq('id', body.learnerId).maybeSingle();
  if (!learner) return NextResponse.json({ error: 'learner not found' }, { status: 404 });

  const expected = signatureLetters(learner.first_name);
  const prefix = expected.slice(0, body.letters.length);
  if (body.letters.length === 0 || body.letters.join('') !== prefix.join('')) {
    return NextResponse.json(
      { error: 'Those letters are not the start of your name. Nothing was recorded.' },
      { status: 400 },
    );
  }

  const rows = body.letters.map((letter, i) => attemptRow(body.learnerId, 'signature', true, {
    preSkill: 'letters.own_name', letter, position: i,
  }));
  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ recorded: rows.length, whole: body.letters.length === expected.length });
}
