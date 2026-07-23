// components/child/garden/BeyondBackgrounds.tsx
//
// The four hand-drawn beds of the SECOND grow screen — the garden
// beyond the trellis. Same organic-silhouette language as
// QuadrantBackgrounds.tsx, each designed around character-anchors:
//
//   • Orchard        — leaning picking ladder + bushel basket + birdhouse
//   • Berry patch    — cane-training wires + berry pail + robin
//   • Herb & tea     — potting table with terracotta pots + bee skep
//   • Moon garden    — glowing stone lantern + crescent stone + fireflies
//
// Anchors and decorative features avoid the plot tap-targets defined
// in lib/world/plotLayout.ts (orchard-*, berry-*, herb-*, moon-*).

'use client';

const STROKE = '#5A3B1F';

interface BgProps { x: number; y: number; w: number; h: number; }

// Shared organic bed silhouette — same footprint feel as the home
// screen's beds, asymmetric corners on purpose.
function bedPath(w: number, h: number): string {
  return `M ${w * 0.06} ${h * 0.18}
     C ${w * 0.02} ${h * 0.10}, ${w * 0.10} ${h * 0.04}, ${w * 0.22} ${h * 0.05}
     C ${w * 0.40} ${h * 0.02}, ${w * 0.62} ${h * 0.06}, ${w * 0.78} ${h * 0.04}
     C ${w * 0.92} ${h * 0.06}, ${w * 0.98} ${h * 0.16}, ${w * 0.96} ${h * 0.32}
     C ${w * 0.99} ${h * 0.55}, ${w * 0.97} ${h * 0.78}, ${w * 0.92} ${h * 0.92}
     C ${w * 0.78} ${h * 0.99}, ${w * 0.55} ${h * 0.96}, ${w * 0.34} ${h * 0.97}
     C ${w * 0.18} ${h * 0.99}, ${w * 0.04} ${h * 0.92}, ${w * 0.04} ${h * 0.78}
     C ${w * 0.02} ${h * 0.55}, ${w * 0.08} ${h * 0.34}, ${w * 0.06} ${h * 0.18} Z`;
}

// ─────────────────────────────────────────────────────────────────────────
// ORCHARD — mown grass clearing with ladder, bushel basket + birdhouse
// ─────────────────────────────────────────────────────────────────────────

