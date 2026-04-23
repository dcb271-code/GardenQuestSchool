'use client';

import { useMemo } from 'react';
import type { SightWordTapContent, SightWordTapResponse } from '@/lib/packs/reading/types';

export default function SightWordTap({
  content, onSubmit,
}: {
  content: SightWordTapContent;
  onSubmit: (r: SightWordTapResponse) => void;
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
      <div className="grid grid-cols-2 gap-4">
        {choices.map((w, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: w })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl text-kid-lg py-8 font-bold"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
