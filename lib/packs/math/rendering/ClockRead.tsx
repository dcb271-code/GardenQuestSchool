'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ClockFace from './ClockFace';
import type { ClockReadContent, ClockReadResponse } from '@/lib/packs/math/types';

/**
 * Hand-drawn-style analog clock face. Twelve hour numerals around a
 * cream face, sixty minute marks (12 emphasised), short stubby hour
 * hand and longer minute hand in the project's terracotta palette.
 *
 * Hands are positioned by the standard formulas:
 *   minute angle = (minute / 60) * 360
 *   hour angle   = ((hour % 12) / 12) * 360 + (minute / 60) * 30
 * (i.e. the hour hand drifts continuously between numerals as the
 *  minutes advance, which is the realistic look children see on
 *  classroom clocks.)
 *
 * The choices are rendered in randomized order so the right answer
 * isn't always in the same slot.
 */
export default function ClockRead({
  content, onSubmit,
}: {
  content: ClockReadContent;
  onSubmit: (r: ClockReadResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort(() => Math.random() - 0.5),
    [content.choices],
  );

  return (
    <div className="space-y-5 py-2 flex flex-col items-center">
      {/* Prompt */}
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40 max-w-md w-full">
        {content.promptText}
      </div>

      {/* Clock face — shared component, used by ClockRead + ClockInterval */}
      <ClockFace hour={content.hour} minute={content.minute} size={220} />

      {/* Choices */}
      <motion.div
        className="grid grid-cols-2 gap-3 w-full max-w-md"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
      >
        {orderedChoices.map(c => (
          <motion.button
            key={c}
            onClick={() => onSubmit({ chosen: c })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl py-5 font-mono"
            style={{ touchAction: 'manipulation', minHeight: 60, fontSize: 32, fontWeight: 700, color: '#5A3B1F' }}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
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
