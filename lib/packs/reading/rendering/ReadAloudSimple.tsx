'use client';

import type { ReadAloudSimpleContent, ReadAloudSimpleResponse } from '@/lib/packs/reading/types';

export default function ReadAloudSimple({
  content, onSubmit,
}: {
  content: ReadAloudSimpleContent;
  onSubmit: (r: ReadAloudSimpleResponse) => void;
  retries: number;
}) {
  return (
    <div className="space-y-8 py-6 text-center">
      <div className="text-kid-lg bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="text-7xl font-bold text-bark tracking-wide">
        {content.word}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => onSubmit({ claimed: true })}
          className="bg-forest text-white rounded-full px-8 py-4 text-kid-md"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          ✓ I read it
        </button>
        <button
          onClick={() => onSubmit({ claimed: false })}
          className="bg-white border-4 border-ochre rounded-full px-6 py-4 text-kid-sm"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
