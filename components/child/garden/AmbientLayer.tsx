'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CloudSpec {
  y: number;
  scale: number;
  delay: number;
  duration: number;
  opacity: number;
}

const CLOUDS: CloudSpec[] = [
  { y: 55,  scale: 1.1, delay: 0,    duration: 90, opacity: 0.75 },
  { y: 110, scale: 0.7, delay: 24,   duration: 72, opacity: 0.55 },
  { y: 180, scale: 0.9, delay: 48,   duration: 110, opacity: 0.45 },
];

interface PollenSpec {
  x: number;
  y: number;
  delay: number;
  duration: number;
  drift: number;
}

// Pollen motes — meadow-center area, gentle organic drift
const POLLEN: PollenSpec[] = [
  { x: 360, y: 440, delay: 0,  duration: 14, drift: 24 },
  { x: 510, y: 380, delay: 2,  duration: 17, drift: -30 },
  { x: 590, y: 490, delay: 4,  duration: 13, drift: 20 },
  { x: 680, y: 400, delay: 1,  duration: 19, drift: -22 },
  { x: 450, y: 560, delay: 6,  duration: 15, drift: 28 },
  { x: 740, y: 520, delay: 3,  duration: 16, drift: -18 },
  { x: 400, y: 500, delay: 8,  duration: 18, drift: 22 },
  { x: 620, y: 580, delay: 5,  duration: 14, drift: -26 },
];

// Firefly positions (appear only at night)
const FIREFLIES = [
  { x: 260, y: 470, delay: 0 },
  { x: 380, y: 540, delay: 1.6 },
  { x: 520, y: 460, delay: 3.2 },
  { x: 620, y: 530, delay: 0.8 },
  { x: 740, y: 480, delay: 2.4 },
  { x: 480, y: 620, delay: 4.0 },
  { x: 330, y: 410, delay: 1.2 },
];

export default function AmbientLayer({ reducedMotion = false }: { reducedMotion?: boolean }) {
  // Time of day: same logic as GardenScene
  const [hour, setHour] = useState(12);
  const [birdKey, setBirdKey] = useState(0);

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  // Cycle a fresh bird flight every 35-70 seconds
  useEffect(() => {
    if (reducedMotion) return;
    const cycle = () => {
      const wait = 35000 + Math.random() * 35000;
      const id = setTimeout(() => {
        setBirdKey(k => k + 1);
        cycle();
      }, wait);
      return id;
    };
    const id = cycle();
    return () => clearTimeout(id);
  }, [reducedMotion]);

  const isNight = hour < 6 || hour >= 20;
  const isDusk = hour >= 17 && hour < 20;

  if (reducedMotion) {
    // Static decoration only — no animation.
    return (
      <g aria-hidden="true" style={{ pointerEvents: 'none' }}>
        {CLOUDS.slice(0, 2).map((c, i) => (
          <Cloud key={i} x={200 + i * 400} y={c.y} scale={c.scale} opacity={c.opacity} />
        ))}
      </g>
    );
  }

  return (
    <g aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {/* Clouds */}
      {CLOUDS.map((c, i) => (
        <motion.g
          key={i}
          initial={{ x: -260 }}
          animate={{ x: 1460 }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Cloud x={0} y={c.y} scale={c.scale} opacity={c.opacity} />
        </motion.g>
      ))}

      {/* Pollen motes */}
      {POLLEN.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2.6}
          fill="#FFE9A8"
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -30, -10, -40, 0],
            x: [0, p.drift * 0.5, p.drift, p.drift * 0.3, 0],
            opacity: [0, 0.9, 0.7, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: 'drop-shadow(0 0 3px rgba(255, 220, 120, 0.9))' }}
        />
      ))}

      {/* Occasional bird flight (diagonal across sky) */}
      <motion.g
        key={birdKey}
        initial={{ x: -80, y: 0 }}
        animate={{ x: 1400, y: 40 }}
        transition={{ duration: 16, ease: 'easeOut' }}
      >
        <Bird />
      </motion.g>

      {/* Fireflies — only visible at dusk/night */}
      {(isDusk || isNight) && FIREFLIES.map((f, i) => (
        <motion.circle
          key={i}
          cx={f.x}
          cy={f.y}
          r={3}
          fill="#FFEF99"
          animate={{
            opacity: [0, 1, 0.3, 1, 0],
            y: [0, -14, -6, -18, -4],
            x: [0, 10, -6, 14, 0],
          }}
          transition={{
            duration: 5.4,
            delay: f.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255, 230, 120, 0.95))' }}
        />
      ))}
    </g>
  );
}

function Cloud({ x, y, scale, opacity }: { x: number; y: number; scale: number; opacity: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx={0}  cy={0} rx={42} ry={18} fill="#FFFFFF" />
      <ellipse cx={26} cy={-6} rx={30} ry={16} fill="#FFFFFF" />
      <ellipse cx={-24} cy={-4} rx={26} ry={14} fill="#FFFFFF" />
      <ellipse cx={8}  cy={-14} rx={22} ry={12} fill="#FFFFFF" />
      {/* subtle under-shadow */}
      <ellipse cx={0}  cy={8} rx={40} ry={6} fill="#D9CFC0" opacity={0.35} />
    </g>
  );
}

function Bird() {
  // Simple seagull-M silhouette, wings flapping
  return (
    <motion.g
      animate={{ scaleY: [1, 0.6, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '0px 0px' }}
    >
      <path d="M -10 0 Q -5 -6 0 0 Q 5 -6 10 0" stroke="#5A3B1F" strokeWidth={2} fill="none" strokeLinecap="round" />
    </motion.g>
  );
}
