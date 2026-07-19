'use client';

// Luna's Lost Treasure — the adventure phase machine.
//
// Renders the current scene of the saved episode. Narration/choices
// advance via the adventure API; practice gates start a REAL focus
// session and hand off to the normal lesson page with
// ?returnTo=<here>, then verify completion server-side (gate-check)
// when the child comes back. The story cannot advance past a gate
// from the client.

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorRetryCard from '@/components/child/ErrorRetryCard';
import { useNarrator } from '@/lib/audio/useNarrator';
import { playSparkle, playPageTurn } from '@/lib/audio/sfx';
import {
  getEpisode, type LunaAdventureState, type SceneArt,
} from '@/lib/world/lunaAdventure';
import {
  StoryScene, ChoiceScene, GateScene, EpisodeDone,
} from '@/components/child/adventure/scenes';

type Phase = 'loading' | 'story' | 'error';

interface Interstitial { text: string; art: SceneArt }

export default function LunaAdventurePage() {
  return (
    <Suspense fallback={null}>
      <LunaAdventureInner />
    </Suspense>
  );
}

function LunaAdventureInner() {
  const router = useRouter();
  const learnerId = useSearchParams().get('learner');
  const [phase, setPhase] = useState<Phase>('loading');
  const [state, setState] = useState<LunaAdventureState | null>(null);
  // Choice responses and gate afterText show as a one-beat narration
  // card before the (already-advanced) next scene renders.
  const [interstitial, setInterstitial] = useState<Interstitial | null>(null);
  const [gateStarting, setGateStarting] = useState(false);
  const [gateStumble, setGateStumble] = useState(false);

  const episode = state ? getEpisode(state.episode) : null;
  const scene = episode?.scenes[state?.sceneIndex ?? 0] ?? null;
  const atEnd = !!episode && !!state && state.sceneIndex >= episode.scenes.length - 1
    && scene?.kind === 'narration';

  const post = useCallback(async (action: any) => {
    const res = await fetch('/api/adventure/luna', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, action }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, [learnerId]);

  // Load state; if we're returning from a gate session, verify it.
  useEffect(() => {
    if (!learnerId) return;
    (async () => {
      try {
        const { state: s } = await (await fetch(`/api/adventure/luna?learner=${learnerId}`)).json();
        if (s.pendingGate) {
          const ep = getEpisode(s.episode);
          const gateScene = ep?.scenes.find(
            sc => sc.kind === 'gate' && sc.id === s.pendingGate.gateId,
          );
          const checked = await post({ type: 'gate-check' });
          setState(checked.state);
          if (checked.gatePassed && gateScene?.kind === 'gate') {
            playSparkle();
            setInterstitial({ text: gateScene.afterText, art: gateScene.art });
          } else if (!checked.gatePassed) {
            setGateStumble(true);
          }
        } else {
          setState(s);
        }
        setPhase('story');
      } catch {
        setPhase('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerId]);

  // Narrate whatever text is on screen.
  const spokenText = interstitial?.text
    ?? (scene?.kind === 'narration' ? scene.text
      : scene?.kind === 'choice' ? scene.prompt
      : scene?.kind === 'gate' ? scene.inviteText
      : '');
  useNarrator(phase === 'story' ? spokenText : '', false);

  const advance = async () => {
    playPageTurn();
    if (interstitial) { setInterstitial(null); return; }
    try {
      const { state: s } = await post({ type: 'advance' });
      setState(s);
    } catch { setPhase('error'); }
  };

  const choose = async (choiceId: string, optionId: string) => {
    if (scene?.kind !== 'choice') return;
    const option = scene.options.find(o => o.id === optionId);
    playPageTurn();
    try {
      const { state: s } = await post({ type: 'choose', choiceId, optionId });
      setState(s);
      if (option) setInterstitial({ text: option.responseText, art: scene.art });
    } catch { setPhase('error'); }
  };

  const beginGate = async () => {
    if (scene?.kind !== 'gate' || !learnerId || gateStarting) return;
    setGateStarting(true);
    setGateStumble(false);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, focusSubject: scene.focusSubject }),
      });
      const { sessionId } = await res.json();
      if (!sessionId) throw new Error('no session');
      await post({ type: 'gate-start', gateId: scene.id, sessionId });
      const here = `/adventure/luna?learner=${learnerId}`;
      router.push(`/lesson/${sessionId}?returnTo=${encodeURIComponent(here)}`);
    } catch {
      setGateStarting(false);
      setPhase('error');
    }
  };

  const completeEpisode = async () => {
    try {
      const { state: s } = await post({ type: 'complete-episode' });
      setState(s);
      router.push(`/garden?learner=${learnerId}`);
    } catch { setPhase('error'); }
  };

  if (!learnerId) {
    return <div className="p-6 font-display italic">No learner found — <Link href="/picker" className="underline">choose an explorer</Link>.</div>;
  }

  return (
    <main className="min-h-[100dvh] flex flex-col p-5 pb-10 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/garden?learner=${learnerId}`}
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back to garden"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <div className="flex-1 text-center">
          <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
            luna&apos;s lost treasure
          </div>
          {episode && (
            <div className="font-display text-[20px] text-bark leading-tight" style={{ fontWeight: 600 }}>
              <span className="italic text-forest">{episode.title.toLowerCase()}</span>
            </div>
          )}
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div className="flex-1 flex items-center">
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div key="loading" className="w-full text-center font-display italic text-bark/60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Luna is on her way…
            </motion.div>
          )}

          {phase === 'error' && (
            <div key="error" className="w-full">
              <ErrorRetryCard onRetry={() => window.location.reload()} />
            </div>
          )}

          {phase === 'story' && interstitial && (
            <div key={`inter-${state?.sceneIndex}`} className="w-full">
              <StoryScene text={interstitial.text} art={interstitial.art} onContinue={advance} />
            </div>
          )}

          {phase === 'story' && !interstitial && scene && (
            <div key={`${state?.episode}-${state?.sceneIndex}`} className="w-full">
              {scene.kind === 'narration' && !atEnd && (
                <StoryScene text={scene.text} art={scene.art} onContinue={advance} />
              )}
              {scene.kind === 'narration' && atEnd && (
                <StoryScene
                  text={scene.text} art={scene.art}
                  onContinue={completeEpisode}
                  continueLabel="close the book"
                />
              )}
              {scene.kind === 'choice' && (
                <ChoiceScene scene={scene} onChoose={id => choose(scene.id, id)} />
              )}
              {scene.kind === 'gate' && (
                <div className="space-y-3">
                  {gateStumble && (
                    <div className="text-center font-display italic text-[14px] text-terracotta">
                      that try didn&apos;t quite finish — Luna is patient, let&apos;s go again
                    </div>
                  )}
                  <GateScene scene={scene} starting={gateStarting} onBegin={beginGate} />
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
