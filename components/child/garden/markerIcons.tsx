'use client';

/**
 * Bespoke marker icons for map structures that previously fell back to emoji.
 *
 * Style guide (matches illustrations.tsx):
 *  - Chunky rounded shapes, flat fills, ONE lighter highlight shape per icon
 *  - Ink outline #3F2614 (#3F3026 for stone) at 1.2-1.6px on main silhouettes
 *  - 2-4 palette colors per icon, tiny soft shadow ellipse under grounded things
 *  - Each icon is a <g> centered on (0,0) fitting a size x size box
 *
 * Usage: <MarkerIcon code="mm4_eagle_ledge" size={34} /> inside an <svg>/<g>,
 * positioned by the caller. Returns null for unknown codes.
 */

const INK = '#3F2614';
const INK_STONE = '#3F3026';

// Palette
const GREEN_DARK = '#3D5C32';
const GREEN_MID = '#7BA46F';
const GREEN_LIGHT = '#A2C794';
const SOIL_DARK = '#6B4423';
const SOIL = '#8B5A2B';
const STONE = '#9B948A';
const CREAM = '#FFFAF2';
const GOLD = '#FFD166';
const TERRA = '#C34A36';
const SKY = '#A8CDD2';
const PLUM = '#7E6B8F';

/** Soft ground shadow under a grounded object. */
function Shadow({ cy, rx, ry }: { cy: number; rx: number; ry?: number }) {
  return <ellipse cx={0} cy={cy} rx={rx} ry={ry ?? rx * 0.22} fill="#000" opacity={0.15} />;
}

type Draw = (r: number) => React.ReactElement;

// ─────────────────────────────────────────────────────────────────────────
// MATH MOUNTAIN — "High Meadow" (Level 4)
// ─────────────────────────────────────────────────────────────────────────

const mm4_valley_thousands: Draw = r => (
  <>
    {/* three receding hills, back to front */}
    <path d={`M ${-r * 0.98} ${r * 0.05} Q ${-r * 0.5} ${-r * 0.7} ${-r * 0.02} ${r * 0.05} Z`}
      fill={GREEN_DARK} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
    <path d={`M ${-r * 0.45} ${r * 0.35} Q ${r * 0.12} ${-r * 0.42} ${r * 0.68} ${r * 0.35} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
    <path d={`M ${-r * 0.95} ${r * 0.72} Q ${-r * 0.15} ${-r * 0.02} ${r * 0.95} ${r * 0.72} Z`}
      fill={GREEN_LIGHT} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* winding path climbing between the hills */}
    <path d={`M ${-r * 0.1} ${r * 0.7} Q ${-r * 0.4} ${r * 0.42} ${-r * 0.08} ${r * 0.24}
              Q ${r * 0.22} ${r * 0.1} ${r * 0.05} ${-r * 0.05}`}
      stroke={CREAM} strokeWidth={r * 0.11} fill="none" strokeLinecap="round" opacity={0.9} />
  </>
);

const mm4_windy_tens: Draw = r => (
  <>
    {/* three curling wind swirls */}
    <path d={`M ${-r * 0.9} ${-r * 0.4} Q ${-r * 0.2} ${-r * 0.62} ${r * 0.35} ${-r * 0.45}
              Q ${r * 0.62} ${-r * 0.36} ${r * 0.5} ${-r * 0.2} Q ${r * 0.4} ${-r * 0.1} ${r * 0.32} ${-r * 0.22}`}
      stroke={SKY} strokeWidth={r * 0.13} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.85} ${r * 0.05} Q ${-r * 0.1} ${-r * 0.12} ${r * 0.55} ${r * 0.02}
              Q ${r * 0.85} ${r * 0.1} ${r * 0.68} ${r * 0.25} Q ${r * 0.55} ${r * 0.34} ${r * 0.5} ${r * 0.2}`}
      stroke={SKY} strokeWidth={r * 0.13} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.75} ${r * 0.5} Q ${-r * 0.05} ${r * 0.32} ${r * 0.3} ${r * 0.5}
              Q ${r * 0.5} ${r * 0.62} ${r * 0.35} ${r * 0.7}`}
      stroke={SKY} strokeWidth={r * 0.11} fill="none" strokeLinecap="round" />
    {/* little seed puffs riding the wind */}
    <circle cx={-r * 0.45} cy={-r * 0.6} r={r * 0.1} fill={CREAM} stroke={INK} strokeWidth={1.2} />
    <line x1={-r * 0.45} y1={-r * 0.6} x2={-r * 0.32} y2={-r * 0.72} stroke={INK} strokeWidth={1} strokeLinecap="round" />
    <circle cx={r * 0.15} cy={-r * 0.18} r={r * 0.08} fill={CREAM} stroke={INK} strokeWidth={1.2} />
    <circle cx={-r * 0.3} cy={r * 0.62} r={r * 0.07} fill={CREAM} stroke={INK} strokeWidth={1.2} />
  </>
);

const mm4_eagle_ledge: Draw = r => (
  <>
    <Shadow cy={r * 0.82} rx={r * 0.7} />
    {/* rock ledge */}
    <path d={`M ${-r * 0.75} ${r * 0.8} Q ${-r * 0.85} ${r * 0.42} ${-r * 0.5} ${r * 0.38}
              L ${r * 0.55} ${r * 0.4} Q ${r * 0.85} ${r * 0.45} ${r * 0.75} ${r * 0.8} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.4} strokeLinejoin="round" />
    {/* round-bellied eagle perched on it */}
    <ellipse cx={0} cy={r * 0.02} rx={r * 0.34} ry={r * 0.42} fill={SOIL_DARK} stroke={INK} strokeWidth={1.5} />
    {/* lighter brown belly (the highlight) — brown, not cream, so it reads eagle not penguin */}
    <ellipse cx={0} cy={r * 0.12} rx={r * 0.2} ry={r * 0.26} fill={SOIL} />
    {/* folded wing line */}
    <path d={`M ${r * 0.18} ${-r * 0.18} Q ${r * 0.34} ${r * 0.05} ${r * 0.2} ${r * 0.32}`}
      stroke={INK} strokeWidth={1.2} fill="none" opacity={0.6} />
    {/* white head */}
    <circle cx={0} cy={-r * 0.52} r={r * 0.22} fill={CREAM} stroke={INK} strokeWidth={1.4} />
    {/* gold hooked beak */}
    <path d={`M ${r * 0.18} ${-r * 0.56} Q ${r * 0.36} ${-r * 0.54} ${r * 0.3} ${-r * 0.42}
              Q ${r * 0.24} ${-r * 0.46} ${r * 0.17} ${-r * 0.47} Z`}
      fill={GOLD} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    <circle cx={r * 0.05} cy={-r * 0.56} r={r * 0.045} fill={INK} />
    {/* talons gripping the edge */}
    <line x1={-r * 0.12} y1={r * 0.4} x2={-r * 0.12} y2={r * 0.48} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
    <line x1={r * 0.1} y1={r * 0.4} x2={r * 0.1} y2={r * 0.48} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
  </>
);

