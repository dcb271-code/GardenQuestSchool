import { Suspense } from 'react';
import ExploreClient from './ExploreClient';

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-kid-lg text-center pt-4">🔍 Pick an exploration</h1>
      <Suspense fallback={<div className="text-center text-kid-sm opacity-70">…</div>}>
        <ExploreClient />
      </Suspense>
    </main>
  );
}
