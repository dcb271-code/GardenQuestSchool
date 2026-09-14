'use client';

// The landing at the top of the stairs. House phase 3.
//
// A hallway with one bedroom door per child, each with a drawn name
// plate. Every child's door is here whoever is signed in — like the
// coat hooks downstairs, with one deliberate difference the caller
// makes (lib/world/room.ts, getsABedroom): the shared tablet
// profiles get a coat hook but not a door. A tablet does not sleep.
//
// Your own door stands ajar with the lamp on inside. A sibling's is
// closed; behind it is their room, and you may look but not touch.
//
// Spec: docs/superpowers/specs/2026-08-29-upstairs-spec.md

import { motion } from 'framer-motion';

const TRIM = '#6B4226';
const OAK = '#955F2E';
const OAK_LIGHT = '#B07A42';
const OAK_DARK = '#6E4520';
const FLOOR_LINE = '#8F5A2E';

export interface DoorInfo {
  id: string;
  name: string;
}

export default function UpstairsLanding({
  doors, learnerId, reducedMotion, onDoor, onDown,
}: {
  doors: DoorInfo[];
  learnerId: string;
  reducedMotion: boolean;
  onDoor: (id: string) => void;
  onDown: () => void;
}) {
  const n = Math.max(doors.length, 1);
  const doorW = Math.min(140, Math.floor(580 / n) - 30);
  const doorH = 300;
  const doorY = 800 - doorH;

  return (
    <svg viewBox="0 0 700 1100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="land-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1E2C8" />
          <stop offset="45%" stopColor="#EAD7B6" />
          <stop offset="100%" stopColor="#D9BE97" />
        </linearGradient>
        <linearGradient id="land-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BC7C42" />
          <stop offset="100%" stopColor="#93582A" />
        </linearGradient>
        <radialGradient id="land-sconce" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#FFF3CF" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#FFE9B8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#FFE9B8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="land-corner-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="land-corner-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="land-oak-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={OAK_DARK} />
          <stop offset="45%" stopColor={OAK_LIGHT} />
          <stop offset="100%" stopColor={OAK_DARK} />
        </linearGradient>
        <linearGradient id="land-stairwell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6E5236" />
          <stop offset="100%" stopColor="#3A2A1C" />
        </linearGradient>
      </defs>

      {/* ceiling, wall, rail, floor */}
      <rect x={0} y={0} width={700} height={56} fill="#F7EEDC" />
      <rect x={0} y={52} width={700} height={10} fill={TRIM} opacity={0.5} />
      <rect x={0} y={60} width={700} height={764} fill="url(#land-wall)" />
      <rect x={0} y={238} width={700} height={7} fill={TRIM} opacity={0.55} />
      <rect x={0} y={800} width={700} height={22} fill={TRIM} />
      <rect x={0} y={822} width={700} height={8} fill="#3F2A16" opacity={0.25} />
      <rect x={0} y={820} width={700} height={280} fill="url(#land-floor)" />
      {[884, 948, 1012, 1076].map(y => (
        <line key={y} x1={0} y1={y} x2={700} y2={y} stroke={FLOOR_LINE} strokeWidth={2} opacity={0.4} />
      ))}
      <rect x={0} y={0} width={700} height={840} fill="url(#land-sconce)" pointerEvents="none" />

      {/* the wall sconce, lit — the only light up here at bedtime */}
      <g>
        <rect x={334} y={150} width={32} height={10} rx={3} fill={OAK_DARK} />
        <path d="M 322 150 L 332 112 L 368 112 L 378 150 Z" fill="#F9F1DC" stroke="#C9B88E" strokeWidth={2} />
        <ellipse cx={350} cy={150} rx={28} ry={6} fill="#FFEDB8" opacity={0.7} />
        {!reducedMotion && (
          <motion.ellipse cx={350} cy={200} rx={90} ry={70} fill="#FFE9A8"
                          animate={{ opacity: [0.08, 0.16, 0.08] }}
                          transition={{ duration: 3.6, repeat: Infinity }} />
        )}
      </g>

      {/* THE DOORS — one per child, name plate on each */}
      {doors.map((d, i) => {
        const cx = 60 + 580 * (i + 0.5) / n;
        const x = cx - doorW / 2;
        const mine = d.id === learnerId;
        return (
          <g key={d.id} onClick={() => onDoor(d.id)} style={{ cursor: 'pointer', touchAction: 'manipulation' }}
             role="button" aria-label={mine ? 'Go into your room' : `Visit ${d.name}'s room`}>
            {/* frame */}
            <rect x={x - 10} y={doorY - 10} width={doorW + 20} height={doorH + 10} fill={TRIM} rx={3} />
            {mine ? (
              <g>
                {/* ajar: the room's lamp is on, and light leans out
                    across the floor of the landing */}
                <rect x={x} y={doorY} width={doorW} height={doorH} fill="#8A6234" />
                <rect x={x} y={doorY} width={doorW} height={doorH} fill="#FFE9A8" opacity={0.5} />
                <path d={`M ${x + 8} ${doorY + 4} L ${x + doorW * 0.78} ${doorY + 16} L ${x + doorW * 0.78} ${doorY + doorH - 16} L ${x + 8} ${doorY + doorH - 4} Z`}
                      fill={OAK} stroke={OAK_DARK} strokeWidth={2} />
                {[[0.16, 0.16, 0.42, 0.28], [0.16, 0.5, 0.42, 0.36]].map(([px, py, pw, ph], k) => (
                  <path key={k}
                        d={`M ${x + 8 + doorW * 0.7 * px} ${doorY + 8 + doorH * py + doorW * 0.7 * px * 0.14}
                            L ${x + 8 + doorW * 0.7 * (px + pw)} ${doorY + 14 + doorH * py + doorW * 0.7 * (px + pw) * 0.14}
                            L ${x + 8 + doorW * 0.7 * (px + pw)} ${doorY + 14 + doorH * (py + ph) + doorW * 0.7 * (px + pw) * 0.14}
                            L ${x + 8 + doorW * 0.7 * px} ${doorY + 8 + doorH * (py + ph) + doorW * 0.7 * px * 0.14} Z`}
                        fill="none" stroke={OAK_DARK} strokeWidth={2} opacity={0.7} />
                ))}
                <circle cx={x + doorW * 0.7} cy={doorY + doorH * 0.5} r={5} fill="#F5D98F" stroke="#8A6A10" strokeWidth={1.5} />
                <path d={`M ${x + doorW * 0.78} 800 L ${x + doorW + 60} 900 L ${x + doorW - 40} 900 Z`}
                      fill="#FFE9A8" opacity={0.18} />
              </g>
            ) : (
              <g>
                <rect x={x} y={doorY} width={doorW} height={doorH} fill={OAK} stroke={OAK_DARK} strokeWidth={2} />
                {[[0.16, 0.14, 0.68, 0.3], [0.16, 0.52, 0.68, 0.36]].map(([px, py, pw, ph], k) => (
                  <rect key={k} x={x + doorW * px} y={doorY + doorH * py} width={doorW * pw} height={doorH * ph}
                        fill="none" stroke={OAK_DARK} strokeWidth={2} rx={2} opacity={0.7} />
                ))}
                <circle cx={x + doorW * 0.86} cy={doorY + doorH * 0.5} r={5} fill="#F5D98F" stroke="#8A6A10" strokeWidth={1.5} />
              </g>
            )}
            {/* the name plate, hung on the door at a child's eye height */}
            <rect x={cx - 48} y={doorY + 40} width={96} height={30} rx={6} fill="#F7EFD9" stroke="#C9B88E" strokeWidth={2} />
            <circle cx={cx - 40} cy={doorY + 55} r={2} fill="#8A7A5E" />
            <circle cx={cx + 40} cy={doorY + 55} r={2} fill="#8A7A5E" />
            <text x={cx} y={doorY + 60} textAnchor="middle" fontSize={14} fontWeight={700} fill="#3f2614">
              {d.name}
            </text>
          </g>
        );
      })}

      {/* the runner — the hall's colorful rug came up the stairs too */}
      <g>
        <rect x={210} y={860} width={280} height={150} rx={8} fill="#8F4A5A" />
        {[0, 1, 2].map(i => (
          <rect key={i} x={230} y={872 + i * 44} width={240} height={34} rx={5}
                fill={['#4A8C8C', '#D9A441', '#C96A5A'][i]} opacity={0.85} />
        ))}
        {[0, 1, 2].map(i => (
          <path key={i} d={`M 350 ${878 + i * 44} l 22 11 l -22 11 l -22 -11 Z`} fill="#F2E6D0" opacity={0.7} />
        ))}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={i} stroke="#E8DCC8" strokeWidth={2.5} strokeLinecap="round">
            <line x1={230 + i * 48} y1={860} x2={232 + i * 48} y2={852} />
            <line x1={230 + i * 48} y1={1010} x2={232 + i * 48} y2={1018} />
          </g>
        ))}
      </g>

      {/* the top of the stairs — the rail arrives at the front right
          and the flight drops away out of frame. Tap to go down. */}
      <g onClick={onDown} style={{ cursor: 'pointer' }} role="button" aria-label="Go downstairs">
        <rect x={500} y={840} width={200} height={260} fill="transparent" />
        {/* the well, and the first treads dropping away into it —
            the first draw was a dark box with two lines in it */}
        <path d="M 560 1100 L 700 1100 L 700 960 L 560 1010 Z" fill="url(#land-stairwell)" />
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <path d={`M ${572 + i * 34} ${1012 + i * 20} L 700 ${966 + i * 20} L 700 ${980 + i * 20} L ${572 + i * 34} ${1026 + i * 20} Z`}
                  fill={OAK_LIGHT} opacity={1 - i * 0.2} />
            <path d={`M ${572 + i * 34} ${1026 + i * 20} L 700 ${980 + i * 20} L 700 ${988 + i * 20} L ${572 + i * 34} ${1034 + i * 20} Z`}
                  fill={OAK_DARK} opacity={0.9 - i * 0.2} />
          </g>
        ))}
        {/* newel post and the rail running down */}
        <rect x={530} y={880} width={26} height={170} fill="url(#land-oak-round)" stroke={OAK_DARK} strokeWidth={2} rx={3} />
        <rect x={524} y={864} width={38} height={22} fill={OAK} stroke={OAK_DARK} strokeWidth={2} rx={5} />
        <circle cx={543} cy={858} r={9} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} />
        {[600, 650].map((bx, i) => (
          <rect key={bx} x={bx} y={900 + i * 16} width={5} height={84} fill={OAK} rx={2} />
        ))}
        <line x1={556} y1={888} x2={700} y2={936} stroke={OAK_DARK} strokeWidth={11} strokeLinecap="round" />
        <line x1={556} y1={884} x2={700} y2={932} stroke={OAK_LIGHT} strokeWidth={4} strokeLinecap="round" />
        <rect x={540} y={1040} width={132} height={30} rx={15} fill="#FFF8E8" opacity={0.94}
              stroke="#C9B88E" strokeWidth={1.5} />
        <text x={606} y={1060} textAnchor="middle" fontSize={13} fontWeight={700} fill="#3f2614">
          ↓ downstairs
        </text>
      </g>

      {/* corner shading, so the hall has sides */}
      <rect x={0} y={56} width={80} height={1044} fill="url(#land-corner-left)" pointerEvents="none" />
      <rect x={620} y={56} width={80} height={1044} fill="url(#land-corner-right)" pointerEvents="none" />
    </svg>
  );
}
