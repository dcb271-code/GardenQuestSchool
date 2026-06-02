'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { KeyPhotoRef } from './DichotomousStep';

export interface SpeciesRevealProps {
  commonName: string;
  scientificName: string;
  heroPhoto: KeyPhotoRef | null;
  revealPhotos: KeyPhotoRef[];
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  onContinue: () => void;
  reducedMotion: boolean;
}

export default function SpeciesReveal({
  commonName, scientificName, heroPhoto, revealPhotos, notableFeatures, facts, emoji, onContinue, reducedMotion,
}: SpeciesRevealProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto px-4 py-4 w-full">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/20 bg-cream shadow-lg mb-6 relative aspect-square"
      >
        {heroPhoto?.url
          ? <Image src={heroPhoto.url} alt={heroPhoto.alt} fill sizes="400px" className="object-cover" priority />
          : <div className="absolute inset-0 flex items-center justify-center text-7xl">{emoji}</div>
        }
      </motion.div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="text-center mb-4"
      >
        <div className="text-bark/60 text-sm uppercase tracking-wide mb-1">You found a</div>
        <h2 className="text-4xl md:text-5xl font-display text-terracotta mb-1">{commonName}</h2>
        <div className="italic text-bark/70">{scientificName}</div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-5">
        {revealPhotos.slice(0, 3).map((p, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => setActiveFeature(i)}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.25 + 0.08 * i }}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-bark/15 hover:border-terracotta"
            style={{ touchAction: 'manipulation' }}
            aria-label={p.alt}
          >
            <Image src={p.url} alt={p.alt} fill sizes="160px" className="object-cover" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeFeature !== null && (
          <motion.div
            key={activeFeature}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            className="text-center text-bark italic mb-3"
          >
            {notableFeatures[activeFeature] ?? ''}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-bark/80 text-center space-y-2 mb-6 max-w-xl">
        {facts.slice(0, 2).map((f, i) => (
          <p key={i}>{f}</p>
        ))}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="px-8 py-4 rounded-full bg-terracotta text-cream font-display text-xl shadow-md"
        style={{ minHeight: 60, touchAction: 'manipulation' }}
      >
        Found! →
      </button>
    </div>
  );
}
