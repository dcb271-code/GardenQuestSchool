'use client';

import { motion } from 'framer-motion';

const DIRECTIONS = [
  { label: 'north', dir: 'N', color: '#6B8E5A' },
  { label: 'east',  dir: 'E', color: '#E8A87C' },
  { label: 'south', dir: 'S', color: '#C38D9E' },
];

export default function ExpeditionCard({
  emoji, title, hint, onSelect, index = 0,
}: {
  emoji: string;
  title: string;
  hint: string;
  onSelect: () => void;
  index?: number;
}) {
  const dir = DIRECTIONS[index % DIRECTIONS.length];
  return (
    <motion.button
      onClick={onSelect}
      className="group relative flex items-center gap-4 bg-white rounded-2xl border-4 border-terracotta px-5 py-4 shadow-md w-full text-left overflow-hidden"
      style={{ touchAction: 'manipulation', minHeight: 96 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 0.9, 0.34, 1] }}
    >
      {/* warm hover glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 15% 50%, rgba(255, 230, 150, 0.5), transparent 55%)',
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* direction chip on the right edge */}
      <div
        className="absolute top-3 right-4 font-display italic text-[11px] tracking-[0.15em] uppercase opacity-60"
        style={{ color: dir.color }}
      >
        {dir.label}
      </div>

      <motion.span
        className="text-5xl relative z-10"
        animate={{ rotate: [0, -2, 2, 0] }}
        transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
      >
        {emoji}
      </motion.span>

      <div className="flex-1 relative z-10">
        <div
          className="font-display text-[22px] text-bark"
          style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          {title}
        </div>
        <div className="font-display italic text-[15px] text-bark/65 mt-0.5">
          {hint}
        </div>
      </div>

      {/* arrow at far right */}
      <motion.div
        className="text-2xl text-terracotta relative z-10"
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        →
      </motion.div>
    </motion.button>
  );
}
