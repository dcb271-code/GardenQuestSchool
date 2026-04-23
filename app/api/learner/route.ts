import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PARENT_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  const db = createServiceClient();
  const { data } = await db
    .from('learner')
    .select('id, first_name, avatar_key')
    .eq('parent_id', PARENT_ID)
    .order('created_at', { ascending: true });
  return NextResponse.json({ learners: data ?? [] });
}

const AddBody = z.object({
  firstName: z.string().min(1).max(40),
  avatarKey: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const body = AddBody.parse(await req.json());
  const db = createServiceClient();

  const { data: learner, error } = await db.from('learner').insert({
    parent_id: PARENT_ID,
    first_name: body.firstName,
    avatar_key: body.avatarKey,
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('world_state').upsert({
    learner_id: learner.id,
  }, { onConflict: 'learner_id' });

  return NextResponse.json({ learnerId: learner.id });
}