const mm4_factor_firs: Draw = r => (
  <>
    <Shadow cy={r * 0.72} rx={r * 0.62} />
    {/* one shared root mound */}
    <ellipse cx={0} cy={r * 0.6} rx={r * 0.52} ry={r * 0.13} fill={SOIL} stroke={INK} strokeWidth={1.4} />
    {/* left fir (taller) */}
    <path d={`M ${-r * 0.32} ${-r * 0.75} L ${-r * 0.62} ${r * 0.05} L ${-r * 0.44} ${r * 0.0}
              L ${-r * 0.66} ${r * 0.5} L ${r * 0.02} ${r * 0.5} L ${-r * 0.2} ${r * 0.0}
              L ${-r * 0.02} ${r * 0.05} Z`}
      fill={GREEN_DARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* right fir (smaller) */}
    <path d={`M ${r * 0.42} ${-r * 0.38} L ${r * 0.16} ${r * 0.18} L ${r * 0.3} ${r * 0.14}
              L ${r * 0.1} ${r * 0.52} L ${r * 0.74} ${r * 0.52} L ${r * 0.54} ${r * 0.14}
              L ${r * 0.68} ${r * 0.18} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* snow-light highlight on the tall fir's shoulder */}
    <path d={`M ${-r * 0.32} ${-r * 0.6} L ${-r * 0.48} ${-r * 0.18} L ${-r * 0.26} ${-r * 0.28} Z`}
      fill={GREEN_LIGHT} opacity={0.9} />
  </>
);

const mm4_mirror_tarns: Draw = r => (
  <>
    {/* two oval tarns side by side */}
    <ellipse cx={-r * 0.42} cy={-r * 0.02} rx={r * 0.42} ry={r * 0.3} fill={SKY} stroke={INK} strokeWidth={1.4} />
    <ellipse cx={r * 0.44} cy={r * 0.18} rx={r * 0.4} ry={r * 0.28} fill={SKY} stroke={INK} strokeWidth={1.4} />
    {/* shore grass between them */}
    <path d={`M ${-r * 0.02} ${r * 0.28} Q ${-r * 0.08} ${r * 0.02} ${-r * 0.02} ${-r * 0.22}`}
      stroke={GREEN_MID} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    <path d={`M ${r * 0.04} ${r * 0.3} Q ${r * 0.1} ${r * 0.08} ${r * 0.16} ${-r * 0.12}`}
      stroke={GREEN_MID} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    {/* water shine on the left tarn (the highlight) */}
    <ellipse cx={-r * 0.52} cy={-r * 0.1} rx={r * 0.18} ry={r * 0.08} fill={CREAM} opacity={0.8} />
    {/* reflected star in the right tarn */}
    <path d={`M ${r * 0.44} ${r * 0.0} L ${r * 0.5} ${r * 0.14} L ${r * 0.64} ${r * 0.18}
              L ${r * 0.5} ${r * 0.22} L ${r * 0.44} ${r * 0.36} L ${r * 0.38} ${r * 0.22}
              L ${r * 0.24} ${r * 0.18} L ${r * 0.38} ${r * 0.14} Z`}
      fill={GOLD} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
  </>
);

const mm4_leftover_rocks: Draw = r => (
  <>
    <Shadow cy={r * 0.68} rx={r * 0.55} />
    {/* stacked cairn */}
    <ellipse cx={-r * 0.18} cy={r * 0.48} rx={r * 0.44} ry={r * 0.24} fill={STONE} stroke={INK_STONE} strokeWidth={1.4} />
    <ellipse cx={-r * 0.14} cy={r * 0.06} rx={r * 0.34} ry={r * 0.2} fill={STONE} stroke={INK_STONE} strokeWidth={1.4} />
    <ellipse cx={-r * 0.18} cy={-r * 0.28} rx={r * 0.25} ry={r * 0.16} fill={STONE} stroke={INK_STONE} strokeWidth={1.4} />
    <ellipse cx={-r * 0.14} cy={-r * 0.54} rx={r * 0.15} ry={r * 0.11} fill={STONE} stroke={INK_STONE} strokeWidth={1.3} />
    {/* highlight on the middle stone */}
    <ellipse cx={-r * 0.24} cy={r * 0.0} rx={r * 0.16} ry={r * 0.07} fill={CREAM} opacity={0.65} />
    {/* the one leftover pebble, set apart */}
    <ellipse cx={r * 0.62} cy={r * 0.58} rx={r * 0.16} ry={r * 0.11} fill={STONE} stroke={INK_STONE} strokeWidth={1.3} />
  </>
);

const mm4_granite_sums: Draw = r => (
  <>
    <Shadow cy={r * 0.7} rx={r * 0.7} />
    {/* bottom slab */}
    <rect x={-r * 0.7} y={r * 0.05} width={r * 1.4} height={r * 0.58} rx={r * 0.14}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} />
    {/* top slab, offset a little */}
    <rect x={-r * 0.58} y={-r * 0.58} width={r * 1.2} height={r * 0.56} rx={r * 0.14}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} />
    {/* highlight along the top slab's upper edge */}
    <rect x={-r * 0.44} y={-r * 0.5} width={r * 0.8} height={r * 0.12} rx={r * 0.06}
      fill={CREAM} opacity={0.6} />
    {/* granite speckles */}
    <circle cx={-r * 0.3} cy={r * 0.34} r={r * 0.035} fill={INK_STONE} opacity={0.4} />
    <circle cx={r * 0.22} cy={r * 0.42} r={r * 0.03} fill={INK_STONE} opacity={0.4} />
    <circle cx={r * 0.28} cy={-r * 0.22} r={r * 0.03} fill={INK_STONE} opacity={0.4} />
  </>
);

const mm4_cloud_rounding: Draw = r => (
  <>
    {/* rounded hilltop */}
    <path d={`M ${-r * 0.88} ${r * 0.72} Q ${-r * 0.02} ${-r * 0.5} ${r * 0.88} ${r * 0.72} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {/* sunny-side highlight on the hill */}
    <path d={`M ${-r * 0.45} ${r * 0.3} Q ${-r * 0.15} ${-r * 0.12} ${r * 0.15} ${r * 0.02}
              Q ${-r * 0.1} ${r * 0.12} ${-r * 0.28} ${r * 0.32} Z`}
      fill={GREEN_LIGHT} opacity={0.85} />
    {/* plump cloud hugging the summit */}
    <path d={`M ${-r * 0.62} ${-r * 0.12} Q ${-r * 0.78} ${-r * 0.42} ${-r * 0.42} ${-r * 0.48}
              Q ${-r * 0.3} ${-r * 0.78} ${r * 0.05} ${-r * 0.68}
              Q ${r * 0.42} ${-r * 0.75} ${r * 0.5} ${-r * 0.42}
              Q ${r * 0.75} ${-r * 0.32} ${r * 0.55} ${-r * 0.1}
              Q ${0} ${-r * 0.02} ${-r * 0.62} ${-r * 0.12} Z`}
      fill={CREAM} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* soft cloud underside shading */}
    <ellipse cx={r * 0.05} cy={-r * 0.14} rx={r * 0.35} ry={r * 0.07} fill={SKY} opacity={0.55} />
  </>
);

const mm4_slice_share: Draw = r => (
  <>
    <Shadow cy={r * 0.72} rx={r * 0.62} />
    {/* pie with a wedge missing (gap from -10deg to 50deg) */}
    <path d={`M 0 0 L ${r * 0.59} ${-r * 0.1} A ${r * 0.6} ${r * 0.6} 0 1 0 ${r * 0.39} ${r * 0.46} Z`}
      fill={GOLD} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {/* crust ring */}
    <path d={`M ${r * 0.51} ${-r * 0.09} A ${r * 0.52} ${r * 0.52} 0 1 0 ${r * 0.33} ${r * 0.4}`}
      fill="none" stroke={TERRA} strokeWidth={r * 0.09} strokeLinecap="round" />
    {/* steam-vent shine on top (the highlight) */}
    <ellipse cx={-r * 0.2} cy={-r * 0.18} rx={r * 0.14} ry={r * 0.09} fill={CREAM} opacity={0.75} />
    {/* the slid-out slice */}
    <path d={`M ${r * 0.28} ${r * 0.12} L ${r * 0.87} ${r * 0.02} A ${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.67} ${r * 0.58} Z`}
      fill={GOLD} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    <path d={`M ${r * 0.83} ${r * 0.06} A ${r * 0.52} ${r * 0.52} 0 0 1 ${r * 0.65} ${r * 0.5}`}
      fill="none" stroke={TERRA} strokeWidth={r * 0.09} strokeLinecap="round" />
  </>
);

const mm4_long_shadows: Draw = r => (
  <>
    {/* grassy ground disc */}
    <ellipse cx={0} cy={r * 0.42} rx={r * 0.75} ry={r * 0.24} fill={GREEN_LIGHT} stroke={INK} strokeWidth={1.4} />
    {/* the long cast shadow wedge */}
    <path d={`M ${-r * 0.02} ${r * 0.38} L ${-r * 0.66} ${r * 0.46} L ${-r * 0.56} ${r * 0.58} Z`}
      fill={PLUM} opacity={0.6} />
    {/* gnomon stick (ink under-stroke for outline) */}
    <line x1={0} y1={r * 0.38} x2={r * 0.16} y2={-r * 0.42} stroke={INK} strokeWidth={r * 0.15} strokeLinecap="round" />
    <line x1={0} y1={r * 0.38} x2={r * 0.16} y2={-r * 0.42} stroke={SOIL_DARK} strokeWidth={r * 0.09} strokeLinecap="round" />
    {/* low sun */}
    <circle cx={r * 0.62} cy={-r * 0.58} r={r * 0.19} fill={GOLD} stroke={INK} strokeWidth={1.2} />
    {/* sun's shine (the highlight) */}
    <circle cx={r * 0.56} cy={-r * 0.64} r={r * 0.055} fill={CREAM} opacity={0.9} />
  </>
);

