'use client';

// Upstairs — a child's bedroom. House phase 3.
//
// Three fixtures, all hers: the gallery wall (six frames — the
// reading room has two, and the promise was "a LOT more"), the bed
// with a choice of quilt, and the treasure shelf under the window.
// Plus the fixed art that makes it a bedroom: window with curtains
// and the garden outside, a rag rug, a bedside lamp.
//
// Two ways in. Her own room: every slot is a button. A sibling's
// room: the same drawing with no buttons at all — you visit, you do
// not redecorate. `mine` decides, and nothing in this file issues a
// request; the buttons only call back up.
//
// Spec: docs/superpowers/specs/2026-08-29-upstairs-spec.md

import { motion } from 'framer-motion';
import GemSpecimen from '@/components/child/garden/GemSpecimen';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import { PrizeVeggieArt } from '@/app/(child)/town/play-barn/art';
import {
  BEDROOM_SLOTS, getQuilt, type BedroomSlot, type QuiltCode, type ResolvedShelfItem,
} from '@/lib/world/room';

const TRIM = '#6B4226';
const OAK = '#955F2E';
const OAK_LIGHT = '#B07A42';
const OAK_DARK = '#6E4520';
const FLOOR_LINE = '#8F5A2E';

export interface HungFrame {
  url: string;
  frame?: string;
}

/** Each quilt lends the room its accent — the curtains and the rug
 *  border take it, so one tap really does change the whole mood. */
const QUILT_ACCENT: Record<QuiltCode, { curtain: string; rug: string }> = {
  patch: { curtain: '#C96A5A', rug: '#B0533F' },
  star:  { curtain: '#2E3E6B', rug: '#3A4E82' },
  sun:   { curtain: '#E0A030', rug: '#D9A441' },
  sea:   { curtain: '#3E7A8C', rug: '#4A8C8C' },
};

/* ── the six frame positions: two rows of three, over the bed ─── */

const FRAME_W = 92, FRAME_H = 112;
const SLOT_POS: Record<BedroomSlot, { x: number; y: number }> = {
  r1: { x: 52,  y: 96 },  r2: { x: 176, y: 96 },  r3: { x: 300, y: 96 },
  r4: { x: 52,  y: 236 }, r5: { x: 176, y: 236 }, r6: { x: 300, y: 236 },
};

const SHELF_X = [505, 565, 625];

