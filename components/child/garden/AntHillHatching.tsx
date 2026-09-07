// components/child/garden/AntHillHatching.tsx
//
// "A picture of what it is gonna look like" — commissioned by Cecily
// (letter 2026-09-07-1) for the reading room wall, after she asked
// for more in the ant hill on her sister's behalf and got it.
//
// It is a CUTAWAY, because that is the honest way to draw a nest: you
// cannot see any of this from above, and the whole wonder of an ant
// hill is that the mound is the least of it. Everything here is true
// of Kentucky's ants — the four life stages in their real order, the
// queen deep and alone, nurses carrying brood, a nursery kept warm
// near the top, and workers hauling a leaf down the shaft.
//
// Drawn to be READ at the size of a picture on a wall: big shapes,
// few colors, and the eggs unmistakably eggs.

import React from 'react';

export default function AntHillHatching({ width = 640 }: { width?: number }) {
  // One ant, side view, pointing right; scale and rotate at the call
  // site. Three body segments, six legs, two antennae — because a
  // child who has met these ants in the garden will count them.
  const Ant = ({ tint = '#6E4A2E', size = 1 }: { tint?: string; size?: number }) => (
    <g transform={`scale(${size})`}>
      <ellipse cx={-7} cy={0} rx={5} ry={4} fill={tint} />
      <ellipse cx={0} cy={0} rx={3.4} ry={3} fill={tint} />
      <circle cx={5.6} cy={-0.4} r={3.4} fill={tint} />
      <path d="M -3 -2.6 l -3 -4 M 0 -3 l 0.6 -4.4 M 3 -2.6 l 3.4 -3.8"
            stroke={tint} strokeWidth={1.1} strokeLinecap="round" />
      <path d="M -9 2.6 l -3.4 4 M -6 3 l -1 4.6 M -3 2.6 l 2 4.4"
            stroke={tint} strokeWidth={1.1} strokeLinecap="round" />
      <path d="M 7.6 -3 q 3.4 -3 5.6 -1.6 M 8 -1.6 q 4 -1.4 5.4 0.8"
            stroke={tint} strokeWidth={1} fill="none" strokeLinecap="round" />
      <circle cx={7} cy={-1.2} r={0.9} fill="#2A2014" />
    </g>
  );

  const Egg = ({ x, y }: { x: number; y: number }) => (
    <ellipse cx={x} cy={y} rx={4.2} ry={3} fill="#FFF6E2" stroke="#E0CFA8" strokeWidth={1} />
  );

  // A larva: a fat curled C — a grub with a blind head end, not a
  // bread roll. Segment ridges run ACROSS the curl, which is what
  // makes it read as a living thing.
  const Larva = ({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) => (
    <g transform={`translate(${x}, ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M 7 -6 q -11 -3 -13 5 q -2 9 7 11 q 6 1.4 8 -2
               q -5 1 -7 -2.6 q -3 -6 5 -11.4 Z"
            fill="#F4E3C4" stroke="#CBB088" strokeWidth={1.1} strokeLinejoin="round" />
      <path d="M -4.6 -1 q 4 1 6.4 -1.4 M -5.4 3 q 4.6 1.4 7.6 -1
               M -3.6 7 q 4.4 1.6 7.4 -0.6"
            stroke="#D9C39A" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* the head end: blind, and turned in toward its own belly */}
      <circle cx={6.4} cy={-5} r={2.6} fill="#EBD6B0" stroke="#CBB088" strokeWidth={0.9} />
    </g>
  );

  // A pupa: the ant showing THROUGH a papery case. The ant has to be
  // legible or the picture loses its middle step.
  const Pupa = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={0} rx={9.5} ry={6.4} fill="#F6E7C8"
               stroke="#C9A97C" strokeWidth={1.3} />
      <g opacity={0.85}><Ant tint="#A07C52" size={0.72} /></g>
      {/* the case's seam, so it reads as a wrapping */}
      <path d="M -8 -2.6 q 8 -3.4 16 0" stroke="#DCC69E" strokeWidth={1} fill="none" />
    </g>
  );

  return (
    <svg viewBox="0 0 640 512" style={{ width: '100%', maxWidth: width, display: 'block' }}
         role="img" aria-label="A cutaway of the ant hill: eggs, larvae, pupae, and a new ant hatching">
      {/* sky and sun over the mound */}
      <rect x={0} y={0} width={640} height={120} fill="#CBDDE8" />
      <circle cx={556} cy={44} r={22} fill="#F5D98F" />
      <path d="M 0 108 q 60 -10 120 -2 q 40 6 70 2" stroke="#A8C08A" strokeWidth={3} fill="none" />

      {/* the mound — the least of it, which is the point */}
      <path d="M 180 118 q 60 -46 120 0 Z" fill="#A98156" />
      <path d="M 200 116 q 40 -30 80 0 Z" fill="#BE9364" />
      <ellipse cx={240} cy={94} rx={9} ry={4} fill="#6E4A2E" />
      <path d="M 0 118 h 640" stroke="#8E6C46" strokeWidth={4} />

      {/* the soil, cut open */}
      <rect x={0} y={118} width={640} height={394} fill="#8E6C46" />
      <g opacity={0.35}>
        <path d="M 40 160 q 30 14 62 6 M 470 150 q 40 16 90 6 M 90 300 q 40 12 76 2
                 M 430 330 q 50 10 100 0 M 250 410 q 60 12 120 0"
              stroke="#6E5236" strokeWidth={3} fill="none" />
        <circle cx={92} cy={210} r={4} fill="#6E5236" />
        <circle cx={560} cy={250} r={5} fill="#6E5236" />
        <circle cx={330} cy={186} r={3.4} fill="#6E5236" />
        <circle cx={150} cy={392} r={4.4} fill="#6E5236" />
      </g>

      {/* a root coming down past the chambers */}
      <path d="M 596 118 q -16 60 -6 120 q 10 60 -14 100 q -12 50 6 100"
            stroke="#7A5A34" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 590 210 q -30 12 -44 40 M 578 330 q 26 12 40 40"
            stroke="#7A5A34" strokeWidth={4} fill="none" strokeLinecap="round" />

      {/* THE SHAFT and the chambers, carved out of the soil */}
      <g fill="#3E2C1B">
        {/* main shaft from the mound door */}
        <path d="M 232 112 q -10 40 4 70 q 12 26 2 54 q -10 30 4 60 q 14 30 2 62
                 q -8 26 6 48 l 26 0 q -12 -22 -4 -46 q 12 -34 -2 -64 q -12 -28 -2 -56
                 q 12 -32 0 -60 q -10 -24 2 -68 Z" />
        {/* branches to each room */}
        <path d="M 250 196 q 60 -18 118 -6 l 0 20 q -60 -12 -118 6 Z" />
        <path d="M 244 282 q -60 -12 -108 4 l 0 -20 q 50 -16 108 -4 Z" />
        <path d="M 254 350 q 70 10 132 -6 l 2 20 q -66 16 -134 6 Z" />
        <path d="M 250 424 q -30 4 -58 -4 l 2 -20 q 26 8 54 4 Z" />
      </g>

      {/* ── THE NURSERY: eggs, warm and near the top ─────────────── */}
      <ellipse cx={430} cy={196} rx={78} ry={44} fill="#3E2C1B" />
      <ellipse cx={430} cy={200} rx={70} ry={36} fill="#4A3624" />
      <Egg x={402} y={188} /><Egg x={418} y={196} /><Egg x={434} y={186} />
      <Egg x={448} y={198} /><Egg x={410} y={206} /><Egg x={430} y={212} />
      <Egg x={452} y={180} /><Egg x={466} y={192} /><Egg x={444} y={210} />
      <g transform="translate(384, 214) rotate(-12)"><Ant size={1.15} /></g>
      <text x={430} y={158} textAnchor="middle" fontSize={15} fontWeight={700}
            fill="#F2E9D8" fontFamily="Georgia, serif">the eggs</text>

      {/* ── LARVAE: fed and growing, smallest to biggest ─────────── */}
      <ellipse cx={116} cy={272} rx={74} ry={42} fill="#3E2C1B" />
      <ellipse cx={116} cy={276} rx={66} ry={34} fill="#4A3624" />
      <Larva x={82} y={266} s={0.9} rot={-14} />
      <Larva x={116} y={260} s={1.1} rot={8} />
      <Larva x={100} y={288} s={1.3} rot={-4} />
      <Larva x={146} y={284} s={1.5} rot={16} />
      <g transform="translate(170, 260) rotate(160) scale(-1,1)"><Ant size={1.15} /></g>
      <text x={116} y={232} textAnchor="middle" fontSize={15} fontWeight={700}
            fill="#F2E9D8" fontFamily="Georgia, serif">the larvae</text>

      {/* ── PUPAE: the waiting room ──────────────────────────────── */}
      <ellipse cx={448} cy={362} rx={80} ry={44} fill="#3E2C1B" />
      <ellipse cx={448} cy={366} rx={72} ry={36} fill="#4A3624" />
      <Pupa x={416} y={354} rot={-10} /><Pupa x={450} y={346} rot={6} />
      <Pupa x={480} y={360} rot={-4} /><Pupa x={430} y={378} rot={12} />
      <Pupa x={466} y={382} rot={-8} />
      {/* THE HATCHING — the picture she actually asked for: a brand
          new ant climbing out of its case, still pale */}
      <g transform="translate(508, 344)">
        <ellipse cx={-6} cy={6} rx={8} ry={5} fill="#EFD9B4" stroke="#D3B98C" strokeWidth={1.2} />
        <path d="M -13 2 q 6 -5 13 -1" stroke="#C9A97C" strokeWidth={1.4} fill="none" />
        <g transform="translate(6, -2) rotate(-24)"><Ant tint="#C79A6A" size={1.05} /></g>
        {/* a small shine, because this is the moment of the picture */}
        <path d="M 20 -16 l 3 -7 M 27 -10 l 7 -4 M 14 -20 l 0 -7"
              stroke="#F5D98F" strokeWidth={2} strokeLinecap="round" />
      </g>
      <text x={448} y={324} textAnchor="middle" fontSize={15} fontWeight={700}
            fill="#F2E9D8" fontFamily="Georgia, serif">hatching</text>

      {/* ── THE QUEEN: deepest, biggest, alone. Drawn HER OWN way
             rather than as a scaled worker — a queen's gaster is
             enormous because it is full of eggs, and that is the
             whole story of her. ─────────────────────────────────── */}
      <ellipse cx={150} cy={424} rx={104} ry={44} fill="#3E2C1B" />
      <ellipse cx={150} cy={426} rx={95} ry={36} fill="#4A3624" />
      <g transform="translate(120, 424)">
        {/* gaster — the egg factory, banded */}
        <ellipse cx={-26} cy={2} rx={26} ry={17} fill="#6B4526" />
        <path d="M -40 -6 q 6 8 0 16 M -30 -10 q 7 10 0 20 M -19 -11 q 7 10 0 21"
              stroke="#8A5C34" strokeWidth={2} fill="none" opacity={0.9} />
        {/* waist, thorax, head */}
        <circle cx={-2} cy={2} r={4.4} fill="#5A3A22" />
        <ellipse cx={10} cy={0} rx={11} ry={8.4} fill="#5A3A22" />
        <circle cx={26} cy={-2} r={9} fill="#5A3A22" />
        <circle cx={29.5} cy={-4} r={2.1} fill="#2A2014" />
        <circle cx={30.4} cy={-4.8} r={0.7} fill="#FFF" />
        {/* jaws and antennae */}
        <path d="M 34 1 l 6 2 M 34 -1 l 6 -1" stroke="#3E2A18"
              strokeWidth={2} strokeLinecap="round" />
        <path d="M 31 -9 q 8 -8 15 -5 M 33 -7 q 9 -4 13 1"
              stroke="#5A3A22" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* legs, tucked — she does not walk much any more */}
        <path d="M 4 8 l -3 9 M 12 9 l 2 9 M 20 7 l 7 9
                 M 4 -8 l -4 -8 M 13 -8 l 1 -9"
              stroke="#5A3A22" strokeWidth={2.2} strokeLinecap="round" />
        {/* WING SCARS — she flew once, then tore her wings off and
            never left this room again. The best fact in the picture. */}
        <path d="M 8 -9 q 14 -13 26 -11 M 12 -11 q 11 -9 20 -9"
              stroke="#C8A87E" strokeWidth={2} fill="none" opacity={0.95} />
      </g>
      {/* the eggs she is laying, in a little pile beside her */}
      <Egg x={196} y={432} /><Egg x={208} y={424} /><Egg x={206} y={438} />
      <Egg x={219} y={432} />
      <text x={150} y={386} textAnchor="middle" fontSize={15} fontWeight={700}
            fill="#F2E9D8" fontFamily="Georgia, serif">the queen</text>

      {/* workers on the road. The leaf-carrier walks a HORIZONTAL
          branch, because a leaf held sideways on a vertical shaft
          read as a green blob floating next to an ant. */}
      <g transform="translate(238, 150) rotate(74)"><Ant size={1.05} /></g>
      <g transform="translate(244, 250) rotate(96) scale(-1,1)"><Ant size={1.05} /></g>
      <g transform="translate(240, 336) rotate(84)"><Ant size={1.05} /></g>
      <g transform="translate(300, 356)">
        <Ant size={1.15} />
        {/* the cut leaf, held UP over the head like a parasol */}
        <path d="M 4 -10 q 16 -16 30 -6 q 10 8 -4 15 q -16 7 -26 -9 Z"
              fill="#7FAE62" stroke="#4E7038" strokeWidth={1.2} />
        <path d="M 8 -8 q 12 -3 20 3" stroke="#4E7038" strokeWidth={1} fill="none" />
      </g>
      <g transform="translate(248, 410) rotate(92) scale(-1,1)"><Ant size={1.05} /></g>

      {/* the title, painted along the bottom like a plate in a book —
          on its own band BELOW everything, after the first render put
          it straight through the queen's chamber */}
      <rect x={0} y={482} width={640} height={30} fill="rgba(20,14,8,0.62)" />
      <text x={320} y={502} textAnchor="middle" fontSize={14} fontWeight={700}
            fill="#F2E9D8" fontFamily="Georgia, serif" letterSpacing="0.06em">
        INSIDE THE ANT HILL — egg, larva, pupa, ant
      </text>
    </svg>
  );
}
