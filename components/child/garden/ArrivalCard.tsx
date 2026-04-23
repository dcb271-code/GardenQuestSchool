'use client';

import { useState } from 'react';
import type { SpeciesData } from '@/lib/world/speciesCatalog';

export default function ArrivalCard({
  species,
  learnerId,
  onDismiss,
}: {
  species: SpeciesData;
  learnerId: string;
  onDismiss: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const welcome = async () => {
    setBusy(true);
    await fetch('/api/garden/arrival', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, speciesCode: species.code }),
    });
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-6 space-y-4 text-center">
        <div className="text-7xl">{species.emoji}</div>
        <h2 className="text-kid-lg text-bark">A {species.commonName} arrived!</h2>
        <div className="text-xs italic opacity-70">{species.scientificName}</div>
        <div className="text-kid-sm text-bark/80 text-left bg-white/60 rounded-xl p-3">
          {species.funFact}
        </div>
        <button
          onClick={welcome}
          disabled={busy}
          className="w-full bg-forest text-white rounded-full py-4 text-kid-md disabled:opacity-50"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          {busy ? 'Welcoming…' : '🌿 Welcome them!'}
        </button>
      </div>
    </div>
  );
}
