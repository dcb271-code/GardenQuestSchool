'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonHeader({
  breadcrumb, learnerId, onReplayAudio, onWonder, onSkip,
}: {
  breadcrumb: string;
  learnerId?: string | null;
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

        <div
          className="flex-1 text-center truncate font-display text-[17px] text-bark/85"
          style={{ fontWeight: 500, letterSpacing: '-0.005em' }}
        >
          {breadcrumb}
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
