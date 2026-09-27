import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { CHORE_WAIT_MS, acceptChecklist, codeMatches, gateStep, localParts } from '@/lib/gate/morning';
import { loadMorning, saveMorning } from '@/lib/gate/morningServer';
import { GATE_WORDS } from '@/lib/gate/words';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * The morning gate.
 *   { action: 'code', code }      → checked against today's code (Eastern);
 *                                    a match unlocks the day.
 *   { action: 'chores', ticked }  → the checklist: at least one ticked,
 *                                    only chores that exist. Recorded
 *                                    once a day; starts the pause.
 * The server decides the date, the code, what counts, and the end of
 * the pause; the client only ever says what was typed and tapped.
 */

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('code'), learnerId: z.string().min(1), code: z.string().max(8) }),
  z.object({ action: z.literal('chores'), learnerId: z.string().min(1), ticked: z.array(z.string().max(60)).max(10) }),
]);

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const now = new Date();
  const { firstName, state, config } = await loadMorning(db, body.learnerId);
  if (!firstName) return NextResponse.json({ error: 'learner not found' }, { status: 404 });

  if (body.action === 'code') {
    if (!codeMatches(body.code, now)) {
      return NextResponse.json({ error: GATE_WORDS.codeWrong, step: 'code' }, { status: 403 });
    }
    const dateKey = localParts(now).dateKey;
    const err = await saveMorning(db, body.learnerId, { codeOn: dateKey });
    if (err) return NextResponse.json({ error: err }, { status: 500 });
    return NextResponse.json({ step: gateStep(firstName, now, { ...state, codeOn: dateKey }, config) });
  }

  const chores = acceptChecklist(config, body.ticked);
  if (!chores) {
    return NextResponse.json({ error: GATE_WORDS.tickOne, step: 'chores' }, { status: 400 });
  }
  const err = await saveMorning(db, body.learnerId, {
    choresOn: localParts(now).dateKey, chores, choresAt: now.toISOString(),
  });
  if (err) return NextResponse.json({ error: err }, { status: 500 });
  // The pause starts now, and the rules — not the screen — end it.
  return NextResponse.json({ step: 'wait', remainingMs: CHORE_WAIT_MS });
}
