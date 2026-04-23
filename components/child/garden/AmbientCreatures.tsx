'use client';

import { motion } from 'framer-motion';

const CREATURES = [
  { emoji: '🦋', startX: 80, startY: 60 },
  { emoji: '🐝', startX: 420, startY: 90 },
  { emoji: '🐞', startX: 240, startY: 330 },
  { emoji: '🦋', startX: 520, startY: 220 },
];

export default function AmbientCreatures() {
  return (
    <>
      {CREATURES.map((c, i) => (
        <motion.text
          key={i}
          fontSize={28}
          initial={{ x: c.startX, y: c.startY }}
          animate={{
            x: [c.startX, c.startX + 40, c.startX - 20, c.startX],
            y: [c.startY, c.startY - 20, c.startY + 10, c.startY],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {c.emoji}
        </motion.text>
      ))}
    </>
  );
}
