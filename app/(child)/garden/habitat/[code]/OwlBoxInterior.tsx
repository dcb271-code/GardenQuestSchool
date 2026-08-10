// app/(child)/garden/habitat/[code]/OwlBoxInterior.tsx
//
// The owl box — the Reading Forest's first habitat.
//
// Cecily spotted the hole before anyone else: every animal home in this
// world was in the garden, and the two on the mountain are the cave and
// her cavern. The Forest had nothing.
//
// You are UP AT THE BOX, at night, level with the hole. That is the
// whole idea — a screech-owl is the size of a soda can and lives in
// ordinary neighborhoods, and almost nobody ever sees one, so the
// screen puts her where a person cannot normally stand.
//
// Night, because both residents are nocturnal. Going to see them at
// noon would be a lie, and it also gives the Forest a scene that looks
// like nothing else in the app.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

const VB_W = 700;
const VB_H = 1100;

/** Fixed scatter, so the sky is the same sky every visit. */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return {
    x: (a - Math.floor(a)) * VB_W,
    y: (b - Math.floor(b)) * 620,
    r: 0.7 + (a - Math.floor(a)) * 1.4,
    o: 0.3 + (b - Math.floor(b)) * 0.55,
  };
});

export default function OwlBoxInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount,
}: {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);

  const startSkill = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
      });
      const d = await res.json();
      if (d.sessionId) router.push(`/lesson/${d.sessionId}`);
      else setStarting(false);
    } catch { setStarting(false); }
  };

  /**
   * WHERE EACH ANIMAL ACTUALLY IS, rather than a row of cut-outs.
   *
   * The old version dropped every species at one size, evenly spaced,
   * in a horizontal line hovering in front of the scenery. Nothing was
   * standing on anything, and a screech-owl came out the same size as a
   * flying squirrel because the size was a constant.
   *
   * So: named places in this tree, each with its own scale, and each
   * with a note about what the animal is doing there. `size` is in the
   * same units as everything else in the scene, so an animal drawn at
   * 96 next to a 168-wide nest box is legibly smaller than the box —
   * which is true, and which the uniform row could not express.
   */
  const PERCHES = [
    // on the big limb, close to us and side-on. The largest place,
    // because the owl is the largest resident.
    { x: 486, y: 668, size: 104, labelBelow: true },
    // clinging to the trunk under the box, a bit further round
    { x: 262, y: 604, size: 84, labelBelow: true },
    // on the lower fork, further off and so drawn smaller. It used to
    // sit in open sky with nothing under it, which is the floating
    // problem in miniature — every perch is now ON something.
    { x: 624, y: 638, size: 74, labelBelow: true },
  ];

  /**
   * Relative size, animal to animal. An Eastern Screech-Owl is a
   * heavier, rounder thing than a flying squirrel even though they are
   * a similar length, and drawing them identically was the flattest
   * part of the old scene.
   */
  const RELATIVE: Record<string, number> = {
    eastern_screech_owl: 1,
    flying_squirrel: 0.86,
  };

  const perch = (i: number) => PERCHES[i % PERCHES.length];

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Owl Box" iconEmoji="🦉">
      <div aria-hidden className="absolute inset-0"
           style={{ background: 'linear-gradient(#0A1024, #16223E 45%, #1E2A22)' }} />
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="ob-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1024" />
            <stop offset="100%" stopColor="#26364E" />
          </linearGradient>
          <linearGradient id="ob-bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2E2519" />
            <stop offset="35%" stopColor="#5A4A32" />
            <stop offset="100%" stopColor="#241C12" />
          </linearGradient>
          <radialGradient id="ob-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6F1DC" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#F6F1DC" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x={-40} y={-40} width={VB_W + 80} height={720} fill="url(#ob-sky)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EAF0FF" opacity={s.o} />
        ))}
        <circle cx={558} cy={150} r={92} fill="url(#ob-moon)" />
        <circle cx={558} cy={150} r={44} fill="#F8F3DE" />
        <circle cx={544} cy={138} r={8} fill="#E4DCC0" opacity={0.6} />
        <circle cx={572} cy={162} r={11} fill="#E4DCC0" opacity={0.5} />

        {/* far woods, so the tree stands in front of something */}
        {[[60, 640, 90], [180, 660, 70], [300, 636, 100], [470, 664, 78], [620, 644, 92]]
          .map(([tx, ty, th], i) => (
          <g key={i} opacity={0.5}>
            <rect x={tx - 5} y={ty - th * 0.3} width={10} height={th * 0.4} fill="#16221A" />
            <path d={`M ${tx} ${ty - th} L ${tx - 38} ${ty - th * 0.25} L ${tx + 38} ${ty - th * 0.25} Z`}
                  fill="#1B2A20" />
          </g>
        ))}

        {/* the forest floor, a long way down */}
        <path d={`M -40 690 Q 240 664 ${VB_W + 40} 700 L ${VB_W + 40} ${VB_H + 40} L -40 ${VB_H + 40} Z`}
              fill="#1A2418" />

        {/* ── THE TREE ───────────────────────────────────────────
            It was a flat rectangle running off the bottom of the frame
            with one thin arc for a branch, which read as a post rather
            than a tree. A trunk TAPERS, its bark runs in broken ridges
            rather than continuous pinstripes, and a limb is thick where
            it leaves the trunk and forks as it goes — one twig sticking
            out sideways is the shape nothing in a wood actually has. */}
        <path d={`M 210 -40 L 196 700 Q 190 900 168 ${VB_H + 40}
                  L 452 ${VB_H + 40} Q 424 900 410 700 L 396 -40 Z`}
              fill="url(#ob-bark)" />
        {/* roots flaring where the trunk meets the dark, so it is not
            simply cut off by the edge of the picture */}
        <path d={`M 178 ${VB_H + 40} Q 168 1000 108 972 Q 74 1040 96 ${VB_H + 40} Z`}
              fill="#2A2117" />
        <path d={`M 442 ${VB_H + 40} Q 452 996 516 970 Q 552 1038 528 ${VB_H + 40} Z`}
              fill="#2A2117" />
        <path d={`M 300 ${VB_H + 40} Q 296 1020 262 998 Q 250 1046 266 ${VB_H + 40} Z`}
              fill="#241C12" opacity={0.8} />
        {/* bark: broken vertical ridges, offset and varied */}
        {[
          [222, -20, 300], [222, 340, 260], [252, 60, 420], [252, 540, 300],
          [288, -30, 260], [288, 300, 380], [318, 120, 340], [318, 560, 320],
          [352, -10, 300], [352, 380, 300], [382, 200, 420],
        ].map(([bx, by, len], i) => (
          <path key={i}
                d={`M ${bx} ${by} q ${i % 2 ? 7 : -7} ${len / 2} 0 ${len}`}
                stroke="#1E1710" strokeWidth={i % 3 === 0 ? 4 : 2.5}
                fill="none" opacity={0.5} strokeLinecap="round" />
        ))}

        {/* THE LIMB — thick at the trunk, tapering, forking twice */}
        <path d="M 400 706 Q 500 686 596 700 Q 664 710 700 692"
              stroke="#3E3222" strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d="M 400 700 Q 500 680 596 694 Q 664 704 700 686"
              stroke="#5A4A32" strokeWidth={13} fill="none" strokeLinecap="round" />
        {/* the forks */}
        <path d="M 556 692 Q 580 640 566 596" stroke="#3E3222" strokeWidth={13}
              fill="none" strokeLinecap="round" />
        <path d="M 566 596 Q 560 566 578 546" stroke="#3E3222" strokeWidth={7}
              fill="none" strokeLinecap="round" />
        <path d="M 634 700 Q 662 664 656 630" stroke="#3E3222" strokeWidth={9}
              fill="none" strokeLinecap="round" />
        {/* a little foliage on the forks, dark because it is night */}
        {[[566, 586, 30], [580, 540, 22], [656, 622, 26], [612, 664, 20]].map(([lx, ly, lr], i) => (
          <g key={i} opacity={0.9}>
            <ellipse cx={lx} cy={ly} rx={lr} ry={lr * 0.66} fill="#1E3324" />
            <ellipse cx={lx - lr * 0.3} cy={ly - lr * 0.2} rx={lr * 0.55} ry={lr * 0.4}
                     fill="#27402C" />
          </g>
        ))}

        {/* ── THE BOX ────────────────────────────────────────────── */}
        <g transform="translate(300, 330)">
          <ellipse cx={4} cy={172} rx={92} ry={12} fill="#000" opacity={0.3} />
          {/* body */}
          <rect x={-84} y={0} width={168} height={168} rx={4}
                fill="#8A6238" stroke="#3F2C1A" strokeWidth={4} />
          {/* plank lines, so it is boards somebody cut */}
          {[42, 84, 126].map(y => (
            <line key={y} x1={-84} y1={y} x2={84} y2={y} stroke="#5C3F22" strokeWidth={2.5} />
          ))}
          {/* sloped roof with an overhang, to keep rain off the hole */}
          <path d="M -100 4 L 100 4 L 84 -26 L -84 -26 Z"
                fill="#6B4A28" stroke="#3F2C1A" strokeWidth={4} strokeLinejoin="round" />
          {/* THE HOLE — small on purpose, which is a quest question */}
          <circle cx={0} cy={62} r={30} fill="#0D0A06" stroke="#3F2C1A" strokeWidth={4} />
          <path d="M -26 48 A 30 30 0 0 1 20 42" stroke="#A87A4A" strokeWidth={4}
                fill="none" strokeLinecap="round" opacity={0.55} />
          {/* the owl looking out of it */}
          <g transform="translate(0, 66)">
            <motion.g
              animate={reducedMotion ? undefined : { y: [0, -2.5, 0] }}
              transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx={0} cy={4} rx={19} ry={17} fill="#8A8074" />
              <path d="M -14 -8 L -17 -20 L -7 -13 Z" fill="#8A8074" />
              <path d="M 14 -8 L 17 -20 L 7 -13 Z" fill="#8A8074" />
              <path d="M -13 -6 Q 0 -12 13 -6 Q 15 6 0 10 Q -15 6 -13 -6 Z" fill="#CFC6B6" />
              <circle cx={-6} cy={-1} r={5.5} fill="#F5C542" />
              <circle cx={6} cy={-1} r={5.5} fill="#F5C542" />
              <circle cx={-6} cy={-1} r={2.8} fill="#1A140E" />
              <circle cx={6} cy={-1} r={2.8} fill="#1A140E" />
              <path d="M 0 3 L -2.5 8 Q 0 10 2.5 8 Z" fill="#D8C9A8" />
            </motion.g>
          </g>
          {/* mounting strap and the shavings ledge */}
          <rect x={-96} y={54} width={12} height={80} rx={3} fill="#4E463C" stroke="#2A241C" strokeWidth={2} />
          <rect x={84} y={54} width={12} height={80} rx={3} fill="#4E463C" stroke="#2A241C" strokeWidth={2} />
        </g>

        {/* ── THE NIGHT LOG — the reading stop ───────────────────── */}
        <g transform="translate(596, 556)"
           style={{ cursor: 'pointer', touchAction: 'manipulation' }}
           onClick={startSkill} role="button" aria-label={themedStructureLabel}>
          <rect x={-96} y={-72} width={192} height={150} fill="transparent" />
          {!reducedMotion && (
            <motion.ellipse cx={0} cy={0} rx={62} ry={44} fill="#FFE89A"
              animate={{ opacity: [0.08, 0.24, 0.08] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          {/* a notebook propped in the fork of the branch */}
          <g transform="rotate(-8)">
            <rect x={-46} y={-40} width={92} height={68} rx={4}
                  fill="#F2E8D0" stroke="#5A4A32" strokeWidth={3} />
            <rect x={-46} y={-40} width={20} height={68} rx={4} fill="#C07A4E" stroke="#5A4A32" strokeWidth={3} />
            {[-24, -12, 0, 12].map(y => (
              <line key={y} x1={-18} y1={y} x2={38} y2={y} stroke="#9A8C76" strokeWidth={2.2} />
            ))}
          </g>
          <rect x={-72} y={40} width={144} height={20} rx={10}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1.2} />
          <text y={54} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* ── who has been seen at the box ─────────────────────────
            Placed at perches in the tree, at sizes relative to one
            another, rather than lined up at a uniform size in front of
            the picture. Each sits on something and casts a shadow onto
            what it is sitting on. */}
        {discoveredSpecies.map((sp, i) => {
          const p = perch(i);
          const size = p.size * (RELATIVE[sp.code] ?? 0.9);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 3.8 + (i % 3) * 0.7, repeat: Infinity,
                ease: 'easeInOut', delay: i * 0.5,
              }}
            >
              {/* contact shadow on the branch it is gripping */}
              {p.labelBelow && (
                <ellipse cx={p.x} cy={p.y + size * 0.34} rx={size * 0.32} ry={size * 0.07}
                         fill="#000" opacity={0.35} />
              )}
              <g transform={`translate(${p.x - size / 2}, ${p.y - size / 2})`}>
                {SpeciesIllustration({ code: sp.illustrationKey, size })
                  ?? <text x={size / 2} y={size * 0.66} textAnchor="middle"
                           fontSize={size * 0.6}>{sp.emoji}</text>}
              </g>
              <rect x={p.x - 66} y={p.y + size * 0.38} width={132} height={19} rx={5}
                    fill="rgba(20,28,20,0.85)" />
              <text x={p.x} y={p.y + size * 0.38 + 13} textAnchor="middle" fontSize={9.5}
                    fontWeight={700} fill="#DCE8CE">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const p = perch(discoveredSpecies.length + i);
          return (
            <g key={`unknown-${i}`} opacity={0.4}>
              {/* an empty perch, not an empty slot in a row */}
              <ellipse cx={p.x} cy={p.y} rx={p.size * 0.3} ry={p.size * 0.26}
                       fill="none" stroke="#8FA6D8" strokeWidth={2} strokeDasharray="5 6" />
              <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize={22}
                    fontStyle="italic" fill="#8FA6D8">?</text>
              <rect x={p.x - 60} y={p.y + p.size * 0.34} width={120} height={18} rx={5}
                    fill="rgba(20,28,20,0.6)" />
              <text x={p.x} y={p.y + p.size * 0.34 + 12.5} textAnchor="middle" fontSize={9}
                    fontStyle="italic" fill="#AFC4EA">
                nobody yet
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