const mm4_dewdrop_decimals: Draw = r => (
  <>
    {/* leaf across the top */}
    <path d={`M ${-r * 0.85} ${-r * 0.42} Q ${-r * 0.25} ${-r * 0.85} ${r * 0.45} ${-r * 0.55}
              Q ${r * 0.75} ${-r * 0.42} ${r * 0.6} ${-r * 0.3}
              Q ${-r * 0.1} ${-r * 0.05} ${-r * 0.85} ${-r * 0.42} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* midrib */}
    <path d={`M ${-r * 0.78} ${-r * 0.42} Q ${-r * 0.1} ${-r * 0.5} ${r * 0.55} ${-r * 0.42}`}
      stroke={INK} strokeWidth={1} fill="none" opacity={0.5} />
    {/* leaf sheen (the highlight) */}
    <ellipse cx={-r * 0.3} cy={-r * 0.52} rx={r * 0.18} ry={r * 0.07} fill={GREEN_LIGHT} opacity={0.9}
      transform={`rotate(-12 ${-r * 0.3} ${-r * 0.52})`} />
    {/* three dewdrops, decreasing size */}
    <path d={`M ${-r * 0.4} ${-r * 0.18} Q ${-r * 0.22} ${r * 0.06} ${-r * 0.22} ${r * 0.2}
              A ${r * 0.18} ${r * 0.18} 0 1 1 ${-r * 0.58} ${r * 0.2} Q ${-r * 0.58} ${r * 0.06} ${-r * 0.4} ${-r * 0.18} Z`}
      fill={SKY} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
    <path d={`M ${r * 0.05} ${-r * 0.1} Q ${r * 0.18} ${r * 0.1} ${r * 0.18} ${r * 0.2}
              A ${r * 0.13} ${r * 0.13} 0 1 1 ${-r * 0.08} ${r * 0.2} Q ${-r * 0.08} ${r * 0.1} ${r * 0.05} ${-r * 0.1} Z`}
      fill={SKY} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    <path d={`M ${r * 0.45} ${-r * 0.05} Q ${r * 0.54} ${r * 0.1} ${r * 0.54} ${r * 0.17}
              A ${r * 0.09} ${r * 0.09} 0 1 1 ${r * 0.36} ${r * 0.17} Q ${r * 0.36} ${r * 0.1} ${r * 0.45} ${-r * 0.05} Z`}
      fill={SKY} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    {/* glint in the big drop */}
    <circle cx={-r * 0.47} cy={r * 0.14} r={r * 0.05} fill={CREAM} opacity={0.9} />
  </>
);

const mm4_double_eagle: Draw = r => (
  <>
    {/* warm sun */}
    <circle cx={-r * 0.05} cy={-r * 0.02} r={r * 0.38} fill={GOLD} stroke={INK} strokeWidth={1.4} />
    {/* sun shine (the highlight) */}
    <circle cx={-r * 0.18} cy={-r * 0.16} r={r * 0.11} fill={CREAM} opacity={0.85} />
    {/* two circling eagles — simple wing arcs, one big one small */}
    <path d={`M ${-r * 0.82} ${-r * 0.52} Q ${-r * 0.6} ${-r * 0.76} ${-r * 0.38} ${-r * 0.55}
              Q ${-r * 0.16} ${-r * 0.76} ${r * 0.06} ${-r * 0.52}`}
      stroke={SOIL_DARK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    <path d={`M ${r * 0.28} ${r * 0.5} Q ${r * 0.43} ${r * 0.34} ${r * 0.58} ${r * 0.48}
              Q ${r * 0.73} ${r * 0.34} ${r * 0.88} ${r * 0.5}`}
      stroke={SOIL_DARK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
  </>
);

const mm4_frost_compare: Draw = r => {
  const flake = (cx: number, cy: number, arm: number, w: number) => (
    <g transform={`translate(${cx},${cy})`}>
      {[0, 60, 120].map(deg => (
        <line key={deg} x1={-arm} y1={0} x2={arm} y2={0} stroke={SKY} strokeWidth={w}
          strokeLinecap="round" transform={`rotate(${deg})`} />
      ))}
      {/* branch ticks on the vertical arm */}
      {[0, 60, 120].map(deg => (
        <g key={`t${deg}`} transform={`rotate(${deg})`}>
          <line x1={arm * 0.55} y1={0} x2={arm * 0.75} y2={-arm * 0.2} stroke={SKY} strokeWidth={w * 0.7} strokeLinecap="round" />
          <line x1={-arm * 0.55} y1={0} x2={-arm * 0.75} y2={arm * 0.2} stroke={SKY} strokeWidth={w * 0.7} strokeLinecap="round" />
        </g>
      ))}
      <circle r={arm * 0.16} fill={CREAM} stroke={INK} strokeWidth={1} />
    </g>
  );
  return (
    <>
      {/* the big flake vs the little flake */}
      {flake(-r * 0.32, -r * 0.05, r * 0.55, r * 0.1)}
      {flake(r * 0.55, r * 0.35, r * 0.28, r * 0.07)}
    </>
  );
};

const mm4_terrace_gardens: Draw = r => {
  const sprout = (cx: number, cy: number, s: number) => (
    <g transform={`translate(${cx},${cy})`}>
      <path d={`M 0 0 L 0 ${-s}`} stroke={GREEN_DARK} strokeWidth={1.4} strokeLinecap="round" />
      <path d={`M 0 ${-s * 0.7} Q ${-s * 0.7} ${-s} ${-s * 0.8} ${-s * 1.4}`} stroke={GREEN_DARK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d={`M 0 ${-s * 0.7} Q ${s * 0.7} ${-s} ${s * 0.8} ${-s * 1.4}`} stroke={GREEN_DARK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <>
      <Shadow cy={r * 0.78} rx={r * 0.8} />
      {/* three stepped terraces: soil faces + grass tops */}
      <rect x={-r * 0.8} y={r * 0.36} width={r * 1.6} height={r * 0.38} rx={r * 0.05} fill={SOIL} stroke={INK} strokeWidth={1.4} />
      <rect x={-r * 0.8} y={r * 0.3} width={r * 1.6} height={r * 0.14} rx={r * 0.07} fill={GREEN_MID} stroke={INK} strokeWidth={1.2} />
      <rect x={-r * 0.52} y={-r * 0.02} width={r * 1.04} height={r * 0.34} rx={r * 0.05} fill={SOIL} stroke={INK} strokeWidth={1.4} />
      <rect x={-r * 0.52} y={-r * 0.08} width={r * 1.04} height={r * 0.14} rx={r * 0.07} fill={GREEN_MID} stroke={INK} strokeWidth={1.2} />
      <rect x={-r * 0.26} y={-r * 0.38} width={r * 0.52} height={r * 0.32} rx={r * 0.05} fill={SOIL} stroke={INK} strokeWidth={1.4} />
      {/* top terrace grass is the sunlit highlight */}
      <rect x={-r * 0.26} y={-r * 0.44} width={r * 0.52} height={r * 0.14} rx={r * 0.07} fill={GREEN_LIGHT} stroke={INK} strokeWidth={1.2} />
      {/* tiny sprouts on each level */}
      {sprout(0, -r * 0.44, r * 0.14)}
      {sprout(-r * 0.38, -r * 0.08, r * 0.12)}
      {sprout(r * 0.38, -r * 0.08, r * 0.12)}
      {sprout(-r * 0.62, r * 0.3, r * 0.12)}
      {sprout(r * 0.62, r * 0.3, r * 0.12)}
    </>
  );
};

const mm4_tall_tales: Draw = r => (
  <>
    <Shadow cy={r * 0.72} rx={r * 0.72} />
    {/* open book pages */}
    <path d={`M ${-r * 0.78} ${r * 0.14} Q ${-r * 0.4} ${-r * 0.02} ${-r * 0.02} ${r * 0.1}
              L ${-r * 0.02} ${r * 0.62} Q ${-r * 0.4} ${r * 0.5} ${-r * 0.78} ${r * 0.66} Z`}
      fill={CREAM} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    <path d={`M ${r * 0.78} ${r * 0.14} Q ${r * 0.4} ${-r * 0.02} ${r * 0.02} ${r * 0.1}
              L ${r * 0.02} ${r * 0.62} Q ${r * 0.4} ${r * 0.5} ${r * 0.78} ${r * 0.66} Z`}
      fill={CREAM} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* spine */}
    <line x1={0} y1={r * 0.1} x2={0} y2={r * 0.62} stroke={INK} strokeWidth={1.4} />
    {/* a tiny mountain pops out of the gutter */}
    <path d={`M ${-r * 0.42} ${r * 0.12} L 0 ${-r * 0.68} L ${r * 0.42} ${r * 0.12} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* snowcap on the pop-up peak (the highlight) */}
    <path d={`M ${-r * 0.15} ${-r * 0.38} L 0 ${-r * 0.68} L ${r * 0.15} ${-r * 0.38}
              Q ${r * 0.05} ${-r * 0.3} 0 ${-r * 0.38} Q ${-r * 0.08} ${-r * 0.3} ${-r * 0.15} ${-r * 0.38} Z`}
      fill={CREAM} />
    {/* magic sparkle */}
    <circle cx={r * 0.42} cy={-r * 0.42} r={r * 0.05} fill={GOLD} stroke={INK} strokeWidth={1} />
  </>
);

