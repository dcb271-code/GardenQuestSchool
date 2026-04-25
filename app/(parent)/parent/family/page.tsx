'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AddLearnerModal from '@/components/child/AddLearnerModal';

const AVATARS: Array<{ key: string; emoji: string; label: string }> = [
  { key: 'fox', emoji: '🦊', label: 'Fox' },
  { key: 'bunny', emoji: '🐰', label: 'Bunny' },
  { key: 'cat', emoji: '🐈', label: 'Cat' },
  { key: 'butterfly', emoji: '🦋', label: 'Butterfly' },
  { key: 'frog', emoji: '🐸', label: 'Frog' },
  { key: 'bee', emoji: '🐝', label: 'Bee' },
];

interface Learner {
  id: string;
  first_name: string;
  avatar_key: string;
}

export default function FamilyPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const res = await fetch('/api/learner');
    const data = await res.json();
    setLearners(data.learners ?? []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Family</h2>
        <Link href="/picker" className="text-sm text-blue-700 hover:underline">
          ← back to app
        </Link>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          Learners ({learners.length})
        </h3>
        <div className="space-y-2">
          {!loaded && (
            <div className="text-sm text-gray-500 italic">loading…</div>
          )}
          {loaded && learners.length === 0 && (
            <div className="text-sm text-gray-500 italic">No learners yet — add one below.</div>
          )}
          {learners.map(l => (
            <Link
              key={l.id}
              href={`/garden?learner=${l.id}`}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="text-3xl">
                {AVATARS.find(a => a.key === l.avatar_key)?.emoji ?? '🦊'}
              </div>
              <div className="flex-1 font-medium text-gray-900">{l.first_name}</div>
              <div className="text-sm text-blue-600">open garden →</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-semibold transition-colors"
        >
          + Add a learner
        </button>
      </div>

      <AddLearnerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(l) => setLearners(prev => [...prev, l])}
      />
    </div>
  );
}
