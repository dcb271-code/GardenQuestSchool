'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LunaCat } from './illustrations';

// Hand-picked lounging spots spanning the WHOLE meadow — was 8 spots
// clustered around the middle (which made Luna look like she only
// shuttled between two corners). Now 18 spots covering NW, N, NE,
// E, SE, S, SW, W and the center, while still avoiding the water /
// trees / cozy-house and the structure label pills.
const SPOTS = [
  // North band (upper meadow)
  { x: 320, y: 380 }, { x: 500, y: 380 }, { x: 700, y: 360 },
  { x: 880, y: 380 }, { x: 1140, y: 480 },
  // East band (right meadow)
  { x: 1000, y: 460 }, { x: 1240, y: 540 },
  // South band (lower meadow)
  { x: 850, y: 600 }, { x: 600, y: 580 }, { x: 400, y: 600 },
  // West band (left meadow)
  { x: 280, y: 540 }, { x: 300, y: 460 },
  // Center cluster
  { x: 480, y: 500 }, { x: 600, y: 470 }, { x: 720, y: 480 },
  { x: 600, y: 420 }, { x: 880, y: 540 }, { x: 560, y: 330 },
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
    // Variable interval — sometimes Luna sits longer, sometimes she
    // makes a short hop. Range 6-14s feels less metronomic than the
    // old fixed 8s.
    const tick = () => {
      setIdx(i => {
        const step = 1 + Math.floor(Math.random() * (SPOTS.length - 1));
        return (i + step) % SPOTS.length;
      });
      const next = 6000 + Math.floor(Math.random() * 8000);
      handle = window.setTimeout(tick, next);
    };
    let handle = window.setTimeout(tick, 6000 + Math.floor(Math.random() * 4000));
    return () => window.clearTimeout(handle);
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
