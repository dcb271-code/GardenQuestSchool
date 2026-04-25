import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Default passcode for the at-home parent zone. Override with the
// PARENT_PASSCODE env var on Vercel for production.
const PARENT_PASSCODE = process.env.PARENT_PASSCODE || '751246';
const COOKIE_NAME = 'gqs:parent-auth';
// 30 days
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const Body = z.object({
  passcode: z.string().min(1).max(40),
});

export async function POST(req: NextRequest) {
  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'missing passcode' }, { status: 400 });
  }
  if (parsed.data.passcode !== PARENT_PASSCODE) {
    return NextResponse.json({ error: 'wrong passcode' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
