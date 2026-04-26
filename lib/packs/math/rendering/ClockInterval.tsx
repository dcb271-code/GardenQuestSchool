'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ClockFace from './ClockFace';
import type {
  ClockIntervalContent,
  ClockIntervalResponse,
} from '@/lib/packs/math/types';

/**
 * Two analog clock faces side by side ("now" / "then"), with a soft
 * arrow between them. Multiple choice underneath with formatted
 * interval strings ("35 minutes", "1 hour 15 min").
 *
 * The two clocks are visibly the same kind so the comparison is
 * honest — the difference between the hands is the answer.
 */
export default function ClockInterval({
  content, onSubmit,
}: {
  content: ClockIntervalContent;
  onSubmit: (r: ClockIntervalResponse) => void;
  retries: number;
}) {
  const orderedChoices = useMemo(
    () => content.choices.slice().sort(() => Math.random() - 0.5),
    [content.choices],
  );

  return (
    <div className="space-y-5 py-2">
      <div className="text-center font-display text-[19px] text-bark bg-cream/60 p-3 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      {/* Two clocks side by side, with a soft arrow indicating "later" */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <ClockFace
          hour={content.startHour}
          minute={content.startMinute}
          size={150}
          label="now"
        />
        <motion.div
          className="text-bark/55 text-3xl pb-6"
          aria-hidden
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          →
        </motion.div>
        <ClockFace
          hour={content.endHour}
          minute={content.endMinute}
          size={150}
          label="then"
        />
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
      >
        {orderedChoices.map(c => (
          <motion.button
            key={c}
            onClick={() => onSubmit({ chosen: c })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl py-5 font-display"
            style={{
              touchAction: 'manipulation',
              minHeight: 60,
              fontSize: 22,
              fontWeight: 600,
              color: '#5A3B1F',
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