// ─────────────────────────────────────────────────────────────────────────
// MATH MOUNTAIN — "The Summit" (Level 5)
// ─────────────────────────────────────────────────────────────────────────

const mm5_summit_product: Draw = r => (
  <>
    <Shadow cy={r * 0.72} rx={r * 0.72} />
    {/* the peak */}
    <path d={`M ${-r * 0.78} ${r * 0.66} L ${-r * 0.02} ${-r * 0.62} L ${r * 0.78} ${r * 0.66} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} strokeLinejoin="round" />
    {/* snowcap (the highlight) */}
    <path d={`M ${-r * 0.26} ${-r * 0.22} L ${-r * 0.02} ${-r * 0.62} L ${r * 0.24} ${-r * 0.22}
              Q ${r * 0.12} ${-r * 0.1} ${r * 0.0} ${-r * 0.22} Q ${-r * 0.12} ${-r * 0.1} ${-r * 0.26} ${-r * 0.22} Z`}
      fill={CREAM} stroke={INK_STONE} strokeWidth={1.2} strokeLinejoin="round" />
    {/* victory flag */}
    <line x1={-r * 0.02} y1={-r * 0.62} x2={-r * 0.02} y2={-r * 0.95} stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    <path d={`M ${-r * 0.02} ${-r * 0.95} L ${r * 0.34} ${-r * 0.84} L ${-r * 0.02} ${-r * 0.72} Z`}
      fill={TERRA} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
  </>
);

const mm5_long_stair: Draw = r => (
  <>
    {/* grassy slope rising to the right */}
    <path d={`M ${-r * 0.85} ${r * 0.7} L ${r * 0.8} ${r * 0.7} L ${r * 0.8} ${-r * 0.68}
              Q ${r * 0.1} ${-r * 0.2} ${-r * 0.85} ${r * 0.7} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* winding stone steps up the slope */}
    <rect x={-r * 0.72} y={r * 0.44} width={r * 0.36} height={r * 0.13} rx={r * 0.06} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    <rect x={-r * 0.36} y={r * 0.22} width={r * 0.36} height={r * 0.13} rx={r * 0.06} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    <rect x={-r * 0.14} y={-r * 0.02} width={r * 0.36} height={r * 0.13} rx={r * 0.06} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    <rect x={r * 0.12} y={-r * 0.26} width={r * 0.36} height={r * 0.13} rx={r * 0.06} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    <rect x={r * 0.34} y={-r * 0.5} width={r * 0.36} height={r * 0.13} rx={r * 0.06} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    {/* sunlight on the top step (the highlight) */}
    <rect x={r * 0.4} y={-r * 0.47} width={r * 0.24} height={r * 0.05} rx={r * 0.025} fill={CREAM} opacity={0.8} />
  </>
);

const mm5_meadow_portions: Draw = r => (
  <>
    {/* round meadow */}
    <circle cx={0} cy={0} r={r * 0.68} fill={GREEN_MID} stroke={INK} strokeWidth={1.5} />
    {/* one quarter wedge in lighter bloom (the highlight) */}
    <path d={`M 0 0 L ${r * 0.68} 0 A ${r * 0.68} ${r * 0.68} 0 0 0 0 ${-r * 0.68} Z`}
      fill={GREEN_LIGHT} />
    {/* wedge dividers */}
    <line x1={-r * 0.68} y1={0} x2={r * 0.68} y2={0} stroke={INK} strokeWidth={1.2} opacity={0.7} />
    <line x1={0} y1={-r * 0.68} x2={0} y2={r * 0.68} stroke={INK} strokeWidth={1.2} opacity={0.7} />
    {/* tiny flowers in the blooming wedge */}
    <circle cx={r * 0.32} cy={-r * 0.18} r={r * 0.08} fill={GOLD} stroke={INK} strokeWidth={1} />
    <circle cx={r * 0.14} cy={-r * 0.4} r={r * 0.06} fill={CREAM} stroke={INK} strokeWidth={1} />
    <circle cx={r * 0.42} cy={-r * 0.42} r={r * 0.045} fill={TERRA} stroke={INK} strokeWidth={0.9} />
  </>
);

const mm5_uneven_slices: Draw = r => (
  <>
    {/* plate */}
    <ellipse cx={0} cy={r * 0.56} rx={r * 0.8} ry={r * 0.16} fill={SKY} stroke={INK} strokeWidth={1.3} />
    {/* cake body */}
    <path d={`M ${-r * 0.6} ${-r * 0.18} L ${-r * 0.6} ${r * 0.46} Q ${-r * 0.6} ${r * 0.56} ${-r * 0.48} ${r * 0.56}
              L ${r * 0.48} ${r * 0.56} Q ${r * 0.6} ${r * 0.56} ${r * 0.6} ${r * 0.46} L ${r * 0.6} ${-r * 0.18} Z`}
      fill={CREAM} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {/* terracotta frosting with drips */}
    <path d={`M ${-r * 0.6} ${-r * 0.18} Q ${-r * 0.6} ${-r * 0.34} ${-r * 0.4} ${-r * 0.34}
              L ${r * 0.4} ${-r * 0.34} Q ${r * 0.6} ${-r * 0.34} ${r * 0.6} ${-r * 0.18}
              L ${r * 0.6} ${-r * 0.1} Q ${r * 0.5} ${r * 0.06} ${r * 0.4} ${-r * 0.1}
              Q ${r * 0.14} ${r * 0.1} ${-r * 0.05} ${-r * 0.1}
              Q ${-r * 0.32} ${r * 0.08} ${-r * 0.6} ${-r * 0.08} Z`}
      fill={TERRA} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* UNEVEN cut lines — a skinny slice and a wide one */}
    <line x1={-r * 0.34} y1={-r * 0.3} x2={-r * 0.34} y2={r * 0.55} stroke={INK} strokeWidth={1.3} opacity={0.75} />
    <line x1={-r * 0.12} y1={-r * 0.32} x2={-r * 0.12} y2={r * 0.56} stroke={INK} strokeWidth={1.3} opacity={0.75} />
    {/* frosting sheen (the highlight) */}
    <ellipse cx={r * 0.24} cy={-r * 0.24} rx={r * 0.14} ry={r * 0.045} fill={CREAM} opacity={0.7} />
    {/* cherry */}
    <circle cx={r * 0.05} cy={-r * 0.44} r={r * 0.09} fill={TERRA} stroke={INK} strokeWidth={1.2} />
  </>
);

const mm5_half_of_half: Draw = r => (
  <>
    <g transform="rotate(-4)">
      {/* paper square */}
      <rect x={-r * 0.55} y={-r * 0.55} width={r * 1.1} height={r * 1.1} rx={r * 0.05}
        fill={CREAM} stroke={INK} strokeWidth={1.4} />
      {/* one quarter shaded */}
      <rect x={0} y={0} width={r * 0.55} height={r * 0.55} fill={SKY} opacity={0.7} />
      {/* crease lines */}
      <line x1={0} y1={-r * 0.55} x2={0} y2={r * 0.55} stroke={INK} strokeWidth={1.1}
        strokeDasharray={`${r * 0.12} ${r * 0.09}`} opacity={0.65} />
      <line x1={-r * 0.55} y1={0} x2={r * 0.55} y2={0} stroke={INK} strokeWidth={1.1}
        strokeDasharray={`${r * 0.12} ${r * 0.09}`} opacity={0.65} />
      {/* folded-back corner (the lighter highlight) */}
      <path d={`M ${-r * 0.55} ${-r * 0.2} L ${-r * 0.55} ${-r * 0.55} L ${-r * 0.2} ${-r * 0.55}
                L ${-r * 0.55} ${-r * 0.2} Z`}
        fill={GREEN_LIGHT} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  </>
);

