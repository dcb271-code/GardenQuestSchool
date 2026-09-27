import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { CHORES, CHORE_WAIT_MS, codeMatches, gateStep, localParts } from '@/lib/gate/morning';
import { loadMorning, saveMorning } from '@/lib/gate/morningServer';
import { GATE_WORDS } from '@/lib/gate/words';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * The morning gate.
 *   { action: 'code', code }      → checked against today's code (Eastern);
 *                                    a match unlocks the day.
 *   { action: 'chores', chores }  → recorded as she answered, once a day.
 * The server decides the date and the code; the client only ever
 * says what was typed and what was tapped. Responds with the next
 * step so the scene never has to guess.
 */

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('code'), learnerId: z.string().min(1), code: z.string().max(8) }),
  z.object({
    action: z.literal('chores'), learnerId: z.string().min(1),
    chores: z.record(z.string(), z.boolean()),
  }),
]);

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const now = new Date();
  const { firstName, state } = await loadMorning(db, body.learnerId);
  if (!firstName) return NextResponse.json({ error: 'learner not found' }, { status: 404 });

  if (body.action === 'code') {
    if (!codeMatches(body.code, now)) {
      return NextResponse.json({ error: GATE_WORDS.codeWrong, step: 'code' }, { status: 403 });
    }
    const err = await saveMorning(db, body.learnerId, { codeOn: localParts(now).dateKey });
    if (err) return NextResponse.json({ error: err }, { status: 500 });
    const next = gateStep(firstName, now, { ...state, codeOn: localParts(now).dateKey });
    return NextResponse.json({ step: next });
  }

  // chores: only the ones we asked, as booleans
  const chores: Record<string, boolean> = {};
  for (const c of CHORES) chores[c.code] = body.chores[c.code] === true;
  const err = await saveMorning(db, body.learnerId, {
    choresOn: localParts(now).dateKey, chores, choresAt: now.toISOString(),
  });
  if (err) return NextResponse.json({ error: err }, { status: 500 });
  // The pause starts now, and the rules — not the screen — end it.
  return NextResponse.json({ step: 'wait', remainingMs: CHORE_WAIT_MS });
}
