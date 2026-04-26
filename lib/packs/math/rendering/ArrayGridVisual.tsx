'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type {
  ArrayGridVisualContent,
  ArrayGridVisualResponse,
} from '@/lib/packs/math/types';

/**
 * "An array of 3 rows × 4 columns" rendered as a literal grid of
 * emoji items. The child can count by row, by column, or sub-itise
 * — ALL the strategies the multiplication concept is supposed to
 * unlock. Multiple choice underneath.
 */
export default function ArrayGridVisual({
  content, onSubmit,
}: {
  content: ArrayGridVisualContent;
  onSubmit: (r: ArrayGridVisualResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort((a, b) => a - b),
    [content.choices],
  );
  const cells = Array.from({ length: content.rows * content.cols });

  return (
    <div className="space-y-5 py-2">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      <div className="text-center text-bark/80 font-display italic text-[15px]">
        <span className="font-mono not-italic" style={{ fontWeight: 700, fontSize: 22, color: '#5A3B1F' }}>
          {content.rows} × {content.cols}
        </span>
        <span className="mx-2">=</span>
        <span className="text-bark/40">?</span>
      </div>

      {/* The grid — bordered ochre, items revealed with a stagger so
          you can almost feel the count happening */}
      <motion.div
        className="bg-cream/70 border-4 border-ochre/50 rounded-2xl p-4 mx-auto"
        style={{ maxWidth: 320 }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${content.cols}, minmax(0, 1fr))`,
          }}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } } }}
        >
          {cells.map((_, i) => (
            <motion.span
              key={i}
              className="text-center"
              style={{ fontSize: 28, lineHeight: 1 }}
              variants={{
                hidden: { opacity: 0, scale: 0.4 },
                show: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.35, ease: [0.22, 1.4, 0.36, 1] }}
              aria-hidden="true"
            >
              {content.emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Row + column hint chips below the array — like teachers
            do on the whiteboard */}
        <div className="flex justify-center gap-3 mt-3 text-bark/55 font-display italic text-[12px]">
          <span>{content.rows} rows</span>
          <span>·</span>
          <span>{content.cols} in each row</span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.55 } } }}
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
