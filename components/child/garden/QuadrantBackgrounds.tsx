// components/child/garden/QuadrantBackgrounds.tsx
//
// Four hand-drawn organic-shaped garden beds. Each takes its origin
// (top-left x,y) and bounding size (w,h). Beds are NOT rectangles —
// they're soft, asymmetrical curves with the kind of slightly-uneven
// edges a small farm really has. Anchors (wheelbarrow, bench, bird
// bath, lantern, koi pond, bamboo) live inside their host bed.

'use client';

const STROKE = '#5A3B1F';
const STROKE_LIGHT = '#8B6938';

interface BgProps { x: number; y: number; w: number; h: number; }

// ─────────────────────────────────────────────────────────────────────────
// VEGETABLE PATCH — raised earth bed with stakes + wheelbarrow
// ─────────────────────────────────────────────────────────────────────────

export function VegetableBackground({ x, y, w, h }: BgProps) {
  // Organic raised-bed silhouette. Two curves — the "front" face (lighter,
  // crumbly soil) and a darker shadow rim along the back to suggest depth.
  // Asymmetric corners on purpose.
  const bedPath =
    `M ${w * 0.06} ${h * 0.18}
     C ${w * 0.02} ${h * 0.10}, ${w * 0.10} ${h * 0.04}, ${w * 0.22} ${h * 0.05}
     C ${w * 0.40} ${h * 0.02}, ${w * 0.62} ${h * 0.06}, ${w * 0.78} ${h * 0.04}
     C ${w * 0.92} ${h * 0.06}, ${w * 0.98} ${h * 0.16}, ${w * 0.96} ${h * 0.32}
     C ${w * 0.99} ${h * 0.55}, ${w * 0.97} ${h * 0.78}, ${w * 0.92} ${h * 0.92}
     C ${w * 0.78} ${h * 0.99}, ${w * 0.55} ${h * 0.96}, ${w * 0.34} ${h * 0.97}
     C ${w * 0.18} ${h * 0.99}, ${w * 0.04} ${h * 0.92}, ${w * 0.04} ${h * 0.78}
     C ${w * 0.02} ${h * 0.55}, ${w * 0.08} ${h * 0.34}, ${w * 0.06} ${h * 0.18} Z`;

  const bedId = `veg-bed-${Math.round(x)}-${Math.round(y)}`;

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <linearGradient id={bedId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#9C6B3E" />
          <stop offset="55%" stopColor="#7A4F2C" />
          <stop offset="100%" stopColor="#5C3A1E" />
        </linearGradient>
      </defs>

      {/* (no cast shadow — overhead view, the bed isn't lifted off the ground) */}

      {/* dark earth rim (back edge — shows below the lighter face) */}
      <path d={bedPath} fill="#3F2614" transform={`translate(0, ${h * 0.04})`} opacity={0.6} />

      {/* main soil body */}
      <path d={bedPath} fill={`url(#${bedId})`} stroke={STROKE} strokeWidth={1.6} strokeLinejoin="round" />

      {/* furrow lines — gentle wavy parallel rows */}
      {[0.30, 0.48, 0.66, 0.84].map((f, i) => (
        <path key={i}
          d={`M ${w * 0.12} ${h * f}
              Q ${w * 0.32} ${h * (f - 0.012)} ${w * 0.55} ${h * f}
              T ${w * 0.92} ${h * (f - 0.005)}`}
          stroke="#3F2614" strokeWidth={1.2} fill="none" opacity={0.55} strokeLinecap="round" />
      ))}

      {/* darker scuffs / clods of earth */}
      <ellipse cx={w * 0.18} cy={h * 0.42} rx={6} ry={2} fill="#3F2614" opacity={0.5} />
      <ellipse cx={w * 0.62} cy={h * 0.28} rx={5} ry={1.8} fill="#3F2614" opacity={0.45} />
      <ellipse cx={w * 0.81} cy={h * 0.71} rx={7} ry={2.5} fill="#3F2614" opacity={0.5} />

      {/* pebbles scattered through the bed */}
      <circle cx={w * 0.14} cy={h * 0.78} r={2.4} fill="#A89D8A" stroke="#6B5D48" strokeWidth={0.6} />
      <circle cx={w * 0.36} cy={h * 0.92} r={2.0} fill="#C2B4A0" stroke="#6B5D48" strokeWidth={0.5} />
      <circle cx={w * 0.72} cy={h * 0.20} r={2.2} fill="#A89D8A" stroke="#6B5D48" strokeWidth={0.5} />
      <circle cx={w * 0.90} cy={h * 0.55} r={1.8} fill="#C2B4A0" stroke="#6B5D48" strokeWidth={0.5} />

      {/* stake markers — small wooden plot stakes (4 of them, tucked at
          the corners of the four planting cells, NOT covering the plot
          tap targets which are at center of each cell) */}
      {[
        { sx: w * 0.10, sy: h * 0.20 },
        { sx: w * 0.55, sy: h * 0.18 },
        { sx: w * 0.10, sy: h * 0.62 },
        { sx: w * 0.55, sy: h * 0.62 },
      ].map((s, i) => (
        <g key={i} transform={`translate(${s.sx}, ${s.sy})`}>
          <line x1={0} y1={0} x2={0} y2={14} stroke="#7B4F2C" strokeWidth={1.6} strokeLinecap="round" />
          <rect x={-5} y={-6} width={10} height={6} rx={1} fill="#F0E4CF" stroke={STROKE_LIGHT} strokeWidth={0.7} />
          <line x1={-3} y1={-3} x2={3} y2={-3} stroke={STROKE} strokeWidth={0.5} opacity={0.6} />
        </g>
      ))}

      {/* WHEELBARROW — lower-right corner */}
      <g transform={`translate(${w * 0.86}, ${h * 0.85})`}>
        {/* shadow */}
        <ellipse cx={2} cy={20} rx={28} ry={3} fill="#000" opacity={0.25} />
        {/* tray (bin) — angled side view */}
        <path
          d="M -22 -2 L 24 -6 L 18 12 L -16 12 Z"
          fill="#A0563B" stroke={STROKE} strokeWidth={1.4} strokeLinejoin="round"
        />
        {/* tray rim highlight */}
        <path d="M -22 -2 L 24 -6" stroke="#D38461" strokeWidth={1.3} strokeLinecap="round" />
        {/* carrots poking out of the tray */}
        <g transform="translate(2, -4)">
          <path d="M -2 -1 L 0 -10 L 2 -1 Z" fill="#E8713C" stroke={STROKE} strokeWidth={0.9} strokeLinejoin="round" />
          <path d="M -3 -10 L 0 -16 L 3 -10" stroke="#5C7E4F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <path d="M 5 -1 L 7 -8 L 9 -1 Z" fill="#E8713C" stroke={STROKE} strokeWidth={0.8} strokeLinejoin="round" />
          <path d="M 4 -8 L 7 -13 L 10 -8" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </g>
        {/* handle */}
        <line x1={-22} y1={-2} x2={-32} y2={-6} stroke="#7B4F2C" strokeWidth={2.4} strokeLinecap="round" />
        {/* leg / strut */}
        <line x1={-12} y1={12} x2={-16} y2={20} stroke="#7B4F2C" strokeWidth={2.0} strokeLinecap="round" />
        {/* wheel */}
        <circle cx={18} cy={16} r={6} fill="#5A3B1F" stroke={STROKE} strokeWidth={1.2} />
        <circle cx={18} cy={16} r={2.4} fill="#A89D8A" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FRUIT GROVE — sun-dappled grassy clearing with bench + tree clearings
// ─────────────────────────────────────────────────────────────────────────

export function FruitGroveBackground({ x, y, w, h }: BgProps) {
  // Wide rounded-organic grass area, slightly darker than the meadow,
  // with subtle "tree-shape clearings" where each fruit tree will grow.
  const grovePath =
    `M ${w * 0.04} ${h * 0.14}
     C ${w * 0.10} ${h * 0.05}, ${w * 0.30} ${h * 0.02}, ${w * 0.52} ${h * 0.04}
     C ${w * 0.74} ${h * 0.02}, ${w * 0.92} ${h * 0.08}, ${w * 0.96} ${h * 0.22}
     C ${w * 0.99} ${h * 0.42}, ${w * 0.97} ${h * 0.66}, ${w * 0.94} ${h * 0.88}
     C ${w * 0.84} ${h * 0.99}, ${w * 0.62} ${h * 0.97}, ${w * 0.42} ${h * 0.98}
     C ${w * 0.22} ${h * 0.99}, ${w * 0.06} ${h * 0.94}, ${w * 0.04} ${h * 0.78}
     C ${w * 0.02} ${h * 0.55}, ${w * 0.06} ${h * 0.34}, ${w * 0.04} ${h * 0.14} Z`;

  const grassId = `grove-grass-${Math.round(x)}-${Math.round(y)}`;

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <radialGradient id={grassId} cx="50%" cy="40%" r="65%">
          <stop offset="0%"  stopColor="#A4C895" />
          <stop offset="60%" stopColor="#7DA76A" />
          <stop offset="100%" stopColor="#5F8C50" />
        </radialGradient>
      </defs>

      {/* (no cast shadow — overhead view, the bed isn't lifted off the ground) */}

      {/* main grass body */}
      <path d={grovePath} fill={`url(#${grassId})`} stroke={STROKE} strokeWidth={1.4} strokeLinejoin="round" />

      {/* tree-shape clearings — slightly DARKER patches where each fruit
          tree will grow. Plots are at relative positions roughly:
            (0.20, 0.22), (0.85, 0.22), (0.20, 0.66), (0.85, 0.66) within the bed */}
      {[
        { cx: 0.20, cy: 0.22 }, { cx: 0.85, cy: 0.22 },
        { cx: 0.20, cy: 0.66 }, { cx: 0.85, cy: 0.66 },
      ].map((c, i) => (
        <ellipse key={i}
          cx={w * c.cx} cy={h * c.cy} rx={56} ry={42}
          fill="#5F8C50" opacity={0.45} />
      ))}

      {/* dappled sun spots — light puddles on the grass */}
      <ellipse cx={w * 0.50} cy={h * 0.30} rx={28} ry={16} fill="#E8F0CC" opacity={0.30} />
      <ellipse cx={w * 0.42} cy={h * 0.78} rx={22} ry={12} fill="#E8F0CC" opacity={0.25} />
      <ellipse cx={w * 0.68} cy={h * 0.50} rx={20} ry={11} fill="#E8F0CC" opacity={0.28} />

      {/* stray daisies */}
      {[
        { dx: w * 0.42, dy: h * 0.40 }, { dx: w * 0.58, dy: h * 0.78 },
        { dx: w * 0.50, dy: h * 0.60 },
      ].map((d, i) => (
        <g key={i} transform={`translate(${d.dx}, ${d.dy})`}>
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <ellipse key={deg} cx={0} cy={-2} rx={1.3} ry={2.5} fill="#FFFCEF"
                     stroke="#B5AC8F" strokeWidth={0.3} transform={`rotate(${deg})`} />
          ))}
          <circle cx={0} cy={0} r={1.2} fill="#FFD166" />
        </g>
      ))}

      {/* short grass tufts dotted around */}
      {[
        { tx: w * 0.10, ty: h * 0.50 }, { tx: w * 0.92, ty: h * 0.45 },
        { tx: w * 0.50, ty: h * 0.92 }, { tx: w * 0.08, ty: h * 0.92 },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.tx}, ${t.ty})`}>
          <path d="M 0 0 Q -2 -6 -1 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 0 Q 1 -7 3 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 0 Q 3 -5 5 -8" stroke="#5C7E4F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* WOODEN BENCH — lower-left corner */}
      <g transform={`translate(${w * 0.10}, ${h * 0.84})`}>
        {/* shadow */}
        <ellipse cx={6} cy={20} rx={32} ry={3} fill="#000" opacity={0.22} />
        {/* back planks */}
        <rect x={-16} y={-14} width={42} height={3.5} rx={1} fill="#A0703F" stroke={STROKE} strokeWidth={0.9} />
        <rect x={-16} y={-8}  width={42} height={3.5} rx={1} fill="#8E6233" stroke={STROKE} strokeWidth={0.9} />
        {/* arm uprights */}
        <line x1={-15} y1={-15} x2={-15} y2={4} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={25}  y1={-15} x2={25}  y2={4} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
        {/* seat */}
        <path d="M -20 0 L 30 0 L 28 6 L -18 6 Z" fill="#9B6A39" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        <line x1={-20} y1={0} x2={30} y2={0} stroke="#C39061" strokeWidth={0.9} opacity={0.85} />
        {/* legs */}
        <line x1={-12} y1={6}  x2={-14} y2={18} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={22}  y1={6}  x2={24}  y2={18} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FLOWER GARDEN — lavender-tinted bed with stone edging + bird bath
// ─────────────────────────────────────────────────────────────────────────

export function FlowerBackground({ x, y, w, h }: BgProps) {
  const bedPath =
    `M ${w * 0.05} ${h * 0.18}
     C ${w * 0.04} ${h * 0.08}, ${w * 0.16} ${h * 0.02}, ${w * 0.32} ${h * 0.04}
     C ${w * 0.55} ${h * 0.01}, ${w * 0.74} ${h * 0.05}, ${w * 0.90} ${h * 0.06}
     C ${w * 0.99} ${h * 0.18}, ${w * 0.96} ${h * 0.40}, ${w * 0.97} ${h * 0.62}
     C ${w * 0.98} ${h * 0.82}, ${w * 0.88} ${h * 0.96}, ${w * 0.72} ${h * 0.97}
     C ${w * 0.50} ${h * 0.99}, ${w * 0.28} ${h * 0.96}, ${w * 0.12} ${h * 0.94}
     C ${w * 0.03} ${h * 0.82}, ${w * 0.04} ${h * 0.55}, ${w * 0.05} ${h * 0.18} Z`;

  const flowerId = `flower-bed-${Math.round(x)}-${Math.round(y)}`;

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <radialGradient id={flowerId} cx="50%" cy="45%" r="65%">
          <stop offset="0%"  stopColor="#B8C9A5" />
          <stop offset="50%" stopColor="#8FA983" />
          <stop offset="100%" stopColor="#6F8E62" />
        </radialGradient>
      </defs>

      {/* (no cast shadow — overhead view, the bed isn't lifted off the ground) */}

      {/* bed surface */}
      <path d={bedPath} fill={`url(#${flowerId})`} stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" />

      {/* lavender wash (subtle violet tint over the grass) */}
      <path d={bedPath} fill="#C8B2D8" opacity={0.18} />

      {/* moss tufts — darker green clusters */}
      <ellipse cx={w * 0.20} cy={h * 0.25} rx={9} ry={3} fill="#5C7E4F" opacity={0.55} />
      <ellipse cx={w * 0.78} cy={h * 0.20} rx={7} ry={2.5} fill="#5C7E4F" opacity={0.5} />
      <ellipse cx={w * 0.40} cy={h * 0.85} rx={8} ry={3} fill="#5C7E4F" opacity={0.55} />
      <ellipse cx={w * 0.62} cy={h * 0.55} rx={6} ry={2} fill="#5C7E4F" opacity={0.5} />

      {/* tiny lavender flower spikes scattered in the bed */}
      {[
        { fx: 0.12, fy: 0.45 }, { fx: 0.88, fy: 0.40 },
        { fx: 0.32, fy: 0.92 }, { fx: 0.55, fy: 0.10 },
        { fx: 0.50, fy: 0.46 },
      ].map((f, i) => (
        <g key={i} transform={`translate(${w * f.fx}, ${h * f.fy})`}>
          <line x1={0} y1={0} x2={0} y2={10} stroke="#5C7E4F" strokeWidth={1} strokeLinecap="round" />
          <ellipse cx={0} cy={-2} rx={1.6} ry={4} fill="#A675B0" opacity={0.85} />
          <ellipse cx={0} cy={-5} rx={1.2} ry={2.5} fill="#C8A2D8" opacity={0.95} />
        </g>
      ))}

      {/* STONE EDGING — ring of stones around the bed perimeter, more
          numerous than the original. Hand-set, varied sizes. */}
      {[
        { sx: 0.06, sy: 0.20, r: 9 },  { sx: 0.18, sy: 0.07, r: 8 },
        { sx: 0.34, sy: 0.04, r: 9 },  { sx: 0.50, sy: 0.06, r: 8 },
        { sx: 0.66, sy: 0.05, r: 9 },  { sx: 0.82, sy: 0.07, r: 8 },
        { sx: 0.94, sy: 0.20, r: 9 },  { sx: 0.96, sy: 0.40, r: 8 },
        { sx: 0.96, sy: 0.62, r: 9 },  { sx: 0.92, sy: 0.84, r: 9 },
        { sx: 0.78, sy: 0.94, r: 9 },  { sx: 0.60, sy: 0.97, r: 8 },
        { sx: 0.42, sy: 0.97, r: 9 },  { sx: 0.24, sy: 0.95, r: 8 },
        { sx: 0.08, sy: 0.86, r: 9 },  { sx: 0.04, sy: 0.62, r: 8 },
        { sx: 0.04, sy: 0.42, r: 9 },
      ].map((s, i) => (
        <g key={i}>
          <ellipse cx={w * s.sx + 1} cy={h * s.sy + 2} rx={s.r} ry={s.r * 0.5}
                   fill="#000" opacity={0.18} />
          <ellipse cx={w * s.sx} cy={h * s.sy} rx={s.r} ry={s.r * 0.5}
                   fill={i % 2 === 0 ? '#B5A892' : '#A89D8A'}
                   stroke={STROKE_LIGHT} strokeWidth={0.9} />
          <ellipse cx={w * s.sx - 2} cy={h * s.sy - 1.5} rx={s.r * 0.45} ry={s.r * 0.18}
                   fill="#D4C8B0" opacity={0.75} />
        </g>
      ))}

      {/* BIRD BATH — lower-right corner */}
      <g transform={`translate(${w * 0.86}, ${h * 0.84})`}>
        {/* shadow */}
        <ellipse cx={0} cy={20} rx={22} ry={3} fill="#000" opacity={0.22} />
        {/* pedestal — thicker base */}
        <path d="M -10 18 L 10 18 L 8 6 L -8 6 Z"
              fill="#A89D8A" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        {/* stem */}
        <rect x={-4} y={-4} width={8} height={10} fill="#9B948A" stroke={STROKE} strokeWidth={1.0} />
        {/* basin underside (cup) */}
        <path d="M -14 -8 Q -16 -2 -10 -2 L 10 -2 Q 16 -2 14 -8 Z"
              fill="#9B948A" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        {/* basin rim */}
        <ellipse cx={0} cy={-10} rx={14} ry={3.5} fill="#B5A892" stroke={STROKE} strokeWidth={1.2} />
        {/* water inside */}
        <ellipse cx={0} cy={-10} rx={11} ry={2.4} fill="#A8CFD8" />
        <ellipse cx={-3} cy={-10.5} rx={3} ry={0.7} fill="#FFFFFF" opacity={0.7} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JAPANESE GARDEN — circular sand garden with raked arcs, lantern, koi
// ─────────────────────────────────────────────────────────────────────────

export function JapaneseBackground({ x, y, w, h }: BgProps) {
  // Big near-circular sand garden centered in the bed, with a stone
  // border around the edge. Anchors sit OUTSIDE the sand on grass.
  const cx = w * 0.5, cy = h * 0.5;
  const rx = w * 0.42, ry = h * 0.42;

  const sandId = `jp-sand-${Math.round(x)}-${Math.round(y)}`;
  const grassId = `jp-grass-${Math.round(x)}-${Math.round(y)}`;

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <radialGradient id={grassId} cx="50%" cy="50%" r="60%">
          <stop offset="0%"  stopColor="#9CB890" />
          <stop offset="100%" stopColor="#7DA170" />
        </radialGradient>
        <radialGradient id={sandId} cx="50%" cy="40%" r="70%">
          <stop offset="0%"  stopColor="#F2EAD3" />
          <stop offset="60%" stopColor="#E2D5B4" />
          <stop offset="100%" stopColor="#C8B999" />
        </radialGradient>
      </defs>

      {/* (no cast shadow — overhead view, the bed isn't lifted off the ground) */}

      {/* outer grass surround */}
      <path
        d={`M ${w * 0.05} ${h * 0.16}
            C ${w * 0.10} ${h * 0.05}, ${w * 0.30} ${h * 0.02}, ${w * 0.52} ${h * 0.04}
            C ${w * 0.74} ${h * 0.02}, ${w * 0.92} ${h * 0.08}, ${w * 0.96} ${h * 0.22}
            C ${w * 0.99} ${h * 0.42}, ${w * 0.97} ${h * 0.66}, ${w * 0.94} ${h * 0.88}
            C ${w * 0.84} ${h * 0.99}, ${w * 0.62} ${h * 0.97}, ${w * 0.42} ${h * 0.98}
            C ${w * 0.22} ${h * 0.99}, ${w * 0.06} ${h * 0.94}, ${w * 0.04} ${h * 0.78}
            C ${w * 0.02} ${h * 0.55}, ${w * 0.06} ${h * 0.34}, ${w * 0.05} ${h * 0.16} Z`}
        fill={`url(#${grassId})`} stroke={STROKE} strokeWidth={1.4} strokeLinejoin="round"
      />

      {/* moss patch beneath sand (darker grass ring softens the transition) */}
      <ellipse cx={cx} cy={cy} rx={rx + 6} ry={ry + 6} fill="#5C7E4F" opacity={0.45} />

      {/* sand circle */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${sandId})`} stroke={STROKE} strokeWidth={1.2} />

      {/* raked concentric arcs — semi-elliptical */}
      {[0.92, 0.78, 0.62, 0.46, 0.30, 0.16].map((f, i) => (
        <ellipse key={i}
          cx={cx} cy={cy} rx={rx * f} ry={ry * f}
          stroke="#A89878" strokeWidth={0.8} fill="none" opacity={0.7} />
      ))}
      {/* a couple of subtle radial sweeps to add hand-raked feel */}
      <path d={`M ${cx} ${cy - ry * 0.95} Q ${cx + rx * 0.45} ${cy - ry * 0.6} ${cx + rx * 0.85} ${cy - ry * 0.2}`}
            stroke="#A89878" strokeWidth={0.6} fill="none" opacity={0.55} />
      <path d={`M ${cx} ${cy + ry * 0.95} Q ${cx - rx * 0.45} ${cy + ry * 0.6} ${cx - rx * 0.85} ${cy + ry * 0.2}`}
            stroke="#A89878" strokeWidth={0.6} fill="none" opacity={0.55} />

      {/* STONE BORDER ring along the sand edge */}
      {Array.from({ length: 18 }).map((_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const sx = cx + Math.cos(ang) * (rx + 4);
        const sy = cy + Math.sin(ang) * (ry + 4);
        const r = i % 2 === 0 ? 6 : 5;
        return (
          <g key={i}>
            <ellipse cx={sx + 0.6} cy={sy + 1} rx={r} ry={r * 0.55} fill="#000" opacity={0.18} />
            <ellipse cx={sx} cy={sy} rx={r} ry={r * 0.55}
                     fill={i % 3 === 0 ? '#9B948A' : '#B5ACA0'}
                     stroke={STROKE_LIGHT} strokeWidth={0.7} />
            <ellipse cx={sx - 1.2} cy={sy - 0.8} rx={r * 0.42} ry={r * 0.18} fill="#D4C8B0" opacity={0.7} />
          </g>
        );
      })}

      {/* a couple of "feature stones" sitting on the sand (asymmetric placement) */}
      <g>
        <ellipse cx={cx - rx * 0.55} cy={cy - ry * 0.10} rx={11} ry={6} fill="#5F5B53" opacity={0.25} />
        <ellipse cx={cx - rx * 0.55} cy={cy - ry * 0.12} rx={11} ry={6} fill="#7F7A70" stroke={STROKE} strokeWidth={1.2} />
        <ellipse cx={cx - rx * 0.58} cy={cy - ry * 0.14} rx={5}  ry={2} fill="#A89D8A" />
      </g>
      <g>
        <ellipse cx={cx + rx * 0.32} cy={cy + ry * 0.42} rx={7} ry={4} fill="#5F5B53" opacity={0.25} />
        <ellipse cx={cx + rx * 0.32} cy={cy + ry * 0.40} rx={7} ry={4} fill="#9B948A" stroke={STROKE} strokeWidth={1} />
      </g>

      {/* STONE LANTERN — upper-left corner (style copied from GardenScene) */}
      <g transform={`translate(${w * 0.12}, ${h * 0.20})`}>
        {/* base shadow */}
        <ellipse cx={0} cy={36} rx={16} ry={3.5} fill="#000" opacity={0.22} />
        {/* moss patch */}
        <ellipse cx={-2} cy={36} rx={20} ry={4.5} fill="#7BA46F" opacity={0.7} />
        {/* square base */}
        <rect x={-12} y={20} width={24} height={14} rx={2} fill="#A8A39A" stroke={STROKE} strokeWidth={1.2} />
        {/* post */}
        <rect x={-4} y={4} width={8} height={18} fill="#9B968D" stroke={STROKE} strokeWidth={1} />
        {/* middle platform */}
        <rect x={-10} y={-2} width={20} height={6} rx={1} fill="#B0ABA1" stroke={STROKE} strokeWidth={1} />
        {/* light chamber */}
        <rect x={-8} y={-16} width={16} height={16} rx={2} fill="#7F7A70" stroke={STROKE} strokeWidth={1.2} />
        {/* lantern window with warm glow */}
        <rect x={-5} y={-13} width={10} height={10} rx={1} fill="#FFD98A" />
        <rect x={-5} y={-13} width={10} height={10} rx={1} fill="none" stroke="#3F1E10" strokeWidth={0.7} />
        {/* roof */}
        <path d="M -13 -16 Q -15 -20 -12 -22 L 12 -22 Q 15 -20 13 -16 Z"
              fill="#6F6A60" stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
        <path d="M -12 -22 L -3 -29 L 3 -29 L 12 -22 Z"
              fill="#7F7A70" stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
        {/* finial */}
        <circle cx={0} cy={-31} r={2.2} fill="#6F6A60" stroke={STROKE} strokeWidth={0.9} />
      </g>

      {/* KOI POND — lower-right corner */}
      <g transform={`translate(${w * 0.88}, ${h * 0.86})`}>
        {/* outer rim shadow */}
        <ellipse cx={0} cy={4} rx={32} ry={11} fill="#5A8A80" opacity={0.35} />
        {/* water */}
        <ellipse cx={0} cy={0} rx={30} ry={10} fill="#7FA9B0" stroke={STROKE} strokeWidth={1.2} />
        <ellipse cx={0} cy={-1} rx={26} ry={8} fill="#A8CDD2" />
        {/* shimmer */}
        <ellipse cx={-8} cy={-3} rx={6} ry={1.3} fill="#FFFFFF" opacity={0.6} />
        <ellipse cx={10} cy={2} rx={4} ry={0.8} fill="#FFFFFF" opacity={0.45} />
        {/* one orange koi */}
        <g transform="translate(-2, 0)">
          <ellipse cx={0} cy={0} rx={7} ry={2.8} fill="#E8713C" stroke={STROKE} strokeWidth={0.7} />
          <path d="M -7 0 L -11 -3 L -11 3 Z" fill="#E8713C" stroke={STROKE} strokeWidth={0.7} strokeLinejoin="round" />
          <ellipse cx={2} cy={-1.2} rx={2} ry={1} fill="#FFFFFF" opacity={0.85} />
          <circle cx={4} cy={-0.4} r={0.6} fill="#1F1006" />
        </g>
      </g>

      {/* BAMBOO STALKS lining the LEFT edge */}
      {[
        { bx: w * 0.04, top: h * 0.30 },
        { bx: w * 0.07, top: h * 0.42 },
        { bx: w * 0.04, top: h * 0.55 },
        { bx: w * 0.08, top: h * 0.68 },
        { bx: w * 0.05, top: h * 0.80 },
      ].map((b, i) => {
        const stalkHeight = h * 0.18;
        const sway = i % 2 === 0 ? -1.5 : 1.2;
        return (
          <g key={i}>
            {/* stalk */}
            <path d={`M ${b.bx} ${b.top + stalkHeight} L ${b.bx + sway} ${b.top}`}
                  stroke="#8CB27A" strokeWidth={3.2} strokeLinecap="round" />
            {/* node bands */}
            {[0.3, 0.6].map((nf, ni) => (
              <line key={ni}
                x1={b.bx + sway * (1 - nf) - 2.5} y1={b.top + stalkHeight * nf}
                x2={b.bx + sway * (1 - nf) + 2.5} y2={b.top + stalkHeight * nf}
                stroke="#5C7E4F" strokeWidth={1.2} />
            ))}
            {/* small leaf at the top */}
            <path d={`M ${b.bx + sway} ${b.top}
                      Q ${b.bx + sway + 8} ${b.top - 6} ${b.bx + sway + 12} ${b.top - 12}
                      Q ${b.bx + sway + 6} ${b.top - 6} ${b.bx + sway + 1} ${b.top - 1} Z`}
                  fill="#7BA46F" stroke="#5C7E4F" strokeWidth={0.8} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
}
