'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';

interface VirtueStyle {
  label: string;
  gradient: [string, string];
  accent: string;
}

const STYLES: Record<string, VirtueStyle> = {
  persistence: { label: 'Persistence', gradient: ['#F5A0AC', '#C38D9E'], accent: '#7A4C5F' },
  curiosity:   { label: 'Curiosity',   gradient: ['#FFE89A', '#E8A87C'], accent: '#8B4F30' },
  noticing:    { label: 'Noticing',    gradient: ['#BFDCFF', '#7DA8D3'], accent: '#2B4E70' },
  care:        { label: 'Care',        gradient: ['#FFB7C5', '#F5A0AC'], accent: '#8B4A55' },
  practice:    { label: 'Practice',    gradient: ['#C8E4B0', '#95B88F'], accent: '#3E5D32' },
  courage:     { label: 'Courage',     gradient: ['#FFD166', '#E8A87C'], accent: '#7A4820' },
  wondering:   { label: 'Wondering',   gradient: ['#D9C2E8', '#A675B0'], accent: '#4F2D5A' },
};

export default function VirtueGemMoment({
  virtue, narrativeText, index = 0,
}: { virtue: string; narrativeText: string; index?: number }) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const style = STYLES[virtue] ?? STYLES.persistence;
  const delay = index * 0.6;

  // Sparkle SFX synced with the gem's drop+settle moment
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => playSparkle(), (delay + 1.2) * 1000);
    return () => clearTimeout(t);
  }, [mounted, delay]);

  if (reducedMotion) {
    return (
      <div
        className="bg-white/70 border-2 rounded-2xl p-4 flex items-center gap-4"
        style={{ borderColor: style.accent }}
      >
        <Gem virtue={virtue} size={52} static />
        <div className="flex-1">
          <div className="font-display text-[20px] font-bold" style={{ color: style.accent }}>{style.label}</div>
          <div className="text-kid-sm text-bark/80 mt-1">{narrativeText}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative bg-gradient-to-br from-white/85 to-white/55 border-2 rounded-2xl p-4 flex items-center gap-4 overflow-hidden backdrop-blur-sm"
      style={{ borderColor: style.accent }}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: delay + 0.1, duration: 0.7, ease: [0.22, 0.9, 0.34, 1] }}
    >
      {/* Ambient glow behind the gem */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: -20,
          top: -20,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${style.gradient[0]}88, transparent 70%)`,
          filter: 'blur(12px)',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={mounted ? { opacity: [0, 0.9, 0.55], scale: [0.6, 1.2, 1] } : {}}
        transition={{ delay: delay + 0.3, duration: 1.6, ease: 'easeOut' }}
      />

      <motion.div
        initial={{ y: -60, rotate: -20, opacity: 0, scale: 0.4 }}
        animate={mounted ? {
          y: [-60, 8, -4, 0],
          rotate: [-20, 8, -3, 0],
          opacity: [0, 1, 1, 1],
          scale: [0.4, 1.1, 0.96, 1],
        } : {}}
        transition={{
          delay: delay + 0.3,
          duration: 1.4,
          times: [0, 0.6, 0.8, 1],
          ease: [0.22, 0.9, 0.34, 1],
        }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 2 }}
        >
          <Gem virtue={virtue} size={58} />
        </motion.div>
      </motion.div>

      <motion.div
        className="flex-1 relative z-10"
        initial={{ opacity: 0, x: -8 }}
        animate={mounted ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: delay + 0.9, duration: 0.6, ease: 'easeOut' }}
      >
        <div className="font-display text-[22px] font-bold leading-tight" style={{ color: style.accent }}>
          {style.label}
        </div>
        <div className="text-kid-sm text-bark/85 mt-1">{narrativeText}</div>
      </motion.div>

      {/* Sparkles emerging from the gem on settle */}
      {mounted && <Sparkles delay={delay + 1.2} color={style.gradient[0]} />}
    </motion.div>
  );
}

function Gem({ virtue, size = 52, static: isStatic = false }: { virtue: string; size?: number; static?: boolean }) {
  const style = STYLES[virtue] ?? STYLES.persistence;
  const gradId = `gem-${virtue}`;
  const shineId = `shine-${virtue}`;
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={style.gradient[0]} />
          <stop offset="100%" stopColor={style.gradient[1]} />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Outer facet */}
      <polygon
        points="0,-22 20,-6 14,22 -14,22 -20,-6"
        fill={`url(#${gradId})`}
        stroke={style.accent}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Top facet */}
      <polygon points="0,-22 20,-6 0,-2 -20,-6" fill={style.gradient[0]} opacity="0.85" />
      {/* Inner facet line */}
      <polyline points="-20,-6 0,22 20,-6" fill="none" stroke={style.accent} strokeWidth="0.8" opacity="0.5" />
      {/* Highlight */}
      <polygon points="-10,-14 -4,-12 -2,8 -12,4" fill={`url(#${shineId})`} opacity="0.85" />
      {/* Shine sweep animation (CSS mask-like effect via stroked sweep) */}
      {!isStatic && (
        <motion.line
          x1="-22" y1="-22" x2="22" y2="22"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.2, delay: 2.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
        />
      )}
    </svg>
  );
}

function Sparkles({ delay, color }: { delay: number; color: string }) {
  const particles = [
    { x: -8,  y: -24, dx: -14, dy: -18, size: 3 },
    { x: 10,  y: -20, dx: 18,  dy: -14, size: 2.5 },
    { x: 0,   y: -28, dx: 0,   dy: -22, size: 2 },
    { x: 14,  y: 0,   dx: 26,  dy: 4,   size: 2.5 },
    { x: -12, y: 4,   dx: -22, dy: 8,   size: 3 },
  ];
  return (
    <svg
      className="absolute pointer-events-none"
      width="140"
      height="140"
      viewBox="-60 -60 120 120"
      style={{ left: -10, top: -10 }}
    >
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.4],
            cx: [p.x, p.x + p.dx],
            cy: [p.y, p.y + p.dy],
          }}
          transition={{
            delay: delay + i * 0.08,
            duration: 1.1,
            ease: 'easeOut',
          }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      ))}
    </svg>
  );
}
