'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SightWordTapContent, SightWordTapResponse } from '@/lib/packs/reading/types';

/**
 * "Hear a word, pick it" — listening-first. The target word is hidden in
 * the prompt for the first two attempts so the child has to listen; on
 * the third attempt the word fades in as a gentle hint.
 */
export default function SightWordTap({
  content, onSubmit, retries,
}: {
  content: SightWordTapContent;
  onSubmit: (r: SightWordTapResponse) => void;
  retries: number;
}) {
  const choices = useMemo(() => {
    const all = [content.word, ...content.distractors];
    return [...all].sort(() => Math.random() - 0.5);
  }, [content.word, content.distractors]);

  // Progressive disclosure of the target word in the prompt.
  const revealHint = retries >= 2;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center bg-cream/60 p-6 rounded-2xl border-2 border-ochre/40">
        <PromptWithHiddenWord
          promptText={content.promptText}
          word={content.word}
          revealHint={revealHint}
        />
        {!revealHint && (
          <div className="font-display italic text-[14px] text-bark/60 mt-2 tracking-wider">
            🔊 listen carefully
          </div>
        )}
        {revealHint && (
          <div className="font-display italic text-[13px] text-bark/55 mt-2 tracking-wider">
            here it is…
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {choices.map((w, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: w })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl text-kid-lg py-8 font-bold"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function PromptWithHiddenWord({
  promptText, word, revealHint,
}: {
  promptText: string;
  word: string;
  revealHint: boolean;
}) {
  // Split the prompt around the quoted word. Patterns like:
  //   Where is "the"?  |  Show me "the".  |  Find "dog".
  // If the word isn't quoted, replace its first occurrence.
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const quoted = new RegExp(`"${escaped}"`, 'i');
  let before = '';
  let after = '';
  let wordDisplay = `"${word}"`;

  const m = promptText.match(quoted);
  if (m && m.index !== undefined) {
    before = promptText.slice(0, m.index);
    after = promptText.slice(m.index + m[0].length);
  } else {
    const bareRegex = new RegExp(`\\b${escaped}\\b`, 'i');
    const m2 = promptText.match(bareRegex);
    if (m2 && m2.index !== undefined) {
      before = promptText.slice(0, m2.index);
      after = promptText.slice(m2.index + m2[0].length);
      wordDisplay = word;
    } else {
      // Word not found in prompt — show the whole thing and the word below
      return (
        <div>
          <div className="font-display text-[22px] text-bark" style={{ fontWeight: 600 }}>{promptText}</div>
        </div>
      );
    }
  }

  return (
    <div className="font-display text-[24px] text-bark leading-relaxed" style={{ fontWeight: 600 }}>
      <span>{before}</span>
      <AnimatePresence mode="wait">
        {revealHint ? (
          <motion.span
            key="revealed"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="inline-block text-terracotta"
            style={{ fontWeight: 700 }}
          >
            {wordDisplay}
          </motion.span>
        ) : (
          <motion.span
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-block align-middle mx-1 px-2 py-0.5 rounded-md bg-ochre/30 border-2 border-dashed border-ochre/60 text-ochre/80"
            style={{ fontWeight: 600, letterSpacing: '0.15em' }}
          >
            ◦◦◦
          </motion.span>
        )}
      </AnimatePresence>
      <span>{after}</span>
    </div>
  );
}
