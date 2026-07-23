// components/child/garden/BeyondPlantStages.tsx
//
// Stage art for the beyond-the-trellis plants (orchard, berry patch,
// herb & tea garden, moon garden). Same hand-drawn language as
// PlantStageIllustration.tsx — naturalist palette, dark bark outlines,
// slight asymmetry — split into its own file so that one doesn't keep
// growing. PlantStageIllustration's switch falls through to
// BeyondPlantStageIllustration for any code it doesn't know.
//
// Families share early stages (a seed is a seed) with per-plant
// palettes; every MATURE stage is bespoke — that's the plant the child
// actually watches for.

'use client';

const STROKE = '#5A3B1F';

interface StageProps { x: number; y: number; size: number; }

// ─── SHARED EARLY STAGES ────────────────────────────────────────────────

function SeedDot({ x, y, size, color = '#3F2614', wide = false }: StageProps & { color?: string; wide?: boolean }) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * (wide ? 5 : 4)} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <path d={`M 0 ${-r} Q ${r * 0.6} 0 0 ${r} Q ${-r * 0.6} 0 0 ${-r} Z`}
            fill={color} stroke={STROKE} strokeWidth={0.5} />
    </g>
  );
}

function SproutPair({ x, y, size, leafA = '#95B88F', leafB = '#7BA46F', round = false }: StageProps & { leafA?: string; leafB?: string; round?: boolean }) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.75} stroke="#7BA46F" strokeWidth={1.5} strokeLinecap="round" />
      {round ? (
        <>
          <circle cx={-size * 0.06} cy={-h * 0.85} r={size * 0.07} fill={leafA} stroke={STROKE} strokeWidth={0.8} />
          <circle cx={size * 0.06} cy={-h * 0.85} r={size * 0.07} fill={leafB} stroke={STROKE} strokeWidth={0.8} />
        </>
      ) : (
        <>
          <ellipse cx={-size * 0.06} cy={-h * 0.88} rx={size * 0.05} ry={size * 0.08} fill={leafA}
                   stroke={STROKE} strokeWidth={0.8} transform={`rotate(-28 ${-size * 0.06} ${-h * 0.88})`} />
          <ellipse cx={size * 0.06} cy={-h * 0.88} rx={size * 0.05} ry={size * 0.08} fill={leafB}
                   stroke={STROKE} strokeWidth={0.8} transform={`rotate(28 ${size * 0.06} ${-h * 0.88})`} />
        </>
      )}
    </g>
  );
}

// ─── ORCHARD TREES ──────────────────────────────────────────────────────
// twig + young are shared with a palette; matures are bespoke.

function TreeTwig({ x, y, size, leaf = '#7BA46F' }: StageProps & { leaf?: string }) {
  const h = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <path d={`M ${-size * 0.025} ${size * 0.06} L ${-size * 0.02} ${-h * 0.85} L ${size * 0.02} ${-h * 0.85} L ${size * 0.025} ${size * 0.06} Z`}
            fill="#8B5A2B" stroke={STROKE} strokeWidth={1} />
      <line x1={0} y1={-h * 0.6} x2={size * 0.1} y2={-h * 0.85} stroke="#8B5A2B" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={0} y1={-h * 0.7} x2={-size * 0.08} y2={-h * 0.95} stroke="#8B5A2B" strokeWidth={1.2} strokeLinecap="round" />
      <ellipse cx={size * 0.11} cy={-h * 0.88} rx={size * 0.06} ry={size * 0.04} fill={leaf}
               stroke={STROKE} strokeWidth={0.7} transform={`rotate(35 ${size * 0.11} ${-h * 0.88})`} />
      <ellipse cx={-size * 0.09} cy={-h * 0.98} rx={size * 0.06} ry={size * 0.04} fill="#95B88F"
               stroke={STROKE} strokeWidth={0.7} transform={`rotate(-35 ${-size * 0.09} ${-h * 0.98})`} />
    </g>
  );
}

function TreeYoung({ x, y, size, c1 = '#5C7E4F', c2 = '#7BA46F', hi = '#A2C794' }: StageProps & { c1?: string; c2?: string; hi?: string }) {
  const r = size * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 1.0} rx={r * 0.9} ry={r * 0.16} fill="#6B4423" opacity={0.3} />
      <path d={`M ${-r * 0.12} ${r * 0.9} L ${-r * 0.08} ${-r * 0.1} L ${r * 0.08} ${-r * 0.1} L ${r * 0.12} ${r * 0.9} Z`}
            fill="#8B5A2B" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={-r * 0.45} cy={-r * 0.25} r={r * 0.4} fill={c1} stroke={STROKE} strokeWidth={1.1} />
      <circle cx={r * 0.45} cy={-r * 0.25} r={r * 0.4} fill={c2} stroke={STROKE} strokeWidth={1.1} />
      <circle cx={0} cy={-r * 0.55} r={r * 0.45} fill={c2} stroke={STROKE} strokeWidth={1.1} />
      <circle cx={-r * 0.15} cy={-r * 0.65} r={r * 0.12} fill={hi} opacity={0.7} />
    </g>
  );
}

function PeachMature({ x, y, size }: StageProps) {
  // Rounded warm-green canopy heavy with blushing peaches
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      <path d={`M ${-r * 0.12} ${r * 0.85} L ${-r * 0.08} ${-r * 0.05} L ${r * 0.08} ${-r * 0.05} L ${r * 0.12} ${r * 0.85} Z`}
            fill="#8B5A2B" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={-r * 0.45} cy={-r * 0.2} r={r * 0.42} fill="#6B9459" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={r * 0.45} cy={-r * 0.2} r={r * 0.42} fill="#84AC6E" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={0} cy={-r * 0.58} r={r * 0.44} fill="#84AC6E" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={-r * 0.2} cy={-r * 0.68} r={r * 0.1} fill="#B0CE96" opacity={0.75} />
      {/* three fuzzy peaches with a blush cleft */}
      {[{ px: -r * 0.5, py: -r * 0.02 }, { px: r * 0.3, py: -r * 0.5 }, { px: r * 0.5, py: r * 0.02 }].map((p, i) => (
        <g key={i}>
          <circle cx={p.px} cy={p.py} r={r * 0.15} fill="#F2A05E" stroke={STROKE} strokeWidth={1} />
          <path d={`M ${p.px} ${p.py - r * 0.14} Q ${p.px + r * 0.02} ${p.py} ${p.px} ${p.py + r * 0.13}`}
                stroke="#D97C3E" strokeWidth={0.7} fill="none" opacity={0.7} />
          <circle cx={p.px - r * 0.05} cy={p.py - r * 0.05} r={r * 0.05} fill="#F8C08A" opacity={0.8} />
        </g>
      ))}
    </g>
  );
}