const mm5_snowmelt_sums: Draw = r => (
  <>
    {/* small peak */}
    <path d={`M ${-r * 0.58} ${r * 0.28} L ${0} ${-r * 0.66} L ${r * 0.6} ${r * 0.28} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} strokeLinejoin="round" />
    {/* melting snowcap with drippy edge (the highlight) */}
    <path d={`M ${-r * 0.26} ${-r * 0.24} L 0 ${-r * 0.66} L ${r * 0.27} ${-r * 0.24}
              Q ${r * 0.18} ${-r * 0.06} ${r * 0.1} ${-r * 0.24}
              Q ${r * 0.0} ${-r * 0.02} ${-r * 0.08} ${-r * 0.22}
              Q ${-r * 0.16} ${-r * 0.08} ${-r * 0.26} ${-r * 0.24} Z`}
      fill={CREAM} stroke={INK_STONE} strokeWidth={1.2} strokeLinejoin="round" />
    {/* falling melt drops */}
    <circle cx={-r * 0.05} cy={r * 0.1} r={r * 0.05} fill={SKY} stroke={INK} strokeWidth={1} />
    <circle cx={r * 0.12} cy={-r * 0.02} r={r * 0.04} fill={SKY} stroke={INK} strokeWidth={1} />
    {/* the little stream winding away from the base */}
    <path d={`M ${r * 0.02} ${r * 0.28} Q ${-r * 0.3} ${r * 0.4} ${-r * 0.1} ${r * 0.54}
              Q ${r * 0.1} ${r * 0.66} ${-r * 0.25} ${r * 0.78}`}
      stroke={SKY} strokeWidth={r * 0.14} fill="none" strokeLinecap="round" />
  </>
);

const mm5_tenfold_falls: Draw = r => (
  <>
    {/* cliff face behind */}
    <path d={`M ${-r * 0.7} ${r * 0.62} L ${-r * 0.5} ${-r * 0.7} L ${r * 0.65} ${-r * 0.7}
              L ${r * 0.72} ${r * 0.62} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} strokeLinejoin="round" />
    {/* three rock ledges stepping down to the right */}
    <rect x={-r * 0.56} y={-r * 0.36} width={r * 0.42} height={r * 0.11} rx={r * 0.055} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    <rect x={r * 0.14} y={r * 0.04} width={r * 0.42} height={r * 0.11} rx={r * 0.055} fill={STONE} stroke={INK_STONE} strokeWidth={1.2} />
    {/* triple-tier cascade — tiers overlap so it reads as one stream */}
    <rect x={-r * 0.3} y={-r * 0.72} width={r * 0.28} height={r * 0.42} rx={r * 0.1} fill={SKY} stroke={INK} strokeWidth={1.2} />
    <rect x={-r * 0.12} y={-r * 0.34} width={r * 0.28} height={r * 0.44} rx={r * 0.1} fill={SKY} stroke={INK} strokeWidth={1.2} />
    <rect x={r * 0.06} y={r * 0.06} width={r * 0.28} height={r * 0.42} rx={r * 0.1} fill={SKY} stroke={INK} strokeWidth={1.2} />
    {/* plunge pool */}
    <ellipse cx={0} cy={r * 0.62} rx={r * 0.68} ry={r * 0.18} fill={SKY} stroke={INK} strokeWidth={1.4} />
    {/* foam at each landing + pool shine (the highlight) */}
    <ellipse cx={-r * 0.02} cy={-r * 0.32} rx={r * 0.13} ry={r * 0.05} fill={CREAM} opacity={0.9} />
    <ellipse cx={r * 0.16} cy={r * 0.08} rx={r * 0.13} ry={r * 0.05} fill={CREAM} opacity={0.9} />
    <ellipse cx={r * 0.22} cy={r * 0.55} rx={r * 0.18} ry={r * 0.06} fill={CREAM} opacity={0.9} />
  </>
);