export default function Bedroom({
  name, mine, quilt, hung, shelf, reducedMotion,
  onBack, onWall, onQuilt, onShelf,
}: {
  name: string;
  mine: boolean;
  quilt: QuiltCode;
  hung: Record<BedroomSlot, HungFrame | null>;
  shelf: Array<ResolvedShelfItem | null>;
  reducedMotion: boolean;
  onBack: () => void;
  onWall?: (slot: BedroomSlot) => void;
  onQuilt?: () => void;
  onShelf?: (spot: number) => void;
}) {
  const accent = QUILT_ACCENT[quilt];
  const undecorated = !mine
    && Object.values(hung).every(h => !h)
    && shelf.every(s => !s)
    && quilt === 'patch';
  // Buttons exist only in her own room. A visitor's tap does nothing
  // because there is nothing there to tap.
  const act = (fn?: () => void) => (mine && fn)
    ? { onClick: fn, style: { cursor: 'pointer' as const, touchAction: 'manipulation' as const }, role: 'button' }
    : {};

  return (
    <svg viewBox="0 0 700 1100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="bed-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEE4D0" />
          <stop offset="50%" stopColor="#E6D9BE" />
          <stop offset="100%" stopColor="#D5C3A2" />
        </linearGradient>
        <linearGradient id="bed-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BC7C42" />
          <stop offset="100%" stopColor="#93582A" />
        </linearGradient>
        <linearGradient id="bed-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BFDCEC" />
          <stop offset="60%" stopColor="#D9E9EA" />
          <stop offset="100%" stopColor="#A9C6A0" />
        </linearGradient>
        <radialGradient id="bed-lampglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bed-corner-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bed-corner-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#5A3B1F" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#5A3B1F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bed-oak-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={OAK_DARK} />
          <stop offset="45%" stopColor={OAK_LIGHT} />
          <stop offset="100%" stopColor={OAK_DARK} />
        </linearGradient>
        {/* the garden stays behind the glass — the first render had
            the hill spilling out past the sill onto the wall */}
        <clipPath id="bed-glass">
          <rect x={480} y={110} width={170} height={216} />
        </clipPath>
      </defs>

      {/* ceiling, wall, floor */}
      <rect x={0} y={0} width={700} height={56} fill="#F7EEDC" />
      <rect x={0} y={52} width={700} height={10} fill={TRIM} opacity={0.5} />
      <rect x={0} y={60} width={700} height={764} fill="url(#bed-wall)" />
      <rect x={0} y={800} width={700} height={22} fill={TRIM} />
      <rect x={0} y={820} width={700} height={280} fill="url(#bed-floor)" />
      {[884, 948, 1012, 1076].map(y => (
        <line key={y} x1={0} y1={y} x2={700} y2={y} stroke={FLOOR_LINE} strokeWidth={2} opacity={0.4} />
      ))}

      {/* THE WINDOW — the garden outside, curtains in the quilt's color */}
      <g>
        <rect x={466} y={96} width={198} height={244} fill="#F9F4EA" stroke="#D8CBB0" strokeWidth={2} rx={3} />
        <rect x={480} y={110} width={170} height={216} fill="url(#bed-sky)" />
        {/* a hill, a tree, the far fence — the garden she came in from */}
        <g clipPath="url(#bed-glass)">
          <ellipse cx={520} cy={330} rx={120} ry={46} fill="#7FA86B" />
          <ellipse cx={630} cy={338} rx={90} ry={40} fill="#6B9A5A" />
          <rect x={596} y={240} width={8} height={54} fill="#6E4520" />
          <circle cx={600} cy={228} r={30} fill="#5F8F4A" />
          <circle cx={586} cy={240} r={20} fill="#6FA058" />
          <circle cx={616} cy={242} r={18} fill="#6FA058" />
          {[500, 520, 540].map(x => (
            <rect key={x} x={x} y={286} width={4} height={26} fill="#E8DCC8" opacity={0.8} />
          ))}
          <rect x={498} y={292} width={48} height={3} fill="#E8DCC8" opacity={0.8} />
          <circle cx={510} cy={140} r={14} fill="#FFF6C8" opacity={0.9} />
        </g>
        {/* muntins and sill */}
        <rect x={563} y={110} width={4} height={216} fill="#F9F4EA" />
        <rect x={480} y={216} width={170} height={4} fill="#F9F4EA" />
        <rect x={458} y={338} width={214} height={12} fill="#EDE4D3" stroke="#D8CBB0" strokeWidth={2} rx={2} />
        {/* the curtain rod and two soft panels, tied back */}
        <rect x={452} y={86} width={226} height={6} rx={3} fill={OAK_DARK} />
        <circle cx={452} cy={89} r={6} fill={OAK_LIGHT} />
        <circle cx={678} cy={89} r={6} fill={OAK_LIGHT} />
        <path d="M 458 92 L 512 92 Q 508 170 486 216 Q 482 260 494 336 L 462 336 Q 470 250 464 200 Z"
              fill={accent.curtain} opacity={0.92} />
        <path d="M 672 92 L 618 92 Q 622 170 644 216 Q 648 260 636 336 L 668 336 Q 660 250 666 200 Z"
              fill={accent.curtain} opacity={0.92} />
        {[476, 490].map(x => (
          <path key={x} d={`M ${x} 96 Q ${x - 4} 170 ${x - 2} 214`} fill="none" stroke="#00000022" strokeWidth={2} />
        ))}
        {[640, 654].map(x => (
          <path key={x} d={`M ${x} 96 Q ${x + 4} 170 ${x + 2} 214`} fill="none" stroke="#00000022" strokeWidth={2} />
        ))}
        <path d="M 480 214 Q 494 208 500 220" fill="none" stroke="#F5D98F" strokeWidth={4} strokeLinecap="round" />
        <path d="M 650 214 Q 636 208 630 220" fill="none" stroke="#F5D98F" strokeWidth={4} strokeLinecap="round" />
      </g>

      {/* THE GALLERY WALL — six frames, two rows of three, over the bed */}
      {BEDROOM_SLOTS.map(slot => {
        const { x, y } = SLOT_POS[slot];
        const piece = hung[slot];
        return (
          <g key={slot} {...act(onWall ? () => onWall(slot) : undefined)}
             aria-label={mine ? (piece ? 'Change this picture' : 'Hang a picture here') : undefined}>
            <rect x={x - 6} y={y - 6} width={FRAME_W + 12} height={FRAME_H + 12} fill="transparent" />
            <FrameArt x={x} y={y} w={FRAME_W} h={FRAME_H} frame={piece?.frame} />
            {piece ? (
              <image href={piece.url} x={x + 10} y={y + 10} width={FRAME_W - 20} height={FRAME_H - 20}
                     preserveAspectRatio="xMidYMid slice" />
            ) : (
              <g>
                <rect x={x + 10} y={y + 10} width={FRAME_W - 20} height={FRAME_H - 20} fill="#F9F1E4"
                      stroke="#C9B88E" strokeWidth={2} strokeDasharray="5 4" />
                {mine && (
                  <text x={x + FRAME_W / 2} y={y + FRAME_H / 2 + 7} textAnchor="middle" fontSize={20} fill="#9A8C76">+</text>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* THE TREASURE SHELF — three spots under the window */}
      <g>
        <rect x={464} y={404} width={204} height={12} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} rx={3} />
        {[492, 640].map(x => (
          <path key={x} d={`M ${x} 416 l 8 20 l -16 0 Z`} fill={OAK} />
        ))}
        {SHELF_X.map((cx, spot) => {
          const item = shelf[spot];
          return (
            <g key={spot} {...act(onShelf ? () => onShelf(spot) : undefined)}
               aria-label={mine ? (item ? 'Change what stands here' : 'Put something on the shelf') : undefined}>
              <rect x={cx - 28} y={350} width={56} height={56} fill="transparent" />
              {item ? (
                <g transform={`translate(${cx - 22}, 358)`}>
                  {item.kind === 'stone' && <GemSpecimen gem={item.gem} size={44} />}
                  {item.kind === 'bird' && <SpeciesIllustration code={item.bird.code} size={44} />}
                  {item.kind === 'veggie' && <PrizeVeggieArt code={item.veggie.code} size={44} />}
                </g>
              ) : (
                <>
                  <circle cx={cx} cy={382} r={16} fill="none" stroke="#C9B88E" strokeWidth={2} strokeDasharray="5 4" />
                  {mine && <text x={cx} y={388} textAnchor="middle" fontSize={15} fill="#9A8C76">+</text>}
                </>
              )}
            </g>
          );
        })}
      </g>

      {/* THE BED — the hero of the room. Tap the quilt to change it. */}
      <g {...act(onQuilt)} aria-label={mine ? 'Choose a quilt' : undefined}>
        {/* shadow lands where the legs land */}
        <ellipse cx={260} cy={806} rx={190} ry={12} fill="#000" opacity={0.14} />
        {/* headboard — arched oak with spindles, like the stair rail */}
        <path d="M 104 560 L 104 470 Q 104 430 144 430 L 376 430 Q 416 430 416 470 L 416 560 Z"
              fill={OAK} stroke={OAK_DARK} strokeWidth={2.5} />
        {[140, 176, 212, 248, 284, 320, 356].map(x => (
          <rect key={x} x={x} y={448} width={8} height={100} rx={3} fill="url(#bed-oak-round)" />
        ))}
        <rect x={104} y={548} width={312} height={14} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} />
        {/* legs */}
        {[100, 404].map(x => (
          <rect key={x} x={x} y={780} width={16} height={26} fill={OAK_DARK} rx={2} />
        ))}
        {/* mattress and sheet */}
        <rect x={92} y={556} width={336} height={236} rx={16} fill="#EFE7D8" stroke="#C9B88E" strokeWidth={2} />
        {/* the quilt, pulled up under the pillows */}
        <Quilt code={quilt} x={98} y={598} w={324} h={184} />
        {/* the turned-down sheet */}
        <path d="M 98 598 L 422 598 L 422 618 Q 260 630 98 618 Z" fill="#FFFDF6" stroke="#D8CBB0" strokeWidth={1.5} />
        {/* pillows */}
        <rect x={116} y={562} width={132} height={44} rx={18} fill="#FFFBF2" stroke="#D8CBB0" strokeWidth={2} />
        <rect x={272} y={562} width={132} height={44} rx={18} fill="#FFFBF2" stroke="#D8CBB0" strokeWidth={2} />
        {/* footboard */}
        <rect x={100} y={774} width={320} height={14} rx={4} fill={OAK} stroke={OAK_DARK} strokeWidth={2} />
      </g>

      {/* THE BEDSIDE TABLE AND LAMP */}
      <g>
        <ellipse cx={498} cy={806} rx={44} ry={7} fill="#000" opacity={0.14} />
        <rect x={458} y={676} width={80} height={12} rx={3} fill={OAK_LIGHT} stroke={OAK_DARK} strokeWidth={2} />
        <rect x={464} y={688} width={68} height={100} fill={OAK} stroke={OAK_DARK} strokeWidth={2} rx={3} />
        <rect x={474} y={700} width={48} height={30} rx={3} fill="none" stroke={OAK_DARK} strokeWidth={2} opacity={0.6} />
        <circle cx={498} cy={715} r={3.5} fill="#F5D98F" />
        {[468, 522].map(x => <rect key={x} x={x} y={788} width={8} height={16} fill={OAK_DARK} />)}
        {/* the lamp */}
        <circle cx={498} cy={612} r={70} fill="url(#bed-lampglow)" pointerEvents="none" />
        <rect x={488} y={654} width={20} height={22} rx={4} fill="#4A3A28" />
        <rect x={495} y={620} width={6} height={36} fill="#4A3A28" />
        <path d="M 468 626 L 480 582 L 516 582 L 528 626 Z" fill="#F9F1DC" stroke="#C9B88E" strokeWidth={2} />
        <ellipse cx={498} cy={626} rx={30} ry={6} fill="#FFEDB8" opacity={0.7} />
        {!reducedMotion && (
          <motion.circle cx={498} cy={612} r={70} fill="url(#bed-lampglow)" pointerEvents="none"
                         animate={{ opacity: [0.5, 0.9, 0.5] }}
                         transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        )}
      </g>

      {/* THE RAG RUG — braided, oval. Many thin rounds in three soft
          colors: the first draw used five wide rings in two colors and
          it read as a target on the floor. */}
      <g>
        <ellipse cx={350} cy={940} rx={222} ry={80} fill="#D8CCB8" />
        {Array.from({ length: 11 }, (_, i) => {
          const k = 1 - i / 11;
          const c = [accent.rug, '#E8DFD2', '#C9B88E'][i % 3];
          return (
            <ellipse key={i} cx={350} cy={940} rx={216 * k} ry={76 * k} fill="none"
                     stroke={c} strokeWidth={i === 10 ? 12 : 13} opacity={0.9} />
          );
        })}
        {/* the braid — a soft stitch line between the rounds */}
        {Array.from({ length: 5 }, (_, i) => {
          const k = 1 - (i * 2 + 1) / 11;
          return <ellipse key={i} cx={350} cy={940} rx={216 * k} ry={76 * k} fill="none"
                          stroke="#00000018" strokeWidth={2} strokeDasharray="6 5" />;
        })}
        <ellipse cx={350} cy={940} rx={222} ry={80} fill="none" stroke="#00000022" strokeWidth={2} />
      </g>

      {/* back to the landing */}
      <g onClick={onBack} style={{ cursor: 'pointer' }} role="button" aria-label="Back to the landing">
        <rect x={16} y={26} width={140} height={38} rx={19} fill="#FFF8E8" opacity={0.92}
              stroke="#C9B88E" strokeWidth={2} />
        <text x={86} y={51} textAnchor="middle" fontSize={14} fontWeight={700} fill="#3f2614">
          ← the landing
        </text>
      </g>

      {/* whose room — and, for a visitor, the one warm line */}
      <g>
        <rect x={undecorated ? 190 : 250} y={26} width={undecorated ? 320 : 200} height={38} rx={19}
              fill="#FFF8E8" opacity={0.92} stroke="#C9B88E" strokeWidth={2} />
        <text x={350} y={51} textAnchor="middle" fontSize={14} fontWeight={700} fill="#3f2614">
          {undecorated ? `${name} has not decorated yet.` : `${name}'s room`}
        </text>
      </g>

      {/* corner shading, so the room has sides */}
      <rect x={0} y={56} width={80} height={1044} fill="url(#bed-corner-left)" pointerEvents="none" />
      <rect x={620} y={56} width={80} height={1044} fill="url(#bed-corner-right)" pointerEvents="none" />
    </svg>
  );
}

/* ── store frames, drawn in SVG ─────────────────────────────────── */

/**
 * The frame codes from the art store, drawn as borders. Plain is
 * honest oak; starry is deep blue with little gold stars; gold is the
 * double museum border; flowered has painted roses in the corners.
 */
export function FrameArt({ x, y, w, h, frame }: {
  x: number; y: number; w: number; h: number; frame?: string;
}) {
  if (frame === 'starry') {
    const dots: Array<[number, number]> = [];
    for (let i = 0; i < 5; i++) { dots.push([x + 10 + i * (w - 20) / 4, y + 5]); dots.push([x + 10 + i * (w - 20) / 4, y + h - 5]); }
    for (let i = 1; i < 5; i++) { dots.push([x + 5, y + 10 + i * (h - 20) / 5]); dots.push([x + w - 5, y + 10 + i * (h - 20) / 5]); }
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#2E4A7A" stroke="#1E3258" strokeWidth={2} rx={2} />
        {dots.map(([dx, dy], i) => (
          <path key={i} d={starPath(dx, dy, 3.2, 1.4)} fill="#F5D98F" />
        ))}
      </g>
    );
  }
  if (frame === 'gold') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#C9A227" stroke="#8A6A10" strokeWidth={2} rx={2} />
        <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="none" stroke="#FFF3C4" strokeWidth={1.5} />
        <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill="none" stroke="#8A6A10" strokeWidth={1.5} />
      </g>
    );
  }
  if (frame === 'flowered') {
    const corners: Array<[number, number]> = [[x + 5, y + 5], [x + w - 5, y + 5], [x + 5, y + h - 5], [x + w - 5, y + h - 5]];
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#E8B4C0" stroke="#C97C90" strokeWidth={2} rx={2} />
        {corners.map(([cx, cy], i) => (
          <g key={i}>
            {[0, 72, 144, 216, 288].map(a => (
              <circle key={a} cx={cx + 3 * Math.cos(a * Math.PI / 180)} cy={cy + 3 * Math.sin(a * Math.PI / 180)}
                      r={1.8} fill="#C94C3E" />
            ))}
            <circle cx={cx} cy={cy} r={1.4} fill="#F5D98F" />
          </g>
        ))}
        {[x + w / 2, x + w / 2].map((cx, i) => (
          <circle key={i} cx={cx} cy={i ? y + h - 5 : y + 5} r={2} fill="#C94C3E" />
        ))}
      </g>
    );
  }
  return <rect x={x} y={y} width={w} height={h} fill={OAK} stroke={OAK_DARK} strokeWidth={2} rx={2} />;
}

/* ── the quilts ─────────────────────────────────────────────────── */

function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

/**
 * One drawn quilt on the bed. The star quilt shows SEVEN ROWS OF
 * SEVEN — a child who has met the crow's star quilt will count them,
 * and a picture that lies about a number teaches the wrong number.
 * Every star carries `data-star` so the test can count them too.
 */
export function Quilt({ code, x, y, w, h }: {
  code: QuiltCode; x: number; y: number; w: number; h: number;
}) {
  const clipId = `quilt-clip-${code}-${x}-${y}`;
  const q = getQuilt(code);
  return (
    <g aria-label={q.name}>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={w} height={h} rx={10} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {code === 'patch' && <PatchQuilt x={x} y={y} w={w} h={h} />}
        {code === 'star' && <StarQuilt x={x} y={y} w={w} h={h} />}
        {code === 'sun' && <SunQuilt x={x} y={y} w={w} h={h} />}
        {code === 'sea' && <SeaQuilt x={x} y={y} w={w} h={h} />}
      </g>
      {/* the binding all the way round */}
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke="#00000033" strokeWidth={3} />
    </g>
  );
}

const PATCH_COLORS = ['#C96A5A', '#4A8C8C', '#D9A441', '#6B8E5A', '#8A6BA6', '#E8B4C0'];

function PatchQuilt({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const cols = 6, rows = 4;
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect key={`${r}-${c}`} x={x + c * cw} y={y + r * ch} width={cw} height={ch}
              fill={PATCH_COLORS[(r * 5 + c * 7) % PATCH_COLORS.length]} />,
      );
    }
  }
  return (
    <g>
      {cells}
      {/* stitching between the patches */}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line key={`v${i}`} x1={x + (i + 1) * cw} y1={y} x2={x + (i + 1) * cw} y2={y + h}
              stroke="#FFFDF6" strokeWidth={2} strokeDasharray="4 4" opacity={0.85} />
      ))}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line key={`h${i}`} x1={x} y1={y + (i + 1) * ch} x2={x + w} y2={y + (i + 1) * ch}
              stroke="#FFFDF6" strokeWidth={2} strokeDasharray="4 4" opacity={0.85} />
      ))}
    </g>
  );
}

