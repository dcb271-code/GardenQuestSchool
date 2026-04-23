'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GARDEN_STRUCTURES, MAP_WIDTH, MAP_HEIGHT } from '@/lib/world/gardenMap';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import ArrivalCard from '@/components/child/garden/ArrivalCard';
import LunaWanderer from '@/components/child/garden/LunaWanderer';
import { StructureIllustration, Tree, PineTree, Flower, GrassTuft } from '@/components/child/garden/illustrations';

interface StructureState {
  unlocked: boolean;
  prereqDisplay: string;
}

export default function GardenScene({
  learnerId,
  structureStates,
  pendingArrival,
}: {
  learnerId: string;
  structureStates: Record<string, StructureState>;
  pendingArrival: SpeciesData | null;
}) {
  const router = useRouter();
  const [arrival, setArrival] = useState<SpeciesData | null>(pendingArrival);
  const [selected, setSelected] = useState<MapStructure | null>(null);
  const [starting, setStarting] = useState(false);

  const hour = typeof window !== 'undefined' ? new Date().getHours() : 12;
  const tint =
    hour < 6 ? 'rgba(40, 50, 100, 0.35)' :
    hour < 9 ? 'rgba(255, 200, 140, 0.15)' :
    hour < 17 ? 'transparent' :
    hour < 20 ? 'rgba(255, 150, 90, 0.18)' :
    'rgba(20, 25, 60, 0.35)';

  const startSkill = async (skillCode: string) => {
    setStarting(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, skillCode }),
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  const onStructureTap = (s: MapStructure) => {
    const state = structureStates[s.code];
    if (!state?.unlocked) {
      setSelected(s);
      return;
    }
    if (s.kind === 'skill' && s.skillCode) {
      startSkill(s.skillCode);
      return;
    }
    setSelected(s);
  };

  return (
    <div className="min-h-screen bg-[#F5EBDC] flex flex-col">
      <div className="flex items-center justify-between p-3 bg-cream/90 backdrop-blur border-b border-ochre/30">
        <Link
          href="/picker"
          className="text-2xl p-2 rounded-full bg-white border border-ochre"
          aria-label="back"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="text-kid-md text-bark">🌿 My Garden</h1>
        <Link
          href={`/journal?learner=${learnerId}`}
          className="text-xl p-2 rounded-full bg-white border border-ochre"
          aria-label="journal"
          style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >📖</Link>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ touchAction: 'manipulation', maxHeight: '78vh' }}
        >
          <defs>
            <radialGradient id="readingZone" cx="20%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#E8D5B7" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mathZone" cx="85%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#F4CFA3" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bunnyZone" cx="18%" cy="80%" r="35%">
              <stop offset="0%" stopColor="#C8B1A6" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="waterZone" cx="85%" cy="82%" r="40%">
              <stop offset="0%" stopColor="#A6D0D8" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="meadowBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8E4B0" />
              <stop offset="100%" stopColor="#95B88F" />
            </linearGradient>
            <pattern id="grassTexture" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="transparent" />
              <path d="M 4 36 Q 4 30 6 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.55" />
              <path d="M 20 38 Q 22 32 24 30" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
              <path d="M 32 36 Q 30 32 32 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.55" />
            </pattern>
          </defs>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#meadowBase)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grassTexture)" />

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#readingZone)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#mathZone)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#bunnyZone)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#waterZone)" />

          {/* winding main path */}
          <path
            d="M 450 120 Q 500 250 420 360 Q 380 450 540 520 Q 680 560 720 470 Q 780 380 720 280 Q 680 200 780 160"
            stroke="#E8D5B7" strokeWidth="44" fill="none" strokeLinecap="round" opacity="0.85"
          />
          <path
            d="M 450 120 Q 500 250 420 360 Q 380 450 540 520 Q 680 560 720 470 Q 780 380 720 280 Q 680 200 780 160"
            stroke="#D9C29B" strokeWidth="44" fill="none" strokeLinecap="round" strokeDasharray="2 20" opacity="0.5"
          />
          <path d="M 720 470 Q 820 540 940 620" stroke="#E8D5B7" strokeWidth="36" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M 540 520 Q 420 580 300 640" stroke="#E8D5B7" strokeWidth="36" fill="none" strokeLinecap="round" opacity="0.8" />

          {/* pond */}
          <g>
            <ellipse cx="900" cy="640" rx="140" ry="80" fill="#8DB7C2" opacity="0.9" />
            <ellipse cx="900" cy="640" rx="120" ry="64" fill="#A8CFD8" />
            <ellipse cx="870" cy="625" rx="20" ry="6" fill="#FFFFFF" opacity="0.4" />
            <ellipse cx="930" cy="655" rx="14" ry="5" fill="#FFFFFF" opacity="0.3" />
          </g>

          {/* trees NW (reading grove) */}
          <Tree x={80} y={100} size={100} variant={1} />
          <PineTree x={170} y={80} size={90} />
          <Tree x={50} y={200} size={80} variant={2} />
          <Tree x={200} y={50} size={70} variant={3} />
          {/* trees NE (math mound backdrop) */}
          <PineTree x={1140} y={70} size={100} />
          <Tree x={1080} y={130} size={90} variant={1} />
          <Tree x={1170} y={170} size={70} variant={2} />
          {/* SW corner tree (bunny glade) */}
          <Tree x={70} y={680} size={90} variant={2} />
          <Tree x={120} y={620} size={70} variant={3} />
          {/* SE corner tree (water's edge) */}
          <PineTree x={1150} y={550} size={85} />
          <Tree x={1130} y={650} size={75} variant={1} />
          {/* meadow flower scatter */}
          <Flower x={150} y={420} size={11} color="#E6B0D0" />
          <Flower x={200} y={500} size={10} color="#FFD166" />
          <Flower x={290} y={460} size={11} color="#A675B0" />
          <Flower x={520} y={280} size={10} color="#FFB7C5" />
          <Flower x={640} y={220} size={11} color="#FFD166" />
          <Flower x={620} y={400} size={10} color="#E6B0D0" />
          <Flower x={750} y={430} size={11} color="#FFB7C5" />
          <Flower x={480} y={630} size={10} color="#FFD166" />
          <Flower x={420} y={700} size={11} color="#A675B0" />
          <Flower x={620} y={680} size={10} color="#E6B0D0" />
          <Flower x={1000} y={440} size={11} color="#FFD166" />
          <Flower x={830} y={420} size={10} color="#A675B0" />
          {/* grass tufts scattered */}
          <GrassTuft x={350} y={460} size={12} />
          <GrassTuft x={580} y={520} size={14} />
          <GrassTuft x={720} y={380} size={11} />
          <GrassTuft x={460} y={680} size={13} />
          <GrassTuft x={870} y={500} size={12} />

          {/* zone labels */}
          <text x="180" y="100" fontSize="14" fill="#6B4423" opacity="0.45" fontWeight="600" letterSpacing="2">READING GROVE</text>
          <text x="920" y="70" fontSize="14" fill="#6B4423" opacity="0.45" fontWeight="600" letterSpacing="2">MATH MOUND</text>
          <text x="150" y="770" fontSize="14" fill="#6B4423" opacity="0.45" fontWeight="600" letterSpacing="2">BUNNY GLADE</text>
          <text x="830" y="770" fontSize="14" fill="#6B4423" opacity="0.45" fontWeight="600" letterSpacing="2">WATER&apos;S EDGE</text>

          {GARDEN_STRUCTURES.map(s => {
            const state = structureStates[s.code] ?? { unlocked: false, prereqDisplay: '' };
            return (
              <Structure key={s.code} struct={s} unlocked={state.unlocked} onTap={() => onStructureTap(s)} />
            );
          })}

          <LunaWanderer mapWidth={MAP_WIDTH} mapHeight={MAP_HEIGHT} />

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={tint} pointerEvents="none" />
        </svg>

        {selected && (
          <div
            className="absolute inset-0 bg-black/30 flex items-center justify-center p-6 z-20"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-5 space-y-3 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl">{selected.themeEmoji}</div>
              <h3 className="text-kid-md font-bold text-bark">{selected.label}</h3>
              {selected.subLabel && <div className="text-xs opacity-70">{selected.subLabel}</div>}

              {!structureStates[selected.code]?.unlocked && (
                <>
                  <div className="bg-white/60 rounded-xl p-3 text-sm text-bark/80">
                    Not yet — keep practicing:
                    <div className="mt-1 font-semibold text-bark">{structureStates[selected.code]?.prereqDisplay}</div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full bg-ochre/40 border-2 border-ochre rounded-full py-3 text-kid-sm"
                    style={{ touchAction: 'manipulation', minHeight: 48 }}
                  >
                    OK
                  </button>
                </>
              )}

              {structureStates[selected.code]?.unlocked && selected.kind === 'skill' && selected.skillCode && (
                <button
                  onClick={() => startSkill(selected.skillCode!)}
                  disabled={starting}
                  className="w-full bg-forest text-white rounded-full py-4 text-kid-md disabled:opacity-50"
                  style={{ touchAction: 'manipulation', minHeight: 60 }}
                >
                  {starting ? 'Starting…' : '🔍 Start exploration'}
                </button>
              )}

              {structureStates[selected.code]?.unlocked && selected.kind === 'habitat' && (
                <>
                  <div className="bg-white/60 rounded-xl p-3 text-sm text-bark/80">
                    You&apos;ve built this habitat. Creatures that like it may arrive when you visit next.
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full bg-sage text-white rounded-full py-3 text-kid-sm"
                    style={{ touchAction: 'manipulation', minHeight: 48 }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

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

function Structure({
  struct, unlocked, onTap,
}: {
  struct: MapStructure;
  unlocked: boolean;
  onTap: () => void;
}) {
  return (
    <motion.g
      whileHover={unlocked ? { scale: 1.08 } : { scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      style={{ cursor: 'pointer', transformOrigin: `${struct.x}px ${struct.y}px` }}
      role="button"
      aria-label={`${struct.label}${unlocked ? '' : ' (locked)'}`}
      tabIndex={0}
    >
      {unlocked && (
        <motion.circle
          cx={struct.x}
          cy={struct.y}
          r={struct.size * 0.85}
          fill="#FFE89A"
          opacity={0.3}
          animate={{ opacity: [0.18, 0.4, 0.18] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <g
        style={{
          filter: unlocked ? undefined : 'grayscale(1) brightness(0.85)',
          opacity: unlocked ? 1 : 0.6,
        }}
      >
        <StructureIllustration code={struct.code} x={struct.x} y={struct.y} size={struct.size} />
      </g>
      <g>
        <rect
          x={struct.x - 52}
          y={struct.y + struct.size * 0.48}
          width={104}
          height={22}
          rx={11}
          fill={unlocked ? '#FFFFFF' : '#E5E5E5'}
          stroke={unlocked ? '#E8A87C' : '#AAAAAA'}
          strokeWidth={2}
          opacity={0.95}
        />
        <text
          x={struct.x}
          y={struct.y + struct.size * 0.48 + 15}
          fontSize={12}
          textAnchor="middle"
          fill={unlocked ? '#6B4423' : '#666666'}
          fontWeight="700"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {struct.label}
        </text>
      </g>
    </motion.g>
  );
}
