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
  // Miyazaki-style broad-leaf: a cloud of overlapping puffs, slight asymmetry,
  // clear outline only on the outer silhouette (via a combined hull).
  const r = size / 2;
  const trunkW = r * 0.26;
  const trunkH = r * 0.55;
  const [darkLeaf, midLeaf, hiLeaf] =
    variant === 1 ? ['#5C7E4F', '#7BA46F', '#A2C794'] :
    variant === 2 ? ['#4F6F42', '#6B8E5A', '#93B884'] :
    ['#426037', '#5C7E4F', '#82A877'];

  // Seed for slight variation between trees
  const v = (variant - 1) * 0.5;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* ground shadow */}
      <ellipse cx={0} cy={r * 0.78} rx={r * 0.7} ry={r * 0.08} fill="#000" opacity={0.18} />

      {/* trunk — tapered, with a little base flare */}
      <path
        d={`M ${-trunkW / 2} ${r * 0.25}
            Q ${-trunkW / 1.6} ${r * 0.55} ${-trunkW / 1.3} ${r * 0.77}
            L ${trunkW / 1.3} ${r * 0.77}
            Q ${trunkW / 1.6} ${r * 0.55} ${trunkW / 2} ${r * 0.25} Z`}
        fill="#8B5A2B" stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
      {/* bark line */}
      <line x1={0} y1={r * 0.3} x2={0} y2={r * 0.72} stroke={STROKE} strokeWidth={0.9} opacity={0.4} />

      {/* Silhouette foliage — a compound hull that outlines the whole canopy
          with a single stroke, so overlapping circles don't look "assembled." */}
      <path
        d={`M ${-r * 0.9} ${-r * 0.1 + v * 10}
            Q ${-r * 1.1} ${-r * 0.55} ${-r * 0.55} ${-r * 0.85}
            Q ${-r * 0.15} ${-r * 1.05} ${r * 0.25} ${-r * 0.95}
            Q ${r * 0.85} ${-r * 0.85} ${r * 1.0} ${-r * 0.35}
            Q ${r * 1.1} ${r * 0.15} ${r * 0.65} ${r * 0.3}
            Q ${r * 0.2} ${r * 0.38} ${-r * 0.25} ${r * 0.32}
            Q ${-r * 0.85} ${r * 0.25} ${-r * 0.9} ${-r * 0.1 + v * 10} Z`}
        fill={darkLeaf} stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
      {/* Inner mid-tone layer — offset slightly, gives volumetric feel */}
      <path
        d={`M ${-r * 0.6} ${-r * 0.25}
            Q ${-r * 0.75} ${-r * 0.65} ${-r * 0.25} ${-r * 0.75}
            Q ${r * 0.15} ${-r * 0.8} ${r * 0.6} ${-r * 0.55}
            Q ${r * 0.85} ${-r * 0.15} ${r * 0.55} ${r * 0.15}
            Q ${r * 0.1} ${r * 0.25} ${-r * 0.3} ${r * 0.18}
            Q ${-r * 0.65} ${r * 0.1} ${-r * 0.6} ${-r * 0.25} Z`}
        fill={midLeaf}
      />
      {/* Highlight puff on upper-left — where the sun hits */}
      <path
        d={`M ${-r * 0.45} ${-r * 0.55}
            Q ${-r * 0.25} ${-r * 0.75} ${r * 0.05} ${-r * 0.6}
            Q ${-r * 0.1} ${-r * 0.4} ${-r * 0.35} ${-r * 0.35}
            Q ${-r * 0.55} ${-r * 0.45} ${-r * 0.45} ${-r * 0.55} Z`}
        fill={hiLeaf} opacity={0.85}
      />
      {/* Tiny dappled sun spots */}
      <circle cx={-r * 0.2} cy={-r * 0.55} r={r * 0.05} fill="#FFFFFF" opacity={0.5} />
      <circle cx={r * 0.15} cy={-r * 0.42} r={r * 0.035} fill="#FFFFFF" opacity={0.35} />
    </g>
  );
}

