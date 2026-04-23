'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GardenGrid, { GARDEN_WIDTH, GARDEN_HEIGHT, type PlacedHabitatView } from '@/components/child/garden/GardenGrid';
import LunaWanderer from '@/components/child/garden/LunaWanderer';
import AmbientCreatures from '@/components/child/garden/AmbientCreatures';
import HabitatTray, { type TrayItem } from '@/components/child/garden/HabitatTray';
import ArrivalCard from '@/components/child/garden/ArrivalCard';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import type { GridPos } from '@/lib/world/gardenLayout';

export default function GardenScene({
  learnerId,
  initialPlaced,
  trayItems,
  pendingArrival,
}: {
  learnerId: string;
  initialPlaced: PlacedHabitatView[];
  trayItems: TrayItem[];
  pendingArrival: SpeciesData | null;
}) {
  const router = useRouter();
  const [placed, setPlaced] = useState<PlacedHabitatView[]>(initialPlaced);
  const [tray, setTray] = useState<TrayItem[]>(trayItems);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [arrival, setArrival] = useState<SpeciesData | null>(pendingArrival);
  const [error, setError] = useState<string | null>(null);

  const placeMode = activeCode !== null;

  // Time-of-day tint
  const hour = new Date().getHours();
  const tintColor =
    hour < 6 ? 'rgba(60, 60, 120, 0.25)' :
    hour < 10 ? 'rgba(255, 210, 140, 0.15)' :
    hour < 17 ? 'transparent' :
    hour < 20 ? 'rgba(255, 160, 100, 0.2)' :
    'rgba(30, 30, 80, 0.3)';

  const handleCellTap = async (pos: GridPos) => {
    if (!activeCode) return;
    setError(null);
    const res = await fetch('/api/garden/place', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, habitatCode: activeCode, position: pos }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'could not place');
      return;
    }
    const d = await res.json();
    const trayItem = tray.find(t => t.code === activeCode);
    setPlaced(prev => [...prev, {
      id: d.placed.id,
      code: d.placed.code,
      emoji: trayItem?.emoji ?? '🏠',
      position: d.placed.position,
    }]);
    setTray(prev => prev.map(t => t.code === activeCode ? { ...t, placed: true } : t));
    setActiveCode(null);
    // Refresh server state so server-side arrival detection fires on next page view
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-3 bg-cream">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="text-kid-md text-bark">🌿 My Garden</h1>
        <Link
          href="/journal"
          className="text-xl p-2 rounded-full bg-white border border-ochre"
          aria-label="journal"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >📖</Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden bg-gradient-to-b from-sky-200 via-cream to-sage/30">
        <svg
          viewBox={`0 0 ${GARDEN_WIDTH} ${GARDEN_HEIGHT}`}
          className="w-full h-auto max-h-[60vh]"
          style={{ touchAction: 'manipulation' }}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8D4F0" />
              <stop offset="60%" stopColor="#E8D5B7" />
              <stop offset="100%" stopColor="#95B88F" />
            </linearGradient>
          </defs>
          <rect width={GARDEN_WIDTH} height={GARDEN_HEIGHT} fill="url(#skyGrad)" />
          {/* soft ground texture: a few scattered flower tufts */}
          {[[50, 380], [150, 390], [310, 385], [450, 380], [570, 388]].map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize={18} style={{ pointerEvents: 'none', opacity: 0.8 }}>🌼</text>
          ))}

          <AmbientCreatures />
          <GardenGrid placed={placed} placeMode={placeMode} onCellTap={handleCellTap} />
          <LunaWanderer />

          {/* time-of-day tint overlay */}
          <rect width={GARDEN_WIDTH} height={GARDEN_HEIGHT} fill={tintColor} pointerEvents="none" />
        </svg>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 text-center text-sm">{error}</div>
      )}

      <HabitatTray items={tray} activeCode={activeCode} onActivate={setActiveCode} />

      {arrival && (
        <ArrivalCard
          species={arrival}
          learnerId={learnerId}
          onDismiss={() => {
            setArrival(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
