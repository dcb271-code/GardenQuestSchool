'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type {
  EqualShareVisualContent,
  EqualShareVisualResponse,
} from '@/lib/packs/math/types';

/**
 * "12 acorns shared equally among 3 squirrels — how many for each?"
 *
 * The renderer shows `groups` containers (plates / bowls / nests in
 * sage rings) along the bottom and `total` items already distributed
 * — `total / groups` per container. The animation staggers items
 * appearing in their group so the child visually sees the
 * distribution happen.
 *
 * The `÷` expression is shown above the picture so the symbolic
 * connection is explicit.
 */
export default function EqualShareVisual({
  content, onSubmit,
}: {
  content: EqualShareVisualContent;
  onSubmit: (r: EqualShareVisualResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort((a, b) => a - b),
    [content.choices],
  );

  const each = Math.floor(content.total / content.groups);
  const groupIdxs = Array.from({ length: content.groups }, (_, i) => i);

  return (
    <div className="space-y-5 py-2">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      {/* Symbolic reminder: total ÷ groups = ? */}
      <div className="text-center text-bark/80 font-display italic text-[15px]">
        <span className="font-mono not-italic" style={{ fontWeight: 700, fontSize: 22, color: '#5A3B1F' }}>
          {content.total} ÷ {content.groups}
        </span>
        <span className="mx-2">=</span>
        <span className="text-bark/40">?</span>
      </div>

      {/* Containers + items */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 px-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
      >
        {groupIdxs.map(g => (
          <motion.div
            key={g}
            className="bg-sage/15 border-4 border-sage rounded-3xl p-3 flex flex-col items-center gap-2"
            style={{ minWidth: 96, minHeight: 110, maxWidth: 160 }}
            variants={{
              hidden: { opacity: 0, scale: 0.7 },
              show: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.45, ease: [0.22, 1.4, 0.36, 1] }}
          >
            {/* Container glyph (plate / nest / bowl) */}
            <div className="text-2xl" aria-hidden>
              {content.groupEmoji}
            </div>
            {/* The items distributed into this group */}
            <ItemCluster count={each} emoji={content.emoji} groupIndex={g} />
          </motion.div>
        ))}
      </motion.div>

      {/* Choices */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } } }}
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
 * Lay out `count` items in a tight cluster — same logic as the
 * EqualGroupsVisual ItemCluster but factored locally to keep this
 * file self-contained.
 */
function ItemCluster({
  count, emoji, groupIndex,
}: { count: number; emoji: string; groupIndex: number }) {
  const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : count <= 8 ? 4 : 3;
  const items = Array.from({ length: count });
  return (
    <motion.div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 + groupIndex * 0.08 } },
      }}
    >
      {items.map((_, i) => (
        <motion.span
          key={i}
          className="text-xl text-center"
          aria-hidden
          variants={{
            hidden: { opacity: 0, scale: 0.4 },
            show: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.35, ease: [0.22, 1.4, 0.36, 1] }}
          style={{ lineHeight: 1 }}
        >
          {emoji}
        </motion.span>
      ))}
    </motion.div>
  );
}
