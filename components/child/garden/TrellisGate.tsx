// components/child/garden/TrellisGate.tsx
//
// Rose-covered wooden trellis archway at the edge of a grow screen —
// the way through to (or back from) the garden beyond. Rendered inside
// the scene's SVG; the caller positions it with a wrapping transform.
//
// Locked: the opening is overgrown with a curtain of vines and a small
// lock pendant hangs from the arch. Unlocked: the opening shows a warm
// glimpse of the meadow beyond and the label brightens.
//
// Drawn centered on x=0 with the ground line at y=0; roughly 96 wide
// and 120 tall. `flip` mirrors it for a west-edge (return) gate.

'use client';

import { motion } from 'framer-motion';

const WOOD = '#8A6238';
const WOOD_DARK = '#5A3B1F';
const LEAF = '#5C7E4F';
const LEAF_DARK = '#3D5C32';
const ROSE = '#E8708C';

export default function TrellisGate({
  locked, label, onTap, reducedMotion = false, flip = false,
}: {
  locked: boolean;
  label: string;
  onTap: () => void;
  reducedMotion?: boolean;
  flip?: boolean;
}) {
  return (
    <g
      transform={flip ? 'scale(-1, 1)' : undefined}
      style={{ cursor: 'pointer', touchAction: 'manipulation' }}
      onClick={onTap}
      aria-label={locked ? `trellis gate locked — ${label}` : `through the trellis ${label}`}
    >
      {/* generous invisible tap target (includes the hanging sign) */}
      <rect x={-56} y={-160} width={112} height={172} fill="transparent" />

      {/* ground shadow */}
      <ellipse cx={0} cy={2} rx={44} ry={6} fill="#000" opacity={0.2} />

      {/* glimpse of the meadow beyond, framed by the arch (unlocked) —
          or a dim hedge wall (locked) */}
      <path
        d="M -32 0 L -32 -72 Q -32 -104 0 -104 Q 32 -104 32 -72 L 32 0 Z"
        fill={locked ? '#4A5C3A' : '#D7EFB9'}
        opacity={locked ? 0.9 : 0.95}
      />
      {!locked && (
        <>
          {/* far meadow + path teasing what's beyond — the path TAPERS
              as it recedes through the arch, like perspective, instead
              of a uniform vertical stripe */}
          <path d="M -32 0 L -32 -34 Q 0 -44 32 -34 L 32 0 Z" fill="#AED29A" />
          <path d={`M -16 0
                    C -10 -16, -3 -28, 3 -38
                    Q 5 -43 5 -48
                    L 10 -48
                    Q 11 -42 11 -36
                    C 12 -24, 13 -12, 14 0 Z`}
                fill="#EAD2A8" opacity={0.92} />
          {/* stepping stones shrinking into the distance */}
          <ellipse cx={0} cy={-8} rx={6.5} ry={3} fill="#C9B489" stroke="#8A7050" strokeWidth={0.8} />
          <ellipse cx={4} cy={-22} rx={4.8} ry={2.2} fill="#C9B489" stroke="#8A7050" strokeWidth={0.7} />
          <ellipse cx={6.5} cy={-34} rx={3.4} ry={1.6} fill="#C9B489" stroke="#8A7050" strokeWidth={0.6} />
          {/* soft golden invitation glow */}
          {reducedMotion ? (
            <path d="M -32 0 L -32 -72 Q -32 -104 0 -104 Q 32 -104 32 -72 L 32 0 Z"
                  fill="#FFE89A" opacity={0.18} />
          ) : (
            <motion.path
              d="M -32 0 L -32 -72 Q -32 -104 0 -104 Q 32 -104 32 -72 L 32 0 Z"
              fill="#FFE89A"
              animate={{ opacity: [0.1, 0.28, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </>
      )}

      {/* side posts with lattice cross-hatch */}
      {[-1, 1].map(side => (
        <g key={side} transform={`scale(${side}, 1)`}>
          <rect x={30} y={-96} width={12} height={96} rx={2}
                fill={WOOD} stroke={WOOD_DARK} strokeWidth={1.3} />
          {/* lattice diagonals */}
          {[-88, -72, -56, -40, -24].map(ly => (
            <g key={ly}>
              <line x1={31} y1={ly} x2={41} y2={ly + 12} stroke={WOOD_DARK} strokeWidth={0.8} opacity={0.55} />
              <line x1={41} y1={ly} x2={31} y2={ly + 12} stroke={WOOD_DARK} strokeWidth={0.8} opacity={0.55} />
            </g>
          ))}
        </g>
      ))}

      {/* arched top beam */}
      <path d="M -42 -88 Q 0 -126 42 -88 L 42 -96 Q 0 -134 -42 -96 Z"
            fill={WOOD} stroke={WOOD_DARK} strokeWidth={1.3} strokeLinejoin="round" />
      {/* cross slats under the arch */}
      {[-30, -15, 0, 15, 30].map(sx => (
        <line key={sx} x1={sx} y1={sx === 0 ? -122 : -114 - Math.abs(sx) * 0.1}
              x2={sx} y2={sx === 0 ? -112 : -104 - Math.abs(sx) * 0.1}
              stroke={WOOD_DARK} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      ))}

      {/* climbing roses — leaves winding up both posts + over the arch */}
      {[
        { x: -38, y: -20, s: 1 },  { x: -36, y: -46, s: 0.85 }, { x: -40, y: -70, s: 1.05 },
        { x: -28, y: -96, s: 0.9 }, { x: 0, y: -116, s: 1 },     { x: 28, y: -96, s: 0.9 },
        { x: 40, y: -70, s: 1.05 }, { x: 36, y: -46, s: 0.85 },  { x: 38, y: -20, s: 1 },
      ].map((v, i) => (
        <g key={i} transform={`translate(${v.x}, ${v.y}) scale(${v.s})`}>
          <ellipse cx={-3} cy={0} rx={4} ry={2.4} fill={LEAF} stroke={LEAF_DARK}
                   strokeWidth={0.5} transform="rotate(-30)" />
          <ellipse cx={3} cy={1} rx={3.4} ry={2} fill={LEAF} stroke={LEAF_DARK}
                   strokeWidth={0.5} transform="rotate(28)" />
          {i % 2 === 0 && (
            <g>
              <circle cx={1} cy={-2} r={2.6} fill={ROSE} stroke="#B34A64" strokeWidth={0.6} />
              <circle cx={1} cy={-2} r={1.1} fill="#F5A8C2" />
            </g>
          )}
        </g>
      ))}

      {/* LOCKED: vine curtain across the opening + lock pendant */}
      {locked && (
        <g>
          {[-24, -12, 0, 12, 24].map((vx, i) => (
            <path key={vx}
                  d={`M ${vx} ${-100 + (i % 2) * 4}
                      Q ${vx + (i % 2 === 0 ? 7 : -7)} ${-70} ${vx - (i % 2 === 0 ? 4 : -4)} ${-44}
                      Q ${vx + (i % 2 === 0 ? 5 : -5)} ${-22} ${vx} ${-6}`}
                  stroke={LEAF_DARK} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.9} />
          ))}
          {[[-20, -62], [-8, -34], [4, -76], [16, -48], [24, -18], [-26, -14], [8, -12]].map(([lx, ly], i) => (
            <ellipse key={i} cx={lx} cy={ly} rx={4.4} ry={2.6} fill={LEAF} stroke={LEAF_DARK}
                     strokeWidth={0.5} transform={`rotate(${(i * 47) % 80 - 40} ${lx} ${ly})`} />
          ))}
          {/* lock pendant hanging from the arch */}
          <line x1={0} y1={-110} x2={0} y2={-92} stroke="#B8A25C" strokeWidth={1.4} />
          <rect x={-6} y={-92} width={12} height={10} rx={2.5}
                fill="#D9B84A" stroke="#8A7030" strokeWidth={1} />
          <path d="M -3.5 -92 L -3.5 -96 Q -3.5 -99.5 0 -99.5 Q 3.5 -99.5 3.5 -96 L 3.5 -92"
                stroke="#8A7030" strokeWidth={1.6} fill="none" />
          <circle cx={0} cy={-87.5} r={1.3} fill="#8A7030" />
        </g>
      )}

      {/* label board hanging over the arch peak — centered on the gate
          so it can never fall off the screen edge, counter-flipped so
          text stays readable on a west gate. The arrow points TOWARD
          the gate below it. */}
      <g transform={flip ? 'scale(-1, 1)' : undefined}>
        {/* two little chains from the arch up to the board */}
        <line x1={-14} y1={-126} x2={-14} y2={-134} stroke={WOOD_DARK} strokeWidth={1.2} />
        <line x1={14} y1={-126} x2={14} y2={-134} stroke={WOOD_DARK} strokeWidth={1.2} />
        <rect x={-37} y={-154} width={74} height={20} rx={5}
              fill={locked ? 'rgba(107, 68, 35, 0.92)' : 'rgba(255, 250, 242, 0.92)'}
              stroke={WOOD_DARK} strokeWidth={1.2} />
        <text y={-141} textAnchor="middle" fontSize={9} fontStyle="italic" fontWeight={700}
              fill={locked ? '#fffaf2' : '#6b4423'}>
          {locked ? `🔒 ${label}` : flip ? `← ${label}` : `${label} →`}
        </text>
      </g>
    </g>
  );
}