const mm5_rule_stones: Draw = r => (
  <>
    <Shadow cy={r * 0.66} rx={r * 0.78} />
    {/* three standing stones, tallest in the middle */}
    <path d={`M ${-r * 0.72} ${r * 0.6} L ${-r * 0.74} ${r * 0.02} Q ${-r * 0.72} ${-r * 0.14} ${-r * 0.56} ${-r * 0.12}
              Q ${-r * 0.42} ${-r * 0.1} ${-r * 0.42} ${r * 0.04} L ${-r * 0.44} ${r * 0.6} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.4} strokeLinejoin="round" />
    <path d={`M ${-r * 0.18} ${r * 0.6} L ${-r * 0.2} ${-r * 0.5} Q ${-r * 0.18} ${-r * 0.72} ${0} ${-r * 0.7}
              Q ${r * 0.18} ${-r * 0.68} ${r * 0.17} ${-r * 0.48} L ${r * 0.16} ${r * 0.6} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} strokeLinejoin="round" />
    <path d={`M ${r * 0.42} ${r * 0.6} L ${r * 0.4} ${r * 0.06} Q ${r * 0.42} ${-r * 0.1} ${r * 0.58} ${-r * 0.08}
              Q ${r * 0.72} ${-r * 0.06} ${r * 0.72} ${r * 0.08} L ${r * 0.7} ${r * 0.6} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.4} strokeLinejoin="round" />
    {/* light down the middle stone (the highlight) */}
    <path d={`M ${-r * 0.1} ${r * 0.5} L ${-r * 0.11} ${-r * 0.45} Q ${-r * 0.1} ${-r * 0.58} ${-r * 0.02} ${-r * 0.58}
              L ${-r * 0.02} ${r * 0.5} Z`}
      fill={CREAM} opacity={0.55} />
    {/* grass tufts */}
    <path d={`M ${-r * 0.32} ${r * 0.6} Q ${-r * 0.34} ${r * 0.44} ${-r * 0.28} ${r * 0.36}`}
      stroke={GREEN_MID} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    <path d={`M ${r * 0.28} ${r * 0.6} Q ${r * 0.3} ${r * 0.46} ${r * 0.36} ${r * 0.4}`}
      stroke={GREEN_MID} strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </>
);

const mm5_crystal_boxes: Draw = r => {
  // simple isometric cube: front square + top + side faces
  const cube = (cx: number, cy: number, s: number) => (
    <g transform={`translate(${cx},${cy})`}>
      {/* side face */}
      <path d={`M ${s} 0 L ${s + s * 0.4} ${-s * 0.32} L ${s + s * 0.4} ${s - s * 0.32} L ${s} ${s} Z`}
        fill={PLUM} opacity={0.55} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      {/* top face */}
      <path d={`M 0 0 L ${s * 0.4} ${-s * 0.32} L ${s + s * 0.4} ${-s * 0.32} L ${s} 0 Z`}
        fill={CREAM} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      {/* front face — translucent crystal */}
      <rect x={0} y={0} width={s} height={s} fill={SKY} opacity={0.75} stroke={INK} strokeWidth={1.3} />
    </g>
  );
  return (
    <>
      <Shadow cy={r * 0.72} rx={r * 0.6} />
      {cube(-r * 0.5, r * 0.05, r * 0.62)}
      {cube(-r * 0.3, -r * 0.55, r * 0.46)}
      {/* sparkle */}
      <path d={`M ${r * 0.55} ${-r * 0.6} L ${r * 0.6} ${-r * 0.47} L ${r * 0.73} ${-r * 0.42}
                L ${r * 0.6} ${-r * 0.37} L ${r * 0.55} ${-r * 0.24} L ${r * 0.5} ${-r * 0.37}
                L ${r * 0.37} ${-r * 0.42} L ${r * 0.5} ${-r * 0.47} Z`}
        fill={CREAM} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
    </>
  );
};

const mm5_storytellers_peak: Draw = r => (
  <>
    {/* peak silhouette behind */}
    <path d={`M ${-r * 0.7} ${r * 0.55} L ${r * 0.08} ${-r * 0.72} L ${r * 0.78} ${r * 0.55} Z`}
      fill={GREEN_DARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* scroll unfurling across the peak */}
    <path d={`M ${-r * 0.62} ${-r * 0.1} Q ${-r * 0.2} ${-r * 0.22} ${r * 0.2} ${-r * 0.1}
              Q ${r * 0.45} ${-r * 0.04} ${r * 0.6} ${-r * 0.12}
              L ${r * 0.6} ${r * 0.22} Q ${r * 0.45} ${r * 0.3} ${r * 0.2} ${r * 0.24}
              Q ${-r * 0.2} ${r * 0.12} ${-r * 0.62} ${r * 0.24} Z`}
      fill={CREAM} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* rolled ends */}
    <circle cx={-r * 0.66} cy={r * 0.07} r={r * 0.12} fill={GOLD} stroke={INK} strokeWidth={1.3} />
    <circle cx={r * 0.64} cy={r * 0.05} r={r * 0.12} fill={GOLD} stroke={INK} strokeWidth={1.3} />
    {/* wavy story-lines (abstract, not text) */}
    <path d={`M ${-r * 0.38} ${-r * 0.02} Q ${-r * 0.1} ${-r * 0.1} ${r * 0.3} ${-r * 0.0}`}
      stroke={PLUM} strokeWidth={1.2} fill="none" opacity={0.65} strokeLinecap="round" />
    <path d={`M ${-r * 0.38} ${r * 0.1} Q ${-r * 0.1} ${r * 0.02} ${r * 0.18} ${r * 0.1}`}
      stroke={PLUM} strokeWidth={1.2} fill="none" opacity={0.65} strokeLinecap="round" />
    {/* moonlit snow glint on the peak (the highlight) */}
    <path d={`M ${r * 0.0} ${-r * 0.58} L ${r * 0.08} ${-r * 0.72} L ${r * 0.2} ${-r * 0.5}
              Q ${r * 0.1} ${-r * 0.44} ${r * 0.0} ${-r * 0.58} Z`}
      fill={CREAM} opacity={0.85} />
  </>
);

// ─────────────────────────────────────────────────────────────────────────
// READING FOREST — "Fern Hollow" (Level 4)
// ─────────────────────────────────────────────────────────────────────────

const rf4_syllable_stumps: Draw = r => {
  const stump = (cx: number, top: number, w: number) => (
    <g>
      {/* trunk side, rounded bottom */}
      <rect x={cx - w} y={top} width={w * 2} height={r * 0.6 - top} fill={SOIL_DARK} stroke={INK} strokeWidth={1.3} />
      <ellipse cx={cx} cy={r * 0.6} rx={w} ry={w * 0.4} fill={SOIL_DARK} stroke={INK} strokeWidth={1.3} />
      {/* cut top */}
      <ellipse cx={cx} cy={top} rx={w} ry={w * 0.42} fill={SOIL} stroke={INK} strokeWidth={1.3} />
      {/* growth ring */}
      <ellipse cx={cx} cy={top} rx={w * 0.55} ry={w * 0.22} fill="none" stroke={INK} strokeWidth={1} opacity={0.5} />
    </g>
  );
  return (
    <>
      <Shadow cy={r * 0.72} rx={r * 0.8} />
      {stump(-r * 0.58, r * 0.24, r * 0.2)}
      {stump(0, -r * 0.02, r * 0.21)}
      {stump(r * 0.58, -r * 0.3, r * 0.22)}
      {/* sun on the tallest stump's face (the highlight) */}
      <ellipse cx={r * 0.58} cy={-r * 0.3} rx={r * 0.12} ry={r * 0.045} fill={CREAM} opacity={0.7} />
    </>
  );
};

const rf4_tricky_thicket: Draw = r => (
  <>
    {/* tangled bramble loops */}
    <path d={`M ${-r * 0.8} ${r * 0.3} Q ${-r * 0.4} ${-r * 0.6} ${r * 0.1} ${-r * 0.25}
              Q ${r * 0.6} ${0} ${r * 0.35} ${r * 0.4} Q ${r * 0.1} ${r * 0.7} ${-r * 0.25} ${r * 0.45}`}
      stroke={GREEN_DARK} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.6} ${r * 0.6} Q ${-r * 0.7} ${0} ${-r * 0.15} ${-r * 0.05}
              Q ${r * 0.35} ${-r * 0.5} ${r * 0.75} ${-r * 0.1}`}
      stroke={GREEN_DARK} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.35} ${-r * 0.65} Q ${r * 0.05} ${r * 0.05} ${r * 0.7} ${r * 0.5}`}
      stroke={GREEN_MID} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
    {/* thorns */}
    <path d={`M ${-r * 0.45} ${-r * 0.28} l ${-r * 0.1} ${-r * 0.12}`} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
    <path d={`M ${r * 0.42} ${r * 0.28} l ${r * 0.12} ${r * 0.06}`} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
    <path d={`M ${-r * 0.55} ${r * 0.42} l ${-r * 0.12} ${r * 0.04}`} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
    {/* the one bright berry — off-center so it doesn't read as an eye */}
    <circle cx={r * 0.42} cy={r * 0.38} r={r * 0.15} fill={TERRA} stroke={INK} strokeWidth={1.4} />
    {/* berry shine (the highlight) */}
    <circle cx={r * 0.37} cy={r * 0.32} r={r * 0.05} fill={CREAM} opacity={0.9} />
  </>
);

const rf4_prefix_pinecones: Draw = r => {
  const cone = (cx: number, cy: number, w: number, h: number) => (
    <g transform={`translate(${cx},${cy})`}>
      <ellipse cx={0} cy={0} rx={w} ry={h} fill={SOIL} stroke={INK} strokeWidth={1.3} />
      {/* scale arcs */}
      <path d={`M ${-w * 0.8} ${-h * 0.35} Q 0 ${-h * 0.05} ${w * 0.8} ${-h * 0.35}`}
        stroke={SOIL_DARK} strokeWidth={1.2} fill="none" />
      <path d={`M ${-w * 0.85} ${h * 0.15} Q 0 ${h * 0.45} ${w * 0.85} ${h * 0.15}`}
        stroke={SOIL_DARK} strokeWidth={1.2} fill="none" />
    </g>
  );
  return (
    <>
      {/* twig across the top */}
      <path d={`M ${-r * 0.8} ${-r * 0.5} Q ${0} ${-r * 0.68} ${r * 0.8} ${-r * 0.55}`}
        stroke={SOIL_DARK} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      {/* green needle tuft at the right end */}
      <path d={`M ${r * 0.6} ${-r * 0.57} L ${r * 0.82} ${-r * 0.8}`} stroke={GREEN_MID} strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M ${r * 0.6} ${-r * 0.57} L ${r * 0.9} ${-r * 0.62}`} stroke={GREEN_MID} strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M ${r * 0.6} ${-r * 0.57} L ${r * 0.78} ${-r * 0.38}`} stroke={GREEN_MID} strokeWidth={1.6} strokeLinecap="round" />
      {/* two hanging cones */}
      <line x1={-r * 0.35} y1={-r * 0.57} x2={-r * 0.35} y2={-r * 0.32} stroke={SOIL_DARK} strokeWidth={1.5} />
      <line x1={r * 0.25} y1={-r * 0.6} x2={r * 0.25} y2={-r * 0.2} stroke={SOIL_DARK} strokeWidth={1.5} />
      {cone(-r * 0.35, r * 0.05, r * 0.26, r * 0.38)}
      {cone(r * 0.25, r * 0.25, r * 0.22, r * 0.32)}
      {/* light catching the left cone (the highlight) */}
      <ellipse cx={-r * 0.44} cy={-r * 0.12} rx={r * 0.08} ry={r * 0.12} fill={GOLD} opacity={0.5} />
    </>
  );
};

const rf4_suffix_ferns: Draw = r => (
  <>
    <Shadow cy={r * 0.72} rx={r * 0.42} />
    {/* stem curving up into an unfurling spiral */}
    <path d={`M ${-r * 0.1} ${r * 0.7} Q ${-r * 0.2} ${r * 0.2} ${-r * 0.02} ${-r * 0.15}
              Q ${r * 0.1} ${-r * 0.52} ${r * 0.38} ${-r * 0.48}
              Q ${r * 0.62} ${-r * 0.42} ${r * 0.55} ${-r * 0.2}
              Q ${r * 0.48} ${-r * 0.04} ${r * 0.32} ${-r * 0.12}
              Q ${r * 0.2} ${-r * 0.2} ${r * 0.3} ${-r * 0.32}`}
      stroke={GREEN_DARK} strokeWidth={r * 0.11} fill="none" strokeLinecap="round" />
    {/* young pinnae along the lower stem */}
    <path d={`M ${-r * 0.13} ${r * 0.42} Q ${-r * 0.42} ${r * 0.36} ${-r * 0.52} ${r * 0.2}`}
      stroke={GREEN_MID} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.14} ${r * 0.24} Q ${r * 0.14} ${r * 0.2} ${r * 0.24} ${r * 0.05}`}
      stroke={GREEN_MID} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
    <path d={`M ${-r * 0.1} ${r * 0.05} Q ${-r * 0.36} ${-r * 0.02} ${-r * 0.42} ${-r * 0.18}`}
      stroke={GREEN_MID} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
    {/* light along the curl (the highlight) */}
    <path d={`M ${r * 0.18} ${-r * 0.44} Q ${r * 0.4} ${-r * 0.42} ${r * 0.45} ${-r * 0.28}`}
      stroke={GREEN_LIGHT} strokeWidth={r * 0.045} fill="none" strokeLinecap="round" />
  </>
);

