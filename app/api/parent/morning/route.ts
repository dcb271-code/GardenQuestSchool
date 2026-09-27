import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { requireParent } from '@/lib/auth/parentGate';
import {
  CHORE_ICONS, MAX_CHORES, MAX_CHORE_TEXT, MIN_CUTOFF_HOUR, MAX_CUTOFF_HOUR, normalizeMorningConfig,
} from '@/lib/gate/morning';
import { loadMorningConfig, saveMorningConfig } from '@/lib/gate/morningServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * The family's morning settings — grown-ups only (the parent cookie).
 *   GET   → the current config (defaults until 023 is applied)
 *   PUT   → replace it: cutoff hour and up to three chores
 */

const Body = z.object({
  cutoffHour: z.number().int().min(MIN_CUTOFF_HOUR).max(MAX_CUTOFF_HOUR),
  chores: z.array(z.object({
    id: z.string().min(1).max(40),
    text: z.string().min(1).max(MAX_CHORE_TEXT),
    icon: z.enum(CHORE_ICONS),
  })).max(MAX_CHORES),
});

export async function GET() {
  const denied = requireParent();
  if (denied) return denied;
  const db = createServiceClient();
  return NextResponse.json({ config: await loadMorningConfig(db) });
}

export async function PUT(req: Request) {
  const denied = requireParent();
  if (denied) return denied;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Check the hour (0–12) and the chores (up to three, each with words).' }, { status: 400 });
  const db = createServiceClient();
  const config = normalizeMorningConfig(parsed.data);
  const err = await saveMorningConfig(db, config);
  if (err) {
    const hint = /settings/.test(err) ? ' Run npm run db:migrate (023_parent_settings.sql) first.' : '';
    return NextResponse.json({ error: err + hint }, { status: 500 });
  }
  return NextResponse.json({ config });
}
