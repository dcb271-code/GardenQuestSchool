'use client';

import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';

// Slug → human label, e.g. 'ant_hill' → 'Ant Hill'. Falls back to a
// title-cased version of the slug if the catalog doesn't know it (so
// we never show raw "ant_hill" text to the child).
function habitatLabel(code: string): string {
  const known = HABITAT_CATALOG.find(h => h.code === code);
  if (known) return known.name;
  return code
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function JournalSpeciesCard({
  species, unlocked, index = 0,
}: { species: SpeciesData; unlocked: boolean; index?: number }) {
  return (
    <motion.div
      className={`relative border-4 rounded-2xl p-4 flex items-start gap-3 overflow-hidden ${
        unlocked ? 'bg-white border-sage' : 'bg-gray-50/80 border-gray-200'
      }`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.22, 0.9, 0.34, 1],
      }}
    >
      {/* Faint sage glow behind unlocked cards — gives them life */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 12% 40%, rgba(149, 184, 143, 0.22), transparent 60%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 + Math.min(index * 0.04, 0.4) }}
        />
      )}

      {/* Hand-drawn illustration if available, emoji fallback. Locked
          species always show a ❓ silhouette. */}
      <motion.div
        className="relative z-10 shrink-0 w-14 h-14 flex items-center justify-center"
        initial={unlocked ? { scale: 0.4, opacity: 0, rotate: -12 } : { scale: 0.9, opacity: 0.5 }}
        whileInView={unlocked
          ? { scale: [0.4, 1.15, 0.95, 1], opacity: 1, rotate: [-12, 6, -3, 0] }
          : { scale: 1, opacity: 0.5 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px' }}
        transition={{ duration: 0.9, delay: 0.1 + Math.min(index * 0.04, 0.4), ease: [0.22, 0.9, 0.34, 1] }}
        style={{ filter: unlocked ? undefined : 'grayscale(1)' }}
      >
        {unlocked ? (
          <SpeciesIllustrationOrEmoji species={species} size={56} />
        ) : (
          <span className="text-5xl">❓</span>
        )}
      </motion.div>

      <div className="flex-1 relative z-10">
        <div
          className={`font-display text-[19px] ${unlocked ? 'text-bark' : 'text-bark/55'}`}
          style={{ fontWeight: 600, letterSpacing: '-0.005em' }}
        >
          {unlocked ? species.commonName : 'not yet seen'}
        </div>
        {unlocked && (
          <>
            <div className="font-display italic text-[12px] text-bark/55 mt-0.5">
              {species.scientificName}
            </div>
            <div className="text-sm mt-2 text-bark/80 leading-snug">
              {species.funFact}
            </div>
          </>
        )}
        {!unlocked && (
          <div className="font-display italic text-xs mt-1 text-bark/55">
            build a{' '}
            <span className="not-italic text-bark/70">
              {species.habitatReqCodes.map(habitatLabel).join(' + ')}
            </span>{' '}
            to see this one
          </div>
        )}
      </div>

      {/* Sparkle accent for unlocked (upper-right corner) */}
      {unlocked && (
        <motion.div
          className="absolute top-2 right-2 text-xl"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.7, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 + Math.min(index * 0.04, 0.4) }}
        >
          ✦
        </motion.div>
      )}
    </motion.div>
  );
}

// Render the hand-drawn SVG if it exists, otherwise fall back to the
// species' emoji at a compatible size.
function SpeciesIllustrationOrEmoji({ species, size }: { species: SpeciesData; size: number }) {
  const drawn = SpeciesIllustration({ code: species.code, size });
  if (drawn) return drawn;
  return <span className="text-5xl">{species.emoji}</span>;
}
