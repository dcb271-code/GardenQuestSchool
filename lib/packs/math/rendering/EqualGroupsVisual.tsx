'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type {
  EqualGroupsVisualContent,
  EqualGroupsVisualResponse,
} from '@/lib/packs/math/types';

/**
 * "3 groups of 4" rendered as 3 soft sage rings, each containing 4
 * emoji items arranged in a small ring/cluster. The child can
 * literally see the structure of multiplication: rings × items.
 */
export default function EqualGroupsVisual({
  content, onSubmit,
}: {
  content: EqualGroupsVisualContent;
  onSubmit: (r: EqualGroupsVisualResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort((a, b) => a - b),
    [content.choices],
  );

  const groupIdxs = Array.from({ length: content.groups }, (_, i) => i);

  return (
    <div className="space-y-5 py-2">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      {/* Show the multiplication expression underneath the image */}
      <div className="text-center text-bark/80 font-display italic text-[15px]">
        <span className="font-mono not-italic" style={{ fontWeight: 700, fontSize: 22, color: '#5A3B1F' }}>
          {content.groups} × {content.each}
        </span>
        <span className="mx-2">=</span>
        <span className="text-bark/40">?</span>
      </div>

      {/* Groups of items in soft sage rings */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 px-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
      >
        {groupIdxs.map(g => (
          <motion.div
            key={g}
            className="bg-sage/15 border-4 border-sage rounded-3xl p-3 flex items-center justify-center"
            style={{ minWidth: 100, minHeight: 100, maxWidth: 140 }}
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              show: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.5, ease: [0.22, 1.4, 0.36, 1] }}
          >
            <ClusterOfItems count={content.each} emoji={content.emoji} />
          </motion.div>
        ))}
      </motion.div>

      {/* Choices */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.45 } } }}
      >
        {orderedChoices.map(c => (
          <motion.button
            key={c}
            onClick={() => onSubmit({ chosen: c })}
            className="bg-white hover:bg-rose/15 active:bg-rose/30 border-4 border-rose rounded-2xl py-5 font-display"
            style={{ touchAction: 'manipulation', minHeight: 60, fontSize: 32, fontWeight: 700, color: '#5A3B1F' }}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
          >
            {c}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Layout `count` emoji items in a small cluster:
 *   1, 2 → straight row
 *   3, 4 → 2×2 grid (with one empty for 3)
 *   5, 6 → 2 rows of 3
 *   7, 8 → 2 rows of 4
 *   9, 10 → 3 rows of 3 / 2 rows of 5
 *
 * Keeps clusters visually compact so the child can sub-itise the
 * count without having to actually count.
 */
function ClusterOfItems({ count, emoji }: { count: number; emoji: string }) {
  // Choose grid columns by item count for a friendly compact shape.
  const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : count <= 8 ? 4 : 3;
  const items = Array.from({ length: count });
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((_, i) => (
        <span
          key={i}
          className="text-2xl text-center"
          aria-hidden="true"
          style={{ lineHeight: 1 }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