function StarQuilt({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const n = 7;
  const cw = w / n, ch = h / n;
  const stars: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cx = x + (c + 0.5) * cw, cy = y + (r + 0.5) * ch;
      stars.push(
        <path key={`${r}-${c}`} data-star="" d={starPath(cx, cy, Math.min(cw, ch) * 0.36, Math.min(cw, ch) * 0.15)}
              fill="#F5D98F" stroke="#E0B84A" strokeWidth={1} />,
      );
    }
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#2E3E6B" />
      {/* quilting lines between the rows and columns, so each star
          has its own square — that is how you count them */}
      {Array.from({ length: n - 1 }, (_, i) => (
        <line key={`v${i}`} x1={x + (i + 1) * cw} y1={y} x2={x + (i + 1) * cw} y2={y + h}
              stroke="#4A5E92" strokeWidth={1.5} />
      ))}
      {Array.from({ length: n - 1 }, (_, i) => (
        <line key={`h${i}`} x1={x} y1={y + (i + 1) * ch} x2={x + w} y2={y + (i + 1) * ch}
              stroke="#4A5E92" strokeWidth={1.5} />
      ))}
      {stars}
    </g>
  );
}

function SunQuilt({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const cx = x + w / 2, cy = y + h / 2;
  const R = Math.min(w, h) * 0.26;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#F2C75C" />
      {/* rings warming out to the corners */}
      {[2.6, 2.1, 1.6].map((k, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * k} fill="none" stroke={i % 2 ? '#E8A93A' : '#F7DA8C'} strokeWidth={10} opacity={0.75} />
      ))}
      {/* sixteen rays, then the sun */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = i * Math.PI / 8;
        const x1 = cx + Math.cos(a) * (R + 4), y1 = cy + Math.sin(a) * (R + 4);
        const x2 = cx + Math.cos(a) * (R + 24), y2 = cy + Math.sin(a) * (R + 24);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E07B2A" strokeWidth={i % 2 ? 4 : 7} strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={R} fill="#F9A03F" stroke="#E07B2A" strokeWidth={3} />
      <circle cx={cx - R * 0.3} cy={cy - R * 0.3} r={R * 0.28} fill="#FFD27A" opacity={0.7} />
    </g>
  );
}