function PawpawMature({ x, y, size }: StageProps) {
  // Pyramidal canopy of BIG drooping tropical leaves + oblong fruit pair
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      <path d={`M ${-r * 0.1} ${r * 0.85} L ${-r * 0.07} ${-r * 0.15} L ${r * 0.07} ${-r * 0.15} L ${r * 0.1} ${r * 0.85} Z`}
            fill="#7A5230" stroke={STROKE} strokeWidth={1.2} />
      {/* drooping leaf fans — layered, larger at the bottom (pyramid) */}
      {[
        { ly: -r * 0.85, s: 0.55 }, { ly: -r * 0.5, s: 0.8 }, { ly: -r * 0.12, s: 1 },
      ].map((tier, t) => (
        <g key={t}>
          {[-1, 1].map(side => (
            <ellipse key={side} cx={side * r * 0.38 * tier.s} cy={tier.ly + r * 0.14 * tier.s}
                     rx={r * 0.4 * tier.s} ry={r * 0.16 * tier.s}
                     fill={t % 2 === 0 ? '#4F7548' : '#5E8455'} stroke={STROKE} strokeWidth={1.1}
                     transform={`rotate(${side * 24} ${side * r * 0.38 * tier.s} ${tier.ly})`} />
          ))}
          <ellipse cx={0} cy={tier.ly - r * 0.05} rx={r * 0.16 * tier.s} ry={r * 0.3 * tier.s}
                   fill="#5E8455" stroke={STROKE} strokeWidth={1.1} />
        </g>
      ))}
      {/* pawpaw fruit — two green-brown oblongs hanging together */}
      <g transform={`translate(${r * 0.3}, ${-r * 0.05})`}>
        <line x1={0} y1={-r * 0.14} x2={0} y2={-r * 0.02} stroke={STROKE} strokeWidth={0.9} />
        <ellipse cx={-r * 0.07} cy={r * 0.08} rx={r * 0.09} ry={r * 0.16} fill="#9CA86B"
                 stroke={STROKE} strokeWidth={1} transform={`rotate(-10 ${-r * 0.07} ${r * 0.08})`} />
        <ellipse cx={r * 0.08} cy={r * 0.06} rx={r * 0.08} ry={r * 0.14} fill="#8B9A5E"
                 stroke={STROKE} strokeWidth={1} transform={`rotate(12 ${r * 0.08} ${r * 0.06})`} />
        <ellipse cx={-r * 0.1} cy={r * 0.02} rx={r * 0.03} ry={r * 0.06} fill="#B5BE85" opacity={0.8} />
      </g>
    </g>
  );
}

function PlumMature({ x, y, size }: StageProps) {
  // Cool blue-green canopy with dusty purple plums
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      <path d={`M ${-r * 0.12} ${r * 0.85} L ${-r * 0.08} ${-r * 0.05} L ${r * 0.08} ${-r * 0.05} L ${r * 0.12} ${r * 0.85} Z`}
            fill="#8B5A2B" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={-r * 0.42} cy={-r * 0.22} r={r * 0.4} fill="#5F8168" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={r * 0.42} cy={-r * 0.22} r={r * 0.4} fill="#729478" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={0} cy={-r * 0.56} r={r * 0.44} fill="#729478" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={-r * 0.18} cy={-r * 0.66} r={r * 0.1} fill="#9CB89E" opacity={0.75} />
      {/* plums — round, purple, with the silvery "bloom" dust */}
      {[{ px: -r * 0.45, py: 0 }, { px: r * 0.15, py: -r * 0.42 }, { px: r * 0.48, py: -r * 0.05 }].map((p, i) => (
        <g key={i}>
          <circle cx={p.px} cy={p.py} r={r * 0.13} fill="#7A4A84" stroke={STROKE} strokeWidth={1} />
          <ellipse cx={p.px - r * 0.04} cy={p.py - r * 0.05} rx={r * 0.05} ry={r * 0.035}
                   fill="#B9A6CE" opacity={0.75} />
        </g>
      ))}
    </g>
  );
}

function PersimmonMature({ x, y, size }: StageProps) {
  // Autumn-toned spready canopy hung with orange lanterns
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.0} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      <path d={`M ${-r * 0.12} ${r * 0.85} L ${-r * 0.08} ${-r * 0.05} L ${r * 0.08} ${-r * 0.05} L ${r * 0.12} ${r * 0.85} Z`}
            fill="#6E4A28" stroke={STROKE} strokeWidth={1.2} />
      {/* wide, slightly sparse canopy — autumn green-gold */}
      <circle cx={-r * 0.52} cy={-r * 0.15} r={r * 0.38} fill="#8FA060" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={r * 0.52} cy={-r * 0.15} r={r * 0.38} fill="#A3B06A" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={0} cy={-r * 0.5} r={r * 0.42} fill="#A3B06A" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={-r * 0.15} cy={-r * 0.6} r={r * 0.1} fill="#C4CC8C" opacity={0.75} />
      {/* persimmons — bright orange with a little green calyx cap */}
      {[{ px: -r * 0.5, py: r * 0.08 }, { px: 0, py: -r * 0.12 }, { px: r * 0.5, py: r * 0.05 }].map((p, i) => (
        <g key={i}>
          <line x1={p.px} y1={p.py - r * 0.16} x2={p.px} y2={p.py - r * 0.08} stroke={STROKE} strokeWidth={0.9} />
          <circle cx={p.px} cy={p.py} r={r * 0.13} fill="#E8823C" stroke={STROKE} strokeWidth={1} />
          <path d={`M ${p.px - r * 0.06} ${p.py - r * 0.1} L ${p.px} ${p.py - r * 0.14} L ${p.px + r * 0.06} ${p.py - r * 0.1} L ${p.px} ${p.py - r * 0.07} Z`}
                fill="#5C7E4F" stroke={STROKE} strokeWidth={0.6} />
          <circle cx={p.px - r * 0.04} cy={p.py - r * 0.03} r={r * 0.04} fill="#F5A868" opacity={0.85} />
        </g>
      ))}
    </g>
  );
}

