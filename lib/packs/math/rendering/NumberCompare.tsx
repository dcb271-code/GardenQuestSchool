'use client';

import type { NumberCompareContent, NumberCompareResponse, CompareSymbol } from '@/lib/packs/math/types';

export default function NumberCompare({
  content, onSubmit,
}: {
  content: NumberCompareContent;
  onSubmit: (r: NumberCompareResponse) => void;
  retries: number;
}) {
  const symbols: CompareSymbol[] = ['<', '=', '>'];
  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="flex justify-center items-center gap-4">
        <div className="bg-white rounded-2xl border-4 border-sage px-6 py-8 text-kid-lg font-bold min-w-[100px] text-center">
          {content.left}
        </div>
        <div className="text-kid-md text-bark/50">?</div>
        <div className="bg-white rounded-2xl border-4 border-sage px-6 py-8 text-kid-lg font-bold min-w-[100px] text-center">
          {content.right}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {symbols.map(sym => (
          <button
            key={sym}
            onClick={() => onSubmit({ symbol: sym })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl text-kid-lg py-6 font-bold"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
            aria-label={sym === '<' ? 'less than' : sym === '>' ? 'greater than' : 'equal to'}
          >
            {sym}
          </button>
        ))}
      </div>
      <div className="text-xs text-center opacity-60 flex justify-around px-2">
        <span>less</span>
        <span>same</span>
        <span>more</span>
      </div>
    </div>
  );
}
