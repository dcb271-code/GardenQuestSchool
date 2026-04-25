'use client';

import { motion } from 'framer-motion';
import type { HabitatTypeData } from '@/lib/world/habitatCatalog';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

// Slug → common name, e.g. 'leafcutter_ant' → 'Leafcutter Ant'.
// Falls back to a title-cased version of the slug for any species
// that doesn't appear in the catalog (so we never leak raw codes).
function speciesLabel(code: string): string {
  const sp = SPECIES_CATALOG.find(s => s.code === code);
  if (sp) return sp.commonName;
  return code
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function HabitatCard({
  habitat, unlocked, prereqDisplayNames, index = 0,
}: {
  habitat: HabitatTypeData;
  unlocked: boolean;
  prereqDisplayNames: string[];
  index?: number;
}) {
  return (
    <motion.div
      className={`relative border-4 rounded-2xl p-4 overflow-hidden ${
        unlocked ? 'bg-cream border-terracotta shadow-md' : 'bg-gray-50/80 border-gray-200'
      }`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.35),
        ease: [0.22, 0.9, 0.34, 1],
      }}
    >
      {/* Warm glow behind unlocked cards */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 12% 40%, rgba(232, 168, 124, 0.28), transparent 60%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
      )}

      <div className="flex items-start gap-4 relative z-10">
        <motion.div
          className="text-5xl shrink-0"
          initial={unlocked ? { scale: 0.5, rotate: -12 } : { scale: 0.9, opacity: 0.5 }}
          whileInView={unlocked
            ? { scale: [0.5, 1.15, 0.95, 1], rotate: [-12, 5, -2, 0] }
            : { scale: 1, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 + Math.min(index * 0.05, 0.35), ease: [0.22, 0.9, 0.34, 1] }}
          style={{ filter: unlocked ? undefined : 'grayscale(1)' }}
        >
          {habitat.emoji}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div
              className={`font-display text-[22px] ${unlocked ? 'text-bark' : 'text-bark/55'}`}
              style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              {habitat.name}
            </div>
            {unlocked ? (
              <span className="font-display italic text-[12px] tracking-[0.15em] uppercase text-forest flex items-center gap-1">
                <span className="text-sage">✓</span> built
              </span>
            ) : (
              <span className="font-display italic text-[12px] tracking-[0.15em] uppercase text-bark/45 flex items-center gap-1">
                <span>🔒</span> locked
              </span>
            )}
          </div>

          <div className={`text-sm mt-1.5 ${unlocked ? 'text-bark/80' : 'text-bark/55'} leading-snug`}>
            {habitat.description}
          </div>

          {/* Species chips — shows what could visit */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {habitat.attractsSpeciesCodes.slice(0, 4).map((code, i) => (
              <span
                key={code}
                className={`text-[11px] px-2 py-0.5 rounded-full font-display italic ${
                  unlocked
                    ? 'bg-sage/20 text-forest border border-sage/40'
                    : 'bg-gray-100 text-bark/50 border border-gray-200'
                }`}
              >
                {speciesLabel(code)}
              </span>
            ))}
          </div>

          {!unlocked && prereqDisplayNames.length > 0 && (
            <div className="font-display italic text-xs mt-3 text-bark/60">
              finish{' '}
              <span className="not-italic text-bark/80 font-medium">
                {prereqDisplayNames.join(', ')}
              </span>{' '}
              to build this
            </div>
          )}
        </div>
      </div>

      {/* Sparkle accent on unlocked */}
      {unlocked && (
        <motion.div
          className="absolute top-2 right-2 text-xl text-sage"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.7, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 + Math.min(index * 0.05, 0.35) }}
        >
          ✦
        </motion.div>
      )}
    </motion.div>
  );
}

