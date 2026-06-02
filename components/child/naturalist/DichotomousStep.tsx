'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

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
  reducedMotion: boolean;
}

export default function DichotomousStep({
  question, leftLabel, rightLabel, leftPhoto, rightPhoto, onChoose, reducedMotion,
}: DichotomousStepProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <motion.h2
        key={question}
        initial={reducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="text-2xl md:text-3xl font-display text-bark text-center mb-6 mt-2"
      >
        {question}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {([
          { side: 'left' as const, label: leftLabel, photo: leftPhoto },
          { side: 'right' as const, label: rightLabel, photo: rightPhoto },
        ]).map((opt, i) => (
          <motion.button
            key={opt.side}
            onClick={() => onChoose(opt.side)}
            className="group block rounded-3xl overflow-hidden border-4 border-bark/20 hover:border-terracotta bg-cream shadow-md text-left active:scale-[0.98] transition-transform"
            style={{ touchAction: 'manipulation' }}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.08 }}
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
