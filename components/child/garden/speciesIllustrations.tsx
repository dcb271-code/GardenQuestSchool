'use client';

/**
 * Hand-drawn species illustrations for the field journal, arrival
 * cards, and species detail modals. Style matches the garden
 * illustrations in `illustrations.tsx`:
 *
 *  - Outline color: #5A3B1F (dark bark) at strokeWidth 2 (1.5 for tiny)
 *  - Naturalist palette
 *  - Rounded caps + joins for friendly feel
 *  - Slight asymmetry (organic, not geometric)
 *  - Each illustration is a `<svg>` with a centered viewBox so it
 *    renders at any size from 40px (journal card) to 200px (modal)
 *
 * Each export takes `size` and returns a self-contained <svg>. The
 * `SpeciesIllustration` router dispatches by species code; returns
 * null if no match so the caller can fall back to emoji.
 */

const STROKE = '#5A3B1F';
const STROKE_LIGHT = '#8B6938';

interface SpeciesProps {
  size?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function Svg({ size = 60, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ANT FAMILY
// ─────────────────────────────────────────────────────────────────────────

export function LeafcutterAnt({ size = 60 }: SpeciesProps) {
  // Top-down ant with a leaf segment held above its back.
  const ANT = '#3F2818';
  const ANT_HI = '#6B4423';
  const LEAF = '#8FB67A';
  const LEAF_DARK = '#5C7E4F';
  return (
    <Svg size={size}>
      {/* shadow */}
      <ellipse cx={0} cy={26} rx={24} ry={3} fill="#000" opacity={0.18} />

      {/* legs (6 — three pairs) — drawn FIRST so body sits on top */}
      {[-1, 1].map(side => (
        <g key={side} transform={`scale(${side}, 1)`}>
          <path d="M 8 -8 Q 18 -14 24 -22" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 10 0 Q 22 -2 28 4" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M 8 8 Q 20 14 26 22" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* abdomen (rear, biggest oval) */}
      <ellipse cx={14} cy={0} rx={14} ry={10} fill={ANT} stroke={STROKE} strokeWidth={2} />
      {/* abdomen highlight */}
      <ellipse cx={10} cy={-2} rx={8} ry={4} fill={ANT_HI} opacity={0.6} />

      {/* thorax (middle, smaller) */}
      <ellipse cx={-2} cy={0} rx={7} ry={6} fill={ANT} stroke={STROKE} strokeWidth={2} />

      {/* head (front) */}
      <circle cx={-15} cy={0} r={7} fill={ANT} stroke={STROKE} strokeWidth={2} />
      {/* mandibles */}
      <path d="M -22 -3 Q -25 -5 -23 -7" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M -22 3 Q -25 5 -23 7" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* eyes (tiny dots) */}
      <circle cx={-17} cy={-3} r={1.2} fill="#FFFFFF" opacity={0.85} />
      <circle cx={-17} cy={3} r={1.2} fill="#FFFFFF" opacity={0.85} />
      {/* antennae */}
      <path d="M -19 -5 Q -24 -10 -28 -12" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M -19 5 Q -24 10 -28 12" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* LEAF being carried — held aloft above the body */}
      <g transform="translate(8, -22) rotate(-15)">
        <path
          d="M -16 0 Q -8 -10 6 -8 Q 18 -4 16 6 Q 8 12 -4 10 Q -14 8 -16 0 Z"
          fill={LEAF}
          stroke={LEAF_DARK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M -14 2 Q 0 0 14 4" stroke={LEAF_DARK} strokeWidth={1} fill="none" />
        <path d="M -8 -4 L -6 8 M 0 -7 L 2 9 M 8 -6 L 8 6" stroke={LEAF_DARK} strokeWidth={0.8} opacity={0.7} />
      </g>
    </Svg>
  );
}

export function CarpenterAnt({ size = 60 }: SpeciesProps) {
  // Larger, jet-black ant with a slightly rounder thorax.
  const ANT = '#1F1209';
  const ANT_HI = '#3A2818';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={26} rx={26} ry={3} fill="#000" opacity={0.22} />

      {/* legs */}
      {[-1, 1].map(side => (
        <g key={side} transform={`scale(${side}, 1)`}>
          <path d="M 8 -9 Q 20 -16 28 -24" stroke={STROKE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d="M 10 0 Q 24 -2 30 5" stroke={STROKE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d="M 8 9 Q 22 16 30 24" stroke={STROKE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* abdomen */}
      <ellipse cx={16} cy={0} rx={16} ry={12} fill={ANT} stroke={STROKE} strokeWidth={2} />
      <ellipse cx={12} cy={-3} rx={9} ry={5} fill={ANT_HI} opacity={0.55} />

      {/* thorax */}
      <ellipse cx={-3} cy={0} rx={8} ry={7} fill={ANT} stroke={STROKE} strokeWidth={2} />

      {/* head */}
      <circle cx={-17} cy={0} r={8} fill={ANT} stroke={STROKE} strokeWidth={2} />
      {/* big jaws (carpenter ants have prominent mandibles) */}
      <path d="M -25 -4 Q -29 -6 -27 -10" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M -25 4 Q -29 6 -27 10" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* eyes */}
      <ellipse cx={-19} cy={-3.5} rx={1.4} ry={1.6} fill="#FFFFFF" opacity={0.85} />
      <ellipse cx={-19} cy={3.5} rx={1.4} ry={1.6} fill="#FFFFFF" opacity={0.85} />
      {/* antennae */}
      <path d="M -22 -6 Q -28 -12 -32 -14" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M -22 6 Q -28 12 -32 14" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BUTTERFLY FAMILY
// ─────────────────────────────────────────────────────────────────────────

export function Monarch({ size = 60 }: SpeciesProps) {
  // Iconic orange + black with white spots on the wing borders.
  const ORANGE = '#E8713C';
  const ORANGE_DARK = '#B85420';
  const BLACK = '#2B1810';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={26} rx={20} ry={2.5} fill="#000" opacity={0.18} />

      {/* hind wings (drawn under) */}
      <g>
        <path
          d="M -3 4 Q -16 8 -22 18 Q -24 28 -14 26 Q -4 22 -2 14 Z"
          fill={ORANGE} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        <path
          d="M 3 4 Q 16 8 22 18 Q 24 28 14 26 Q 4 22 2 14 Z"
          fill={ORANGE} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        {/* hind wing veins / dark margin spots */}
        <circle cx={-15} cy={20} r={1.5} fill="#FFFFFF" />
        <circle cx={-9}  cy={24} r={1.4} fill="#FFFFFF" />
        <circle cx={15}  cy={20} r={1.5} fill="#FFFFFF" />
        <circle cx={9}   cy={24} r={1.4} fill="#FFFFFF" />
      </g>

      {/* fore wings (on top) */}
      <g>
        <path
          d="M -3 -4 Q -22 -16 -30 -10 Q -34 0 -22 4 Q -10 6 -3 4 Z"
          fill={ORANGE} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        <path
          d="M 3 -4 Q 22 -16 30 -10 Q 34 0 22 4 Q 10 6 3 4 Z"
          fill={ORANGE} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        {/* dark veining */}
        <path d="M -8 -2 Q -18 -8 -26 -6" stroke={BLACK} strokeWidth={1.2} fill="none" opacity={0.7} />
        <path d="M 8 -2 Q 18 -8 26 -6" stroke={BLACK} strokeWidth={1.2} fill="none" opacity={0.7} />
        {/* dark wingtip + white spots */}
        <path d="M -28 -8 Q -34 -4 -30 0 Q -22 2 -22 -4 Z" fill={BLACK} />
        <path d="M 28 -8 Q 34 -4 30 0 Q 22 2 22 -4 Z" fill={BLACK} />
        <circle cx={-26} cy={-4} r={1.3} fill="#FFFFFF" />
        <circle cx={-30} cy={-2} r={1.2} fill="#FFFFFF" />
        <circle cx={26}  cy={-4} r={1.3} fill="#FFFFFF" />
        <circle cx={30}  cy={-2} r={1.2} fill="#FFFFFF" />
      </g>

      {/* body */}
      <ellipse cx={0} cy={2} rx={2.5} ry={14} fill={BLACK} />
      <ellipse cx={0} cy={-2} rx={2.5} ry={4} fill={ORANGE_DARK} />
      {/* antennae */}
      <path d="M -1 -16 Q -3 -22 -6 -24" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M 1 -16 Q 3 -22 6 -24" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <circle cx={-6} cy={-24} r={1.2} fill={STROKE} />
      <circle cx={6} cy={-24} r={1.2} fill={STROKE} />
      {/* tiny eyes */}
      <circle cx={-1.5} cy={-13} r={0.7} fill="#FFFFFF" opacity={0.85} />
      <circle cx={1.5} cy={-13} r={0.7} fill="#FFFFFF" opacity={0.85} />
    </Svg>
  );
}

export function Swallowtail({ size = 60 }: SpeciesProps) {
  // Yellow + black tiger swallowtail with characteristic tail extensions.
  const YELLOW = '#FFD166';
  const YELLOW_DARK = '#E8A82C';
  const BLACK = '#2B1810';
  const BLUE = '#7DA8D3';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={26} rx={22} ry={2.5} fill="#000" opacity={0.18} />

      {/* hind wings — with the signature TAIL extensions */}
      <g>
        <path
          d="M -3 4 Q -18 8 -24 20 Q -26 28 -16 28 L -12 32 Q -8 28 -8 24 Q -2 20 -2 14 Z"
          fill={YELLOW} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        <path
          d="M 3 4 Q 18 8 24 20 Q 26 28 16 28 L 12 32 Q 8 28 8 24 Q 2 20 2 14 Z"
          fill={YELLOW} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        {/* blue + orange eyespots near the tail */}
        <circle cx={-14} cy={22} r={2.5} fill={BLUE} stroke={BLACK} strokeWidth={1} />
        <circle cx={14}  cy={22} r={2.5} fill={BLUE} stroke={BLACK} strokeWidth={1} />
        <circle cx={-16} cy={26} r={1.8} fill="#E8713C" />
        <circle cx={16}  cy={26} r={1.8} fill="#E8713C" />
      </g>

      {/* fore wings */}
      <g>
        <path
          d="M -3 -4 Q -24 -16 -32 -8 Q -34 2 -22 4 Q -10 6 -3 4 Z"
          fill={YELLOW} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        <path
          d="M 3 -4 Q 24 -16 32 -8 Q 34 2 22 4 Q 10 6 3 4 Z"
          fill={YELLOW} stroke={BLACK} strokeWidth={2.2} strokeLinejoin="round"
        />
        {/* black tiger stripes */}
        <path d="M -9 -2 Q -16 -10 -22 -10" stroke={BLACK} strokeWidth={2.2} fill="none" />
        <path d="M -16 0 Q -22 -4 -28 -4" stroke={BLACK} strokeWidth={2.2} fill="none" />
        <path d="M -22 4  Q -26 2  -30 -2" stroke={BLACK} strokeWidth={2.2} fill="none" />
        <path d="M 9 -2 Q 16 -10 22 -10" stroke={BLACK} strokeWidth={2.2} fill="none" />
        <path d="M 16 0 Q 22 -4 28 -4" stroke={BLACK} strokeWidth={2.2} fill="none" />
        <path d="M 22 4  Q 26 2  30 -2" stroke={BLACK} strokeWidth={2.2} fill="none" />
      </g>

      {/* body */}
      <ellipse cx={0} cy={2} rx={2.5} ry={14} fill={BLACK} />
      {/* antennae */}
      <path d="M -1 -16 Q -3 -22 -6 -24" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M 1 -16 Q 3 -22 6 -24" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <circle cx={-6} cy={-24} r={1.2} fill={STROKE} />
      <circle cx={6} cy={-24} r={1.2} fill={STROKE} />
      {/* eyes */}
      <circle cx={-1.5} cy={-13} r={0.7} fill={YELLOW_DARK} />
      <circle cx={1.5} cy={-13} r={0.7} fill={YELLOW_DARK} />
    </Svg>
  );
}

export function Skipper({ size = 60 }: SpeciesProps) {
  // Small chubby brown butterfly with hooked antennae.
  const BROWN = '#9B6738';
  const BROWN_DARK = '#5A3B1F';
  const ORANGE = '#E8A87C';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={22} rx={16} ry={2} fill="#000" opacity={0.2} />

      {/* hind wings (stubbier) */}
      <path
        d="M -2 4 Q -10 8 -14 16 Q -16 22 -8 22 Q -2 18 -2 12 Z"
        fill={BROWN} stroke={BROWN_DARK} strokeWidth={2} strokeLinejoin="round"
      />
      <path
        d="M 2 4 Q 10 8 14 16 Q 16 22 8 22 Q 2 18 2 12 Z"
        fill={BROWN} stroke={BROWN_DARK} strokeWidth={2} strokeLinejoin="round"
      />

      {/* fore wings (angular, with orange spots) */}
      <path
        d="M -2 -4 Q -16 -14 -22 -8 Q -24 0 -16 2 Q -8 4 -2 4 Z"
        fill={BROWN} stroke={BROWN_DARK} strokeWidth={2} strokeLinejoin="round"
      />
      <path
        d="M 2 -4 Q 16 -14 22 -8 Q 24 0 16 2 Q 8 4 2 4 Z"
        fill={BROWN} stroke={BROWN_DARK} strokeWidth={2} strokeLinejoin="round"
      />
      {/* orange spots on fore wings */}
      <circle cx={-12} cy={-4} r={2} fill={ORANGE} stroke={BROWN_DARK} strokeWidth={0.8} />
      <circle cx={12}  cy={-4} r={2} fill={ORANGE} stroke={BROWN_DARK} strokeWidth={0.8} />

      {/* fuzzy chunky body */}
      <ellipse cx={0} cy={2} rx={3.5} ry={11} fill={BROWN_DARK} />
      <ellipse cx={0} cy={4} rx={2.5} ry={6} fill={BROWN} opacity={0.8} />

      {/* HOOKED antennae (skipper signature) */}
      <path d="M -1 -12 Q -4 -18 -7 -19 Q -10 -19 -8 -16" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M 1 -12 Q 4 -18 7 -19 Q 10 -19 8 -16" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />

      {/* eyes */}
      <circle cx={-1.5} cy={-9} r={0.7} fill="#FFFFFF" opacity={0.85} />
      <circle cx={1.5} cy={-9} r={0.7} fill="#FFFFFF" opacity={0.85} />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BEE FAMILY
// ─────────────────────────────────────────────────────────────────────────

function BeeWings() {
  return (
    <g>
      {/* upper wings — translucent with veining */}
      <ellipse cx={-6} cy={-12} rx={10} ry={6} fill="#FFFFFF" opacity={0.7} stroke={STROKE_LIGHT} strokeWidth={1.2} transform="rotate(-20 -6 -12)" />
      <ellipse cx={6} cy={-12} rx={10} ry={6} fill="#FFFFFF" opacity={0.7} stroke={STROKE_LIGHT} strokeWidth={1.2} transform="rotate(20 6 -12)" />
      {/* lower wings (slightly behind) */}
      <ellipse cx={-7} cy={-6} rx={7} ry={4} fill="#FFFFFF" opacity={0.55} stroke={STROKE_LIGHT} strokeWidth={1} transform="rotate(-15 -7 -6)" />
      <ellipse cx={7} cy={-6} rx={7} ry={4} fill="#FFFFFF" opacity={0.55} stroke={STROKE_LIGHT} strokeWidth={1} transform="rotate(15 7 -6)" />
      {/* vein hint */}
      <path d="M -8 -14 Q -10 -10 -10 -6" stroke={STROKE_LIGHT} strokeWidth={0.6} fill="none" opacity={0.6} />
      <path d="M 8 -14 Q 10 -10 10 -6" stroke={STROKE_LIGHT} strokeWidth={0.6} fill="none" opacity={0.6} />
    </g>
  );
}

export function HoneyBee({ size = 60 }: SpeciesProps) {
  // Classic gold + black stripes, fuzzy body, simple but readable.
  const GOLD = '#FFD166';
  const GOLD_DARK = '#E8A82C';
  const BLACK = '#2B1810';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={22} rx={18} ry={2.5} fill="#000" opacity={0.2} />
      <BeeWings />

      {/* body — fuzzy outline (slightly bumpy edge implied via stroke weight) */}
      <ellipse cx={0} cy={4} rx={12} ry={10} fill={GOLD} stroke={STROKE} strokeWidth={2.2} />
      {/* fuzz texture along the top */}
      <path d="M -10 -2 Q -6 -5 -2 -3 Q 2 -5 6 -3 Q 10 -5 10 -2" stroke={GOLD_DARK} strokeWidth={1} fill="none" opacity={0.7} />

      {/* black stripes */}
      <path d="M -10 1 Q 0 3 10 1 L 10 4 Q 0 6 -10 4 Z" fill={BLACK} />
      <path d="M -8 8 Q 0 10 8 8 L 8 11 Q 0 13 -8 11 Z" fill={BLACK} />

      {/* head */}
      <circle cx={0} cy={-9} r={6} fill={BLACK} stroke={STROKE} strokeWidth={1.8} />
      {/* big compound eyes */}
      <ellipse cx={-3} cy={-10} rx={1.6} ry={2.2} fill={GOLD} />
      <ellipse cx={3} cy={-10} rx={1.6} ry={2.2} fill={GOLD} />
      {/* eye shine */}
      <circle cx={-3} cy={-11} r={0.5} fill="#FFFFFF" />
      <circle cx={3.2} cy={-11} r={0.5} fill="#FFFFFF" />
      {/* antennae */}
      <path d="M -2 -14 Q -5 -19 -7 -20" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M 2 -14 Q 5 -19 7 -20" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <circle cx={-7} cy={-20} r={1} fill={STROKE} />
      <circle cx={7} cy={-20} r={1} fill={STROKE} />

      {/* tiny smile suggestion */}
      <path d="M -2 -7 Q 0 -6 2 -7" stroke={GOLD} strokeWidth={1} fill="none" strokeLinecap="round" />

      {/* legs — small dangling */}
      <path d="M -6 12 L -8 16" stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M 0 13 L 0 17" stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M 6 12 L 8 16" stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function MasonBee({ size = 60 }: SpeciesProps) {
  // Smaller, metallic-blue body (mason bees have an iridescent dark blue/green sheen).
  const BLUE = '#3F5E78';
  const BLUE_HI = '#7DA8D3';
  const BLACK = '#1A1F28';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={20} rx={14} ry={2} fill="#000" opacity={0.2} />
      <BeeWings />

      {/* body — smaller, more compact than honey bee */}
      <ellipse cx={0} cy={4} rx={10} ry={8} fill={BLUE} stroke={STROKE} strokeWidth={2} />
      {/* iridescent highlight stripe */}
      <ellipse cx={-2} cy={1} rx={6} ry={3} fill={BLUE_HI} opacity={0.5} />
      {/* segment lines */}
      <path d="M -8 4 Q 0 6 8 4" stroke={BLACK} strokeWidth={1} fill="none" opacity={0.7} />
      <path d="M -7 8 Q 0 10 7 8" stroke={BLACK} strokeWidth={1} fill="none" opacity={0.6} />

      {/* head */}
      <circle cx={0} cy={-8} r={5.5} fill={BLACK} stroke={STROKE} strokeWidth={1.8} />
      {/* compound eyes (larger, mason bees have prominent eyes) */}
      <ellipse cx={-2.5} cy={-9} rx={1.8} ry={2.5} fill={BLUE_HI} />
      <ellipse cx={2.5} cy={-9} rx={1.8} ry={2.5} fill={BLUE_HI} />
      <circle cx={-2.5} cy={-10} r={0.5} fill="#FFFFFF" />
      <circle cx={2.7} cy={-10} r={0.5} fill="#FFFFFF" />
      {/* antennae */}
      <path d="M -2 -13 Q -4 -17 -6 -18" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M 2 -13 Q 4 -17 6 -18" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <circle cx={-6} cy={-18} r={0.9} fill={STROKE} />
      <circle cx={6} cy={-18} r={0.9} fill={STROKE} />

      {/* legs */}
      <path d="M -5 11 L -7 14" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M 0 12 L 0 15" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M 5 11 L 7 14" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function BumbleBee({ size = 60 }: SpeciesProps) {
  // Chubbier than honey bee, more obvious fuzz, alternating gold + black bands.
  const GOLD = '#FFD166';
  const FUZZ = '#FFE89A';
  const BLACK = '#1F1209';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={24} rx={20} ry={3} fill="#000" opacity={0.22} />
      <BeeWings />

      {/* body — fatter, rounder than honey bee */}
      <ellipse cx={0} cy={5} rx={14} ry={12} fill={GOLD} stroke={STROKE} strokeWidth={2.4} />
      {/* fuzzy halo (tiny "hairs" along the silhouette) */}
      <g stroke={FUZZ} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.85}>
        <path d="M -14 0 L -16 -1" />
        <path d="M -14 5 L -16 5" />
        <path d="M -14 10 L -16 11" />
        <path d="M 14 0 L 16 -1" />
        <path d="M 14 5 L 16 5" />
        <path d="M 14 10 L 16 11" />
        <path d="M -8 -7 L -9 -10" />
        <path d="M 0 -8 L 0 -11" />
        <path d="M 8 -7 L 9 -10" />
      </g>

      {/* black bands (bumble bees have wider, more contrasty bands) */}
      <path d="M -13 -2 Q 0 0 13 -2 L 13 4 Q 0 6 -13 4 Z" fill={BLACK} />
      <path d="M -10 9 Q 0 11 10 9 L 10 14 Q 0 16 -10 14 Z" fill={BLACK} />

      {/* head */}
      <circle cx={0} cy={-10} r={6.5} fill={BLACK} stroke={STROKE} strokeWidth={1.8} />
      {/* eyes */}
      <ellipse cx={-3} cy={-11} rx={1.7} ry={2.3} fill={GOLD} />
      <ellipse cx={3} cy={-11} rx={1.7} ry={2.3} fill={GOLD} />
      <circle cx={-3} cy={-12} r={0.5} fill="#FFFFFF" />
      <circle cx={3.2} cy={-12} r={0.5} fill="#FFFFFF" />
      {/* antennae */}
      <path d="M -2 -16 Q -5 -21 -7 -22" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M 2 -16 Q 5 -21 7 -22" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <circle cx={-7} cy={-22} r={1.1} fill={STROKE} />
      <circle cx={7} cy={-22} r={1.1} fill={STROKE} />

      {/* legs */}
      <path d="M -7 14 L -10 18" stroke={STROKE} strokeWidth={1.7} strokeLinecap="round" />
      <path d="M 0 16 L 0 20" stroke={STROKE} strokeWidth={1.7} strokeLinecap="round" />
      <path d="M 7 14 L 10 18" stroke={STROKE} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// LOG-PILE CRITTERS
// ─────────────────────────────────────────────────────────────────────────

export function Ladybug({ size = 60 }: SpeciesProps) {
  // Classic red dome with black spots, head, and 6 little legs.
  const RED = '#D4453A';
  const RED_DARK = '#9B2D26';
  const BLACK = '#1A0F08';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={20} rx={20} ry={3} fill="#000" opacity={0.22} />

      {/* legs (6) */}
      {[-1, 1].map(side => (
        <g key={side} transform={`scale(${side}, 1)`}>
          <path d="M 10 -8 L 18 -14" stroke={STROKE} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M 12 0 L 20 2" stroke={STROKE} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M 10 8 L 18 14" stroke={STROKE} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ))}

      {/* head — small black bump at the front */}
      <ellipse cx={-15} cy={0} rx={6} ry={5} fill={BLACK} stroke={STROKE} strokeWidth={1.8} />
      {/* tiny eye dots */}
      <circle cx={-17} cy={-2} r={1.2} fill="#FFFFFF" />
      <circle cx={-17} cy={2} r={1.2} fill="#FFFFFF" />
      {/* short antennae */}
      <path d="M -19 -3 L -23 -6" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M -19 3 L -23 6" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />

      {/* dome body — red elytra (wing covers) */}
      <ellipse cx={3} cy={0} rx={18} ry={14} fill={RED} stroke={STROKE} strokeWidth={2.2} />
      {/* center seam */}
      <line x1={3} y1={-13} x2={3} y2={13} stroke={BLACK} strokeWidth={1.2} />

      {/* SPOTS — 7 spots (classic seven-spotted ladybug) */}
      <circle cx={-4} cy={-6} r={2.4} fill={BLACK} />
      <circle cx={-4} cy={6} r={2.4} fill={BLACK} />
      <circle cx={3} cy={-9} r={2} fill={BLACK} />
      <circle cx={3} cy={9} r={2} fill={BLACK} />
      <circle cx={10} cy={-5} r={2.4} fill={BLACK} />
      <circle cx={10} cy={5} r={2.4} fill={BLACK} />
      <circle cx={3} cy={0} r={2} fill={BLACK} />

      {/* highlight sheen */}
      <ellipse cx={-2} cy={-7} rx={5} ry={2} fill="#FFFFFF" opacity={0.3} />
    </Svg>
  );
}

export function Centipede({ size = 60 }: SpeciesProps) {
  // Long segmented body with many legs, head with antennae.
  const BODY = '#9B5538';
  const BODY_DARK = '#5A3B1F';
  const SEGMENTS = 8;
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={20} rx={28} ry={2.5} fill="#000" opacity={0.2} />

      {/* legs — many tiny pairs along the body */}
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const x = -28 + i * 8;
        return (
          <g key={i}>
            <path d={`M ${x} -3 L ${x - 1} -10`} stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />
            <path d={`M ${x} 3 L ${x - 1} 10`} stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" />
          </g>
        );
      })}

      {/* segmented body — series of overlapping ovals */}
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const x = -28 + i * 8;
        const tone = i % 2 === 0 ? BODY : BODY_DARK;
        return (
          <ellipse key={i} cx={x} cy={0} rx={5.5} ry={4.5} fill={tone} stroke={STROKE} strokeWidth={1.5} />
        );
      })}

      {/* head — at the right (leading) end */}
      <ellipse cx={32} cy={0} rx={6} ry={5} fill={BODY_DARK} stroke={STROKE} strokeWidth={2} />
      {/* eyes */}
      <circle cx={34} cy={-2} r={1.2} fill="#FFFFFF" />
      <circle cx={34} cy={2} r={1.2} fill="#FFFFFF" />
      {/* antennae */}
      <path d="M 36 -3 Q 40 -5 42 -8" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M 36 3 Q 40 5 42 8" stroke={STROKE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function Firefly({ size = 60 }: SpeciesProps) {
  // Dark beetle silhouette with a softly glowing yellow abdomen tip
  // surrounded by a halo.
  const BODY = '#3A2818';
  const BODY_DARK = '#1F1209';
  const GLOW = '#FFEF99';
  const GLOW_OUTER = '#FFD166';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={20} rx={16} ry={2.5} fill="#000" opacity={0.22} />

      {/* GLOW halo around the abdomen tip — drawn FIRST so it's behind */}
      <circle cx={14} cy={4} r={18} fill={GLOW_OUTER} opacity={0.35} />
      <circle cx={14} cy={4} r={11} fill={GLOW} opacity={0.55} />

      {/* wings (translucent, slightly raised) */}
      <ellipse cx={-3} cy={-6} rx={9} ry={5} fill="#FFFFFF" opacity={0.5} stroke={STROKE_LIGHT} strokeWidth={1} transform="rotate(-15 -3 -6)" />
      <ellipse cx={3} cy={-6} rx={9} ry={5} fill="#FFFFFF" opacity={0.5} stroke={STROKE_LIGHT} strokeWidth={1} transform="rotate(15 3 -6)" />

      {/* body */}
      <ellipse cx={0} cy={2} rx={11} ry={7} fill={BODY} stroke={STROKE} strokeWidth={2} />
      {/* segment lines */}
      <path d="M -6 0 Q 0 1 6 0" stroke={BODY_DARK} strokeWidth={1} fill="none" />
      <path d="M -8 4 Q 0 5 8 4" stroke={BODY_DARK} strokeWidth={1} fill="none" />

      {/* glowing abdomen tip — bright yellow with inner highlight */}
      <ellipse cx={11} cy={4} rx={6} ry={4} fill={GLOW} stroke={GLOW_OUTER} strokeWidth={1.5} />
      <ellipse cx={10} cy={3} rx={3} ry={2} fill="#FFFFFF" opacity={0.7} />

      {/* head */}
      <ellipse cx={-12} cy={0} rx={5} ry={4.5} fill={BODY} stroke={STROKE} strokeWidth={1.8} />
      {/* eyes */}
      <circle cx={-14} cy={-2} r={1.2} fill="#FFFFFF" />
      <circle cx={-14} cy={2} r={1.2} fill="#FFFFFF" />
      {/* antennae (long, feathery) */}
      <path d="M -16 -3 Q -20 -7 -22 -10" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M -16 3 Q -20 7 -22 10" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />

      {/* tiny legs */}
      <path d="M -6 7 L -8 11" stroke={STROKE} strokeWidth={1.3} strokeLinecap="round" />
      <path d="M 0 8 L 0 12" stroke={STROKE} strokeWidth={1.3} strokeLinecap="round" />
      <path d="M 6 7 L 8 11" stroke={STROKE} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FROG FAMILY
// ─────────────────────────────────────────────────────────────────────────

export function TreeFrog({ size = 60 }: SpeciesProps) {
  // Bright green tree frog with sticky toe pads and big bulging eyes.
  const GREEN = '#7BA46F';
  const GREEN_DARK = '#5C7E4F';
  const GREEN_HI = '#A8C99A';
  const PINK = '#E8B0B0';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={22} rx={20} ry={2.5} fill="#000" opacity={0.22} />

      {/* hind legs (visible behind, big and folded) */}
      <ellipse cx={-15} cy={6} rx={8} ry={5} fill={GREEN_DARK} stroke={STROKE} strokeWidth={1.8}
               transform="rotate(20 -15 6)" />
      <ellipse cx={15} cy={6} rx={8} ry={5} fill={GREEN_DARK} stroke={STROKE} strokeWidth={1.8}
               transform="rotate(-20 15 6)" />

      {/* body */}
      <ellipse cx={0} cy={4} rx={14} ry={11} fill={GREEN} stroke={STROKE} strokeWidth={2.2} />
      {/* belly highlight (lighter green) */}
      <ellipse cx={0} cy={8} rx={9} ry={5} fill={GREEN_HI} opacity={0.85} />

      {/* front legs with sticky toe pads */}
      <path d="M -10 6 Q -14 12 -12 14" stroke={STROKE} strokeWidth={2} fill={GREEN} strokeLinecap="round" />
      <path d="M 10 6 Q 14 12 12 14" stroke={STROKE} strokeWidth={2} fill={GREEN} strokeLinecap="round" />
      {/* toe pads (round disks) */}
      <circle cx={-12} cy={14} r={1.5} fill={GREEN_HI} stroke={STROKE} strokeWidth={1} />
      <circle cx={-14} cy={13} r={1.3} fill={GREEN_HI} stroke={STROKE} strokeWidth={1} />
      <circle cx={-10} cy={15} r={1.3} fill={GREEN_HI} stroke={STROKE} strokeWidth={1} />
      <circle cx={12} cy={14} r={1.5} fill={GREEN_HI} stroke={STROKE} strokeWidth={1} />
      <circle cx={14} cy={13} r={1.3} fill={GREEN_HI} stroke={STROKE} strokeWidth={1} />
      <circle cx={10} cy={15} r={1.3} fill={GREEN_HI} stroke={STROKE} strokeWidth={1} />

      {/* BIG bulging eyes on top of the head */}
      <circle cx={-7} cy={-9} r={5.5} fill={GREEN} stroke={STROKE} strokeWidth={1.8} />
      <circle cx={7} cy={-9} r={5.5} fill={GREEN} stroke={STROKE} strokeWidth={1.8} />
      {/* eyeball with golden iris */}
      <circle cx={-7} cy={-9} r={3.5} fill="#F4C430" />
      <circle cx={7} cy={-9} r={3.5} fill="#F4C430" />
      {/* vertical pupil */}
      <ellipse cx={-7} cy={-9} rx={1} ry={3} fill="#1A1A1A" />
      <ellipse cx={7} cy={-9} rx={1} ry={3} fill="#1A1A1A" />
      {/* shine */}
      <circle cx={-6} cy={-11} r={0.8} fill="#FFFFFF" />
      <circle cx={8} cy={-11} r={0.8} fill="#FFFFFF" />

      {/* nostrils */}
      <circle cx={-1.5} cy={-3} r={0.6} fill={STROKE} />
      <circle cx={1.5} cy={-3} r={0.6} fill={STROKE} />
      {/* wide smile */}
      <path d="M -5 0 Q 0 3 5 0" stroke={STROKE} strokeWidth={1.4} fill="none" strokeLinecap="round" />

      {/* cheek blush */}
      <ellipse cx={-9} cy={-2} rx={2} ry={1} fill={PINK} opacity={0.6} />
      <ellipse cx={9} cy={-2} rx={2} ry={1} fill={PINK} opacity={0.6} />
    </Svg>
  );
}

export function SpringPeeper({ size = 60 }: SpeciesProps) {
  // Tiny tan/brown frog with the signature X mark on its back.
  const TAN = '#C8956A';
  const TAN_DARK = '#8B5A2B';
  const TAN_HI = '#E8C493';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={20} rx={16} ry={2} fill="#000" opacity={0.22} />

      {/* hind legs */}
      <ellipse cx={-12} cy={6} rx={6} ry={4} fill={TAN_DARK} stroke={STROKE} strokeWidth={1.6}
               transform="rotate(20 -12 6)" />
      <ellipse cx={12} cy={6} rx={6} ry={4} fill={TAN_DARK} stroke={STROKE} strokeWidth={1.6}
               transform="rotate(-20 12 6)" />

      {/* body — smaller than tree frog */}
      <ellipse cx={0} cy={3} rx={11} ry={9} fill={TAN} stroke={STROKE} strokeWidth={2} />
      {/* belly highlight */}
      <ellipse cx={0} cy={7} rx={7} ry={4} fill={TAN_HI} opacity={0.75} />

      {/* THE X MARK on the back (signature) */}
      <path d="M -5 -2 L 5 6 M 5 -2 L -5 6" stroke={TAN_DARK} strokeWidth={1.6} fill="none" strokeLinecap="round" />

      {/* front legs */}
      <path d="M -8 5 Q -11 10 -10 12" stroke={STROKE} strokeWidth={1.6} fill={TAN} strokeLinecap="round" />
      <path d="M 8 5 Q 11 10 10 12" stroke={STROKE} strokeWidth={1.6} fill={TAN} strokeLinecap="round" />
      {/* small toe pads (smaller than tree frog's) */}
      <circle cx={-10} cy={12} r={1.1} fill={TAN_HI} stroke={STROKE} strokeWidth={0.9} />
      <circle cx={10} cy={12} r={1.1} fill={TAN_HI} stroke={STROKE} strokeWidth={0.9} />

      {/* eyes — smaller proportionally */}
      <circle cx={-5} cy={-7} r={3.5} fill={TAN} stroke={STROKE} strokeWidth={1.5} />
      <circle cx={5} cy={-7} r={3.5} fill={TAN} stroke={STROKE} strokeWidth={1.5} />
      <circle cx={-5} cy={-7} r={2.2} fill="#1F1209" />
      <circle cx={5} cy={-7} r={2.2} fill="#1F1209" />
      <circle cx={-4.5} cy={-8} r={0.6} fill="#FFFFFF" />
      <circle cx={5.5} cy={-8} r={0.6} fill="#FFFFFF" />

      {/* nostrils */}
      <circle cx={-1.2} cy={-1} r={0.5} fill={STROKE} />
      <circle cx={1.2} cy={-1} r={0.5} fill={STROKE} />
      {/* mouth (small, the peeper "peep") */}
      <path d="M -3 2 Q 0 4 3 2" stroke={STROKE} strokeWidth={1.2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAMMALS
// ─────────────────────────────────────────────────────────────────────────

export function CottontailRabbit({ size = 60 }: SpeciesProps) {
  // Brown rabbit sitting in profile, ears up, signature white cotton tail.
  const FUR = '#9B7352';
  const FUR_HI = '#C8956A';
  const FUR_DARK = '#5A3B1F';
  const TAIL = '#FFFDF2';
  const PINK = '#F8B4B4';
  return (
    <Svg size={size}>
      <ellipse cx={0} cy={22} rx={22} ry={3} fill="#000" opacity={0.22} />

      {/* COTTON TAIL — drawn first so body covers its inner edge */}
      <circle cx={20} cy={5} r={6} fill={TAIL} stroke={STROKE} strokeWidth={1.5} />
      <circle cx={18} cy={3} r={2} fill="#FFFFFF" opacity={0.7} />

      {/* hind leg (folded under) */}
      <ellipse cx={10} cy={12} rx={11} ry={7} fill={FUR_DARK} stroke={STROKE} strokeWidth={1.8} />
      <ellipse cx={9} cy={11} rx={8} ry={5} fill={FUR} />

      {/* body — sitting upright slightly */}
      <ellipse cx={-1} cy={3} rx={13} ry={11} fill={FUR} stroke={STROKE} strokeWidth={2.2} />
      {/* fur highlight */}
      <ellipse cx={-3} cy={0} rx={7} ry={5} fill={FUR_HI} opacity={0.7} />

      {/* front leg/paw */}
      <ellipse cx={-7} cy={12} rx={3} ry={5} fill={FUR} stroke={STROKE} strokeWidth={1.5} />
      {/* paw beans */}
      <circle cx={-7} cy={15} r={0.8} fill={PINK} />

      {/* head */}
      <circle cx={-10} cy={-4} r={8} fill={FUR} stroke={STROKE} strokeWidth={2} />
      <ellipse cx={-12} cy={-3} rx={4} ry={3} fill={FUR_HI} opacity={0.7} />

      {/* EARS — long upright */}
      <ellipse cx={-13} cy={-13} rx={2.5} ry={8} fill={FUR} stroke={STROKE} strokeWidth={1.6}
               transform="rotate(-12 -13 -13)" />
      <ellipse cx={-7} cy={-13} rx={2.5} ry={8} fill={FUR} stroke={STROKE} strokeWidth={1.6}
               transform="rotate(8 -7 -13)" />
      {/* inner ear (pink) */}
      <ellipse cx={-13} cy={-12} rx={1} ry={5.5} fill={PINK}
               transform="rotate(-12 -13 -12)" />
      <ellipse cx={-7} cy={-12} rx={1} ry={5.5} fill={PINK}
               transform="rotate(8 -7 -12)" />

      {/* eye (single visible in profile) */}
      <circle cx={-12} cy={-5} r={1.6} fill="#1F1209" />
      <circle cx={-11.5} cy={-5.5} r={0.5} fill="#FFFFFF" />

      {/* nose + mouth */}
      <path d="M -17 -3 L -18 -3 L -17.5 -2 Z" fill={PINK} stroke={STROKE} strokeWidth={0.8} />
      <path d="M -17.5 -2 L -17.5 -1" stroke={STROKE} strokeWidth={0.8} />
      <path d="M -17.5 -1 Q -19 -0.5 -19.5 -1.5" stroke={STROKE} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <path d="M -17.5 -1 Q -16 -0.5 -15.5 -1.5" stroke={STROKE} strokeWidth={0.8} fill="none" strokeLinecap="round" />

      {/* whiskers */}
      <path d="M -16 -2 L -22 -3" stroke={STROKE} strokeWidth={0.6} strokeLinecap="round" opacity={0.7} />
      <path d="M -16 -1 L -22 -1" stroke={STROKE} strokeWidth={0.6} strokeLinecap="round" opacity={0.7} />
      <path d="M -16 0 L -22 1" stroke={STROKE} strokeWidth={0.6} strokeLinecap="round" opacity={0.7} />

      {/* cheek blush */}
      <ellipse cx={-14} cy={-2} rx={1.5} ry={0.8} fill={PINK} opacity={0.5} />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────

export function SpeciesIllustration({
  code, size,
}: { code: string; size?: number }): React.ReactElement | null {
  switch (code) {
    case 'leafcutter_ant':  return <LeafcutterAnt size={size} />;
    case 'carpenter_ant':   return <CarpenterAnt size={size} />;
    case 'monarch':         return <Monarch size={size} />;
    case 'swallowtail':     return <Swallowtail size={size} />;
    case 'skipper':         return <Skipper size={size} />;
    case 'honey_bee':       return <HoneyBee size={size} />;
    case 'mason_bee':       return <MasonBee size={size} />;
    case 'bumble_bee':      return <BumbleBee size={size} />;
    case 'ladybug':         return <Ladybug size={size} />;
    case 'centipede':       return <Centipede size={size} />;
    case 'firefly':         return <Firefly size={size} />;
    case 'tree_frog':       return <TreeFrog size={size} />;
    case 'spring_peeper':   return <SpringPeeper size={size} />;
    case 'cottontail_rabbit': return <CottontailRabbit size={size} />;
    default:                return null;
  }
}