function FigMature({ x, y, size }: StageProps) {
  // Broad low canopy with hand-shaped lobed leaves + teardrop figs
  const r = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 1.05} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      {/* short forked trunk — figs sprawl */}
      <path d={`M ${-r * 0.14} ${r * 0.85} L ${-r * 0.06} ${r * 0.1} L ${r * 0.06} ${r * 0.1} L ${r * 0.14} ${r * 0.85} Z`}
            fill="#9B8468" stroke={STROKE} strokeWidth={1.2} />
      <path d={`M ${-r * 0.04} ${r * 0.2} L ${-r * 0.3} ${-r * 0.15}`} stroke="#9B8468" strokeWidth={r * 0.09} strokeLinecap="round" />
      <path d={`M ${r * 0.04} ${r * 0.2} L ${r * 0.3} ${-r * 0.15}`} stroke="#9B8468" strokeWidth={r * 0.09} strokeLinecap="round" />
      {/* wide canopy */}
      <circle cx={-r * 0.5} cy={-r * 0.25} r={r * 0.36} fill="#5E8455" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={r * 0.5} cy={-r * 0.25} r={r * 0.36} fill="#6E9463" stroke={STROKE} strokeWidth={1.2} />
      <circle cx={0} cy={-r * 0.48} r={r * 0.42} fill="#6E9463" stroke={STROKE} strokeWidth={1.2} />
      {/* signature lobed leaves standing proud of the canopy */}
      {[{ lx: -r * 0.25, ly: -r * 0.78 }, { lx: r * 0.35, ly: -r * 0.62 }].map((l, i) => (
        <g key={i} transform={`translate(${l.lx}, ${l.ly})`}>
          {[-30, 0, 30].map(a => (
            <ellipse key={a} cx={0} cy={-r * 0.07} rx={r * 0.045} ry={r * 0.11}
                     fill="#7EA671" stroke={STROKE} strokeWidth={0.7} transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
      {/* figs — purple-brown teardrops tucked at branch tips */}
      {[{ px: -r * 0.48, py: r * 0.02 }, { px: r * 0.5, py: -r * 0.02 }].map((p, i) => (
        <g key={i}>
          <path d={`M ${p.px} ${p.py - r * 0.14} Q ${p.px + r * 0.1} ${p.py - r * 0.02} ${p.px} ${p.py + r * 0.1}
                    Q ${p.px - r * 0.1} ${p.py - r * 0.02} ${p.px} ${p.py - r * 0.14} Z`}
                fill="#7A5470" stroke={STROKE} strokeWidth={1} />
          <circle cx={p.px - r * 0.03} cy={p.py - r * 0.02} r={r * 0.035} fill="#A57E9C" opacity={0.8} />
        </g>
      ))}
    </g>
  );
}

// ─── BERRY PATCH ────────────────────────────────────────────────────────
// Shared cane stage; bespoke berry-laden matures.

function CaneStage({ x, y, size, arch = true, color = '#6B8E5A' }: StageProps & { arch?: boolean; color?: string }) {
  const h = size * 0.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.2} ry={size * 0.045} fill="#6B4423" opacity={0.4} />
      {arch ? (
        <>
          <path d={`M ${-size * 0.14} ${size * 0.05} Q ${-size * 0.1} ${-h} ${size * 0.1} ${-h * 0.5} `}
                stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <path d={`M ${size * 0.12} ${size * 0.05} Q ${size * 0.12} ${-h * 0.9} ${-size * 0.06} ${-h * 0.55}`}
                stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={-size * 0.08} y1={size * 0.05} x2={-size * 0.12} y2={-h * 0.8} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <line x1={size * 0.06} y1={size * 0.05} x2={size * 0.1} y2={-h * 0.75} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
          <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.9} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
      {[[-0.1, -0.55], [0.05, -0.75], [0.1, -0.4]].map(([fx, fy], i) => (
        <ellipse key={i} cx={size * fx} cy={h * fy * 2 * 0.5} rx={size * 0.05} ry={size * 0.035}
                 fill={i % 2 ? '#7BA46F' : '#95B88F'} stroke={STROKE} strokeWidth={0.7}
                 transform={`rotate(${i * 40 - 40} ${size * fx} ${h * fy})`} />
      ))}
    </g>
  );
}

function berryLeaf(cx: number, cy: number, rot: number, r: number, fill: string) {
  return <ellipse cx={cx} cy={cy} rx={r * 0.13} ry={r * 0.08} fill={fill} stroke={STROKE} strokeWidth={0.7}
                  transform={`rotate(${rot} ${cx} ${cy})`} />;
}

function RaspberryBerries({ x, y, size }: StageProps) {
  // Arched canes dotted with bumpy red berries
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.6} ry={r * 0.1} fill="#6B4423" opacity={0.35} />
      <path d={`M ${-r * 0.5} ${r * 0.5} Q ${-r * 0.35} ${-r * 0.75} ${r * 0.45} ${-r * 0.35}`}
            stroke="#7A5C40" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M ${r * 0.45} ${r * 0.5} Q ${r * 0.45} ${-r * 0.55} ${-r * 0.3} ${-r * 0.5}`}
            stroke="#8A6B48" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {berryLeaf(-r * 0.4, -r * 0.35, -30, r, '#7BA46F')}
      {berryLeaf(r * 0.1, -r * 0.62, 15, r, '#95B88F')}
      {berryLeaf(r * 0.42, -r * 0.15, 40, r, '#7BA46F')}
      {/* bumpy berries — clustered circles */}
      {[{ bx: -r * 0.15, by: -r * 0.48 }, { bx: r * 0.35, by: -r * 0.38 }, { bx: -r * 0.42, by: -r * 0.1 }].map((b, i) => (
        <g key={i}>
          {[[0, 0], [-0.05, 0.06], [0.05, 0.06], [0, 0.11]].map(([dx, dy], j) => (
            <circle key={j} cx={b.bx + r * dx} cy={b.by + r * dy} r={r * 0.045}
                    fill={j % 2 ? '#D14B5A' : '#C13A4C'} stroke={STROKE} strokeWidth={0.5} />
          ))}
          <circle cx={b.bx - r * 0.02} cy={b.by + r * 0.02} r={r * 0.015} fill="#F2909A" />
        </g>
      ))}
    </g>
  );
}

function BlackberryBerries({ x, y, size }: StageProps) {
  // Rambling prickled canes with glossy dark berries (one still red)
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.62} ry={r * 0.1} fill="#6B4423" opacity={0.35} />
      <path d={`M ${-r * 0.5} ${r * 0.5} Q ${-r * 0.2} ${-r * 0.8} ${r * 0.5} ${-r * 0.3}`}
            stroke="#5E4A38" strokeWidth={2.1} fill="none" strokeLinecap="round" />
      <path d={`M ${r * 0.4} ${r * 0.5} Q ${r * 0.5} ${-r * 0.4} ${-r * 0.25} ${-r * 0.55}`}
            stroke="#6E5A44" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* tiny prickle ticks along the main cane */}
      {[[-0.36, -0.18], [-0.15, -0.48], [0.15, -0.56], [0.38, -0.4]].map(([fx, fy], i) => (
        <line key={i} x1={r * fx} y1={r * fy} x2={r * (fx + 0.045)} y2={r * (fy - 0.05)}
              stroke="#5E4A38" strokeWidth={0.8} strokeLinecap="round" />
      ))}
      {berryLeaf(-r * 0.35, -r * 0.42, -25, r, '#6B8E5A')}
      {berryLeaf(r * 0.3, -r * 0.55, 20, r, '#7BA46F')}
      {/* berry clusters — glossy near-black drupelets */}
      {[{ bx: r * 0.42, by: -r * 0.18, ripe: true }, { bx: -r * 0.1, by: -r * 0.6, ripe: true },
        { bx: -r * 0.45, by: -r * 0.05, ripe: false }].map((b, i) => (
        <g key={i}>
          {[[0, 0], [-0.05, 0.06], [0.05, 0.06], [0, 0.12]].map(([dx, dy], j) => (
            <circle key={j} cx={b.bx + r * dx} cy={b.by + r * dy} r={r * 0.045}
                    fill={b.ripe ? (j % 2 ? '#3A2C4A' : '#2C2038') : (j % 2 ? '#C1554C' : '#B04840')}
                    stroke={STROKE} strokeWidth={0.5} />
          ))}
          <circle cx={b.bx - r * 0.02} cy={b.by + r * 0.02} r={r * 0.016} fill="#FFFFFF" opacity={0.7} />
        </g>
      ))}
    </g>
  );
}

function GooseberryBerries({ x, y, size }: StageProps) {
  // Round thorny bush hung with translucent striped green berries
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.6} ry={r * 0.1} fill="#6B4423" opacity={0.35} />
      <circle cx={-r * 0.25} cy={-r * 0.1} r={r * 0.32} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={r * 0.25} cy={-r * 0.1} r={r * 0.32} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={0} cy={-r * 0.32} r={r * 0.34} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} />
      <circle cx={-r * 0.1} cy={-r * 0.42} r={r * 0.09} fill="#A2C794" opacity={0.7} />
      {/* thorn ticks on the silhouette */}
      {[[-0.5, -0.2], [0.52, -0.15], [0.2, -0.6], [-0.28, -0.58]].map(([fx, fy], i) => (
        <line key={i} x1={r * fx} y1={r * fy} x2={r * (fx * 1.14)} y2={r * (fy * 1.16)}
              stroke="#5E4A38" strokeWidth={0.9} strokeLinecap="round" />
      ))}
      {/* translucent berries with visible stripes */}
      {[{ bx: -r * 0.3, by: r * 0.12 }, { bx: 0, by: -r * 0.05 }, { bx: r * 0.32, by: r * 0.1 }].map((b, i) => (
        <g key={i}>
          <line x1={b.bx} y1={b.by - r * 0.12} x2={b.bx} y2={b.by - r * 0.05} stroke="#5E7A4A" strokeWidth={0.8} />
          <circle cx={b.bx} cy={b.by} r={r * 0.1} fill="#C4D98A" stroke="#7A8F50" strokeWidth={0.9} />
          {[-0.05, 0, 0.05].map((sx, j) => (
            <path key={j} d={`M ${b.bx + r * sx} ${b.by - r * 0.09} Q ${b.bx + r * sx * 1.6} ${b.by} ${b.bx + r * sx} ${b.by + r * 0.09}`}
                  stroke="#A3B86A" strokeWidth={0.5} fill="none" opacity={0.85} />
          ))}
          <circle cx={b.bx - r * 0.03} cy={b.by - r * 0.03} r={r * 0.025} fill="#EAF2C4" opacity={0.9} />
        </g>
      ))}
    </g>
  );
}

function CurrantBerries({ x, y, size }: StageProps) {
  // Upright bush with dangling strings ("strigs") of ruby beads
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.58} ry={r * 0.1} fill="#6B4423" opacity={0.35} />
      {[[-0.3, -0.55], [0, -0.7], [0.3, -0.5]].map(([fx, fy], i) => (
        <line key={i} x1={r * fx * 0.3} y1={r * 0.5} x2={r * fx} y2={r * fy}
              stroke="#7A5C40" strokeWidth={1.7} strokeLinecap="round" />
      ))}
      {berryLeaf(-r * 0.32, -r * 0.58, -20, r * 1.3, '#6B8E5A')}
      {berryLeaf(0, -r * 0.74, 5, r * 1.3, '#7BA46F')}
      {berryLeaf(r * 0.32, -r * 0.54, 25, r * 1.3, '#6B8E5A')}
      {/* dangling strigs of shiny red beads */}
      {[{ sx: -r * 0.22, sy: -r * 0.4 }, { sx: r * 0.05, sy: -r * 0.5 }, { sx: r * 0.3, sy: -r * 0.32 }].map((s, i) => (
        <g key={i}>
          <path d={`M ${s.sx} ${s.sy} q ${r * 0.03} ${r * 0.14} 0 ${r * 0.3}`}
                stroke="#5E7A4A" strokeWidth={0.8} fill="none" />
          {[0.1, 0.2, 0.3].map((d, j) => (
            <g key={j}>
              <circle cx={s.sx + r * 0.015} cy={s.sy + r * d} r={r * 0.05}
                      fill={j === 0 ? '#E05A5C' : '#D9484A'} stroke={STROKE} strokeWidth={0.5} />
              <circle cx={s.sx - r * 0.005} cy={s.sy + r * (d - 0.015)} r={r * 0.015} fill="#F5AFB0" />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

function ElderberryBerries({ x, y, size }: StageProps) {
  // Tall shrub topped with flat umbels of tiny near-black berries
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.6} ry={r * 0.1} fill="#6B4423" opacity={0.35} />
      {[[-0.25, -0.5], [0, -0.65], [0.28, -0.48]].map(([fx, fy], i) => (
        <line key={i} x1={r * fx * 0.25} y1={r * 0.5} x2={r * fx} y2={r * fy}
              stroke="#6E5A44" strokeWidth={1.8} strokeLinecap="round" />
      ))}
      {/* long feather leaves */}
      {[[-0.4, -0.3, -35], [0.42, -0.28, 35], [-0.15, -0.5, -12], [0.18, -0.52, 14]].map(([fx, fy, rot], i) => (
        <ellipse key={i} cx={r * fx} cy={r * fy} rx={r * 0.2} ry={r * 0.07}
                 fill={i % 2 ? '#6B8E5A' : '#7BA46F'} stroke={STROKE} strokeWidth={0.7}
                 transform={`rotate(${rot} ${r * fx} ${r * fy})`} />
      ))}
      {/* flat berry umbels — stems fanning up to a plate of dark dots */}
      {[{ ux: -r * 0.22, uy: -r * 0.62 }, { ux: r * 0.2, uy: -r * 0.68 }].map((u, i) => (
        <g key={i}>
          {[-0.12, -0.04, 0.04, 0.12].map((d, j) => (
            <line key={j} x1={u.ux} y1={u.uy + r * 0.1} x2={u.ux + r * d} y2={u.uy}
                  stroke="#8A6B48" strokeWidth={0.6} />
          ))}
          {[-0.14, -0.07, 0, 0.07, 0.14].map((d, j) => (
            <circle key={j} cx={u.ux + r * d} cy={u.uy - r * 0.015 * (j % 2)} r={r * 0.035}
                    fill={j % 2 ? '#3A2C4A' : '#2E2240'} stroke={STROKE} strokeWidth={0.4} />
          ))}
          <circle cx={u.ux - r * 0.05} cy={u.uy - r * 0.02} r={r * 0.012} fill="#B9A6CE" opacity={0.9} />
        </g>
      ))}
    </g>
  );
}

// ─── HERB & TEA GARDEN ──────────────────────────────────────────────────
// Shared clump stage (leafy mound, palette per herb); bespoke blooms.

function HerbClump({ x, y, size, leaf = '#7BA46F', leafHi = '#95B88F', needle = false }: StageProps & { leaf?: string; leafHi?: string; needle?: boolean }) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.3} rx={r * 0.5} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {needle ? (
        [[-0.25, -0.5], [-0.08, -0.62], [0.1, -0.58], [0.26, -0.45]].map(([fx, fy], i) => (
          <g key={i}>
            <line x1={r * fx * 0.4} y1={r * 0.28} x2={r * fx} y2={r * fy}
                  stroke={leaf} strokeWidth={1.6} strokeLinecap="round" />
            {[0.3, 0.55, 0.8].map((t, j) => (
              <line key={j}
                    x1={r * (fx * 0.4 + (fx - fx * 0.4) * t)} y1={r * (0.28 + (fy - 0.28) * t)}
                    x2={r * (fx * 0.4 + (fx - fx * 0.4) * t) + r * 0.07} y2={r * (0.28 + (fy - 0.28) * t) - r * 0.03}
                    stroke={leafHi} strokeWidth={0.8} strokeLinecap="round" />
            ))}
          </g>
        ))
      ) : (
        [0, 60, 120, 180, 240, 300].map(a => (
          <ellipse key={a} cx={0} cy={-r * 0.28} rx={r * 0.16} ry={r * 0.3}
                   fill={a % 120 === 0 ? leaf : leafHi} stroke={STROKE} strokeWidth={0.9}
                   transform={`rotate(${a})`} />
        ))
      )}
    </g>
  );
}

function BasilBloom({ x, y, size }: StageProps) {
  // Glossy bushy mound with white flower-spike tips
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.35} rx={r * 0.55} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {[[-0.3, -0.15], [0.3, -0.15], [0, -0.05], [-0.15, -0.38], [0.15, -0.38]].map(([fx, fy], i) => (
        <g key={i}>
          <ellipse cx={r * fx} cy={r * fy} rx={r * 0.17} ry={r * 0.13}
                   fill={i % 2 ? '#6FA05C' : '#7FB06A'} stroke={STROKE} strokeWidth={0.9} />
          <path d={`M ${r * fx - r * 0.1} ${r * fy} Q ${r * fx} ${r * (fy - 0.06)} ${r * fx + r * 0.1} ${r * fy}`}
                stroke="#528048" strokeWidth={0.6} fill="none" opacity={0.8} />
        </g>
      ))}
      <circle cx={-r * 0.2} cy={-r * 0.32} r={r * 0.05} fill="#A6CC90" opacity={0.85} />
      {/* white flower spikes poking from the top */}
      {[[-0.12, -0.52], [0.1, -0.56]].map(([fx, fy], i) => (
        <g key={i}>
          <line x1={r * fx} y1={r * (fy + 0.14)} x2={r * fx} y2={r * fy} stroke="#528048" strokeWidth={1} />
          {[0, 0.05, 0.1].map((d, j) => (
            <circle key={j} cx={r * fx} cy={r * (fy + d)} r={r * 0.028} fill="#F5F2E4" stroke="#B9B49A" strokeWidth={0.4} />
          ))}
        </g>
      ))}
    </g>
  );
}

function LavenderBloom({ x, y, size }: StageProps) {
  // Grey-green fan of stems, each tipped with a purple spike
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.35} rx={r * 0.5} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {[[-0.32, -0.35], [-0.16, -0.52], [0, -0.6], [0.16, -0.52], [0.32, -0.35]].map(([fx, fy], i) => (
        <g key={i}>
          <line x1={r * fx * 0.25} y1={r * 0.32} x2={r * fx} y2={r * fy}
                stroke="#9BAF9A" strokeWidth={1.3} strokeLinecap="round" />
          {/* spike — stacked purple buds */}
          {[0, 0.06, 0.12, 0.18].map((d, j) => (
            <ellipse key={j} cx={r * fx} cy={r * (fy + d - 0.18)} rx={r * (0.035 - j * 0.004)} ry={r * 0.028}
                     fill={j % 2 ? '#9A7BC8' : '#8A66BC'} stroke="#5E4A84" strokeWidth={0.4} />
          ))}
        </g>
      ))}
      {/* narrow grey leaves at the base */}
      {[-0.2, 0.05, 0.24].map((fx, i) => (
        <line key={i} x1={r * fx} y1={r * 0.32} x2={r * (fx * 1.7)} y2={r * 0.1}
              stroke="#AABCA8" strokeWidth={1.1} strokeLinecap="round" />
      ))}
    </g>
  );
}

function ChamomileBloom({ x, y, size }: StageProps) {
  // Feathery foliage scattered with little domed daisies
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.35} rx={r * 0.5} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {/* wispy stems */}
      {[[-0.28, -0.35], [-0.05, -0.55], [0.22, -0.4], [0.05, -0.25]].map(([fx, fy], i) => (
        <path key={i} d={`M ${r * fx * 0.2} ${r * 0.32} Q ${r * fx * 0.7} ${r * (fy + 0.2)} ${r * fx} ${r * fy}`}
              stroke="#7BA46F" strokeWidth={1} fill="none" strokeLinecap="round" />
      ))}
      {/* feather leaves */}
      {[[-0.18, -0.1], [0.15, -0.15]].map(([fx, fy], i) => (
        <g key={i} transform={`translate(${r * fx}, ${r * fy})`}>
          <path d="M 0 0 l -4 -2 M 0 0 l -3 2 M 0 0 l 4 -2 M 0 0 l 3 2" stroke="#8CB27A" strokeWidth={0.8} strokeLinecap="round" />
        </g>
      ))}
      {/* daisies with DOMED yellow centers (the chamomile tell) */}
      {[{ dx: -0.28, dy: -0.38 }, { dx: -0.05, dy: -0.58 }, { dx: 0.22, dy: -0.43 }].map((d, i) => (
        <g key={i} transform={`translate(${r * d.dx}, ${r * d.dy})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <ellipse key={a} cx={0} cy={-r * 0.07} rx={r * 0.025} ry={r * 0.06}
                     fill="#FFFDF2" stroke="#C9C4A8" strokeWidth={0.4} transform={`rotate(${a})`} />
          ))}
          <circle cx={0} cy={-r * 0.015} r={r * 0.045} fill="#F2C94C" stroke="#C99A2E" strokeWidth={0.5} />
          <circle cx={-r * 0.012} cy={-r * 0.03} r={r * 0.015} fill="#F8E08A" />
        </g>
      ))}
    </g>
  );
}

