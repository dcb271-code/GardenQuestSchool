'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AttributionBadge from './AttributionBadge';

export interface KeyPhotoRef {
  url: string;
  alt: string;
  attribution: {
    photographer: string | null;
    licenseCode: string;
    sourceUrl: string;
  };
}

export interface DichotomousStepProps {
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
  onChoose: (side: 'left' | 'right') => void;
  /** Side the child just tapped wrongly — shows the gentle nudge. */
  wrongSide?: 'left' | 'right' | null;
  /** After repeated misses, pulse the correct side so she's never stuck. */
  revealCorrect?: 'left' | 'right' | null;
  /**
   * Hazard species: phrase the nudge so that being unsure reads as the
   * safe move rather than a mistake to correct.
   */
  cautionNudge?: boolean;
  reducedMotion: boolean;
}

export default function DichotomousStep({
  question, leftLabel, rightLabel, leftPhoto, rightPhoto, onChoose,
  wrongSide = null, revealCorrect = null, cautionNudge = false, reducedMotion,
}: DichotomousStepProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <motion.h2
        key={question}
        initial={reducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="text-2xl md:text-3xl font-display text-bark text-center mb-3 mt-2"
      >
        {question}
      </motion.h2>

      <div aria-live="polite" className="min-h-[2rem] mb-3">
        {wrongSide && (
          <motion.p
            key={`nudge-${revealCorrect ? 'reveal' : 'look'}`}
            initial={reducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-display italic text-terracotta text-center"
          >
            {revealCorrect
              ? 'good looking! it’s this one — see the difference?'
              : cautionNudge
                ? 'not sure? take another look 🔍 — and remember, not touching is always okay'
                : 'hmm — tap “Your plant” and take another look 🔍'}
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {([
          { side: 'left' as const, label: leftLabel, photo: leftPhoto },
          { side: 'right' as const, label: rightLabel, photo: rightPhoto },
        ]).map((opt, i) => (
          <motion.button
            key={opt.side}
            onClick={() => onChoose(opt.side)}
            className={`group block rounded-3xl overflow-hidden border-4 bg-cream shadow-md text-left active:scale-[0.98] transition-transform ${
              revealCorrect === opt.side
                ? 'border-forest'
                : wrongSide === opt.side
                  ? 'border-terracotta/70 opacity-60'
                  : 'border-bark/20 hover:border-terracotta'
            }`}
            style={{ touchAction: 'manipulation' }}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={
              revealCorrect === opt.side && !reducedMotion
                ? { opacity: 1, y: 0, scale: [1, 1.03, 1] }
                : { opacity: 1, y: 0 }
            }
            transition={
              revealCorrect === opt.side && !reducedMotion
                ? { duration: 0.9, repeat: Infinity }
                : { duration: 0.28, delay: i * 0.08 }
            }
            aria-label={`Choose: ${opt.label}`}
          >
            <div className="relative w-full aspect-[4/3] bg-bark/10">
              {opt.photo.url
                ? (
                  <Image
                    src={opt.photo.url}
                    alt={opt.photo.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 40vw"
                    className="object-cover"
                  />
                )
                : (
                  <div className="absolute inset-0 flex items-center justify-center text-bark/40 italic">
                    {opt.label}
                  </div>
                )
              }
              {opt.photo.url && <AttributionBadge attribution={opt.photo.attribution} />}
            </div>
            <div className="p-4 text-bark text-lg md:text-xl font-display">
              {opt.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
