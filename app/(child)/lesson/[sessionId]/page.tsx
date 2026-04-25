'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LessonHeader from '@/components/child/LessonHeader';
import SkillIntroOverlay from '@/components/child/SkillIntroOverlay';
import { getItemHandler, getPromptText } from '@/lib/packs';
import { useNarrator } from '@/lib/audio/useNarrator';
import { useAccessibilitySettings, type ChallengeLevel } from '@/lib/settings/useAccessibilitySettings';
import { playCorrectChime, playSettle, playSoftTap, playPageTurn } from '@/lib/audio/sfx';

interface ItemPayload {
  itemId: string;
  type: string;
  content: any;
  audioUrl?: string;
  learnerId?: string;
  skillCode?: string;
  themeTitle?: string;
  themeEmoji?: string;
  progress?: { attempted: number; cap: number };
}

type LessonStatus = 'loading' | 'ready' | 'correct' | 'retry' | 'moving-on';

export default function LessonPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const { settings, update } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [item, setItem] = useState<ItemPayload | null>(null);
  const [status, setStatus] = useState<LessonStatus>('loading');
  const [retries, setRetries] = useState(0);
  const [shakeToken, setShakeToken] = useState(0);
  const [learnerId, setLearnerId] = useState<string | null>(null);
  const startTime = useRef<number>(Date.now());

  const promptText = item
    ? getPromptText({
        id: item.itemId,
        skillId: '',
        type: item.type,
        content: item.content,
        answer: {},
        difficultyElo: 1000,
        generatedBy: 'seed',
      })
    : '';
  const { replay } = useNarrator(promptText);

  const endSession = useCallback(async (target?: string) => {
    await fetch(`/api/session/${params.sessionId}/end`, { method: 'POST' });
    router.push(target ?? `/complete/${params.sessionId}`);
  }, [params.sessionId, router]);

  const loadNext = useCallback(async () => {
    setStatus('loading');
    setRetries(0);
    try {
      const challenge = settings.challengeLevel ?? 'normal';
      const res = await fetch(`/api/session/${params.sessionId}/item?challenge=${challenge}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.learnerId) setLearnerId(data.learnerId);
      if (data.ended) {
        endSession();
        return;
      }
      setItem(data);
      startTime.current = Date.now();
      setStatus('ready');
      // Soft page-turn sound on transition between items
      playPageTurn();
    } catch (err) {
      console.error('Failed to load next item:', err);
      // Don't crash — push the user back to the garden gracefully.
      router.push('/picker');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.sessionId, endSession, router, settings.challengeLevel]);

  const MAX_RETRIES = 2;

  const submit = async (response: any) => {
    if (!item) return;
    const res = await fetch(`/api/session/${params.sessionId}/attempt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        itemId: item.itemId,
        response,
        timeMs: Date.now() - startTime.current,
        retries,
      }),
    });
    const data = await res.json();
    if (data.outcome === 'correct') {
      setStatus('correct');
      playCorrectChime();
      setTimeout(loadNext, 1400);
    } else if (retries >= MAX_RETRIES) {
      setStatus('moving-on');
      playSettle();
      setTimeout(loadNext, 1600);
    } else {
      setShakeToken(t => t + 1);
      setRetries(r => r + 1);
      setStatus('retry');
      playSoftTap();
      setTimeout(() => setStatus('ready'), 650);
      // Re-narrate on retry so the child hears the prompt again.
      // Voice reps: 1 (initial), 2 (after 1st wrong), 3 (after 2nd wrong).
      setTimeout(() => replay(), 1100);
    }
  };

  const skip = async () => {
    if (!item) return;
    await fetch(`/api/session/${params.sessionId}/attempt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        itemId: item.itemId,
        response: { skipped: true },
        timeMs: Date.now() - startTime.current,
        retries,
      }),
    });
    loadNext();
  };

  useEffect(() => { loadNext(); }, [loadNext]);

  const breadcrumb = item
    ? `${item.themeEmoji ?? '🔍'} ${item.themeTitle ?? 'Exploration'}${item.progress ? `  ·  ${item.progress.attempted + 1}/${item.progress.cap}` : ''}`
    : 'Loading…';

  return (
    <main className="max-w-xl mx-auto p-4 min-h-screen flex flex-col">
      <LessonHeader
        breadcrumb={breadcrumb}
        learnerId={learnerId}
        onReplayAudio={() => replay()}
        onWonder={() => {/* Plan 3 virtue detector */}}
        onSkip={item ? skip : undefined}
      />

      <SkillIntroOverlay
        learnerId={learnerId}
        skillCode={item?.skillCode ?? null}
        themeTitle={item?.themeTitle}
        themeEmoji={item?.themeEmoji}
      />

      {/* Challenge chip — child can bump difficulty inline if it's too
          easy or too hard. Persists in accessibility settings. */}
      <ChallengeChip
        level={settings.challengeLevel ?? 'normal'}
        onChange={(next) => update({ challengeLevel: next })}
      />

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div
              key="loading"
              className="text-kid-md text-center py-12 font-display italic text-bark/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              …
            </motion.div>
          )}

          {(status === 'ready' || status === 'retry') && item && (() => {
            const handler = getItemHandler(item.type);
            if (!handler) {
              return (
                <div key="unknown" className="text-red-600">
                  Unknown item type: {item.type}
                </div>
              );
            }
            const Renderer = handler.renderer;
            return (
              <motion.div
                key={item.itemId}
                initial={reducedMotion ? undefined : { opacity: 0, x: 28, rotate: 0.4 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0, rotate: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -28, rotate: -0.4 }}
                transition={{ duration: 0.45, ease: [0.25, 0.85, 0.35, 1] }}
              >
                <motion.div
                  key={`shake-${shakeToken}`}
                  initial={reducedMotion ? undefined : { x: 0 }}
                  animate={shakeToken > 0 && !reducedMotion
                    ? { x: [0, -8, 8, -6, 6, -3, 0] }
                    : { x: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <Renderer
                    content={item.content}
                    onSubmit={submit}
                    retries={retries}
                  />
                </motion.div>
                <AnimatePresence>
                  {retries > 0 && status === 'ready' && (
                    <motion.div
                      key="retry-msg"
                      className="text-center mt-6 font-display italic text-terracotta text-[17px]"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                    >
                      let&apos;s look at it again — this is the hard part <span className="not-italic">before</span> it gets easy
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })()}

          {status === 'correct' && <CorrectFeedback key="correct" reducedMotion={reducedMotion} />}
          {status === 'moving-on' && <MovingOnFeedback key="moving-on" reducedMotion={reducedMotion} />}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ChallengeChip({
  level, onChange,
}: {
  level: ChallengeLevel;
  onChange: (next: ChallengeLevel) => void;
}) {
  const ORDER: ChallengeLevel[] = ['easier', 'normal', 'harder'];
  const META: Record<ChallengeLevel, { emoji: string; label: string }> = {
    easier: { emoji: '🌱', label: 'easier' },
    normal: { emoji: '🍃', label: 'just right' },
    harder: { emoji: '🔥', label: 'harder' },
  };
  const idx = ORDER.indexOf(level);
  const cur = META[level] ?? META.normal;
  const canDown = idx > 0;
  const canUp = idx < ORDER.length - 1;
  return (
    <div className="flex items-center gap-2 justify-center pb-2 text-bark/65">
      <button
        onClick={() => canDown && onChange(ORDER[idx - 1])}
        disabled={!canDown}
        className="font-display italic text-[12px] px-2 py-1 rounded-full border border-ochre/40 bg-white/70 disabled:opacity-30"
        style={{ touchAction: 'manipulation', minHeight: 30 }}
        aria-label="too hard — make it easier"
      >
        ◀ too hard
      </button>
      <div className="font-display italic text-[13px] flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream/80 border border-ochre/40">
        <span className="not-italic">{cur.emoji}</span>
        {cur.label}
      </div>
      <button
        onClick={() => canUp && onChange(ORDER[idx + 1])}
        disabled={!canUp}
        className="font-display italic text-[12px] px-2 py-1 rounded-full border border-ochre/40 bg-white/70 disabled:opacity-30"
        style={{ touchAction: 'manipulation', minHeight: 30 }}
        aria-label="too easy — make it harder"
      >
        too easy ▶
      </button>
    </div>
  );
}

function CorrectFeedback({ reducedMotion }: { reducedMotion: boolean }) {
  const petals = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      i,
      dx: Math.cos(angle) * 120,
      dy: Math.sin(angle) * 120,
      color: ['#FFB7C5', '#FFD166', '#E6B0D0', '#95B88F'][i % 4],
    };
  });
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* soft ambient bloom */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 1.8] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <div
          className="w-56 h-56 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 230, 150, 0.55), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* petals bursting outward */}
      {!reducedMotion && (
        <svg className="absolute pointer-events-none" width="260" height="260" viewBox="-130 -130 260 260">
          {petals.map(p => (
            <motion.ellipse
              key={p.i}
              cx={0}
              cy={0}
              rx={8}
              ry={4}
              fill={p.color}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.9, rotate: 0 }}
              animate={{ x: p.dx, y: p.dy, scale: 1.3, opacity: 0, rotate: 180 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 4px ${p.color})` }}
            />
          ))}
        </svg>
      )}

      {/* SVG check — draws itself in */}
      <motion.svg
        width="140" height="140" viewBox="-70 -70 140 140"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1.4, 0.36, 1], delay: 0.1 }}
      >
        <circle cx={0} cy={0} r={50} fill="#F5EBDC" stroke="#6B8E5A" strokeWidth={3} />
        <motion.path
          d="M -22 0 L -6 18 L 24 -18"
          stroke="#6B8E5A"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
        />
      </motion.svg>

      <motion.div
        className="font-display italic text-[22px] text-forest mt-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        yes
      </motion.div>
    </motion.div>
  );
}

function MovingOnFeedback({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.svg
        width="100" height="100" viewBox="-50 -50 100 100"
        initial={reducedMotion ? undefined : { scale: 0.7, opacity: 0 }}
        animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 0.9, 0.34, 1] }}
      >
        {/* Soft leaf / seed shape — "we'll plant this for later" */}
        <ellipse cx={0} cy={0} rx={28} ry={16} fill="#C8E4B0" stroke="#6B8E5A" strokeWidth={2.5} />
        <path d="M -26 0 Q 0 -6 26 0" stroke="#6B8E5A" strokeWidth={1.5} fill="none" opacity={0.6} />
        <ellipse cx={0} cy={0} rx={20} ry={10} fill="#D7EFB9" opacity={0.7} />
      </motion.svg>
      <motion.div
        className="font-display italic text-[20px] text-bark/80 mt-4 max-w-xs"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        we&apos;ll come back to this one
      </motion.div>
    </motion.div>
  );
}
