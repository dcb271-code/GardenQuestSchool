'use client';

import { useState } from 'react';

type Scope = 'habitats' | 'journal' | 'sessions' | 'all';

interface ScopeOption {
  scope: Scope;
  label: string;
  description: string;
  warningLevel: 'mild' | 'medium' | 'severe';
}

const OPTIONS: ScopeOption[] = [
  {
    scope: 'habitats',
    label: 'Habitats',
    description: 'Wipes built habitats and the journal so the learner can experience the build-quests again. Skill progress untouched.',
    warningLevel: 'mild',
  },
  {
    scope: 'journal',
    label: 'Journal only',
    description: 'Wipes discovered species (and the queued arrival). Habitats and skill progress stay.',
    warningLevel: 'mild',
  },
  {
    scope: 'sessions',
    label: 'Sessions & skill progress',
    description: 'Wipes attempts, sessions, and per-skill mastery state. Skills look brand-new again. Habitats and journal stay.',
    warningLevel: 'medium',
  },
  {
    scope: 'all',
    label: 'Everything',
    description: 'Wipes attempts, sessions, skill progress, habitats, journal, virtue gems, and world state. Full fresh start.',
    warningLevel: 'severe',
  },
];

const COLOR: Record<ScopeOption['warningLevel'], string> = {
  mild:   'border-blue-200 bg-blue-50/50 hover:border-blue-400',
  medium: 'border-amber-200 bg-amber-50/50 hover:border-amber-500',
  severe: 'border-red-200 bg-red-50/50 hover:border-red-500',
};

export default function ResetConfirmModal({
  open, learnerName, onClose, onConfirm,
}: {
  open: boolean;
  learnerName: string;
  onClose: () => void;
  onConfirm: (scope: Scope) => Promise<void>;
}) {
  const [pending, setPending] = useState<Scope | null>(null);

  if (!open) return null;

  const handle = async (scope: Scope) => {
    if (pending) return;
    const opt = OPTIONS.find(o => o.scope === scope)!;
    const confirmText = opt.warningLevel === 'severe'
      ? `Wipe EVERYTHING for ${learnerName}? This cannot be undone.`
      : `Reset ${opt.label.toLowerCase()} for ${learnerName}?`;
    if (!window.confirm(confirmText)) return;
    setPending(scope);
    try {
      await onConfirm(scope);
      onClose();
    } finally {
      setPending(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
      onClick={() => !pending && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Reset {learnerName}'s progress
          </h3>
          <button
            type="button"
            onClick={() => !pending && onClose()}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Pick a scope. The reset is server-side and immediate — useful for testing, demos, or letting a learner re-experience things.
        </p>

        <div className="space-y-2">
          {OPTIONS.map(opt => (
            <button
              key={opt.scope}
              type="button"
              onClick={() => handle(opt.scope)}
              disabled={!!pending}
              className={`w-full text-left rounded-lg border-2 p-3 transition-colors disabled:opacity-50 ${COLOR[opt.warningLevel]}`}
            >
              <div className="flex items-baseline justify-between">
                <div className="font-semibold text-gray-900">{opt.label}</div>
                {pending === opt.scope && (
                  <div className="text-xs text-gray-500 italic">resetting…</div>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 italic pt-1">
          You'll be asked to confirm each one before it actually runs.
        </div>
      </div>
    </div>
  );
}
