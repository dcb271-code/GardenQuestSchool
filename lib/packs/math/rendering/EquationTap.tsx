'use client';

import type { EquationTapContent, EquationTapResponse } from '@/lib/packs/math/types';

export default function EquationTap({
  content, onSubmit,
}: {
  content: EquationTapContent;
  onSubmit: (r: EquationTapResponse) => void;
  retries: number;
}) {
  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.equation}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {content.choices.map((n, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: n })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl text-kid-lg py-8"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
