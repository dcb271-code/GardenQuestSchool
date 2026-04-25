'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export interface LessonProgress {
  attempted: number;     // 0-indexed: 0 means we're serving item #1
  cap: number;           // SESSION_ITEM_CAP
  tier?: 'easy' | 'mid' | 'hard';
}

export default function LessonHeader({
  breadcrumb, learnerId, progress, onReplayAudio, onWonder, onSkip,
}: {
  breadcrumb: string;
  learnerId?: string | null;
  progress?: LessonProgress;
  onReplayAudio?: () => void;
  onWonder?: () => void;
  onSkip?: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const exitTo = learnerId ? `/garden?learner=${learnerId}` : '/picker';

  const handleExit = () => {
    // Stop walking away mid-session by accident — confirm first.
    setConfirming(true);
  };

  const goExit = () => {
    setConfirming(false);
    router.push(exitTo);
  };

  return (
    <>
      <motion.div
        className="flex justify-between items-center py-4 gap-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.button
          onClick={handleExit}
          aria-label="exit to garden"
          className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
          style={{
            touchAction: 'manipulation', minWidth: 44, minHeight: 44,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
        >
          <span className="text-bark/70">✕</span>
        </motion.button>

        <div className="flex-1 flex flex-col items-center min-w-0">
          <div
            className="text-center truncate font-display text-[17px] text-bark/85 max-w-full"
            style={{ fontWeight: 500, letterSpacing: '-0.005em' }}
          >
            {breadcrumb}
          </div>
          {progress && progress.cap > 0 && (
            <DifficultyRamp
              attempted={progress.attempted}
              cap={progress.cap}
              tier={progress.tier ?? 'easy'}
            />
          )}
        </div>

        <div className="flex gap-2">
          {onSkip && (
            <motion.button
              onClick={onSkip}
              aria-label="skip this question"
              className="font-display italic text-[15px] px-3 py-1 rounded-full bg-white border border-ochre/70 text-bark/70 hover:bg-ochre/10"
              style={{ touchAction: 'manipulation', minHeight: 44 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
            >
              skip
            </motion.button>
          )}
          <motion.button
            onClick={onReplayAudio}
            aria-label="replay audio"
            className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
            style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
          >
            🔊
          </motion.button>
          <motion.button
            onClick={onWonder}
            aria-label="wondering"
            className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
            style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
          >
            ❓
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.35), rgba(20, 25, 40, 0.55))',
              backdropFilter: 'blur(2px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setConfirming(false)}
          >
            <motion.div
              className="bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4"
              initial={{ scale: 0.9, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl">🍃</div>
              <h3
                className="font-display text-[22px] text-bark leading-tight"
                style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
              >
                <span className="italic text-forest">stop here</span> for now?
              </h3>
              <p className="font-display italic text-[15px] text-bark/65 leading-snug">
                you can come back to the garden any time
              </p>
              <div className="flex gap-3 pt-1">
                <motion.button
                  onClick={() => setConfirming(false)}
                  className="flex-1 bg-white border-4 border-ochre rounded-full py-3 font-display italic text-bark/75"
                  style={{ touchAction: 'manipulation', minHeight: 56 }}
                  whileTap={{ scale: 0.96 }}
                >
                  keep going
                </motion.button>
                <motion.button
                  onClick={goExit}
                  className="flex-1 bg-sage text-white rounded-full py-3 font-display"
                  style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                  whileTap={{ scale: 0.96 }}
                >
                  back to garden
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Tiny "the activity gets harder as you go" indicator — five seedlings
 * climbing into a small tree. The current item is highlighted, past
 * items are filled-in (sage), upcoming ones are pale outlines. The
 * size step subtly says "this one is bigger than the last."
 *
 * `attempted` is 0-indexed: 0 means we're serving item #1.
 */
function DifficultyRamp({
  attempted, cap, tier,
}: {
  attempted: number;
  cap: number;
  tier: 'easy' | 'mid' | 'hard';
}) {
  const positions = Array.from({ length: cap }).map((_, i) => i);
  const tierLabel =
    tier === 'easy' ? 'warming up' :
    tier === 'mid'  ? 'finding your stride' :
                      'the climb';
  return (
    <div className="flex items-center gap-1.5 mt-0.5 select-none" aria-label={`${tierLabel} — item ${attempted + 1} of ${cap}`}>
      {positions.map(i => {
        const past = i < attempted;
        const current = i === attempted;
        // Visual size step: each plant a little bigger than the last
        // so the eye reads "growing into something."
        const radius = 2.4 + i * 0.55;
        return (
          <svg key={i} width={14} height={16} viewBox="-7 -8 14 16">
            {/* stem */}
            <line
              x1={0} y1={6}
              x2={0} y2={6 - radius * 1.5}
              stroke={current ? '#6B8E5A' : past ? '#95B88F' : '#C8D4BE'}
              strokeWidth={current ? 1.6 : 1.2}
              strokeLinecap="round"
            />
            {/* leaf / crown */}
            <ellipse
              cx={0}
              cy={6 - radius * 1.5}
              rx={radius}
              ry={radius * 0.85}
              fill={
                current ? '#FFD93D' :   // sun-yellow highlight
                past    ? '#95B88F' :
                          '#FFFFFF'
              }
              stroke={
                current ? '#E8A87C' :
                past    ? '#6B8E5A' :
                          '#C8D4BE'
              }
              strokeWidth={current ? 1.6 : 1.1}
            />
          </svg>
        );
      })}
      <span
        className="font-display italic text-[11px] text-bark/55 ml-1"
      >
        {tierLabel}
      </span>
    </div>
  );
}
