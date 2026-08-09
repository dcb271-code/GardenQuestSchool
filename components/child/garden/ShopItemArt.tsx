// components/child/garden/ShopItemArt.tsx
//
// The things she can buy, drawn as objects.
//
// These get looked at twice: once small, on a shelf in the shop, and
// then forever, standing in her garden. So each one is built the way
// the garden's own art is built — flat overlapping shapes with a
// darker outline, a light source coming from the upper left, and a
// contact shadow underneath so it sits ON the grass rather than
// hovering over it. The gem specimens taught this: a thing without a
// shadow floats, and floating is the single most common way a drawing
// in this app has gone wrong.
//
// Everything is drawn in a 100x100 box on a ground line at y=84, so a
// bench and a birdbath stand on the same floor when they are next to
// each other.
//
// Real objects, not icons. A stone lantern is a Japanese yukimi-gata,
// which is what is in the japanese-garden quadrant she already tends;
// a sundial has a gnomon at an angle rather than a stick straight up,
// because a vertical stick would not tell the time and she is the kind
// of child who would check.

interface Props { size?: number; shadow?: boolean }

const GROUND = 84;

function Frame({ size = 100, shadow = true, children }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {shadow && <ellipse cx={50} cy={GROUND + 3} rx={30} ry={6} fill="#000" opacity={0.18} />}
      {children}
    </svg>
  );
}

/* ─── the wooden bench ────────────────────────────────────────────── */

export function BenchArt({ size, shadow }: Props) {
  const W = '#A87A4A', WD = '#6B4A28', WL = '#C79A66';
  return (
    <Frame size={size} shadow={shadow}>
      {/* legs */}
      <rect x={22} y={58} width={7} height={26} fill={WD} stroke="#4A3018" strokeWidth={1.6} />
      <rect x={71} y={58} width={7} height={26} fill={WD} stroke="#4A3018" strokeWidth={1.6} />
      {/* seat */}
      <rect x={14} y={52} width={72} height={9} rx={2.5} fill={W} stroke="#4A3018" strokeWidth={1.8} />
      <rect x={14} y={52} width={72} height={3.5} rx={1.8} fill={WL} />
      {/* back rest — two slats and the uprights */}
      <rect x={19} y={22} width={6} height={32} fill={WD} stroke="#4A3018" strokeWidth={1.6} />
      <rect x={75} y={22} width={6} height={32} fill={WD} stroke="#4A3018" strokeWidth={1.6} />
      <rect x={17} y={26} width={66} height={8} rx={2.5} fill={W} stroke="#4A3018" strokeWidth={1.7} />
      <rect x={17} y={38} width={66} height={8} rx={2.5} fill={W} stroke="#4A3018" strokeWidth={1.7} />
      <rect x={17} y={26} width={66} height={3} rx={1.5} fill={WL} />
    </Frame>
  );
}

/* ─── the log seat ────────────────────────────────────────────────── */

export function LogSeatArt({ size, shadow }: Props) {
  return (
    <Frame size={size} shadow={shadow}>
      <path d="M 16 60 L 16 80 Q 50 90 84 80 L 84 60 Z"
            fill="#7A5B3C" stroke="#43301C" strokeWidth={1.8} strokeLinejoin="round" />
      <ellipse cx={50} cy={60} rx={34} ry={11} fill="#C29A6A" stroke="#43301C" strokeWidth={1.8} />
      {/* growth rings, because a sawn log has them */}
      <ellipse cx={50} cy={60} rx={24} ry={7.5} fill="none" stroke="#9C7748" strokeWidth={1.3} />
      <ellipse cx={50} cy={60} rx={14} ry={4.4} fill="none" stroke="#9C7748" strokeWidth={1.2} />
      <ellipse cx={50} cy={60} rx={5} ry={1.8} fill="#8A6535" />
      {/* bark texture down the side */}
      {[24, 36, 50, 64, 76].map(x => (
        <path key={x} d={`M ${x} 66 q 2 8 0 16`} stroke="#5C4229" strokeWidth={1.4}
              fill="none" opacity={0.7} />
      ))}
    </Frame>
  );
}

/* ─── stepping stones ─────────────────────────────────────────────── */

