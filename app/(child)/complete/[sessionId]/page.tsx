import { createServiceClient } from '@/lib/supabase/server';
import DocumentationLine from '@/components/child/DocumentationLine';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CompletePage({ params }: { params: { sessionId: string } }) {
  const db = createServiceClient();

  const { data: session } = await db
    .from('session')
    .select('learner_id, items_attempted, items_correct')
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

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-kid-lg text-center pt-4">✨ What you noticed today</h1>
      <div className="space-y-3">
        {lines.map((l, i) => <DocumentationLine key={i} text={l} />)}
      </div>
      <div className="flex gap-3 pt-4">
        <Link
          href="/picker"
          className="flex-1 bg-sage text-white rounded-xl py-4 text-kid-md text-center"
          style={{ minHeight: 60 }}
        >🌿 Done for now</Link>
        <Link
          href={`/explore?learner=${session?.learner_id}`}
          className="flex-1 bg-white border-4 border-ochre rounded-xl py-4 text-kid-md text-center"
          style={{ minHeight: 60 }}
        >🔍 Another?</Link>
      </div>
    </main>
  );
}
