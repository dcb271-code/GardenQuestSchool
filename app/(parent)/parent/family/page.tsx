'use client';

import { useEffect, useState } from 'react';

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
  const [name, setName] = useState('');
  const [avatarKey, setAvatarKey] = useState('fox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/learner');
    const data = await res.json();
    setLearners(data.learners ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/learner', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: name, avatarKey }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'failed');
    } else {
      setName('');
      setAvatarKey('fox');
      await load();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-bold">Family</h2>

      <div>
        <h3 className="font-semibold mb-2">Learners</h3>
        <div className="space-y-2">
          {learners.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-3xl">
                {AVATARS.find(a => a.key === l.avatar_key)?.emoji ?? '🦊'}
              </div>
              <div className="flex-1">{l.first_name}</div>
            </div>
          ))}
          {learners.length === 0 && <div className="text-sm text-gray-500">No learners yet.</div>}
        </div>
      </div>

      <form onSubmit={add} className="space-y-3 border-t pt-4">
        <h3 className="font-semibold">Add a learner</h3>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="First name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <div>
          <div className="text-sm text-gray-600 mb-2">Pick an avatar</div>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map(a => (
              <button
                type="button"
                key={a.key}
                onClick={() => setAvatarKey(a.key)}
                className={`text-3xl p-3 rounded-lg border-2 ${avatarKey === a.key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                aria-label={a.label}
              >{a.emoji}</button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
        >{loading ? 'Adding…' : 'Add learner'}</button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  );
}
