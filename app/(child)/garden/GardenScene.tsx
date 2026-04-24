'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GARDEN_STRUCTURES, MAP_WIDTH, MAP_HEIGHT } from '@/lib/world/gardenMap';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import ArrivalCard from '@/components/child/garden/ArrivalCard';
import LunaWanderer from '@/components/child/garden/LunaWanderer';
import AmbientLayer from '@/components/child/garden/AmbientLayer';
import { StructureIllustration, Tree, PineTree, Flower, GrassTuft, CozyHouse } from '@/components/child/garden/illustrations';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

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
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [arrival, setArrival] = useState<SpeciesData | null>(pendingArrival);
  const [selected, setSelected] = useState<MapStructure | null>(null);
  const [starting, setStarting] = useState(false);
  const [tappedCode, setTappedCode] = useState<string | null>(null);

  const hour = typeof window !== 'undefined' ? new Date().getHours() : 12;
  // Softer tints — the garden stays bright and legible across all hours
  const tint =
    hour < 6 ? 'rgba(40, 50, 100, 0.25)' :
    hour < 9 ? 'rgba(255, 200, 140, 0.08)' :
    hour < 17 ? 'transparent' :
    hour < 20 ? 'rgba(255, 170, 110, 0.10)' :
    'rgba(20, 25, 60, 0.22)';

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
    // Trigger a petal burst on unlocked tap
    setTappedCode(s.code);
    window.setTimeout(() => setTappedCode(null), 700);
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
        <h1 className="font-display text-[26px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span className="italic">my</span> garden
        </h1>
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
            <radialGradient id="readingZone" cx="18%" cy="30%" r="48%">
              <stop offset="0%" stopColor="#F3E0C0" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mathZone" cx="85%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#F9D9AE" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bunnyZone" cx="14%" cy="80%" r="34%">
              <stop offset="0%" stopColor="#D6C4BA" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="waterZone" cx="85%" cy="82%" r="40%">
              <stop offset="0%" stopColor="#B5DAE1" />
              <stop offset="100%" stopColor="#B8D4A8" stopOpacity="0" />
            </radialGradient>
            {/* Sky — a warm wash that fades into the meadow */}
            <linearGradient id="skyBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6DFFF" />
              <stop offset="35%" stopColor="#F6EAD4" />
              <stop offset="55%" stopColor="#E8E4BE" />
              <stop offset="100%" stopColor="#CEE3B4" stopOpacity="0" />
            </linearGradient>
            {/* Meadow — brighter, more golden */}
            <linearGradient id="meadowBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D7EFB9" />
              <stop offset="55%" stopColor="#AED29A" />
              <stop offset="100%" stopColor="#8EB98A" />
            </linearGradient>
            <pattern id="grassTexture" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="transparent" />
              <path d="M 4 36 Q 4 30 6 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
              <path d="M 20 38 Q 22 32 24 30" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.45" />
              <path d="M 32 36 Q 30 32 32 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
            </pattern>
            {/* Warm sunbeam gradient for light rays */}
            <linearGradient id="sunbeam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF5B0" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#FFE89A" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky wash (top third) */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT * 0.55} fill="url(#skyBase)" />
          {/* Meadow fills the rest, with the sky fading into it */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#meadowBase)" opacity="0.95" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grassTexture)" />

          {/* Distant layered hills (Totoro-style) — paint these BEFORE zones
              so zone washes sit atop them. */}
          <g opacity="0.75">
            {/* farthest hills (pale periwinkle) */}
            <path
              d={`M 0 ${MAP_HEIGHT * 0.38} Q 180 ${MAP_HEIGHT * 0.28} 360 ${MAP_HEIGHT * 0.34} T 720 ${MAP_HEIGHT * 0.3} T 1080 ${MAP_HEIGHT * 0.34} T ${MAP_WIDTH} ${MAP_HEIGHT * 0.32} L ${MAP_WIDTH} ${MAP_HEIGHT * 0.55} L 0 ${MAP_HEIGHT * 0.55} Z`}
              fill="#B8C4DB" opacity="0.55"
            />
            {/* middle hills (pale sage) */}
            <path
              d={`M 0 ${MAP_HEIGHT * 0.45} Q 220 ${MAP_HEIGHT * 0.37} 460 ${MAP_HEIGHT * 0.43} T 900 ${MAP_HEIGHT * 0.4} T ${MAP_WIDTH} ${MAP_HEIGHT * 0.44} L ${MAP_WIDTH} ${MAP_HEIGHT * 0.6} L 0 ${MAP_HEIGHT * 0.6} Z`}
              fill="#A3BEA2" opacity="0.7"
            />
            {/* near hills (deeper sage) */}
            <path
              d={`M 0 ${MAP_HEIGHT * 0.53} Q 300 ${MAP_HEIGHT * 0.46} 640 ${MAP_HEIGHT * 0.51} T ${MAP_WIDTH} ${MAP_HEIGHT * 0.48} L ${MAP_WIDTH} ${MAP_HEIGHT * 0.65} L 0 ${MAP_HEIGHT * 0.65} Z`}
              fill="#8AAF84" opacity="0.65"
            />
          </g>

          {/* Soft sun with glow — upper-right */}
          <circle cx={MAP_WIDTH * 0.78} cy={110} r={90} fill="url(#sunGlow)" opacity="0.75" />
          <circle cx={MAP_WIDTH * 0.78} cy={110} r={32} fill="#FFF2B5" opacity="0.9" />

          {/* Sunbeam rays from upper-right, angled down-left */}
          <g opacity="0.5" style={{ mixBlendMode: 'screen' }} pointerEvents="none">
            {[0, 1, 2, 3, 4].map(i => (
              <polygon
                key={i}
                points={`${MAP_WIDTH * 0.78 - 30},${80} ${MAP_WIDTH * 0.78 + 40},${80} ${MAP_WIDTH * 0.78 + 40 - i * 120 - 200},${MAP_HEIGHT} ${MAP_WIDTH * 0.78 - 30 - i * 120 - 240},${MAP_HEIGHT}`}
                fill="url(#sunbeam)"
                opacity={0.22 - i * 0.03}
              />
            ))}
          </g>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#readingZone)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#mathZone)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#bunnyZone)" />
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#waterZone)" />

          {/* Organic path system — softer edges, natural taper, with stepping
              stones breaking the uniform look. Three layers per path:
                1. soft outer shadow (wider, darker, low opacity) — anti-tube
                2. main path surface
                3. lighter inner ribbon + discrete stepping stones
              All paths connect at the meadow junction (~780, 540). */}
          {(() => {
            const mainD = `M 360 160 C 400 280, 420 370, 460 420 S 560 500, 680 515 S 880 515, 960 475 S 1120 380, 1160 300 S 1200 200, 1280 170`;
            const pondD = `M 780 515 C 880 555, 960 605, 1055 635`;
            const bunnyD = `M 580 510 C 500 560, 410 620, 330 665`;
            // House path — from home's front walk (100, 540) curving up-right
            // to meet the main path near Digraph Bridge at about (415, 320)
            const houseD = `M 100 540 C 180 470, 280 400, 415 320`;
            return (
              <g pointerEvents="none">
                {/* soft shadow under the path */}
                <path d={mainD}  stroke="#A99878" strokeWidth={50} fill="none" strokeLinecap="round" opacity={0.22} />
                <path d={pondD}  stroke="#A99878" strokeWidth={40} fill="none" strokeLinecap="round" opacity={0.22} />
                <path d={bunnyD} stroke="#A99878" strokeWidth={40} fill="none" strokeLinecap="round" opacity={0.22} />
                <path d={houseD} stroke="#A99878" strokeWidth={38} fill="none" strokeLinecap="round" opacity={0.22} />
                {/* main path */}
                <path d={mainD}  stroke="#EAD2A8" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.92} />
                <path d={pondD}  stroke="#EAD2A8" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.88} />
                <path d={bunnyD} stroke="#EAD2A8" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.88} />
                <path d={houseD} stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.88} />
                {/* inner highlight ribbon (organic worn center) */}
                <path d={mainD}  stroke="#F7E6C4" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.65} />
                <path d={pondD}  stroke="#F7E6C4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
                <path d={bunnyD} stroke="#F7E6C4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
                <path d={houseD} stroke="#F7E6C4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
                {/* stepping stones along the path — break up uniformity */}
                {[
                  { x: 400, y: 230 }, { x: 450, y: 380 }, { x: 560, y: 490 }, { x: 720, y: 520 },
                  { x: 900, y: 500 }, { x: 1060, y: 420 }, { x: 1180, y: 260 },
                  { x: 870, y: 585 }, { x: 980, y: 625 },
                  { x: 510, y: 550 }, { x: 420, y: 600 }, { x: 360, y: 640 },
                  { x: 180, y: 490 }, { x: 280, y: 410 }, { x: 360, y: 360 },
                ].map((s, i) => (
                  <g key={i}>
                    <ellipse cx={s.x + 1} cy={s.y + 2} rx={11} ry={6} fill="#000" opacity={0.2} />
                    <ellipse cx={s.x} cy={s.y} rx={11} ry={6} fill="#C9B489" stroke="#8A7050" strokeWidth={1.2} />
                    <ellipse cx={s.x - 2} cy={s.y - 1.5} rx={5} ry={2} fill="#E0CBA1" opacity={0.8} />
                  </g>
                ))}
              </g>
            );
          })()}

          {/* Torii gate — spans the main path at its Math Mound terminus,
              so the path literally runs through it. Worn vermilion with
              upturned kasagi ends. */}
          <g opacity={0.9} transform="translate(1220, 195)">
            {/* shadow */}
            <ellipse cx={0} cy={82} rx={52} ry={5} fill="#000" opacity={0.2} />
            {/* uprights — slightly splayed outward (Japanese style) */}
            <path d="M -40 0 L -34 82 L -26 82 L -32 0 Z" fill="#B8563A" stroke="#5A2818" strokeWidth={1.2} strokeLinejoin="round" />
            <path d="M  40 0 L  34 82 L  26 82 L  32 0 Z" fill="#B8563A" stroke="#5A2818" strokeWidth={1.2} strokeLinejoin="round" />
            {/* lower crossbar (nuki) */}
            <rect x={-46} y={-10} width={92} height={8} fill="#8A3F2B" stroke="#5A2818" strokeWidth={1.2} />
            {/* upper crossbar (kasagi) — upturned ends */}
            <path
              d="M -58 -30 Q -60 -40 -54 -40 L 54 -40 Q 60 -40 58 -30 L 46 -22 L -46 -22 Z"
              fill="#B8563A" stroke="#5A2818" strokeWidth={1.2} strokeLinejoin="round"
            />
            {/* top shimmer */}
            <rect x={-48} y={-38} width={96} height={2.5} fill="#F5C6B5" opacity={0.5} />
            {/* center tie */}
            <rect x={-4} y={-20} width={8} height={12} fill="#3F1E10" />
          </g>

          {/* Stone lantern (ishidoro) — just off to the side of the path,
              standing on a patch of moss. Sits below path curve. */}
          <g transform="translate(720, 555)">
            {/* base shadow */}
            <ellipse cx={0} cy={40} rx={18} ry={4} fill="#000" opacity={0.22} />
            {/* moss patch under the lantern (wider than the stone) */}
            <ellipse cx={-2} cy={40} rx={22} ry={5} fill="#7BA46F" opacity={0.75} />
            <ellipse cx={8}  cy={41} rx={6} ry={1.5} fill="#8FB67A" opacity={0.9} />
            {/* square base */}
            <rect x={-14} y={22} width={28} height={16} rx={2} fill="#A8A39A" stroke="#5F5B53" strokeWidth={1.4} />
            {/* post */}
            <rect x={-5} y={4} width={10} height={20} fill="#9B968D" stroke="#5F5B53" strokeWidth={1.2} />
            {/* middle platform */}
            <rect x={-11} y={-2} width={22} height={7} rx={1} fill="#B0ABA1" stroke="#5F5B53" strokeWidth={1.2} />
            {/* light chamber */}
            <rect x={-9} y={-18} width={18} height={18} rx={2} fill="#7F7A70" stroke="#5F5B53" strokeWidth={1.4} />
            {/* lantern window with warm glow */}
            <rect x={-5.5} y={-15} width={11} height={11} rx={1} fill="#FFD98A" />
            <rect x={-5.5} y={-15} width={11} height={11} rx={1} fill="none" stroke="#3F1E10" strokeWidth={0.8} />
            {/* roof (pagoda-like with slight upturn) */}
            <path
              d="M -15 -18 Q -17 -22 -14 -24 L 14 -24 Q 17 -22 15 -18 Z"
              fill="#6F6A60" stroke="#5F5B53" strokeWidth={1.2} strokeLinejoin="round"
            />
            <path
              d="M -14 -24 L -4 -32 L 4 -32 L 14 -24 Z"
              fill="#7F7A70" stroke="#5F5B53" strokeWidth={1.2} strokeLinejoin="round"
            />
            {/* finial */}
            <circle cx={0} cy={-34} r={2.5} fill="#6F6A60" stroke="#5F5B53" strokeWidth={1} />
            {/* tiny flicker on the glow */}
            {!reducedMotion && (
              <motion.rect
                x={-5.5} y={-15} width={11} height={11} rx={1} fill="#FFF5D0"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </g>

          {/* Bamboo cluster — hugs the torii on the left to create a
              coherent Japanese-garden corner */}
          <g transform="translate(1130, 110)">
            {[0, 8, 16, 24].map((dx, i) => (
              <g key={i}>
                <path
                  d={`M ${dx} 150 L ${dx + (i % 2 === 0 ? -3 : 2)} 0`}
                  stroke="#8CB27A" strokeWidth={5} strokeLinecap="round"
                />
                {/* node rings */}
                {[30, 60, 90, 120].map(ny => (
                  <line
                    key={ny}
                    x1={dx - 3} y1={ny}
                    x2={dx + 3} y2={ny}
                    stroke="#5C7E4F" strokeWidth={1.5}
                  />
                ))}
                {/* leaf at top */}
                <path d={`M ${dx} 5 Q ${dx + 12} -8 ${dx + 18} -16 Q ${dx + 8} -10 ${dx} 0`} fill="#7BA46F" stroke="#5C7E4F" strokeWidth={1} />
                <path d={`M ${dx} 20 Q ${dx - 12} 10 ${dx - 20} 8 Q ${dx - 8} 16 ${dx} 25`} fill="#8FB67A" stroke="#5C7E4F" strokeWidth={1} />
              </g>
            ))}
          </g>

          {/* pond (aligned with FrogPondHabitat at 1060,640) */}
          <g>
            <ellipse cx={1060} cy={640} rx={160} ry={86} fill="#8DB7C2" opacity={0.9} />
            <ellipse cx={1060} cy={640} rx={140} ry={70} fill="#A8CFD8" />
            {/* pond rim shadow where water meets grass */}
            <ellipse cx={1060} cy={722} rx={150} ry={10} fill="#5A8A80" opacity={0.25} />
            {/* slow shimmer highlights */}
            <motion.ellipse
              cx={1020} cy={625} rx={24} ry={6} fill="#FFFFFF"
              animate={reducedMotion ? undefined : { opacity: [0.2, 0.55, 0.2], scaleX: [1, 1.12, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '1020px 625px', opacity: 0.4 }}
            />
            <motion.ellipse
              cx={1110} cy={665} rx={16} ry={5} fill="#FFFFFF"
              animate={reducedMotion ? undefined : { opacity: [0.15, 0.45, 0.15], scaleX: [1, 1.18, 1] }}
              transition={{ duration: 6.5, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '1110px 665px', opacity: 0.3 }}
            />
            {/* concentric ripple, occasional */}
            {!reducedMotion && (
              <motion.ellipse
                cx={1055} cy={650} rx={18} ry={6} fill="none" stroke="#FFFFFF" strokeWidth={1}
                animate={{ rx: [10, 48], ry: [3, 14], opacity: [0.7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 3 }}
              />
            )}
            {/* Koi swimming slowly in the pond — 2 fish on organic paths */}
            {!reducedMotion && (
              <>
                <motion.g
                  animate={{ x: [0, 40, 0, -40, 0], y: [0, 8, 14, 6, 0] }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Koi x={990} y={625} color="#E8713C" />
                </motion.g>
                <motion.g
                  animate={{ x: [0, -30, -10, 20, 0], y: [0, -4, -10, -2, 0] }}
                  transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                >
                  <Koi x={1110} y={660} color="#F5E6C9" mirror />
                </motion.g>
              </>
            )}
            {reducedMotion && (
              <>
                <Koi x={990} y={625} color="#E8713C" />
                <Koi x={1110} y={660} color="#F5E6C9" mirror />
              </>
            )}
          </g>

          {/* COZY HOUSE — off to the left, anchoring the house-path entrance.
              Painted BEFORE the trees so foliage can overlap naturally. */}
          <CozyHouse x={100} y={460} size={140} />
          {/* Chimney smoke — 3 soft puffs drifting up from (146, 388) */}
          {!reducedMotion && (
            <g pointerEvents="none">
              {[0, 1, 2].map(i => (
                <motion.ellipse
                  key={i}
                  cx={146}
                  cy={388}
                  rx={8}
                  ry={6}
                  fill="#E8E0D3"
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 0.85, 0.6, 0],
                    y: [0, -20, -45, -75],
                    x: [0, 4, -3, 6],
                    scale: [0.6, 1.1, 1.6, 2.2],
                  }}
                  transition={{
                    duration: 6,
                    delay: i * 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </g>
          )}

          {/* trees NW (reading grove) */}
          <Sway x={80}   y={100} delay={0.0}><Tree x={80}  y={100} size={100} variant={1} /></Sway>
          <Sway x={170}  y={80}  delay={0.6}><PineTree x={170} y={80} size={90} /></Sway>
          <Sway x={50}   y={200} delay={1.2}><Tree x={50}  y={200} size={80} variant={2} /></Sway>
          <Sway x={200}  y={50}  delay={1.8}><Tree x={200} y={50} size={70} variant={3} /></Sway>
          {/* trees NE (math mound backdrop) — extended for 1440 */}
          <Sway x={1380} y={70}  delay={0.3}><PineTree x={1380} y={70} size={100} /></Sway>
          <Sway x={1320} y={130} delay={0.9}><Tree x={1320} y={130} size={90} variant={1} /></Sway>
          <Sway x={1410} y={170} delay={1.5}><Tree x={1410} y={170} size={70} variant={2} /></Sway>
          <Sway x={1250} y={80}  delay={2.4}><Tree x={1250} y={80}  size={72} variant={3} /></Sway>
          {/* SW corner tree (bunny glade) */}
          <Sway x={70}   y={680} delay={2.1}><Tree x={70}  y={680} size={90} variant={2} /></Sway>
          <Sway x={120}  y={620} delay={0.4}><Tree x={120} y={620} size={70} variant={3} /></Sway>
          {/* SE corner trees (water's edge) — extended for 1440 */}
          <Sway x={1390} y={560} delay={1.0}><PineTree x={1390} y={560} size={85} /></Sway>
          <Sway x={1370} y={660} delay={1.6}><Tree x={1370} y={660} size={78} variant={1} /></Sway>
          <Sway x={1310} y={720} delay={0.7}><Tree x={1310} y={720} size={64} variant={2} /></Sway>
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
          <Flower x={1200} y={480} size={11} color="#FFB7C5" />
          <Flower x={1280} y={520} size={10} color="#FFD166" />
          <Flower x={1340} y={480} size={10} color="#E6B0D0" />
          {/* grass tufts scattered */}
          <GrassTuft x={350} y={460} size={12} />
          <GrassTuft x={580} y={520} size={14} />
          <GrassTuft x={720} y={380} size={11} />
          <GrassTuft x={460} y={680} size={13} />
          <GrassTuft x={870} y={500} size={12} />

          {/* zone labels */}
          <text x="180" y="100" fontSize="14" fill="#6B4423" opacity="0.4" fontWeight="600" letterSpacing="3" fontStyle="italic">Reading Grove</text>
          <text x="1080" y="70" fontSize="14" fill="#6B4423" opacity="0.4" fontWeight="600" letterSpacing="3" fontStyle="italic">Math Mound</text>
          <text x="150" y="770" fontSize="14" fill="#6B4423" opacity="0.4" fontWeight="600" letterSpacing="3" fontStyle="italic">Bunny Glade</text>
          <text x="1060" y="770" fontSize="14" fill="#6B4423" opacity="0.4" fontWeight="600" letterSpacing="3" fontStyle="italic">Water&apos;s Edge</text>

          {/* Foreground grass silhouette — Miyazaki depth-frame along bottom */}
          <g opacity="0.5" pointerEvents="none">
            <path
              d={`M 0 ${MAP_HEIGHT} L 0 ${MAP_HEIGHT - 22} Q 80 ${MAP_HEIGHT - 34} 160 ${MAP_HEIGHT - 24} T 320 ${MAP_HEIGHT - 28} T 480 ${MAP_HEIGHT - 22} T 640 ${MAP_HEIGHT - 30} T 800 ${MAP_HEIGHT - 24} T 960 ${MAP_HEIGHT - 32} T 1120 ${MAP_HEIGHT - 24} T 1280 ${MAP_HEIGHT - 30} T ${MAP_WIDTH} ${MAP_HEIGHT - 22} L ${MAP_WIDTH} ${MAP_HEIGHT} Z`}
              fill="#6B8E5A"
            />
            {/* tall grass blades peeking up */}
            {[40, 130, 250, 380, 520, 680, 820, 970, 1130, 1270, 1400].map((gx, i) => (
              <path
                key={i}
                d={`M ${gx} ${MAP_HEIGHT - 20} Q ${gx + (i % 2 === 0 ? 3 : -3)} ${MAP_HEIGHT - 40} ${gx + (i % 2 === 0 ? 5 : -5)} ${MAP_HEIGHT - 58}`}
                stroke="#5C7E4F"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>

          <AmbientLayer reducedMotion={reducedMotion} />

          {GARDEN_STRUCTURES.map(s => {
            const state = structureStates[s.code] ?? { unlocked: false, prereqDisplay: '' };
            return (
              <Structure
                key={s.code}
                struct={s}
                unlocked={state.unlocked}
                onTap={() => onStructureTap(s)}
                reducedMotion={reducedMotion}
              />
            );
          })}

          {/* Petal burst on tap (unlocked) */}
          <AnimatePresence>
            {tappedCode && !reducedMotion && (() => {
              const s = GARDEN_STRUCTURES.find(g => g.code === tappedCode);
              if (!s) return null;
              return <PetalBurst key={tappedCode} x={s.x} y={s.y} />;
            })()}
          </AnimatePresence>

          <LunaWanderer mapWidth={MAP_WIDTH} mapHeight={MAP_HEIGHT} reducedMotion={reducedMotion} />

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
  struct, unlocked, onTap, reducedMotion = false,
}: {
  struct: MapStructure;
  unlocked: boolean;
  onTap: () => void;
  reducedMotion?: boolean;
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
      {unlocked && !reducedMotion && (
        <motion.circle
          cx={struct.x}
          cy={struct.y}
          r={struct.size * 0.85}
          fill="#FFE89A"
          opacity={0.3}
          animate={{ opacity: [0.18, 0.4, 0.18], r: [struct.size * 0.82, struct.size * 0.95, struct.size * 0.82] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {unlocked && reducedMotion && (
        <circle cx={struct.x} cy={struct.y} r={struct.size * 0.85} fill="#FFE89A" opacity={0.25} />
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

function Koi({ x, y, color, mirror = false }: { x: number; y: number; color: string; mirror?: boolean }) {
  // Simple overhead-view koi — teardrop body + split tail, with a single
  // dark spot. Blurred slightly to feel "under the water surface."
  return (
    <g transform={`translate(${x}, ${y}) ${mirror ? 'scale(-1, 1)' : ''}`} style={{ filter: 'blur(0.5px)', opacity: 0.88 }}>
      {/* body */}
      <ellipse cx={0} cy={0} rx={14} ry={6} fill={color} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.9} />
      {/* head lighter */}
      <ellipse cx={-6} cy={0} rx={4} ry={4} fill="#FFFFFF" opacity={0.5} />
      {/* dark spot */}
      <ellipse cx={2} cy={-1.5} rx={3} ry={2} fill="#2B1810" opacity={0.7} />
      {/* tail — split fin shape */}
      <path d="M 12 0 Q 18 -5 22 -3 Q 20 0 22 3 Q 18 5 12 0 Z" fill={color} opacity={0.85} />
      {/* side fin */}
      <path d="M -2 4 Q 0 8 4 7" stroke={color} strokeWidth={2} fill="none" opacity={0.7} strokeLinecap="round" />
    </g>
  );
}

function Sway({
  x, y, delay = 0, children,
}: {
  x: number;
  y: number;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.g
      style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'fill-box' as any }}
      animate={{ rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 6 + (delay % 1.2), delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.g>
  );
}

// 8 petals bursting outward, fading as they drift — a pedagogically neutral
// moment of delight ("the garden notices you"), not a reward.
function PetalBurst({ x, y }: { x: number; y: number }) {
  const petals = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const dx = Math.cos(angle) * 60;
    const dy = Math.sin(angle) * 60;
    const color = ['#FFB7C5', '#FFD166', '#E6B0D0', '#A675B0'][i % 4];
    return { dx, dy, color, i };
  });
  return (
    <g style={{ pointerEvents: 'none' }}>
      {petals.map(p => (
        <motion.ellipse
          key={p.i}
          cx={x}
          cy={y}
          rx={7}
          ry={4}
          fill={p.color}
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 1.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
      <motion.circle
        cx={x}
        cy={y}
        r={20}
        fill="none"
        stroke="#FFD166"
        strokeWidth={2}
        initial={{ r: 10, opacity: 0.8 }}
        animate={{ r: 70, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </g>
  );
}
