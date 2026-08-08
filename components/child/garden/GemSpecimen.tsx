// components/child/garden/GemSpecimen.tsx
//
// A gem drawn as the SHAPE IT ACTUALLY GROWS IN.
//
// The gem catalog carries a `crystalShape` field on every entry — cube,
// hexagonal prism, rhombohedron, octahedron, rhombic dodecahedron — and
// until now nothing rendered it. The case showed a count and the cards
// showed emoji, so the one property that makes minerals visually
// distinct was a sentence a seven-year-old had to take on faith.
//
// So these are not decorations, they are diagrams. Fluorite really is a
// cube. Calcite really is a cube pushed over — every face a rhombus,
// which is why the same word is right here and was wrong on Cliffside
// Point. A garnet really does close itself into twelve rhombic faces,
// and the view below is the honest one: look down its three-fold axis
// and you see a hexagon with three rhombi inside it, which is exactly
// half of twelve. A diamond is two square pyramids base to base.
//
// The payoff is that the display case becomes a geometry lesson she
// walks past every time she digs. She is Level 3 and doing shapes.
//
// Drawn in a 100×100 box, centred on (50,50), so any slot can size
// them by width alone.

import type { GemData } from '@/lib/world/gemCatalog';

/** Lit face, mid face, shadowed face, and the outline. */
interface Palette { lit: string; mid: string; dark: string; line: string }

const PALETTES: Record<string, Palette> = {
  fluorite:         { lit: '#C9A9E8', mid: '#9B6FD4', dark: '#6B45A0', line: '#4A2D73' },
  galena:           { lit: '#D6DAE0', mid: '#9AA3AE', dark: '#5F6873', line: '#3D444D' },
  quartz:           { lit: '#F2F6FA', mid: '#D2DEEA', dark: '#A8B9CC', line: '#7A8CA3' },
  calcite:          { lit: '#FBEFD4', mid: '#EBD3A0', dark: '#C9A96B', line: '#94793F' },
  ruby:             { lit: '#F2607A', mid: '#C81E43', dark: '#8A0C26', line: '#5E0619' },
  sapphire:         { lit: '#6FA8E8', mid: '#2A63C0', dark: '#153F88', line: '#0D2A5C' },
  emerald:          { lit: '#69D9A0', mid: '#1FA368', dark: '#0E6B42', line: '#07472B' },
  garnet:           { lit: '#C4506A', mid: '#8E1F3C', dark: '#5C0F24', line: '#3D0817' },
  diamond:          { lit: '#FFFFFF', mid: '#DCE9F5', dark: '#B0C6DC', line: '#8098B0' },
  kentucky_agate:   { lit: '#E8D9C4', mid: '#B4472F', dark: '#4A3226', line: '#33221A' },
  geode:            { lit: '#C9BFAE', mid: '#9B8F7C', dark: '#6E6455', line: '#4A4238' },
  coal:             { lit: '#4A4A50', mid: '#2A2A2F', dark: '#151518', line: '#000000' },
  freshwater_pearl: { lit: '#FFFFFF', mid: '#F1E3E6', dark: '#D8C2CC', line: '#B49AA6' },
};

const FALLBACK: Palette = { lit: '#D9D2C4', mid: '#A99C86', dark: '#7A6E5C', line: '#544A3C' };

/* ─── the habits ──────────────────────────────────────────────────── */

/** Cube — fluorite and galena, which grow their own corners. */
function Cube(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.6} strokeLinejoin="round">
      <path d="M50 18 L78 32 L50 46 L22 32 Z" fill={p.lit} />
      <path d="M22 32 L50 46 L50 80 L22 66 Z" fill={p.mid} />
      <path d="M78 32 L50 46 L50 80 L78 66 Z" fill={p.dark} />
    </g>
  );
}

/**
 * Rhombohedron — calcite. A cube leaned over, so every one of the six
 * faces is a rhombus. This is the shape a calcite crystal cleaves into
 * no matter how you break it.
 */
function Rhombohedron(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.6} strokeLinejoin="round">
      <path d="M44 12 L76 26 L58 42 L26 28 Z" fill={p.lit} />
      <path d="M26 28 L58 42 L58 82 L26 70 Z" fill={p.mid} />
      <path d="M76 26 L58 42 L58 82 L76 64 Z" fill={p.dark} />
    </g>
  );
}

/**
 * Hexagonal prism. `pointed` gives it the pyramid termination a quartz
 * crystal grows; flat-topped is the barrel a ruby or emerald makes.
 * Six sides, always — three of them facing you.
 */
