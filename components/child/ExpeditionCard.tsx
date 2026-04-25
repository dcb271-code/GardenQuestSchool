'use client';

import { motion } from 'framer-motion';

const ZONE_META: Record<string, { label: string; accent: string; tint: string }> = {
  reading: { label: 'reading grove', accent: '#E8A87C', tint: 'rgba(232, 168, 124, 0.12)' },
  math:    { label: 'math mound',    accent: '#6B8E5A', tint: 'rgba(107, 142, 90, 0.12)' },
  meadow:  { label: 'the meadow',    accent: '#FFD166', tint: 'rgba(255, 209, 102, 0.12)' },
  bunny:   { label: 'bunny glade',   accent: '#C38D9E', tint: 'rgba(195, 141, 158, 0.12)' },
  water:   { label: "water's edge",  accent: '#7DA8D3', tint: 'rgba(125, 168, 211, 0.12)' },
};

export interface ExpeditionCardProps {
  emoji: string;
  title: string;            // theme title (e.g. "Word Petals")
  hint: string;             // skill hint (e.g. "sight words")
  structureLabel?: string;  // garden structure label (e.g. "Word Stump")
  zone?: string;            // zone code
  correctCount?: number;
  target?: number;
  completed?: boolean;
  unlocksLabel?: string | null;  // e.g. "Bee Words" — what finishing this opens up
  onSelect: () => void;
  index?: number;
}

export default function ExpeditionCard({
  emoji, title, hint, structureLabel, zone = 'meadow',
  correctCount = 0, target = 10, completed = false,
  unlocksLabel = null,
  onSelect, index = 0,
}: ExpeditionCardProps) {
  const meta = ZONE_META[zone] ?? ZONE_META.meadow;
  const showProgress = target > 0;

  return (
    <motion.button
      onClick={onSelect}
      className="group relative flex items-stretch gap-4 bg-white rounded-2xl border-4 px-5 py-4 shadow-md w-full text-left overflow-hidden"
      style={{
        touchAction: 'manipulation',
        minHeight: 110,
        borderColor: meta.accent,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 0.9, 0.34, 1] }}
    >
      {/* warm hover glow scoped to zone color */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 18% 50%, ${meta.tint}, transparent 65%)`,
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Emoji panel — left rail in the zone color */}
      <div
        className="shrink-0 w-20 rounded-xl flex flex-col items-center justify-center relative z-10"
        style={{ background: meta.tint }}
      >
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center min-w-0 relative z-10">
        {/* zone tag — tells you WHERE this lives in the garden */}
        <div
          className="font-display italic text-[11px] tracking-[0.2em] uppercase"
          style={{ color: meta.accent }}
        >
          {meta.label}
        </div>

        {/* Title (theme) */}
        <div
          className="font-display text-[22px] text-bark mt-0.5 truncate"
          style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          {title}
        </div>

        {/* Hint + garden-structure name in italic */}
        <div className="font-display italic text-[14px] text-bark/65 truncate">
          {hint}
          {structureLabel && structureLabel !== title && (
            <span className="text-bark/40 not-italic"> · {structureLabel}</span>
          )}
        </div>

        {/* Progress + arrow row */}
        <div className="flex items-center gap-2 mt-2">
          {showProgress && (
            <div
              className="inline-flex items-baseline gap-1 px-2 py-0.5 rounded-full font-display"
              style={{
                background: completed ? meta.accent : '#FFFFFF',
                color: completed ? '#FFFFFF' : meta.accent,
                border: `1.5px solid ${meta.accent}`,
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                {Math.min(correctCount, target)}/{target}
              </span>
              {completed && <span className="text-[10px] not-italic ml-0.5">✓</span>}
            </div>
          )}
          <motion.div
            className="ml-auto text-2xl"
            style={{ color: meta.accent }}
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            →
          </motion.div>
        </div>

        {/* "Finishing this opens [Next]" — only on the active stop in
            its zone. Lets the child see what their work is building
            toward without turning it into a points-to-unlock economy. */}
        {unlocksLabel && !completed && (
          <div
            className="font-display italic text-[12px] mt-1.5 truncate"
            style={{ color: meta.accent, opacity: 0.85 }}
          >
            <span className="not-italic">↪</span>{' '}
            finishing this <span className="text-bark/55">opens</span>{' '}
            <span className="not-italic" style={{ fontWeight: 600 }}>{unlocksLabel}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
