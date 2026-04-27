// components/child/garden/CharacterSpot.tsx
//
// One quick-start character on the central garden — Nana Mira on the
// cottage porch, Hodge the Beaver by the brook, the Wanderer's
// Signpost at the path-meadow junction. Today's "alert" character
// (picked by characterRotation) is awake, eyes-open, with a small
// hover hint showing what they recommend. The other two are dimmed
// with a slight idle bob, eyes closed.

'use client';

import { motion } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import type { CharacterCode } from '@/lib/world/characterRotation';

interface CharacterSpotProps {
  characterCode: CharacterCode;
  name: string;
  emoji: string;
  alert: boolean;
  recommendation: string;
  onTap: () => void;
}

export default function CharacterSpot({
  characterCode,
  name,
  emoji,
  alert,
  recommendation,
  onTap,
}: CharacterSpotProps) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  // Aria label: the alert character includes their recommendation hint;
  // the sleeping ones note that they're resting so screen readers can
  // explain why nothing happens on tap. Tap still fires either way —
  // the parent decides what to do.
  const ariaLabel = alert
    ? `${name} — ${recommendation}`
    : `${name} is resting`;

  return (
    <button
      type="button"
      data-state={alert ? 'awake' : 'asleep'}
      aria-label={ariaLabel}
      onClick={onTap}
      style={{
        background: 'none', border: 'none', padding: 4, cursor: 'pointer',
        minWidth: 60, minHeight: 60, textAlign: 'center', lineHeight: 1,
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}
    >
      <motion.span
        aria-hidden
        animate={
          reducedMotion
            ? {}
            : alert
              ? { y: [0, -2, 0] }
              : { rotate: [-2, 2, -2] }
        }
        transition={{
          duration: alert ? 1.6 : 3.0,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{
          fontSize: 22,
          opacity: alert ? 1 : 0.55,
          filter: alert
            ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
            : 'grayscale(0.4)',
        }}
      >
        {emoji}
      </motion.span>
      <span
        style={{
          fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
          background: 'rgba(195, 141, 158, 0.95)', color: '#fffaf2',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      {alert && (
        <span
          style={{
            fontSize: 8, color: '#6b4423', marginTop: 1,
            background: 'rgba(255,250,242,0.85)', padding: '1px 4px',
            borderRadius: 4, whiteSpace: 'nowrap', fontStyle: 'italic',
          }}
        >
          {recommendation}
        </span>
      )}
    </button>
  );
}
