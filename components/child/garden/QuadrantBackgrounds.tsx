// components/child/garden/QuadrantBackgrounds.tsx
//
// Four hand-drawn organic-shaped garden beds. Each takes its origin
// (top-left x,y) and bounding size (w,h). Beds are NOT rectangles —
// they're soft, asymmetrical curves with the kind of slightly-uneven
// edges a small farm really has. Each bed is designed AROUND a set of
// character-anchors that give it identity:
//
//   • Vegetable patch — wheelbarrow + scarecrow (back of the bed)
//   • Fruit grove     — bench + hammock strung between two posts
//   • Flower garden   — bird bath + trellis arch + butterfly house
//   • Japanese garden — torii gate, moon bridge over koi stream,
//                        shishi-odoshi, maple, lantern, bamboo, sand
//
// Anchors and decorative features are all positioned to AVOID the
// plot tap-targets defined in lib/world/plotLayout.ts.

'use client';

const STROKE = '#5A3B1F';
const STROKE_LIGHT = '#8B6938';

interface BgProps { x: number; y: number; w: number; h: number; }

// ─────────────────────────────────────────────────────────────────────────
// VEGETABLE PATCH — raised earth bed with stakes, scarecrow + wheelbarrow
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

      {/* dark earth rim (back edge — shows below the lighter face) */}
      <path d={bedPath} fill="#3F2614" transform={`translate(0, ${h * 0.04})`} opacity={0.6} />

      {/* main soil body */}
      <path d={bedPath} fill={`url(#${bedId})`} stroke={STROKE} strokeWidth={1.6} strokeLinejoin="round" />

      {/* furrow lines — gentle wavy parallel rows, aligned to plot rows
          (top row at y=220, bottom row at y=360 in viewBox; local y here
          is roughly h*0.23 and h*0.77). */}
      {[0.27, 0.42, 0.62, 0.81].map((f, i) => (
        <path key={i}
          d={`M ${w * 0.10} ${h * f}
              Q ${w * 0.32} ${h * (f - 0.012)} ${w * 0.55} ${h * f}
              T ${w * 0.94} ${h * (f - 0.005)}`}
          stroke="#3F2614" strokeWidth={1.2} fill="none" opacity={0.55} strokeLinecap="round" />
      ))}

      {/* darker scuffs / clods of earth */}
      <ellipse cx={w * 0.18} cy={h * 0.50} rx={6} ry={2} fill="#3F2614" opacity={0.5} />
      <ellipse cx={w * 0.62} cy={h * 0.30} rx={5} ry={1.8} fill="#3F2614" opacity={0.45} />
      <ellipse cx={w * 0.78} cy={h * 0.55} rx={7} ry={2.5} fill="#3F2614" opacity={0.5} />

      {/* pebbles scattered through the bed (off the plot lines) */}
      <circle cx={w * 0.14} cy={h * 0.50} r={2.4} fill="#A89D8A" stroke="#6B5D48" strokeWidth={0.6} />
      <circle cx={w * 0.52} cy={h * 0.55} r={2.0} fill="#C2B4A0" stroke="#6B5D48" strokeWidth={0.5} />
      <circle cx={w * 0.86} cy={h * 0.52} r={2.2} fill="#A89D8A" stroke="#6B5D48" strokeWidth={0.5} />
      <circle cx={w * 0.36} cy={h * 0.92} r={1.8} fill="#C2B4A0" stroke="#6B5D48" strokeWidth={0.5} />

      {/* SCARECROW — back-right corner of the bed, watching over the rows.
          Small overhead-ish view: a stick figure in a hat with arms held
          out by a crossbar pole. Tucked at (w*0.85, h*0.10) — clear of
          all plot tap-targets. */}
      <g transform={`translate(${w * 0.85}, ${h * 0.10})`}>
        {/* shadow on the soil */}
        <ellipse cx={1} cy={26} rx={16} ry={3.5} fill="#000" opacity={0.28} />
        {/* central pole */}
        <line x1={0} y1={26} x2={0} y2={-12} stroke="#7B4F2C" strokeWidth={2.0} strokeLinecap="round" />
        {/* arm crossbar */}
        <line x1={-14} y1={-2} x2={14} y2={-2} stroke="#7B4F2C" strokeWidth={1.6} strokeLinecap="round" />
        {/* burlap shirt — tan, with patch */}
        <path d="M -10 -1 Q -12 8 -8 14 L 8 14 Q 12 8 10 -1 Z"
              fill="#D6B57A" stroke={STROKE} strokeWidth={1.0} strokeLinejoin="round" />
        <rect x={-3} y={4} width={6} height={5} fill="#A85940" stroke={STROKE} strokeWidth={0.6} />
        {/* straw hands — tufts at the end of each arm */}
        <path d="M -14 -2 L -18 -5 M -14 -2 L -18 0 M -14 -2 L -16 2"
              stroke="#C9A66A" strokeWidth={1.0} strokeLinecap="round" />
        <path d="M 14 -2 L 18 -5 M 14 -2 L 18 0 M 14 -2 L 16 2"
              stroke="#C9A66A" strokeWidth={1.0} strokeLinecap="round" />
        {/* head — round burlap sack */}
        <circle cx={0} cy={-12} r={6.5} fill="#E2C690" stroke={STROKE} strokeWidth={1.0} />
        {/* button eyes */}
        <circle cx={-2} cy={-13} r={0.9} fill="#1F1006" />
        <circle cx={2}  cy={-13} r={0.9} fill="#1F1006" />
        {/* stitched smile */}
        <path d="M -2.5 -10 Q 0 -8.5 2.5 -10"
              stroke="#1F1006" strokeWidth={0.7} fill="none" strokeLinecap="round" />
        {/* straw poking from neck */}
        <path d="M -5 -7 L -7 -4 M 0 -6 L 0 -3 M 5 -7 L 7 -4"
              stroke="#C9A66A" strokeWidth={0.9} strokeLinecap="round" />
        {/* floppy straw hat */}
        <ellipse cx={0} cy={-18} rx={11} ry={2.4} fill="#A88044" stroke={STROKE} strokeWidth={1.0} />
        <path d="M -6 -19 Q 0 -23 6 -19 L 5 -17 L -5 -17 Z"
              fill="#C9A66A" stroke={STROKE} strokeWidth={1.0} strokeLinejoin="round" />
        {/* hat band */}
        <line x1={-5} y1={-18} x2={5} y2={-18} stroke="#5A3B1F" strokeWidth={0.8} />
        {/* tiny crow on the crossbar — a friend, not a foe */}
        <g transform="translate(-9, -5)">
          <ellipse cx={0} cy={0} rx={3} ry={2} fill="#2C2014" stroke="#1F1006" strokeWidth={0.5} />
          <circle cx={2} cy={-1} r={1.4} fill="#2C2014" />
          <path d="M 3 -1 L 5 -0.5 L 3 0 Z" fill="#E89A3C" />
          <circle cx={2.5} cy={-1.3} r={0.3} fill="#FFD93D" />
        </g>
      </g>

      {/* WHEELBARROW — pushed deep into the lower-right corner so it
          doesn't crowd plot veg-6 (absolute 470, 360). */}
      <g transform={`translate(${w * 0.93}, ${h * 0.92})`}>
        {/* shadow */}
        <ellipse cx={2} cy={20} rx={28} ry={3} fill="#000" opacity={0.25} />
        {/* tray (bin) — angled side view */}
        <path
          d="M -22 -2 L 24 -6 L 18 12 L -16 12 Z"
          fill="#A0563B" stroke={STROKE} strokeWidth={1.4} strokeLinejoin="round"
        />
        <path d="M -22 -2 L 24 -6" stroke="#D38461" strokeWidth={1.3} strokeLinecap="round" />
        {/* carrots poking out of the tray */}
        <g transform="translate(2, -4)">
          <path d="M -2 -1 L 0 -10 L 2 -1 Z" fill="#E8713C" stroke={STROKE} strokeWidth={0.9} strokeLinejoin="round" />
          <path d="M -3 -10 L 0 -16 L 3 -10" stroke="#5C7E4F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <path d="M 5 -1 L 7 -8 L 9 -1 Z" fill="#E8713C" stroke={STROKE} strokeWidth={0.8} strokeLinejoin="round" />
          <path d="M 4 -8 L 7 -13 L 10 -8" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </g>
        <line x1={-22} y1={-2} x2={-32} y2={-6} stroke="#7B4F2C" strokeWidth={2.4} strokeLinecap="round" />
        <line x1={-12} y1={12} x2={-16} y2={20} stroke="#7B4F2C" strokeWidth={2.0} strokeLinecap="round" />
        <circle cx={18} cy={16} r={6} fill="#5A3B1F" stroke={STROKE} strokeWidth={1.2} />
        <circle cx={18} cy={16} r={2.4} fill="#A89D8A" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FRUIT GROVE — sun-dappled grassy clearing with bench + hammock
