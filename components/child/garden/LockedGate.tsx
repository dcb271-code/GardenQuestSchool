// components/child/garden/LockedGate.tsx
//
// Ivy archway at a path-edge of the central garden. Locked initially:
// the gate is wrapped in vines, with a small dark-banner label
// reading "🔒 to {destination}". When unlocked, the vines visually
// slide aside, the lock disappears, and the label brightens.
//
// `justUnlocked` is a one-shot flag: when true, the component runs
// the vine-slide-aside animation on mount (intended to fire exactly
// once, the first time the learner sees the gate post-unlock). The
// caller is responsible for clearing it via the world_state
// unlocked_branches list.

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

interface LockedGateProps {
  destinationLabel: string;
  unlocked: boolean;
  justUnlocked: boolean;
  onTapWhenLocked: () => void;
  onTapWhenUnlocked: () => void;
}

export default function LockedGate({
  destinationLabel,
  unlocked,
  justUnlocked,
  onTapWhenLocked,
  onTapWhenUnlocked,
}: LockedGateProps) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (justUnlocked && !reducedMotion) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 1200);
      return () => clearTimeout(t);
    }
  }, [justUnlocked, reducedMotion]);

  const ariaLabel = unlocked
    ? `path to ${destinationLabel}`
    : `gate locked — finish a few activities to open the way to ${destinationLabel}`;

  return (
    <div
      data-just-unlocked={animating ? 'true' : 'false'}
      style={{ display: 'inline-block', textAlign: 'center', minWidth: 60, minHeight: 60 }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => (unlocked ? onTapWhenUnlocked() : onTapWhenLocked())}
        style={{
          background: 'none', border: 'none', padding: 4, cursor: 'pointer',
          minWidth: 60, minHeight: 60,
        }}
      >
        <motion.span
          aria-hidden
          animate={animating ? { rotate: [0, -8, 4, 0], scale: [1, 1.1, 0.96, 1] } : {}}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{ fontSize: 30, opacity: unlocked ? 1 : 0.85, display: 'inline-block' }}
        >
          {unlocked ? '🚪' : '🌿'}
        </motion.span>
      </button>
      <div
        style={{
          fontSize: 9, fontWeight: 700, marginTop: 2,
          padding: '2px 6px', borderRadius: 6,
          background: unlocked ? 'rgba(255, 250, 242, 0.9)' : 'rgba(107, 68, 35, 0.9)',
          color: unlocked ? '#6b4423' : '#fffaf2',
          display: 'inline-block', whiteSpace: 'nowrap',
        }}
      >
        {unlocked ? `to ${destinationLabel} →` : `🔒 to ${destinationLabel}`}
      </div>
    </div>
  );
}
