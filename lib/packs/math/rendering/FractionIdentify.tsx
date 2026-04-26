'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import FractionPie from './FractionPie';
import type {
  FractionIdentifyContent,
  FractionIdentifyResponse,
} from '@/lib/packs/math/types';

/**
 * "What fraction of this shape is shaded?"
 *
 * Single FractionPie (or bar) up top, four formatted-string choices
 * underneath. The choices include the correct fraction plus three
 * common-confusion distractors (off-by-one numerator, swapped
 * num/den, larger denominator with same num, etc. — all decided in
 * the seed).
 */
export default function FractionIdentify({
  content, onSubmit,
}: {
  content: FractionIdentifyContent;
  onSubmit: (r: FractionIdentifyResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort(() => Math.random() - 0.5),
    [content.choices],
  );

  return (
    <div className="space-y-5 py-2 flex flex-col items-center">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40 max-w-md w-full">
        {content.promptText}
      </div>

      <FractionPie
        numerator={content.numerator}
        denominator={content.denominator}
        shape={content.shape}
        size={content.shape === 'pie' ? 200 : 280}
      />

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
            style={{
              touchAction: 'manipulation',
              minHeight: 60,
              fontSize: 32,
              fontWeight: 700,
              color: '#5A3B1F',
              letterSpacing: '0.04em',
            }}
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