const rf4_clue_lanterns: Draw = r => (
  <>
    {/* hook arm */}
    <path d={`M ${-r * 0.55} ${-r * 0.85} Q ${r * 0.12} ${-r * 0.95} ${r * 0.1} ${-r * 0.6}`}
      stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    {/* soft glow halo */}
    <circle cx={r * 0.08} cy={r * 0.1} r={r * 0.56} fill={GOLD} opacity={0.22} />
    {/* top and bottom caps */}
    <rect x={-r * 0.08} y={-r * 0.6} width={r * 0.32} height={r * 0.13} rx={r * 0.05} fill={TERRA} stroke={INK} strokeWidth={1.2} />
    <rect x={-r * 0.05} y={r * 0.5} width={r * 0.26} height={r * 0.12} rx={r * 0.05} fill={TERRA} stroke={INK} strokeWidth={1.2} />
    {/* paper lantern body */}
    <ellipse cx={r * 0.08} cy={r * 0.02} rx={r * 0.38} ry={r * 0.48} fill={GOLD} stroke={INK} strokeWidth={1.5} />
    {/* paper ribs */}
    <path d={`M ${-r * 0.12} ${-r * 0.42} Q ${-r * 0.22} ${r * 0.02} ${-r * 0.12} ${r * 0.44}`}
      stroke={INK} strokeWidth={1} fill="none" opacity={0.4} />
    <path d={`M ${r * 0.28} ${-r * 0.42} Q ${r * 0.38} ${r * 0.02} ${r * 0.28} ${r * 0.44}`}
      stroke={INK} strokeWidth={1} fill="none" opacity={0.4} />
    {/* warm inner glow (the highlight) */}
    <ellipse cx={r * 0.05} cy={r * 0.05} rx={r * 0.16} ry={r * 0.24} fill={CREAM} opacity={0.9} />
    {/* tassel */}
    <line x1={r * 0.08} y1={r * 0.62} x2={r * 0.08} y2={r * 0.8} stroke={TERRA} strokeWidth={1.6} strokeLinecap="round" />
  </>
);

const rf4_story_hollow: Draw = r => (
  <>
    <Shadow cy={r * 0.72} rx={r * 0.62} />
    {/* trunk section */}
    <path d={`M ${-r * 0.5} ${r * 0.66} L ${-r * 0.44} ${-r * 0.6} Q ${-r * 0.44} ${-r * 0.74} ${-r * 0.25} ${-r * 0.72}
              L ${r * 0.3} ${-r * 0.72} Q ${r * 0.48} ${-r * 0.74} ${r * 0.48} ${-r * 0.58}
              L ${r * 0.54} ${r * 0.66} Z`}
      fill={SOIL_DARK} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {/* bark ridge lines */}
    <path d={`M ${-r * 0.32} ${-r * 0.55} Q ${-r * 0.36} ${0} ${-r * 0.34} ${r * 0.55}`}
      stroke={INK} strokeWidth={1} fill="none" opacity={0.45} />
    <path d={`M ${r * 0.36} ${-r * 0.5} Q ${r * 0.4} ${r * 0.05} ${r * 0.4} ${r * 0.55}`}
      stroke={INK} strokeWidth={1} fill="none" opacity={0.45} />
    {/* lighter bark stripe (the highlight) */}
    <path d={`M ${-r * 0.2} ${-r * 0.66} Q ${-r * 0.24} ${-r * 0.2} ${-r * 0.22} ${r * 0.2}`}
      stroke={SOIL} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
    {/* dark hollow arch */}
    <path d={`M ${-r * 0.22} ${r * 0.5} L ${-r * 0.22} ${r * 0.05} Q ${-r * 0.22} ${-r * 0.22} ${r * 0.02} ${-r * 0.22}
              Q ${r * 0.26} ${-r * 0.22} ${r * 0.26} ${r * 0.05} L ${r * 0.26} ${r * 0.5} Z`}
      fill={INK} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
    {/* tiny open book tucked inside */}
    <path d={`M ${-r * 0.14} ${r * 0.28} Q ${-r * 0.06} ${r * 0.22} ${r * 0.02} ${r * 0.27}
              Q ${r * 0.1} ${r * 0.22} ${r * 0.18} ${r * 0.28} L ${r * 0.18} ${r * 0.42}
              Q ${r * 0.1} ${r * 0.37} ${r * 0.02} ${r * 0.42} Q ${-r * 0.06} ${r * 0.37} ${-r * 0.14} ${r * 0.42} Z`}
      fill={CREAM} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
    <line x1={r * 0.02} y1={r * 0.27} x2={r * 0.02} y2={r * 0.42} stroke={INK} strokeWidth={1} />
    {/* grass at the base */}
    <path d={`M ${-r * 0.6} ${r * 0.66} Q ${-r * 0.62} ${r * 0.48} ${-r * 0.54} ${r * 0.4}`}
      stroke={GREEN_MID} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    <path d={`M ${r * 0.6} ${r * 0.66} Q ${r * 0.64} ${r * 0.5} ${r * 0.72} ${r * 0.44}`}
      stroke={GREEN_MID} strokeWidth={1.6} fill="none" strokeLinecap="round" />
  </>
);

// ─────────────────────────────────────────────────────────────────────────
// READING FOREST — "Old-Growth Grove" (Level 5)
// ─────────────────────────────────────────────────────────────────────────

const rf5_tion_trellis: Draw = r => (
  <>
    <Shadow cy={r * 0.74} rx={r * 0.6} />
    {/* trellis slats — two uprights, two crossbars */}
    <rect x={-r * 0.38} y={-r * 0.62} width={r * 0.12} height={r * 1.36} rx={r * 0.05} fill={CREAM} stroke={INK} strokeWidth={1.3} />
    <rect x={r * 0.26} y={-r * 0.62} width={r * 0.12} height={r * 1.36} rx={r * 0.05} fill={CREAM} stroke={INK} strokeWidth={1.3} />
    <rect x={-r * 0.6} y={-r * 0.32} width={r * 1.2} height={r * 0.11} rx={r * 0.05} fill={CREAM} stroke={INK} strokeWidth={1.3} />
    <rect x={-r * 0.6} y={r * 0.12} width={r * 1.2} height={r * 0.11} rx={r * 0.05} fill={CREAM} stroke={INK} strokeWidth={1.3} />
    {/* climbing vine winding up the left upright */}
    <path d={`M ${-r * 0.45} ${r * 0.72} Q ${-r * 0.15} ${r * 0.45} ${-r * 0.35} ${r * 0.15}
              Q ${-r * 0.5} ${-r * 0.1} ${-r * 0.25} ${-r * 0.3} Q ${-r * 0.05} ${-r * 0.48} ${r * 0.05} ${-r * 0.68}`}
      stroke={GREEN_DARK} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
    {/* leaves */}
    <ellipse cx={-r * 0.14} cy={r * 0.34} rx={r * 0.12} ry={r * 0.07} fill={GREEN_MID}
      transform={`rotate(-30 ${-r * 0.14} ${r * 0.34})`} />
    <ellipse cx={-r * 0.46} cy={-r * 0.02} rx={r * 0.12} ry={r * 0.07} fill={GREEN_MID}
      transform={`rotate(30 ${-r * 0.46} ${-r * 0.02})`} />
    {/* the light young leaf at the growing tip (the highlight) */}
    <ellipse cx={-r * 0.05} cy={-r * 0.44} rx={r * 0.11} ry={r * 0.065} fill={GREEN_LIGHT}
      transform={`rotate(-35 ${-r * 0.05} ${-r * 0.44})`} />
    {/* one gold bloom */}
    <circle cx={-r * 0.34} cy={-r * 0.2} r={r * 0.1} fill={GOLD} stroke={INK} strokeWidth={1.2} />
  </>
);

