'use client';

import { useState } from 'react';
import type { LearnerSummary } from './LearnerCard';

/**
 * Remove a learner profile for good.
 *
 * This is the only irreversible action in the parent area, and the
 * situation that produces it — two profiles with the same name, created
 * minutes apart by a double-tap — is exactly the situation where a
 * parent is most likely to pick the wrong card. Two profiles named
 * "Otto" are indistinguishable in the picker and are NOT usually
 * equivalent: one may hold habitats the child built, the other letters
 * she wrote.
 *
 * So the modal does not ask "are you sure". It shows what is inside
 * THIS profile — sessions, correct answers, habitats, species, gems —
 * and requires the name to be typed. If the numbers on screen don't
 * look like the profile you meant to remove, that is the signal to
 * stop, and it arrives before anything is destroyed rather than after.
 */

export default function DeleteProfileModal({
  open, summary, canDelete, onClose, onDeleted,
}: {
  open: boolean;
  summary: LearnerSummary;
  /** False when this is the last profile — there'd be no way back in. */
  canDelete: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const matches = typed.trim() === summary.firstName.trim();

  const contents: Array<[string, number]> = [
    ['practice sessions', summary.sessionsAll],
    ['correct answers', summary.correctTotal],
    ['habitats built', summary.habitatsBuilt],
    ['species discovered', summary.speciesFound],
    ['virtue gems', summary.gemsTotal],
    ['letters written', summary.lettersWritten],
    ['skills mastered', summary.masteryCounts.mastered],
  ];
  const hasHistory = contents.some(([, n]) => n > 0);

  const remove = async () => {
    if (!matches || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/learner/${summary.id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirmName: typed.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? res.statusText);
        return;
      }
      onDeleted();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
      onClick={() => !busy && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Remove {summary.firstName}'s profile
          </h3>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {!canDelete ? (
          <p className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            This is the only profile. Removing it would leave no way back
            into the child side of the app, so it can't be deleted. Add
            another profile first if you want to replace this one.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              This deletes the profile and everything in it, permanently.
              There is no undo. Check the numbers below match the profile
              you mean — duplicates share a name but rarely share a history.
            </p>

            <div className="rounded-lg border-2 border-red-200 bg-red-50/50 p-3">
              <div className="text-xs font-semibold text-red-900 uppercase tracking-wide mb-1.5">
                What this profile holds
              </div>
              {hasHistory ? (
                <ul className="text-sm text-gray-800 space-y-0.5">
                  {contents.filter(([, n]) => n > 0).map(([label, n]) => (
                    <li key={label}>
                      <span className="font-semibold">{n}</span> {label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-700 italic">
                  Nothing yet — no sessions, habitats, or discoveries.
                </div>
              )}
            </div>

            <label className="block text-sm text-gray-700">
              Type <span className="font-bold">{summary.firstName}</span> to confirm:
              <input
                type="text"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                disabled={busy}
                autoFocus
                className="mt-1 w-full rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none disabled:opacity-50"
                placeholder={summary.firstName}
              />
            </label>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 rounded-lg p-2">{error}</div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => !busy && onClose()}
                className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={!matches || busy}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600"
              >
                {busy ? 'Removing…' : 'Remove permanently'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
