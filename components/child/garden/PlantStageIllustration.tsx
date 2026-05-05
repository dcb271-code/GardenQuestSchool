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

export function PlantStageIllustration({ code, x, y, size }: Props) {
  switch (code) {
    case 'plant_radish_seed':    return <RadishSeed x={x} y={y} size={size} />;
    case 'plant_radish_sprout':  return <RadishSprout x={x} y={y} size={size} />;
    case 'plant_radish_leaves':  return <RadishLeaves x={x} y={y} size={size} />;
    case 'plant_radish_mature':  return <RadishMature x={x} y={y} size={size} />;
    default: return null;
  }
}
