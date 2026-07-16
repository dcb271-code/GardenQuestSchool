'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

export interface FocusSubjectCard {
  code: string;
  name: string;
  emoji: string;
  hint: string;
  practicedSkills: number;
  dueCount: number;
}

export default function FocusClient({
  learnerId, subjects,
}: {
  learnerId: string;
  subjects: FocusSubjectCard[];
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const startFocus = async (subjectCode: string) => {
    if (starting) return;
    setStarting(subjectCode);
    setError(false);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, focusSubject: subjectCode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { sessionId } = await res.json();
      router.push(`/lesson/${sessionId}`);
    } catch (err) {
      console.error('Failed to start focus session:', err);
      setStarting(null);
      setError(true);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6 min-h-screen space-y-8 pb-16">
      <header className="flex items-center gap-3 pt-2">
        <Link
          href={`/garden?learner=${learnerId}`}
          className="text-xl p-1.5 rounded-full bg-white border border-ochre"
          aria-label="back to the garden"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <div>
          <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/50">
            the practice nook
          </div>
          <h1
            className="font-display text-[30px] text-bark leading-tight"
            style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            <span className="italic font-[500] text-forest">what</span> shall we practice?
          </h1>
        </div>
      </header>

      <p className="font-display italic text-[16px] text-bark/70">
        pick a subject for five questions from the skills you&apos;ve been growing —
        the garden will choose the ones that need you most.
      </p>

      <div className="space-y-4">
        {subjects.map((s, i) => {
          const empty = s.practicedSkills === 0;
          return (
            <motion.button
              key={s.code}
              type="button"
              disabled={empty || starting !== null}
              onClick={() => startFocus(s.code)}
              className={`w-full text-left flex items-center gap-4 bg-white/80 border-2 rounded-2xl px-5 py-4 shadow-sm ${
                empty
                  ? 'border-ochre/30 opacity-50'
                  : 'border-ochre/60 hover:border-forest/60 active:scale-[0.99]'
              }`}
              style={{ touchAction: 'manipulation', minHeight: 84 }}
              initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
            >
              <span className="text-[40px]" aria-hidden>{s.emoji}</span>
              <span className="flex-1">
                <span
                  className="block font-display text-[22px] text-bark"
                  style={{ fontWeight: 600 }}
                >
                  {starting === s.code ? 'gathering questions…' : s.name}
                </span>
                <span className="block font-display italic text-[14px] text-bark/60">
                  {empty ? 'nothing to review here yet — explore first!' : s.hint}
                </span>
              </span>
              {!empty && s.dueCount > 0 && (
                <span className="font-display text-[12px] text-forest bg-sage/25 border border-sage rounded-full px-2.5 py-1 whitespace-nowrap">
                  {s.dueCount} to review
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Future subjects tease — kept honest: no tap target. */}
        <motion.div
          className="flex items-center gap-4 border-2 border-dashed border-ochre/40 rounded-2xl px-5 py-4 opacity-60"
          initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
          animate={reducedMotion ? undefined : { opacity: 0.6, y: 0 }}
          transition={{ delay: 0.1 + subjects.length * 0.08, duration: 0.45 }}
        >
          <span className="text-[32px]" aria-hidden>🌱</span>
          <span className="font-display italic text-[15px] text-bark/60">
            more subjects are sprouting — spelling is on its way
          </span>
        </motion.div>
      </div>

      {error && (
        <p className="font-display italic text-[15px] text-terracotta text-center">
          hmm, that didn&apos;t work — give it another tap
        </p>
      )}
    </main>
  );
}
