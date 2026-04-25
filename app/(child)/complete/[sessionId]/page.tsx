import { createServiceClient } from '@/lib/supabase/server';
import DocumentationLine from '@/components/child/DocumentationLine';
import VirtueGemMoment from '@/components/child/VirtueGemMoment';
import CompleteActions from './CompleteActions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CompletePage({ params }: { params: { sessionId: string } }) {
  const db = createServiceClient();

  // Note: session has no skill_id column (it has skill_planned text).
  // Skill info comes through attempt → item → skill below.
  const { data: session } = await db
    .from('session')
    .select('learner_id, items_attempted, items_correct, started_at, ended_at')
    .eq('id', params.sessionId)
    .single();

  const { data: attempts } = await db
    .from('attempt')
    .select('outcome, retry_count, time_ms, item:item_id(type, skill:skill_id(code, name))')
    .eq('session_id', params.sessionId);

  const correctCount = (attempts ?? []).filter(a => a.outcome === 'correct').length;
  const incorrectCount = (attempts ?? []).filter(a => a.outcome === 'incorrect').length;
  const triedMultipleTimes = (attempts ?? []).filter(a => a.retry_count >= 2 && a.outcome === 'correct').length;

  // Total time spent (rough)
  const totalMs = (attempts ?? []).reduce((sum, a: any) => sum + (a.time_ms ?? 0), 0);
  const totalSeconds = Math.round(totalMs / 1000);
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

  // Skills practiced (with how many of each)
  const skillCounts = new Map<string, { name: string; count: number }>();
  for (const a of attempts ?? []) {
    const code = (a as any).item?.skill?.code;
    const name = (a as any).item?.skill?.name;
    if (!code) continue;
    const cur = skillCounts.get(code) ?? { name: name ?? code, count: 0 };
    cur.count += 1;
    skillCounts.set(code, cur);
  }
  const skillsPracticed = Array.from(skillCounts.values()).sort((a, b) => b.count - a.count);

  // Curated documentation lines — prefer specific, observational, brief
  const lines: string[] = [];
  if (correctCount > 0) {
    lines.push(`You answered ${correctCount} question${correctCount === 1 ? '' : 's'} correctly.`);
  }
  if (triedMultipleTimes > 0) {
    lines.push(
      triedMultipleTimes === 1
        ? `Once you came back to a question and stayed with it until it clicked.`
        : `${triedMultipleTimes} times you came back to a question and stayed with it until it clicked.`
    );
  }
  if (incorrectCount > 0 && triedMultipleTimes === 0) {
    lines.push(`Some questions were tricky — that's where learning lives.`);
  }
  if (skillsPracticed.length === 1) {
    lines.push(`You worked at ${skillsPracticed[0].name}.`);
  } else if (skillsPracticed.length > 1) {
    lines.push(`You worked across ${skillsPracticed.length} different skills.`);
  }
  if (lines.length === 0) {
    lines.push('You explored.');
  }

  const sessionStart = session?.started_at ? new Date(session.started_at) : new Date(0);
  const { data: gems } = await db
    .from('virtue_gem')
    .select('virtue, evidence, granted_at')
    .eq('learner_id', session!.learner_id)
    .gte('granted_at', sessionStart.toISOString())
    .order('granted_at', { ascending: true });

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6 pb-20">
      <header className="text-center pt-4 space-y-1">
        <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/50">
          your session
        </div>
        <h1
          className="font-display text-[36px] text-bark leading-tight"
          style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          <span className="italic font-[500] text-forest">what</span> you noticed today
        </h1>
      </header>

      {/* Mini summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="answered" value={correctCount.toString()} accent="forest" />
        <SummaryStat label="minutes" value={totalSeconds < 60 ? `<1` : totalMinutes.toString()} accent="ochre" />
        <SummaryStat label="skills" value={skillsPracticed.length.toString()} accent="rose" />
      </div>

      {/* What you practiced — chip list */}
      {skillsPracticed.length > 0 && (
        <div className="space-y-2">
          <div className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase">
            you worked on
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsPracticed.map(s => (
              <div
                key={s.name}
                className="flex items-center gap-1.5 bg-cream border-2 border-ochre/50 rounded-full px-3 py-1.5"
              >
                <span className="font-display text-[15px] text-bark" style={{ fontWeight: 600 }}>
                  {s.name}
                </span>
                <span className="text-[11px] text-bark/55 font-mono">
                  ×{s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentation lines — observational, no praise */}
      <div className="space-y-3">
        <div className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase">
          observations
        </div>
        <div className="space-y-2.5">
          {lines.map((l, i) => <DocumentationLine key={i} text={l} index={i} />)}
        </div>
      </div>

      {(gems ?? []).length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="font-display italic text-[13px] text-bark/55 text-center tracking-[0.2em] uppercase">
            what the garden noticed
          </div>
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

      <CompleteActions learnerId={session?.learner_id ?? ''} />
    </main>
  );
}

function SummaryStat({
  label, value, accent,
}: {
  label: string;
  value: string;
  accent: 'forest' | 'ochre' | 'rose';
}) {
  const colorMap = {
    forest: 'text-forest',
    ochre: 'text-bark',
    rose: 'text-rose',
  };
  return (
    <div className="bg-white/70 border-2 border-ochre/40 rounded-xl py-3 px-2 text-center">
      <div
        className={`font-display text-[28px] leading-none ${colorMap[accent]}`}
        style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
      >
        {value}
      </div>
      <div className="font-display italic text-[12px] text-bark/55 tracking-[0.1em] uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
