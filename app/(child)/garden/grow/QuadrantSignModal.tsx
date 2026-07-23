// app/(child)/garden/grow/QuadrantSignModal.tsx
//
// "What grows here?" modal for a locked quadrant — shared by both grow
// screens. Answers the question every kid asks at a locked bed: what IS
// this, and when do I get in?

'use client';

import { motion } from 'framer-motion';
import { QUADRANT_LAYOUT } from '@/lib/world/plotLayout';
import { SEED_EARN_SCHEDULE, type GardenType } from '@/lib/world/seedEarnSchedule';
import { TRELLIS_MASTERED_SKILLS } from '@/lib/world/trellisGating';

export const QUADRANT_BLURB: Record<string, { emoji: string; blurb: string }> = {
  flower: {
    emoji: '🌷',
    blurb: 'Tulips, cheerful daisies, and a sunflower that will grow taller than you.',
  },
  fruit: {
    emoji: '🍎',
    blurb: 'An apple tree, sweet strawberries, and a blueberry bush for picking.',
  },
  japanese: {
    emoji: '🎋',
    blurb: 'Whispering bamboo, a tiny bonsai pine, and a cherry blossom tree.',
  },
  orchard: {
    emoji: '🍑',
    blurb: 'Peach, plum, and fig trees — and a pawpaw, the biggest fruit that grows wild in America.',
  },
  berry: {
    emoji: '🫐',
    blurb: 'Raspberries, blackberries, and gooseberries — enough for jam AND pie.',
  },
  herb: {
    emoji: '🌿',
    blurb: 'Basil, lavender, and chamomile — leaves and flowers that make food and tea delicious.',
  },
  moon: {
    emoji: '🌙',
    blurb: 'Flowers that only open when the moon comes out. Luna’s favorite bed.',
  },
};

export default function QuadrantSignModal({
  quadrant, cumulativeCorrect, onClose,
}: {
  quadrant: GardenType | null;
  cumulativeCorrect: number;
  onClose: () => void;
}) {
  if (!quadrant) return null;
  const label = QUADRANT_LAYOUT[quadrant]?.label ?? quadrant;
  const info = QUADRANT_BLURB[quadrant];
  const threshold = SEED_EARN_SCHEDULE.find(s => s.opensQuadrant === quadrant)?.atCorrect ?? 0;
  const remaining = Math.max(0, threshold - cumulativeCorrect);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-3"
        initial={{ scale: 0.9, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl">{info?.emoji ?? '🪧'}</div>
        <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
          still sleeping
        </div>
        <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
          <span className="italic text-forest">{label.toLowerCase()}</span>
        </h2>
        <p className="font-display italic text-[15px] text-bark/75 leading-snug">
          {info?.blurb}
        </p>
        <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark leading-snug">
          This bed wakes up after{' '}
          <span style={{ fontWeight: 700 }}>{threshold}</span> right answers.
          <div className="mt-1 text-forest" style={{ fontWeight: 700 }}>
            {remaining === 0
              ? 'It\'s ready — go see!'
              : `You're only ${remaining} away!`}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-forest text-white rounded-full py-3.5 font-display"
          style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
        >
          keep growing
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TRELLIS SIGN — why is the gate closed, and what opens it? Unlike the
// quadrant beds (right-answer counts), the trellis opens on MASTERY —
// see lib/world/trellisGating.ts.
// ─────────────────────────────────────────────────────────────────────────

export function TrellisSignModal({
  open, masteredCount, onClose,
}: {
  open: boolean;
  masteredCount: number;
  onClose: () => void;
}) {
  if (!open) return null;
  const remaining = Math.max(0, TRELLIS_MASTERED_SKILLS - masteredCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-3"
        initial={{ scale: 0.9, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl">🌹</div>
        <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
          the gate is sleeping
        </div>
        <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
          <span className="italic text-forest">beyond the trellis</span>
        </h2>
        <p className="font-display italic text-[15px] text-bark/75 leading-snug">
          A whole second garden waits back there — an orchard, a berry patch,
          an herb &amp; tea garden, and a moon garden that blooms at night.
        </p>
        <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark leading-snug">
          The roses untangle when{' '}
          <span style={{ fontWeight: 700 }}>{TRELLIS_MASTERED_SKILLS} of your skills</span>{' '}
          bloom into mastery on the big garden map.
          <div className="mt-1 text-forest" style={{ fontWeight: 700 }}>
            {remaining === 0
              ? 'They have — push it open!'
              : `${masteredCount} mastered so far — ${remaining} to go.`}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-forest text-white rounded-full py-3.5 font-display"
          style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
        >
          keep growing
        </button>
      </motion.div>
    </div>
  );
}