const rf5_root_cellar: Draw = r => (
  <>
    <Shadow cy={r * 0.68} rx={r * 0.85} />
    {/* grassy mound */}
    <path d={`M ${-r * 0.88} ${r * 0.62} Q ${-r * 0.02} ${-r * 0.85} ${r * 0.88} ${r * 0.62} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {/* sunlit crest of the mound (the highlight) */}
    <path d={`M ${-r * 0.45} ${r * 0.02} Q ${-r * 0.12} ${-r * 0.48} ${r * 0.22} ${-r * 0.22}
              Q ${-r * 0.08} ${-r * 0.28} ${-r * 0.32} ${r * 0.08} Z`}
      fill={GREEN_LIGHT} opacity={0.9} />
    {/* arched wooden cellar door */}
    <path d={`M ${-r * 0.3} ${r * 0.62} L ${-r * 0.3} ${r * 0.1} Q ${-r * 0.3} ${-r * 0.2} ${0} ${-r * 0.2}
              Q ${r * 0.3} ${-r * 0.2} ${r * 0.3} ${r * 0.1} L ${r * 0.3} ${r * 0.62} Z`}
      fill={SOIL} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {/* plank seams */}
    <line x1={-r * 0.1} y1={-r * 0.17} x2={-r * 0.1} y2={r * 0.6} stroke={INK} strokeWidth={1} opacity={0.5} />
    <line x1={r * 0.1} y1={-r * 0.17} x2={r * 0.1} y2={r * 0.6} stroke={INK} strokeWidth={1} opacity={0.5} />
    {/* gold knob */}
    <circle cx={r * 0.19} cy={r * 0.24} r={r * 0.06} fill={GOLD} stroke={INK} strokeWidth={1.1} />
    {/* grass tufts by the door */}
    <path d={`M ${-r * 0.44} ${r * 0.62} Q ${-r * 0.48} ${r * 0.44} ${-r * 0.4} ${r * 0.36}`}
      stroke={GREEN_DARK} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    <path d={`M ${r * 0.44} ${r * 0.62} Q ${r * 0.48} ${r * 0.46} ${r * 0.56} ${r * 0.4}`}
      stroke={GREEN_DARK} strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </>
);

const rf5_shade_words: Draw = r => {
  const leaf = (cx: number, cy: number, rot: number, fill: string, s: number) => (
    <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
      <path d={`M 0 ${-s} Q ${s * 0.62} ${-s * 0.25} 0 ${s} Q ${-s * 0.62} ${-s * 0.25} 0 ${-s} Z`}
        fill={fill} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <line x1={0} y1={-s * 0.75} x2={0} y2={s * 0.75} stroke={INK} strokeWidth={1} opacity={0.5} />
    </g>
  );
  return (
    <>
      {/* three overlapping leaves, light to dark */}
      {leaf(-r * 0.32, -r * 0.22, -35, GREEN_LIGHT, r * 0.52)}
      {leaf(0, r * 0.02, -10, GREEN_MID, r * 0.54)}
      {leaf(r * 0.3, r * 0.26, 18, GREEN_DARK, r * 0.52)}
    </>
  );
};

const rf5_riddle_stones: Draw = r => (
  <>
    <Shadow cy={r * 0.68} rx={r * 0.5} />
    {/* tall standing stone */}
    <path d={`M ${-r * 0.34} ${r * 0.62} Q ${-r * 0.44} ${r * 0.0} ${-r * 0.28} ${-r * 0.45}
              Q ${-r * 0.14} ${-r * 0.72} ${r * 0.14} ${-r * 0.64}
              Q ${r * 0.38} ${-r * 0.54} ${r * 0.34} ${r * 0.0} Q ${r * 0.32} ${r * 0.4} ${r * 0.34} ${r * 0.62} Z`}
      fill={STONE} stroke={INK_STONE} strokeWidth={1.5} strokeLinejoin="round" />
    {/* mossy cap */}
    <path d={`M ${-r * 0.3} ${-r * 0.42} Q ${-r * 0.16} ${-r * 0.7} ${r * 0.12} ${-r * 0.62}
              Q ${r * 0.3} ${-r * 0.55} ${r * 0.28} ${-r * 0.42}
              Q ${r * 0.1} ${-r * 0.3} ${-r * 0.08} ${-r * 0.38} Q ${-r * 0.22} ${-r * 0.32} ${-r * 0.3} ${-r * 0.42} Z`}
      fill={GREEN_MID} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
    {/* carved spiral */}
    <path d={`M ${-r * 0.02} ${r * 0.3} Q ${-r * 0.2} ${r * 0.14} ${-r * 0.04} ${-r * 0.0}
              Q ${r * 0.14} ${-r * 0.12} ${r * 0.2} ${r * 0.04} Q ${r * 0.22} ${r * 0.16} ${r * 0.1} ${r * 0.16}
              Q ${r * 0.0} ${r * 0.15} ${r * 0.04} ${r * 0.05}`}
      stroke={INK_STONE} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    {/* light down the left edge (the highlight) */}
    <path d={`M ${-r * 0.26} ${r * 0.4} Q ${-r * 0.34} ${-r * 0.0} ${-r * 0.2} ${-r * 0.34}`}
      stroke={CREAM} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" opacity={0.6} />
    {/* grass tuft */}
    <path d={`M ${r * 0.44} ${r * 0.62} Q ${r * 0.46} ${r * 0.46} ${r * 0.54} ${r * 0.4}`}
      stroke={GREEN_MID} strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </>
);

const rf5_deep_story_grove: Draw = r => (
  <>
    {/* glowing path receding between the trunks */}
    <path d={`M ${-r * 0.34} ${r * 0.7} L ${r * 0.34} ${r * 0.7} L ${r * 0.09} ${-r * 0.22} L ${-r * 0.09} ${-r * 0.22} Z`}
      fill={GOLD} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    {/* glow at the vanishing point (the highlight) */}
    <ellipse cx={0} cy={-r * 0.24} rx={r * 0.24} ry={r * 0.16} fill={CREAM} opacity={0.8} />
    {/* two tall framing trunks */}
    <path d={`M ${-r * 0.72} ${r * 0.7} L ${-r * 0.66} ${-r * 0.75} L ${-r * 0.44} ${-r * 0.75}
              L ${-r * 0.42} ${r * 0.7} Z`}
      fill={SOIL_DARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    <path d={`M ${r * 0.44} ${r * 0.7} L ${r * 0.46} ${-r * 0.75} L ${r * 0.68} ${-r * 0.75}
              L ${r * 0.74} ${r * 0.7} Z`}
      fill={SOIL_DARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    {/* bark lines */}
    <line x1={-r * 0.56} y1={-r * 0.6} x2={-r * 0.55} y2={r * 0.55} stroke={INK} strokeWidth={1} opacity={0.4} />
    <line x1={r * 0.58} y1={-r * 0.6} x2={r * 0.6} y2={r * 0.55} stroke={INK} strokeWidth={1} opacity={0.4} />
    {/* dark canopy hints at the top */}
    <ellipse cx={-r * 0.5} cy={-r * 0.8} rx={r * 0.4} ry={r * 0.18} fill={GREEN_DARK} stroke={INK} strokeWidth={1.3} />
    <ellipse cx={r * 0.52} cy={-r * 0.8} rx={r * 0.4} ry={r * 0.18} fill={GREEN_DARK} stroke={INK} strokeWidth={1.3} />
  </>
);

// ─────────────────────────────────────────────────────────────────────────
// Registry + public API
// ─────────────────────────────────────────────────────────────────────────

const ICONS: Record<string, Draw> = {
  // Math Mountain — High Meadow (L4)
  mm4_valley_thousands,
  mm4_windy_tens,
  mm4_eagle_ledge,
  mm4_factor_firs,
  mm4_mirror_tarns,
  mm4_leftover_rocks,
  mm4_granite_sums,
  mm4_cloud_rounding,
  mm4_slice_share,
  mm4_long_shadows,
  mm4_dewdrop_decimals,
  mm4_double_eagle,
  mm4_frost_compare,
  mm4_terrace_gardens,
  mm4_tall_tales,
  // Math Mountain — The Summit (L5)
  mm5_summit_product,
  mm5_long_stair,
  mm5_meadow_portions,
  mm5_uneven_slices,
  mm5_half_of_half,
  mm5_snowmelt_sums,
  mm5_tenfold_falls,
  mm5_rule_stones,
  mm5_crystal_boxes,
  mm5_storytellers_peak,
  // Reading Forest — Fern Hollow (L4)
  rf4_syllable_stumps,
  rf4_tricky_thicket,
  rf4_prefix_pinecones,
  rf4_suffix_ferns,
  rf4_clue_lanterns,
  rf4_story_hollow,
  // Reading Forest — Old-Growth Grove (L5)
  rf5_tion_trellis,
  rf5_root_cellar,
  rf5_shade_words,
  rf5_riddle_stones,
  rf5_deep_story_grove,
};

/** True if a bespoke icon exists for this structure code. */
export function hasMarkerIcon(code: string): boolean {
  return code in ICONS;
}

/**
 * A bespoke marker icon as an SVG <g> centered on (0,0), fitting a
 * size x size box. Position it with a transform from the caller.
 * Returns null for unknown codes so callers can keep their fallback.
 */
export function MarkerIcon({ code, size = 34 }: { code: string; size?: number }): React.ReactElement | null {
  const draw = ICONS[code];
  if (!draw) return null;
  return <g>{draw(size / 2)}</g>;
}