export function OrchardBackground({ x, y, w, h }: BgProps) {
  const id = `orch-bed-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#B9DA9C" />
          <stop offset="60%" stopColor="#9CC486" />
          <stop offset="100%" stopColor="#83AC6E" />
        </linearGradient>
      </defs>

      <path d={bedPath(w, h)} fill="#4F6F42" transform={`translate(0, ${h * 0.04})`} opacity={0.55} />
      <path d={bedPath(w, h)} fill={`url(#${id})`} stroke={STROKE} strokeWidth={1.6} strokeLinejoin="round" />

      {/* mower stripes — alternating light passes across the clearing */}
      {[0.2, 0.45, 0.7].map((f, i) => (
        <path key={i}
          d={`M ${w * 0.08} ${h * f} Q ${w * 0.5} ${h * (f - 0.03)} ${w * 0.93} ${h * f}`}
          stroke="#C8E4AC" strokeWidth={14} fill="none" opacity={0.35} strokeLinecap="round" />
      ))}
      {/* windfall fruit dots in the grass, away from the plots */}
      <circle cx={w * 0.62} cy={h * 0.55} r={2.6} fill="#E8A87C" stroke="#8B6938" strokeWidth={0.5} />
      <circle cx={w * 0.13} cy={h * 0.52} r={2.3} fill="#D14B3D" stroke="#8B6938" strokeWidth={0.5} />
      <circle cx={w * 0.55} cy={h * 0.9} r={2.4} fill="#E8A87C" stroke="#8B6938" strokeWidth={0.5} />

      {/* PICKING LADDER — leaning against nothing yet, waiting for the
          first tree to grow tall enough to need it. Back-right corner. */}
      <g transform={`translate(${w * 0.93}, ${h * 0.38}) rotate(8)`}>
        <ellipse cx={0} cy={44} rx={16} ry={3} fill="#000" opacity={0.22} />
        <line x1={-8} y1={44} x2={-3} y2={-34} stroke="#8A6238" strokeWidth={3} strokeLinecap="round" />
        <line x1={8} y1={44} x2={3} y2={-34} stroke="#8A6238" strokeWidth={3} strokeLinecap="round" />
        {[-24, -10, 4, 18, 32].map(ry2 => (
          <line key={ry2} x1={-6.5} y1={ry2} x2={6.5} y2={ry2}
                stroke="#A9774C" strokeWidth={2.2} strokeLinecap="round" />
        ))}
        <line x1={-8} y1={44} x2={-3} y2={-34} stroke={STROKE} strokeWidth={0.7} opacity={0.5} />
        <line x1={8} y1={44} x2={3} y2={-34} stroke={STROKE} strokeWidth={0.7} opacity={0.5} />
      </g>

      {/* BUSHEL BASKET — front-left, empty and hopeful */}
      <g transform={`translate(${w * 0.07}, ${h * 0.86})`}>
        <ellipse cx={0} cy={12} rx={17} ry={3} fill="#000" opacity={0.24} />
        <path d="M -14 -6 L -11 10 Q 0 13 11 10 L 14 -6 Z"
              fill="#C9A66A" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M -13 -1 L 13 -1 M -12 4 L 12 4" stroke="#8A6238" strokeWidth={1} opacity={0.8} />
        <ellipse cx={0} cy={-6} rx={14} ry={3.4} fill="#A9774C" stroke={STROKE} strokeWidth={1.1} />
        <ellipse cx={0} cy={-6} rx={10.5} ry={2.2} fill="#6B4423" opacity={0.8} />
      </g>

      {/* BIRDHOUSE on a post — top edge, between the first two plots */}
      <g transform={`translate(${w * 0.56}, ${h * 0.05})`}>
        <ellipse cx={0} cy={30} rx={5} ry={1.6} fill="#000" opacity={0.22} />
        <line x1={0} y1={30} x2={0} y2={8} stroke="#7B4F2C" strokeWidth={2.4} strokeLinecap="round" />
        <rect x={-8} y={-8} width={16} height={16} rx={2}
              fill="#E2C690" stroke={STROKE} strokeWidth={1.1} />
        <path d="M -10 -8 L 0 -16 L 10 -8 Z" fill="#A0563B" stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
        <circle cx={0} cy={0} r={2.8} fill="#3F2614" />
        <line x1={0} y1={5} x2={0} y2={8} stroke={STROKE} strokeWidth={1} strokeLinecap="round" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BERRY PATCH — bramble bed with training wires, berry pail + robin
// ─────────────────────────────────────────────────────────────────────────

export function BerryBackground({ x, y, w, h }: BgProps) {
  const id = `berry-bed-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#8FAF74" />
          <stop offset="55%" stopColor="#7A9C63" />
          <stop offset="100%" stopColor="#647F51" />
        </linearGradient>
      </defs>

      <path d={bedPath(w, h)} fill="#3F5233" transform={`translate(0, ${h * 0.04})`} opacity={0.55} />
      <path d={bedPath(w, h)} fill={`url(#${id})`} stroke={STROKE} strokeWidth={1.6} strokeLinejoin="round" />

      {/* CANE-TRAINING WIRES — two low post-and-wire runs the plots sit
          between, like rows in a pick-your-own patch. Wires bow gently. */}
      {[0.33, 0.82].map((f, i) => (
        <g key={i}>
          {/* end posts */}
          {[0.09, 0.91].map(px => (
            <g key={px}>
              <ellipse cx={w * px} cy={h * f + 12} rx={3.4} ry={1.3} fill="#000" opacity={0.22} />
              <rect x={w * px - 2.5} y={h * f - 14} width={5} height={26} rx={1}
                    fill="#7B4F2C" stroke="#3F2614" strokeWidth={0.8} />
            </g>
          ))}
          {/* two sagging wires between the posts */}
          <path d={`M ${w * 0.09} ${h * f - 10} Q ${w * 0.5} ${h * f - 5} ${w * 0.91} ${h * f - 10}`}
                stroke="#8A8578" strokeWidth={1} fill="none" opacity={0.75} />
          <path d={`M ${w * 0.09} ${h * f - 2} Q ${w * 0.5} ${h * f + 3} ${w * 0.91} ${h * f - 2}`}
                stroke="#8A8578" strokeWidth={1} fill="none" opacity={0.75} />
        </g>
      ))}

      {/* straw mulch strips under the rows */}
      {[0.42, 0.9].map((f, i) => (
        <path key={i}
          d={`M ${w * 0.12} ${h * f} Q ${w * 0.5} ${h * (f - 0.02)} ${w * 0.9} ${h * f}`}
          stroke="#D6B57A" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
      ))}

      {/* BERRY PAIL — front-right, enamel with a wire handle */}
      <g transform={`translate(${w * 0.9}, ${h * 0.85})`}>
        <ellipse cx={0} cy={11} rx={13} ry={2.6} fill="#000" opacity={0.24} />
        <path d="M -10 -6 L -8 9 Q 0 11 8 9 L 10 -6 Z"
              fill="#DCE6EC" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        <ellipse cx={0} cy={-6} rx={10} ry={2.6} fill="#B8C6CE" stroke={STROKE} strokeWidth={1} />
        <path d="M -9 -7 Q 0 -18 9 -7" stroke="#6B6D6E" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        {/* a few berries already in the pail */}
        <circle cx={-3} cy={-6} r={1.7} fill="#5B3A64" />
        <circle cx={2} cy={-7} r={1.6} fill="#7A4A84" />
        <circle cx={5} cy={-5.5} r={1.5} fill="#5B3A64" />
      </g>

      {/* ROBIN perched on the near end-post of the top row */}
      <g transform={`translate(${w * 0.09}, ${h * 0.33 - 18})`}>
        <ellipse cx={0} cy={1} rx={4.6} ry={3.4} fill="#8A7B6B" stroke={STROKE} strokeWidth={0.8} />
        <path d="M -4 0 Q -7 -1 -8 1 Q -6 2 -4 2 Z" fill="#6E6156" stroke={STROKE} strokeWidth={0.5} />
        <circle cx={3.4} cy={-2.6} r={2.6} fill="#8A7B6B" stroke={STROKE} strokeWidth={0.8} />
        <ellipse cx={1} cy={1.6} rx={3} ry={2.2} fill="#D1603D" />
        <path d="M 5.6 -3 L 8 -2.4 L 5.6 -1.8 Z" fill="#E89A3C" stroke={STROKE} strokeWidth={0.5} />
        <circle cx={4} cy={-3.2} r={0.6} fill="#1F1006" />
        <line x1={-1} y1={4.4} x2={-1} y2={6.5} stroke="#3F2614" strokeWidth={0.9} strokeLinecap="round" />
        <line x1={1.5} y1={4.4} x2={1.5} y2={6.5} stroke="#3F2614" strokeWidth={0.9} strokeLinecap="round" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HERB & TEA GARDEN — kitchen bed with potting table + bee skep
// ─────────────────────────────────────────────────────────────────────────

export function HerbBackground({ x, y, w, h }: BgProps) {
  const id = `herb-bed-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#A98A5C" />
          <stop offset="55%" stopColor="#8F7148" />
          <stop offset="100%" stopColor="#715837" />
        </linearGradient>
      </defs>

      <path d={bedPath(w, h)} fill="#4A3A22" transform={`translate(0, ${h * 0.04})`} opacity={0.6} />
      <path d={bedPath(w, h)} fill={`url(#${id})`} stroke={STROKE} strokeWidth={1.6} strokeLinejoin="round" />

      {/* stone-chip edging following the bed's inner rim */}
      {[
        [0.12, 0.12], [0.3, 0.07], [0.5, 0.08], [0.7, 0.07], [0.88, 0.14],
        [0.94, 0.4], [0.93, 0.68], [0.86, 0.9], [0.6, 0.95], [0.35, 0.94],
        [0.12, 0.88], [0.06, 0.62], [0.07, 0.35],
      ].map(([fx, fy], i) => (
        <ellipse key={i} cx={w * fx} cy={h * fy} rx={4.2} ry={2.2}
                 fill={i % 2 === 0 ? '#B5A892' : '#C2B4A0'}
                 stroke="#6B5D48" strokeWidth={0.5} />
      ))}

      {/* thyme-sprig scatter between the plots */}
      {[[0.52, 0.55], [0.16, 0.55], [0.6, 0.88]].map(([fx, fy], i) => (
        <g key={i} transform={`translate(${w * fx}, ${h * fy})`}>
          <path d="M 0 0 Q -2 -5 -1 -9 M 0 0 Q 2 -5 3 -8" stroke="#5C7E4F"
                strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.8} />
          <circle cx={-1} cy={-9} r={1} fill="#C9A0DC" opacity={0.8} />
          <circle cx={3} cy={-8} r={1} fill="#C9A0DC" opacity={0.7} />
        </g>
      ))}

      {/* POTTING TABLE — back-right, with terracotta pots waiting */}
      <g transform={`translate(${w * 0.92}, ${h * 0.22})`}>
        <ellipse cx={0} cy={26} rx={24} ry={3.4} fill="#000" opacity={0.22} />
        <rect x={-24} y={-2} width={48} height={5} rx={1.5}
              fill="#A9774C" stroke={STROKE} strokeWidth={1.1} />
        <line x1={-19} y1={3} x2={-19} y2={25} stroke="#7B4F2C" strokeWidth={2.6} strokeLinecap="round" />
        <line x1={19} y1={3} x2={19} y2={25} stroke="#7B4F2C" strokeWidth={2.6} strokeLinecap="round" />
        <line x1={-19} y1={14} x2={19} y2={14} stroke="#7B4F2C" strokeWidth={1.6} strokeLinecap="round" />
        {/* pots on the tabletop */}
        {[-13, -1, 11].map((px, i) => (
          <g key={i} transform={`translate(${px}, ${-2})`}>
            <path d="M -4.5 -7 L -3.4 0 L 3.4 0 L 4.5 -7 Z"
                  fill="#C97B4A" stroke={STROKE} strokeWidth={0.9} strokeLinejoin="round" />
            <rect x={-5} y={-9} width={10} height={2.6} rx={0.8}
                  fill="#D68A58" stroke={STROKE} strokeWidth={0.8} />
            {i === 1 && (
              <path d="M 0 -9 Q -2 -13 -1 -15 M 0 -9 Q 2 -12 2.5 -15"
                    stroke="#5C7E4F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
            )}
          </g>
        ))}
        {/* a spare pot tipped over under the table */}
        <g transform="translate(-6, 22) rotate(-72)">
          <path d="M -4 -6 L -3 0 L 3 0 L 4 -6 Z"
                fill="#C97B4A" stroke={STROKE} strokeWidth={0.8} strokeLinejoin="round" />
          <rect x={-4.5} y={-8} width={9} height={2.2} rx={0.7}
                fill="#D68A58" stroke={STROKE} strokeWidth={0.7} />
        </g>
      </g>

      {/* BEE SKEP — woven straw dome on a little board, front-right */}
      <g transform={`translate(${w * 0.9}, ${h * 0.82})`}>
        <ellipse cx={0} cy={9} rx={16} ry={2.8} fill="#000" opacity={0.24} />
        <rect x={-14} y={6} width={28} height={3} rx={1.4}
              fill="#A9774C" stroke={STROKE} strokeWidth={0.9} />
        <path d="M -12 6 Q -13 -8 0 -12 Q 13 -8 12 6 Z"
              fill="#D6B57A" stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
        {[-6, -1.5, 3].map(sy => (
          <path key={sy} d={`M ${-11 + Math.abs(sy) * 0.4} ${sy} Q 0 ${sy + 2.4} ${11 - Math.abs(sy) * 0.4} ${sy}`}
                stroke="#A88044" strokeWidth={1} fill="none" opacity={0.85} />
        ))}
        <ellipse cx={0} cy={4.5} rx={2.6} ry={1.8} fill="#3F2614" />
        {/* two bees on approach */}
        <g transform="translate(-17, -8)">
          <ellipse cx={0} cy={0} rx={1.8} ry={1.3} fill="#FFD93D" stroke="#3F2614" strokeWidth={0.5} />
          <line x1={-0.6} y1={-1.2} x2={-0.6} y2={1.2} stroke="#3F2614" strokeWidth={0.7} />
          <ellipse cx={-0.4} cy={-1.8} rx={1.5} ry={0.8} fill="#DCE6EC" opacity={0.85} />
        </g>
        <g transform="translate(15, -14)">
          <ellipse cx={0} cy={0} rx={1.6} ry={1.1} fill="#FFD93D" stroke="#3F2614" strokeWidth={0.5} />
          <line x1={-0.5} y1={-1} x2={-0.5} y2={1} stroke="#3F2614" strokeWidth={0.6} />
          <ellipse cx={-0.3} cy={-1.5} rx={1.3} ry={0.7} fill="#DCE6EC" opacity={0.85} />
        </g>
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MOON GARDEN — dusk-toned bed with stone lantern, crescent + fireflies
// ─────────────────────────────────────────────────────────────────────────

export function MoonBackground({ x, y, w, h }: BgProps) {
  const id = `moon-bed-${Math.round(x)}-${Math.round(y)}`;
  const glowId = `moon-glow-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#6B6D8A" />
          <stop offset="55%" stopColor="#565873" />
          <stop offset="100%" stopColor="#42445C" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#FFE89A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={bedPath(w, h)} fill="#252738" transform={`translate(0, ${h * 0.04})`} opacity={0.7} />
      <path d={bedPath(w, h)} fill={`url(#${id})`} stroke="#2E3044" strokeWidth={1.6} strokeLinejoin="round" />

      {/* white-pebble border along the inner rim — moonlight catchers */}
      {[
        [0.13, 0.13], [0.32, 0.08], [0.52, 0.09], [0.72, 0.08], [0.89, 0.16],
        [0.94, 0.42], [0.92, 0.7], [0.84, 0.91], [0.58, 0.95], [0.32, 0.93],
        [0.11, 0.86], [0.06, 0.6], [0.08, 0.34],
      ].map(([fx, fy], i) => (
        <ellipse key={i} cx={w * fx} cy={h * fy} rx={3.8} ry={2}
                 fill={i % 2 === 0 ? '#E4E1EF' : '#CFCBE0'}
                 stroke="#6B6D8A" strokeWidth={0.5} />
      ))}

      {/* silvery mist wisps drifting low across the bed */}
      <path d={`M ${w * 0.15} ${h * 0.5} Q ${w * 0.35} ${h * 0.44} ${w * 0.55} ${h * 0.5} T ${w * 0.85} ${h * 0.48}`}
            stroke="#C9CBE0" strokeWidth={5} fill="none" opacity={0.16} strokeLinecap="round" />
      <path d={`M ${w * 0.2} ${h * 0.78} Q ${w * 0.42} ${h * 0.72} ${w * 0.6} ${h * 0.78}`}
            stroke="#C9CBE0" strokeWidth={4} fill="none" opacity={0.14} strokeLinecap="round" />

      {/* STONE LANTERN — back-right, its little flame the only warm
          light in the bed */}
      <g transform={`translate(${w * 0.91}, ${h * 0.3})`}>
        <circle cx={0} cy={-8} r={26} fill={`url(#${glowId})`} />
        <ellipse cx={0} cy={26} rx={12} ry={2.6} fill="#000" opacity={0.3} />
        <rect x={-7} y={18} width={14} height={7} rx={2} fill="#8A8FA8" stroke="#3A3C52" strokeWidth={1} />
        <rect x={-3.5} y={4} width={7} height={14} rx={1.5} fill="#9BA0B8" stroke="#3A3C52" strokeWidth={1} />
        <rect x={-9} y={-2} width={18} height={6} rx={2} fill="#8A8FA8" stroke="#3A3C52" strokeWidth={1} />
        <rect x={-6.5} y={-12} width={13} height={10} rx={1.5} fill="#9BA0B8" stroke="#3A3C52" strokeWidth={1} />
        <rect x={-3.6} y={-10.5} width={7.2} height={7} rx={1} fill="#FFE89A" opacity={0.95} />
        <circle cx={0} cy={-7} r={1.6} fill="#FFC94A" />
        <path d="M -9 -12 Q 0 -20 9 -12 L 6.5 -12 Q 0 -17 -6.5 -12 Z"
              fill="#8A8FA8" stroke="#3A3C52" strokeWidth={1} strokeLinejoin="round" />
        <circle cx={0} cy={-19} r={1.8} fill="#9BA0B8" stroke="#3A3C52" strokeWidth={0.8} />
      </g>

      {/* CRESCENT STONE — a moon-shaped paver set into the front-left */}
      <g transform={`translate(${w * 0.09}, ${h * 0.8})`}>
        <path d="M 0 -11 A 11 11 0 1 0 0 11 A 14.5 14.5 0 1 1 0 -11 Z"
              fill="#E4E1EF" stroke="#6B6D8A" strokeWidth={1}
              transform="rotate(24)" opacity={0.95} />
      </g>

      {/* FIREFLIES — tiny lights hanging in the dusk, off the plots */}
      {[
        [0.28, 0.32], [0.55, 0.62], [0.44, 0.88], [0.75, 0.55], [0.18, 0.62],
      ].map(([fx, fy], i) => (
        <g key={i}>
          <circle cx={w * fx} cy={h * fy} r={4.5} fill="#D8E86A" opacity={0.16} />
          <circle cx={w * fx} cy={h * fy} r={1.3} fill="#EEF59A" opacity={0.9} />
        </g>
      ))}
    </g>
  );
}
