'use client';

import type { HabitatTypeData } from '@/lib/world/habitatCatalog';

export interface TrayItem {
  code: string;
  name: string;
  emoji: string;
  unlocked: boolean;
  placed: boolean;
  prereqDisplay: string;
}

export default function HabitatTray({
  items,
  activeCode,
  onActivate,
}: {
  items: TrayItem[];
  activeCode: string | null;
  onActivate: (code: string | null) => void;
}) {
  return (
    <div className="bg-cream border-t-4 border-ochre p-3">
      <div className="text-xs uppercase tracking-wider opacity-70 mb-2 px-1">
        {activeCode ? 'Tap a cell to place' : 'Your habitats'}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {items.map(item => {
          const disabled = !item.unlocked || item.placed;
          const isActive = activeCode === item.code;
          return (
            <button
              key={item.code}
              disabled={disabled}
              onClick={() => onActivate(isActive ? null : item.code)}
              className={`flex flex-col items-center shrink-0 rounded-xl border-4 px-3 py-2 min-w-[88px] ${
                disabled
                  ? 'bg-gray-100 border-gray-200 opacity-60'
                  : isActive
                    ? 'bg-terracotta/20 border-terracotta'
                    : 'bg-white border-ochre'
              }`}
              style={{ touchAction: 'manipulation', minHeight: 80 }}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-xs mt-1 font-semibold text-bark">{item.name}</span>
              {item.placed && <span className="text-[10px] mt-0.5 text-forest">placed</span>}
              {!item.unlocked && <span className="text-[10px] mt-0.5 opacity-70">locked</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { HabitatTypeData };
