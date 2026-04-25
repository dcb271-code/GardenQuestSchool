'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ExpeditionCard from '@/components/child/ExpeditionCard';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

interface Candidate {
  skillCode: string;
  title: string;
  themeEmoji: string;
  skillHint: string;
  structureCode?: string | null;
  structureLabel?: string;
  zone?: string;
  correctCount?: number;
  target?: number;
  completed?: boolean;
  unlocksLabel?: string | null;
}

export default function ExploreClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const learnerId = sp.get('learner');
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
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

  if (loading) {
    return <div className="text-center font-display italic text-bark/60 py-8">…</div>;
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.1,
            delayChildren: 0.2,
          },
        },
      }}
    >
      {candidates.map((c, i) => (
        <motion.div
          key={c.skillCode}
          variants={{
            hidden: { opacity: 0, x: reducedMotion ? 0 : -20 },
            show: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.55, ease: [0.22, 0.9, 0.34, 1] }}
        >
          <ExpeditionCard
            emoji={c.themeEmoji}
            title={c.title}
            hint={c.skillHint}
            structureLabel={c.structureLabel}
            zone={c.zone}
            correctCount={c.correctCount}
            target={c.target}
            completed={c.completed}
            unlocksLabel={c.unlocksLabel ?? null}
            onSelect={() => start(c.skillCode)}
            index={i}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
