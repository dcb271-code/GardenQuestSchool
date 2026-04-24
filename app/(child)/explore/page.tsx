import { Suspense } from 'react';
import ExploreClient from './ExploreClient';
import ExploreHeader from './ExploreHeader';

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6 pb-16">
      <ExploreHeader />
      <Suspense fallback={<div className="text-center font-display italic text-bark/60">…</div>}>
        <ExploreClient />
      </Suspense>
    </main>
  );
}
