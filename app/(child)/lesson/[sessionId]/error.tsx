'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LessonError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lesson error:', error);
  }, [error]);

  return (
    <main className="max-w-xl mx-auto p-6 pt-12">
      <div className="bg-white border-4 border-terracotta rounded-3xl p-6 text-center space-y-4">
        <div className="text-5xl">🍃</div>
        <h1
          className="font-display text-[24px] text-bark leading-tight"
          style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          <span className="italic text-forest">a question got tangled</span>
        </h1>
        <p className="font-display italic text-[15px] text-bark/70">
          let&apos;s go back to the garden and try a different spot.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={reset}
            className="flex-1 bg-white border-4 border-ochre rounded-full py-3 font-display italic text-bark/75"
            style={{ minHeight: 52 }}
          >
            try again
          </button>
          <Link
            href="/picker"
            className="flex-1 bg-sage text-white rounded-full py-3 font-display inline-flex items-center justify-center"
            style={{ fontWeight: 600, minHeight: 52 }}
          >
            home
          </Link>
        </div>
        {error.digest && (
          <div className="text-[11px] text-bark/40 font-mono pt-1">
            ref: {error.digest}
          </div>
        )}
      </div>
    </main>
  );
}