function HexPrism(p: Palette, pointed: boolean) {
  return (
    <g stroke={p.line} strokeWidth={1.6} strokeLinejoin="round">
      {/* the three visible vertical faces */}
      <path d="M28 36 L41 42 L41 84 L28 78 Z" fill={p.mid} />
      <path d="M41 42 L59 42 L59 84 L41 84 Z" fill={p.lit} />
      <path d="M59 42 L72 36 L72 78 L59 84 Z" fill={p.dark} />
      {pointed ? (
        <>
          <path d="M28 36 L41 42 L50 8 Z" fill={p.mid} />
          <path d="M41 42 L59 42 L50 8 Z" fill={p.lit} />
          <path d="M59 42 L72 36 L50 8 Z" fill={p.dark} />
        </>
      ) : (
        <>
          <path d="M28 36 L41 28 L59 28 L72 36 L59 42 L41 42 Z" fill={p.lit} />
          <path d="M28 36 L41 28 L41 42 Z" fill={p.mid} opacity={0.55} />
          <path d="M72 36 L59 28 L59 42 Z" fill={p.dark} opacity={0.45} />
        </>
      )}
    </g>
  );
}

/** Octahedron — diamond. Two square pyramids joined base to base. */
function Octahedron(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.6} strokeLinejoin="round">
      <path d="M50 10 L22 44 L50 56 Z" fill={p.lit} />
      <path d="M50 10 L78 44 L50 56 Z" fill={p.mid} />
      <path d="M50 90 L22 44 L50 56 Z" fill={p.mid} />
      <path d="M50 90 L78 44 L50 56 Z" fill={p.dark} />
    </g>
  );
}

/**
 * Rhombic dodecahedron — garnet, twelve rhombic faces.
 *
 * Looked at down the three-fold axis the outline is a hexagon and
 * exactly three rhombi face you: the near half of twelve. Every edge
 * below is the same length, which is what makes them rhombi and not
 * just quadrilaterals.
 */
function RhombicDodecahedron(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.6} strokeLinejoin="round">
      <path d="M50 50 L50 16 L79 33 L79 67 Z" fill={p.lit} />
      <path d="M50 50 L79 67 L50 84 L21 67 Z" fill={p.dark} />
      <path d="M50 50 L21 67 L21 33 L50 16 Z" fill={p.mid} />
    </g>
  );
}

/**
 * Banded agate, cut and polished. No crystal shape at all — it grew a
 * layer at a time into a hollow, so the lesson is the bands.
 */
function BandedNodule(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.5}>
      <ellipse cx={50} cy={50} rx={34} ry={28} fill={p.dark} />
      <ellipse cx={50} cy={50} rx={28} ry={22.5} fill={p.mid} stroke="none" />
      <ellipse cx={50} cy={50} rx={22} ry={17.5} fill="#E9E2D6" stroke="none" />
      <ellipse cx={50} cy={50} rx={16} ry={12.5} fill="#8E3524" stroke="none" />
      <ellipse cx={50} cy={50} rx={10} ry={7.5} fill="#2E2420" stroke="none" />
      <ellipse cx={50} cy={50} rx={4.5} ry={3.2} fill={p.lit} stroke="none" />
      <ellipse cx={50} cy={50} rx={34} ry={28} fill="none" stroke={p.line} />
    </g>
  );
}

/**
 * Geode — a dull ball outside, crystals growing INWARDS.
 *
 * The spikes are written out rather than generated, so this shape can
 * be proof-rendered on a contact sheet like every other habit here.
 * They all point at the hollow middle, which is the fact that makes a
 * geode strange: nearly everything else grows outwards.
 */
function Geode(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.5} strokeLinejoin="round">
      <path d="M50 16 C72 16 86 32 84 52 C82 72 66 84 50 84 C32 84 16 70 16 50 C16 30 30 16 50 16 Z"
            fill={p.mid} />
      <ellipse cx={50} cy={50} rx={22} ry={20} fill="#2B2620" />
      <path d="M32 50 L41 44 L41 56 Z" fill="#EAF2F8" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M39 36 L47 44 L36 47 Z" fill="#CFE0EE" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M50 32 L56 43 L44 43 Z" fill="#EAF2F8" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M61 36 L53 44 L64 47 Z" fill="#CFE0EE" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M68 50 L59 44 L59 56 Z" fill="#EAF2F8" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M61 64 L53 56 L64 53 Z" fill="#CFE0EE" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M50 68 L44 57 L56 57 Z" fill="#EAF2F8" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M39 64 L36 53 L47 56 Z" fill="#CFE0EE" stroke="#9FB4C6" strokeWidth={0.8} />
      <path d="M50 16 C40 24 34 34 34 50" fill="none" stroke={p.lit} strokeWidth={2} opacity={0.5} />
    </g>
  );
}

