'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type {
  ParagraphComprehensionContent,
  ParagraphComprehensionResponse,
} from '@/lib/packs/reading/types';

/**
 * Grade-3 paragraph comprehension. The paragraph sits in a soft
 * cream "page" panel with generous line-height and a slightly larger
 * type than body so a still-decoding 3rd-grader can chunk it. The
 * question + four answer choices appear underneath.
 *
 * The narrator reads only the QUESTION — never the paragraph. The
 * point of the exercise is for the child to read the paragraph
 * themselves; an auto-narration would defeat it. (The lesson page's
 * 🔊 replay button uses the question text only.)
 *
 * `questionKind` is a small italicised hint shown above the question
 * ("look back & find" / "think about why" / "main idea") so a
 * struggling reader has a strategy hint without the answer being
 * given away.
 */
const KIND_HINT: Record<string, { label: string; emoji: string }> = {
  recall:    { label: 'look back and find', emoji: '🔍' },
  sequence:  { label: 'in what order',      emoji: '↻' },
  inference: { label: 'think about why',    emoji: '💭' },
  main_idea: { label: 'the big idea',       emoji: '✨' },
  vocab:     { label: 'word meaning',       emoji: '📖' },
};

export default function ParagraphComprehension({
  content, onSubmit,
}: {
  content: ParagraphComprehensionContent;
  onSubmit: (r: ParagraphComprehensionResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort(() => Math.random() - 0.5),
    [content.choices],
  );
  const hint = content.questionKind ? KIND_HINT[content.questionKind] : null;

  return (
    <div className="space-y-5 py-2">
      {/* The paragraph — cream page with a soft drop shadow so it
          reads as "the thing to read" not just background. */}
      <motion.div
        className="relative bg-cream/95 border-4 border-ochre/60 rounded-3xl p-5 shadow-md"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Faint top label so the child knows this is the passage */}
        <div className="font-display italic text-[11px] tracking-[0.25em] uppercase text-bark/45 mb-2">
          read this
        </div>
        <p
          className="font-display text-bark"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(18px, 3.6vw, 22px)',
            lineHeight: 1.55,
            letterSpacing: '0.005em',
          }}
        >
          {content.paragraph}
        </p>
      </motion.div>

      {/* Question + strategy hint */}
      <motion.div
        className="text-center px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        {hint && (
          <div className="font-display italic text-[12px] tracking-[0.2em] uppercase text-bark/55 mb-1.5 flex items-center justify-center gap-1.5">
            <span className="not-italic text-base">{hint.emoji}</span>
            <span>{hint.label}</span>
          </div>
        )}
        <div
          className="font-display text-bark/90 italic"
          style={{ fontWeight: 500, fontSize: 'clamp(18px, 3.6vw, 21px)' }}
        >
          {content.question}
        </div>
      </motion.div>

      {/* Choices — vertical so longer phrases breathe */}
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
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.35,
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
