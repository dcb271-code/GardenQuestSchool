'use client';

// The garden friend's spot — a native SVG group (iPad Safari tap
// reliability) on the grass near the sisters' home. Renders nothing
// when no companion is adopted: adoption lives in the journal, and an
// empty teaser spot would just be a nag surface.

import { motion } from 'framer-motion';
import { SpeciesIllustration } from './speciesIllustrations';
import type { CompanionStatus } from '@/app/api/companion/route';

export default function CompanionSpot({
  companion, reducedMotion, onTap,
}: {
  companion: CompanionStatus | null;
  reducedMotion: boolean;
  onTap: () => void;
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

  return (
    <g
      transform="translate(275, 645)"
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
    </g>
  );
}
