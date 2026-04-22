'use client';

import { useState } from 'react';
import type { CountingTilesContent, CountingTilesResponse } from '@/lib/packs/math/types';

export default function CountingTiles({
  content, onSubmit,
}: {
  content: CountingTilesContent;
  onSubmit: (r: CountingTilesResponse) => void;
  retries: number;
}) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());

  const icons = Array.from({ length: content.count }, (_, i) => i);

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center">{content.promptText}</div>
      <div className="flex flex-wrap gap-3 justify-center bg-sage/10 rounded-2xl p-6">
        {icons.map(i => (
          <button
            key={i}
            onClick={() => {
              const next = new Set(tapped);
              if (next.has(i)) next.delete(i); else next.add(i);
              setTapped(next);
            }}
            className={`text-5xl p-3 rounded-xl transition ${tapped.has(i) ? 'bg-ochre/40 scale-110' : 'bg-white'}`}
            style={{ touchAction: 'manipulation', minWidth: 60, minHeight: 60 }}
            aria-label={`tile ${i + 1}`}
          >
            {content.emoji}
          </button>
        ))}
      </div>
      <div className="text-kid-md text-center">
        Counted: <span className="font-bold">{tapped.size}</span>
      </div>
      <button
        onClick={() => onSubmit({ count: tapped.size })}
        disabled={tapped.size === 0}
        className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50"
        style={{ touchAction: 'manipulation', minHeight: 60 }}
      >
        That&apos;s my count
      </button>
    </div>
  );
}
