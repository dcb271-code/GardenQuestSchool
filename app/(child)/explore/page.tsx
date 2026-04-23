import { Suspense } from 'react';
import Link from 'next/link';
import ExploreClient from './ExploreClient';

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center pt-2">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre hover:bg-ochre/10 active:bg-ochre/20"
          aria-label="back to profile picker"
          style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ←
        </Link>
        <h1 className="text-kid-lg text-center flex-1">🔍 Pick an exploration</h1>
        <div style={{ width: 44 }}></div>
      </div>
      <Suspense fallback={<div className="text-center text-kid-sm opacity-70">…</div>}>
        <ExploreClient />
      </Suspense>
    </main>
  );
}
