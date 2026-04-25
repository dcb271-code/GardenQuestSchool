'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="max-w-md w-full bg-white border-4 border-terracotta rounded-3xl p-7 text-center space-y-4 shadow-2xl">
        <div className="text-6xl">🍂</div>
        <div>
          <div className="font-display italic text-[13px] tracking-[0.3em] uppercase text-bark/55">
            something
          </div>
          <h1
            className="font-display text-[28px] text-bark leading-tight mt-1"
            style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
          >
            <span className="italic text-forest">tripped on a root</span>
          </h1>
        </div>
        <p className="font-display italic text-[15px] text-bark/70">
          something went wrong loading this page. let&apos;s try again.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={reset}
            className="flex-1 bg-forest text-white rounded-full py-3 font-display"
            style={{ fontWeight: 600, minHeight: 56 }}
          >
            try again
          </button>
          <Link
            href="/picker"
            className="flex-1 bg-white border-4 border-ochre rounded-full py-3 font-display italic text-bark/75 inline-flex items-center justify-center"
            style={{ minHeight: 56 }}
          >
            go home
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
