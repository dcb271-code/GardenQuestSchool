'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

/**
 * First-ever-visit welcome overlay for a learner. Shows a soft pastoral
 * greeting that explains the core affordance ("tap a glowing spot to
 * explore"). Dismissed on tap, and remembered in localStorage so it only
 * ever appears once per learner per device.
 *
 * Storage key: `gqs:garden-welcomed:{learnerId}`
 */
export default function WelcomeOverlay({
  learnerId, firstName,
}: { learnerId: string; firstName?: string | null }) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const key = `gqs:garden-welcomed:${learnerId}`;
      if (!window.localStorage.getItem(key)) {
        // Small delay so the welcome lands after the sisters have emerged
        // from the house.
        const t = setTimeout(() => setVisible(true), 1600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked — silently skip the welcome.
    }
  }, [learnerId]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(`gqs:garden-welcomed:${learnerId}`, '1');
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.35), rgba(20, 25, 40, 0.55))',
            backdropFilter: 'blur(1px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={dismiss}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-7 shadow-2xl text-center space-y-4"
            initial={reducedMotion ? {} : { scale: 0.85, y: 20, opacity: 0 }}
            animate={reducedMotion ? {} : { scale: 1, y: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { scale: 0.9, y: 10, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* ambient light bloom */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 30%, rgba(255, 230, 150, 0.45), transparent 65%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />

            {/* Tiny animated garden vignette at the top */}
            <div className="relative flex justify-center -mt-2">
              <motion.svg
                width="120" height="80" viewBox="-60 -40 120 80"
                initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* sun */}
                <circle cx={-36} cy={-22} r={10} fill="#FFE89A" opacity={0.9} />
                {/* hills */}
                <path d="M -60 18 Q -30 2 0 12 Q 30 22 60 8 L 60 38 L -60 38 Z" fill="#95B88F" />
                {/* tree */}
                <path d="M 14 0 Q 8 -18 22 -22 Q 36 -20 34 -6 Q 28 8 18 6 Q 10 4 14 0 Z" fill="#6B8E5A" />
                <rect x={23} y={6} width={3} height={10} fill="#6B4423" />
                {/* tiny house */}
                <rect x={-36} y={8} width={16} height={12} fill="#C9A880" stroke="#6B4423" strokeWidth={1} />
                <path d="M -38 8 L -28 -4 L -18 8 Z" fill="#5D5A54" stroke="#6B4423" strokeWidth={1} strokeLinejoin="round" />
                <rect x={-30} y={12} width={4} height={8} fill="#C94C3E" />
                {/* path */}
                <path d="M -20 30 Q 0 22 20 25" stroke="#EAD2A8" strokeWidth={5} fill="none" strokeLinecap="round" />
                {/* drifting firefly */}
                {!reducedMotion && (
                  <motion.circle
                    cx={-10} cy={-8} r={1.6} fill="#FFEF99"
                    animate={{ opacity: [0.3, 1, 0.3], cx: [-10, 10, -5, 15], cy: [-8, -14, -6, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255, 230, 120, 0.95))' }}
                  />
                )}
              </motion.svg>
            </div>

            <motion.div
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={reducedMotion ? {} : { opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="font-display italic text-[13px] tracking-[0.3em] uppercase text-bark/55">
                welcome{firstName ? ',' : ''}
              </div>
              <h2
                className="font-display text-[36px] text-bark leading-tight mt-1"
                style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                {firstName ? (
                  <><span className="italic text-forest">{firstName}</span>.</>
                ) : (
                  <>to your <span className="italic text-forest">garden</span></>
                )}
              </h2>
            </motion.div>

            <motion.div
              className="space-y-3 text-left"
              initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Hint emoji="✨" label="glowing spots are open" body="tap one and you'll walk there together" />
              <Hint emoji="🔒" label="others wait their turn" body="finish a spot to open the next" />
              <Hint emoji="🧭" label="the compass up top" body="picks a quest for you" />
              <Hint emoji="📖" label="the field journal" body="remembers what you noticed" />
            </motion.div>

            <motion.button
              onClick={dismiss}
              className="w-full bg-forest text-white rounded-full py-4 font-display text-[18px]"
              style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
              initial={reducedMotion ? {} : { opacity: 0, y: 6 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="italic font-[500]">let&apos;s</span> explore
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hint({ emoji, label, body }: { emoji: string; label: string; body: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="text-xl shrink-0 mt-0.5" aria-hidden="true">{emoji}</div>
      <div className="flex-1">
        <div className="font-display text-[17px] text-bark" style={{ fontWeight: 600 }}>
          <span className="italic">{label}</span>
        </div>
        <div className="font-display italic text-[14px] text-bark/65 leading-snug">
          {body}
        </div>
      </div>
    </div>
  );
}
