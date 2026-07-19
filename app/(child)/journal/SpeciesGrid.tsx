'use client';

import { useState } from 'react';
import JournalSpeciesCard from '@/components/child/JournalSpeciesCard';
import SpeciesDetailModal from '@/components/child/SpeciesDetailModal';
import { SPECIES_CATALOG, type SpeciesData } from '@/lib/world/speciesCatalog';

export default function SpeciesGrid({
  unlockedCodes, learnerId,
}: {
  unlockedCodes: string[];
  learnerId?: string;
}) {
  const unlocked = new Set(unlockedCodes);
  const [openSpecies, setOpenSpecies] = useState<SpeciesData | null>(null);

  const open = (s: SpeciesData) => {
    setOpenSpecies(s);
    // Reading up on a creature counts toward the day's curiosity gem.
    if (learnerId) {
      fetch('/api/gems/fact-peek', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, code: `species:${s.code}` }),
      }).catch(() => {});
    }
  };

  return (
    <>
      <div className="space-y-3">
        {SPECIES_CATALOG.map((s, i) => (
          <div
            key={s.code}
            onClick={() => unlocked.has(s.code) && open(s)}
            className={unlocked.has(s.code) ? 'cursor-pointer' : ''}
            role={unlocked.has(s.code) ? 'button' : undefined}
            tabIndex={unlocked.has(s.code) ? 0 : undefined}
            onKeyDown={e => {
              if (unlocked.has(s.code) && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                open(s);
              }
            }}
          >
            <JournalSpeciesCard species={s} unlocked={unlocked.has(s.code)} index={i} />
          </div>
        ))}
      </div>

      <SpeciesDetailModal
        species={openSpecies}
        open={!!openSpecies}
        learnerId={learnerId}
        onClose={() => setOpenSpecies(null)}
      />
    </>
  );
}
