'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

/**
 * Tap-to-wonder detail modal for a discovered species. Shows the
 * description + fun fact in a richer layout than the inline card.
 * Each open is logged to localStorage so we can credit the
 * "wondering" / "curiosity" virtues over time.
 */
export default function SpeciesDetailModal({
  species, open, onClose,
}: {
  species: SpeciesData | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open || !species || typeof window === 'undefined') return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const key = `gqs:wonder:${today}`;
      const raw = window.localStorage.getItem(key);
      const log: string[] = raw ? JSON.parse(raw) : [];
      log.push(species.code);
      window.localStorage.setItem(key, JSON.stringify(log));
    } catch { /* ignore */ }
  }, [open, species]);

  if (!species) return null;

  const habitats = HABITAT_CATALOG.filter(h =>
    species.habitatReqCodes.includes(h.code),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-cream border-4 border-sage rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Soft sage glow behind */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 25%, rgba(149, 184, 143, 0.4), transparent 65%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            {/* Big emoji with subtle floating */}
            <div className="flex justify-center relative">
              <motion.div
                className="text-8xl"
                style={{ filter: 'drop-shadow(0 6px 8px rgba(107, 68, 35, 0.25))' }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {species.emoji}
              </motion.div>
              {/* sparkle accent */}
              <div className="absolute top-0 right-1/4 text-xl text-sun">✦</div>
            </div>

            <div className="text-center relative z-10">
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                you wondered about
              </div>
              <h2
                className="font-display text-[28px] text-bark leading-tight mt-1"
                style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                <span className="italic text-forest">{species.commonName}</span>
              </h2>
              <div className="font-display italic text-[13px] text-bark/55 mt-1 tracking-wide">
                {species.scientificName}
              </div>
            </div>

            <div className="bg-white/70 border-2 border-sage/40 rounded-xl p-4 space-y-3 relative z-10">
              <div>
                <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-sage mb-1">
                  what they do
                </div>
                <p className="text-[15px] text-bark/85 leading-snug" style={{ fontWeight: 400 }}>
                  {species.description}
                </p>
              </div>

              <div className="border-t border-sage/30 pt-3">
                <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-rose mb-1">
                  did you know
                </div>
                <p className="font-display text-[15px] text-bark leading-snug" style={{ fontWeight: 500 }}>
                  {species.funFact}
                </p>
              </div>

              {habitats.length > 0 && (
                <div className="border-t border-sage/30 pt-3">
                  <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/55 mb-1.5">
                    where they live
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {habitats.map(h => (
                      <span
                        key={h.code}
                        className="inline-flex items-center gap-1 bg-cream border border-ochre/50 rounded-full px-2.5 py-1 text-[13px]"
                      >
                        <span className="text-base">{h.emoji}</span>
                        <span style={{ fontWeight: 600 }}>{h.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <motion.button
              onClick={onClose}
              className="w-full bg-sage text-white rounded-full py-3 font-display"
              style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
              whileTap={{ scale: 0.97 }}
            >
              keep exploring
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