// ─────────────────────────────────────────────────────────────────────────

export function FruitGroveBackground({ x, y, w, h }: BgProps) {
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

      {/* main grass body */}
      <path d={grovePath} fill={`url(#${grassId})`} stroke={STROKE} strokeWidth={1.4} strokeLinejoin="round" />

      {/* tree-shape clearings — slightly DARKER patches under each plot.
          Plot positions in this zone (zone origin 800,160; w=520):
            fruit-1 local (105, 65), fruit-2 (385, 65),
            fruit-3 (245, 145), fruit-4 (105, 225), fruit-5 (385, 225). */}
      {[
        { cx: 0.20, cy: 0.25 }, { cx: 0.74, cy: 0.25 },
        { cx: 0.47, cy: 0.56 }, { cx: 0.20, cy: 0.86 }, { cx: 0.74, cy: 0.86 },
      ].map((c, i) => (
        <ellipse key={i}
          cx={w * c.cx} cy={h * c.cy} rx={48} ry={36}
          fill="#5F8C50" opacity={0.40} />
      ))}

      {/* dappled sun spots — light puddles on the grass */}
      <ellipse cx={w * 0.35} cy={h * 0.42} rx={26} ry={14} fill="#E8F0CC" opacity={0.30} />
      <ellipse cx={w * 0.62} cy={h * 0.72} rx={22} ry={12} fill="#E8F0CC" opacity={0.25} />
      <ellipse cx={w * 0.50} cy={h * 0.20} rx={18} ry={9} fill="#E8F0CC" opacity={0.28} />

      {/* stray daisies tucked between trees */}
      {[
        { dx: w * 0.47, dy: h * 0.30 }, { dx: w * 0.34, dy: h * 0.72 },
        { dx: w * 0.62, dy: h * 0.45 }, { dx: w * 0.50, dy: h * 0.95 },
      ].map((d, i) => (
        <g key={i} transform={`translate(${d.dx}, ${d.dy})`}>
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <ellipse key={deg} cx={0} cy={-2} rx={1.3} ry={2.5} fill="#FFFCEF"
                     stroke="#B5AC8F" strokeWidth={0.3} transform={`rotate(${deg})`} />
          ))}
          <circle cx={0} cy={0} r={1.2} fill="#FFD166" />
        </g>
      ))}

      {/* short grass tufts */}
      {[
        { tx: w * 0.10, ty: h * 0.55 }, { tx: w * 0.92, ty: h * 0.50 },
        { tx: w * 0.50, ty: h * 0.92 }, { tx: w * 0.08, ty: h * 0.92 },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.tx}, ${t.ty})`}>
          <path d="M 0 0 Q -2 -6 -1 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 0 Q 1 -7 3 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M 0 0 Q 3 -5 5 -8" stroke="#5C7E4F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* HAMMOCK — strung between two slim posts in the front-center,
          between the bottom row of trees. Posts at local (200, 230) and
          (320, 230); hammock dips between them. */}
      <g>
        {/* shadows of the posts */}
        <ellipse cx={w * 0.385} cy={h * 0.91} rx={3.2} ry={1.4} fill="#000" opacity={0.30} />
        <ellipse cx={w * 0.615} cy={h * 0.91} rx={3.2} ry={1.4} fill="#000" opacity={0.30} />
        {/* posts */}
        <line x1={w * 0.385} y1={h * 0.92} x2={w * 0.385} y2={h * 0.74}
              stroke="#7B4F2C" strokeWidth={2.4} strokeLinecap="round" />
        <line x1={w * 0.615} y1={h * 0.92} x2={w * 0.615} y2={h * 0.74}
              stroke="#7B4F2C" strokeWidth={2.4} strokeLinecap="round" />
        {/* post caps */}
        <circle cx={w * 0.385} cy={h * 0.74} r={2.2} fill="#5A3B1F" stroke={STROKE} strokeWidth={0.6} />
        <circle cx={w * 0.615} cy={h * 0.74} r={2.2} fill="#5A3B1F" stroke={STROKE} strokeWidth={0.6} />
        {/* hammock canvas — sagging curve */}
        <path d={`M ${w * 0.39} ${h * 0.76}
                  Q ${w * 0.50} ${h * 0.86} ${w * 0.61} ${h * 0.76}`}
              stroke="#C9907A" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d={`M ${w * 0.39} ${h * 0.76}
                  Q ${w * 0.50} ${h * 0.86} ${w * 0.61} ${h * 0.76}`}
              stroke="#E8B49A" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        {/* hammock fringe — little tassels at each end */}
        <path d={`M ${w * 0.39} ${h * 0.78} L ${w * 0.39} ${h * 0.81}
                  M ${w * 0.398} ${h * 0.78} L ${w * 0.398} ${h * 0.815}
                  M ${w * 0.382} ${h * 0.78} L ${w * 0.382} ${h * 0.81}`}
              stroke="#9B6A39" strokeWidth={0.7} />
        <path d={`M ${w * 0.61} ${h * 0.78} L ${w * 0.61} ${h * 0.81}
                  M ${w * 0.602} ${h * 0.78} L ${w * 0.602} ${h * 0.815}
                  M ${w * 0.618} ${h * 0.78} L ${w * 0.618} ${h * 0.81}`}
              stroke="#9B6A39" strokeWidth={0.7} />
        {/* a single fallen apple beneath the hammock */}
        <circle cx={w * 0.50} cy={h * 0.92} r={3.2} fill="#D14B3D" stroke={STROKE} strokeWidth={0.8} />
        <path d="M 0 -3 Q 0.5 -4 1 -3" stroke="#5C7E4F" strokeWidth={1.0} fill="none"
              transform={`translate(${w * 0.50}, ${h * 0.92})`} strokeLinecap="round" />
      </g>

      {/* WOODEN BENCH — pushed deeper into lower-left corner */}
      <g transform={`translate(${w * 0.05}, ${h * 0.92})`}>
        <ellipse cx={6} cy={20} rx={32} ry={3} fill="#000" opacity={0.22} />
        <rect x={-16} y={-14} width={42} height={3.5} rx={1} fill="#A0703F" stroke={STROKE} strokeWidth={0.9} />
        <rect x={-16} y={-8}  width={42} height={3.5} rx={1} fill="#8E6233" stroke={STROKE} strokeWidth={0.9} />
        <line x1={-15} y1={-15} x2={-15} y2={4} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={25}  y1={-15} x2={25}  y2={4} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M -20 0 L 30 0 L 28 6 L -18 6 Z" fill="#9B6A39" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        <line x1={-20} y1={0} x2={30} y2={0} stroke="#C39061" strokeWidth={0.9} opacity={0.85} />
        <line x1={-12} y1={6}  x2={-14} y2={18} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={22}  y1={6}  x2={24}  y2={18} stroke="#7B4F2C" strokeWidth={2.2} strokeLinecap="round" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FLOWER GARDEN — lavender-tinted bed, stone edging, trellis arch,
// butterfly house, bird bath
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

      {/* bed surface */}
      <path d={bedPath} fill={`url(#${flowerId})`} stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" />

      {/* lavender wash (subtle violet tint over the grass) */}
      <path d={bedPath} fill="#C8B2D8" opacity={0.18} />

      {/* meandering footpath — a soft tan ribbon tracing the same
          S-curve the plots follow, so the flowers visually sit ALONG
          a path, not in random spots. Very narrow + soft so it doesn't
          fight the plant illustrations. Plot S-curve in this zone
          (origin 80,460): local x's ~75-450, y's ~65-230. */}
      <path d={`M ${w * 0.10} ${h * 0.20}
                Q ${w * 0.20} ${h * 0.36} ${w * 0.36} ${h * 0.52}
                Q ${w * 0.42} ${h * 0.78} ${w * 0.32} ${h * 0.86}
                M ${w * 0.36} ${h * 0.52}
                Q ${w * 0.52} ${h * 0.66} ${w * 0.66} ${h * 0.62}
                Q ${w * 0.84} ${h * 0.46} ${w * 0.92} ${h * 0.22}`}
            stroke="#E8D6B0" strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.55} />
      <path d={`M ${w * 0.10} ${h * 0.20}
                Q ${w * 0.20} ${h * 0.36} ${w * 0.36} ${h * 0.52}
                Q ${w * 0.42} ${h * 0.78} ${w * 0.32} ${h * 0.86}
                M ${w * 0.36} ${h * 0.52}
                Q ${w * 0.52} ${h * 0.66} ${w * 0.66} ${h * 0.62}
                Q ${w * 0.84} ${h * 0.46} ${w * 0.92} ${h * 0.22}`}
            stroke="#F7E6C4" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />

      {/* moss tufts — darker green clusters along the bed edges */}
      <ellipse cx={w * 0.20} cy={h * 0.25} rx={9} ry={3} fill="#5C7E4F" opacity={0.55} />
      <ellipse cx={w * 0.78} cy={h * 0.20} rx={7} ry={2.5} fill="#5C7E4F" opacity={0.5} />
      <ellipse cx={w * 0.40} cy={h * 0.85} rx={8} ry={3} fill="#5C7E4F" opacity={0.55} />
      <ellipse cx={w * 0.62} cy={h * 0.55} rx={6} ry={2} fill="#5C7E4F" opacity={0.5} />

      {/* tiny lavender flower spikes scattered in the bed (off the plots) */}
      {[
        { fx: 0.10, fy: 0.55 }, { fx: 0.85, fy: 0.50 },
        { fx: 0.20, fy: 0.78 }, { fx: 0.66, fy: 0.18 },
        { fx: 0.50, fy: 0.92 },
      ].map((f, i) => (
        <g key={i} transform={`translate(${w * f.fx}, ${h * f.fy})`}>
          <line x1={0} y1={0} x2={0} y2={10} stroke="#5C7E4F" strokeWidth={1} strokeLinecap="round" />
          <ellipse cx={0} cy={-2} rx={1.6} ry={4} fill="#A675B0" opacity={0.85} />
          <ellipse cx={0} cy={-5} rx={1.2} ry={2.5} fill="#C8A2D8" opacity={0.95} />
        </g>
      ))}

      {/* STONE EDGING — ring of stones around the bed perimeter */}
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

      {/* TRELLIS ARCH — at the southern entry of the flower bed.
          Two tall posts joined by an arched top, climbing vines
          coiling up both sides. Reads as the gateway INTO the
          flowers from the path below. */}
      <g transform={`translate(${w * 0.50}, ${h * 0.93})`}>
        {/* shadow */}
        <ellipse cx={0} cy={4} rx={28} ry={2.5} fill="#000" opacity={0.22} />
        {/* left post */}
        <line x1={-22} y1={4} x2={-22} y2={-32} stroke="#7B4F2C" strokeWidth={2.6} strokeLinecap="round" />
        {/* right post */}
        <line x1={22}  y1={4} x2={22}  y2={-32} stroke="#7B4F2C" strokeWidth={2.6} strokeLinecap="round" />
        {/* arched top */}
        <path d="M -22 -32 Q 0 -42 22 -32" stroke="#7B4F2C" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        {/* lattice cross-bracing */}
        <path d="M -22 -10 L 22 -10 M -22 -20 L 22 -20"
              stroke="#A0703F" strokeWidth={0.9} opacity={0.75} />
        <path d="M -22 -32 L 22 -10 M 22 -32 L -22 -10"
              stroke="#A0703F" strokeWidth={0.6} opacity={0.5} />
        {/* climbing vine — left side (green tendril with pink blooms) */}
        <path d="M -22 4 Q -28 -6 -20 -14 Q -26 -22 -18 -28 Q -24 -34 -16 -38"
              stroke="#5C7E4F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        {[{vx:-26,vy:-2,c:'#E6B0D0'},{vx:-22,vy:-14,c:'#FFB7C5'},{vx:-26,vy:-26,c:'#E6B0D0'},{vx:-18,vy:-36,c:'#FFB7C5'}].map((v,i) => (
          <g key={i}>
            <circle cx={v.vx} cy={v.vy} r={2.4} fill={v.c} stroke="#9B6A8A" strokeWidth={0.5} />
            <circle cx={v.vx} cy={v.vy} r={0.8} fill="#FFD93D" />
          </g>
        ))}
        {/* climbing vine — right side */}
        <path d="M 22 4 Q 28 -6 20 -14 Q 26 -22 18 -28 Q 24 -34 16 -38"
              stroke="#5C7E4F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        {[{vx:26,vy:-2,c:'#FFB7C5'},{vx:22,vy:-14,c:'#E6B0D0'},{vx:26,vy:-26,c:'#FFB7C5'},{vx:18,vy:-36,c:'#E6B0D0'}].map((v,i) => (
          <g key={i}>
            <circle cx={v.vx} cy={v.vy} r={2.4} fill={v.c} stroke="#9B6A8A" strokeWidth={0.5} />
            <circle cx={v.vx} cy={v.vy} r={0.8} fill="#FFD93D" />
          </g>
        ))}
      </g>

      {/* BUTTERFLY HOUSE on a pole — upper-left corner, tucked at
          (w*0.07, h*0.10), well clear of flower-1 (155, 525). */}
      <g transform={`translate(${w * 0.07}, ${h * 0.10})`}>
        {/* shadow */}
        <ellipse cx={2} cy={36} rx={6} ry={1.6} fill="#000" opacity={0.28} />
        {/* pole */}
        <line x1={0} y1={36} x2={0} y2={4} stroke="#7B4F2C" strokeWidth={2.0} strokeLinecap="round" />
        {/* house body — narrow vertical wood box */}
        <rect x={-7} y={-14} width={14} height={20} rx={1} fill="#C39061" stroke={STROKE} strokeWidth={1.0} />
        {/* roof — pitched */}
        <path d="M -9 -14 L 0 -22 L 9 -14 Z"
              fill="#6B4423" stroke={STROKE} strokeWidth={1.0} strokeLinejoin="round" />
        {/* slat openings — three thin slits where butterflies enter */}
        <line x1={-3} y1={-10} x2={-3} y2={-2} stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
        <line x1={0}  y1={-10} x2={0}  y2={-2} stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
        <line x1={3}  y1={-10} x2={3}  y2={-2} stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
        {/* tiny butterfly perched on the roof */}
        <g transform="translate(5, -22)">
          <ellipse cx={-1.8} cy={0} rx={1.6} ry={1.0} fill="#FFB7C5" stroke="#A85970" strokeWidth={0.4} transform="rotate(-30)" />
          <ellipse cx={1.8}  cy={0} rx={1.6} ry={1.0} fill="#FFB7C5" stroke="#A85970" strokeWidth={0.4} transform="rotate(30)" />
          <line x1={0} y1={-0.8} x2={0} y2={1.2} stroke="#1F1006" strokeWidth={0.5} />
        </g>
      </g>

      {/* BIRD BATH — lower-right corner */}
      <g transform={`translate(${w * 0.86}, ${h * 0.84})`}>
        <ellipse cx={0} cy={20} rx={22} ry={3} fill="#000" opacity={0.22} />
        <path d="M -10 18 L 10 18 L 8 6 L -8 6 Z"
              fill="#A89D8A" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        <rect x={-4} y={-4} width={8} height={10} fill="#9B948A" stroke={STROKE} strokeWidth={1.0} />
        <path d="M -14 -8 Q -16 -2 -10 -2 L 10 -2 Q 16 -2 14 -8 Z"
              fill="#9B948A" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        <ellipse cx={0} cy={-10} rx={14} ry={3.5} fill="#B5A892" stroke={STROKE} strokeWidth={1.2} />
        <ellipse cx={0} cy={-10} rx={11} ry={2.4} fill="#A8CFD8" />
        <ellipse cx={-3} cy={-10.5} rx={3} ry={0.7} fill="#FFFFFF" opacity={0.7} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JAPANESE GARDEN — torii gate, koi stream + moon bridge, sand + raked
