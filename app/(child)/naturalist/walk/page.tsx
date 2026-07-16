'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import ErrorRetryCard from '@/components/child/ErrorRetryCard';
import WalkProgress from '@/components/child/naturalist/WalkProgress';
import DichotomousStep, { type KeyPhotoRef } from '@/components/child/naturalist/DichotomousStep';
import MysteryPeek from '@/components/child/naturalist/MysteryPeek';
import SpeciesReveal from '@/components/child/naturalist/SpeciesReveal';
import EndOfWalk from '@/components/child/naturalist/EndOfWalk';
import AttributionBadge from '@/components/child/naturalist/AttributionBadge';

interface KeyStepResolved {
  nodeId: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
  correctSide: 'left' | 'right';
}

interface WalkSpecies {
  position: number;
  floraCode: string;
  commonName: string;
  scientificName: string;
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  exposures: number;
  showQuickRecognize: boolean;
  quizOptions?: string[];
  hazard?: string | null;
  safetyNote?: string | null;
  hazardLookalike?: boolean;
  heroPhoto: KeyPhotoRef | null;
  heroRole: string | null;
  keyPath: KeyStepResolved[];
  revealPhotos: KeyPhotoRef[];
}

interface WalkSession {
  id: string;
  species: WalkSpecies[];
}

