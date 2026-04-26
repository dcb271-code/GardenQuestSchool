'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type {
  SentenceComprehensionContent,
  SentenceComprehensionResponse,
} from '@/lib/packs/reading/types';

/**
 * Read-and-answer item: a short sentence sits on top in big readable
 * type, then a question + multiple choice underneath.
 *
 * Choices are randomized once per item so the correct answer's slot
 * isn't predictable across re-renders. The hosted narrator (in the
 * lesson page) reads only the prompt — the SENTENCE itself is left
 * for the child to read silently or out loud, since reading IS the
 * exercise. The question and the choices are shown but not narrated;
 * the child can tap the "🔊 read this" button if they need help.
 */
export default function SentenceComprehension({
  content, onSubmit,
}: {
  content: SentenceComprehensionContent;
  onSubmit: (r: SentenceComprehensionResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort(() => Math.random() - 0.5),
    [content.choices],
  );

  return (
    <div className="space-y-6 py-3">
      {/* The sentence — the actual reading target. Kept large and
          well-spaced so a still-decoding 2nd-grader can chunk it. */}
      <motion.div
        className="bg-white border-4 border-sage rounded-2xl p-6 text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div
          className="font-display text-bark"
          style={{
            fontWeight: 600,
            fontSize: 'clamp(22px, 4.4vw, 30px)',
            lineHeight: 1.4,
            letterSpacing: '0.01em',
          }}
        >
          {content.sentence}
        </div>
      </motion.div>

      {/* The question */}
      <motion.div
        className="text-center font-display text-[20px] text-bark/85 italic px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        style={{ fontWeight: 500 }}
      >
        {content.question}
      </motion.div>

      {/* Choices — vertical so longer phrases breathe. */}
      <motion.div
        className="flex flex-col gap-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } },
        }}
      >
        {orderedChoices.map(choice => (
          <motion.button
            key={choice}
            onClick={() => onSubmit({ chosen: choice })}
            className="bg-white hover:bg-rose/15 active:bg-rose/30 border-4 border-rose rounded-2xl px-5 py-4 text-left font-display text-bark"
            style={{
              touchAction: 'manipulation',
              minHeight: 60,
              fontSize: 20,
              fontWeight: 500,
            }}
            variants={{
              hidden: { opacity: 0, x: -12 },
              show: { opacity: 1, x: 0 },
            }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
          >
            {choice}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
