import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import {
  hashPin, verifyPin, isValidPin, UNLOCK_COOKIE, withUnlocked,
} from '@/lib/learner/pin';

/**
 * Set, clear and check a learner's profile PIN.
 *
 * POST  { pin }            → check it; on success this device is unlocked
 * PUT   { pin }            → set or change it (parent side)
 * DELETE                   → remove it, so the profile opens freely again
 *
 * The check deliberately does NOT say whether a PIN was wrong versus
 * absent in any detail a child could use to enumerate — but it also
 * does not pretend to be more than it is. See lib/learner/pin.ts.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PinBody = z.object({ pin: z.string() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { pin } = PinBody.parse(await req.json());
  const db = createServiceClient();
  const { data: learner } = await db
    .from('learner').select('pin_hash').eq('id', params.id).maybeSingle();
  if (!learner) return NextResponse.json({ error: 'no such profile' }, { status: 404 });

  if (!verifyPin(pin, (learner.pin_hash as string | null) ?? null)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const jar = cookies();
  jar.set(UNLOCK_COOKIE, withUnlocked(jar.get(UNLOCK_COOKIE)?.value, params.id), {
    httpOnly: true, sameSite: 'lax', path: '/',
    // Session cookie on purpose: closing the tablet re-locks it, which
    // is the behavior a child expects from "my" profile.
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { pin } = PinBody.parse(await req.json());
  if (!isValidPin(pin)) {
    return NextResponse.json({ error: 'a PIN is 4 digits' }, { status: 400 });
  }
  const db = createServiceClient();
  const { error } = await db.from('learner')
    .update({ pin_hash: hashPin(pin), pin_set_at: new Date().toISOString() })
    .eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const db = createServiceClient();
  const { error } = await db.from('learner')
    .update({ pin_hash: null, pin_set_at: null }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
