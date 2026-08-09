// app/(child)/garden/tunnels/TunnelsScene.tsx
//
// The Tunnels: a cutaway of the ground under the garden.
//
// Drawn as a cross-section, the way a museum draws one — grass and
// daylight along the top, then topsoil, then subsoil, then the pale
// clay and limestone that is actually under Kentucky. Every burrow is
// dug to its real depth relative to the others, so the picture is a
// diagram as well as a place: the mole's runs scratch along just under
// the grass, the groundhog goes deepest of all, and the cottontail's
// form is barely below the surface at all, which is the whole lesson.
//
// Roots come down from the plants above and thread between the tunnels,
// because that is what is really down there and because it ties the
// underground to the garden she already knows.
//
// An animal is a gray silhouette until she has read its story and
// answered the questions. Then it is drawn in colour and it stays. The
// empty holes are the point of the screen — the same reasoning as the
// ghost outlines in the display case: you can see what is missing.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BURROW_ANIMALS, type BurrowAnimal } from '@/lib/world/burrowTunnels';
import BurrowLesson from './BurrowLesson';

const W = 1000;
const H = 400;

/** Where the daylight stops and the soil starts. */
const GROUND_Y = 96;

export default function TunnelsScene({
  learnerId, placed: initialPlaced,
}: {
  learnerId: string;
  placed: string[];
}) {
  const [placed, setPlaced] = useState<string[]>(initialPlaced);
  const [open, setOpen] = useState<BurrowAnimal | null>(null);

  const done = placed.length;

  return (
    <div className="min-h-screen" style={{ background: '#0E0B08' }}>
      <div className="max-w-4xl mx-auto p-3 pb-10">

        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#F0DFAE' }}>
              The Tunnels
            </h1>
            <p className="text-xs" style={{ color: '#9A8C76' }}>
              Under your garden. Tap a burrow to find out who dug it.
            </p>
          </div>
          <Link
            href={`/garden/habitat/bunny_burrow?learner=${learnerId}`}
            className="text-sm rounded-xl px-3 shrink-0"
            style={{ background: '#3A322A', color: '#E4D3A8', minHeight: 44,
                     display: 'inline-flex', alignItems: 'center' }}
          >
            ← burrow
          </Link>
        </div>

        <div className="rounded-xl px-3 py-1.5 mb-2 flex items-center gap-3"
             style={{ background: '#241E18', border: '1px solid #574838' }}>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#141010' }}>
            <div className="h-full rounded-full transition-all"
                 style={{ width: `${(done / BURROW_ANIMALS.length) * 100}%`,
                          background: 'linear-gradient(90deg,#8A6534,#D9B06A)' }} />
          </div>
          <span className="text-xs font-bold" style={{ color: '#D9B06A' }}>
            {done} of {BURROW_ANIMALS.length} moved in
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #5C4A38' }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BFE0F2" />
                <stop offset="100%" stopColor="#E8F2DC" />
              </linearGradient>
              <linearGradient id="topsoil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5E4327" />
                <stop offset="100%" stopColor="#4A3520" />
              </linearGradient>
              <linearGradient id="subsoil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7A5A34" />
                <stop offset="100%" stopColor="#8E6B3E" />
              </linearGradient>
            </defs>

            {/* daylight */}
            <rect x={0} y={0} width={W} height={GROUND_Y} fill="url(#sky)" />
            <circle cx={880} cy={34} r={20} fill="#FCE9A0" opacity={0.9} />

            {/* the ground, in its real layers */}
            <rect x={0} y={GROUND_Y} width={W} height={64} fill="url(#topsoil)" />
            <rect x={0} y={GROUND_Y + 64} width={W} height={172} fill="url(#subsoil)" />
            {/* limestone — Kentucky's actual basement, and where her caves
                come from. Drawn as courses of bedded rock rather than
                floating bars: continuous bands with staggered joints. */}
            <rect x={0} y={GROUND_Y + 236} width={W} height={H} fill="#B5A487" />
            {[0, 1, 2].map(row => (
              <g key={row}>
                <rect x={0} y={GROUND_Y + 240 + row * 22} width={W} height={18}
                      fill="#C4B599" opacity={0.9} />
                {[0, 1, 2, 3, 4].map(i => (
                  <rect key={i} x={i * 205 + (row % 2 ? 100 : 0)} y={GROUND_Y + 240 + row * 22}
                        width={3} height={18} fill="#A99172" opacity={0.8} />
                ))}
              </g>
            ))}

            {/* grass line */}
            <rect x={0} y={GROUND_Y - 8} width={W} height={12} fill="#6FA24E" />
            {Array.from({ length: 90 }, (_, i) => (
              <path key={i} d={`M ${i * 11 + 4} ${GROUND_Y - 6} q 2 -9 5 -12`}
                    stroke="#7FB35A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
            ))}

            {/* roots reaching down between the burrows */}
            {[90, 300, 520, 700, 905].map((rx, i) => (
              <g key={rx} stroke="#4A3520" fill="none" strokeLinecap="round" opacity={0.55}>
                <path d={`M ${rx} ${GROUND_Y} q ${i % 2 ? 18 : -18} 70 ${i % 2 ? 6 : -6} 150`} strokeWidth={3} />
                <path d={`M ${rx} ${GROUND_Y + 60} q ${i % 2 ? -26 : 26} 30 ${i % 2 ? -34 : 34} 70`} strokeWidth={2} />
                <path d={`M ${rx} ${GROUND_Y + 110} q ${i % 2 ? 20 : -20} 26 ${i % 2 ? 26 : -26} 56`} strokeWidth={1.4} />
              </g>
            ))}

            {/* a few earthworms, because the mole is hunting them */}
            {[[210, 150], [470, 205], [740, 175]].map(([wx, wy], i) => (
              <path key={i} d={`M ${wx} ${wy} q 8 -6 15 0 q 7 6 14 0`}
                    stroke="#C98B94" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.8} />
            ))}

            {BURROW_ANIMALS.map(a => (
              <Burrow
                key={a.code}
                animal={a}
                groundY={GROUND_Y}
                placed={placed.includes(a.code)}
                onOpen={() => setOpen(a)}
              />
            ))}
          </svg>
        </div>

        <p className="text-[11px] text-center mt-3 px-4" style={{ color: '#8C7F6B' }}>
          Look at how deep each one goes. That is not decoration — the
          groundhog really does dig below the frost, and the rabbit
          really does barely go under at all.
        </p>
      </div>

      <AnimatePresence>
        {open && (
          <BurrowLesson
            animal={open}
            learnerId={learnerId}
            alreadyPlaced={placed.includes(open.code)}
            onClose={() => setOpen(null)}
            onPlaced={code => setPlaced(p => (p.includes(code) ? p : [...p, code]))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── one animal's home, dug to its real depth ────────────────────── */

function Burrow({
  animal, groundY, placed, onOpen,
}: {
  animal: BurrowAnimal;
  groundY: number;
  placed: boolean;
  onOpen: () => void;
}) {
  const x = animal.x;
  const chamberY = groundY + animal.depth;

  return (
    <g style={{ cursor: 'pointer' }} onClick={onOpen} role="button"
       aria-label={`${animal.name} — ${placed ? 'moved in' : 'tap to read'}`}>
      {/* generous invisible hit area, because small fingers */}
      <rect x={x - 78} y={groundY - 20} width={156} height={animal.depth + 80}
            fill="transparent" />

      <BurrowShape animal={animal} groundY={groundY} chamberY={chamberY} />

      {/* the resident, gray until she has earned them */}
      <g transform={`translate(${x}, ${chamberY})`} opacity={placed ? 1 : 0.28}>
        <text textAnchor="middle" y={9} fontSize={30}
              style={{ filter: placed ? 'none' : 'grayscale(1)' }} aria-hidden>
          {animal.emoji}
        </text>
      </g>

      {/* name plate */}
      <g transform={`translate(${x}, ${chamberY + 30})`}>
        <rect x={-62} y={0} width={124} height={17} rx={8.5}
              fill={placed ? '#FFFAF2' : 'rgba(255,250,242,0.22)'}
              stroke={placed ? '#D9B06A' : 'rgba(217,176,106,0.45)'} strokeWidth={1.1} />
        <text x={0} y={12.5} textAnchor="middle" fontSize={10} fontWeight={700}
              fill={placed ? '#5A4520' : '#D9C9A8'} style={{ userSelect: 'none' }}>
          {placed ? animal.name : 'who lives here?'}
        </text>
      </g>

      {!placed && (
        <motion.circle
          cx={x} cy={chamberY} r={30} fill="none"
          stroke="#D9B06A" strokeWidth={1.6}
          animate={{ opacity: [0.15, 0.55, 0.15], r: [26, 34, 26] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </g>
  );
}

/**
 * Each home drawn the way that animal actually builds it. The shapes
 * are the lesson — a child should be able to tell these apart before
 * she has read a word.
 */
function BurrowShape({
  animal, groundY, chamberY,
}: {
  animal: BurrowAnimal; groundY: number; chamberY: number;
}) {
  const x = animal.x;
  const AIR = '#2A1D10';
  const wall = { stroke: '#33240F', strokeWidth: 2, fill: AIR };

  switch (animal.code) {
    case 'eastern_mole':
      // Shallow hunting runs that lift the turf, plus a deep round nest.
      return (
        <g>
          <path d={`M ${x - 130} ${groundY + 14} q 40 -10 80 2 q 45 14 95 -4 q 40 -12 78 4`}
                stroke="#3B2A14" strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d={`M ${x - 130} ${groundY + 14} q 40 -10 80 2 q 45 14 95 -4 q 40 -12 78 4`}
                stroke={AIR} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* the shaft runs from the surface run down INTO the nest */}
          <path d={`M ${x} ${groundY + 16} C ${x + 14} ${groundY + 60}, ${x - 10} ${chamberY - 50}, ${x} ${chamberY}`}
                stroke={AIR} strokeWidth={9} fill="none" strokeLinecap="round" />
          <ellipse cx={x} cy={chamberY} rx={34} ry={24} {...wall} />
          <ellipse cx={x} cy={chamberY + 9} rx={26} ry={9} fill="#8A7A44" opacity={0.75} />
        </g>
      );

    case 'groundhog':
      // Main door with a spoil heap, a hidden bolt-hole with none, a
      // bedroom, a nursery and the separate toilet chamber.
      return (
        <g>
          {/* main door, with its heap of spoil */}
          <ellipse cx={x - 62} cy={groundY - 8} rx={30} ry={9} fill="#6B4E2C" />
          <path d={`M ${x - 62} ${groundY} C ${x - 62} ${groundY + 70}, ${x - 30} ${chamberY - 40}, ${x} ${chamberY}`}
                stroke={AIR} strokeWidth={16} fill="none" strokeLinecap="round" />
          {/* the hidden bolt-hole: no heap, because it was pushed out
              from below. That absence is the whole answer to Q1. */}
          <path d={`M ${x + 78} ${groundY} C ${x + 78} ${groundY + 70}, ${x + 40} ${chamberY - 30}, ${x} ${chamberY}`}
                stroke={AIR} strokeWidth={13} fill="none" strokeLinecap="round" />
          <ellipse cx={x} cy={chamberY} rx={44} ry={28} {...wall} />
          <ellipse cx={x} cy={chamberY + 10} rx={34} ry={10} fill="#8A7A44" opacity={0.8} />
          {/* nursery, joined to the bedroom */}
          <path d={`M ${x - 30} ${chamberY - 10} L ${x - 60} ${chamberY - 26}`}
                stroke={AIR} strokeWidth={9} strokeLinecap="round" />
          <ellipse cx={x - 76} cy={chamberY - 30} rx={22} ry={15} {...wall} />
          {/* and the toilet, on its own short spur well away from bed */}
          <path d={`M ${x + 32} ${chamberY + 8} L ${x + 62} ${chamberY + 18}`}
                stroke={AIR} strokeWidth={8} strokeLinecap="round" />
          <ellipse cx={x + 80} cy={chamberY + 20} rx={17} ry={12} {...wall} />
          <text x={x + 80} y={chamberY + 24} textAnchor="middle" fontSize={11} aria-hidden>💩</text>
        </g>
      );

    case 'red_fox_den':
      // An old groundhog hole, widened, with more than one way out.
      return (
        <g>
          {/* two ways out, both running right into the chamber, because
              nothing should be able to trap the cubs inside */}
          <path d={`M ${x - 72} ${groundY} C ${x - 72} ${groundY + 60}, ${x - 34} ${chamberY - 34}, ${x} ${chamberY}`}
                stroke={AIR} strokeWidth={20} fill="none" strokeLinecap="round" />
          <path d={`M ${x + 80} ${groundY} C ${x + 80} ${groundY + 56}, ${x + 40} ${chamberY - 28}, ${x} ${chamberY}`}
                stroke={AIR} strokeWidth={16} fill="none" strokeLinecap="round" />
          <ellipse cx={x} cy={chamberY} rx={46} ry={27} {...wall} />
          {/* bones and feathers at the door — the giveaway */}
          <g stroke="#E8DCC0" strokeWidth={2.4} strokeLinecap="round">
            <path d={`M ${x - 92} ${groundY - 6} l 12 -4`} />
            <path d={`M ${x - 76} ${groundY - 3} l 10 3`} />
          </g>
          <path d={`M ${x - 60} ${groundY - 10} q 8 -8 16 -3`}
                stroke="#D8CBB0" strokeWidth={1.6} fill="none" />
        </g>
      );

    case 'chipmunk_larder':
      // Hidden doorway under a stone, a long run, and the larder.
      return (
        <g>
          <ellipse cx={x - 66} cy={groundY - 9} rx={22} ry={10} fill="#9C9384" stroke="#6E675B" strokeWidth={1.4} />
          {/* long run from the hidden door under the stone, into the larder */}
          <path d={`M ${x - 62} ${groundY + 2} C ${x - 62} ${groundY + 56}, ${x - 30} ${chamberY - 30}, ${x} ${chamberY}`}
                stroke={AIR} strokeWidth={11} fill="none" strokeLinecap="round" />
          <ellipse cx={x} cy={chamberY} rx={38} ry={24} {...wall} />
          {/* the larder: stacked seed, which is the reason for all of it */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <ellipse key={i} cx={x - 20 + (i % 4) * 13} cy={chamberY + 10 - Math.floor(i / 4) * 9}
                     rx={5} ry={5.6} fill="#C99A6E" stroke="#8A5E30" strokeWidth={0.8} />
          ))}
        </g>
      );

    case 'cottontail_form':
      // Barely underground at all. That IS the diagram.
      return (
        <g>
          <ellipse cx={x} cy={chamberY} rx={40} ry={16} fill={AIR} stroke="#33240F" strokeWidth={2} />
          <ellipse cx={x} cy={chamberY + 4} rx={32} ry={9} fill="#9A8A52" opacity={0.85} />
          {/* grass leaning over the top — the whole defence is not being seen */}
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M ${x - 42 + i * 7} ${groundY - 4} q ${i % 2 ? 6 : -6} 14 ${i % 2 ? 2 : -2} 26`}
                  stroke="#7FB35A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          ))}
        </g>
      );

    default:
      return null;
  }
}
