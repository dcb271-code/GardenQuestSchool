// app/(child)/garden/grow/HarvestCelebration.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

const PETAL_COLORS = ['#FFB7C5', '#FFD93D', '#E8A87C', '#FFFAF2', '#C38D9E'];

export default function HarvestCelebration({ open, reducedMotion = false }: { open: boolean; reducedMotion?: boolean }) {
  if (reducedMotion) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-6xl">🌷</div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none z-40"
          viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid meet"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {Array.from({ length: 30 }, (_, i) => {
            const startX = 720 + (Math.random() - 0.5) * 60;
            const startY = 450 + (Math.random() - 0.5) * 60;
            const endX = startX + (Math.random() - 0.5) * 600;
            const endY = startY + 200 + Math.random() * 300;
            const color = PETAL_COLORS[i % PETAL_COLORS.length];
            return (
              <motion.path key={i}
                d="M 0 -5 Q 4 -2 4 2 Q 3 5 0 6 Q -3 5 -4 2 Q -4 -2 0 -5 Z"
                fill={color} stroke="#5A3B1F" strokeWidth={0.5}
                initial={{ x: startX, y: startY, rotate: 0, opacity: 0 }}
                animate={{ x: endX, y: endY, rotate: 360 + Math.random() * 360, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, delay: i * 0.02, ease: 'easeOut' }} />
            );
          })}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