/** Coal — no crystal at all. An angular lump with a glassy fracture. */
function Coal(p: Palette) {
  return (
    <g stroke={p.line} strokeWidth={1.5} strokeLinejoin="round">
      <path d="M24 44 L38 24 L64 22 L80 40 L74 68 L52 80 L28 70 Z" fill={p.mid} />
      <path d="M38 24 L64 22 L58 44 L36 42 Z" fill={p.lit} opacity={0.75} />
      <path d="M80 40 L74 68 L58 60 L58 44 Z" fill={p.dark} />
      <path d="M28 70 L52 80 L52 62 L34 56 Z" fill={p.dark} opacity={0.8} />
    </g>
  );
}

/**
 * Pearl — grown in layers by an animal, so it has no facets at all.
 *
 * The lustre needs a gradient, and a gradient needs an id that is
 * unique on the page: a filled pearl and its own ghost slot can be on
 * screen together, and a duplicated id would silently paint one with
 * the other's fill.
 */
function Pearl(p: Palette, ghost: boolean) {
  if (ghost) {
    return (
      <g stroke={p.line} strokeWidth={1.6} fill="none">
        <circle cx={50} cy={50} r={31} fill={p.lit} />
        <path d="M28 62 C36 74 62 76 72 62" opacity={0.7} />
      </g>
    );
  }
  const id = 'pearl-lustre';
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
      </defs>
      <circle cx={50} cy={50} r={31} fill={`url(#${id})`} stroke={p.line} strokeWidth={1.4} />
      <ellipse cx={40} cy={38} rx={9} ry={6.5} fill="#FFFFFF" opacity={0.85}
               transform="rotate(-28 40 38)" />
      <path d="M28 62 C36 74 62 76 72 62" fill="none" stroke="#FFF6F8" strokeWidth={2.5} opacity={0.5} />
    </g>
  );
}

/* ─── dispatch ────────────────────────────────────────────────────── */

export type Habit =
  | 'cube' | 'rhombohedron' | 'hex-prism-pointed' | 'hex-prism-flat'
  | 'octahedron' | 'rhombic-dodecahedron' | 'banded' | 'geode'
  | 'lump' | 'sphere';

/**
 * Which habit each gem grows in. Exported so a test can assert the map
 * covers the whole catalog: a gem added later with no entry here would
 * otherwise render silently as a cube, which would be a drawing that
 * lies about the mineral. Every value must agree with that gem's
 * `crystalShape` prose in the catalog.
 */
export const HABIT_BY_CODE: Record<string, Habit> = {
  fluorite: 'cube',
  galena: 'cube',
  calcite: 'rhombohedron',
  quartz: 'hex-prism-pointed',
  ruby: 'hex-prism-flat',
  sapphire: 'hex-prism-flat',
  emerald: 'hex-prism-flat',
  diamond: 'octahedron',
  garnet: 'rhombic-dodecahedron',
  kentucky_agate: 'banded',
  geode: 'geode',
  coal: 'lump',
  freshwater_pearl: 'sphere',
};

function habitFor(gem: GemData, p: Palette, ghost: boolean) {
  switch (HABIT_BY_CODE[gem.code]) {
    case 'cube':                 return Cube(p);
    case 'rhombohedron':         return Rhombohedron(p);
    case 'hex-prism-pointed':    return HexPrism(p, true);
    case 'hex-prism-flat':       return HexPrism(p, false);
    case 'octahedron':           return Octahedron(p);
    case 'rhombic-dodecahedron': return RhombicDodecahedron(p);
    case 'banded':               return BandedNodule(p);
    case 'geode':                return Geode(p);
    case 'lump':                 return Coal(p);
    case 'sphere':               return Pearl(p, ghost);
    default:                     return Cube(p);
  }
}

export default function GemSpecimen({
  gem, size = 64, ghost = false,
}: {
  gem: GemData;
  size?: number;
  /**
   * An empty slot. Draws the same geometry as a faint engraving, so the
   * shape of what is missing is visible before she ever finds one —
   * a collection you can see the holes in is a collection worth
   * finishing.
   */
  ghost?: boolean;
}) {
  const p = PALETTES[gem.code] ?? FALLBACK;
  const flat: Palette = {
    lit: 'rgba(255,255,255,0.05)', mid: 'rgba(255,255,255,0.03)',
    dark: 'rgba(255,255,255,0.02)', line: 'rgba(214,196,150,0.42)',
  };
  return (
    <svg
      viewBox="0 0 100 100" width={size} height={size}
      role="img" aria-label={ghost ? `${gem.name} — not found yet` : gem.name}
    >
      {habitFor(gem, ghost ? flat : p, ghost)}
    </svg>
  );
}