function RosemaryBloom({ x, y, size }: StageProps) {
  // Upright needle sprigs with tiny blue flowers
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.35} rx={r * 0.5} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {[[-0.28, -0.42], [-0.1, -0.58], [0.08, -0.62], [0.26, -0.45]].map(([fx, fy], i) => (
        <g key={i}>
          <line x1={r * fx * 0.3} y1={r * 0.32} x2={r * fx} y2={r * fy}
                stroke="#5C7E5F" strokeWidth={1.5} strokeLinecap="round" />
          {/* needles along each sprig */}
          {[0.25, 0.45, 0.65, 0.85].map((t, j) => {
            const nx = r * (fx * 0.3 + (fx - fx * 0.3) * t);
            const ny = r * (0.32 + (fy - 0.32) * t);
            return (
              <g key={j}>
                <line x1={nx} y1={ny} x2={nx - r * 0.06} y2={ny - r * 0.02} stroke="#7A9C7C" strokeWidth={0.8} strokeLinecap="round" />
                <line x1={nx} y1={ny} x2={nx + r * 0.06} y2={ny - r * 0.02} stroke="#8CAE8E" strokeWidth={0.8} strokeLinecap="round" />
              </g>
            );
          })}
          {/* tiny blue flowers near the tips */}
          <circle cx={r * fx - r * 0.03} cy={r * (fy + 0.06)} r={r * 0.025} fill="#8FA8D9" stroke="#5E7AAF" strokeWidth={0.4} />
          <circle cx={r * fx + r * 0.035} cy={r * (fy + 0.1)} r={r * 0.022} fill="#A5BAE2" stroke="#5E7AAF" strokeWidth={0.4} />
        </g>
      ))}
    </g>
  );
}

