'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

// Different species arrive differently: winged things fly in from the side,
// pond dwellers hop in from below, ground things walk in.
function getArrivalStyle(species: SpeciesData): 'fly' | 'hop' | 'walk' {
  const code = species.code?.toLowerCase() ?? '';
  const name = species.commonName?.toLowerCase() ?? '';
  if (/butterfly|bee|dragonfly|bird|moth|ladybug/.test(code + name)) return 'fly';
  if (/frog|toad|bunny|rabbit|grasshopper|cricket|newt/.test(code + name)) return 'hop';
  return 'walk';
}

export default function ArrivalCard({
  species,
  learnerId,
  onDismiss,
}: {
  species: SpeciesData;
  learnerId: string;
  onDismiss: () => void;
}) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(true);

  const arrival = getArrivalStyle(species);

  const welcome = async () => {
    setBusy(true);
    await fetch('/api/garden/arrival', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, speciesCode: species.code }),
    });
    setVisible(false);
    // allow exit animation to play
    setTimeout(onDismiss, 400);
  };

  const speciesMotion: MotionProps = reducedMotion
    ? { initial: {}, animate: {}, transition: {} }
    : arrival === 'fly'
    ? {
        initial: { x: -220, y: -20, rotate: -18, opacity: 0 },
        animate: {
          x: [-220, 40, -20, 0],
          y: [-20, 20, -10, 0],
          rotate: [-18, 10, -4, 0],
          opacity: [0, 1, 1, 1],
        },
        transition: { duration: 1.5, times: [0, 0.55, 0.8, 1], ease: 'easeOut', delay: 0.25 },
      }
    : arrival === 'hop'
    ? {
        initial: { y: 220, opacity: 0, scale: 0.6 },
        animate: {
          y: [220, -40, 20, -10, 0],
          scale: [0.6, 1.05, 0.92, 1.02, 1],
          opacity: [0, 1, 1, 1, 1],
        },
        transition: { duration: 1.4, times: [0, 0.4, 0.65, 0.85, 1], ease: 'easeOut', delay: 0.25 },
      }
    : {
        initial: { x: -180, opacity: 0, scale: 0.85 },
        animate: { x: 0, opacity: 1, scale: 1 },
        transition: { duration: 1.0, ease: [0.22, 0.9, 0.34, 1], delay: 0.25 },
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Soft light bloom behind the card */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 600, height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 230, 160, 0.5), transparent 60%)',
              filter: 'blur(40px)',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-6 space-y-3 text-center shadow-2xl overflow-visible"
            initial={{ y: 30, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 0.9, 0.34, 1] }}
          >
            {/* Species entrance on top of the card */}
            <div className="flex items-center justify-center h-28 relative">
              <motion.div
                {...speciesMotion}
                className="text-[88px] leading-none"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(107, 68, 35, 0.25))' }}
              >
                {/* Winged species also get a subtle hover after arrival */}
                {arrival === 'fly' && !reducedMotion ? (
                  <motion.span
                    className="inline-block"
                    animate={{ y: [0, -6, 0], rotate: [0, -3, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: 1.8, ease: 'easeInOut' }}
                  >
                    {species.emoji}
                  </motion.span>
                ) : arrival === 'hop' && !reducedMotion ? (
                  <motion.span
                    className="inline-block"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.0, repeat: Infinity, delay: 1.6, ease: 'easeInOut' }}
                  >
                    {species.emoji}
                  </motion.span>
                ) : (
                  <span>{species.emoji}</span>
                )}
              </motion.div>

              {/* Arrival dust/petals at landing */}
              {!reducedMotion && <ArrivalDust />}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <h2 className="font-display text-[28px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                <span className="italic text-terracotta">a</span> {species.commonName} <span className="italic text-terracotta">arrived</span>
              </h2>
              <div className="font-display italic text-[13px] opacity-65 tracking-wide mt-1">{species.scientificName}</div>
            </motion.div>

            <motion.div
              className="text-kid-sm text-bark/85 text-left bg-white/70 rounded-xl p-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              {species.funFact}
            </motion.div>

            <motion.button
              onClick={welcome}
              disabled={busy}
              className="w-full bg-forest text-white rounded-full py-4 text-kid-md disabled:opacity-50"
              style={{ touchAction: 'manipulation', minHeight: 60 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              whileTap={{ scale: 0.97 }}
            >
              {busy ? 'welcoming…' : 'welcome them'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 6 soft petals puff out at the landing point
function ArrivalDust() {
  const petals = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return {
      dx: Math.cos(angle) * 60,
      dy: Math.sin(angle) * 40 + 20,
      color: ['#FFB7C5', '#FFE89A', '#E6B0D0'][i % 3],
    };
  });
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setPlaying(true), 1100);
    return () => clearTimeout(id);
  }, []);
  if (!playing) return null;
  return (
    <svg
      className="absolute pointer-events-none"
      width="240"
      height="140"
      viewBox="-120 -70 240 140"
      style={{ left: '50%', top: '60%', transform: 'translate(-50%, -50%)' }}
    >
      {petals.map((p, i) => (
        <motion.ellipse
          key={i}
          cx={0}
          cy={0}
          rx={5}
          ry={3}
          fill={p.color}
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.6 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 1.2 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      ))}
    </svg>
  );
}
