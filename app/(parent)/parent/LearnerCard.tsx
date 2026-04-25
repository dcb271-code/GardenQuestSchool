'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ResetConfirmModal from './ResetConfirmModal';

const AVATAR_EMOJI: Record<string, string> = {
  fox: '🦊', bunny: '🐰', cat: '🐈', butterfly: '🦋', frog: '🐸', bee: '🐝',
};

const VIRTUE_EMOJI: Record<string, string> = {
  persistence: '💎', curiosity: '🔍', noticing: '👁️',
  care: '💗', practice: '🔁', courage: '🦁', wondering: '❓',
};

export interface LearnerSummary {
  id: string;
  firstName: string;
  avatarKey: string;
  sessionsAll: number;
  sessionsThisWeek: number;
  correctTotal: number;
  masteryCounts: { new: number; learning: number; review: number; mastered: number };
  totalSkills: number;
  habitatsBuilt: number;
  totalHabitats: number;
  speciesFound: number;
  totalSpecies: number;
  gemsTotal: number;
  gemsRecent: Array<{ virtue: string; narrativeText: string; grantedAt: string | null }>;
  recentSessions: Array<{
    id: string;
    startedAt: string | null;
    endedAt: string | null;
    itemsAttempted: number;
    itemsCorrect: number;
    skillName: string;
  }>;
}

export default function LearnerCard({ summary }: { summary: LearnerSummary }) {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);

  const avatar = AVATAR_EMOJI[summary.avatarKey] ?? '🦊';
  const lastActive = summary.recentSessions[0]?.startedAt;

  const onReset = async (scope: 'habitats' | 'journal' | 'sessions' | 'all') => {
    const res = await fetch(`/api/learner/${summary.id}/reset`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scope }),
    });
    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/40 to-transparent">
        <div className="text-5xl">{avatar}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{summary.firstName}</h2>
          <div className="text-xs text-gray-500 mt-0.5">
            {lastActive
              ? `Last session ${formatRelative(lastActive)}`
              : 'No sessions yet'}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/garden?learner=${summary.id}`}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 font-semibold"
          >
            Open garden
          </Link>
          <Link
            href={`/journal?learner=${summary.id}`}
            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-1.5 font-semibold"
          >
            Journal
          </Link>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4">
        <Stat label="Sessions" value={summary.sessionsAll.toString()} sublabel={`${summary.sessionsThisWeek} this week`} />
        <Stat label="Correct answers" value={summary.correctTotal.toString()} sublabel="all time" />
        <Stat
          label="Skills mastered"
          value={`${summary.masteryCounts.mastered} / ${summary.totalSkills}`}
          sublabel={`${summary.masteryCounts.learning + summary.masteryCounts.review} in progress`}
        />
        <Stat
          label="Garden"
          value={`${summary.habitatsBuilt} / ${summary.totalHabitats}`}
          sublabel={`${summary.speciesFound} of ${summary.totalSpecies} species found`}
        />
      </div>

      {/* Mastery bar */}
      {(() => {
        const total =
          summary.masteryCounts.new +
          summary.masteryCounts.learning +
          summary.masteryCounts.review +
          summary.masteryCounts.mastered;
        if (total === 0) {
          return (
            <div className="px-6 pb-4 text-xs text-gray-500 italic">
              Hasn't started any skills yet.
            </div>
          );
        }
        const pct = (n: number) => (n / total) * 100;
        return (
          <div className="px-6 pb-4">
            <div className="text-xs text-gray-500 mb-1.5 flex justify-between">
              <span>Skill progress</span>
              <span>{summary.masteryCounts.mastered} mastered</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
              <div className="bg-emerald-500" style={{ width: `${pct(summary.masteryCounts.mastered)}%` }} title={`${summary.masteryCounts.mastered} mastered`} />
              <div className="bg-amber-400" style={{ width: `${pct(summary.masteryCounts.review)}%` }} title={`${summary.masteryCounts.review} in review`} />
              <div className="bg-blue-400" style={{ width: `${pct(summary.masteryCounts.learning)}%` }} title={`${summary.masteryCounts.learning} learning`} />
              <div className="bg-gray-200" style={{ width: `${pct(summary.masteryCounts.new)}%` }} title={`${summary.masteryCounts.new} not started`} />
            </div>
            <div className="flex gap-3 mt-1.5 text-[10px] text-gray-500">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> mastered</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400" /> review</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400" /> learning</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-200" /> not started</span>
            </div>
          </div>
        );
      })()}

      {/* Recent sessions + virtues */}
      <div className="grid sm:grid-cols-2 gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
            Recent sessions
          </div>
          {summary.recentSessions.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No sessions yet.</div>
          ) : (
            <ul className="space-y-1.5">
              {summary.recentSessions.map(s => (
                <li key={s.id} className="text-sm text-gray-700 flex items-baseline gap-2">
                  <span className="text-xs text-gray-500 font-mono w-20 shrink-0">
                    {s.startedAt ? formatRelative(s.startedAt) : '—'}
                  </span>
                  <span className="flex-1 truncate">{s.skillName}</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {s.itemsCorrect}/{s.itemsAttempted}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
            Recent virtue gems
          </div>
          {summary.gemsRecent.length === 0 ? (
            <div className="text-sm text-gray-500 italic">None yet.</div>
          ) : (
            <ul className="space-y-1.5">
              {summary.gemsRecent.map((g, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-baseline gap-2">
                  <span className="text-base">{VIRTUE_EMOJI[g.virtue] ?? '💎'}</span>
                  <span className="font-semibold capitalize w-20 shrink-0">{g.virtue}</span>
                  <span className="flex-1 text-gray-600 text-xs italic truncate">
                    {g.narrativeText || '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-white">
        <div className="text-xs text-gray-500">
          {summary.gemsTotal} gem{summary.gemsTotal === 1 ? '' : 's'} earned
        </div>
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="text-xs text-red-700 hover:text-red-900 hover:underline font-semibold"
        >
          Reset progress…
        </button>
      </div>

      <ResetConfirmModal
        open={resetOpen}
        learnerName={summary.firstName}
        onClose={() => setResetOpen(false)}
        onConfirm={onReset}
      />
    </div>
  );
}

function Stat({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
      <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
      {sublabel && <div className="text-[10px] text-gray-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  if (!isFinite(ts)) return '—';
  const now = Date.now();
  const diffMs = now - ts;
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diffMs < min) return 'just now';
  if (diffMs < hour) return `${Math.floor(diffMs / min)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}
