'use client';

import { useMemo } from 'react';
import type { PhonemeBlendContent, PhonemeBlendResponse } from '@/lib/packs/reading/types';

export default function PhonemeBlend({
  content, onSubmit,
}: {
  content: PhonemeBlendContent;
  onSubmit: (r: PhonemeBlendResponse) => void;
  retries: number;
}) {
  const choices = useMemo(() => {
    const all = [content.word, ...content.distractors];
    return [...all].sort(() => Math.random() - 0.5);
  }, [content.word, content.distractors]);

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="flex justify-center items-center gap-2 text-kid-lg">
        {content.phonemes.map((p, i) => (
          <div key={i} className="bg-white border-4 border-sage rounded-2xl p-4 min-w-[48px] text-center font-mono">
            {p}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((w, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: w })}
            className="bg-white hover:bg-rose/20 active:bg-rose/40 border-4 border-rose rounded-2xl text-kid-lg py-8 font-bold"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
