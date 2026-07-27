// components/child/naturalist/WalkChooser.tsx
//
// "What shall we look for today?"
//
// One card per WALK_KINDS entry, stacked one-per-row. Not a grid: at
// portrait width a two-across grid of cards with a title, a blurb and
// a seasonal line is unreadable, and the kana lesson says small
// side-by-side targets are the thing Cecily cannot reliably tap.

'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { WALK_KINDS, walkHref } from '@/lib/world/walks';
import { currentSeason } from '@/lib/world/season';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

export default function WalkChooser({
  open,
  learnerId,
  onClose,
}: {
  open: boolean;
  learnerId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;

  // Rendered on the client, so this is the child's own local season —
  // which is the one she can actually go outside and check.
  const season = currentSeason(new Date().getMonth() + 1);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-label="choose a walk"
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-5 space-y-3 shadow-2xl"
            initial={reduced ? undefined : { y: 24, scale: 0.94, opacity: 0 }}
            animate={reduced ? undefined : { y: 0, scale: 1, opacity: 1 }}
            exit={reduced ? undefined : { y: 16, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <h2
              className="font-display text-[26px] text-bark text-center leading-tight"
              style={{ fontWeight: 600 }}
            >
              what shall we <span className="italic text-terracotta">look for</span>?
            </h2>

            {WALK_KINDS.map((walk, i) => {
              const note = walk.note(season);
              return (
                <motion.button
                  key={walk.code}
                  onClick={() => router.push(walkHref(walk, learnerId))}
                  className="w-full text-left flex items-start gap-4 bg-white/80 border-2 border-ochre/60 rounded-2xl px-4 py-3.5 active:scale-[0.99]"
                  style={{ touchAction: 'manipulation', minHeight: 88 }}
                  initial={reduced ? undefined : { opacity: 0, y: 10 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.35 }}
                >
                  <span className="text-[38px] leading-none pt-0.5" aria-hidden>{walk.emoji}</span>
                  <span className="flex-1">
                    <span
                      className="block font-display text-[21px] text-bark leading-snug"
                      style={{ fontWeight: 600 }}
                    >
                      {walk.title}
                    </span>
                    <span className="block text-kid-sm text-bark/80 leading-snug mt-0.5">
                      {walk.blurb}
                    </span>
                    {note && (
                      <span className="block text-[12px] italic text-forest/90 leading-snug mt-1">
                        {note}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}

            <button
              onClick={onClose}
              className="w-full rounded-full py-3 font-display text-bark/75 border-2 border-ochre/40"
              style={{ touchAction: 'manipulation', minHeight: 52, fontWeight: 600 }}
            >
              not today
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