export function SteppingStonesArt({ size, shadow }: Props) {
  const stones: Array<[number, number, number, number, number]> = [
    [20, 76, 15, 8, -8], [43, 68, 17, 9, 5], [67, 74, 14, 8, -4], [86, 66, 12, 7, 9],
  ];
  return (
    <Frame size={size} shadow={false}>
      {stones.map(([x, y, rx, ry, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <ellipse cx={x} cy={y + 2.5} rx={rx} ry={ry} fill="#000" opacity={0.16} />
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#A9A093" stroke="#6E6559" strokeWidth={1.6} />
          <ellipse cx={x - rx * 0.25} cy={y - ry * 0.3} rx={rx * 0.5} ry={ry * 0.4}
                   fill="#C0B8AB" opacity={0.7} />
        </g>
      ))}
    </Frame>
  );
}

/* ─── the stone lantern ───────────────────────────────────────────── */

export function StoneLanternArt({ size, shadow }: Props) {
  const S = '#A9A093', SD = '#6E6559', SL = '#C4BCB0';
  return (
    <Frame size={size} shadow={shadow}>
      {/* base */}
      <path d="M 32 84 L 68 84 L 63 74 L 37 74 Z" fill={SD} stroke="#4E463C" strokeWidth={1.7} strokeLinejoin="round" />
      {/* post */}
      <rect x={43} y={54} width={14} height={21} fill={S} stroke="#4E463C" strokeWidth={1.7} />
      {/* platform under the light box */}
      <path d="M 32 54 L 68 54 L 63 47 L 37 47 Z" fill={SL} stroke="#4E463C" strokeWidth={1.7} strokeLinejoin="round" />
      {/* the fire box, with the window that glows */}
      <rect x={36} y={30} width={28} height={17} rx={2} fill={S} stroke="#4E463C" strokeWidth={1.8} />
      <rect x={42} y={34} width={16} height={10} rx={1.5} fill="#FFE9A8" stroke="#8A7A50" strokeWidth={1.2} />
      {/* the wide snow-viewing roof, which is what makes it yukimi-gata */}
      <path d="M 24 30 Q 50 14 76 30 Q 50 24 24 30 Z" fill={SL} stroke="#4E463C" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M 24 30 L 76 30" stroke="#4E463C" strokeWidth={1.6} />
      {/* finial */}
      <circle cx={50} cy={16} r={4} fill={S} stroke="#4E463C" strokeWidth={1.5} />
    </Frame>
  );
}

/* ─── the birdbath ────────────────────────────────────────────────── */

export function BirdbathArt({ size, shadow }: Props) {
  const S = '#B5AEA2', SD = '#7A7266', SL = '#CFC8BC';
  return (
    <Frame size={size} shadow={shadow}>
      {/* foot */}
      <ellipse cx={50} cy={82} rx={20} ry={6} fill={SD} stroke="#544C42" strokeWidth={1.7} />
      {/* pedestal, tapering */}
      <path d="M 42 48 L 58 48 L 62 80 L 38 80 Z" fill={S} stroke="#544C42" strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M 42 48 L 47 48 L 44 80 L 38 80 Z" fill={SL} opacity={0.65} />
      {/* the bowl */}
      <path d="M 22 40 Q 50 58 78 40 L 78 36 Q 50 44 22 36 Z"
            fill={S} stroke="#544C42" strokeWidth={1.8} strokeLinejoin="round" />
      <ellipse cx={50} cy={36} rx={28} ry={8.5} fill={SL} stroke="#544C42" strokeWidth={1.8} />
      {/* shallow water — the point of a birdbath is that it IS shallow */}
      <ellipse cx={50} cy={37} rx={22} ry={6} fill="#8FC4DE" />
      <ellipse cx={50} cy={37} rx={22} ry={6} fill="none" stroke="#6FA8C8" strokeWidth={1} />
      <path d="M 38 36 q 5 -2.5 10 0 M 54 39 q 5 -2.5 10 0"
            stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.8} strokeLinecap="round" />
    </Frame>
  );
}

/* ─── the sundial ─────────────────────────────────────────────────── */

export function SundialArt({ size, shadow }: Props) {
  const S = '#A9A093', SD = '#6E6559', SL = '#C4BCB0';
  return (
    <Frame size={size} shadow={shadow}>
      <ellipse cx={50} cy={82} rx={18} ry={5.5} fill={SD} stroke="#4E463C" strokeWidth={1.6} />
      <path d="M 43 52 L 57 52 L 60 80 L 40 80 Z" fill={S} stroke="#4E463C" strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M 43 52 L 47 52 L 44 80 L 40 80 Z" fill={SL} opacity={0.6} />
      {/* the dial plate */}
      <ellipse cx={50} cy={50} rx={30} ry={11} fill={SL} stroke="#4E463C" strokeWidth={1.8} />
      <ellipse cx={50} cy={50} rx={24} ry={8} fill="none" stroke="#8A8175" strokeWidth={1.1} />
      {/* hour marks */}
      {[-70, -45, -20, 0, 20, 45, 70].map((a, i) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return (
          <line key={i}
                x1={50 + Math.cos(rad) * 18} y1={50 + Math.sin(rad) * 6.5}
                x2={50 + Math.cos(rad) * 25} y2={50 + Math.sin(rad) * 9}
                stroke="#6E6559" strokeWidth={1.4} strokeLinecap="round" />
        );
      })}
      {/* THE GNOMON — leaning, because a vertical pin tells you nothing */}
      <path d="M 50 50 L 50 30 L 66 50 Z" fill="#8A7358" stroke="#3F3428" strokeWidth={1.7} strokeLinejoin="round" />
      {/* and the shadow it throws, which is the whole instrument */}
      <path d="M 50 50 L 30 55 L 33 57 Z" fill="#4E463C" opacity={0.45} />
    </Frame>
  );
}

/* ─── dispatch ────────────────────────────────────────────────────── */

const ART: Record<string, (p: Props) => JSX.Element> = {
  bench: BenchArt,
  log_seat: LogSeatArt,
  stepping_stones: SteppingStonesArt,
  stone_lantern: StoneLanternArt,
  birdbath: BirdbathArt,
  sundial: SundialArt,
};

export default function ShopItemArt({
  code, size = 100, shadow = true,
}: { code: string; size?: number; shadow?: boolean }) {
  const C = ART[code];
  if (!C) return null;
  return <C size={size} shadow={shadow} />;
}

/** Exported so a test can assert the catalog and the art agree. */
export const ART_CODES = Object.keys(ART);
