'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KeyPhotoRef } from './DichotomousStep';
import AttributionBadge from './AttributionBadge';

export interface MysteryPeekProps {
  photo: KeyPhotoRef | null;
  emoji: string;
  reducedMotion: boolean;
}

/**
 * Lets the child revisit the mystery plant's photo while answering
 * dichotomous-key questions: a small "Your plant" thumbnail that opens
 * a full-screen look, then returns to the question exactly where she
 * left off.
 */
export default function MysteryPeek({ photo, emoji, reducedMotion }: MysteryPeekProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Look at your plant again"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-full bg-cream border-2 border-bark/20 hover:border-terracotta shadow-sm pl-1.5 pr-5 py-1.5 active:scale-[0.97] transition-transform"
        style={{ minHeight: 60, touchAction: 'manipulation' }}
      >
        <span className="block w-12 h-12 rounded-full overflow-hidden border border-bark/15 bg-bark/10 relative shrink-0">
          {photo?.url
            ? <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
            : <span className="absolute inset-0 flex items-center justify-center text-2xl">{emoji}</span>
          }
        </span>
        <span className="font-display text-bark text-lg">Your plant 🔍</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Your plant"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-bark/80 flex flex-col items-center justify-center px-4"
            onClick={() => setOpen(false)}
          >
            <div className="w-full max-w-lg rounded-3xl overflow-hidden border-4 border-cream/40 bg-cream shadow-xl aspect-square relative mb-5">
              {photo?.url
                ? <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center text-8xl">{emoji}</div>
              }
              {photo?.url && <AttributionBadge attribution={photo.attribution} />}
            </div>
            <button
              type="button"
              aria-label="Back to the question"
              onClick={() => setOpen(false)}
              className="px-8 py-4 rounded-full bg-cream text-bark font-display text-xl shadow-md"
              style={{ minHeight: 60, touchAction: 'manipulation' }}
            >
              Back to the question →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