function ThymeBloom({ x, y, size }: StageProps) {
  // Low creeping mat sprinkled with tiny pink flowers
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.28} rx={r * 0.6} ry={r * 0.12} fill="#6B4423" opacity={0.38} />
      {/* creeping stems radiating low and wide */}
      {[[-0.55, 0.05], [-0.35, -0.2], [0, -0.28], [0.35, -0.18], [0.55, 0.08]].map(([fx, fy], i) => (
        <g key={i}>
          <path d={`M 0 ${r * 0.25} Q ${r * fx * 0.5} ${r * (fy + 0.15)} ${r * fx} ${r * fy}`}
                stroke="#6E8A5E" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          {[0.4, 0.65, 0.9].map((t, j) => (
            <circle key={j} cx={r * fx * t} cy={r * ((0.25) + (fy - 0.25) * t)} r={r * 0.022}
                    fill={j % 2 ? '#7BA46F' : '#8CB27A'} />
          ))}
          {/* flower dot at the tip */}
          <circle cx={r * fx} cy={r * fy} r={r * 0.035} fill="#D9A0C0" stroke="#A8688E" strokeWidth={0.4} />
        </g>
      ))}
      {/* a bee couldn't resist */}
      <g transform={`translate(${r * 0.28}, ${-r * 0.42})`}>
        <ellipse cx={0} cy={0} rx={r * 0.05} ry={r * 0.035} fill="#FFD93D" stroke="#3F2614" strokeWidth={0.5} />
        <line x1={-r * 0.015} y1={-r * 0.03} x2={-r * 0.015} y2={r * 0.03} stroke="#3F2614" strokeWidth={0.6} />
        <ellipse cx={-r * 0.01} cy={-r * 0.045} rx={r * 0.04} ry={r * 0.02} fill="#DCE6EC" opacity={0.85} />
      </g>
    </g>
  );
}

