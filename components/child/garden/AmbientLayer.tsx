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
  { y: 60,  scale: 1.25, delay: 0,    duration: 95,  opacity: 0.92 },
  { y: 120, scale: 0.75, delay: 28,   duration: 78,  opacity: 0.78 },
  { y: 190, scale: 1.0,  delay: 52,   duration: 115, opacity: 0.65 },
];

// Drifting leaves — occasional, float diagonally like autumn wind
interface LeafSpec {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  duration: number;
  delay: number;
}
const LEAVES: LeafSpec[] = [
  { startX: -40,   startY: 80,  endX: 700,  endY: 620, color: '#E8A87C', duration: 22, delay: 8 },
  { startX: 400,   startY: 50,  endX: 1100, endY: 580, color: '#C38D9E', duration: 26, delay: 32 },
  { startX: -60,   startY: 220, endX: 900,  endY: 700, color: '#E8C493', duration: 30, delay: 18 },
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

  // Cycle a fresh bird flight every 25-50 seconds
  useEffect(() => {
    if (reducedMotion) return;
    let handle: ReturnType<typeof setTimeout>;
    const cycle = () => {
      const wait = 25000 + Math.random() * 25000;
      handle = setTimeout(() => {
        setBirdKey(k => k + 1);
        cycle();
      }, wait);
    };
    cycle();
    return () => clearTimeout(handle);
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
          initial={{ x: -280 }}
          animate={{ x: 1720 }}
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

      {/* Drifting leaves — occasional autumn motion across the sky/meadow */}
      {LEAVES.map((l, i) => (
        <motion.g
          key={`leaf-${i}`}
          initial={{ x: l.startX, y: l.startY, rotate: 0, opacity: 0 }}
          animate={{
            x: l.endX,
            y: l.endY,
            rotate: [0, 180, 360, 540, 720],
            opacity: [0, 0.85, 0.85, 0.85, 0],
          }}
          transition={{
            duration: l.duration,
            delay: l.delay,
            repeat: Infinity,
            repeatDelay: 18,
            ease: 'easeInOut',
          }}
        >
          <Leaf color={l.color} />
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

      {/* Occasional bird flight — arcs across the sky, stays above structures */}
      <motion.g
        key={birdKey}
        initial={{ x: -60, y: 80, opacity: 0 }}
        animate={{
          x: [-60, 400, 900, 1500],
          y: [80, 50, 90, 60],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: 22, times: [0, 0.2, 0.7, 1], ease: 'easeInOut' }}
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
      {/* fluffy cumulus — 4 overlapping puffs, no hard under-shadow */}
      <ellipse cx={-28} cy={-2} rx={28} ry={15} fill="#FFFFFF" />
      <ellipse cx={30}  cy={-2} rx={32} ry={16} fill="#FFFFFF" />
      <ellipse cx={0}   cy={0}  rx={46} ry={20} fill="#FFFFFF" />
      <ellipse cx={10}  cy={-16} rx={24} ry={14} fill="#FFFFFF" />
      <ellipse cx={-14} cy={-14} rx={20} ry={12} fill="#FFFFFF" />
      {/* soft warm underside */}
      <ellipse cx={0}   cy={6}  rx={42} ry={6}  fill="#F5E6C9" opacity={0.55} />
    </g>
  );
}

function Bird() {
  // Two wings, gentle M-curve, scaled for sky distance
  return (
    <motion.g
      animate={{ scaleY: [1, 0.55, 1] }}
      transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '0px 0px' }}
    >
      <path d="M -14 0 Q -7 -8 0 0 Q 7 -8 14 0" stroke="#5A3B1F" strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </motion.g>
  );
}

// A simple tumbling leaf — oak-shape silhouette
function Leaf({ color }: { color: string }) {
  return (
    <g style={{ transformBox: 'fill-box' as any, transformOrigin: 'center' }}>
      <path
        d="M 0 -8 Q 6 -4 6 2 Q 4 8 0 10 Q -4 8 -6 2 Q -6 -4 0 -8 Z"
        fill={color}
        stroke="#5A3B1F"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
      {/* center vein */}
      <line x1={0} y1={-7} x2={0} y2={9} stroke="#5A3B1F" strokeWidth={0.6} opacity={0.6} />
      {/* side veins */}
      <path d="M 0 -2 L -3 1 M 0 -2 L 3 1 M 0 3 L -3 6 M 0 3 L 3 6" stroke="#5A3B1F" strokeWidth={0.4} fill="none" opacity={0.5} />
    </g>
  );
}
