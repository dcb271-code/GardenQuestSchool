'use client';

import { motion } from 'framer-motion';

export default function WalkProgress({
  total, completed, reducedMotion,
}: { total: number; completed: number; reducedMotion: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 py-3" aria-label={`Walk progress: ${completed} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < completed;
        return (
          <motion.span
            key={i}
            className={`inline-block rounded-full ${filled ? 'bg-forest' : 'bg-bark/25'}`}
            initial={false}
            animate={reducedMotion
              ? { width: 12, height: 12 }
              : filled
                ? { width: 28, height: 12 }
                : { width: 12, height: 12 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}
