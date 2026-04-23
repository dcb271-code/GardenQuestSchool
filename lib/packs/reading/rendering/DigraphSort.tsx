'use client';

import { useState } from 'react';
import type { DigraphSortContent, DigraphSortResponse } from '@/lib/packs/reading/types';

export default function DigraphSort({
  content, onSubmit,
}: {
  content: DigraphSortContent;
  onSubmit: (r: DigraphSortResponse) => void;
  retries: number;
}) {
  const [placements, setPlacements] = useState<Record<string, string | null>>(
    Object.fromEntries(content.words.map(w => [w.word, null]))
  );

  const place = (word: string, digraph: string) => {
    setPlacements(prev => ({ ...prev, [word]: digraph || null }));
  };

  const allPlaced = Object.values(placements).every(v => v !== null);

  const submit = () => {
    const finalPlacements: Record<string, string> = {};
    for (const [w, d] of Object.entries(placements)) {
      if (d) finalPlacements[w] = d;
    }
    onSubmit({ placements: finalPlacements });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-kid-lg text-center">{content.promptText}</div>

      <div className="grid grid-cols-3 gap-2">
        {content.digraphs.map(dg => (
          <div key={dg} className="bg-cream border-4 border-terracotta rounded-2xl p-3 min-h-32">
            <div className="text-center font-bold text-kid-md mb-2">{dg}</div>
            <div className="flex flex-col gap-1">
              {Object.entries(placements)
                .filter(([, d]) => d === dg)
                .map(([word]) => {
                  const ref = content.words.find(w => w.word === word);
                  return (
                    <button
                      key={word}
                      onClick={() => place(word, '')}
                      className="bg-white border border-terracotta rounded-lg p-1 text-sm text-center"
                      style={{ touchAction: 'manipulation' }}
                      aria-label={`remove ${word}`}
                    >
                      {ref?.emoji ?? ''} {word}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {content.words.filter(w => placements[w.word] === null).map(w => (
          <div key={w.word} className="flex items-center gap-2">
            <div className="flex-none w-24 text-right font-bold text-kid-sm">{w.emoji ?? ''} {w.word}</div>
            <div className="flex gap-2 flex-1">
              {content.digraphs.map(dg => (
                <button
                  key={dg}
                  onClick={() => place(w.word, dg)}
                  className="flex-1 bg-white border-2 border-ochre rounded-lg py-2 text-sm hover:bg-ochre/20 font-bold"
                  style={{ touchAction: 'manipulation', minHeight: 44 }}
                >
                  {dg}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={!allPlaced}
        className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50"
        style={{ touchAction: 'manipulation', minHeight: 60 }}
      >
        Check
      </button>
    </div>
  );
}
