'use client';

import { useState } from 'react';
import type { PlaceValueSplitContent, PlaceValueSplitResponse } from '@/lib/packs/math/types';

export default function PlaceValueSplit({
  content, onSubmit,
}: {
  content: PlaceValueSplitContent;
  onSubmit: (r: PlaceValueSplitResponse) => void;
  retries: number;
}) {
  const [hundreds, setHundreds] = useState<string>('');
  const [tens, setTens] = useState<string>('');
  const [ones, setOnes] = useState<string>('');

  const ready = content.showHundreds
    ? hundreds !== '' && tens !== '' && ones !== ''
    : tens !== '' && ones !== '';

  const submit = () => {
    const resp: PlaceValueSplitResponse = {
      tens: Number(tens),
      ones: Number(ones),
    };
    if (content.showHundreds) resp.hundreds = Number(hundreds);
    onSubmit(resp);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl border-4 border-sage px-8 py-6 text-kid-lg font-bold">
          {content.number}
        </div>
      </div>
      <div className={`grid ${content.showHundreds ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        {content.showHundreds && (
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider opacity-70 mb-1">hundreds</div>
            <input
              inputMode="numeric"
              maxLength={2}
              className="w-full text-center bg-white border-4 border-ochre rounded-2xl py-4 text-kid-lg outline-none focus:border-terracotta"
              value={hundreds}
              onChange={e => setHundreds(e.target.value.replace(/\D/g, ''))}
              style={{ touchAction: 'manipulation' }}
            />
          </div>
        )}
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider opacity-70 mb-1">tens</div>
          <input
            inputMode="numeric"
            maxLength={2}
            className="w-full text-center bg-white border-4 border-ochre rounded-2xl py-4 text-kid-lg outline-none focus:border-terracotta"
            value={tens}
            onChange={e => setTens(e.target.value.replace(/\D/g, ''))}
            style={{ touchAction: 'manipulation' }}
          />
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider opacity-70 mb-1">ones</div>
          <input
            inputMode="numeric"
            maxLength={2}
            className="w-full text-center bg-white border-4 border-ochre rounded-2xl py-4 text-kid-lg outline-none focus:border-terracotta"
            value={ones}
            onChange={e => setOnes(e.target.value.replace(/\D/g, ''))}
            style={{ touchAction: 'manipulation' }}
          />
        </div>
      </div>
      <button
        disabled={!ready}
        onClick={submit}
        className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50"
        style={{ touchAction: 'manipulation', minHeight: 60 }}
      >
        Check
      </button>
    </div>
  );
}
