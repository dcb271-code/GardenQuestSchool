// components/child/garden/PlantStageIllustration.tsx
//
// Switch-based renderer for plant stages. Same hand-drawn style as
// illustrations.tsx — naturalist palette, dark bark outlines, slight
// asymmetry. Top-down view, sized for the plot grid (40-80 px wide).
//
// Lives in its own file so we don't keep growing illustrations.tsx.
//
// All stages render at translate(x, y) so they slot into the plot at
// the plot's center.

'use client';

const STROKE = '#5A3B1F';

interface Props {
  code: string;
  x: number;
  y: number;
  size: number;
}

interface StageProps { x: number; y: number; size: number; }

// ─── RADISH ─────────────────────────────────────────────────────────────
function RadishSeed({ x, y, size }: StageProps) {
  // Tiny dot in disturbed soil — 5px wide
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function RadishSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.6} strokeLinecap="round" />
      <ellipse cx={-size * 0.05} cy={-h * 0.9} rx={size * 0.05} ry={size * 0.07} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-25 ${-size * 0.05} ${-h * 0.9})`} />
      <ellipse cx={size * 0.05} cy={-h * 0.9} rx={size * 0.05} ry={size * 0.07} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(25 ${size * 0.05} ${-h * 0.9})`} />
    </g>
  );
}

function RadishLeaves({ x, y, size }: StageProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.2} rx={r * 0.55} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {[0, 60, 120, 180, 240, 300].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.25} rx={r * 0.2} ry={r * 0.32} fill="#7BA46F" stroke={STROKE} strokeWidth={1} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={r * 0.05} r={r * 0.06} fill="#5C7E4F" />
    </g>
  );
}

function RadishMature({ x, y, size }: StageProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.7} ry={r * 0.12} fill="#6B4423" opacity={0.3} />
      {/* leafy tops */}
      {[0, 50, 100, 200, 250, 310].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.4} rx={r * 0.2} ry={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} transform={`rotate(${a})`} />
      ))}
      {/* red bulb peeking from soil */}
      <ellipse cx={0} cy={r * 0.18} rx={r * 0.32} ry={r * 0.36} fill="#C84A3A" stroke={STROKE} strokeWidth={1.4} />
      {/* highlight */}
      <ellipse cx={-r * 0.1} cy={r * 0.1} rx={r * 0.1} ry={r * 0.14} fill="#E6705F" opacity={0.7} />
      {/* root tail */}
      <path d={`M 0 ${r * 0.5} Q ${r * 0.04} ${r * 0.62} 0 ${r * 0.74}`} stroke="#FFFAF2" strokeWidth={1.2} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─── MINT ───────────────────────────────────────────────────────────────
function MintSeed({ x, y, size }: StageProps) {
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function MintSprout({ x, y, size }: StageProps) {
  // Single stem with two oval leaves, tiny notch for serration
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.16} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.4} strokeLinecap="round" />
      {/* left leaf with serration notch */}
      <g transform={`translate(${-size * 0.06},${-h * 0.85}) rotate(-30)`}>
        <ellipse cx={0} cy={0} rx={size * 0.06} ry={size * 0.085} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} />
        <path d={`M ${-size * 0.06} 0 l ${size * 0.012} ${size * 0.012} l ${-size * 0.012} ${size * 0.012}`} fill="#95B88F" stroke={STROKE} strokeWidth={0.6} />
      </g>
      {/* right leaf with serration notch */}
      <g transform={`translate(${size * 0.06},${-h * 0.85}) rotate(30)`}>
        <ellipse cx={0} cy={0} rx={size * 0.06} ry={size * 0.085} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} />
        <path d={`M ${size * 0.06} 0 l ${-size * 0.012} ${size * 0.012} l ${size * 0.012} ${size * 0.012}`} fill="#7BA46F" stroke={STROKE} strokeWidth={0.6} />
      </g>
    </g>
  );
}

function MintYoung({ x, y, size }: StageProps) {
  // Three pairs of opposite leaves on a stem ~30% size
  const h = size * 0.3;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.08} rx={size * 0.2} ry={size * 0.05} fill="#6B4423" opacity={0.35} />
      <line x1={0} y1={size * 0.08} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.2} strokeLinecap="round" />
      {[0.25, 0.55, 0.85].map((frac, i) => {
        const ly = -h * frac;
        const angle = i % 2 === 0 ? -32 : -28;
        const angle2 = i % 2 === 0 ? 32 : 28;
        return (
          <g key={frac}>
            <ellipse cx={-size * 0.08} cy={ly} rx={size * 0.07} ry={size * 0.045} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(${angle} ${-size * 0.08} ${ly})`} />
            <ellipse cx={size * 0.08} cy={ly} rx={size * 0.07} ry={size * 0.045} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(${angle2} ${size * 0.08} ${ly})`} />
          </g>
        );
      })}
    </g>
  );
}

function MintMature({ x, y, size }: StageProps) {
  // Bushy mound ~70% with rounded leaves
  const r = size * 0.35;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.55} rx={r * 1.1} ry={r * 0.18} fill="#6B4423" opacity={0.3} />
      {/* base mound */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.85} fill="#7BA46F" stroke={STROKE} strokeWidth={1.2} />
      {/* clustered round leaves */}
      {[
        { cx: -r * 0.55, cy: -r * 0.2, rot: -18, fill: '#95B88F' },
        { cx: r * 0.45, cy: -r * 0.3, rot: 22, fill: '#95B88F' },
        { cx: -r * 0.2, cy: -r * 0.55, rot: -5, fill: '#A2C794' },
        { cx: r * 0.15, cy: -r * 0.5, rot: 8, fill: '#A2C794' },
        { cx: 0, cy: -r * 0.1, rot: 0, fill: '#7BA46F' },
        { cx: -r * 0.5, cy: r * 0.2, rot: -30, fill: '#5C7E4F' },
        { cx: r * 0.55, cy: r * 0.15, rot: 30, fill: '#5C7E4F' },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.cx} cy={leaf.cy} rx={r * 0.32} ry={r * 0.22} fill={leaf.fill} stroke={STROKE} strokeWidth={1} transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`} />
      ))}
      {/* small midrib hints */}
      <line x1={-r * 0.55} y1={-r * 0.2} x2={-r * 0.85} y2={-r * 0.25} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
      <line x1={r * 0.45} y1={-r * 0.3} x2={r * 0.7} y2={-r * 0.4} stroke={STROKE} strokeWidth={0.5} opacity={0.5} />
    </g>
  );
}

export function PlantStageIllustration({ code, x, y, size }: Props) {
  switch (code) {
    case 'plant_radish_seed':    return <RadishSeed x={x} y={y} size={size} />;
    case 'plant_radish_sprout':  return <RadishSprout x={x} y={y} size={size} />;
    case 'plant_radish_leaves':  return <RadishLeaves x={x} y={y} size={size} />;
    case 'plant_radish_mature':  return <RadishMature x={x} y={y} size={size} />;
    case 'plant_mint_seed':      return <MintSeed x={x} y={y} size={size} />;
    case 'plant_mint_sprout':    return <MintSprout x={x} y={y} size={size} />;
    case 'plant_mint_young':     return <MintYoung x={x} y={y} size={size} />;
    case 'plant_mint_mature':    return <MintMature x={x} y={y} size={size} />;
    default: return null;
  }
}