type Phase = 'loading' | 'intro' | 'quick' | 'key' | 'reveal' | 'done' | 'error';

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
  // Answer-checking state: wrong taps on the current step, total wrong
  // turns for the current species (drives the spacing signal), and
  // which side was last tapped wrongly (drives the nudge UI).
  const [stepMisses, setStepMisses] = useState(0);
  const [speciesMistakes, setSpeciesMistakes] = useState(0);
  const [wrongSide, setWrongSide] = useState<'left' | 'right' | null>(null);
  const [quizMissed, setQuizMissed] = useState(false);

  // Fetch on mount; also re-run from the error screen's "Try again".
  const loadWalk = useCallback(async () => {
    if (!learnerId) {
      setErrorMsg('Missing ?learner=… in URL.');
      setPhase('error');
      return;
    }
    setPhase('loading');
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
      if (!ws.species || ws.species.length === 0) throw new Error('walk has no species');
      setSession(ws);
      setSpeciesIdx(0);
      setKeyStepIdx(0);
      setPhase('intro');
    } catch (e) {
      setErrorMsg((e as Error).message);
      setPhase('error');
    }
  }, [learnerId]);

  useEffect(() => { loadWalk(); }, [loadWalk]);

  const current: WalkSpecies | null = useMemo(
    () => session?.species[speciesIdx] ?? null,
    [session, speciesIdx],
  );
  const total = session?.species.length ?? 0;

  const recordIdentified = useCallback(async (sp: WalkSpecies, cleanRun: boolean) => {
    if (!learnerId) return;
    try {
      await fetch('/api/naturalist/walk/identified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          floraCode: sp.floraCode,
          photoRole: sp.heroRole ?? 'whole',
          cleanRun,
        }),
      });
    } catch {
      // best-effort — never block the walk
    }
  }, [learnerId]);

  const handleKeyChoose = useCallback((side: 'left' | 'right') => {
    if (!current) return;
    const step = current.keyPath[keyStepIdx];
    if (step && side !== step.correctSide) {
      // Wrong turn: nudge, count it, and let her look again. After two
      // misses the correct choice gets highlighted so she's never stuck.
      //
      // EXCEPT for a hazard species, where that would teach exactly the
      // wrong reflex. In front of real poison ivy nobody hands you the
      // answer — and "I couldn't tell" is not a failure state there,
      // it's the correct one. So a second miss resolves to caution
      // instead of to the answer, and we go straight to the reveal.
      const misses = stepMisses + 1;
      setSpeciesMistakes(m => m + 1);
      if (current.hazard && misses >= 2) {
        setWrongSide(null);
        setStepMisses(0);
        setPhase('reveal');
        return;
      }
      setWrongSide(side);
      setStepMisses(misses);
      return;
    }
    setWrongSide(null);
    setStepMisses(0);
    const next = keyStepIdx + 1;
    if (next >= current.keyPath.length) {
      setPhase('reveal');
    } else {
      setKeyStepIdx(next);
    }
  }, [current, keyStepIdx]);

  const handleRevealContinue = useCallback(async () => {
    if (!current) return;
    await recordIdentified(current, speciesMistakes === 0 && !quizMissed);
    if (speciesIdx + 1 >= (session?.species.length ?? 0)) {
      setPhase('done');
    } else {
      setSpeciesIdx(speciesIdx + 1);
      setKeyStepIdx(0);
      setStepMisses(0);
      setSpeciesMistakes(0);
      setWrongSide(null);
      setQuizMissed(false);
      setPhase('intro');
    }
  }, [current, recordIdentified, session, speciesIdx, speciesMistakes, quizMissed]);

  const handleIntroBegin = useCallback(() => {
    if (!current) return;
    if (current.showQuickRecognize) { setPhase('quick'); return; }
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);

  // Quick-recognize name quiz: right name → straight to reveal
  // (real retrieval practice); wrong name → work the key together.
  const handleQuizAnswer = useCallback((name: string) => {
    if (!current) return;
    if (name === current.commonName) {
      setPhase('reveal');
      return;
    }
    setQuizMissed(true);
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);

  // Quick-recognize: "Let me check" → fall through to the key flow.
  const handleQuickCheck = useCallback(() => {
    if (!current) return;
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);

  // The mystery must stay a mystery for screen readers too — the real
  // alt text names the species, so it's swapped out until the reveal.
  const mysteryPhoto = current?.heroPhoto
    ? { ...current.heroPhoto, alt: 'Your mystery plant' }
    : null;

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
      <div className="min-h-[100dvh] flex items-center justify-center">
        <ErrorRetryCard
          message="We could not start a walk just now."
          detail={errorMsg}
          onRetry={loadWalk}
          secondaryLabel="Back to the garden"
          onSecondary={() => router.push(`/garden${learnerId ? `?learner=${learnerId}` : ''}`)}
        />
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
                {mysteryPhoto?.url
                  ? <img src={mysteryPhoto.url} alt={mysteryPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
                {mysteryPhoto?.url && <AttributionBadge attribution={mysteryPhoto.attribution} />}
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

          {phase === 'quick' && (
            <motion.div
              key={`quick-${current.floraCode}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center px-4 text-center max-w-2xl"
            >
              <p className="text-lg md:text-xl text-bark/70 mb-6">
                {(current.quizOptions?.length ?? 0) >= 2
                  ? 'You know this one — which is it?'
                  : 'Do you already know this one?'}
              </p>
              <div className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/15 bg-cream shadow-md aspect-square relative mb-6">
                {mysteryPhoto?.url
                  ? <img src={mysteryPhoto.url} alt={mysteryPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
                {mysteryPhoto?.url && <AttributionBadge attribution={mysteryPhoto.attribution} />}
              </div>
              {(current.quizOptions?.length ?? 0) >= 2 ? (
                <div className="flex gap-3 flex-wrap justify-center">
                  {current.quizOptions!.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleQuizAnswer(name)}
                      className="px-6 py-4 rounded-full bg-cream border-2 border-bark/25 hover:border-terracotta text-bark font-display text-lg shadow-md active:scale-[0.97] transition-transform"
                      style={{ minHeight: 60, touchAction: 'manipulation' }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={handleQuickCheck}
                    className="px-8 py-4 rounded-full bg-forest text-cream font-display text-xl shadow-md"
                    style={{ minHeight: 60, touchAction: 'manipulation' }}
                  >
                    Let me check
                  </button>
                </div>
              )}
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
              <div className="flex justify-center mb-4 px-4">
                <MysteryPeek
                  photo={mysteryPhoto}
                  emoji={current.emoji}
                  reducedMotion={reducedMotion}
                />
              </div>
              <DichotomousStep
                question={current.keyPath[keyStepIdx].question}
                leftLabel={current.keyPath[keyStepIdx].leftLabel}
                rightLabel={current.keyPath[keyStepIdx].rightLabel}
                leftPhoto={current.keyPath[keyStepIdx].leftPhoto}
                rightPhoto={current.keyPath[keyStepIdx].rightPhoto}
                onChoose={handleKeyChoose}
                wrongSide={wrongSide}
                // Hazard species never get the answer handed to them —
                // handleKeyChoose resolves those to caution instead.
                revealCorrect={
                  !current.hazard && stepMisses >= 2
                    ? current.keyPath[keyStepIdx].correctSide
                    : null
                }
                cautionNudge={!!current.hazard}
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
                hazard={current.hazard ?? null}
                safetyNote={current.safetyNote ?? null}
                hazardLookalike={current.hazardLookalike ?? false}
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
