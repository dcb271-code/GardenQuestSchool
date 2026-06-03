'use client';

import type { FloraJournalEntry } from '@/lib/naturalist/floraJournal';

export default function FloraJournalGrid({ entries }: { entries: FloraJournalEntry[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {entries.map(e => (
        <div
          key={e.code}
          className={`rounded-2xl overflow-hidden border-2 ${
            e.discovered ? 'border-forest/30 bg-cream' : 'border-bark/10 bg-bark/5'
          }`}
        >
          <div className="relative w-full aspect-square bg-bark/10">
            {e.discovered && e.heroUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.heroUrl} alt={e.commonName} className="w-full h-full object-cover" />
            ) : e.discovered ? (
              <div className="absolute inset-0 flex items-center justify-center text-4xl">{e.emoji}</div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-3xl grayscale opacity-40">
                {e.emoji}
              </div>
            )}
          </div>
          <div className="p-2 text-center">
            {e.discovered ? (
              <div className="font-display text-[12px] text-bark leading-tight">{e.commonName}</div>
            ) : (
              <div className="font-display italic text-[11px] text-bark/45 leading-tight">to discover</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