// ─── MOON GARDEN ────────────────────────────────────────────────────────
// Shared bud stage; bespoke night blooms.

function MoonBud({ x, y, size, budColor = '#C9CBB0', vine = false }: StageProps & { budColor?: string; vine?: boolean }) {
  const h = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.06} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      {vine ? (
        <path d={`M 0 ${size * 0.05} C ${-size * 0.08} ${-h * 0.3} ${size * 0.08} ${-h * 0.6} 0 ${-h * 0.95}`}
              stroke="#6E8A5E" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      ) : (
        <line x1={0} y1={size * 0.05} x2={0} y2={-h * 0.9} stroke="#6E8A5E" strokeWidth={1.5} strokeLinecap="round" />
      )}
      <ellipse cx={-size * 0.06} cy={-h * 0.4} rx={size * 0.06} ry={size * 0.04} fill="#7BA46F"
               stroke={STROKE} strokeWidth={0.7} transform={`rotate(-30 ${-size * 0.06} ${-h * 0.4})`} />
      <ellipse cx={size * 0.06} cy={-h * 0.6} rx={size * 0.06} ry={size * 0.04} fill="#95B88F"
               stroke={STROKE} strokeWidth={0.7} transform={`rotate(30 ${size * 0.06} ${-h * 0.6})`} />
      {/* furled bud — a soft spiral tip */}
      <path d={`M 0 ${-h * 0.95} q ${size * 0.04} ${-size * 0.08} 0 ${-size * 0.14}
                q ${-size * 0.05} ${size * 0.05} 0 ${size * 0.14} Z`}
            fill={budColor} stroke="#8A8F6E" strokeWidth={0.8} />
    </g>
  );
}

function MoonflowerBloom({ x, y, size }: StageProps) {
  // Vine twining up a little pole, crowned by a great white trumpet
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.5} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {/* pole */}
      <line x1={0} y1={r * 0.55} x2={0} y2={-r * 0.55} stroke="#8A6238" strokeWidth={1.6} strokeLinecap="round" />
      {/* twining vine */}
      <path d={`M ${-r * 0.08} ${r * 0.5} C ${r * 0.18} ${r * 0.25} ${-r * 0.18} ${r * 0.0} ${r * 0.1} ${-r * 0.25}
                S ${-r * 0.08} ${-r * 0.5} ${0} ${-r * 0.58}`}
            stroke="#6E8A5E" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {/* heart-ish leaves */}
      {[[-0.2, 0.15, -30], [0.22, -0.1, 30], [-0.18, -0.35, -20]].map(([fx, fy, rot], i) => (
        <ellipse key={i} cx={r * fx} cy={r * fy} rx={r * 0.11} ry={r * 0.085}
                 fill={i % 2 ? '#6B8E5A' : '#7BA46F'} stroke={STROKE} strokeWidth={0.8}
                 transform={`rotate(${rot} ${r * fx} ${r * fy})`} />
      ))}
      {/* the trumpet — luminous white with a soft glow halo */}
      <circle cx={0} cy={-r * 0.62} r={r * 0.3} fill="#F5F2E4" opacity={0.2} />
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.72} rx={r * 0.09} ry={r * 0.17}
                 fill="#F8F6EC" stroke="#C9C4A8" strokeWidth={0.6}
                 transform={`rotate(${a} 0 ${-r * 0.62})`} />
      ))}
      <circle cx={0} cy={-r * 0.62} r={r * 0.06} fill="#F2E9B0" stroke="#C9C4A8" strokeWidth={0.5} />
      {/* a night moth on approach */}
      <g transform={`translate(${r * 0.34}, ${-r * 0.78})`}>
        <ellipse cx={-r * 0.035} cy={0} rx={r * 0.045} ry={r * 0.025} fill="#C9BFA8" stroke="#8A8068" strokeWidth={0.4} transform="rotate(-20)" />
        <ellipse cx={r * 0.035} cy={0} rx={r * 0.045} ry={r * 0.025} fill="#D8CFB8" stroke="#8A8068" strokeWidth={0.4} transform="rotate(20)" />
        <ellipse cx={0} cy={r * 0.01} rx={r * 0.015} ry={r * 0.03} fill="#8A8068" />
      </g>
    </g>
  );
}

function EveningPrimroseBloom({ x, y, size }: StageProps) {
  // Upright stem with soft yellow cups
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 0.45} ry={r * 0.09} fill="#6B4423" opacity={0.38} />
      <line x1={0} y1={r * 0.55} x2={0} y2={-r * 0.45} stroke="#6E8A5E" strokeWidth={1.5} strokeLinecap="round" />
      {[[-0.16, 0.2, -35], [0.16, 0.05, 35], [-0.14, -0.15, -30]].map(([fx, fy, rot], i) => (
        <ellipse key={i} cx={r * fx} cy={r * fy} rx={r * 0.12} ry={r * 0.05}
                 fill={i % 2 ? '#6B8E5A' : '#7BA46F'} stroke={STROKE} strokeWidth={0.8}
                 transform={`rotate(${rot} ${r * fx} ${r * fy})`} />
      ))}
      {/* yellow cups — four broad petals each */}
      {[{ cx2: 0, cy2: -r * 0.58 }, { cx2: -r * 0.22, cy2: -r * 0.36 }, { cx2: r * 0.22, cy2: -r * 0.4 }].map((c, i) => (
        <g key={i} transform={`translate(${c.cx2}, ${c.cy2})`}>
          <circle cx={0} cy={0} r={r * 0.16} fill="#F2D25E" opacity={0.18} />
          {[45, 135, 225, 315].map(a => (
            <ellipse key={a} cx={0} cy={-r * 0.07} rx={r * 0.06} ry={r * 0.08}
                     fill="#F2D25E" stroke="#C9A83A" strokeWidth={0.5} transform={`rotate(${a})`} />
          ))}
          <circle cx={0} cy={0} r={r * 0.035} fill="#E8B93C" />
        </g>
      ))}
    </g>
  );
}

