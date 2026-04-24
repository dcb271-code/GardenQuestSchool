'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LunaCat } from './illustrations';

// Hand-picked lounging spots on the meadow (avoids water, trees, and
// interfering with structure labels).
const SPOTS = [
  { x: 500, y: 380 }, { x: 600, y: 470 }, { x: 430, y: 500 },
  { x: 700, y: 420 }, { x: 560, y: 330 }, { x: 640, y: 550 },
  { x: 500, y: 600 }, { x: 750, y: 500 },
];

export default function LunaWanderer({
  mapWidth = 1200, mapHeight = 800, reducedMotion = false,
}: {
  mapWidth?: number;
  mapHeight?: number;
  reducedMotion?: boolean;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setIdx(i => {
        const step = 1 + Math.floor(Math.random() * (SPOTS.length - 1));
        return (i + step) % SPOTS.length;
      });
    }, 8000);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const spot = SPOTS[idx];

  if (reducedMotion) {
    return (
      <g transform={`translate(${spot.x}, ${spot.y})`} style={{ pointerEvents: 'none' }}>
        <LunaCat size={52} />
      </g>
    );
  }

  return (
    <motion.g
      animate={{ x: spot.x, y: spot.y }}
      transition={{ duration: 3.8, ease: [0.4, 0, 0.22, 1] }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Periodic head tilt — subtle curiosity moment every ~12s */}
      <motion.g
        animate={{ rotate: [0, 0, 0, -5, 0, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          times: [0, 0.7, 0.8, 0.85, 0.92, 1],
          ease: 'easeInOut',
        }}
      >
        {/* Breathing scale — Luna gently rises and falls */}
        <motion.g
          animate={{ scale: [1, 1.035, 1], y: [0, -1.2, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px 20px' }}
        >
          <LunaCat size={52} />
          {/* Eye-blink overlay */}
          <motion.g
            animate={{ opacity: [0, 0, 0, 1, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, times: [0, 0.88, 0.92, 0.94, 1], ease: 'easeInOut' }}
          >
            <path d="M -6 -2 Q -4.4 0 -2.8 -2" stroke="#5A3B1F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 2.8 -2 Q 4.4 0 6 -2" stroke="#5A3B1F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.g>
  );
}
