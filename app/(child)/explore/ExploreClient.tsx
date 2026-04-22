'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExpeditionCard from '@/components/child/ExpeditionCard';

interface Candidate {
  skillCode: string;
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export default function ExploreClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const learnerId = sp.get('learner');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!learnerId) return;
    fetch(`/api/plan/candidates?learner=${learnerId}`)
      .then(r => r.json())
      .then(data => {
        setCandidates(data.candidates ?? []);
        setLoading(false);
      });
  }, [learnerId]);

  const start = async (skillCode: string) => {
    const res = await fetch('/api/session/start', {
      method: 'POST',
      body: JSON.stringify({ learnerId, skillCode }),
      headers: { 'content-type': 'application/json' },
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  return (
    <>
      {loading && <div className="text-center text-kid-sm opacity-70">…</div>}
      <div className="flex flex-col gap-4">
        {candidates.map(c => (
          <ExpeditionCard
            key={c.skillCode}
            emoji={c.themeEmoji}
            title={c.title}
            hint={c.skillHint}
            onSelect={() => start(c.skillCode)}
          />
        ))}
      </div>
    </>
  );
}
