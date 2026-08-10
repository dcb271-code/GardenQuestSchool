// app/(child)/garden/habitat/[code]/CrystalCavernInterior.tsx
//
// Crystal Cavern — Cecily's, by request and by her name.
//
// Inside a worked-out mine in the side of Math Mountain: a lantern-lit
// tunnel with a seam of crystal still in the wall, a sorting table
// where the day's finds are counted, and animals living in the dark
// further back.
//
// Three things happen here, and they are hers:
//
//   DIG — one a day. Turns up a specimen, or occasionally a creature.
//         Capped deliberately; see the economy note in the design doc.
//         The cavern pays for going deeper, not for going again.
//   KEEP or SELL — every specimen offers the choice, and it is a real
//         one: a kept stone fills the display case, a sold one becomes
//         coins. The same stone cannot do both.
//   THE MATHS STOP — the money maths she asked for, on the price board.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle, playHarvest } from '@/lib/audio/sfx';
import {
  getGem, gemsOnShelf, scratchTestFor, type GemData,
} from '@/lib/world/gemCatalog';
import { coinsToPrice, type CavernState } from '@/lib/world/cavern';
import DisplayCase from './DisplayCase';
import GemSpecimen from '@/components/child/garden/GemSpecimen';

// Portrait-first. The scene used to be 900x620 — a landscape picture
// letterboxed into a tall phone, which is where the two dead brown
// bands came from. 700x1100 is close to a phone's shape, and a rock
// backdrop fills whatever is left over on any screen.
const VB_W = 700;
const VB_H = 1100;