// arcs, stepping stones, shishi-odoshi, stone lantern, maple, bamboo
// ─────────────────────────────────────────────────────────────────────────

export function JapaneseBackground({ x, y, w, h }: BgProps) {
  const grassId = `jp-grass-${Math.round(x)}-${Math.round(y)}`;
  const sandId  = `jp-sand-${Math.round(x)}-${Math.round(y)}`;
  const waterId = `jp-water-${Math.round(x)}-${Math.round(y)}`;

  // SAND CIRCLE — moved center-LEFT and made smaller so it sits in the
  // composition without overlapping any plot. Plot positions (local):
  // jp-1 (95,60), jp-2 (210,80), jp-3 (350,60), jp-4 (380,175),
  // jp-5 (175,230), jp-6 (60,170).  Sand at (275, 135), rx=72, ry=42.
  const sandCx = w * 0.53, sandCy = h * 0.47;
  const sandRx = 70, sandRy = 42;

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
        <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#B0D4D8" />
          <stop offset="100%" stopColor="#7FA9B0" />
        </linearGradient>
      </defs>

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

      {/* MOSS RING beneath the sand — softens the transition */}
      <ellipse cx={sandCx} cy={sandCy} rx={sandRx + 8} ry={sandRy + 6} fill="#5C7E4F" opacity={0.45} />

      {/* SAND CIRCLE */}
      <ellipse cx={sandCx} cy={sandCy} rx={sandRx} ry={sandRy} fill={`url(#${sandId})`} stroke={STROKE} strokeWidth={1.2} />

      {/* raked concentric arcs */}
      {[0.92, 0.74, 0.56, 0.38, 0.20].map((f, i) => (
        <ellipse key={i}
          cx={sandCx} cy={sandCy} rx={sandRx * f} ry={sandRy * f}
          stroke="#A89878" strokeWidth={0.8} fill="none" opacity={0.7} />
      ))}

      {/* STONE BORDER ring along the sand edge */}
      {Array.from({ length: 14 }).map((_, i) => {
        const ang = (i / 14) * Math.PI * 2;
        const sx = sandCx + Math.cos(ang) * (sandRx + 4);
        const sy = sandCy + Math.sin(ang) * (sandRy + 4);
        const r = i % 2 === 0 ? 5.5 : 4.5;
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

      {/* one feature stone on the sand */}
      <g>
        <ellipse cx={sandCx - sandRx * 0.4} cy={sandCy + sandRy * 0.15} rx={9} ry={5} fill="#5F5B53" opacity={0.25} />
        <ellipse cx={sandCx - sandRx * 0.4} cy={sandCy + sandRy * 0.10} rx={9} ry={5} fill="#7F7A70" stroke={STROKE} strokeWidth={1.2} />
        <ellipse cx={sandCx - sandRx * 0.45} cy={sandCy + sandRy * 0.07} rx={4} ry={1.6} fill="#A89D8A" />
      </g>

      {/* KOI STREAM — narrow ribbon along the right edge of the bed.
          Enters near the top-right, curves down past the bridge area,
          exits at the bottom. Stays clear of all plot positions. */}
      <g>
        {/* stream bed shadow */}
        <path d={`M ${w * 0.97} ${h * 0.12}
                  Q ${w * 0.92} ${h * 0.36} ${w * 0.84} ${h * 0.58}
                  Q ${w * 0.78} ${h * 0.78} ${w * 0.72} ${h * 0.96}`}
              stroke="#5A8A80" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.30} />
        {/* main water ribbon */}
        <path d={`M ${w * 0.97} ${h * 0.12}
                  Q ${w * 0.92} ${h * 0.36} ${w * 0.84} ${h * 0.58}
                  Q ${w * 0.78} ${h * 0.78} ${w * 0.72} ${h * 0.96}`}
              stroke={`url(#${waterId})`} strokeWidth={22} fill="none" strokeLinecap="round" />
        {/* center highlight ribbon */}
        <path d={`M ${w * 0.97} ${h * 0.12}
                  Q ${w * 0.92} ${h * 0.36} ${w * 0.84} ${h * 0.58}
                  Q ${w * 0.78} ${h * 0.78} ${w * 0.72} ${h * 0.96}`}
              stroke="#D2EAEC" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
        {/* shimmer arcs */}
        <path d={`M ${w * 0.94} ${h * 0.22} Q ${w * 0.91} ${h * 0.28} ${w * 0.88} ${h * 0.34}`}
              stroke="#FFFFFF" strokeWidth={1.0} fill="none" opacity={0.6} strokeLinecap="round" />
        <path d={`M ${w * 0.86} ${h * 0.50} Q ${w * 0.84} ${h * 0.56} ${w * 0.82} ${h * 0.62}`}
              stroke="#FFFFFF" strokeWidth={1.0} fill="none" opacity={0.5} strokeLinecap="round" />
        <path d={`M ${w * 0.78} ${h * 0.74} Q ${w * 0.76} ${h * 0.80} ${w * 0.74} ${h * 0.86}`}
              stroke="#FFFFFF" strokeWidth={1.0} fill="none" opacity={0.55} strokeLinecap="round" />
        {/* a single orange koi swimming in the upper bend */}
        <g transform={`translate(${w * 0.93}, ${h * 0.30}) rotate(60)`}>
          <ellipse cx={0} cy={0} rx={6} ry={2.4} fill="#E8713C" stroke={STROKE} strokeWidth={0.7} />
          <path d="M -6 0 L -10 -2.5 L -10 2.5 Z" fill="#E8713C" stroke={STROKE} strokeWidth={0.7} strokeLinejoin="round" />
          <ellipse cx={2} cy={-0.8} rx={1.6} ry={0.8} fill="#FFFFFF" opacity={0.85} />
          <circle cx={3.5} cy={-0.3} r={0.5} fill="#1F1006" />
          {/* white-and-orange marking */}
          <ellipse cx={-1} cy={1} rx={2} ry={1.2} fill="#FFFFFF" opacity={0.6} />
        </g>
        {/* lily pads on the lower stretch */}
        <g transform={`translate(${w * 0.78}, ${h * 0.82})`}>
          <ellipse cx={0} cy={0} rx={5.5} ry={3.5} fill="#5C7E4F" stroke="#3D5C32" strokeWidth={0.7} />
          <path d="M 0 0 L 4 -2" stroke="#3D5C32" strokeWidth={0.5} />
          <circle cx={-1} cy={-1} r={1.4} fill="#FFB7C5" stroke="#9B6A8A" strokeWidth={0.4} />
        </g>
      </g>

      {/* MOON BRIDGE — arches OVER the koi stream around (w*0.84, h*0.58).
          Vermillion-stained wood, kid-storybook style. The arch sits
          AROUND the stream so it visually crosses the water. */}
      <g transform={`translate(${w * 0.84}, ${h * 0.58})`}>
        {/* shadow on water */}
        <ellipse cx={2} cy={6} rx={26} ry={4} fill="#000" opacity={0.30} />
        {/* arch underside (darker) */}
        <path d="M -26 4 Q 0 -22 26 4 Q 0 -16 -26 4 Z"
              fill="#7A2E1F" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        {/* arch top (vermillion) */}
        <path d="M -26 4 Q 0 -22 26 4 L 22 4 Q 0 -18 -22 4 Z"
              fill="#C8412B" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        {/* highlight along the arch */}
        <path d="M -22 4 Q 0 -18 22 4" stroke="#E66C53" strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* tiny rail uprights along the bridge */}
        {[-18, -10, 0, 10, 18].map((rx, i) => {
          // interpolate arch height at this x: arch peaks at -18 in the middle
          const ry = -18 * (1 - Math.pow(rx / 22, 2));
          return (
            <line key={i} x1={rx} y1={ry + 1} x2={rx} y2={ry - 5}
                  stroke="#7A2E1F" strokeWidth={1.0} strokeLinecap="round" />
          );
        })}
        {/* top handrail */}
        <path d="M -18 -16 Q 0 -23 18 -16" stroke="#7A2E1F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>

      {/* SHISHI-ODOSHI — bamboo deer-scarer. Just upstream of the bridge.
          A pivoting bamboo tube on a wooden frame, water running into it. */}
      <g transform={`translate(${w * 0.93}, ${h * 0.42})`}>
        {/* shadow */}
        <ellipse cx={2} cy={14} rx={10} ry={2} fill="#000" opacity={0.28} />
        {/* upright wooden post */}
        <line x1={-6} y1={14} x2={-6} y2={-4} stroke="#7B4F2C" strokeWidth={2.0} strokeLinecap="round" />
        {/* fulcrum */}
        <circle cx={-6} cy={-4} r={1.8} fill="#5A3B1F" stroke={STROKE} strokeWidth={0.6} />
        {/* bamboo tube (pivoted, tilting forward) */}
        <g transform="rotate(-18) translate(-6, -4)">
          <rect x={0} y={-2.5} width={20} height={5} rx={1.2} fill="#8CB27A" stroke={STROKE} strokeWidth={0.9} />
          {/* nodes */}
          <line x1={6} y1={-2.5} x2={6} y2={2.5} stroke="#5C7E4F" strokeWidth={0.7} />
          <line x1={13} y1={-2.5} x2={13} y2={2.5} stroke="#5C7E4F" strokeWidth={0.7} />
          {/* opening at the far end (where water spills) */}
          <ellipse cx={20} cy={0} rx={1.4} ry={2.2} fill="#3F2614" />
        </g>
        {/* tiny water spout from above */}
        <path d="M -2 -10 L -2 -5" stroke="#A8CFD8" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
        <circle cx={-2} cy={-4} r={1.0} fill="#A8CFD8" opacity={0.7} />
      </g>

      {/* TORII GATE — vermillion gateway at the south entry of the bed. */}
      <g transform={`translate(${w * 0.50}, ${h * 0.95})`}>
        {/* shadow */}
        <ellipse cx={0} cy={2} rx={32} ry={2.5} fill="#000" opacity={0.28} />
        {/* left pillar */}
        <rect x={-26} y={-30} width={5} height={32} fill="#C8412B" stroke={STROKE} strokeWidth={1.0} />
        <rect x={-26} y={-30} width={5} height={4}  fill="#E66C53" />
        {/* right pillar */}
        <rect x={21} y={-30} width={5} height={32} fill="#C8412B" stroke={STROKE} strokeWidth={1.0} />
        <rect x={21} y={-30} width={5} height={4}  fill="#E66C53" />
        {/* lower crossbeam (nuki) */}
        <rect x={-30} y={-22} width={60} height={4} fill="#7A2E1F" stroke={STROKE} strokeWidth={1.0} />
        {/* upper curved lintel (kasagi) */}
        <path d="M -34 -32 Q 0 -40 34 -32 L 32 -28 Q 0 -36 -32 -28 Z"
              fill="#C8412B" stroke={STROKE} strokeWidth={1.0} strokeLinejoin="round" />
        {/* lintel highlight */}
        <path d="M -32 -32 Q 0 -38 32 -32" stroke="#E66C53" strokeWidth={1.2} fill="none" opacity={0.85} />
        {/* center vertical post (gakuzuka) */}
        <rect x={-1.5} y={-32} width={3} height={10} fill="#7A2E1F" stroke={STROKE} strokeWidth={0.7} />
      </g>

      {/* STEPPING STONES — a curving path of flat river stones from the
          torii up past the sand garden and around to the upper-left. */}
      {[
        { sx: 0.50, sy: 0.78, r: 7 },
        { sx: 0.46, sy: 0.66, r: 7 },
        { sx: 0.40, sy: 0.55, r: 6 },
        { sx: 0.32, sy: 0.45, r: 7 },
        { sx: 0.22, sy: 0.35, r: 6 },
        { sx: 0.16, sy: 0.24, r: 6 },
      ].map((s, i) => (
        <g key={i}>
          <ellipse cx={w * s.sx + 0.5} cy={h * s.sy + 1} rx={s.r} ry={s.r * 0.55} fill="#000" opacity={0.20} />
          <ellipse cx={w * s.sx} cy={h * s.sy} rx={s.r} ry={s.r * 0.55}
                   fill={i % 2 === 0 ? '#A89D8A' : '#9B948A'} stroke={STROKE_LIGHT} strokeWidth={0.7} />
          <ellipse cx={w * s.sx - 1} cy={h * s.sy - 1} rx={s.r * 0.42} ry={s.r * 0.18} fill="#D4C8B0" opacity={0.7} />
        </g>
      ))}

      {/* STONE LANTERN — moved to lower-left corner. */}
      <g transform={`translate(${w * 0.07}, ${h * 0.86})`}>
        <ellipse cx={0} cy={36} rx={16} ry={3.5} fill="#000" opacity={0.22} />
        <ellipse cx={-2} cy={36} rx={20} ry={4.5} fill="#7BA46F" opacity={0.7} />
        <rect x={-12} y={20} width={24} height={14} rx={2} fill="#A8A39A" stroke={STROKE} strokeWidth={1.2} />
        <rect x={-4} y={4} width={8} height={18} fill="#9B968D" stroke={STROKE} strokeWidth={1} />
        <rect x={-10} y={-2} width={20} height={6} rx={1} fill="#B0ABA1" stroke={STROKE} strokeWidth={1} />
        <rect x={-8} y={-16} width={16} height={16} rx={2} fill="#7F7A70" stroke={STROKE} strokeWidth={1.2} />
        <rect x={-5} y={-13} width={10} height={10} rx={1} fill="#FFD98A" />
        <rect x={-5} y={-13} width={10} height={10} rx={1} fill="none" stroke="#3F1E10" strokeWidth={0.7} />
        <path d="M -13 -16 Q -15 -20 -12 -22 L 12 -22 Q 15 -20 13 -16 Z"
              fill="#6F6A60" stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
        <path d="M -12 -22 L -3 -29 L 3 -29 L 12 -22 Z"
              fill="#7F7A70" stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
        <circle cx={0} cy={-31} r={2.2} fill="#6F6A60" stroke={STROKE} strokeWidth={0.9} />
      </g>

      {/* JAPANESE MAPLE — upper-left corner, small canopy of red leaves
          viewed from above. Trunk hidden beneath. */}
      <g transform={`translate(${w * 0.10}, ${h * 0.18})`}>
        {/* canopy shadow */}
        <ellipse cx={3} cy={6} rx={26} ry={9} fill="#000" opacity={0.22} />
        {/* outer canopy — deep red */}
        <circle cx={0} cy={0} r={24} fill="#8C2A1F" stroke="#5A1A12" strokeWidth={1.3} />
        {/* inner canopy — brighter red highlights */}
        <circle cx={-6} cy={-6} r={15} fill="#C8412B" opacity={0.85} />
        <circle cx={4}  cy={4}  r={10} fill="#E66C53" opacity={0.7} />
        {/* leaf-edge clusters */}
        <circle cx={-18} cy={-4} r={6}  fill="#A8341F" stroke="#5A1A12" strokeWidth={0.7} />
        <circle cx={16}  cy={-12} r={6} fill="#A8341F" stroke="#5A1A12" strokeWidth={0.7} />
        <circle cx={20}  cy={8}  r={7}  fill="#A8341F" stroke="#5A1A12" strokeWidth={0.7} />
        <circle cx={-12} cy={16} r={6}  fill="#A8341F" stroke="#5A1A12" strokeWidth={0.7} />
        {/* a few fallen leaves on the grass below */}
        <path d="M -28 22 L -26 24 L -28 26 L -30 24 Z" fill="#C8412B" stroke="#7A2E1F" strokeWidth={0.4} />
        <path d="M 28 24 L 30 26 L 28 28 L 26 26 Z" fill="#A8341F" stroke="#7A2E1F" strokeWidth={0.4} />
        <path d="M 0 30 L 2 32 L 0 34 L -2 32 Z" fill="#C8412B" stroke="#7A2E1F" strokeWidth={0.4} />
      </g>

      {/* BAMBOO STALKS lining the LEFT edge, between maple and lantern */}
      {[
        { bx: w * 0.04, top: h * 0.42 },
        { bx: w * 0.07, top: h * 0.50 },
        { bx: w * 0.04, top: h * 0.60 },
        { bx: w * 0.08, top: h * 0.70 },
      ].map((b, i) => {
        const stalkHeight = h * 0.14;
        const sway = i % 2 === 0 ? -1.5 : 1.2;
        return (
          <g key={i}>
            <path d={`M ${b.bx} ${b.top + stalkHeight} L ${b.bx + sway} ${b.top}`}
                  stroke="#8CB27A" strokeWidth={3.2} strokeLinecap="round" />
            {[0.3, 0.6].map((nf, ni) => (
              <line key={ni}
                x1={b.bx + sway * (1 - nf) - 2.5} y1={b.top + stalkHeight * nf}
                x2={b.bx + sway * (1 - nf) + 2.5} y2={b.top + stalkHeight * nf}
                stroke="#5C7E4F" strokeWidth={1.2} />
            ))}
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
