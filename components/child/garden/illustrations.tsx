'use client';

/**
 * SVG illustration library for the garden map.
 *
 * Style guide:
 *  - Naturalist palette: cream #F5EBDC, ochre #E8C493, terracotta #E8A87C,
 *    sage #95B88F, forest #6B8E5A, bark #6B4423, rose #C38D9E, sun #FFD93D
 *  - Outline color: #5A3B1F (dark bark) at strokeWidth 2-2.5
 *  - Rounded line caps + joins for friendly feel
 *  - Slight asymmetry (organic, not geometric)
 *  - Each illustration is a <g> meant to be placed at (x,y) where (x,y) is its center
 *  - `size` controls the bounding box (most around 80-110)
 */

const STROKE = '#5A3B1F';
const STROKE_LIGHT = '#8B6938';

interface IllustrationProps {
  x: number;
  y: number;
  size?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// LANDSCAPE PIECES (trees, flowers, grass)
// ─────────────────────────────────────────────────────────────────────────

export function Tree({ x, y, size = 60, variant = 1 }: IllustrationProps & { variant?: 1 | 2 | 3 }) {
  // tree with trunk + double-layered foliage
  const r = size / 2;
  const trunkW = r * 0.28;
  const trunkH = r * 0.5;
  const foliageColors =
    variant === 1 ? ['#7BA46F', '#8FB67A'] :
    variant === 2 ? ['#6B8E5A', '#8FB67A'] :
    ['#5C7E4F', '#7BA46F'];
  return (
    <g transform={`translate(${x},${y})`}>
      {/* trunk */}
      <rect
        x={-trunkW / 2}
        y={r * 0.2}
        width={trunkW}
        height={trunkH}
        rx={trunkW * 0.2}
        fill="#8B5A2B"
        stroke={STROKE}
        strokeWidth={2}
      />
      {/* foliage back */}
      <circle cx={r * 0.2} cy={-r * 0.05} r={r * 0.95} fill={foliageColors[0]} stroke={STROKE} strokeWidth={2} />
      {/* foliage front */}
      <circle cx={-r * 0.15} cy={r * 0.1} r={r * 0.7} fill={foliageColors[1]} />
      {/* highlight */}
      <ellipse cx={-r * 0.25} cy={-r * 0.2} rx={r * 0.25} ry={r * 0.18} fill="#FFFFFF" opacity={0.25} />
    </g>
  );
}

export function PineTree({ x, y, size = 60 }: IllustrationProps) {
  const h = size;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-h * 0.07} y={h * 0.25} width={h * 0.14} height={h * 0.3} fill="#6B4423" stroke={STROKE} strokeWidth={2} />
      <polygon
        points={`0,${-h * 0.5} ${h * 0.4},${h * 0.05} ${-h * 0.4},${h * 0.05}`}
        fill="#5C7E4F" stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
      <polygon
        points={`0,${-h * 0.25} ${h * 0.32},${h * 0.25} ${-h * 0.32},${h * 0.25}`}
        fill="#6B8E5A" stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
    </g>
  );
}

export function Flower({ x, y, size = 14, color = '#E6B0D0' }: IllustrationProps & { color?: string }) {
  const r = size;
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={0} y1={r * 0.6} x2={0} y2={r * 1.6} stroke="#6B8E5A" strokeWidth={1.5} strokeLinecap="round" />
      <ellipse cx={r * 0.5} cy={r * 1.1} rx={r * 0.3} ry={r * 0.15} fill="#7BA46F" />
      {/* petals */}
      {[0, 72, 144, 216, 288].map(deg => (
        <ellipse
          key={deg}
          cx={0}
          cy={-r * 0.3}
          rx={r * 0.32}
          ry={r * 0.5}
          fill={color}
          stroke={STROKE_LIGHT}
          strokeWidth={1}
          transform={`rotate(${deg})`}
        />
      ))}
      {/* center */}
      <circle cx={0} cy={0} r={r * 0.28} fill="#FFD166" stroke={STROKE_LIGHT} strokeWidth={1} />
    </g>
  );
}

