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
  // organic conifer: 4 layered scalloped tiers, slightly rotated for asymmetry
  // each tier is a path with bumpy bottom edge instead of straight triangles.
  const tier = (top: number, halfWidth: number, depth: number, fill: string, dx = 0) => {
    // Start at top apex, curve down to right corner, scallop bottom, curve to left, back up.
    const left = -halfWidth + dx;
    const right = halfWidth + dx;
    const bottom = top + depth;
    // bumps along the bottom edge
    const bumps = 5;
    const segW = (right - left) / bumps;
    let bottomPath = '';
    for (let i = 0; i <= bumps; i++) {
      const px = left + i * segW;
      const py = i % 2 === 0 ? bottom : bottom - depth * 0.08;
      bottomPath += `${i === 0 ? 'L' : 'Q'} ${px - segW * 0.5} ${py + depth * 0.04} ${px} ${py} `;
    }
    return (
      <path
        d={`M ${dx} ${top} Q ${right * 0.5 + dx} ${top + depth * 0.4} ${right} ${bottom} ${bottomPath} Q ${left * 0.5 + dx} ${top + depth * 0.4} ${dx} ${top} Z`}
        fill={fill}
        stroke={STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    );
  };
  return (
    <g transform={`translate(${x},${y})`}>
      {/* trunk: tapered with subtle stripes */}
      <path
        d={`M ${-h * 0.06} ${h * 0.32} L ${-h * 0.08} ${h * 0.55} L ${h * 0.08} ${h * 0.55} L ${h * 0.06} ${h * 0.32} Z`}
        fill="#7B4F2C" stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
      <line x1={-h * 0.04} y1={h * 0.36} x2={-h * 0.04} y2={h * 0.5} stroke={STROKE} strokeWidth={1} opacity={0.5} />
      {/* tiers (back-to-front, each a slightly different green) */}
      {tier(-h * 0.18, h * 0.42, h * 0.3, '#5C7E4F', h * 0.02)}
      {tier(-h * 0.32, h * 0.36, h * 0.28, '#6B8E5A', -h * 0.01)}
      {tier(-h * 0.46, h * 0.28, h * 0.22, '#7BA46F')}
      {tier(-h * 0.58, h * 0.18, h * 0.16, '#8FB67A', h * 0.01)}
      {/* highlight */}
      <ellipse cx={-h * 0.18} cy={-h * 0.3} rx={h * 0.08} ry={h * 0.04} fill="#FFFFFF" opacity={0.25} />
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
  // Cross-section view: green grass strip on top, dirt below with visible
  // burrow tunnel + bunny inside, dangling roots, embedded pebbles.
  return (
    <g transform={`translate(${x},${y})`}>
      {/* dirt cross-section (below ground line) */}
      <path
        d={`M ${-r * 1.05} ${-r * 0.1} L ${r * 1.05} ${-r * 0.1} L ${r * 1.05} ${r * 0.85} Q ${r * 0.5} ${r * 0.95} 0 ${r * 0.9} Q ${-r * 0.5} ${r * 0.95} ${-r * 1.05} ${r * 0.85} Z`}
        fill="#7B5538" stroke={STROKE} strokeWidth={2}
      />
      {/* dirt texture: lighter horizontal layers */}
      <path d={`M ${-r * 1.05} ${r * 0.15} Q 0 ${r * 0.05} ${r * 1.05} ${r * 0.15}`} stroke="#9B7352" strokeWidth={1.2} fill="none" opacity={0.6} />
      <path d={`M ${-r * 1.05} ${r * 0.45} Q 0 ${r * 0.35} ${r * 1.05} ${r * 0.45}`} stroke="#9B7352" strokeWidth={1.2} fill="none" opacity={0.5} />
      {/* embedded pebbles */}
      <ellipse cx={-r * 0.7} cy={r * 0.5} rx={3} ry={2} fill="#5A3B1F" />
      <ellipse cx={r * 0.6} cy={r * 0.3} rx={2.5} ry={1.8} fill="#5A3B1F" />
      <ellipse cx={r * 0.75} cy={r * 0.65} rx={3} ry={2} fill="#5A3B1F" />
      {/* dangling roots */}
      <path d={`M ${-r * 0.9} ${-r * 0.1} Q ${-r * 0.85} ${r * 0.05} ${-r * 0.92} ${r * 0.2}`} stroke={STROKE_LIGHT} strokeWidth={1.2} fill="none" opacity={0.7} />
      <path d={`M ${-r * 0.6} ${-r * 0.1} Q ${-r * 0.55} ${r * 0.0} ${-r * 0.62} ${r * 0.12}`} stroke={STROKE_LIGHT} strokeWidth={1} fill="none" opacity={0.7} />
      <path d={`M ${r * 0.85} ${-r * 0.1} Q ${r * 0.9} ${r * 0.05} ${r * 0.82} ${r * 0.18}`} stroke={STROKE_LIGHT} strokeWidth={1.2} fill="none" opacity={0.7} />
      <path d={`M ${r * 0.55} ${-r * 0.1} Q ${r * 0.6} ${r * 0.0} ${r * 0.52} ${r * 0.1}`} stroke={STROKE_LIGHT} strokeWidth={1} fill="none" opacity={0.7} />

      {/* burrow chamber (rounded oval cavity) */}
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.55} ry={r * 0.32} fill="#3A2818" />
      {/* inner shadow ring on chamber */}
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.55} ry={r * 0.32} fill="none" stroke="#5A3B1F" strokeWidth={2} />
      {/* dirt floor of chamber */}
      <ellipse cx={0} cy={r * 0.6} rx={r * 0.5} ry={r * 0.06} fill="#5A3B1F" />

      {/* bunny inside the burrow */}
      <g transform={`translate(0, ${r * 0.42})`}>
        {/* body */}
        <ellipse cx={0} cy={r * 0.15} rx={r * 0.28} ry={r * 0.18} fill="#E8C493" stroke={STROKE} strokeWidth={1.5} />
        {/* ears */}
        <ellipse cx={-r * 0.13} cy={-r * 0.15} rx={r * 0.07} ry={r * 0.2} fill="#E8C493" stroke={STROKE} strokeWidth={1.3} transform={`rotate(-12 ${-r * 0.13} ${-r * 0.15})`} />
        <ellipse cx={r * 0.07} cy={-r * 0.15} rx={r * 0.07} ry={r * 0.2} fill="#E8C493" stroke={STROKE} strokeWidth={1.3} transform={`rotate(8 ${r * 0.07} ${-r * 0.15})`} />
        {/* inner ear pink */}
        <ellipse cx={-r * 0.13} cy={-r * 0.15} rx={r * 0.025} ry={r * 0.12} fill="#F5BFAE" transform={`rotate(-12 ${-r * 0.13} ${-r * 0.15})`} />
        <ellipse cx={r * 0.07} cy={-r * 0.15} rx={r * 0.025} ry={r * 0.12} fill="#F5BFAE" transform={`rotate(8 ${r * 0.07} ${-r * 0.15})`} />
        {/* head */}
        <circle cx={-r * 0.03} cy={0} r={r * 0.18} fill="#E8C493" stroke={STROKE} strokeWidth={1.5} />
        {/* big round eyes */}
        <circle cx={-r * 0.1} cy={-r * 0.02} r={r * 0.045} fill="#1A1A1A" />
        <circle cx={r * 0.04} cy={-r * 0.02} r={r * 0.045} fill="#1A1A1A" />
        <circle cx={-r * 0.09} cy={-r * 0.03} r={r * 0.015} fill="#FFFFFF" />
        <circle cx={r * 0.05} cy={-r * 0.03} r={r * 0.015} fill="#FFFFFF" />
        {/* nose + cheek blush */}
        <ellipse cx={-r * 0.03} cy={r * 0.06} rx={r * 0.025} ry={r * 0.018} fill="#C38D9E" />
        <ellipse cx={-r * 0.13} cy={r * 0.05} rx={r * 0.04} ry={r * 0.022} fill="#F8C9D2" opacity={0.6} />
        <ellipse cx={r * 0.07} cy={r * 0.05} rx={r * 0.04} ry={r * 0.022} fill="#F8C9D2" opacity={0.6} />
        {/* mouth */}
        <path d={`M ${-r * 0.03} ${r * 0.08} Q ${-r * 0.06} ${r * 0.13} ${-r * 0.09} ${r * 0.1}`} stroke={STROKE} strokeWidth={1.1} fill="none" strokeLinecap="round" />
        <path d={`M ${-r * 0.03} ${r * 0.08} Q ${0} ${r * 0.13} ${r * 0.03} ${r * 0.1}`} stroke={STROKE} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      </g>

      {/* grass strip on top with thick blades */}
      <rect x={-r * 1.05} y={-r * 0.16} width={r * 2.1} height={r * 0.08} fill="#6B8E5A" />
      <path d={`M ${-r * 1.05} ${-r * 0.16} Q -${r * 0.7} ${-r * 0.1} ${-r * 0.4} ${-r * 0.13} Q 0 ${-r * 0.16} ${r * 0.4} ${-r * 0.13} Q ${r * 0.7} ${-r * 0.1} ${r * 1.05} ${-r * 0.16}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" />
      {/* grass blades sticking up */}
      {[-1, -0.7, -0.3, 0.1, 0.4, 0.75, 1].map((t, i) => (
        <path key={i} d={`M ${r * t} ${-r * 0.16} Q ${r * t + (i % 2 === 0 ? 1 : -1)} ${-r * 0.3} ${r * t + (i % 2 === 0 ? 2 : -2)} ${-r * 0.45}`} stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      ))}
      {/* small flower above */}
      <Flower x={-r * 0.55} y={-r * 0.55} size={8} color="#E6B0D0" />
      <Flower x={r * 0.6} y={-r * 0.6} size={8} color="#FFD166" />
    </g>
  );
}

export function FrogPondHabitat({ x, y, size = 80 }: IllustrationProps) {
  const r = size / 2;
  // Renders a complete pond: water + 4 lily pads + flowers + frog + reeds.
  // Designed to overlay/blend with the painted pond background in the scene.

  // Helper: lily pad with notched mouth
  const lilyPad = (cx: number, cy: number, padR: number, rotation = 0, color = '#5C7E4F') => (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
      {/* main pad with V-notch */}
      <path
        d={`M 0 0 L ${padR * 0.15} ${-padR * 0.08} A ${padR} ${padR * 0.85} 0 1 1 ${padR * 0.15} ${padR * 0.08} Z`}
        fill={color} stroke={STROKE} strokeWidth={1.5}
      />
      {/* pad veins */}
      <path d={`M ${padR * 0.15} 0 L ${padR * 0.85} 0`} stroke={STROKE} strokeWidth={0.7} opacity={0.5} />
      <path d={`M ${padR * 0.15} 0 L ${padR * 0.6} ${-padR * 0.55}`} stroke={STROKE} strokeWidth={0.6} opacity={0.45} />
      <path d={`M ${padR * 0.15} 0 L ${padR * 0.6} ${padR * 0.55}`} stroke={STROKE} strokeWidth={0.6} opacity={0.45} />
      {/* highlight */}
      <ellipse cx={padR * 0.55} cy={-padR * 0.3} rx={padR * 0.15} ry={padR * 0.08} fill="#7BA46F" opacity={0.7} />
    </g>
  );

  // Helper: lily flower (water lily blossom)
  const lilyFlower = (cx: number, cy: number, fr: number, color = '#F5E2EE') => (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* outer petals */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <ellipse key={`o${deg}`} rx={fr * 0.4} ry={fr * 0.15} fill={color} stroke={STROKE_LIGHT} strokeWidth={0.8} transform={`rotate(${deg})`} />
      ))}
      {/* inner petals */}
      {[30, 90, 150, 210, 270, 330].map(deg => (
        <ellipse key={`i${deg}`} rx={fr * 0.3} ry={fr * 0.12} fill="#FFFFFF" stroke={STROKE_LIGHT} strokeWidth={0.6} transform={`rotate(${deg})`} />
      ))}
      <circle r={fr * 0.15} fill="#FFD166" stroke={STROKE_LIGHT} strokeWidth={0.6} />
    </g>
  );

  // Reeds at far edge
  const reed = (cx: number, height: number, lean: number) => (
    <g transform={`translate(${cx}, 0)`}>
      <path d={`M 0 ${-r * 0.7} Q ${lean} ${-r * 0.7 - height * 0.5} ${lean * 1.5} ${-r * 0.7 - height}`} stroke="#6B8E5A" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* cattail */}
      <ellipse cx={lean * 1.6} cy={-r * 0.7 - height} rx={3} ry={9} fill="#7B4F2C" stroke={STROKE} strokeWidth={1} />
    </g>
  );

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Reeds at back of pond */}
      {reed(-r * 0.95, r * 0.55, -2)}
      {reed(-r * 0.7, r * 0.65, 1)}
      {reed(r * 0.85, r * 0.5, 2)}
      {reed(r * 1.05, r * 0.6, -1)}

      {/* Lily pads spread across the pond */}
      {lilyPad(-r * 0.65, r * 0.05, r * 0.42, -25, '#7BA46F')}
      {lilyPad(r * 0.55, -r * 0.25, r * 0.36, 165, '#6B8E5A')}
      {lilyPad(r * 0.7, r * 0.3, r * 0.38, 90, '#5C7E4F')}
      {lilyPad(0, r * 0.45, r * 0.45, -110)}

      {/* Lily flowers */}
      {lilyFlower(-r * 0.2, r * 0.08, r * 0.18)}
      {lilyFlower(r * 0.85, -r * 0.05, r * 0.13, '#FFE2E8')}

      {/* Frog on the front-center pad */}
      <g transform={`translate(${-r * 0.05}, ${r * 0.35})`}>
        {/* hind legs (visible behind body) */}
        <ellipse cx={-r * 0.2} cy={r * 0.05} rx={r * 0.13} ry={r * 0.06} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.3} transform={`rotate(20 ${-r * 0.2} ${r * 0.05})`} />
        <ellipse cx={r * 0.2} cy={r * 0.05} rx={r * 0.13} ry={r * 0.06} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.3} transform={`rotate(-20 ${r * 0.2} ${r * 0.05})`} />
        {/* body */}
        <ellipse cx={0} cy={-r * 0.02} rx={r * 0.22} ry={r * 0.17} fill="#7BA46F" stroke={STROKE} strokeWidth={1.5} />
        {/* front legs */}
        <path d={`M ${-r * 0.18} ${r * 0.05} Q ${-r * 0.22} ${r * 0.12} ${-r * 0.16} ${r * 0.13}`} stroke={STROKE} strokeWidth={1.3} fill="#7BA46F" strokeLinecap="round" />
        <path d={`M ${r * 0.18} ${r * 0.05} Q ${r * 0.22} ${r * 0.12} ${r * 0.16} ${r * 0.13}`} stroke={STROKE} strokeWidth={1.3} fill="#7BA46F" strokeLinecap="round" />
        {/* belly highlight */}
        <ellipse cx={0} cy={r * 0.05} rx={r * 0.14} ry={r * 0.07} fill="#A8C99A" opacity={0.75} />
        {/* eye bumps (on top of head) */}
        <circle cx={-r * 0.1} cy={-r * 0.13} r={r * 0.085} fill="#7BA46F" stroke={STROKE} strokeWidth={1.3} />
        <circle cx={r * 0.1} cy={-r * 0.13} r={r * 0.085} fill="#7BA46F" stroke={STROKE} strokeWidth={1.3} />
        {/* eyes */}
        <circle cx={-r * 0.1} cy={-r * 0.13} r={r * 0.05} fill="#FFFFFF" />
        <circle cx={r * 0.1} cy={-r * 0.13} r={r * 0.05} fill="#FFFFFF" />
        <circle cx={-r * 0.09} cy={-r * 0.12} r={r * 0.03} fill="#1A1A1A" />
        <circle cx={r * 0.11} cy={-r * 0.12} r={r * 0.03} fill="#1A1A1A" />
        <circle cx={-r * 0.085} cy={-r * 0.13} r={r * 0.011} fill="#FFFFFF" />
        <circle cx={r * 0.115} cy={-r * 0.13} r={r * 0.011} fill="#FFFFFF" />
        {/* nostrils */}
        <circle cx={-r * 0.025} cy={-r * 0.05} r={1} fill={STROKE} />
        <circle cx={r * 0.025} cy={-r * 0.05} r={1} fill={STROKE} />
        {/* smile */}
        <path d={`M ${-r * 0.13} ${r * 0.0} Q 0 ${r * 0.08} ${r * 0.13} ${r * 0.0}`} stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </g>

      {/* small water ripples */}
      <path d={`M ${-r * 0.4} ${-r * 0.05} Q ${-r * 0.32} ${-r * 0.08} ${-r * 0.25} ${-r * 0.05}`} stroke="#FFFFFF" strokeWidth={1.2} fill="none" opacity={0.55} />
      <path d={`M ${r * 0.3} ${r * 0.55} Q ${r * 0.4} ${r * 0.5} ${r * 0.5} ${r * 0.55}`} stroke="#FFFFFF" strokeWidth={1.2} fill="none" opacity={0.5} />
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
  // Pyramid stack: 3 logs on bottom (cross-sections facing camera),
  // 2 logs on next tier, 1 on top — proper triangular stack.
  // Each log is an ellipse end-cap (cross-section) + slim side rectangle behind.
  const logCap = (cx: number, cy: number, capR: number, fillBark: string, fillRing: string, depthW: number) => (
    <g>
      {/* side body extending into the page */}
      <rect
        x={cx - capR * 0.55}
        y={cy - capR * 0.7}
        width={depthW}
        height={capR * 1.4}
        rx={capR * 0.15}
        fill={fillBark}
        stroke={STROKE} strokeWidth={1.5}
        opacity={0.85}
      />
      {/* shadow under */}
      <ellipse cx={cx} cy={cy + capR * 0.85} rx={capR * 0.85} ry={capR * 0.2} fill="#000" opacity={0.22} />
      {/* end-cap (cross-section) */}
      <circle cx={cx} cy={cy} r={capR} fill={fillBark} stroke={STROKE} strokeWidth={2} />
      {/* inner wood */}
      <circle cx={cx - 1} cy={cy - 1} r={capR * 0.78} fill={fillRing} />
      {/* growth rings */}
      <circle cx={cx - 1} cy={cy - 1} r={capR * 0.55} fill="none" stroke={STROKE} strokeWidth={0.8} opacity={0.55} />
      <circle cx={cx - 1} cy={cy - 1} r={capR * 0.32} fill="none" stroke={STROKE} strokeWidth={0.7} opacity={0.55} />
      {/* core */}
      <circle cx={cx - 1} cy={cy - 1} r={capR * 0.08} fill={STROKE} />
      {/* highlight */}
      <ellipse cx={cx - capR * 0.4} cy={cy - capR * 0.4} rx={capR * 0.18} ry={capR * 0.12} fill="#FFFFFF" opacity={0.18} />
    </g>
  );

  const capR = r * 0.28;
  const depth = r * 0.18;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* bottom row: 3 logs */}
      {logCap(-capR * 1.95, r * 0.55, capR, '#8B5A2B', '#C18B5A', depth)}
      {logCap(0, r * 0.55, capR, '#9B6738', '#C8956A', depth)}
      {logCap(capR * 1.95, r * 0.55, capR, '#8B5A2B', '#C18B5A', depth)}
      {/* middle row: 2 logs nestled between */}
      {logCap(-capR * 0.95, r * 0.55 - capR * 1.65, capR, '#9B6738', '#C8956A', depth)}
      {logCap(capR * 0.95, r * 0.55 - capR * 1.65, capR, '#8B5A2B', '#C18B5A', depth)}
      {/* top: single log */}
      {logCap(0, r * 0.55 - capR * 3.3, capR, '#A87147', '#D69E72', depth)}
      {/* moss/leaves accents */}
      <ellipse cx={-capR * 2.2} cy={r * 0.85} rx={capR * 0.4} ry={capR * 0.12} fill="#7BA46F" opacity={0.85} />
      <ellipse cx={capR * 2.2} cy={r * 0.85} rx={capR * 0.35} ry={capR * 0.1} fill="#7BA46F" opacity={0.85} />
      <ellipse cx={0} cy={r * 0.55 - capR * 3.55} rx={capR * 0.18} ry={capR * 0.07} fill="#7BA46F" opacity={0.9} />
      {/* a tiny mushroom popping out */}
      <g transform={`translate(${-capR * 2.7}, ${r * 0.4})`}>
        <ellipse cx={0} cy={0} rx={4} ry={2.5} fill="#E8A87C" stroke={STROKE} strokeWidth={1} />
        <rect x={-1.5} y={0} width={3} height={4} fill="#F5EBDC" stroke={STROKE} strokeWidth={1} />
        <circle cx={-1.5} cy={-1} r={0.6} fill="#FFFFFF" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SKILL STRUCTURES
// ─────────────────────────────────────────────────────────────────────────

export function StoryLog({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  // Log dimensions: side body height = r * 0.5 (the log's "diameter")
  // The end-cap ellipse must match this height: ry = r * 0.25 (half-height)
  const logTop = r * 0.2;
  const logBottom = r * 0.7;
  const logLeftEnd = -r * 0.65;
  const logRightEnd = r * 0.55;
  const halfHeight = (logBottom - logTop) / 2; // r * 0.25
  const midY = (logBottom + logTop) / 2; // r * 0.45
  return (
    <g transform={`translate(${x},${y})`}>
      {/* log body (side view, slightly tapered) */}
      <path
        d={`M ${logLeftEnd} ${logTop} L ${logRightEnd} ${logTop} L ${logRightEnd} ${logBottom} L ${logLeftEnd} ${logBottom} Z`}
        fill="#8B5A2B" stroke={STROKE} strokeWidth={2}
      />
      {/* bark texture lines */}
      <line x1={logLeftEnd + r * 0.15} y1={logTop + 4} x2={logLeftEnd + r * 0.15} y2={logBottom - 4} stroke={STROKE} strokeWidth={1} opacity={0.4} />
      <line x1={logLeftEnd + r * 0.4} y1={logTop + 5} x2={logLeftEnd + r * 0.4} y2={logBottom - 5} stroke={STROKE} strokeWidth={1} opacity={0.4} />
      <line x1={logLeftEnd + r * 0.7} y1={logTop + 4} x2={logLeftEnd + r * 0.7} y2={logBottom - 4} stroke={STROKE} strokeWidth={1} opacity={0.4} />
      {/* end cap on left — matches log body diameter */}
      <ellipse cx={logLeftEnd} cy={midY} rx={r * 0.18} ry={halfHeight} fill="#A87147" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={logLeftEnd - 1} cy={midY} rx={r * 0.13} ry={halfHeight * 0.75} fill="#C18B5A" />
      <circle cx={logLeftEnd - 2} cy={midY} r={r * 0.035} fill={STROKE} />
      {/* end cap on right */}
      <ellipse cx={logRightEnd} cy={midY} rx={r * 0.16} ry={halfHeight} fill="#9B6738" opacity={0.65} />

      {/* open book sitting on top of log */}
      <g transform={`translate(${r * 0.05}, ${logTop - r * 0.02})`}>
        {/* shadow under book */}
        <ellipse cx={0} cy={4} rx={r * 0.42} ry={r * 0.06} fill="#000" opacity={0.18} />
        {/* book pages forming a V (open) */}
        <path
          d={`M ${-r * 0.4} ${-r * 0.05} L 0 ${-r * 0.22} L ${r * 0.4} ${-r * 0.05} L ${r * 0.4} ${r * 0.05} L 0 ${-r * 0.12} L ${-r * 0.4} ${r * 0.05} Z`}
          fill="#F5EBDC" stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round"
        />
        {/* page lines */}
        {[0, 0.06, 0.12, 0.18].map(t => (
          <line key={`L${t}`} x1={-r * 0.32 + t * r * 0.7} y1={-r * 0.06 - t * r * 0.4} x2={-r * 0.08 - t * r * 0.4} y2={-r * 0.18 + t * r * 0.6} stroke={STROKE_LIGHT} strokeWidth={0.7} opacity={0.7} />
        ))}
        {[0, 0.06, 0.12, 0.18].map(t => (
          <line key={`R${t}`} x1={r * 0.08 + t * r * 0.4} y1={-r * 0.18 + t * r * 0.6} x2={r * 0.32 - t * r * 0.7} y2={-r * 0.06 - t * r * 0.4} stroke={STROKE_LIGHT} strokeWidth={0.7} opacity={0.7} />
        ))}
        {/* spine highlight */}
        <line x1={0} y1={-r * 0.22} x2={0} y2={-r * 0.12} stroke={STROKE} strokeWidth={1.5} />
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
  // 5 stepping stones in a gentle arc, varied shape + slight rotation,
  // each on a darker grass patch suggesting embedded in a path.
  const stones = [
    { tx: -0.85, ty: 0.35, rx: 0.26, ry: 0.18, rot: -8, n: 2 },
    { tx: -0.45, ty: 0.10, rx: 0.30, ry: 0.20, rot: 5, n: 4 },
    { tx: -0.05, ty: -0.10, rx: 0.27, ry: 0.18, rot: -3, n: 6 },
    { tx: 0.40, ty: 0.05, rx: 0.31, ry: 0.21, rot: 8, n: 8 },
    { tx: 0.85, ty: 0.30, rx: 0.28, ry: 0.19, rot: -5, n: 10 },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {/* darker dirt patch under stones */}
      <path
        d={`M ${-r * 1.05} ${r * 0.6} Q ${-r * 0.5} ${r * 0.45} ${0} ${r * 0.3} Q ${r * 0.5} ${r * 0.4} ${r * 1.05} ${r * 0.55} Q ${r * 0.5} ${r * 0.7} ${0} ${r * 0.6} Q ${-r * 0.5} ${r * 0.7} ${-r * 1.05} ${r * 0.6} Z`}
        fill="#8B7560" opacity={0.4}
      />
      {stones.map((s, i) => (
        <g key={i} transform={`translate(${r * s.tx}, ${r * s.ty}) rotate(${s.rot})`}>
          {/* shadow */}
          <ellipse cx={0} cy={r * (s.ry + 0.06)} rx={r * s.rx * 0.95} ry={r * 0.06} fill="#000" opacity={0.25} />
          {/* stone body — irregular ellipse via path */}
          <path
            d={`M ${-r * s.rx} 0 Q ${-r * s.rx * 0.85} ${-r * s.ry} ${-r * s.rx * 0.2} ${-r * s.ry * 1.1} Q ${r * s.rx * 0.6} ${-r * s.ry * 0.95} ${r * s.rx} 0 Q ${r * s.rx * 0.9} ${r * s.ry} ${r * s.rx * 0.1} ${r * s.ry * 1.05} Q ${-r * s.rx * 0.7} ${r * s.ry * 0.95} ${-r * s.rx} 0 Z`}
            fill="#9C9082" stroke={STROKE} strokeWidth={1.5}
          />
          {/* highlight (top-left) */}
          <ellipse cx={-r * s.rx * 0.3} cy={-r * s.ry * 0.45} rx={r * s.rx * 0.45} ry={r * s.ry * 0.3} fill="#C8BBA9" opacity={0.85} />
          {/* small speckle */}
          <circle cx={r * s.rx * 0.35} cy={r * s.ry * 0.2} r={1.2} fill={STROKE} opacity={0.4} />
          {/* number on stone */}
          <text x={0} y={r * 0.05} fontSize={r * 0.22} textAnchor="middle" fill={STROKE} fontWeight="bold">{s.n}</text>
        </g>
      ))}
      {/* a few grass blades poking around stones */}
      <GrassTuft x={-r * 0.65} y={r * 0.55} size={8} />
      <GrassTuft x={r * 0.65} y={r * 0.5} size={8} />
      <GrassTuft x={r * 0.15} y={r * 0.55} size={7} />
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
  // chibi-cute proportions: bigger head, big round eyes with pupils, blush,
  // small raised paw waving, curling tail
  const FUR = '#E89B6F';
  const FUR_DARK = '#A86844';
  return (
    <g>
      {/* shadow */}
      <ellipse cx={0} cy={r * 0.7} rx={r * 0.85} ry={r * 0.15} fill="#000" opacity={0.25} />
      {/* tail (curled up) */}
      <path
        d={`M ${r * 0.4} ${r * 0.4} Q ${r * 0.95} ${r * 0.3} ${r * 1.0} ${-r * 0.05} Q ${r * 0.95} ${-r * 0.4} ${r * 0.7} ${-r * 0.35}`}
        stroke={FUR} strokeWidth={r * 0.2} fill="none" strokeLinecap="round"
      />
      <path
        d={`M ${r * 0.4} ${r * 0.4} Q ${r * 0.95} ${r * 0.3} ${r * 1.0} ${-r * 0.05} Q ${r * 0.95} ${-r * 0.4} ${r * 0.7} ${-r * 0.35}`}
        stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round"
      />
      {/* tail tip lighter */}
      <ellipse cx={r * 0.7} cy={-r * 0.32} rx={r * 0.06} ry={r * 0.05} fill="#F5BFAE" />

      {/* body (smaller, head dominates) */}
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.5} ry={r * 0.3} fill={FUR} stroke={STROKE} strokeWidth={2} />
      {/* belly cream patch */}
      <ellipse cx={0} cy={r * 0.5} rx={r * 0.3} ry={r * 0.18} fill="#F5DBC5" opacity={0.85} />

      {/* paw raised (waving) */}
      <ellipse cx={-r * 0.45} cy={r * 0.18} rx={r * 0.1} ry={r * 0.13} fill={FUR} stroke={STROKE} strokeWidth={1.5} transform={`rotate(-25 ${-r * 0.45} ${r * 0.18})`} />
      {/* paw beans */}
      <circle cx={-r * 0.49} cy={r * 0.13} r={r * 0.025} fill="#F5BFAE" />
      <circle cx={-r * 0.43} cy={r * 0.11} r={r * 0.025} fill="#F5BFAE" />

      {/* other front paw on ground */}
      <ellipse cx={r * 0.18} cy={r * 0.62} rx={r * 0.1} ry={r * 0.06} fill={FUR} stroke={STROKE} strokeWidth={1.5} />

      {/* head — bigger relative to body */}
      <circle cx={0} cy={-r * 0.05} r={r * 0.5} fill={FUR} stroke={STROKE} strokeWidth={2} />

      {/* ears (rounded triangles) */}
      <path d={`M ${-r * 0.36} ${-r * 0.32} L ${-r * 0.5} ${-r * 0.62} Q ${-r * 0.42} ${-r * 0.55} ${-r * 0.22} ${-r * 0.45} Z`} fill={FUR} stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
      <path d={`M ${r * 0.36} ${-r * 0.32} L ${r * 0.5} ${-r * 0.62} Q ${r * 0.42} ${-r * 0.55} ${r * 0.22} ${-r * 0.45} Z`} fill={FUR} stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
      {/* inner ear pink */}
      <path d={`M ${-r * 0.34} ${-r * 0.36} L ${-r * 0.43} ${-r * 0.55} Q ${-r * 0.36} ${-r * 0.5} ${-r * 0.27} ${-r * 0.42} Z`} fill="#F5BFAE" />
      <path d={`M ${r * 0.34} ${-r * 0.36} L ${r * 0.43} ${-r * 0.55} Q ${r * 0.36} ${-r * 0.5} ${r * 0.27} ${-r * 0.42} Z`} fill="#F5BFAE" />

      {/* stripes on head */}
      <path d={`M ${-r * 0.3} ${-r * 0.28} Q ${-r * 0.25} ${-r * 0.32} ${-r * 0.2} ${-r * 0.28}`} stroke={FUR_DARK} strokeWidth={1.5} fill="none" />
      <path d={`M ${r * 0.2} ${-r * 0.28} Q ${r * 0.25} ${-r * 0.32} ${r * 0.3} ${-r * 0.28}`} stroke={FUR_DARK} strokeWidth={1.5} fill="none" />
      <path d={`M ${-r * 0.05} ${-r * 0.4} Q ${0} ${-r * 0.45} ${r * 0.05} ${-r * 0.4}`} stroke={FUR_DARK} strokeWidth={1.5} fill="none" />

      {/* big round eyes with pupils (kawaii style) */}
      <circle cx={-r * 0.17} cy={-r * 0.05} r={r * 0.13} fill="#FFFFFF" stroke={STROKE} strokeWidth={1.5} />
      <circle cx={r * 0.17} cy={-r * 0.05} r={r * 0.13} fill="#FFFFFF" stroke={STROKE} strokeWidth={1.5} />
      {/* iris (green) */}
      <circle cx={-r * 0.17} cy={-r * 0.04} r={r * 0.09} fill="#7BA46F" />
      <circle cx={r * 0.17} cy={-r * 0.04} r={r * 0.09} fill="#7BA46F" />
      {/* pupil (oval, vertical) */}
      <ellipse cx={-r * 0.17} cy={-r * 0.04} rx={r * 0.03} ry={r * 0.07} fill="#1A1A1A" />
      <ellipse cx={r * 0.17} cy={-r * 0.04} rx={r * 0.03} ry={r * 0.07} fill="#1A1A1A" />
      {/* eye shine */}
      <circle cx={-r * 0.13} cy={-r * 0.08} r={r * 0.035} fill="#FFFFFF" />
      <circle cx={r * 0.21} cy={-r * 0.08} r={r * 0.035} fill="#FFFFFF" />

      {/* blush cheeks */}
      <ellipse cx={-r * 0.3} cy={r * 0.1} rx={r * 0.07} ry={r * 0.04} fill="#F5A0AC" opacity={0.6} />
      <ellipse cx={r * 0.3} cy={r * 0.1} rx={r * 0.07} ry={r * 0.04} fill="#F5A0AC" opacity={0.6} />

      {/* tiny pink nose */}
      <path d={`M ${-r * 0.04} ${r * 0.05} L ${r * 0.04} ${r * 0.05} L 0 ${r * 0.1} Z`} fill="#F5A0AC" stroke={STROKE} strokeWidth={1} />

      {/* smile (soft "w" mouth) */}
      <path d={`M 0 ${r * 0.1} Q ${-r * 0.04} ${r * 0.18} ${-r * 0.1} ${r * 0.13}`} stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${r * 0.1} Q ${r * 0.04} ${r * 0.18} ${r * 0.1} ${r * 0.13}`} stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />

      {/* whiskers */}
      <line x1={-r * 0.18} y1={r * 0.08} x2={-r * 0.4} y2={r * 0.04} stroke={STROKE} strokeWidth={0.8} strokeLinecap="round" />
      <line x1={-r * 0.18} y1={r * 0.13} x2={-r * 0.4} y2={r * 0.16} stroke={STROKE} strokeWidth={0.8} strokeLinecap="round" />
      <line x1={r * 0.18} y1={r * 0.08} x2={r * 0.4} y2={r * 0.04} stroke={STROKE} strokeWidth={0.8} strokeLinecap="round" />
      <line x1={r * 0.18} y1={r * 0.13} x2={r * 0.4} y2={r * 0.16} stroke={STROKE} strokeWidth={0.8} strokeLinecap="round" />
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