export function PineTree({ x, y, size = 60 }: IllustrationProps) {
  const h = size;
  // Japanese black pine silhouette — asymmetric horizontal cloud-shelves
  // of foliage, visible curving trunk (kuromatsu style), not stacked cones.
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Ground shadow */}
      <ellipse cx={0} cy={h * 0.58} rx={h * 0.3} ry={h * 0.04} fill="#000" opacity={0.2} />

      {/* Curving trunk — gently S-shaped, tapered, warm bark */}
      <path
        d={`M ${-h * 0.05} ${h * 0.55}
            Q ${-h * 0.02} ${h * 0.38} ${-h * 0.08} ${h * 0.22}
            Q ${-h * 0.12} ${h * 0.02} ${-h * 0.04} ${-h * 0.2}
            Q ${h * 0.02} ${-h * 0.38} ${-h * 0.02} ${-h * 0.52}
            L ${h * 0.02} ${-h * 0.52}
            Q ${h * 0.06} ${-h * 0.38} ${h * 0.0} ${-h * 0.2}
            Q ${-h * 0.08} ${h * 0.02} ${-h * 0.04} ${h * 0.22}
            Q ${h * 0.02} ${h * 0.38} ${h * 0.05} ${h * 0.55} Z`}
        fill="#7B4F2C" stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* Bark striation */}
      <path d={`M ${-h * 0.02} ${h * 0.4} Q ${-h * 0.08} ${h * 0.15} ${-h * 0.06} ${-h * 0.1}`} stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.45} />
      <path d={`M ${h * 0.02} ${h * 0.45} Q ${-h * 0.04} ${h * 0.2} ${-h * 0.02} ${-h * 0.15}`} stroke={STROKE} strokeWidth={0.7} fill="none" opacity={0.35} />

      {/* A side branch reaching right, with its own cloud */}
      <path d={`M ${-h * 0.04} ${h * 0.02} Q ${h * 0.1} ${-h * 0.02} ${h * 0.22} ${-h * 0.04}`} stroke="#7B4F2C" strokeWidth={h * 0.035} strokeLinecap="round" fill="none" />

      {/* Foliage shelves — irregular cloud shapes, layered back to front.
          Each shelf outlined with rough bottom and smooth top, slight asymmetry. */}

      {/* Far back/top cluster — small crown */}
      <path
        d={`M ${-h * 0.1} ${-h * 0.58}
            Q ${-h * 0.18} ${-h * 0.65} ${-h * 0.05} ${-h * 0.72}
            Q ${h * 0.1} ${-h * 0.75} ${h * 0.16} ${-h * 0.6}
            Q ${h * 0.08} ${-h * 0.52} ${-h * 0.02} ${-h * 0.55}
            Q ${-h * 0.12} ${-h * 0.52} ${-h * 0.1} ${-h * 0.58} Z`}
        fill="#6B8E5A" stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round"
      />

      {/* Right-leaning mid shelf (Japanese pine signature) */}
      <path
        d={`M ${h * 0.06} ${-h * 0.28}
            Q ${h * 0.0} ${-h * 0.42} ${h * 0.2} ${-h * 0.45}
            Q ${h * 0.42} ${-h * 0.43} ${h * 0.5} ${-h * 0.32}
            Q ${h * 0.52} ${-h * 0.24} ${h * 0.38} ${-h * 0.22}
            Q ${h * 0.22} ${-h * 0.16} ${h * 0.12} ${-h * 0.22}
            Q ${h * 0.04} ${-h * 0.25} ${h * 0.06} ${-h * 0.28} Z`}
        fill="#5C7E4F" stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* mid shelf highlight */}
      <path
        d={`M ${h * 0.18} ${-h * 0.4}
            Q ${h * 0.3} ${-h * 0.42} ${h * 0.4} ${-h * 0.35}
            Q ${h * 0.3} ${-h * 0.3} ${h * 0.2} ${-h * 0.33}
            Q ${h * 0.14} ${-h * 0.36} ${h * 0.18} ${-h * 0.4} Z`}
        fill="#7BA46F"
      />

      {/* Left-leaning lower shelf (bigger, asymmetric) */}
      <path
        d={`M ${-h * 0.45} ${-h * 0.08}
            Q ${-h * 0.52} ${-h * 0.24} ${-h * 0.35} ${-h * 0.28}
            Q ${-h * 0.1} ${-h * 0.32} ${h * 0.05} ${-h * 0.22}
            Q ${h * 0.12} ${-h * 0.1} ${h * 0.02} ${-h * 0.02}
            Q ${-h * 0.18} ${h * 0.02} ${-h * 0.35} ${-h * 0.02}
            Q ${-h * 0.5} ${-h * 0.04} ${-h * 0.45} ${-h * 0.08} Z`}
        fill="#5C7E4F" stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* lower shelf highlight puff */}
      <path
        d={`M ${-h * 0.35} ${-h * 0.18}
            Q ${-h * 0.2} ${-h * 0.24} ${-h * 0.05} ${-h * 0.2}
            Q ${-h * 0.1} ${-h * 0.12} ${-h * 0.22} ${-h * 0.12}
            Q ${-h * 0.35} ${-h * 0.14} ${-h * 0.35} ${-h * 0.18} Z`}
        fill="#7BA46F"
      />

      {/* Tiny low-right cloud on the branch */}
      <ellipse cx={h * 0.28} cy={-h * 0.04} rx={h * 0.1} ry={h * 0.07} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.5} />
      <ellipse cx={h * 0.28} cy={-h * 0.06} rx={h * 0.06} ry={h * 0.03} fill="#8FB67A" />

      {/* Needle suggestions — tiny dark flecks on each cloud */}
      <circle cx={-h * 0.2} cy={-h * 0.18} r={0.8} fill={STROKE} opacity={0.5} />
      <circle cx={h * 0.3}  cy={-h * 0.3}  r={0.8} fill={STROKE} opacity={0.5} />
      <circle cx={-h * 0.02}cy={-h * 0.62} r={0.7} fill={STROKE} opacity={0.5} />
      <circle cx={h * 0.26} cy={-h * 0.02} r={0.7} fill={STROKE} opacity={0.5} />

      {/* A subtle dappled highlight on the top cloud */}
      <circle cx={h * 0.02} cy={-h * 0.68} r={h * 0.04} fill="#FFFFFF" opacity={0.35} />
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
  // Miyazaki mossy burrow: a grass-and-moss mound (not a dirt cross-section)
  // with a soft arched entrance framed by roots, a bunny peeking out, ferns
  // and mushrooms at the base, a small flower crown on top.
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Ground shadow */}
      <ellipse cx={0} cy={r * 0.92} rx={r * 1.15} ry={r * 0.12} fill="#000" opacity={0.2} />

      {/* Mound — all green moss, generous round shape, slight asymmetry */}
      <path
        d={`M ${-r * 1.15} ${r * 0.85}
            Q ${-r * 1.18} ${r * 0.25} ${-r * 0.75} ${-r * 0.2}
            Q ${-r * 0.35} ${-r * 0.7} ${r * 0.05} ${-r * 0.8}
            Q ${r * 0.55} ${-r * 0.75} ${r * 0.92} ${-r * 0.35}
            Q ${r * 1.2} ${r * 0.15} ${r * 1.18} ${r * 0.85} Z`}
        fill="#6B8E5A" stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
      {/* Darker moss under-layer for depth */}
      <path
        d={`M ${-r * 1.1} ${r * 0.85}
            Q ${-r * 1.0} ${r * 0.4} ${-r * 0.55} ${r * 0.1}
            Q ${-r * 0.1} ${-r * 0.1} ${r * 0.4} ${r * 0.05}
            Q ${r * 0.95} ${r * 0.2} ${r * 1.12} ${r * 0.85} Z`}
        fill="#5C7E4F" opacity={0.75}
      />
      {/* Lighter sun-lit highlight puff on upper-left */}
      <path
        d={`M ${-r * 0.85} ${-r * 0.1}
            Q ${-r * 0.5} ${-r * 0.55} ${-r * 0.1} ${-r * 0.58}
            Q ${-r * 0.4} ${-r * 0.25} ${-r * 0.75} ${-r * 0.05}
            Q ${-r * 0.9} ${-r * 0.05} ${-r * 0.85} ${-r * 0.1} Z`}
        fill="#8FB67A" opacity={0.85}
      />

      {/* Moss dapples scattered on the mound */}
      <circle cx={r * 0.5} cy={-r * 0.3} r={r * 0.06} fill="#8FB67A" opacity={0.7} />
      <circle cx={-r * 0.3} cy={r * 0.2} r={r * 0.05} fill="#8FB67A" opacity={0.65} />
      <circle cx={r * 0.7} cy={r * 0.3} r={r * 0.04} fill="#8FB67A" opacity={0.7} />

      {/* Arched entrance — rounded pointed arch, warm dark inside */}
      <path
        d={`M ${-r * 0.3} ${r * 0.9}
            L ${-r * 0.3} ${r * 0.35}
            Q ${-r * 0.3} ${r * 0.1} 0 ${r * 0.08}
            Q ${r * 0.3} ${r * 0.1} ${r * 0.3} ${r * 0.35}
            L ${r * 0.3} ${r * 0.9} Z`}
        fill="#2E1D10"
      />
      {/* Warm glow inside the entrance */}
      <ellipse cx={0} cy={r * 0.6} rx={r * 0.22} ry={r * 0.18} fill="#7A4520" opacity={0.6} />
      <ellipse cx={0} cy={r * 0.75} rx={r * 0.12} ry={r * 0.05} fill="#FFD98A" opacity={0.3} />
      {/* Arched opening outline */}
      <path
        d={`M ${-r * 0.3} ${r * 0.9}
            L ${-r * 0.3} ${r * 0.35}
            Q ${-r * 0.3} ${r * 0.1} 0 ${r * 0.08}
            Q ${r * 0.3} ${r * 0.1} ${r * 0.3} ${r * 0.35}
            L ${r * 0.3} ${r * 0.9}`}
        fill="none" stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />

      {/* Twisting tree roots framing the arch (Miyazaki signature) */}
      <path
        d={`M ${-r * 0.3} ${r * 0.08}
            Q ${-r * 0.5} ${-r * 0.05} ${-r * 0.55} ${-r * 0.25}
            Q ${-r * 0.45} ${-r * 0.1} ${-r * 0.3} ${-r * 0.02}`}
        stroke="#7B4F2C" strokeWidth={r * 0.06} fill="none" strokeLinecap="round"
      />
      <path
        d={`M ${r * 0.3} ${r * 0.08}
            Q ${r * 0.52} ${-r * 0.08} ${r * 0.62} ${-r * 0.3}
            Q ${r * 0.45} ${-r * 0.1} ${r * 0.3} 0`}
        stroke="#7B4F2C" strokeWidth={r * 0.055} fill="none" strokeLinecap="round"
      />
      {/* root outline highlights */}
      <path d={`M ${-r * 0.3} ${r * 0.04} Q ${-r * 0.45} ${-r * 0.05} ${-r * 0.52} ${-r * 0.2}`} stroke={STROKE} strokeWidth={1} fill="none" opacity={0.6} />
      <path d={`M ${r * 0.3} ${r * 0.04} Q ${r * 0.48} ${-r * 0.08} ${r * 0.58} ${-r * 0.25}`} stroke={STROKE} strokeWidth={1} fill="none" opacity={0.6} />

      {/* Bunny peeking out — sitting just at the entrance, properly cute */}
      <g transform={`translate(0, ${r * 0.42})`}>
        {/* back body silhouette (partly in shadow) */}
        <ellipse cx={0} cy={r * 0.22} rx={r * 0.25} ry={r * 0.15} fill="#D9B38A" opacity={0.85} />
        {/* bigger round head for baby-animal cuteness */}
        <circle cx={0} cy={0} r={r * 0.22} fill="#F5D8AE" stroke={STROKE} strokeWidth={1.5} />
        {/* ears — short, round, relaxed (soft ears = cute; tall/pointed = alert) */}
        <ellipse cx={-r * 0.1} cy={-r * 0.22} rx={r * 0.07} ry={r * 0.13}
                 fill="#F5D8AE" stroke={STROKE} strokeWidth={1.3}
                 transform={`rotate(-22 ${-r * 0.1} ${-r * 0.22})`} />
        <ellipse cx={r * 0.1} cy={-r * 0.22} rx={r * 0.07} ry={r * 0.13}
                 fill="#F5D8AE" stroke={STROKE} strokeWidth={1.3}
                 transform={`rotate(22 ${r * 0.1} ${-r * 0.22})`} />
        {/* inner ear pink — cozy warm tone */}
        <ellipse cx={-r * 0.1} cy={-r * 0.2} rx={r * 0.03} ry={r * 0.08}
                 fill="#F5BFAE" transform={`rotate(-22 ${-r * 0.1} ${-r * 0.2})`} />
        <ellipse cx={r * 0.1} cy={-r * 0.2} rx={r * 0.03} ry={r * 0.08}
                 fill="#F5BFAE" transform={`rotate(22 ${r * 0.1} ${-r * 0.2})`} />
        {/* BIG round eyes with a big highlight — the key to "cute not mad".
            Eyes are placed wide and low (babyface proportions). */}
        <circle cx={-r * 0.08} cy={r * 0.0} r={r * 0.05} fill="#2E1D10" />
        <circle cx={r * 0.08}  cy={r * 0.0} r={r * 0.05} fill="#2E1D10" />
        {/* big glossy highlights */}
        <circle cx={-r * 0.065} cy={-r * 0.015} r={r * 0.022} fill="#FFFFFF" />
        <circle cx={r * 0.095}  cy={-r * 0.015} r={r * 0.022} fill="#FFFFFF" />
        {/* tiny secondary highlight at bottom of each eye */}
        <circle cx={-r * 0.09} cy={r * 0.015} r={r * 0.008} fill="#FFFFFF" opacity={0.8} />
        <circle cx={r * 0.07}  cy={r * 0.015} r={r * 0.008} fill="#FFFFFF" opacity={0.8} />
        {/* pink nose — a soft triangle */}
        <path d={`M ${-r * 0.02} ${r * 0.08} L ${r * 0.02} ${r * 0.08} L 0 ${r * 0.1} Z`}
              fill="#E88FA0" stroke={STROKE} strokeWidth={0.7} strokeLinejoin="round" />
        {/* Mouth — a tiny smile (two gentle arcs under the nose) */}
        <path d={`M 0 ${r * 0.105} Q ${-r * 0.025} ${r * 0.13} ${-r * 0.045} ${r * 0.12}`}
              stroke={STROKE} strokeWidth={1} fill="none" strokeLinecap="round" />
        <path d={`M 0 ${r * 0.105} Q ${r * 0.025} ${r * 0.13} ${r * 0.045} ${r * 0.12}`}
              stroke={STROKE} strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* warm cheek blush — more present, gives the "awww" */}
        <ellipse cx={-r * 0.15} cy={r * 0.06} rx={r * 0.04} ry={r * 0.022}
                 fill="#F8B4B4" opacity={0.65} />
        <ellipse cx={r * 0.15} cy={r * 0.06} rx={r * 0.04} ry={r * 0.022}
                 fill="#F8B4B4" opacity={0.65} />
        {/* soft forehead fluff highlight */}
        <ellipse cx={-r * 0.05} cy={-r * 0.12} rx={r * 0.06} ry={r * 0.04}
                 fill="#FFFFFF" opacity={0.35} />
      </g>

      {/* Tall grass blades on top of the mound */}
      {[-0.8, -0.5, -0.15, 0.2, 0.55, 0.85].map((t, i) => {
        const bx = r * t;
        const by = -r * (0.7 - Math.abs(t) * 0.35);
        return (
          <path
            key={i}
            d={`M ${bx} ${by} Q ${bx + (i % 2 === 0 ? 2 : -2)} ${by - 14} ${bx + (i % 2 === 0 ? 4 : -4)} ${by - 28}`}
            stroke="#5C7E4F"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}

      {/* Fern fronds to the left and right of the arch */}
      <g transform={`translate(${-r * 0.55}, ${r * 0.62})`}>
        <path d="M 0 0 Q -4 -8 -8 -14 Q -12 -20 -14 -26" stroke="#5C7E4F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {[0.3, 0.55, 0.8].map((t, i) => (
          <path key={i} d={`M ${-t * 10} ${-t * 18} Q ${-t * 15 - 4} ${-t * 18 - 2} ${-t * 18 - 6} ${-t * 18 + 2}`} stroke="#7BA46F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        ))}
        {[0.3, 0.55, 0.8].map((t, i) => (
          <path key={`r${i}`} d={`M ${-t * 10} ${-t * 18} Q ${-t * 5 + 4} ${-t * 18 - 3} ${-t * 2 + 8} ${-t * 18 - 1}`} stroke="#7BA46F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        ))}
      </g>
      <g transform={`translate(${r * 0.58}, ${r * 0.65})`}>
        <path d="M 0 0 Q 4 -9 9 -15 Q 13 -20 16 -25" stroke="#5C7E4F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {[0.3, 0.55, 0.8].map((t, i) => (
          <path key={i} d={`M ${t * 10} ${-t * 18} Q ${t * 15 + 4} ${-t * 18 - 2} ${t * 18 + 6} ${-t * 18 + 2}`} stroke="#7BA46F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        ))}
        {[0.3, 0.55, 0.8].map((t, i) => (
          <path key={`r${i}`} d={`M ${t * 10} ${-t * 18} Q ${t * 5 - 4} ${-t * 18 - 3} ${t * 2 - 8} ${-t * 18 - 1}`} stroke="#7BA46F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        ))}
      </g>

      {/* Red mushroom at the base */}
      <g transform={`translate(${-r * 0.85}, ${r * 0.82})`}>
        <ellipse cx={0} cy={-1} rx={7} ry={4} fill="#D4644F" stroke={STROKE} strokeWidth={1.2} />
        <circle cx={-2} cy={-2} r={1.2} fill="#FFFFFF" />
        <circle cx={2.5} cy={-1} r={1} fill="#FFFFFF" />
        <rect x={-2.5} y={-1} width={5} height={7} fill="#FFFDF2" stroke={STROKE} strokeWidth={1} />
      </g>

      {/* tiny pink flowers nestled on top */}
      <Flower x={-r * 0.25} y={-r * 0.55} size={6} color="#FFB7C5" />
      <Flower x={r * 0.4} y={-r * 0.5} size={6} color="#FFD166" />
      <Flower x={r * 0.05} y={-r * 0.72} size={5} color="#E6B0D0" />
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

      {/* Two background pads — angled close to the front pad's slight
          top-down tilt (-8°) instead of the previous -25° / 165° which
          made one read as upside-down. Subtle variation so they don't
          look like clones, but all three now read as the same kind of
          pad seen from above. */}
      {lilyPad(-r * 1.15, -r * 0.15, r * 0.28, -12, '#6B8E5A')}   // upper-left
      {lilyPad( r * 1.0,  -r * 0.35, r * 0.24,   6, '#5C7E4F')}   // upper-right

      {/* FRONT pad — a clean disc (no V-notch) under the frog. Lighter
          sage, tilted 8° so it looks like a top-down lily pad, with
          radiating veins and a water shadow. Fully contains the frog. */}
      <g transform={`translate(${r * 0.1}, ${r * 0.4}) rotate(-8)`}>
        {/* shadow in the water beneath the pad */}
        <ellipse cx={0} cy={r * 0.06} rx={r * 0.58} ry={r * 0.14} fill="#5A8A80" opacity={0.35} />
        {/* pad body */}
        <ellipse cx={0} cy={0} rx={r * 0.56} ry={r * 0.28} fill="#A2C794" stroke={STROKE} strokeWidth={1.5} />
        {/* inner lighter gradient disc */}
        <ellipse cx={-r * 0.05} cy={-r * 0.04} rx={r * 0.42} ry={r * 0.2} fill="#B8D4A8" opacity={0.85} />
        {/* radiating veins */}
        <line x1={-r * 0.45} y1={0} x2={r * 0.45} y2={0} stroke={STROKE} strokeWidth={0.7} opacity={0.35} />
        <line x1={-r * 0.35} y1={-r * 0.18} x2={r * 0.35} y2={r * 0.18} stroke={STROKE} strokeWidth={0.6} opacity={0.3} />
        <line x1={-r * 0.35} y1={r * 0.18} x2={r * 0.35} y2={-r * 0.18} stroke={STROKE} strokeWidth={0.6} opacity={0.3} />
        <line x1={0} y1={-r * 0.22} x2={0} y2={r * 0.22} stroke={STROKE} strokeWidth={0.6} opacity={0.3} />
        {/* upper-edge highlight arc */}
        <path d={`M ${-r * 0.4} ${-r * 0.22} Q 0 ${-r * 0.3} ${r * 0.4} ${-r * 0.22}`} stroke="#D6E8C2" strokeWidth={1.5} fill="none" opacity={0.9} />
      </g>

      {/* Lily flower on the upper-left pad */}
      {lilyFlower(-r * 1.02, -r * 0.2, r * 0.13)}

      {/* Frog sits on the angled disc pad at (r*0.1, r*0.4). Centered
          horizontally on the pad; body y slightly above pad center so the
          frog appears perched on the disc surface. */}
      <g transform={`translate(${r * 0.1}, ${r * 0.33})`}>
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
  // Whimsical "blending stones": three rounded stepping stones in a little
  // brook, each with a lowercase letter (c · a · t) that spell together into
  // a word. Water flows beneath with soft ripples. No more awkward shell.
  const letters: [string, number, number][] = [
    ['c', -r * 0.6,  r * 0.05],
    ['a',  0,        r * 0.25],
    ['t',  r * 0.6,  r * 0.05],
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Ground shadow */}
      <ellipse cx={0} cy={r * 0.8} rx={r * 1.1} ry={r * 0.1} fill="#000" opacity={0.18} />

      {/* Brook — soft irregular blue patch (the water this sits in) */}
      <path
        d={`M ${-r * 1.05} ${r * 0.1}
            Q ${-r * 0.7} ${-r * 0.15} ${-r * 0.2} ${-r * 0.05}
            Q ${r * 0.4} ${r * 0.1} ${r * 1.05} ${-r * 0.05}
            Q ${r * 1.1} ${r * 0.3} ${r * 0.7} ${r * 0.45}
            Q ${r * 0.15} ${r * 0.55} ${-r * 0.3} ${r * 0.48}
            Q ${-r * 0.9} ${r * 0.4} ${-r * 1.05} ${r * 0.1} Z`}
        fill="#A8CFD8" stroke="#5A8A80" strokeWidth={1.4} strokeLinejoin="round" opacity={0.92}
      />
      {/* darker water at the edges */}
      <path
        d={`M ${-r * 1.0} ${r * 0.12}
            Q ${-r * 0.7} ${-r * 0.1} ${-r * 0.2} ${-r * 0.02}
            Q ${r * 0.4} ${r * 0.12} ${r * 1.0} ${-r * 0.02}`}
        stroke="#8DB7C2" strokeWidth={2.5} fill="none" opacity={0.6}
      />
      {/* shimmer highlights */}
      <ellipse cx={-r * 0.4} cy={r * 0.22} rx={r * 0.14} ry={r * 0.03} fill="#FFFFFF" opacity={0.5} />
      <ellipse cx={r * 0.35} cy={r * 0.3}  rx={r * 0.1}  ry={r * 0.025} fill="#FFFFFF" opacity={0.45} />
      {/* little concentric ripple */}
      <ellipse cx={r * 0.25} cy={r * 0.18} rx={r * 0.08} ry={r * 0.018} fill="none" stroke="#FFFFFF" strokeWidth={0.7} opacity={0.5} />

      {/* Stepping stones with letters — laid in a shallow arc, so they
          read as a path you could hop across. */}
      {letters.map(([letter, px, py], i) => (
        <g key={i} transform={`translate(${px},${py})`}>
          {/* stone shadow on water */}
          <ellipse cx={0} cy={r * 0.1} rx={r * 0.24} ry={r * 0.05} fill="#000" opacity={0.18} />
          {/* stone body */}
          <ellipse cx={0} cy={0} rx={r * 0.26} ry={r * 0.16} fill="#D6CCB8" stroke={STROKE} strokeWidth={1.4} />
          {/* stone top highlight */}
          <ellipse cx={-r * 0.05} cy={-r * 0.05} rx={r * 0.18} ry={r * 0.08} fill="#EDE6D1" opacity={0.8} />
          {/* bit of moss */}
          <ellipse cx={r * 0.12} cy={r * 0.04} rx={r * 0.06} ry={r * 0.018} fill="#8FB67A" opacity={0.75} />
          {/* letter */}
          <text x={0} y={r * 0.06} fontSize={r * 0.32} textAnchor="middle" fill={STROKE} fontWeight="700" fontStyle="italic">
            {letter}
          </text>
        </g>
      ))}

      {/* A reed on the left bank */}
      <path d={`M ${-r * 0.95} ${r * 0.1} Q ${-r * 0.9} ${-r * 0.25} ${-r * 0.82} ${-r * 0.45}`} stroke="#6B8E5A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <ellipse cx={-r * 0.82} cy={-r * 0.5} rx={1.5} ry={5} fill="#7B4F2C" stroke={STROKE} strokeWidth={0.8} />
      {/* Tiny yellow flower on the right bank */}
      <Flower x={r * 0.95} y={-r * 0.15} size={5} color="#FFD166" />
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
// GARDEN STORIES — a storytelling spot (bench + open book + tea + mushrooms)
// ─────────────────────────────────────────────────────────────────────────

export function GardenStories({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Ground shadow */}
      <ellipse cx={0} cy={r * 0.72} rx={r * 0.95} ry={r * 0.12} fill="#000" opacity={0.18} />

      {/* Little grass clump base */}
      <path d={`M ${-r * 0.85} ${r * 0.65} Q ${-r * 0.55} ${r * 0.5} ${-r * 0.3} ${r * 0.6} Q 0 ${r * 0.48} ${r * 0.3} ${r * 0.6} Q ${r * 0.6} ${r * 0.5} ${r * 0.85} ${r * 0.65} Z`}
            fill="#7BA46F" stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" />

      {/* Wooden bench — two legs and a seat plank */}
      <rect x={-r * 0.7} y={r * 0.1} width={r * 1.4} height={r * 0.14} rx={r * 0.04} fill="#A87147" stroke={STROKE} strokeWidth={1.8} />
      {/* bench grain */}
      <line x1={-r * 0.65} y1={r * 0.13} x2={r * 0.65} y2={r * 0.13} stroke={STROKE} strokeWidth={0.8} opacity={0.35} />
      <line x1={-r * 0.65} y1={r * 0.2} x2={r * 0.65} y2={r * 0.2} stroke={STROKE} strokeWidth={0.8} opacity={0.35} />
      {/* legs */}
      <rect x={-r * 0.62} y={r * 0.24} width={r * 0.14} height={r * 0.3} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.5} />
      <rect x={r * 0.48} y={r * 0.24} width={r * 0.14} height={r * 0.3} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.5} />

      {/* Open book on the bench — two gently curving pages */}
      <g transform={`translate(0, ${r * 0.02})`}>
        {/* back shadow */}
        <path d={`M ${-r * 0.42} ${r * 0.08} Q 0 ${r * 0.1} ${r * 0.42} ${r * 0.08} L ${r * 0.42} ${r * 0.05} Q 0 ${r * 0.08} ${-r * 0.42} ${r * 0.05} Z`} fill={STROKE} opacity={0.5} />
        {/* left page */}
        <path d={`M ${-r * 0.42} ${r * 0.05} Q ${-r * 0.25} ${-r * 0.05} 0 ${-r * 0.05} L 0 ${r * 0.08} Q ${-r * 0.25} ${r * 0.05} ${-r * 0.42} ${r * 0.08} Z`}
              fill="#FFFDF2" stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" />
        {/* right page */}
        <path d={`M ${r * 0.42} ${r * 0.05} Q ${r * 0.25} ${-r * 0.05} 0 ${-r * 0.05} L 0 ${r * 0.08} Q ${r * 0.25} ${r * 0.05} ${r * 0.42} ${r * 0.08} Z`}
              fill="#F5E6C9" stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" />
        {/* text lines */}
        <line x1={-r * 0.33} y1={0} x2={-r * 0.1} y2={0} stroke={STROKE} strokeWidth={0.8} opacity={0.5} />
        <line x1={-r * 0.33} y1={r * 0.03} x2={-r * 0.08} y2={r * 0.03} stroke={STROKE} strokeWidth={0.8} opacity={0.5} />
        <line x1={r * 0.1}  y1={0} x2={r * 0.33} y2={0} stroke={STROKE} strokeWidth={0.8} opacity={0.5} />
        <line x1={r * 0.08} y1={r * 0.03} x2={r * 0.33} y2={r * 0.03} stroke={STROKE} strokeWidth={0.8} opacity={0.5} />
        {/* spine binding */}
        <line x1={0} y1={-r * 0.05} x2={0} y2={r * 0.08} stroke={STROKE} strokeWidth={1} />
      </g>

      {/* Little mushroom beside the bench */}
      <g transform={`translate(${-r * 0.85}, ${r * 0.45})`}>
        <ellipse cx={0} cy={0} rx={r * 0.12} ry={r * 0.07} fill="#E8A87C" stroke={STROKE} strokeWidth={1.3} />
        <rect x={-r * 0.04} y={0} width={r * 0.08} height={r * 0.12} fill="#FFFDF2" stroke={STROKE} strokeWidth={1.2} />
        <circle cx={-r * 0.04} cy={-r * 0.02} r={r * 0.018} fill="#FFFFFF" />
        <circle cx={r * 0.035} cy={-r * 0.015} r={r * 0.015} fill="#FFFFFF" />
      </g>

      {/* Floating idea: wisp / question spark rising from the book */}
      <circle cx={r * 0.25} cy={-r * 0.35} r={2.5} fill="#FFD166" opacity={0.85} />
      <circle cx={r * 0.4} cy={-r * 0.5} r={1.8} fill="#FFD166" opacity={0.7} />
      <circle cx={r * 0.15} cy={-r * 0.2} r={2} fill="#FFD166" opacity={0.9} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HUNDRED'S HOLLOW — an upright hollow tree stump with mushrooms
// ─────────────────────────────────────────────────────────────────────────

export function HundredsHollow({ x, y, size = 60 }: IllustrationProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Shadow */}
      <ellipse cx={0} cy={r * 0.78} rx={r * 0.85} ry={r * 0.1} fill="#000" opacity={0.22} />

      {/* Stump body (upright cylinder) */}
      <path
        d={`M ${-r * 0.6} ${-r * 0.3}
            Q ${-r * 0.65} ${r * 0.7} ${-r * 0.55} ${r * 0.72}
            L ${r * 0.55} ${r * 0.72}
            Q ${r * 0.65} ${r * 0.7} ${r * 0.6} ${-r * 0.3}
            Q ${r * 0.35} ${-r * 0.45} 0 ${-r * 0.45}
            Q ${-r * 0.35} ${-r * 0.45} ${-r * 0.6} ${-r * 0.3} Z`}
        fill="#9B6738" stroke={STROKE} strokeWidth={2}
      />

      {/* Bark texture — vertical grooves */}
      <path d={`M ${-r * 0.4} ${-r * 0.2} Q ${-r * 0.38} ${r * 0.2} ${-r * 0.35} ${r * 0.6}`} stroke={STROKE} strokeWidth={1.2} fill="none" opacity={0.45} />
      <path d={`M ${-r * 0.1} ${-r * 0.35} Q ${-r * 0.08} ${r * 0.2} ${-r * 0.05} ${r * 0.65}`} stroke={STROKE} strokeWidth={1.1} fill="none" opacity={0.4} />
      <path d={`M ${r * 0.2} ${-r * 0.3} Q ${r * 0.22} ${r * 0.2} ${r * 0.25} ${r * 0.62}`} stroke={STROKE} strokeWidth={1.2} fill="none" opacity={0.45} />
      <path d={`M ${r * 0.42} ${-r * 0.2} Q ${r * 0.44} ${r * 0.2} ${r * 0.45} ${r * 0.6}`} stroke={STROKE} strokeWidth={1.1} fill="none" opacity={0.4} />

      {/* Top of stump — oval ring (cross-section) with growth rings */}
      <ellipse cx={0} cy={-r * 0.35} rx={r * 0.6} ry={r * 0.14} fill="#B8824F" stroke={STROKE} strokeWidth={1.8} />
      <ellipse cx={0} cy={-r * 0.35} rx={r * 0.48} ry={r * 0.11} fill="none" stroke="#8B5A2B" strokeWidth={0.9} opacity={0.6} />
      <ellipse cx={0} cy={-r * 0.35} rx={r * 0.32} ry={r * 0.075} fill="none" stroke="#8B5A2B" strokeWidth={0.9} opacity={0.55} />
      <ellipse cx={0} cy={-r * 0.35} rx={r * 0.16} ry={r * 0.04} fill="none" stroke="#8B5A2B" strokeWidth={0.9} opacity={0.5} />

      {/* Hollow opening in the front — dark cavity with warm glow from inside */}
      <ellipse cx={0} cy={r * 0.28} rx={r * 0.28} ry={r * 0.32} fill="#2E1D10" />
      {/* inner warm glow */}
      <ellipse cx={0} cy={r * 0.3} rx={r * 0.22} ry={r * 0.24} fill="#7A4520" opacity={0.55} />
      <ellipse cx={0} cy={r * 0.35} rx={r * 0.12} ry={r * 0.08} fill="#FFD166" opacity={0.3} />
      {/* opening rim highlight */}
      <ellipse cx={0} cy={r * 0.28} rx={r * 0.28} ry={r * 0.32} fill="none" stroke={STROKE} strokeWidth={1.8} />

      {/* Moss patch on top-left */}
      <path d={`M ${-r * 0.55} ${-r * 0.4} Q ${-r * 0.35} ${-r * 0.5} ${-r * 0.1} ${-r * 0.44} Q ${-r * 0.2} ${-r * 0.35} ${-r * 0.55} ${-r * 0.32} Z`}
            fill="#7BA46F" stroke="#5C7E4F" strokeWidth={1} />
      <ellipse cx={-r * 0.25} cy={-r * 0.42} rx={r * 0.04} ry={r * 0.025} fill="#8FB67A" />
      <ellipse cx={-r * 0.1}  cy={-r * 0.4}  rx={r * 0.035} ry={r * 0.022} fill="#8FB67A" />

      {/* Cluster of 3 mushrooms on top */}
      <g transform={`translate(${r * 0.18}, ${-r * 0.42})`}>
        <ellipse cx={0} cy={0} rx={r * 0.15} ry={r * 0.08} fill="#E8A87C" stroke={STROKE} strokeWidth={1.4} />
        <rect x={-r * 0.05} y={0} width={r * 0.1} height={r * 0.15} fill="#FFFDF2" stroke={STROKE} strokeWidth={1.3} />
        <circle cx={-r * 0.04} cy={-r * 0.02} r={r * 0.022} fill="#FFFFFF" />
        <circle cx={r * 0.04}  cy={-r * 0.01} r={r * 0.018} fill="#FFFFFF" />
      </g>
      <g transform={`translate(${r * 0.35}, ${-r * 0.37})`}>
        <ellipse cx={0} cy={0} rx={r * 0.1} ry={r * 0.055} fill="#C38D9E" stroke={STROKE} strokeWidth={1.2} />
        <rect x={-r * 0.03} y={0} width={r * 0.06} height={r * 0.1} fill="#FFFDF2" stroke={STROKE} strokeWidth={1.1} />
        <circle cx={0} cy={-r * 0.015} r={r * 0.012} fill="#FFFFFF" />
      </g>

      {/* Small flower at base */}
      <g transform={`translate(${-r * 0.5}, ${r * 0.7})`}>
        <circle r={r * 0.05} fill="#FFD166" stroke={STROKE} strokeWidth={1} />
        <circle r={r * 0.02} fill="#FFFFFF" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// COZY HOUSE — Miyazaki-render of a 3-story Victorian with red door,
// tan siding, white porch with X-rail and wraparound columns, a gable
// dormer on top, rose bushes, and a chimney with curling smoke.
// ─────────────────────────────────────────────────────────────────────────

export function CozyHouse({ x, y, size = 150 }: IllustrationProps) {
  const r = size / 2;
  // Palette chosen to echo the real house: warm tan siding, cream trim,
  // deep red door, slate-grey roof, with climbing rose details.
  const WALL = '#C9A880';
  const WALL_DARK = '#A6875E';
  const TRIM = '#FDF6E8';
  const ROOF = '#5D5A54';
  const DOOR = '#C94C3E';
  const WINDOW = '#A8C8D8';

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Ground shadow */}
      <ellipse cx={0} cy={r * 1.08} rx={r * 1.15} ry={r * 0.09} fill="#000" opacity={0.22} />

      {/* Back-side visible sliver (gives depth) */}
      <path d={`M ${r * 0.72} ${-r * 0.55} L ${r * 0.82} ${-r * 0.5} L ${r * 0.82} ${r * 1.0} L ${r * 0.72} ${r * 1.0} Z`}
            fill={WALL_DARK} stroke={STROKE} strokeWidth={1.5} />

      {/* Main body (2 floors of tan siding) */}
      <rect x={-r * 0.72} y={-r * 0.55} width={r * 1.44} height={r * 1.55} fill={WALL} stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />

      {/* Hand-drawn siding lines */}
      {[-0.4, -0.22, -0.04, 0.14, 0.32, 0.5, 0.68, 0.86].map((yOff, i) => (
        <line key={i} x1={-r * 0.7} y1={r * yOff} x2={r * 0.7} y2={r * yOff} stroke={STROKE} strokeWidth={0.6} opacity={0.32} />
      ))}

      {/* Main roof cornice — cream trim */}
      <rect x={-r * 0.78} y={-r * 0.62} width={r * 1.56} height={r * 0.09} fill={TRIM} stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round" />
      {/* Dentil detail */}
      {[-0.66, -0.5, -0.34, -0.18, -0.02, 0.14, 0.3, 0.46, 0.62].map((cx, i) => (
        <rect key={i} x={r * cx} y={-r * 0.56} width={r * 0.035} height={r * 0.025} fill={STROKE} opacity={0.5} />
      ))}

      {/* Pitched attic gable (centered dormer) */}
      <path
        d={`M ${-r * 0.3} ${-r * 0.62} L ${-r * 0.32} ${-r * 0.7} L 0 ${-r * 1.08} L ${r * 0.32} ${-r * 0.7} L ${r * 0.3} ${-r * 0.62} Z`}
        fill={WALL} stroke={STROKE} strokeWidth={2} strokeLinejoin="round"
      />
      {/* Gable roof (slate) */}
      <path
        d={`M ${-r * 0.36} ${-r * 0.7} L 0 ${-r * 1.12} L ${r * 0.36} ${-r * 0.7} L ${r * 0.32} ${-r * 0.66} L 0 ${-r * 1.02} L ${-r * 0.32} ${-r * 0.66} Z`}
        fill={ROOF} stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* Gable trim bottom */}
      <rect x={-r * 0.3} y={-r * 0.64} width={r * 0.6} height={r * 0.05} fill={TRIM} stroke={STROKE} strokeWidth={1.3} />
      {/* Dormer window (tall arched) */}
      <path d={`M ${-r * 0.1} ${-r * 0.94} L ${-r * 0.1} ${-r * 0.7} L ${r * 0.1} ${-r * 0.7} L ${r * 0.1} ${-r * 0.94} Q ${r * 0.1} ${-r * 1.0} 0 ${-r * 1.0} Q ${-r * 0.1} ${-r * 1.0} ${-r * 0.1} ${-r * 0.94} Z`}
            fill={WINDOW} stroke={STROKE} strokeWidth={1.3} />
      <line x1={0} y1={-r * 1.0} x2={0} y2={-r * 0.7} stroke={STROKE} strokeWidth={0.8} />
      <line x1={-r * 0.1} y1={-r * 0.82} x2={r * 0.1} y2={-r * 0.82} stroke={STROKE} strokeWidth={0.8} />
      {/* Warm glow in attic */}
      <rect x={-r * 0.08} y={-r * 0.82} width={r * 0.16} height={r * 0.1} fill="#FFE89A" opacity={0.5} />

      {/* Second-story windows (left + right) */}
      <rect x={-r * 0.5} y={-r * 0.35} width={r * 0.32} height={r * 0.3} fill={WINDOW} stroke={STROKE} strokeWidth={1.4} />
      <rect x={r * 0.18}  y={-r * 0.35} width={r * 0.32} height={r * 0.3} fill={WINDOW} stroke={STROKE} strokeWidth={1.4} />
      {/* Window panes (4-pane) */}
      <line x1={-r * 0.34} y1={-r * 0.35} x2={-r * 0.34} y2={-r * 0.05} stroke={STROKE} strokeWidth={0.7} />
      <line x1={-r * 0.5}  y1={-r * 0.2}  x2={-r * 0.18} y2={-r * 0.2}  stroke={STROKE} strokeWidth={0.7} />
      <line x1={r * 0.34}  y1={-r * 0.35} x2={r * 0.34}  y2={-r * 0.05} stroke={STROKE} strokeWidth={0.7} />
      <line x1={r * 0.18}  y1={-r * 0.2}  x2={r * 0.5}   y2={-r * 0.2}  stroke={STROKE} strokeWidth={0.7} />
      {/* Warm glow in second-story */}
      <rect x={-r * 0.48} y={-r * 0.33} width={r * 0.28} height={r * 0.26} fill="#FFE89A" opacity={0.25} />

      {/* Porch roof (wide overhang) */}
      <rect x={-r * 0.88} y={r * 0.05} width={r * 1.76} height={r * 0.11} fill={TRIM} stroke={STROKE} strokeWidth={1.8} strokeLinejoin="round" />
      {/* Porch floor */}
      <rect x={-r * 0.85} y={r * 0.78} width={r * 1.7} height={r * 0.08} fill={TRIM} stroke={STROKE} strokeWidth={1.4} />

      {/* Porch columns — 4 white posts */}
      {[-0.82, -0.3, 0.3, 0.82].map((cx, i) => (
        <rect key={i} x={r * cx - r * 0.045} y={r * 0.16} width={r * 0.09} height={r * 0.62} fill={TRIM} stroke={STROKE} strokeWidth={1.3} />
      ))}

      {/* Porch railing — X-pattern bays between columns */}
      {[-0.56, 0, 0.56].map((cx, i) => (
        <g key={i}>
          {/* top rail */}
          <line x1={r * cx - r * 0.22} y1={r * 0.55} x2={r * cx + r * 0.22} y2={r * 0.55} stroke={TRIM} strokeWidth={2.2} />
          {/* bottom rail */}
          <line x1={r * cx - r * 0.22} y1={r * 0.73} x2={r * cx + r * 0.22} y2={r * 0.73} stroke={TRIM} strokeWidth={2.2} />
          {/* X crossings */}
          <line x1={r * cx - r * 0.22} y1={r * 0.55} x2={r * cx} y2={r * 0.73} stroke={TRIM} strokeWidth={1.5} />
          <line x1={r * cx + r * 0.22} y1={r * 0.55} x2={r * cx} y2={r * 0.73} stroke={TRIM} strokeWidth={1.5} />
          <line x1={r * cx} y1={r * 0.55} x2={r * cx - r * 0.22} y2={r * 0.73} stroke={TRIM} strokeWidth={1.5} />
          <line x1={r * cx} y1={r * 0.55} x2={r * cx + r * 0.22} y2={r * 0.73} stroke={TRIM} strokeWidth={1.5} />
        </g>
      ))}

      {/* RED DOUBLE DOOR — centered on porch */}
      <rect x={-r * 0.14} y={r * 0.18} width={r * 0.28} height={r * 0.6} fill={DOOR} stroke={STROKE} strokeWidth={1.8} />
      {/* door split */}
      <line x1={0} y1={r * 0.18} x2={0} y2={r * 0.78} stroke={STROKE} strokeWidth={1} />
      {/* door windows (upper) */}
      <rect x={-r * 0.1} y={r * 0.22} width={r * 0.09} height={r * 0.16} fill="#FFF5D0" opacity={0.75} stroke={STROKE} strokeWidth={0.7} />
      <rect x={r * 0.01} y={r * 0.22} width={r * 0.09} height={r * 0.16} fill="#FFF5D0" opacity={0.75} stroke={STROKE} strokeWidth={0.7} />
      {/* mullions in door windows */}
      <line x1={-r * 0.1} y1={r * 0.3} x2={-r * 0.01} y2={r * 0.3} stroke={STROKE} strokeWidth={0.5} />
      <line x1={r * 0.01} y1={r * 0.3} x2={r * 0.1} y2={r * 0.3} stroke={STROKE} strokeWidth={0.5} />
      <line x1={-r * 0.055} y1={r * 0.22} x2={-r * 0.055} y2={r * 0.38} stroke={STROKE} strokeWidth={0.5} />
      <line x1={r * 0.055} y1={r * 0.22} x2={r * 0.055} y2={r * 0.38} stroke={STROKE} strokeWidth={0.5} />
      {/* door handles */}
      <circle cx={-r * 0.03} cy={r * 0.55} r={r * 0.018} fill="#F0C44A" stroke={STROKE} strokeWidth={0.6} />
      <circle cx={r * 0.03}  cy={r * 0.55} r={r * 0.018} fill="#F0C44A" stroke={STROKE} strokeWidth={0.6} />

      {/* Porch steps */}
      <rect x={-r * 0.12} y={r * 0.86} width={r * 0.24} height={r * 0.08} fill="#B8B0A4" stroke={STROKE} strokeWidth={1.3} />
      <rect x={-r * 0.16} y={r * 0.94} width={r * 0.32} height={r * 0.06} fill="#A8A094" stroke={STROKE} strokeWidth={1.3} />

      {/* Rose bushes at base of porch — pink blooms on sage leaves */}
      <g transform={`translate(${-r * 0.75}, ${r * 0.95})`}>
        <ellipse cx={0} cy={0} rx={r * 0.22} ry={r * 0.1} fill="#7BA46F" stroke={STROKE} strokeWidth={1.4} />
        <circle cx={-r * 0.1} cy={-r * 0.03} r={r * 0.045} fill="#D4577A" stroke={STROKE} strokeWidth={0.8} />
        <circle cx={r * 0.03} cy={-r * 0.05} r={r * 0.04} fill="#E8708C" stroke={STROKE} strokeWidth={0.8} />
        <circle cx={r * 0.12} cy={-r * 0.01} r={r * 0.035} fill="#D4577A" stroke={STROKE} strokeWidth={0.8} />
      </g>
      <g transform={`translate(${r * 0.75}, ${r * 0.95})`}>
        <ellipse cx={0} cy={0} rx={r * 0.2} ry={r * 0.09} fill="#7BA46F" stroke={STROKE} strokeWidth={1.4} />
        <circle cx={-r * 0.08} cy={-r * 0.03} r={r * 0.04} fill="#E8708C" stroke={STROKE} strokeWidth={0.8} />
        <circle cx={r * 0.06} cy={-r * 0.04} r={r * 0.045} fill="#D4577A" stroke={STROKE} strokeWidth={0.8} />
      </g>
      {/* front rose bed (below steps) */}
      <g transform={`translate(0, ${r * 1.02})`}>
        <ellipse cx={0} cy={0} rx={r * 0.25} ry={r * 0.07} fill="#7BA46F" stroke={STROKE} strokeWidth={1.3} />
        <circle cx={-r * 0.12} cy={-r * 0.02} r={r * 0.035} fill="#E8708C" stroke={STROKE} strokeWidth={0.7} />
        <circle cx={0}          cy={-r * 0.04} r={r * 0.045} fill="#D4577A" stroke={STROKE} strokeWidth={0.7} />
        <circle cx={r * 0.12}   cy={-r * 0.02} r={r * 0.035} fill="#E8708C" stroke={STROKE} strokeWidth={0.7} />
      </g>

      {/* Chimney on back-right with gentle smoke */}
      <rect x={r * 0.46} y={-r * 0.82} width={r * 0.12} height={r * 0.2} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.3} />
      <rect x={r * 0.44} y={-r * 0.86} width={r * 0.16} height={r * 0.05} fill="#6B4423" stroke={STROKE} strokeWidth={1.3} />

      {/* Climbing vine up the left wall */}
      <path d={`M ${-r * 0.7} ${r * 0.9} Q ${-r * 0.62} ${r * 0.5} ${-r * 0.68} ${r * 0.1} Q ${-r * 0.6} ${-r * 0.15} ${-r * 0.66} ${-r * 0.45}`}
            stroke="#5C7E4F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <circle cx={-r * 0.62} cy={r * 0.45} r={r * 0.025} fill="#95B88F" />
      <circle cx={-r * 0.68} cy={r * 0.25} r={r * 0.02} fill="#95B88F" />
      <circle cx={-r * 0.62} cy={0}       r={r * 0.025} fill="#95B88F" />
      <circle cx={-r * 0.66} cy={-r * 0.25} r={r * 0.02} fill="#95B88F" />
    </g>
  );
}

// Lightweight smoke curl that lives near a chimney — used in GardenScene
// to animate the column of smoke without blocking SSR.
export function ChimneySmoke({ x, y }: { x: number; y: number }) {
  return null; // placeholder; the animated smoke lives in GardenScene
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
    // Grade 2 stretches — reuse existing illustrations thematically
    case 'math_tens_tower':          return <WordStump x={x} y={y} size={size * 1.1} />;  // a "tower" of rings
    case 'math_hundreds_hollow':     return <HundredsHollow x={x} y={y} size={size * 1.2} />;
    case 'math_array_orchard':       return <ButterflyClusters x={x} y={y} size={size * 1.1} />;
    case 'math_compare_trees':       return <PartWholeFlower x={x} y={y} size={size * 1.05} />;
    case 'math_word_stories':        return <GardenStories x={x} y={y} size={size * 1.2} />;
    default:                         return null;
  }
}
