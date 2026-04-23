import { createServiceClient } from '@/lib/supabase/server';
import DocumentationLine from '@/components/child/DocumentationLine';
import VirtueGemMoment from '@/components/child/VirtueGemMoment';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CompletePage({ params }: { params: { sessionId: string } }) {
  const db = createServiceClient();

  const { data: session } = await db
    .from('session')
    .select('learner_id, items_attempted, items_correct, started_at')
    .eq('id', params.sessionId)
    .single();

  const { data: attempts } = await db
    .from('attempt')
    .select('outcome, retry_count, item:item_id(type)')
    .eq('session_id', params.sessionId);

  const correctCount = (attempts ?? []).filter(a => a.outcome === 'correct').length;
  const triedMultipleTimes = (attempts ?? []).filter(a => a.retry_count >= 2 && a.outcome === 'correct').length;

  const lines: string[] = [];
  if (correctCount > 0) lines.push(`You solved ${correctCount} question${correctCount === 1 ? '' : 's'} today.`);
  if (triedMultipleTimes > 0) lines.push(`${triedMultipleTimes} time${triedMultipleTimes === 1 ? '' : 's'} you came back to a question until it clicked.`);
  if (lines.length === 0) lines.push('You explored.');

  const sessionStart = session?.started_at ? new Date(session.started_at) : new Date(0);
  const { data: gems } = await db
    .from('virtue_gem')
    .select('virtue, evidence, granted_at')
    .eq('learner_id', session!.learner_id)
    .gte('granted_at', sessionStart.toISOString())
    .order('granted_at', { ascending: true });

  return (
    <main className="max-w-xl mx-auto p-6 space-y-5">
      <h1 className="font-display text-[34px] text-center pt-4 text-bark leading-tight" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
        <span className="italic font-[500]">what</span> you noticed today
      </h1>

      <div className="space-y-3">
        {lines.map((l, i) => <DocumentationLine key={i} text={l} />)}
      </div>

      {(gems ?? []).length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="font-display italic text-[14px] text-bark/60 text-center tracking-[0.2em] uppercase">what the garden noticed</div>
          {(gems ?? []).map((g, i) => (
            <VirtueGemMoment
              key={i}
              virtue={g.virtue}
              narrativeText={(g.evidence as any)?.narrativeText ?? ''}
              index={i}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-4 flex-wrap">
        <Link
          href={`/explore?learner=${session?.learner_id}`}
          className="flex-1 bg-white border-4 border-ochre rounded-xl py-4 text-kid-md text-center min-w-[120px]"
          style={{ minHeight: 60 }}
        >🔍 Another?</Link>
        <Link
          href={`/garden?learner=${session?.learner_id}`}
          className="flex-1 bg-sage text-white rounded-xl py-4 text-kid-md text-center min-w-[120px]"
          style={{ minHeight: 60 }}
        >🌿 Garden</Link>
        <Link
          href="/journal"
          className="flex-1 bg-white border-4 border-rose rounded-xl py-4 text-kid-md text-center min-w-[120px]"
          style={{ minHeight: 60 }}
        >📖 Journal</Link>
        <Link
          href="/picker"
          className="flex-1 bg-white border-4 border-ochre rounded-xl py-4 text-kid-md text-center min-w-[120px]"
          style={{ minHeight: 60 }}
        >🏡 Home</Link>
      </div>
    </main>
  );
}
