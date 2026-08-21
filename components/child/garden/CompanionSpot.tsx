'use client';

// The garden friend's spot — a native SVG group (iPad Safari tap
// reliability) on the grass near the sisters' home. Renders nothing
// when no companion is adopted: adoption lives in the journal, and an
// empty teaser spot would just be a nag surface.

import { motion } from 'framer-motion';
import { SpeciesIllustration } from './speciesIllustrations';
import type { CompanionStatus } from '@/app/api/companion/route';

export default function CompanionSpot({
  companion, reducedMotion, onTap, walkTarget = null,
}: {
  companion: CompanionStatus | null;
  reducedMotion: boolean;
  onTap: () => void;
  /** Where the sisters are headed; the friend trails behind. */
  walkTarget?: { x: number; y: number } | null;
}) {
  if (!companion) return null;
  const label = companion.nickname ?? companion.speciesName;

  const body = (
    <>
      {/* grass cushion */}
      <ellipse cx={0} cy={16} rx={26} ry={8} fill="#7BA46F" opacity={0.5} />
      <SpeciesIllustration code={companion.speciesCode} size={48} />
      {companion.napping && (
        <text x={18} y={-18} fontSize={12} aria-hidden="true">💤</text>
      )}
      {/* accessory unlocks */}
      {companion.bondLevel >= 2 && (
        <path d="M -8 8 Q 0 13 8 8 L 6 14 Q 0 17 -6 14 Z" fill="#C34A36" opacity={0.9} />
      )}
      {companion.bondLevel >= 3 && (
        <g aria-hidden="true">
          <circle cx={-8} cy={-20} r={2.6} fill="#FFB7C5" />
          <circle cx={0} cy={-23} r={2.6} fill="#FFD166" />
          <circle cx={8} cy={-20} r={2.6} fill="#FFB7C5" />
        </g>
      )}
      <rect x={-34} y={26} width={68} height={14} rx={4} fill="rgba(149, 184, 143, 0.95)" />
      <text y={36} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#fffaf2">
        {label.length > 14 ? `${label.slice(0, 13)}…` : label}
      </text>
    </>
  );

  // Follow the walkers when they walk (spec: the friend walks with
  // her). The outer motion.g carries ONLY animated x/y — mixing a
  // static transform attribute with framer-motion on the same SVG
  // node is the bug that once threw the sleeping cat into a corner.
  const home = { x: 275, y: 645 };
  const spot = walkTarget ? { x: walkTarget.x - 42, y: walkTarget.y + 18 } : home;
  return (
    <motion.g
      initial={false}
      animate={{ x: spot.x, y: spot.y }}
      transition={reducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 28, damping: 12, mass: 1.2 }}
      style={{ cursor: 'pointer', touchAction: 'manipulation' }}
      onClick={onTap}
      role="button"
      aria-label={`visit ${label}`}
    >
      <circle r={40} fill="transparent" />
      {reducedMotion ? (
        <g>{body}</g>
      ) : (
        <motion.g
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px 12px' }}
        >
          {body}
        </motion.g>
      )}
    </motion.g>
  );
}
