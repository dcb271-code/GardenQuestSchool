'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { KeyPhotoRef } from './DichotomousStep';
import AttributionBadge from './AttributionBadge';

export interface WalkSummaryCard {
  floraCode: string;
  commonName: string;
  heroPhoto: KeyPhotoRef | null;
  emoji: string;
}

export default function EndOfWalk({
  cards, learnerId, reducedMotion,
}: { cards: WalkSummaryCard[]; learnerId: string; reducedMotion: boolean }) {
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto px-4 py-8">
      <motion.h1
        initial={reducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-display text-bark mb-2 text-center"
      >
        Your walk today
      </motion.h1>
      <p className="text-bark/70 mb-8 text-center">
        Added to your Field Journal.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.floraCode}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.12 * i }}
            className="rounded-2xl overflow-hidden border-2 border-bark/15 bg-cream shadow-sm"
          >
            <div className="relative w-full aspect-square bg-bark/10">
              {c.heroPhoto?.url
                ? <Image src={c.heroPhoto.url} alt={c.heroPhoto.alt} fill sizes="200px" className="object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center text-4xl">{c.emoji}</div>
              }
              {c.heroPhoto?.url && <AttributionBadge attribution={c.heroPhoto.attribution} />}
            </div>
            <div className="p-3 text-center text-bark font-display">
              {c.commonName}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href={`/journal?learner=${learnerId}`}
          className="px-6 py-3 rounded-full bg-sage text-cream font-display text-lg shadow-md"
          style={{ minHeight: 60, minWidth: 120, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          See journal
        </Link>
        <Link
          href={`/garden?learner=${learnerId}`}
          className="px-6 py-3 rounded-full bg-terracotta text-cream font-display text-lg shadow-md"
          style={{ minHeight: 60, minWidth: 120, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Back to the garden
        </Link>
      </div>
    </div>
  );
}