function SeaQuilt({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const rows = 5;
  const rh = h / rows;
  const wave = (yy: number) => {
    const parts: string[] = [`M ${x} ${yy}`];
    const seg = w / 8;
    for (let i = 0; i < 8; i++) {
      const sx = x + i * seg;
      parts.push(`Q ${sx + seg / 4} ${yy - rh * 0.35} ${sx + seg / 2} ${yy} T ${sx + seg} ${yy}`);
    }
    return parts.join(' ');
  };
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#3E7A8C" />
      {Array.from({ length: rows }, (_, i) => (
        <rect key={i} x={x} y={y + i * rh} width={w} height={rh} fill={i % 2 ? '#4A8C9E' : '#3E7A8C'} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <path key={i} d={wave(y + (i + 0.7) * rh)} fill="none" stroke="#E8F4F6" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      ))}
      {/* the little boat that never gets anywhere */}
      <g transform={`translate(${x + w * 0.62}, ${y + h * 0.42})`}>
        <path d="M -22 0 L 22 0 L 14 12 L -14 12 Z" fill="#C96A5A" stroke="#8F3F30" strokeWidth={1.5} />
        <rect x={-1.5} y={-30} width={3} height={30} fill="#5A3B1F" />
        <path d="M 1 -28 L 20 -4 L 1 -4 Z" fill="#FFFDF6" stroke="#D8CBB0" strokeWidth={1} />
      </g>
    </g>
  );
}
