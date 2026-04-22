'use client';

import { useState } from 'react';
import type { NumberBondsContent, NumberBondsResponse } from '@/lib/packs/math/types';

export default function NumberBonds({
  content, onSubmit,
}: {
  content: NumberBondsContent;
  onSubmit: (r: NumberBondsResponse) => void;
  retries: number;
}) {
  const [input, setInput] = useState<string>('');

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="flex justify-center items-center gap-4 text-kid-lg">
        <div className="bg-white rounded-2xl border-4 border-sage p-6 w-24 text-center">
          {content.knownPart}
        </div>
        <div className="text-4xl">+</div>
        <div className="bg-white rounded-2xl border-4 border-ochre p-6 w-24 text-center">
          <input
            inputMode="numeric"
            className="w-full text-center bg-transparent outline-none text-kid-lg"
            value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
            autoFocus
            style={{ touchAction: 'manipulation' }}
          />
        </div>
        <div className="text-4xl">=</div>
        <div className="bg-white rounded-2xl border-4 border-sage p-6 w-24 text-center">
          {content.whole}
        </div>
      </div>
      <button
        disabled={input === ''}
        onClick={() => onSubmit({ missing: Number(input) })}
        className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50"
        style={{ touchAction: 'manipulation', minHeight: 60 }}
      >
        Check
      </button>
    </div>
  );
}
