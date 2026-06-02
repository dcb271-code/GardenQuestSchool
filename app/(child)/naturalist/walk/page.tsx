'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import WalkProgress from '@/components/child/naturalist/WalkProgress';
import DichotomousStep, { type KeyPhotoRef } from '@/components/child/naturalist/DichotomousStep';
import SpeciesReveal from '@/components/child/naturalist/SpeciesReveal';
import EndOfWalk from '@/components/child/naturalist/EndOfWalk';

interface KeyStepResolved {
  nodeId: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
}

interface WalkSpecies {
  position: number;
  floraCode: string;
  commonName: string;
  scientificName: string;
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  heroPhoto: KeyPhotoRef | null;
  keyPath: KeyStepResolved[];
  revealPhotos: KeyPhotoRef[];
}

interface WalkSession {
  id: string;
  species: WalkSpecies[];
}

type Phase = 'loading' | 'intro' | 'key' | 'reveal' | 'done' | 'error';

function NaturalistWalkInner() {
  const router = useRouter();
  const params = useSearchParams();
  const learnerId = params.get('learner');
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  const [session, setSession] = useState<WalkSession | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [speciesIdx, setSpeciesIdx] = useState(0);
  const [keyStepIdx, setKeyStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch on mount
  useEffect(() => {
    if (!learnerId) {
      setErrorMsg('Missing ?learner=… in URL.');
      setPhase('error');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/naturalist/walk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learnerId, n: 3 }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `walk fetch failed: ${res.status}`);
        }
        const ws: WalkSession = await res.json();
        if (cancelled) return;
        if (!ws.species || ws.species.length === 0) throw new Error('walk has no species');
        setSession(ws);
        setSpeciesIdx(0);
        setKeyStepIdx(0);
        setPhase('intro');
      } catch (e) {
        if (cancelled) return;
        setErrorMsg((e as Error).message);
        setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, [learnerId]);

  const current: WalkSpecies | null = useMemo(
    () => session?.species[speciesIdx] ?? null,
    [session, speciesIdx],
  );
  const total = session?.species.length ?? 0;

  const recordIdentified = useCallback(async (sp: WalkSpecies) => {
    if (!learnerId) return;
    try {
      await fetch('/api/naturalist/walk/identified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          floraCode: sp.floraCode,
          photoRole: 'whole',
        }),
      });
    } catch {
      // best-effort — never block the walk
    }
  }, [learnerId]);

  const handleKeyChoose = useCallback(() => {
    if (!current) return;
    const next = keyStepIdx + 1;
    if (next >= current.keyPath.length) {
      setPhase('reveal');
    } else {
      setKeyStepIdx(next);
    }
  }, [current, keyStepIdx]);

  const handleRevealContinue = useCallback(async () => {
    if (!current) return;
    await recordIdentified(current);
    if (speciesIdx + 1 >= (session?.species.length ?? 0)) {
      setPhase('done');
    } else {
      setSpeciesIdx(speciesIdx + 1);
      setKeyStepIdx(0);
      setPhase('intro');
    }
  }, [current, recordIdentified, session, speciesIdx]);

  const handleIntroBegin = useCallback(() => {
    if (!current) return;
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);

  // ── render ─────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-bark/60 italic">
        Looking for something growing nearby…
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center text-bark gap-3 px-4 text-center">
        <p className="text-xl">We could not start a walk just now.</p>
        <p className="text-bark/60">{errorMsg}</p>
        <button
          type="button"
          onClick={() => router.push(`/garden${learnerId ? `?learner=${learnerId}` : ''}`)}
          className="mt-4 px-6 py-3 rounded-full bg-bark/80 text-cream font-display"
          style={{ minHeight: 60 }}
        >
          Back to the garden
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="min-h-[100dvh] py-8">
        <EndOfWalk
          cards={(session?.species ?? []).map(s => ({
            floraCode: s.floraCode,
            commonName: s.commonName,
            heroPhoto: s.heroPhoto,
            emoji: s.emoji,
          }))}
          learnerId={learnerId ?? ''}
          reducedMotion={reducedMotion}
        />
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl md:text-2xl font-display text-bark">Today's walk</h1>
        <button
          type="button"
          aria-label="Exit walk"
          onClick={() => router.push(`/garden${learnerId ? `?learner=${learnerId}` : ''}`)}
          className="rounded-full bg-bark/10 text-bark hover:bg-bark/20"
          style={{ width: 60, height: 60 }}
        >
          ✕
        </button>
      </header>

      <WalkProgress total={total} completed={speciesIdx + (phase === 'reveal' ? 1 : 0)} reducedMotion={reducedMotion} />

      <main className="flex-1 flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key={`intro-${current.floraCode}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center px-4 text-center max-w-2xl"
            >
              <p className="text-lg md:text-xl text-bark/70 mb-6">
                Let's look at something growing here.
              </p>
              <div className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/15 bg-cream shadow-md aspect-square relative mb-6">
                {current.heroPhoto?.url
                  ? <img src={current.heroPhoto.url} alt={current.heroPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
              </div>
              <button
                type="button"
                onClick={handleIntroBegin}
                className="px-8 py-4 rounded-full bg-terracotta text-cream font-display text-xl shadow-md"
                style={{ minHeight: 60, touchAction: 'manipulation' }}
              >
                Begin →
              </button>
            </motion.div>
          )}

          {phase === 'key' && current.keyPath[keyStepIdx] && (
            <motion.div
              key={`key-${current.floraCode}-${keyStepIdx}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full"
            >
              <DichotomousStep
                question={current.keyPath[keyStepIdx].question}
                leftLabel={current.keyPath[keyStepIdx].leftLabel}
                rightLabel={current.keyPath[keyStepIdx].rightLabel}
                leftPhoto={current.keyPath[keyStepIdx].leftPhoto}
                rightPhoto={current.keyPath[keyStepIdx].rightPhoto}
                onChoose={handleKeyChoose}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          )}

          {phase === 'reveal' && (
            <motion.div
              key={`reveal-${current.floraCode}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <SpeciesReveal
                commonName={current.commonName}
                scientificName={current.scientificName}
                heroPhoto={current.heroPhoto}
                revealPhotos={current.revealPhotos}
                notableFeatures={current.notableFeatures}
                facts={current.facts}
                emoji={current.emoji}
                onContinue={handleRevealContinue}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary for static prerender in
// Next.js 14 (the page is otherwise statically generated at build time).
export default function NaturalistWalkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center text-bark/60 italic">
          Looking for something growing nearby…
        </div>
      }
    >
      <NaturalistWalkInner />
    </Suspense>
  );
}
