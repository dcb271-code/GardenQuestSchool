'use client';

// The morning gate's settings, on the parent dashboard: the cutoff
// hour and up to three chores, each written the way you would say it
// ("get dressed") with a drawn icon. Saves with one button; the
// child's checklist and the code screen read these on their next
// load. Today's code is shown here too, so nobody does arithmetic
// at seven in the morning.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CHORE_ICONS, MAX_CHORES, MAX_CHORE_TEXT, GATED_FIRST_NAMES, CODE_FORMULA, choreQuestion,
  type Chore, type ChoreIcon, type MorningConfig,
} from '@/lib/gate/morning';
import { ChoreGlyph } from '@/components/child/gate/GateArt';

const HOURS = [5, 6, 7, 8, 9, 10];
const ICON_LABEL: Record<ChoreIcon, string> = {
  clothes: 'clothes', dishes: 'dishes', toys: 'toys', bed: 'bed', teeth: 'teeth', backpack: 'bag',
};

export default function MorningSettings({
  initial, todayCode, todayLabel,
}: {
  initial: MorningConfig;
  todayCode: string;
  todayLabel: string;
}) {
  const router = useRouter();
  const [cutoffHour, setCutoffHour] = useState(initial.cutoffHour);
  const [chores, setChores] = useState<Chore[]>(initial.chores);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const dirty = JSON.stringify({ cutoffHour, chores }) !== JSON.stringify(initial);

  const update = (i: number, patch: Partial<Chore>) =>
    setChores(cs => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const remove = (i: number) => setChores(cs => cs.filter((_, j) => j !== i));
  const add = () => setChores(cs => cs.length >= MAX_CHORES ? cs
    : [...cs, { id: `chore-${Date.now().toString(36)}`, text: '', icon: 'toys' }]);

  const save = async () => {
    setSaving(true); setNote(null);
    try {
      const res = await fetch('/api/parent/morning', {
        method: 'PUT', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cutoffHour, chores: chores.filter(c => c.text.trim()) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setNote(d.error ?? 'Could not save.'); return; }
      setNote('Saved.');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mornings</h2>
          <p className="text-sm text-gray-600 mt-1">
            For {GATED_FIRST_NAMES.join(' and ')}: a code before the cutoff, then a chore checklist once a day
            (at least one ticked), then thirty seconds before the garden opens.
          </p>
        </div>
        <p className="text-sm text-gray-800 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          Code for {todayLabel}: <span className="font-mono font-bold text-lg">{todayCode}</span>
          <span className="text-gray-500"> · {CODE_FORMULA}</span>
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm text-gray-800">
        <span className="font-semibold">Code needed before</span>
        <select value={cutoffHour} onChange={e => setCutoffHour(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
          {HOURS.map(h => <option key={h} value={h}>{h}:00 am</option>)}
        </select>
        <span className="text-gray-500">Eastern</span>
      </label>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-800">Chores — written the way you would say them</div>
        {chores.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {CHORE_ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => update(i, { icon })}
                        title={ICON_LABEL[icon]} aria-label={ICON_LABEL[icon]} aria-pressed={c.icon === icon}
                        className="rounded-lg p-0.5"
                        style={{ border: `2px solid ${c.icon === icon ? '#2563eb' : 'transparent'}`, background: c.icon === icon ? '#eff6ff' : 'transparent' }}>
                  <svg viewBox="0 0 48 48" width={30} height={30} aria-hidden><ChoreGlyph icon={icon} /></svg>
                </button>
              ))}
            </div>
            <input value={c.text} maxLength={MAX_CHORE_TEXT} placeholder="get dressed"
                   onChange={e => update(i, { text: e.target.value })}
                   className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px]" />
            <span className="text-xs text-gray-500 italic min-w-[160px]">{c.text.trim() ? `“${choreQuestion(c)}”` : ''}</span>
            <button type="button" onClick={() => remove(i)} aria-label="remove chore"
                    className="text-xs text-gray-500 hover:text-red-700 px-1.5">✕</button>
          </div>
        ))}
        {chores.length < MAX_CHORES && (
          <button type="button" onClick={add} className="text-sm text-blue-700 hover:underline">+ add a chore</button>
        )}
        {chores.length === 0 && <p className="text-xs text-gray-500">No chores means no checklist — just the morning code.</p>}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void save()} disabled={saving || !dirty}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm font-semibold">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {note && <span className="text-sm text-gray-700">{note}</span>}
      </div>
    </section>
  );
}
