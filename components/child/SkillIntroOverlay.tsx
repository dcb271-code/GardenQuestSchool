'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * One-time intro card shown the first time a learner ever encounters a
 * given skill. Explains the three universal affordances: hear it again,
 * tap an answer, skip if needed. Stored per-learner+skill in
 * localStorage so it never appears twice.
 */
export default function SkillIntroOverlay({
  learnerId, skillCode, themeTitle, themeEmoji,
}: {
  learnerId: string | null;
  skillCode: string | null;
  themeTitle?: string;
  themeEmoji?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!learnerId || !skillCode) return;
    try {
      const key = `gqs:skill-intro:${learnerId}:${skillCode}`;
      if (!window.localStorage.getItem(key)) {
        // Brief delay so the lesson page settles first
        const t = setTimeout(() => setVisible(true), 350);
        return () => clearTimeout(t);
      }
    } catch { /* localStorage blocked */ }
  }, [learnerId, skillCode]);

  const dismiss = () => {
    if (learnerId && skillCode) {
      try {
        window.localStorage.setItem(`gqs:skill-intro:${learnerId}:${skillCode}`, '1');
      } catch { /* ignore */ }
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.55))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          <motion.div
            className="bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-6xl">{themeEmoji ?? '🌿'}</div>
            <div>
              <div className="font-display italic text-[13px] tracking-[0.3em] uppercase text-bark/55">
                you found
              </div>
              <h2
                className="font-display text-[28px] text-bark leading-tight mt-1"
                style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                <span className="italic text-forest">{themeTitle ?? 'a new spot'}</span>
              </h2>
            </div>

            <div className="space-y-3 text-left bg-white/60 border-2 border-ochre/40 rounded-xl p-4">
              <Tip emoji="🔊" label="listen" body="i'll read each one to you — tap the speaker to hear it again" />
              <Tip emoji="👆" label="tap your answer" body="pick the choice you think is right" />
              <Tip emoji="🍃" label="trip up?" body="give it another try — that's how it gets easier" />
            </div>

            <motion.button
              onClick={dismiss}
              className="w-full bg-forest text-white rounded-full py-4 font-display"
              style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="italic font-[500]">let&apos;s</span> begin
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Tip({ emoji, label, body }: { emoji: string; label: string; body: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="text-xl shrink-0 mt-0.5">{emoji}</div>
      <div className="flex-1">
        <div className="font-display text-[16px] text-bark italic" style={{ fontWeight: 600 }}>
          {label}
        </div>
        <div className="font-display italic text-[13px] text-bark/65 leading-snug">
          {body}
        </div>
      </div>
    </div>
  );
}