export default function CrystalCavernInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount, cavern: initialCavern,
}: {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
  cavern: CavernState;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);
  const [cavern, setCavern] = useState(initialCavern);
  const [digging, setDigging] = useState(false);
  /** The stone just dug up, awaiting her keep-or-sell decision. */
  const [found, setFound] = useState<GemData | null>(null);
  // Where the stone in front of her came from. An earned stone should
  // not be presented as luck — she worked for it.
  const [foundReason, setFoundReason] = useState<'dug' | 'earned'>('dug');

  // Stones the cavern owes her for mastering a skill, waiting here so
  // the keep-or-sell choice is still hers. Shown one at a time.
  useEffect(() => {
    if (found) return;
    const next = (cavern.pending ?? [])[0];
    if (!next) return;
    const gem = getGem(next);
    if (gem) { setFound(gem); setFoundReason('earned'); playSparkle(); }
  }, [cavern.pending, found]);
  const [foundCreature, setFoundCreature] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const startSkill = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
      });
      const { sessionId } = await res.json();
      if (sessionId) router.push(`/lesson/${sessionId}`);
      else setStarting(false);
    } catch {
      setStarting(false);
    }
  };

  const dig = async () => {
    if (digging || !cavern.canDigToday) return;
    setDigging(true);
    try {
      const res = await fetch('/api/cavern', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: 'dig' }),
      });
      const d = await res.json();
      if (d.error) { setMessage(d.error); return; }
      setCavern(d.cavern);
      if (d.gemCode) { setFound(getGem(d.gemCode) ?? null); setFoundReason('dug'); playSparkle(); }
      if (d.creatureCode) { setFoundCreature(d.creatureCode); playSparkle(); }
      if (!d.gemCode && !d.creatureCode) setMessage('Nothing but rock today. It happens.');
    } catch {
      setMessage('The tunnel is quiet. Try again in a moment.');
    } finally {
      setDigging(false);
    }
  };

  const decide = async (choice: 'keep' | 'sell') => {
    if (!found) return;
    const gem = found;
    setFound(null);
    try {
      const res = await fetch('/api/cavern', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, action: choice, gemCode: gem.code }),
      });
      const d = await res.json();
      if (d.cavern) setCavern(d.cavern);
      if (choice === 'sell') {
        playHarvest();
        setMessage(`Sold the ${gem.name} for ${coinsToPrice(d.paid ?? 0)}.`);
      } else {
        setMessage(`The ${gem.name} goes in the case.`);
      }
      window.setTimeout(() => setMessage(null), 3200);
    } catch {
      setMessage('That did not go through. Your stone is safe.');
    }
  };

  const kept = Object.keys(cavern.kept ?? {}).length;
  const [caseOpen, setCaseOpen] = useState(false);
  // Along the floor at the front, spaced so the labels never collide.
  // They used to sit at y=430, which was mid-air before there was a
  // floor to stand on.
  // Along the floor at the front. They used to sit in mid-air, before
  // there was a floor to stand on.
  const slot = (i: number) => ({ x: 96 + (i % 4) * 170, y: 934 + Math.floor(i / 4) * 100 });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Crystal Cavern" iconEmoji="💎">
      {/*
        A CAVE, not a gradient.
        ─────────────────────────────────────────────────────────────
        The first version was a flat brown rectangle with six diamonds
        floating in it and a yellow square for a lantern. The feedback
        was "I am not sure what I am looking at", which was fair: no
        ceiling, no floor, no walls, nothing to say where you stood.

        What makes an interior legible is a GROUND PLANE and a LIGHT
        SOURCE that explains its own shadows. So: a rocky ceiling with
        stalactites, a back wall with a tunnel receding into black, a
        floor you could stand on with rubble on it, and one lantern
        whose pool of light lands on that floor where it should.

        The crystals grow OUT OF a vein running through the wall, the
        way a real seam does, instead of hovering in mid-air.

        The backdrop div behind the svg is not lazy — it is what stops
        the letterboxing from ever reading as dead space again. The svg
        keeps `meet` so nothing is ever cropped off the sides; whatever
        it does not cover is more rock.
      */}
      <div aria-hidden className="absolute inset-0"
           style={{ background: 'linear-gradient(#2A231C, #4A3F35 45%, #241E19)' }} />
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="cav-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A322A" />
            <stop offset="55%" stopColor="#4E4238" />
            <stop offset="100%" stopColor="#332B24" />
          </linearGradient>
          <linearGradient id="cav-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A4C3E" />
            <stop offset="100%" stopColor="#2E2721" />
          </linearGradient>
          <linearGradient id="cav-ceiling" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#241E19" />
            <stop offset="100%" stopColor="#3E352C" />
          </linearGradient>
          <radialGradient id="cav-lantern" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE89A" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FFD98A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cav-pool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE0A0" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#FFE0A0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cav-tunnelfade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1C1712" stopOpacity="0" />
            <stop offset="100%" stopColor="#150F0B" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="cav-seam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6E5A78" />
            <stop offset="100%" stopColor="#4A3E52" />
          </linearGradient>
        </defs>

        {/* the rock this room is cut through */}
        <rect x={-40} y={-40} width={VB_W + 80} height={VB_H + 80} fill="url(#cav-wall)" />

        {/* ── ceiling, with stalactites hanging from it ──────────── */}
        <path d={`M -40 -40 L ${VB_W + 40} -40 L ${VB_W + 40} 150
                  Q 580 216 470 168 Q 350 112 240 176 Q 130 236 -40 178 Z`}
              fill="url(#cav-ceiling)" />
        {/* A lit lower edge. Without it the ceiling blended into the
            wall and the stalactites appeared to hang from nothing. */}
        <path d={`M ${VB_W + 40} 150 Q 580 216 470 168 Q 350 112 240 176 Q 130 236 -40 178`}
              fill="none" stroke="#5E5044" strokeWidth={4} opacity={0.75} />
        {[[52, 190, 42], [116, 178, 26], [182, 196, 56], [246, 176, 30],
          [452, 178, 34], [520, 194, 60], [586, 172, 26], [648, 190, 44],
        ].map(([sx, sy, len], i) => (
          <path key={i}
                d={`M ${sx - 15} ${sy - 34} Q ${sx} ${sy + len * 0.55} ${sx} ${sy + len}
                    Q ${sx} ${sy + len * 0.55} ${sx + 15} ${sy - 34} Z`}
                fill="#2C251F" stroke="#1E1915" strokeWidth={1.2} />
        ))}

        {/* ── the tunnel going deeper, in the back wall ──────────── */}
        {/* The near rim, catching the lantern — this is what makes it
            an opening cut INTO the wall rather than a slab standing in
            front of it. */}
        <path d="M 250 710 L 272 388 Q 350 332 428 388 L 450 710 Z"
              fill="#6B5A48" opacity={0.55} />
        <path d="M 262 706 L 282 396 Q 350 344 418 396 L 438 706 Z" fill="#1C1712" />
        <path d="M 282 396 Q 350 344 418 396 Q 350 380 282 396 Z" fill="#120E0B" />
        {/* rubble spilling out of the mouth, onto the floor in front */}
        <path d="M 268 706 Q 300 690 350 694 Q 402 690 432 706 Z" fill="#3A3129" />
        <path d="M 294 660 L 306 432 Q 350 400 394 432 L 406 660 Z"
              fill="none" stroke="#0E0B08" strokeWidth={7} opacity={0.55} />
        <path d="M 318 604 L 326 462 Q 350 442 374 462 L 382 604 Z"
              fill="none" stroke="#0A0806" strokeWidth={6} opacity={0.6} />

        {/* ── the floor she is standing on ───────────────────────── */}
        <path d={`M -40 706 Q 180 686 350 706 Q 530 726 ${VB_W + 40} 698
                  L ${VB_W + 40} ${VB_H + 40} L -40 ${VB_H + 40} Z`}
              fill="url(#cav-floor)" />
        <path d="M -40 706 Q 180 686 350 706 Q 530 726 740 698"
              fill="none" stroke="#6B5A48" strokeWidth={3} opacity={0.7} />
        {[[74, 754, 16, 7], [148, 792, 11, 5], [232, 742, 13, 6], [286, 806, 9, 4],
          [452, 748, 14, 6], [530, 794, 17, 7], [610, 744, 11, 5], [660, 800, 13, 6],
        ].map(([rx, ry, w, h], i) => (
          <ellipse key={i} cx={rx} cy={ry} rx={w} ry={h}
                   fill="#4A3E33" stroke="#2A231D" strokeWidth={1} />
        ))}

        {/* ── THE MINE CART, on its rails ─────────────────────────
            This replaces a crack in the wall with crystals sprouting
            out of it. The crack was the third attempt at that idea and
            still read as decoration — nothing in it said "somebody
            works down here". A cart on rails does: it is a machine, it
            has a job, and it points at the tunnel it came out of. */}
        <g>
          {/* sleepers and rails, running out of the tunnel mouth */}
          {/* The rails RUN INTO THE TUNNEL. They used to stop dead in
              the middle of the floor, which made them a stripe rather
              than a track — a line that ends nowhere has no reason to
              exist. Now they carry on past the mouth and the dark eats
              them, which also explains where the cart came from. */}
          {[-20, 34, 88, 142, 196, 250, 300].map(x => (
            <rect key={x} x={x} y={702} width={40} height={9} rx={2}
                  fill="#5C4229" stroke="#3A2A18" strokeWidth={1.2} />
          ))}
          <rect x={-40} y={698} width={390} height={5} rx={2}
                fill="#8A8378" stroke="#4E463C" strokeWidth={1.2} />
          <rect x={-40} y={712} width={390} height={5} rx={2}
                fill="#6E675B" stroke="#4E463C" strokeWidth={1.2} />
          {/* the dark swallowing them at the mouth */}
          <rect x={286} y={690} width={70} height={34} fill="url(#cav-tunnelfade)" />

          <g transform="translate(150, 640)">
            <ellipse cx={0} cy={78} rx={64} ry={11} fill="#000" opacity={0.32} />
            {/* the tub: narrower at the bottom, the way a real one is */}
            <path d="M -58 6 L 58 6 L 44 62 L -44 62 Z"
                  fill="#7A6A56" stroke="#33291E" strokeWidth={3} strokeLinejoin="round" />
            <path d="M -58 6 L 58 6 L 54 18 L -54 18 Z" fill="#95836B" />
            {/* iron bands */}
            <path d="M -52 28 L 52 28 M -48 44 L 48 44"
                  stroke="#4A3E30" strokeWidth={3} />
            {/* riveted end plate */}
            <path d="M -44 62 L 44 62 L 40 70 L -40 70 Z"
                  fill="#4A3E30" stroke="#2A231A" strokeWidth={2} strokeLinejoin="round" />
            {/* ore heaped over the rim — this is what it is FOR */}
            <path d="M -50 8 Q -30 -16 -6 -8 Q 14 -22 34 -6 Q 46 -12 52 8 Z"
                  fill="#5E5248" stroke="#33291E" strokeWidth={2} strokeLinejoin="round" />
            {[[-34, -2], [-14, -8], [6, -4], [26, -8], [42, 0]].map(([ox, oy], i) => (
              <ellipse key={i} cx={ox} cy={oy} rx={9} ry={7}
                       fill={['#9B6FD4', '#B4472F', '#D2DEEA', '#EBD3A0', '#9AA3AE'][i]}
                       stroke="#2A231D" strokeWidth={1.4} />
            ))}
            {/* wheels, sitting ON the rail */}
            {[-34, 34].map(wx => (
              <g key={wx}>
                <circle cx={wx} cy={70} r={15} fill="#3E3428" stroke="#221B14" strokeWidth={2.5} />
                <circle cx={wx} cy={70} r={6} fill="#6E675B" stroke="#221B14" strokeWidth={1.6} />
                {[0, 60, 120].map(a => (
                  <line key={a} x1={wx} y1={70} x2={wx + Math.cos(a * Math.PI / 180) * 13}
                        y2={70 + Math.sin(a * Math.PI / 180) * 13}
                        stroke="#221B14" strokeWidth={1.6} />
                ))}
              </g>
            ))}
            {/* push handle at the back */}
            <path d="M 58 10 L 76 -14 M 70 -14 L 82 -14"
                  stroke="#4A3E30" strokeWidth={4} strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* ── the shovel, stood against the wall ─────────────────── */}
        <g transform="translate(52, 566) rotate(-14)">
          <rect x={-3} y={0} width={6} height={112} rx={3}
                fill="#8A6238" stroke="#4A3018" strokeWidth={1.8} />
          <path d="M -4 0 L 4 0 L 6 -12 L -6 -12 Z" fill="#6B4A28" stroke="#4A3018" strokeWidth={1.6} />
          <path d="M -13 112 L 13 112 L 10 140 Q 0 150 -10 140 Z"
                fill="#9AA3AE" stroke="#4E463C" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M -13 112 L 13 112 L 12 120 L -12 120 Z" fill="#B6BEC8" />
        </g>

        {/* ── the sorting shelf ──────────────────────────────────────
            Three tiers, standing on the floor, with the day's finds set
            out on them — drawn with the SAME crystal habits as the
            display case, so a fluorite cube is a cube in both places
            and she can match what is on the shelf to what is in her
            collection. It was one plank with five flat blobs on it. */}
        <g transform="translate(556, 430)">
          <ellipse cx={0} cy={286} rx={104} ry={13} fill="#000" opacity={0.3} />
          {/* uprights */}
          <rect x={-92} y={0} width={13} height={282} fill="#6B4E33" stroke="#3F2C1A" strokeWidth={2.2} />
          <rect x={79} y={0} width={13} height={282} fill="#6B4E33" stroke="#3F2C1A" strokeWidth={2.2} />
          {/* three shelves with a front lip each */}
          {[0, 94, 188].map(ty => (
            <g key={ty}>
              <rect x={-96} y={ty + 68} width={192} height={12} rx={3}
                    fill="#A87A4A" stroke="#3F2C1A" strokeWidth={2.2} />
              <rect x={-96} y={ty + 68} width={192} height={4} rx={2} fill="#C79A66" />
            </g>
          ))}
          {/* the stock, in real crystal habits */}
          {[
            ['fluorite', -62, 24], ['quartz', -18, 24], ['kentucky_agate', 30, 24],
            ['calcite', -62, 118], ['galena', -18, 118], ['geode', 30, 118],
            ['freshwater_pearl', -62, 212], ['coal', -18, 212], ['garnet', 30, 212],
          ].map(([code, gx, gy]) => {
            const gem = getGem(code as string);
            if (!gem) return null;
            return (
              <g key={`${code}-${gy}`} transform={`translate(${gx}, ${gy})`}>
                <GemSpecimen gem={gem} size={44} />
              </g>
            );
          })}
        </g>

        {/* ── the lantern, and the light it actually casts ────────── */}
        <ellipse cx={214} cy={730} rx={210} ry={62} fill="url(#cav-pool)" />
        <circle cx={214} cy={318} r={200} fill="url(#cav-lantern)" />
        <g transform="translate(214, 282)">
          <line x1={0} y1={-282} x2={0} y2={-26} stroke="#6B5A48" strokeWidth={2.5} />
          <path d="M -9 -26 L 9 -26 L 6 -20 L -6 -20 Z" fill="#8A7358" stroke="#3F3428" strokeWidth={1.4} />
          <path d="M -16 -20 L 16 -20 L 20 24 L -20 24 Z"
                fill="#3E3428" stroke="#241D16" strokeWidth={2} strokeLinejoin="round" />
          <path d="M -13 -16 L 13 -16 L 16 20 L -16 20 Z" fill="#FFE9A8" />
          <motion.ellipse cx={0} cy={4} rx={6} ry={9} fill="#FFF6D0"
            animate={reducedMotion ? undefined : { opacity: [0.75, 1, 0.75], ry: [8, 10, 8] }}
            transition={reducedMotion ? undefined : { duration: 2.2, repeat: Infinity }} />
          <line x1={-16} y1={-3} x2={16} y2={-3} stroke="#241D16" strokeWidth={1.6} />
          <line x1={-18} y1={11} x2={18} y2={11} stroke="#241D16" strokeWidth={1.6} />
          <path d="M -20 24 L 20 24 L 16 30 L -16 30 Z" fill="#3E3428" stroke="#241D16" strokeWidth={1.6} />
        </g>

        {/* ── A PICK, left on the floor ───────────────────────────
            Scenery, not a button. It reads as a tool somebody put down
            rather than an icon: a long haft, a head with a POINT on one
            side and a flat chisel on the other, and a collar where the
            two are wedged on. Drawn side-on so both ends of the head
            are visible — the first attempt was a grey blob with a stick
            through it and did not read as a pick at all. */}
        <g transform="translate(150, 786) rotate(-7)" pointerEvents="none">
          <ellipse cx={6} cy={22} rx={62} ry={8} fill="#000" opacity={0.26} />
          {/* haft, thicker at the grip end */}
          <path d="M -54 14 L 62 4 L 62 12 L -54 22 Z"
                fill="#8A6238" stroke="#4A3018" strokeWidth={2} strokeLinejoin="round" />
          <path d="M -54 14 L 62 4 L 62 7 L -54 17 Z" fill="#A87A4A" />
          {/* the head — one long spike, one flat blade, meeting at the eye */}
          <path d="M -46 12 Q -70 -6 -96 -14 Q -74 6 -50 20 Z"
                fill="#B6BEC8" stroke="#4E463C" strokeWidth={2} strokeLinejoin="round" />
          <path d="M -46 12 Q -26 -10 -2 -18 L 4 -6 Q -20 4 -44 20 Z"
                fill="#9AA3AE" stroke="#4E463C" strokeWidth={2} strokeLinejoin="round" />
          {/* the eye/collar the haft passes through */}
          <path d="M -52 6 L -38 4 L -34 22 L -48 24 Z"
                fill="#6E675B" stroke="#3D3831" strokeWidth={2} strokeLinejoin="round" />
        </g>

        {/* ── THE MATHS STOP — the price board ─────────────────────
            It is called The Price Board and it is the money maths she
            asked for, so it should be a board with prices on it. It had
            been the ⛏ emoji in a glowing circle, and then a pickaxe —
            both wrong, because a pick is for digging and this is for
            counting what the digging was worth. */}
        <g transform="translate(548, 286)"
           style={{ cursor: 'pointer', touchAction: 'manipulation' }}
           onClick={startSkill} aria-label={themedStructureLabel} role="button">
          <rect x={-108} y={-92} width={216} height={200} fill="transparent" />
          {!reducedMotion && (
            <motion.rect x={-92} y={-76} width={184} height={140} rx={10}
              fill="#FFE89A"
              animate={{ opacity: [0.08, 0.22, 0.08] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          {/* slate, in a plank frame, hung on the wall */}
          <rect x={-86} y={-70} width={172} height={128} rx={5}
                fill="#7A5B3C" stroke="#3F2C1A" strokeWidth={3} />
          <rect x={-76} y={-60} width={152} height={108} rx={3} fill="#33302B" />
          <text x={0} y={-40} textAnchor="middle" fontSize={15} fontWeight={700}
                fill="#E8DCC0" style={{ userSelect: 'none' }}>PRICES</text>
          <line x1={-58} y1={-32} x2={58} y2={-32} stroke="#8A8378" strokeWidth={2} />
          {/* chalked rows: a stone, and what it fetches */}
          {[['#B4472F', '40c'], ['#9B6FD4', '25c'], ['#D2DEEA', '10c']].map(([c, price], i) => (
            <g key={i} transform={`translate(0, ${-14 + i * 24})`}>
              <ellipse cx={-42} cy={0} rx={11} ry={8.5} fill={c as string}
                       stroke="#1F1D19" strokeWidth={1.5} />
              <text x={-18} y={5} fontSize={14} fontWeight={700} fill="#E8DCC0"
                    style={{ userSelect: 'none', fontFamily: 'ui-monospace, monospace' }}>
                ×
              </text>
              <text x={46} y={5} textAnchor="end" fontSize={14} fontWeight={700}
                    fill="#F5D98F" style={{ userSelect: 'none', fontFamily: 'ui-monospace, monospace' }}>
                {price}
              </text>
            </g>
          ))}
          <rect x={-72} y={68} width={144} height={20} rx={10}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1.2} />
          <text y={82} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* the creatures living further in */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 3 + (i % 3) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4,
              }}
            >
              <ellipse cx={x} cy={y + 26} rx={24} ry={5} fill="#000" opacity={0.35} />
              <g transform={`translate(${x - 30}, ${y - 30})`}>
                {SpeciesIllustration({ code: sp.code, size: 60 })
                  ?? <text x={30} y={40} textAnchor="middle" fontSize={38}>{sp.emoji}</text>}
              </g>
              <rect x={x - 62} y={y + 32} width={124} height={18} rx={5}
                    fill="rgba(80, 70, 58, 0.9)" />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#F2E8D5">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`unknown-${i}`} opacity={0.5}>
              <text x={x} y={y + 6} textAnchor="middle" fontSize={20} fontStyle="italic"
                    fill="#9A8C76">?</text>
              <rect x={x - 62} y={y + 32} width={124} height={18} rx={5}
                    fill="rgba(60, 52, 42, 0.7)" />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#B8A98F">
                something in the dark
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── the working surface, over the art ─────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="rounded-2xl p-3 max-w-xl mx-auto"
             style={{ background: 'rgba(28,24,20,0.92)', border: '1px solid #6b5a44' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={dig}
              disabled={digging || !cavern.canDigToday}
              className="rounded-xl px-4 font-bold text-sm disabled:opacity-45"
              style={{ background: '#C9A227', color: '#2A2420', minHeight: 48,
                       touchAction: 'manipulation' }}
            >
              {digging ? 'digging…'
                : cavern.canDigToday
                  ? `⛏ dig${(cavern.digsLeftToday ?? 0) > 1 ? ` (${cavern.digsLeftToday} left)` : ''}`
                  : 'dug for today'}
            </button>
            <div className="flex-1 text-xs" style={{ color: '#D8C9A8' }}>
              <div><strong style={{ color: '#F5D98F' }}>{coinsToPrice(cavern.coins)}</strong> in coins</div>
              {/* The count was a dead end — she wrote to ask where the
                  stones actually were. It opens the case now. */}
              <button
                onClick={() => setCaseOpen(true)}
                className="underline underline-offset-2 text-left"
                style={{ color: '#D8C9A8', minHeight: 32, touchAction: 'manipulation' }}
              >
                {kept} stone{kept === 1 ? '' : 's'} in the case →
              </button>
            </div>
            {!cavern.canDigToday && (
              /* "No" on its own reads as broken to a seven-year-old —
                 she wrote to ask why the cavern would not let her dig.
                 Say WHEN instead. */
              <span className="text-[11px] italic text-right" style={{ color: '#9A8C76', maxWidth: 160 }}>
                {(cavern.digsLeftToday ?? 0) > 0
                  ? 'the dust is still settling — a few minutes'
                  : "that is both of today's digs — back tomorrow morning"}
              </span>
            )}
          </div>
          {message && (
            <p className="text-xs mt-2" style={{ color: '#F5D98F' }}>{message}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {caseOpen && (
          <DisplayCase
            kept={cavern.kept ?? {}}
            open={caseOpen}
            onClose={() => setCaseOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── keep or sell ──────────────────────────────────────────── */}
      <AnimatePresence>
        {found && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
            style={{ background: 'rgba(20,16,12,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={reducedMotion ? undefined : { scale: 0.9, y: 10 }}
              animate={reducedMotion ? undefined : { scale: 1, y: 0 }}
              className="rounded-2xl p-4 w-full"
              style={{ background: '#FFFAF2', border: '2px solid #C9A227', maxWidth: 400 }}
            >
              <div className="text-center">
                {/* Earned reads differently from dug. She asked for the
                    maths and the crystals to be one thing; the banner is
                    where that promise is actually kept. */}
                {foundReason === 'earned' && (
                  <div className="rounded-full px-3 py-1 mb-2 inline-block text-[11px] font-bold"
                       style={{ background: '#EFE0B0', color: '#5A4520' }}>
                    ⛏ the seam paid you for mastering something
                  </div>
                )}
                <div className="text-4xl" aria-hidden>{found.emoji}</div>
                <h2 className="font-bold text-lg mt-1" style={{ color: '#3f2614' }}>
                  {found.name}
                </h2>
                <p className="text-xs" style={{ color: '#6b6255' }}>
                  hardness {found.mohs} · {found.crystalShape}
                </p>
              </div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4a4034' }}>
                {found.formationStory}
              </p>
              <p className="text-xs mt-2 italic" style={{ color: '#6b6255' }}>
                {scratchTestFor(found)
                  ? `You could scratch it with ${scratchTestFor(found)}.`
                  : 'Nothing you own will scratch it.'}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => decide('keep')}
                  className="flex-1 rounded-xl px-3 font-bold text-sm"
                  style={{ background: '#fffaf2', border: '2px solid #6b8e5a',
                           color: '#3f2614', minHeight: 52 }}
                >
                  keep it<br />
                  <span className="text-[11px] font-normal">for the case</span>
                </button>
                <button
                  onClick={() => decide('sell')}
                  className="flex-1 rounded-xl px-3 font-bold text-sm"
                  style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 52 }}
                >
                  sell it<br />
                  <span className="text-[11px] font-normal">
                    {coinsToPrice(found.valuePerGram)}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── a creature, found in the dark ─────────────────────────── */}
      <AnimatePresence>
        {foundCreature && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
            style={{ background: 'rgba(20,16,12,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFoundCreature(null)}
          >
            <div className="rounded-2xl p-5 text-center w-full"
                 style={{ background: '#FFFAF2', border: '2px solid #6b8e5a', maxWidth: 380 }}>
              <div className="text-4xl mb-1" aria-hidden>👀</div>
              <h2 className="font-bold text-base" style={{ color: '#3f2614' }}>
                Something moved back there
              </h2>
              <p className="text-sm mt-1" style={{ color: '#4a4034' }}>
                Look in your field journal — it is in the cavern now.
              </p>
              <button
                onClick={() => setFoundCreature(null)}
                className="w-full mt-3 rounded-xl px-4 font-bold text-sm"
                style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 48 }}
              >
                back to digging
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HabitatInteriorLayout>
  );
}