export function GrassTuft({ x, y, size = 14 }: IllustrationProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={`M 0 0 Q ${-size * 0.2} ${-size * 0.6} ${-size * 0.05} ${-size}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d={`M 0 0 Q ${size * 0.05} ${-size * 0.7} ${size * 0.15} ${-size * 1.05}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d={`M 0 0 Q ${size * 0.3} ${-size * 0.5} ${size * 0.4} ${-size * 0.85}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HABITAT STRUCTURES
// ─────────────────────────────────────────────────────────────────────────

export function AntHill({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* mound */}
      <path
        d={`M ${-r} ${r * 0.3} Q ${-r * 0.3} ${-r * 0.9} ${r * 0.05} ${-r * 0.95} Q ${r * 0.6} ${-r * 0.5} ${r} ${r * 0.3} Z`}
        fill="#B8956F" stroke={STROKE} strokeWidth={2}
      />
      {/* texture lines */}
      <path d={`M ${-r * 0.7} ${0} Q ${-r * 0.4} ${-r * 0.3} ${-r * 0.1} ${-r * 0.4}`} stroke="#8B6938" strokeWidth={1.5} fill="none" opacity={0.6} />
      <path d={`M ${r * 0.1} ${-r * 0.5} Q ${r * 0.4} ${-r * 0.3} ${r * 0.6} ${-r * 0.05}`} stroke="#8B6938" strokeWidth={1.5} fill="none" opacity={0.6} />
      {/* tunnel hole */}
      <ellipse cx={0} cy={r * 0.15} rx={r * 0.18} ry={r * 0.12} fill="#3A2818" />
      {/* ants */}
      {[[-r * 0.5, r * 0.32], [-r * 0.3, r * 0.28], [r * 0.4, r * 0.3], [r * 0.6, r * 0.2]].map(([ax, ay], i) => (
        <g key={i} transform={`translate(${ax},${ay})`}>
          <circle r={2} fill="#1A1A1A" />
          <circle cx={3} r={2.3} fill="#1A1A1A" />
          <circle cx={6} r={2} fill="#1A1A1A" />
        </g>
      ))}
    </g>
  );
}

export function BunnyBurrow({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* mound */}
      <ellipse cx={0} cy={r * 0.1} rx={r} ry={r * 0.7} fill="#A18568" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-r * 0.3} cy={-r * 0.1} rx={r * 0.5} ry={r * 0.3} fill="#B59779" opacity={0.6} />
      {/* burrow opening */}
      <ellipse cx={0} cy={r * 0.15} rx={r * 0.35} ry={r * 0.25} fill="#2A1810" />
      <ellipse cx={0} cy={r * 0.05} rx={r * 0.32} ry={r * 0.06} fill="#5A3B1F" />
      {/* bunny peeking */}
      <g transform={`translate(0, ${r * 0.05})`}>
        {/* ears */}
        <ellipse cx={-r * 0.1} cy={-r * 0.15} rx={r * 0.06} ry={r * 0.18} fill="#E8C493" stroke={STROKE} strokeWidth={1.2} transform={`rotate(-8 ${-r * 0.1} ${-r * 0.15})`} />
        <ellipse cx={r * 0.05} cy={-r * 0.15} rx={r * 0.06} ry={r * 0.18} fill="#E8C493" stroke={STROKE} strokeWidth={1.2} transform={`rotate(8 ${r * 0.05} ${-r * 0.15})`} />
        {/* head */}
        <ellipse cx={0} cy={r * 0.05} rx={r * 0.18} ry={r * 0.15} fill="#E8C493" stroke={STROKE} strokeWidth={1.5} />
        {/* eyes */}
        <circle cx={-r * 0.06} cy={r * 0.02} r={1.5} fill="#1A1A1A" />
        <circle cx={r * 0.06} cy={r * 0.02} r={1.5} fill="#1A1A1A" />
        {/* nose */}
        <circle cx={0} cy={r * 0.1} r={1.2} fill="#C38D9E" />
      </g>
      {/* grass tufts */}
      <GrassTuft x={-r * 0.85} y={r * 0.5} size={10} />
      <GrassTuft x={r * 0.8} y={r * 0.55} size={10} />
    </g>
  );
}

export function FrogPondHabitat({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* lily pad */}
      <path
        d={`M ${-r * 0.6} 0 A ${r * 0.6} ${r * 0.6} 0 1 1 ${r * 0.6} 0 L ${r * 0.05} 0 Z`}
        fill="#5C7E4F" stroke={STROKE} strokeWidth={2}
      />
      {/* lily pad highlight */}
      <ellipse cx={-r * 0.2} cy={-r * 0.25} rx={r * 0.18} ry={r * 0.1} fill="#7BA46F" opacity={0.7} />
      {/* lily flower */}
      <g transform={`translate(${r * 0.2}, ${-r * 0.15})`}>
        {[0, 72, 144, 216, 288].map(deg => (
          <ellipse key={deg} rx={r * 0.07} ry={r * 0.13} fill="#F5E2EE" stroke={STROKE_LIGHT} strokeWidth={0.8} transform={`rotate(${deg})`} cy={-r * 0.06} />
        ))}
        <circle r={r * 0.04} fill="#FFD166" />
      </g>
      {/* frog on pad */}
      <g transform={`translate(${-r * 0.15}, ${-r * 0.05})`}>
        <ellipse cx={0} cy={0} rx={r * 0.22} ry={r * 0.16} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.5} />
        <circle cx={-r * 0.1} cy={-r * 0.1} r={r * 0.07} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.2} />
        <circle cx={r * 0.04} cy={-r * 0.1} r={r * 0.07} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.2} />
        <circle cx={-r * 0.1} cy={-r * 0.1} r={r * 0.03} fill="#1A1A1A" />
        <circle cx={r * 0.04} cy={-r * 0.1} r={r * 0.03} fill="#1A1A1A" />
        <path d={`M ${-r * 0.07} ${r * 0.05} Q 0 ${r * 0.1} ${r * 0.07} ${r * 0.05}`} stroke={STROKE} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function BeeHotel({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  const w = r * 1.3;
  const h = r * 1.4;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* roof */}
      <polygon
        points={`${-w / 2 - 6},${-h / 2 + 4} ${w / 2 + 6},${-h / 2 + 4} ${w / 2 - 4},${-h / 2 - 8} ${-w / 2 + 4},${-h / 2 - 8}`}
        fill="#7B4F2C" stroke={STROKE} strokeWidth={2}
      />
      {/* frame */}
      <rect x={-w / 2} y={-h / 2 + 4} width={w} height={h - 4} fill="#A87147" stroke={STROKE} strokeWidth={2} rx={2} />
      {/* hex cells */}
      {(() => {
        const cells: React.ReactNode[] = [];
        const hexSize = r * 0.18;
        const cols = 4;
        const rows = 3;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cx = -w / 2 + 8 + col * hexSize * 1.4 + (row % 2 === 0 ? 0 : hexSize * 0.7);
            const cy = -h / 2 + 16 + row * hexSize * 1.2;
            cells.push(
              <polygon
                key={`${row}-${col}`}
                points={[0, 60, 120, 180, 240, 300]
                  .map(a => {
                    const rad = (a * Math.PI) / 180;
                    return `${cx + Math.cos(rad) * hexSize},${cy + Math.sin(rad) * hexSize}`;
                  })
                  .join(' ')}
                fill="#FFD166"
                stroke={STROKE}
                strokeWidth={1}
              />
            );
          }
        }
        return cells;
      })()}
      {/* bee */}
      <g transform={`translate(${w / 2 - 8}, ${h / 2 - 6})`}>
        <ellipse rx={5} ry={3.5} fill="#FFD166" stroke={STROKE} strokeWidth={1.2} />
        <line x1={-2} y1={-2} x2={-2} y2={2} stroke={STROKE} strokeWidth={1} />
        <line x1={1} y1={-2.5} x2={1} y2={2.5} stroke={STROKE} strokeWidth={1} />
      </g>
    </g>
  );
}

export function ButterflyBush({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* bush base */}
      <ellipse cx={0} cy={r * 0.2} rx={r * 0.95} ry={r * 0.5} fill="#6B8E5A" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-r * 0.3} cy={0} rx={r * 0.5} ry={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={r * 0.3} cy={r * 0.05} rx={r * 0.5} ry={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={2} />
      {/* purple flower clusters */}
      {[[-r * 0.4, -r * 0.2], [r * 0.2, -r * 0.15], [0, r * 0.05], [-r * 0.1, -r * 0.4], [r * 0.4, -r * 0.05]].map(([fx, fy], i) => (
        <g key={i}>
          <circle cx={fx} cy={fy} r={r * 0.13} fill="#A675B0" />
          <circle cx={fx - 3} cy={fy - 2} r={2} fill="#C8A0D0" />
          <circle cx={fx + 3} cy={fy + 2} r={2} fill="#C8A0D0" />
          <circle cx={fx} cy={fy + 4} r={1.8} fill="#C8A0D0" />
        </g>
      ))}
      {/* butterfly */}
      <g transform={`translate(${r * 0.5}, ${-r * 0.55})`}>
        <ellipse cx={-4} cy={0} rx={5} ry={6} fill="#E8A87C" stroke={STROKE} strokeWidth={1.2} />
        <ellipse cx={4} cy={0} rx={5} ry={6} fill="#E8A87C" stroke={STROKE} strokeWidth={1.2} />
        <ellipse cx={-3} cy={4} rx={3.5} ry={4} fill="#E8A87C" stroke={STROKE} strokeWidth={1} />
        <ellipse cx={3} cy={4} rx={3.5} ry={4} fill="#E8A87C" stroke={STROKE} strokeWidth={1} />
        <line x1={0} y1={-5} x2={0} y2={5} stroke={STROKE} strokeWidth={1.5} />
      </g>
    </g>
  );
}

export function LogPile({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* back log (cross-section view) */}
      <ellipse cx={-r * 0.3} cy={r * 0.3} rx={r * 0.4} ry={r * 0.3} fill="#A87147" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-r * 0.3} cy={r * 0.3} rx={r * 0.28} ry={r * 0.21} fill="#C18B5A" />
      <circle cx={-r * 0.3} cy={r * 0.3} r={r * 0.04} fill={STROKE} />
      {/* front log */}
      <ellipse cx={r * 0.2} cy={r * 0.45} rx={r * 0.45} ry={r * 0.32} fill="#8B5A2B" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={r * 0.2} cy={r * 0.45} rx={r * 0.32} ry={r * 0.22} fill="#A87147" />
      <circle cx={r * 0.2} cy={r * 0.45} r={r * 0.04} fill={STROKE} />
      {/* top log */}
      <ellipse cx={-r * 0.1} cy={-r * 0.05} rx={r * 0.42} ry={r * 0.3} fill="#A87147" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-r * 0.1} cy={-r * 0.05} rx={r * 0.3} ry={r * 0.21} fill="#C18B5A" />
      <circle cx={-r * 0.1} cy={-r * 0.05} r={r * 0.04} fill={STROKE} />
      {/* moss patches */}
      <ellipse cx={-r * 0.6} cy={r * 0.25} rx={6} ry={3} fill="#7BA46F" opacity={0.8} />
      <ellipse cx={r * 0.55} cy={r * 0.4} rx={5} ry={2.5} fill="#7BA46F" opacity={0.8} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SKILL STRUCTURES
// ─────────────────────────────────────────────────────────────────────────

export function StoryLog({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* fallen log */}
      <ellipse cx={-r * 0.7} cy={r * 0.4} rx={r * 0.3} ry={r * 0.5} fill="#A87147" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-r * 0.7} cy={r * 0.4} rx={r * 0.2} ry={r * 0.35} fill="#C18B5A" />
      <circle cx={-r * 0.7} cy={r * 0.4} r={r * 0.04} fill={STROKE} />
      <rect x={-r * 0.7} y={r * 0.1} width={r * 1.5} height={r * 0.6} fill="#8B5A2B" stroke={STROKE} strokeWidth={2} rx={2} />
      {/* book on log */}
      <g transform={`translate(${r * 0.2}, ${-r * 0.05})`}>
        <path d={`M ${-r * 0.4} 0 L 0 ${-r * 0.18} L ${r * 0.4} 0 L ${r * 0.4} ${r * 0.4} L 0 ${r * 0.22} L ${-r * 0.4} ${r * 0.4} Z`} fill="#F5EBDC" stroke={STROKE} strokeWidth={1.5} />
        {/* page lines left */}
        {[0.05, 0.13, 0.21, 0.29].map(t => (
          <line key={`l${t}`} x1={-r * 0.32} y1={r * t + r * 0.02} x2={-r * 0.06} y2={r * t - r * 0.07} stroke={STROKE_LIGHT} strokeWidth={0.8} />
        ))}
        {[0.05, 0.13, 0.21, 0.29].map(t => (
          <line key={`r${t}`} x1={r * 0.06} y1={r * t - r * 0.07} x2={r * 0.32} y2={r * t + r * 0.02} stroke={STROKE_LIGHT} strokeWidth={0.8} />
        ))}
        {/* spine */}
        <line x1={0} y1={-r * 0.18} x2={0} y2={r * 0.22} stroke={STROKE} strokeWidth={1.2} />
      </g>
    </g>
  );
}

export function WordStump({ x, y, size = 70 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* trunk side */}
      <path d={`M ${-r * 0.6} ${-r * 0.1} L ${-r * 0.6} ${r * 0.5} L ${r * 0.6} ${r * 0.5} L ${r * 0.6} ${-r * 0.1} Z`} fill="#8B5A2B" stroke={STROKE} strokeWidth={2} />
      {/* bark texture */}
      <line x1={-r * 0.4} y1={0} x2={-r * 0.4} y2={r * 0.5} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      <line x1={-r * 0.1} y1={0} x2={-r * 0.1} y2={r * 0.5} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      <line x1={r * 0.2} y1={0} x2={r * 0.2} y2={r * 0.5} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      <line x1={r * 0.45} y1={0} x2={r * 0.45} y2={r * 0.5} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      {/* top — cut surface with rings */}
      <ellipse cx={0} cy={-r * 0.1} rx={r * 0.6} ry={r * 0.18} fill="#C18B5A" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={0} cy={-r * 0.1} rx={r * 0.45} ry={r * 0.13} fill="none" stroke={STROKE} strokeWidth={1} opacity={0.6} />
      <ellipse cx={0} cy={-r * 0.1} rx={r * 0.3} ry={r * 0.085} fill="none" stroke={STROKE} strokeWidth={1} opacity={0.6} />
      <ellipse cx={0} cy={-r * 0.1} rx={r * 0.15} ry={r * 0.04} fill="none" stroke={STROKE} strokeWidth={1} opacity={0.6} />
      {/* a small letter "A" carved on the side */}
      <text x={-r * 0.05} y={r * 0.3} fontSize={r * 0.4} fill={STROKE} fontWeight="bold">A</text>
    </g>
  );
}

export function BlendingBeach({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* sandy patch */}
      <ellipse cx={0} cy={r * 0.3} rx={r} ry={r * 0.5} fill="#F4E0B8" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      {/* shell (spiral) */}
      <g transform={`translate(${-r * 0.1}, 0)`}>
        <ellipse cx={0} cy={0} rx={r * 0.4} ry={r * 0.35} fill="#F8C9D2" stroke={STROKE} strokeWidth={1.5} />
        <ellipse cx={r * 0.05} cy={-r * 0.05} rx={r * 0.28} ry={r * 0.24} fill="#F5B0BD" stroke={STROKE_LIGHT} strokeWidth={1} />
        <path d={`M ${-r * 0.2} ${-r * 0.05} Q ${-r * 0.05} ${-r * 0.15} ${r * 0.1} ${-r * 0.05}`} stroke={STROKE} strokeWidth={1.2} fill="none" />
        <path d={`M ${-r * 0.15} ${r * 0.05} Q ${0} ${r * 0.15} ${r * 0.15} ${r * 0.05}`} stroke={STROKE} strokeWidth={1.2} fill="none" />
      </g>
      {/* pebbles with letters */}
      {[['c', -r * 0.55, r * 0.3], ['a', r * 0.55, r * 0.4], ['t', r * 0.3, r * 0.55]].map(([letter, px, py], i) => (
        <g key={i} transform={`translate(${px},${py})`}>
          <ellipse rx={r * 0.13} ry={r * 0.1} fill="#C8B1A6" stroke={STROKE} strokeWidth={1} />
          <text x={0} y={3} fontSize={r * 0.18} textAnchor="middle" fill={STROKE} fontWeight="bold">{letter as string}</text>
        </g>
      ))}
    </g>
  );
}

export function DigraphBridge({ x, y, size = 70 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* water under bridge */}
      <rect x={-r * 0.9} y={r * 0.25} width={r * 1.8} height={r * 0.3} fill="#A8CFD8" />
      <path d={`M ${-r * 0.9} ${r * 0.35} Q ${-r * 0.5} ${r * 0.3} 0 ${r * 0.35} T ${r * 0.9} ${r * 0.35}`} stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.6} />
      {/* arched bridge */}
      <path
        d={`M ${-r} ${r * 0.3} L ${-r} ${r * 0.05} Q 0 ${-r * 0.4} ${r} ${r * 0.05} L ${r} ${r * 0.3} Z`}
        fill="#A87147" stroke={STROKE} strokeWidth={2}
      />
      {/* arch under */}
      <path d={`M ${-r * 0.6} ${r * 0.3} Q 0 ${-r * 0.05} ${r * 0.6} ${r * 0.3} Z`} fill="#A8CFD8" stroke={STROKE} strokeWidth={1.5} />
      {/* planks */}
      {[-0.7, -0.4, -0.1, 0.2, 0.5, 0.8].map((t, i) => (
        <line key={i} x1={r * t} y1={t < -0.5 || t > 0.5 ? r * 0.05 : r * (-0.4 + Math.abs(t) * 0.6)} x2={r * t} y2={r * 0.05} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      ))}
      {/* railing */}
      <path d={`M ${-r} ${-r * 0.05} Q 0 ${-r * 0.5} ${r} ${-r * 0.05}`} stroke={STROKE} strokeWidth={2} fill="none" />
    </g>
  );
}

export function BeeFlower({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <Flower x={0} y={0} size={r * 0.8} color="#FFD166" />
      {/* bee circling */}
      <g transform={`translate(${r * 0.6}, ${-r * 0.5})`}>
        <ellipse rx={6} ry={4} fill="#FFD166" stroke={STROKE} strokeWidth={1.2} />
        <line x1={-3} y1={-3} x2={-3} y2={3} stroke={STROKE} strokeWidth={1} />
        <line x1={1} y1={-3.5} x2={1} y2={3.5} stroke={STROKE} strokeWidth={1} />
        <ellipse cx={0} cy={-4} rx={3} ry={1.5} fill="#FFFFFF" opacity={0.8} stroke={STROKE} strokeWidth={0.6} />
      </g>
    </g>
  );
}

export function CountingPath({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* row of stones, like skip-counting markers */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((t, i) => (
        <g key={i}>
          <ellipse cx={r * t} cy={r * 0.2} rx={r * 0.16} ry={r * 0.1} fill="#000" opacity={0.18} />
          <ellipse cx={r * t} cy={r * 0.05} rx={r * 0.18} ry={r * 0.13} fill="#A89B8A" stroke={STROKE} strokeWidth={1.5} />
          <ellipse cx={r * t - 1} cy={r * 0} rx={r * 0.08} ry={r * 0.05} fill="#C8BBA9" />
        </g>
      ))}
      {/* tiny number bubbles above */}
      {[2, 4, 6, 8, 10].map((n, i) => (
        <text key={i} x={r * (-0.7 + i * 0.35)} y={-r * 0.3} fontSize={r * 0.22} textAnchor="middle" fill={STROKE} fontWeight="bold">{n}</text>
      ))}
    </g>
  );
}

export function PetalFalls({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <Flower x={0} y={0} size={r * 0.7} color="#E6B0D0" />
      {/* falling petals */}
      <ellipse cx={r * 0.5} cy={r * 0.4} rx={5} ry={9} fill="#E6B0D0" stroke={STROKE_LIGHT} strokeWidth={0.8} transform={`rotate(35 ${r * 0.5} ${r * 0.4})`} />
      <ellipse cx={-r * 0.55} cy={r * 0.3} rx={4} ry={7} fill="#F0BFD8" stroke={STROKE_LIGHT} strokeWidth={0.8} transform={`rotate(-25 ${-r * 0.55} ${r * 0.3})`} />
      <ellipse cx={r * 0.7} cy={r * 0.7} rx={4} ry={6} fill="#E6B0D0" stroke={STROKE_LIGHT} strokeWidth={0.8} transform={`rotate(60 ${r * 0.7} ${r * 0.7})`} />
    </g>
  );
}

export function ButterflyClusters({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* small bush */}
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.7} ry={r * 0.25} fill="#7BA46F" stroke={STROKE} strokeWidth={1.5} />
      {/* 3 butterflies in different positions */}
      {[
        { tx: -r * 0.4, ty: -r * 0.2, color: '#E8A87C', s: 1 },
        { tx: r * 0.3, ty: -r * 0.4, color: '#C38D9E', s: 0.85 },
        { tx: r * 0.05, ty: 0, color: '#FFD166', s: 0.95 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.tx}, ${b.ty}) scale(${b.s})`}>
          <ellipse cx={-5} cy={-1} rx={6} ry={7} fill={b.color} stroke={STROKE} strokeWidth={1.2} />
          <ellipse cx={5} cy={-1} rx={6} ry={7} fill={b.color} stroke={STROKE} strokeWidth={1.2} />
          <ellipse cx={-4} cy={5} rx={4} ry={5} fill={b.color} stroke={STROKE} strokeWidth={1} />
          <ellipse cx={4} cy={5} rx={4} ry={5} fill={b.color} stroke={STROKE} strokeWidth={1} />
          <line x1={0} y1={-6} x2={0} y2={6} stroke={STROKE} strokeWidth={1.5} />
          {/* dot details on wings */}
          <circle cx={-5} cy={-1} r={1.5} fill={STROKE} opacity={0.5} />
          <circle cx={5} cy={-1} r={1.5} fill={STROKE} opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

export function PartWholeFlower({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* a part-whole visual: large flower + 2 small bud "parts" */}
      <line x1={0} y1={r * 0.3} x2={0} y2={r * 1.2} stroke="#6B8E5A" strokeWidth={2} strokeLinecap="round" />
      <Flower x={0} y={0} size={r * 0.5} color="#FFB7C5" />
      <g transform={`translate(${-r * 0.5}, ${r * 0.6})`}>
        <line x1={0} y1={0} x2={0} y2={r * 0.4} stroke="#6B8E5A" strokeWidth={1.5} strokeLinecap="round" />
        <circle cx={0} cy={-r * 0.05} r={r * 0.13} fill="#FFB7C5" stroke={STROKE_LIGHT} strokeWidth={1} />
      </g>
      <g transform={`translate(${r * 0.5}, ${r * 0.6})`}>
        <line x1={0} y1={0} x2={0} y2={r * 0.4} stroke="#6B8E5A" strokeWidth={1.5} strokeLinecap="round" />
        <circle cx={0} cy={-r * 0.05} r={r * 0.13} fill="#FFB7C5" stroke={STROKE_LIGHT} strokeWidth={1} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// LUNA (custom cat)
// ─────────────────────────────────────────────────────────────────────────

export function LunaCat({ size = 44 }: { size?: number }) {
  const r = size / 2;
  return (
    <g>
      {/* shadow */}
      <ellipse cx={0} cy={r * 0.65} rx={r * 0.85} ry={r * 0.18} fill="#000" opacity={0.25} />
      {/* tail */}
      <path
        d={`M ${r * 0.55} ${r * 0.35} Q ${r * 0.95} ${r * 0.1} ${r * 0.85} ${-r * 0.25}`}
        stroke="#E89B6F" strokeWidth={r * 0.18} fill="none" strokeLinecap="round"
      />
      <path
        d={`M ${r * 0.55} ${r * 0.35} Q ${r * 0.95} ${r * 0.1} ${r * 0.85} ${-r * 0.25}`}
        stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round"
      />
      {/* body */}
      <ellipse cx={0} cy={r * 0.3} rx={r * 0.6} ry={r * 0.4} fill="#E89B6F" stroke={STROKE} strokeWidth={2} />
      {/* head */}
      <circle cx={0} cy={-r * 0.1} r={r * 0.42} fill="#E89B6F" stroke={STROKE} strokeWidth={2} />
      {/* ears */}
      <polygon points={`${-r * 0.3},${-r * 0.4} ${-r * 0.45},${-r * 0.6} ${-r * 0.18},${-r * 0.45}`} fill="#E89B6F" stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={`${r * 0.3},${-r * 0.4} ${r * 0.45},${-r * 0.6} ${r * 0.18},${-r * 0.45}`} fill="#E89B6F" stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
      {/* inner ear */}
      <polygon points={`${-r * 0.32},${-r * 0.42} ${-r * 0.38},${-r * 0.52} ${-r * 0.24},${-r * 0.45}`} fill="#F5BFAE" />
      <polygon points={`${r * 0.32},${-r * 0.42} ${r * 0.38},${-r * 0.52} ${r * 0.24},${-r * 0.45}`} fill="#F5BFAE" />
      {/* stripe details */}
      <path d={`M ${-r * 0.3} ${r * 0.1} Q ${-r * 0.2} ${r * 0.2} ${-r * 0.32} ${r * 0.4}`} stroke="#A86844" strokeWidth={1.8} fill="none" />
      <path d={`M ${0} ${r * 0.1} Q ${r * 0.05} ${r * 0.25} ${-r * 0.05} ${r * 0.45}`} stroke="#A86844" strokeWidth={1.8} fill="none" />
      <path d={`M ${r * 0.25} ${r * 0.05} Q ${r * 0.3} ${r * 0.25} ${r * 0.2} ${r * 0.45}`} stroke="#A86844" strokeWidth={1.8} fill="none" />
      {/* eyes (closed for content cat) */}
      <path d={`M ${-r * 0.16} ${-r * 0.12} Q ${-r * 0.1} ${-r * 0.06} ${-r * 0.05} ${-r * 0.12}`} stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path d={`M ${r * 0.05} ${-r * 0.12} Q ${r * 0.1} ${-r * 0.06} ${r * 0.16} ${-r * 0.12}`} stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* nose + mouth */}
      <path d={`M ${-r * 0.04} ${r * 0.02} L ${r * 0.04} ${r * 0.02} L 0 ${r * 0.07} Z`} fill={STROKE} />
      <path d={`M 0 ${r * 0.07} Q ${-r * 0.06} ${r * 0.15} ${-r * 0.09} ${r * 0.1}`} stroke={STROKE} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${r * 0.07} Q ${r * 0.06} ${r * 0.15} ${r * 0.09} ${r * 0.1}`} stroke={STROKE} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* whiskers */}
      <line x1={-r * 0.18} y1={r * 0.05} x2={-r * 0.4} y2={r * 0.02} stroke={STROKE} strokeWidth={0.8} />
      <line x1={-r * 0.18} y1={r * 0.1} x2={-r * 0.4} y2={r * 0.13} stroke={STROKE} strokeWidth={0.8} />
      <line x1={r * 0.18} y1={r * 0.05} x2={r * 0.4} y2={r * 0.02} stroke={STROKE} strokeWidth={0.8} />
      <line x1={r * 0.18} y1={r * 0.1} x2={r * 0.4} y2={r * 0.13} stroke={STROKE} strokeWidth={0.8} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ROUTER — pick the right illustration for a structure code
// ─────────────────────────────────────────────────────────────────────────

export function StructureIllustration({
  code, x, y, size,
}: { code: string; x: number; y: number; size: number }) {
  switch (code) {
    case 'habitat_ant_hill':         return <AntHill x={x} y={y} size={size * 1.1} />;
    case 'habitat_bunny_burrow':     return <BunnyBurrow x={x} y={y} size={size * 1.1} />;
    case 'habitat_frog_pond':        return <FrogPondHabitat x={x} y={y} size={size * 1.1} />;
    case 'habitat_bee_hotel':        return <BeeHotel x={x} y={y} size={size * 1.05} />;
    case 'habitat_butterfly_bush':   return <ButterflyBush x={x} y={y} size={size * 1.1} />;
    case 'habitat_log_pile':         return <LogPile x={x} y={y} size={size * 1.05} />;
    case 'reading_readaloud_log':    return <StoryLog x={x} y={y} size={size * 1.1} />;
    case 'reading_book_stump':       return <WordStump x={x} y={y} size={size * 1.05} />;
    case 'reading_blending_beach':   return <BlendingBeach x={x} y={y} size={size * 1.1} />;
    case 'reading_digraph_bridge':   return <DigraphBridge x={x} y={y} size={size * 1.05} />;
    case 'reading_bee_words':        return <BeeFlower x={x} y={y} size={size * 1.05} />;
    case 'math_counting_path':       return <CountingPath x={x} y={y} size={size * 1.1} />;
    case 'math_bee_swarm':           return <BeeFlower x={x} y={y} size={size * 1.05} />;
    case 'math_butterfly_arrays':    return <ButterflyClusters x={x} y={y} size={size * 1.1} />;
    case 'math_number_bonds':        return <PartWholeFlower x={x} y={y} size={size * 1.05} />;
    case 'math_petal_falls':         return <PetalFalls x={x} y={y} size={size * 1.1} />;
    default:                         return null;
  }
}