function FourOClockBloom({ x, y, size }: StageProps) {
  // Bushy mound with magenta trumpets — and one yellow rebel
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.55} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {/* leafy mound */}
      {[[-0.28, -0.05], [0.28, -0.05], [0, -0.18], [-0.14, -0.32], [0.16, -0.3]].map(([fx, fy], i) => (
        <ellipse key={i} cx={r * fx} cy={r * fy} rx={r * 0.17} ry={r * 0.13}
                 fill={i % 2 ? '#5E8455' : '#6E9463'} stroke={STROKE} strokeWidth={0.9} />
      ))}
      {/* trumpets: flared circles with a tiny tube */}
      {[{ fx: -0.3, fy: -0.42, c: '#D9538C' }, { fx: 0.05, fy: -0.52, c: '#D9538C' },
        { fx: 0.34, fy: -0.38, c: '#F2D25E' }].map((f, i) => (
        <g key={i} transform={`translate(${r * f.fx}, ${r * f.fy})`}>
          <line x1={0} y1={r * 0.12} x2={0} y2={r * 0.03} stroke="#5E8455" strokeWidth={0.9} />
          {[0, 72, 144, 216, 288].map(a => (
            <ellipse key={a} cx={0} cy={-r * 0.055} rx={r * 0.045} ry={r * 0.07}
                     fill={f.c} stroke={f.c === '#F2D25E' ? '#C9A83A' : '#A8386A'} strokeWidth={0.5}
                     transform={`rotate(${a})`} />
          ))}
          <circle cx={0} cy={0} r={r * 0.025} fill="#FFFDF2" />
        </g>
      ))}
    </g>
  );
}

function NightPhloxBloom({ x, y, size }: StageProps) {
  // Small clump of white stars, maroon-backed — some still furled
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.48} ry={r * 0.09} fill="#6B4423" opacity={0.38} />
      {[[-0.22, -0.28], [0, -0.4], [0.22, -0.3], [-0.1, -0.12], [0.12, -0.14]].map(([fx, fy], i) => (
        <line key={i} x1={r * fx * 0.3} y1={r * 0.38} x2={r * fx} y2={r * fy}
              stroke="#6E8A5E" strokeWidth={1} strokeLinecap="round" />
      ))}
      {[-0.16, 0.14].map((fx, i) => (
        <ellipse key={i} cx={r * fx} cy={r * 0.1} rx={r * 0.09} ry={r * 0.04}
                 fill="#6B8E5A" stroke={STROKE} strokeWidth={0.7}
                 transform={`rotate(${fx < 0 ? -25 : 25} ${r * fx} ${r * 0.1})`} />
      ))}
      {/* open stars — five slim white petals, maroon peeking beneath */}
      {[{ fx: -0.22, fy: -0.3 }, { fx: 0, fy: -0.42 }, { fx: 0.22, fy: -0.32 }].map((f, i) => (
        <g key={i} transform={`translate(${r * f.fx}, ${r * f.fy})`}>
          <circle cx={0} cy={0} r={r * 0.11} fill="#F0EDE0" opacity={0.15} />
          {[0, 72, 144, 216, 288].map(a => (
            <g key={a} transform={`rotate(${a})`}>
              <ellipse cx={0} cy={-r * 0.065} rx={r * 0.022} ry={r * 0.065}
                       fill="#F0EDE0" stroke="#B9B49A" strokeWidth={0.4} />
            </g>
          ))}
          <circle cx={0} cy={0} r={r * 0.02} fill="#E8D98A" />
        </g>
      ))}
      {/* furled buds — maroon twists (closed = dark, the plant's trick) */}
      {[{ fx: -0.1, fy: -0.14 }, { fx: 0.12, fy: -0.16 }].map((f, i) => (
        <ellipse key={i} cx={r * f.fx} cy={r * f.fy} rx={r * 0.025} ry={r * 0.055}
                 fill="#6B3A4A" stroke="#4A2834" strokeWidth={0.4}
                 transform={`rotate(${i ? 18 : -15} ${r * f.fx} ${r * f.fy})`} />
      ))}
    </g>
  );
}

// ─── DISPATCH ───────────────────────────────────────────────────────────

