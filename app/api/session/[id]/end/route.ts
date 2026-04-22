import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Body = z.object({
  reason: z.enum(['completed', 'user_stopped', 'soft_timeout']).default('completed'),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = Body.parse(await req.json().catch(() => ({})));
  const db = createServiceClient();

  const { data: session } = await db
    .from('session').update({
      ended_at: new Date().toISOString(),
      ended_reason: body.reason,
    })
    .eq('id', params.id)
    .select('items_attempted, items_correct')
    .single();

  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  const { data: attempts } = await db
    .from('attempt')
    .select('outcome, item_id, retry_count, item:item_id(type, content)')
    .eq('session_id', params.id);

  const observations: string[] = [];
  const byType: Record<string, number> = {};
  for (const a of attempts ?? []) {
    const t = (a as any).item.type;
    byType[t] = (byType[t] ?? 0) + (a.outcome === 'correct' ? 1 : 0);
    if (a.retry_count >= 2 && a.outcome === 'correct') {
      observations.push('You came back to this one three times, and then it clicked.');
    }
  }
  for (const [type, n] of Object.entries(byType)) {
    if (n > 0) {
      observations.push(
        type === 'NumberBonds' ? `You found ${n} number bond${n === 1 ? '' : 's'} to 10.` :
        type === 'CountingTiles' ? `You counted ${n} set${n === 1 ? '' : 's'} carefully.` :
        type === 'EquationTap' ? `You solved ${n} equation${n === 1 ? '' : 's'}.` :
        `You did ${n} of these.`
      );
    }
  }

  return NextResponse.json({
    itemsAttempted: session.items_attempted,
    itemsCorrect: session.items_correct,
    observations: Array.from(new Set(observations)),
  });
}
