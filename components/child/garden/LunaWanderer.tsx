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
  mapWidth = 1200, mapHeight = 800,
}: {
  mapWidth?: number;
  mapHeight?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx(i => {
        // pick a random different spot
        const step = 1 + Math.floor(Math.random() * (SPOTS.length - 1));
        return (i + step) % SPOTS.length;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const spot = SPOTS[idx];
  return (
    <motion.g
      animate={{ x: spot.x, y: spot.y }}
      transition={{ duration: 3, ease: 'easeInOut' }}
      style={{ pointerEvents: 'none' }}
    >
      <LunaCat size={52} />
    </motion.g>
  );
}