export function BeyondPlantStageIllustration({ code, x, y, size }: { code: string; x: number; y: number; size: number }) {
  switch (code) {
    // orchard — peach
    case 'plant_peach_seed':      return <SeedDot x={x} y={y} size={size} color="#7A4A34" wide />;
    case 'plant_peach_sprout':    return <SproutPair x={x} y={y} size={size} />;
    case 'plant_peach_twig':      return <TreeTwig x={x} y={y} size={size} leaf="#84AC6E" />;
    case 'plant_peach_young':     return <TreeYoung x={x} y={y} size={size} c1="#6B9459" c2="#84AC6E" hi="#B0CE96" />;
    case 'plant_peach_mature':    return <PeachMature x={x} y={y} size={size} />;
    // orchard — pawpaw
    case 'plant_pawpaw_seed':     return <SeedDot x={x} y={y} size={size} color="#3F2E1C" wide />;
    case 'plant_pawpaw_sprout':   return <SproutPair x={x} y={y} size={size} leafA="#5E8455" leafB="#4F7548" />;
    case 'plant_pawpaw_twig':     return <TreeTwig x={x} y={y} size={size} leaf="#5E8455" />;
    case 'plant_pawpaw_young':    return <TreeYoung x={x} y={y} size={size} c1="#4F7548" c2="#5E8455" hi="#8CAE7E" />;
    case 'plant_pawpaw_mature':   return <PawpawMature x={x} y={y} size={size} />;
    // orchard — plum
    case 'plant_plum_seed':       return <SeedDot x={x} y={y} size={size} color="#4A3040" wide />;
    case 'plant_plum_sprout':     return <SproutPair x={x} y={y} size={size} leafA="#729478" leafB="#5F8168" />;
    case 'plant_plum_twig':       return <TreeTwig x={x} y={y} size={size} leaf="#729478" />;
    case 'plant_plum_young':      return <TreeYoung x={x} y={y} size={size} c1="#5F8168" c2="#729478" hi="#9CB89E" />;
    case 'plant_plum_mature':     return <PlumMature x={x} y={y} size={size} />;
    // orchard — persimmon
    case 'plant_persimmon_seed':  return <SeedDot x={x} y={y} size={size} color="#6E4A28" wide />;
    case 'plant_persimmon_sprout': return <SproutPair x={x} y={y} size={size} leafA="#A3B06A" leafB="#8FA060" />;
    case 'plant_persimmon_twig':  return <TreeTwig x={x} y={y} size={size} leaf="#A3B06A" />;
    case 'plant_persimmon_young': return <TreeYoung x={x} y={y} size={size} c1="#8FA060" c2="#A3B06A" hi="#C4CC8C" />;
    case 'plant_persimmon_mature': return <PersimmonMature x={x} y={y} size={size} />;
    // orchard — fig
    case 'plant_fig_seed':        return <SeedDot x={x} y={y} size={size} color="#5A4434" wide />;
    case 'plant_fig_sprout':      return <SproutPair x={x} y={y} size={size} leafA="#6E9463" leafB="#5E8455" round />;
    case 'plant_fig_twig':        return <TreeTwig x={x} y={y} size={size} leaf="#6E9463" />;
    case 'plant_fig_young':       return <TreeYoung x={x} y={y} size={size} c1="#5E8455" c2="#6E9463" hi="#9CBE8E" />;
    case 'plant_fig_mature':      return <FigMature x={x} y={y} size={size} />;
    // berry patch
    case 'plant_raspberry_seed':     return <SeedDot x={x} y={y} size={size} />;
    case 'plant_raspberry_sprout':   return <SproutPair x={x} y={y} size={size} />;
    case 'plant_raspberry_cane':     return <CaneStage x={x} y={y} size={size} />;
    case 'plant_raspberry_berries':  return <RaspberryBerries x={x} y={y} size={size} />;
    case 'plant_blackberry_seed':    return <SeedDot x={x} y={y} size={size} />;
    case 'plant_blackberry_sprout':  return <SproutPair x={x} y={y} size={size} leafA="#7BA46F" leafB="#6B8E5A" />;
    case 'plant_blackberry_cane':    return <CaneStage x={x} y={y} size={size} color="#5E4A38" />;
    case 'plant_blackberry_berries': return <BlackberryBerries x={x} y={y} size={size} />;
    case 'plant_gooseberry_seed':    return <SeedDot x={x} y={y} size={size} color="#4A5230" />;
    case 'plant_gooseberry_sprout':  return <SproutPair x={x} y={y} size={size} round />;
    case 'plant_gooseberry_cane':    return <CaneStage x={x} y={y} size={size} arch={false} />;
    case 'plant_gooseberry_berries': return <GooseberryBerries x={x} y={y} size={size} />;
    case 'plant_currant_seed':       return <SeedDot x={x} y={y} size={size} color="#5A2A2C" />;
    case 'plant_currant_sprout':     return <SproutPair x={x} y={y} size={size} />;
    case 'plant_currant_cane':       return <CaneStage x={x} y={y} size={size} arch={false} color="#7A5C40" />;
    case 'plant_currant_berries':    return <CurrantBerries x={x} y={y} size={size} />;
    case 'plant_elderberry_seed':    return <SeedDot x={x} y={y} size={size} wide />;
    case 'plant_elderberry_sprout':  return <SproutPair x={x} y={y} size={size} leafA="#7BA46F" leafB="#6B8E5A" />;
    case 'plant_elderberry_cane':    return <CaneStage x={x} y={y} size={size} arch={false} color="#6E5A44" />;
    case 'plant_elderberry_berries': return <ElderberryBerries x={x} y={y} size={size} />;
    // herb & tea garden
    case 'plant_basil_seed':      return <SeedDot x={x} y={y} size={size} />;
    case 'plant_basil_sprout':    return <SproutPair x={x} y={y} size={size} leafA="#7FB06A" leafB="#6FA05C" round />;
    case 'plant_basil_clump':     return <HerbClump x={x} y={y} size={size} leaf="#6FA05C" leafHi="#7FB06A" />;
    case 'plant_basil_bloom':     return <BasilBloom x={x} y={y} size={size} />;
    case 'plant_lavender_seed':   return <SeedDot x={x} y={y} size={size} color="#4A4434" />;
    case 'plant_lavender_sprout': return <SproutPair x={x} y={y} size={size} leafA="#AABCA8" leafB="#9BAF9A" />;
    case 'plant_lavender_clump':  return <HerbClump x={x} y={y} size={size} leaf="#9BAF9A" leafHi="#AABCA8" needle />;
    case 'plant_lavender_bloom':  return <LavenderBloom x={x} y={y} size={size} />;
    case 'plant_chamomile_seed':  return <SeedDot x={x} y={y} size={size} />;
    case 'plant_chamomile_sprout': return <SproutPair x={x} y={y} size={size} />;
    case 'plant_chamomile_clump': return <HerbClump x={x} y={y} size={size} leaf="#8CB27A" leafHi="#A2C794" needle />;
    case 'plant_chamomile_bloom': return <ChamomileBloom x={x} y={y} size={size} />;
    case 'plant_rosemary_seed':   return <SeedDot x={x} y={y} size={size} color="#3A3428" />;
    case 'plant_rosemary_sprout': return <SproutPair x={x} y={y} size={size} leafA="#7A9C7C" leafB="#5C7E5F" />;
    case 'plant_rosemary_clump':  return <HerbClump x={x} y={y} size={size} leaf="#5C7E5F" leafHi="#7A9C7C" needle />;
    case 'plant_rosemary_bloom':  return <RosemaryBloom x={x} y={y} size={size} />;
    case 'plant_thyme_seed':      return <SeedDot x={x} y={y} size={size} />;
    case 'plant_thyme_sprout':    return <SproutPair x={x} y={y} size={size} round />;
    case 'plant_thyme_clump':     return <HerbClump x={x} y={y} size={size} leaf="#6E8A5E" leafHi="#8CB27A" needle />;
    case 'plant_thyme_bloom':     return <ThymeBloom x={x} y={y} size={size} />;
    // moon garden
    case 'plant_moonflower_seed':       return <SeedDot x={x} y={y} size={size} color="#2E2A24" wide />;
    case 'plant_moonflower_sprout':     return <SproutPair x={x} y={y} size={size} round />;
    case 'plant_moonflower_bud':        return <MoonBud x={x} y={y} size={size} budColor="#E4E1D0" vine />;
    case 'plant_moonflower_bloom':      return <MoonflowerBloom x={x} y={y} size={size} />;
    case 'plant_eveningprimrose_seed':  return <SeedDot x={x} y={y} size={size} />;
    case 'plant_eveningprimrose_sprout': return <SproutPair x={x} y={y} size={size} />;
    case 'plant_eveningprimrose_bud':   return <MoonBud x={x} y={y} size={size} budColor="#D9C878" />;
    case 'plant_eveningprimrose_bloom': return <EveningPrimroseBloom x={x} y={y} size={size} />;
    case 'plant_fouroclock_seed':       return <SeedDot x={x} y={y} size={size} color="#2E2A24" />;
    case 'plant_fouroclock_sprout':     return <SproutPair x={x} y={y} size={size} round />;
    case 'plant_fouroclock_bud':        return <MoonBud x={x} y={y} size={size} budColor="#C77BA0" />;
    case 'plant_fouroclock_bloom':      return <FourOClockBloom x={x} y={y} size={size} />;
    case 'plant_nightphlox_seed':       return <SeedDot x={x} y={y} size={size} />;
    case 'plant_nightphlox_sprout':     return <SproutPair x={x} y={y} size={size} />;
    case 'plant_nightphlox_bud':        return <MoonBud x={x} y={y} size={size} budColor="#8A5A68" />;
    case 'plant_nightphlox_bloom':      return <NightPhloxBloom x={x} y={y} size={size} />;
    default: return null;
  }
}
