// components/child/garden/QuadrantBackgrounds.tsx
//
// Four quadrant backgrounds rendered as one component each. Each takes
// origin (top-left x,y) and size (w,h). They're decorative SVG only —
// no interactions. Same hand-drawn vocabulary as the rest of the world.

'use client';

const STROKE = '#5A3B1F';

interface BgProps { x: number; y: number; w: number; h: number; }

export function VegetableBackground({ x, y, w, h }: BgProps) {
  // Brown furrowed earth with horizontal furrow lines.
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#6B4423" />
      {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
        <line key={i} x1={12} y1={h * f} x2={w - 12} y2={h * f} stroke="#3F2614" strokeWidth={1} opacity={0.55} />
      ))}
      {/* a few pebbles */}
      <circle cx={w * 0.15} cy={h * 0.7} r={2} fill="#A89D8A" />
      <circle cx={w * 0.75} cy={h * 0.3} r={2.4} fill="#A89D8A" />
    </g>
  );
}

export function FlowerBackground({ x, y, w, h }: BgProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#7BA46F" />
      {/* stone edging */}
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((f, i) => (
        <ellipse key={i} cx={w * f} cy={h - 6} rx={10} ry={4} fill="#A89D8A" stroke={STROKE} strokeWidth={1} />
      ))}
      {/* moss tufts */}
      <ellipse cx={w * 0.2} cy={h * 0.85} rx={6} ry={2} fill="#5C7E4F" opacity={0.6} />
      <ellipse cx={w * 0.8} cy={h * 0.15} rx={6} ry={2} fill="#5C7E4F" opacity={0.6} />
    </g>
  );
}

export function FruitGroveBackground({ x, y, w, h }: BgProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#7BA46F" />
      {/* tree-shape clearings (slightly darker patches) */}
      {[0.25, 0.75].flatMap((fx, ix) =>
        [0.3, 0.7].map((fy, iy) => (
          <ellipse key={`${ix}-${iy}`} cx={w * fx} cy={h * fy} rx={50} ry={45} fill="#5C7E4F" opacity={0.45} />
        ))
      )}
      <ellipse cx={w * 0.1} cy={h * 0.9} rx={5} ry={2} fill="#A89D8A" />
    </g>
  );
}

export function JapaneseBackground({ x, y, w, h }: BgProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#D8D0C0" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#E8E0D0" />
      {/* raked sand lines */}
      {[0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map((f, i) => (
        <path key={i}
          d={`M 8 ${h * f} Q ${w * 0.5} ${h * f - 3} ${w - 8} ${h * f}`}
          stroke="#B5ACA0" strokeWidth={0.8} fill="none" opacity={0.7} />
      ))}
      {/* stone lantern in corner */}
      <g transform={`translate(${w - 30}, ${h - 30})`}>
        <rect x={-6} y={-2} width={12} height={4} fill="#A89D8A" stroke={STROKE} strokeWidth={0.8} />
        <rect x={-4} y={-12} width={8} height={10} fill="#9B948A" stroke={STROKE} strokeWidth={0.8} />
        <rect x={-3} y={-9} width={6} height={6} fill="#FFD06B" />
        <path d={`M -8 -12 L 0 -18 L 8 -12 Z`} fill="#7F7A70" stroke={STROKE} strokeWidth={0.8} />
      </g>
      {/* small bamboo cluster border */}
      {[10, 18, 26].map(bx => (
        <line key={bx} x1={bx} y1={h - 10} x2={bx + 1} y2={h - 26} stroke="#7BA46F" strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  );
}
