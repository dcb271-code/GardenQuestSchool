'use client';

// The Crow's Picture Cache — teach mode (phase 1 of the spec).
//
// Six framed scenes on a wall, one per stubborn fact. Every scene
// obeys the derivability rule: the answer is countable in the
// picture, true of the animal's body, built from the characters'
// shapes, or arithmetic itself. The crow keeps them because corvids
// really do cache thousands of seeds and remember every spot.
//
// Pip teaches structure; the crow keeps memories. Said that way, in
// the intro, because the division of labor is part of the lesson.

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/audio/tts';
import { playPageTurn, playSparkle } from '@/lib/audio/sfx';
import { CROW_SCENES, CROW_ALPHABET, getScene, nineFold, FINGER_TRICK, type CrowScene } from '@/lib/packs/math/crowScenes';
import {
  buildCrowDeck, goldKeysOf,
  type CrowCacheState, type CrowQuestion,
} from '@/lib/packs/math/crowPractice';
import { factKey } from '@/lib/packs/math/timesTable';

const INK = '#3A2E1E';
const PAPER = '#FFFDF6';
const WOOD = '#8A6238';
const WOOD_DARK = '#5E4020';
const GRASS = '#A9C68C';
const SHELL = '#B08247';
const SHELL_DARK = '#6E4520';
const BEE_GOLD = '#E8B93A';
const BEE_DARK = '#3A3226';
const FLAG_RED = '#C94C3E';

function speakRhyme(text: string) {
  return speak(text, { rate: 0.92, pitch: 1.1 });
}

/* ══ the characters ═════════════════════════════════════════════ */

/** A snail whose shell IS its digit — 3 for a young shell, 6 grown. */
function Snail({ x, y, scale = 1, shellDigit }: {
  x: number; y: number; scale?: number; shellDigit: 3 | 6;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* body: a low foot with a lifted head and two eye-stalks */}
      <path d="M -34 0 Q -30 -12 -12 -12 L 26 -12 Q 40 -12 44 -2 L 44 0 Z"
            fill="#C9A87C" stroke={SHELL_DARK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M 34 -10 Q 44 -26 40 -34 M 42 -11 Q 52 -22 52 -30"
            fill="none" stroke="#C9A87C" strokeWidth={5} strokeLinecap="round" />
      <circle cx={40} cy={-35} r={3.5} fill={SHELL_DARK} />
      <circle cx={52} cy={-31} r={3.5} fill={SHELL_DARK} />
      {/* the shell: the digit itself, worn on the back */}
      <text x={-2} y={-16} textAnchor="middle" fontSize={54} fontWeight={900}
            fill={SHELL} stroke={SHELL_DARK} strokeWidth={2.5} paintOrder="stroke"
            style={{ fontFamily: 'ui-rounded, "Comic Sans MS", system-ui, sans-serif' }}>
        {shellDigit}
      </text>
    </g>
  );
}

/** The letterbox flag — a 7 in profile, and proud of it. */
function FlagCharacter({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x={-3} y={-52} width={6} height={56} rx={3} fill={WOOD} stroke={WOOD_DARK} strokeWidth={1.5} />
      <path d="M 3 -52 L 34 -46 L 3 -34 Z" fill={FLAG_RED} stroke="#8F3F30" strokeWidth={2} strokeLinejoin="round" />
      {/* a face on the pennant, because it is a character */}
      <circle cx={13} cy={-44} r={1.8} fill="#FFF" />
      <path d="M 11 -40 Q 14 -38 17 -41" stroke="#FFF" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** The bee — two stacked circles: an 8 that flies. */
function Bee({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx={-9} cy={-9} rx={10} ry={7} fill="#EAF2F6" opacity={0.85}
               stroke="#B8C8D0" strokeWidth={1.2} transform="rotate(-30 -9 -9)" />
      <ellipse cx={9} cy={-9} rx={10} ry={7} fill="#EAF2F6" opacity={0.85}
               stroke="#B8C8D0" strokeWidth={1.2} transform="rotate(30 9 -9)" />
      {/* head over body: the 8, upright */}
      <circle cx={0} cy={-4} r={7} fill={BEE_GOLD} stroke={BEE_DARK} strokeWidth={2} />
      <circle cx={0} cy={10} r={10} fill={BEE_GOLD} stroke={BEE_DARK} strokeWidth={2} />
      <path d="M -9.5 6 L 9.5 6 M -10 12 L 10 12" stroke={BEE_DARK} strokeWidth={3} />
      <circle cx={-2.5} cy={-5} r={1.5} fill={BEE_DARK} />
      <circle cx={2.5} cy={-5} r={1.5} fill={BEE_DARK} />
    </g>
  );
}

/** The tadpole — a 9 with somewhere to be. Alphabet card only. */
function Tadpole({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle cx={0} cy={-6} r={11} fill="#7A8C5A" stroke="#4A5C36" strokeWidth={2} />
      <path d="M 8 2 Q 16 14 8 26 Q 4 32 -2 30" fill="none"
            stroke="#7A8C5A" strokeWidth={7} strokeLinecap="round" />
      <circle cx={-3.5} cy={-8} r={2} fill="#2E3820" />
    </g>
  );
}

/** The crow: all black, heavy bill, an eye that misses nothing. */
function Crow({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path d="M -26 6 Q -34 -18 -12 -26 Q 8 -33 18 -22 L 34 -18 Q 22 -14 18 -12 Q 20 6 4 12 L 8 22 M -4 12 L -4 22"
            fill="#1E1B22" stroke="#0E0C12" strokeWidth={2} strokeLinejoin="round" />
      {/* heavy straight bill */}
      <path d="M 16 -22 L 36 -17 L 17 -13 Z" fill="#2E2B33" stroke="#0E0C12" strokeWidth={1.5} />
      {/* folded wing line */}
      <path d="M -22 -14 Q -2 -18 10 -6" fill="none" stroke="#3A3644" strokeWidth={2} />
      <circle cx={8} cy={-20} r={3} fill="#0E0C12" />
      <circle cx={9} cy={-21} r={1.1} fill="#EAE6F2" />
    </g>
  );
}

/* ══ the six scenes ═════════════════════════════════════════════ */
/* One shared viewBox so frames and detail render the same art.    */

const VB = '0 0 360 250';

function SceneGrowingShell({ quiz = false }: { quiz?: boolean }) {
  return (
    <g>
      <rect x={0} y={200} width={360} height={50} fill={GRASS} />
      <path d="M 0 200 Q 90 192 180 200 T 360 200" fill="none" stroke="#7FA86B" strokeWidth={3} />
      {/* little snail, shell still a 3 — an unfinished 6 */}
      <Snail x={100} y={196} scale={0.9} shellDigit={3} />
      {/* grandma snail, fully curled */}
      <Snail x={252} y={198} scale={1.25} shellDigit={6} />
      <text x={100} y={238} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>
        still growing
      </text>
      <text x={252} y={238} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>
        all curled up
      </text>
      {/* the read, left to right — hidden in quiz mode: the answer
          must come from the shells, not a label */}
      {!quiz && (
        <g>
          <text x={180} y={60} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>
            6 × 6
          </text>
          <rect x={140} y={74} width={80} height={30} rx={15} fill="#EFE0B0" stroke="#C9A227" strokeWidth={2} />
          <text x={180} y={95} textAnchor="middle" fontSize={18} fontWeight={800} fill="#5A4520">36</text>
        </g>
      )}
    </g>
  );
}

function SceneSnailMail({ quiz = false }: { quiz?: boolean }) {
  const cell = 26, x0 = 78, y0 = 44;
  return (
    <g>
      <rect x={0} y={214} width={360} height={36} fill={GRASS} />
      {/* the calendar — six rows of seven days IS the array */}
      <rect x={x0 - 10} y={y0 - 26} width={cell * 7 + 20} height={cell * 6 + 38} rx={6}
            fill={PAPER} stroke={WOOD} strokeWidth={3} />
      <text x={x0 + (cell * 7) / 2} y={y0 - 8} textAnchor="middle" fontSize={13}
            fontWeight={800} fill={INK} letterSpacing={2}>
        SNAIL MAIL — 6 WEEKS
      </text>
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 7 }, (_, c) => {
          const n = r * 7 + c + 1;
          const last = n === 42;
          return (
            <g key={n}>
              <rect x={x0 + c * cell} y={y0 + r * cell} width={cell} height={cell}
                    fill={last ? FLAG_RED : '#F4EDDC'} stroke="#C9BCA8" strokeWidth={1} />
              {last && !quiz && (
                <text x={x0 + c * cell + cell / 2} y={y0 + r * cell + cell / 2 + 5}
                      textAnchor="middle" fontSize={13} fontWeight={800} fill="#FFF">42</text>
              )}
            </g>
          );
        }),
      )}
      {/* week count down the side, so the six is countable too */}
      {Array.from({ length: 6 }, (_, r) => (
        <text key={r} x={x0 - 16} y={y0 + r * cell + 18} textAnchor="middle"
              fontSize={10} fontWeight={700} fill="#8A7A5E">{r + 1}</text>
      ))}
      {/* the snail on its way, envelope on its back */}
      <Snail x={56} y={242} scale={0.72} shellDigit={6} />
      <rect x={78} y={216} width={22} height={15} rx={2} fill={PAPER} stroke={WOOD} strokeWidth={1.5} />
      <path d="M 78 216 L 89 225 L 100 216" fill="none" stroke={WOOD} strokeWidth={1.5} />
      {/* the letterbox waiting, flag up */}
      <rect x={306} y={196} width={34} height={22} rx={5} fill="#6b8e5a" stroke={WOOD_DARK} strokeWidth={2} />
      <rect x={319} y={218} width={6} height={26} fill={WOOD} />
      <FlagCharacter x={344} y={214} scale={0.62} />
    </g>
  );
}

function SceneHoneycomb({ quiz = false }: { quiz?: boolean }) {
  // Flat-top hexagons, 2 rows of 4 — eight rooms, six walls apiece,
  // every wall drawn thick enough to count.
  const R = 27;
  const hex = (cx: number, cy: number, i: number) => {
    const pts = Array.from({ length: 6 }, (_, k) => {
      const ang = (Math.PI / 180) * (60 * k - 30);
      return `${cx + R * Math.cos(ang)},${cy + R * Math.sin(ang)}`;
    }).join(' ');
    return (
      <g key={i}>
        <polygon points={pts} fill="#F2C94C" opacity={0.55}
                 stroke="#8A6534" strokeWidth={4} strokeLinejoin="round" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#8A6534">
          {i + 1}
        </text>
      </g>
    );
  };
  const row1 = [0, 1, 2, 3].map(i => hex(88 + i * 56, 78, i));
  const row2 = [0, 1, 2, 3].map(i => hex(116 + i * 56, 126, i + 4));
  return (
    <g>
      <rect x={0} y={206} width={360} height={44} fill={GRASS} />
      {row1}{row2}
      <Bee x={318} y={62} scale={1.1} />
      {/* the snail arriving with its suitcase — the house animal
          visiting the apartment building */}
      <Snail x={64} y={204} scale={0.85} shellDigit={6} />
      <rect x={94} y={182} width={20} height={15} rx={2} fill="#B0533F" stroke={WOOD_DARK} strokeWidth={1.5} />
      <rect x={101} y={178} width={6} height={5} rx={2} fill="none" stroke={WOOD_DARK} strokeWidth={1.5} />
      <rect x={196} y={176} width={150} height={26} rx={13} fill={PAPER} stroke="#C9A227" strokeWidth={2} />
      <text x={271} y={194} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>
        {quiz ? '8 rooms × 6 walls' : '8 rooms × 6 walls = 48'}
      </text>
    </g>
  );
}

function SceneStarQuilt({ quiz = false }: { quiz?: boolean }) {
  const cell = 22, x0 = 46, y0 = 42;
  const star = (cx: number, cy: number, r: number, fill: string) => {
    const pts = Array.from({ length: 10 }, (_, k) => {
      const ang = (Math.PI / 5) * k - Math.PI / 2;
      const rad = k % 2 === 0 ? r : r * 0.44;
      return `${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`;
    }).join(' ');
    return pts;
  };
  return (
    <g>
      {/* the quilt: 7 rows of 7 stars, held up by the two flags */}
      <rect x={x0 - 12} y={y0 - 12} width={cell * 7 + 24} height={cell * 7 + 24} rx={8}
            fill="#2E4A7A" stroke={WOOD} strokeWidth={3} />
      {Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 7 }, (_, c) => (
          <polygon key={`${r}-${c}`}
                   points={star(x0 + c * cell + cell / 2, y0 + r * cell + cell / 2, 7.5, '')}
                   fill="#F5D98F" />
        )),
      )}
      <FlagCharacter x={x0 - 20} y={y0 + 92} scale={0.85} />
      <FlagCharacter x={x0 + cell * 7 + 18} y={y0 + 92} scale={0.85} />
      {/* the real flag, and the one star that will not fit */}
      <rect x={286} y={36} width={6} height={196} fill={WOOD} />
      <rect x={292} y={40} width={58} height={38} rx={3} fill="#F4EDDC" stroke={WOOD_DARK} strokeWidth={2} />
      <text x={321} y={56} textAnchor="middle" fontSize={13} fontWeight={800} fill="#2E4A7A">50</text>
      <text x={321} y={71} textAnchor="middle" fontSize={10} fontWeight={700} fill="#2E4A7A">stars</text>
      <polygon points={star(257, 122, 18, '')} fill="#FBF6EA" stroke={FLAG_RED}
               strokeWidth={2.5} strokeLinejoin="round" />
      <text x={257} y={128} textAnchor="middle" fontSize={13} fontWeight={800} fill={FLAG_RED}>?</text>
      <text x={257} y={158} textAnchor="middle" fontSize={11} fontWeight={700} fill={FLAG_RED}>
        one short!
      </text>
      {!quiz && (
        <g>
          <rect x={220} y={196} width={122} height={28} rx={14} fill={PAPER} stroke="#C9A227" strokeWidth={2} />
          <text x={281} y={215} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
            50 − 1 = 49
          </text>
        </g>
      )}
    </g>
  );
}

function SceneFamousFence({ quiz = false }: { quiz?: boolean }) {
  const posts = [
    { n: 5, x: 60 }, { n: 6, x: 140 }, { n: 7, x: 220 }, { n: 8, x: 300 },
  ];
  return (
    <g>
      <rect x={0} y={196} width={360} height={54} fill={GRASS} />
      {/* the answer glow: the two posts you READ */}
      <rect x={34} y={70} width={132} height={130} rx={12} fill="#F5D98F" opacity={0.4} />
      {/* rails behind the posts */}
      <rect x={30} y={112} width={300} height={10} fill={WOOD} stroke={WOOD_DARK} strokeWidth={1.5} />
      <rect x={30} y={152} width={300} height={10} fill={WOOD} stroke={WOOD_DARK} strokeWidth={1.5} />
      {posts.map(p => (
        <g key={p.n}>
          <rect x={p.x - 11} y={84} width={22} height={118} rx={4}
                fill="#A97C48" stroke={WOOD_DARK} strokeWidth={2} />
          <path d={`M ${p.x - 11} 84 L ${p.x} 72 L ${p.x + 11} 84 Z`}
                fill="#A97C48" stroke={WOOD_DARK} strokeWidth={2} strokeLinejoin="round" />
          <circle cx={p.x} cy={134} r={14} fill={PAPER} stroke={WOOD_DARK} strokeWidth={2} />
          <text x={p.x} y={141} textAnchor="middle" fontSize={18} fontWeight={900} fill={INK}>
            {p.n}
          </text>
        </g>
      ))}
      {/* the flag stands ON post 7, the bee hovers AT post 8 */}
      <FlagCharacter x={220} y={72} scale={0.9} />
      <Bee x={300} y={46} scale={1.0} />
      <text x={100} y={52} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>
        read these two →
      </text>
      {!quiz && (
        <g>
          <rect x={64} y={216} width={232} height={26} rx={13} fill={PAPER} stroke="#C9A227" strokeWidth={2} />
          <text x={180} y={234} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>
            5, 6, 7, 8 → 56 = 7 × 8
          </text>
        </g>
      )}
    </g>
  );
}

function SceneBeeAnatomy({ quiz = false }: { quiz?: boolean }) {
  // One big bee, side-on: six legs on the floor, four wings that
  // soar. Every leg and wing is drawn separately and numbered,
  // because countable is the whole point.
  const legX = [136, 162, 188, 214, 240, 266];
  return (
    <g>
      <rect x={0} y={206} width={360} height={44} fill={GRASS} />
      {/* four wings, two pairs, numbered */}
      {/* four wings fanning from two roots ON the bee's back —
          detached wings read as clouds, and clouds are not anatomy */}
      {[
        { root: [172, 92], rot: -64, n: 1 }, { root: [184, 88], rot: -30, n: 2 },
        { root: [208, 88], rot: 10, n: 3 }, { root: [220, 92], rot: 44, n: 4 },
      ].map(w => (
        <g key={w.n} transform={`rotate(${w.rot} ${w.root[0]} ${w.root[1]})`}>
          <ellipse cx={w.root[0]} cy={w.root[1] - 26} rx={12} ry={28} fill="#EAF2F6" opacity={0.9}
                   stroke="#8FA8B4" strokeWidth={2} />
          <text x={w.root[0]} y={w.root[1] - 34} textAnchor="middle" fontSize={12}
                fontWeight={800} fill="#44606C">
            {w.n}
          </text>
        </g>
      ))}
      {/* the body: head, thorax, striped abdomen */}
      <circle cx={96} cy={122} r={22} fill={BEE_GOLD} stroke={BEE_DARK} strokeWidth={3} />
      <circle cx={90} cy={116} r={4} fill={BEE_DARK} />
      <path d="M 84 100 Q 76 88 68 86 M 100 98 Q 98 84 104 78" fill="none"
            stroke={BEE_DARK} strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx={196} cy={128} rx={84} ry={44} fill={BEE_GOLD} stroke={BEE_DARK} strokeWidth={3} />
      {[158, 196, 234].map(sx => (
        <path key={sx} d={`M ${sx} 88 Q ${sx + 6} 128 ${sx} 168`} fill="none"
              stroke={BEE_DARK} strokeWidth={9} strokeLinecap="round" />
      ))}
      {/* six legs, numbered at the floor. Each leg starts ON the
          belly — computed from the ellipse edge, because a fixed
          height left the outer legs floating in air — and bends at a
          knee the way insect legs do. */}
      {legX.map((lx, i) => {
        const dx = (lx - 196) / 84;
        const beltY = 128 + 44 * Math.sqrt(Math.max(0, 1 - dx * dx)) - 3;
        const kneeX = lx - 7, kneeY = beltY + 20;
        const footX = lx - 3, footY = 204;
        return (
          <g key={lx}>
            <path d={`M ${lx} ${beltY} L ${kneeX} ${kneeY} L ${footX} ${footY}`}
                  fill="none" stroke={BEE_DARK} strokeWidth={4.5}
                  strokeLinecap="round" strokeLinejoin="round" />
            <text x={footX} y={226} textAnchor="middle" fontSize={12} fontWeight={800} fill={INK}>
              {i + 1}
            </text>
          </g>
        );
      })}
      <rect x={236} y={182} width={108} height={26} rx={13} fill={PAPER} stroke="#C9A227" strokeWidth={2} />
      <text x={290} y={200} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>
        legs 6 · wings 4
      </text>
      {!quiz && (
        <text x={52} y={52} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>
          8×8
        </text>
      )}
    </g>
  );
}

const SCENE_ART: Record<string, (props: { quiz?: boolean }) => JSX.Element> = {
  growing_shell: SceneGrowingShell,
  snail_mail: SceneSnailMail,
  honeycomb: SceneHoneycomb,
  star_quilt: SceneStarQuilt,
  famous_fence: SceneFamousFence,
  bee_anatomy: SceneBeeAnatomy,
};

export function CrowSceneArt({ code, quiz = false }: { code: string; quiz?: boolean }) {
  const Art = SCENE_ART[code];
  if (!Art) return null;
  return (
    <svg viewBox={VB} className="w-full"
         style={{ display: 'block', background: '#FBF6EA', borderRadius: 8 }}>
      <Art quiz={quiz} />
    </svg>
  );
}

/* ══ the alphabet card ══════════════════════════════════════════ */

function AlphabetCard() {
  return (
    <svg viewBox={VB} className="w-full" style={{ display: 'block', background: '#FBF6EA', borderRadius: 8 }}>
      <rect x={0} y={206} width={360} height={44} fill={GRASS} />
      {/* each citizen stands in front of its own ghost digit */}
      {[
        { d: 6, x: 56 }, { d: 7, x: 142 }, { d: 8, x: 228 }, { d: 9, x: 314 },
      ].map(({ d, x }) => (
        <text key={d} x={x} y={150} textAnchor="middle" fontSize={110} fontWeight={900}
              fill={INK} opacity={0.08}>{d}</text>
      ))}
      <Snail x={52} y={196} scale={0.95} shellDigit={6} />
      <FlagCharacter x={142} y={196} scale={1.3} />
      <Bee x={228} y={170} scale={1.5} />
      <Tadpole x={314} y={170} scale={1.5} />
      {[
        ['the Snail', 56], ['the Flag', 142], ['the Bee', 228], ['the Tadpole', 314],
      ].map(([name, x]) => (
        <text key={name as string} x={x as number} y={236} textAnchor="middle"
              fontSize={12} fontWeight={700} fill={INK}>{name}</text>
      ))}
      <text x={180} y={34} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>
        Four neighbors, four numbers
      </text>
    </svg>
  );
}

/* ══ teach mode ═════════════════════════════════════════════════ */

export default function CrowCache({
  learnerId, accuracy, initialCache = {}, muted, onToggleMute,
}: {
  learnerId: string;
  /** factKey → correct/total, from the workshop's shared ledger. */
  accuracy: Map<string, { correct: number; total: number }>;
  initialCache?: CrowCacheState;
  muted: boolean;
  onToggleMute: () => void;
}) {
  // null = the wall; 'alphabet' = the character card;
  // 'practice' = the quiz; else a scene code.
  const [open, setOpen] = useState<string | null>(null);
  const [cache, setCache] = useState<CrowCacheState>(initialCache);
  const goldKeys = useMemo(() => goldKeysOf(cache), [cache]);
  const scene = CROW_SCENES.find(s => s.code === open) ?? null;
  const idx = scene ? CROW_SCENES.indexOf(scene) : -1;

  // Speak the rhyme when a scene opens. Stop when it closes — a crow
  // that keeps talking over the next picture is a bug, not a bird.
  useEffect(() => {
    if (scene && !muted) speakRhyme(scene.rhyme);
    return () => stopSpeaking();
  }, [scene, muted]);

  return (
    <div>
      <AnimatePresence mode="wait">
        {open === null ? (
          <motion.div key="wall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* the crow and its claim */}
            <div className="rounded-2xl p-3 flex items-center gap-3 mb-3"
                 style={{ background: '#EADFC6' }}>
              <svg viewBox="-36 -38 76 64" width={76} height={64} className="shrink-0">
                <Crow x={0} y={0} scale={1.15} />
              </svg>
              <p className="text-[13px] leading-snug" style={{ color: INK }}>
                <b>Pip cuts numbers up. I remember the ones that won't cut.</b>{' '}
                A crow never forgets where it hid a seed — and I hid six
                pictures. That is all there are. Learn my pictures and the
                hard corner of the table is yours.
              </p>
              <button onClick={onToggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
                      className="rounded-full shrink-0 text-lg"
                      style={{ width: 44, height: 44, background: PAPER }}>
                {muted ? '🔇' : '🔊'}
              </button>
            </div>

            {cache.featherAt && (
              <div className="rounded-xl p-2 mb-3 flex items-center gap-2"
                   style={{ background: '#2E2B33' }}>
                <span className="text-xl" aria-hidden>🪶</span>
                <p className="text-[12px] font-bold" style={{ color: '#F5D98F' }}>
                  All six frames are gold. The crow left you its feather —
                  it does not do that for everyone.
                </p>
              </div>
            )}

            <button onClick={() => { setOpen('practice'); playPageTurn(); }}
                    className="w-full rounded-xl mb-3 font-bold text-sm"
                    style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52 }}>
              🌰 Practice the pictures
            </button>

            {/* the alphabet, then the six frames */}
            <button onClick={() => { setOpen('alphabet'); playPageTurn(); }}
                    className="w-full rounded-xl p-2 mb-3 text-left"
                    style={{ background: '#F4EDDC', border: `2px solid ${WOOD}` }}>
              <span className="text-[12px] font-bold px-1" style={{ color: INK }}>
                First: meet the four neighbors →
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {CROW_SCENES.map(s => {
                const gold = goldKeys.has(factKey(s.a, s.b));
                return (
                <button key={s.code}
                        onClick={() => { setOpen(s.code); playPageTurn(); }}
                        className="rounded-xl p-1.5 text-left"
                        style={{
                          background: gold ? '#C9A227' : WOOD,
                          border: `2px solid ${gold ? '#8A6534' : WOOD_DARK}`,
                          boxShadow: gold ? '0 0 0 2px #F5D98F' : undefined,
                        }}>
                  <CrowSceneArt code={s.code} />
                  <div className="flex items-baseline justify-between px-1 pt-1">
                    <span className="text-[11px] font-bold"
                          style={{ color: gold ? '#3A2E1E' : '#F4EDDC' }}>
                      {gold ? '★ ' : ''}{s.title}
                    </span>
                    <span className="text-[11px] font-bold"
                          style={{ color: gold ? '#3A2E1E' : '#F5D98F' }}>
                      {s.a}×{s.b}
                    </span>
                  </div>
                </button>
                );
              })}
            </div>

            {/* the nines live on her hands, not on the wall */}
            <button onClick={() => { setOpen('nines'); playPageTurn(); }}
                    className="w-full rounded-xl mt-3 p-3 text-left flex items-center gap-3"
                    style={{ background: '#2E4A7A', border: `2px solid ${WOOD_DARK}` }}>
              <span className="text-3xl" aria-hidden>🖐️🖐️</span>
              <span>
                <span className="block text-[13px] font-bold" style={{ color: '#F4EDDC' }}>
                  {FINGER_TRICK.title}
                </span>
                <span className="block text-[11px]" style={{ color: '#A9C0E0' }}>
                  every ×9, carried with you — no picture needed
                </span>
              </span>
            </button>
          </motion.div>
        ) : open === 'nines' ? (
          <motion.div key="nines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl p-3" style={{ background: PAPER, border: `2px solid ${WOOD}` }}>
            <FingerTrick muted={muted} onBack={() => setOpen(null)} />
          </motion.div>
        ) : open === 'practice' ? (
          <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CrowPractice
              learnerId={learnerId}
              accuracy={accuracy}
              goldKeys={goldKeys}
              onCache={setCache}
              onDone={() => setOpen(null)}
            />
          </motion.div>
        ) : open === 'alphabet' ? (
          <motion.div key="alpha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl p-3" style={{ background: PAPER, border: `2px solid ${WOOD}` }}>
            <AlphabetCard />
            <div className="mt-2 space-y-1">
              {CROW_ALPHABET.map(c => (
                <p key={c.digit} className="text-[13px]" style={{ color: INK }}>
                  <b>{c.digit} is {c.name}</b> — {c.why}.
                </p>
              ))}
            </div>
            <button onClick={() => setOpen(null)}
                    className="w-full rounded-xl mt-3 font-bold text-sm"
                    style={{ background: '#5A8C4A', color: '#FFF', minHeight: 48 }}>
              to the pictures →
            </button>
          </motion.div>
        ) : scene && (
          <motion.div key={scene.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl p-3" style={{ background: PAPER, border: `2px solid ${WOOD}` }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-base" style={{ color: INK }}>
                {scene.title} — <span style={{ color: '#5A8C4A' }}>{scene.a} × {scene.b} = {scene.product}</span>
              </h2>
              <button onClick={() => { if (!muted && scene) speakRhyme(scene.rhyme); }}
                      aria-label="Say the rhyme again"
                      className="rounded-full shrink-0 text-lg"
                      style={{ width: 44, height: 44, background: '#EADFC6' }}>
                🔊
              </button>
            </div>
            <CrowSceneArt code={scene.code} />
            <p className="text-[15px] font-bold leading-relaxed mt-3 px-1" style={{ color: INK }}>
              “{scene.rhyme}”
            </p>
            <p className="text-[13px] leading-relaxed mt-2 px-1" style={{ color: '#6B5C42' }}>
              {scene.derivation}
            </p>
            {scene.caution && (
              <p className="text-[13px] leading-relaxed mt-2 rounded-lg p-2"
                 style={{ background: '#EFE0B0', color: '#5A4520' }}>
                ⚠️ {scene.caution}
              </p>
            )}
            <p className="text-[12px] italic mt-2 px-1" style={{ color: '#8A7A5E' }}>
              And remember: {scene.b} × {scene.a} is the same picture.
              Six pictures cover the whole hard corner.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setOpen(null); }}
                      className="flex-1 rounded-xl font-bold text-sm"
                      style={{ background: '#EADFC6', color: INK, minHeight: 48 }}>
                ← the wall
              </button>
              {idx + 1 < CROW_SCENES.length && (
                <button onClick={() => { setOpen(CROW_SCENES[idx + 1].code); playPageTurn(); }}
                        className="flex-1 rounded-xl font-bold text-sm"
                        style={{ background: '#5A8C4A', color: '#FFF', minHeight: 48 }}>
                  next picture →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ practice — both directions, hints that are pictures ════════ */

function CrowPractice({
  learnerId, accuracy, goldKeys, onCache, onDone,
}: {
  learnerId: string;
  accuracy: Map<string, { correct: number; total: number }>;
  goldKeys: Set<string>;
  onCache: (c: CrowCacheState) => void;
  onDone: () => void;
}) {
  const [seed] = useState(() => Math.floor(Math.random() * 0xffff) + 1);
  const deck = useMemo(
    () => buildCrowDeck(accuracy, goldKeys, seed),
    // Deliberately frozen at mount: the deck must not reshuffle when
    // a result comes back and the gold set changes mid-round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed],
  );
  const [qi, setQi] = useState(0);
  const [retries, setRetries] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<Array<{
    factKey: string; kind: 'forward' | 'reverse'; correct: boolean; retries: number;
  }>>([]);
  const [outcome, setOutcome] = useState<{
    firstTry: number; newlyGold: string[]; newFeather: boolean;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const q = deck[qi] ?? null;

  const finish = async (all: typeof results) => {
    if (sending) return;
    setSending(true);
    const firstTry = all.filter(r => r.correct).length;
    try {
      const res = await fetch('/api/crow/practice', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, results: all }),
      });
      const d = await res.json();
      if (d.cache) onCache(d.cache);
      setOutcome({
        firstTry,
        newlyGold: d.newlyGold ?? [],
        newFeather: !!d.newFeather,
      });
      if ((d.newlyGold ?? []).length > 0 || d.newFeather) playSparkle();
    } catch {
      // The round still happened; the wall just could not hear about
      // it. Say so honestly.
      setOutcome({ firstTry, newlyGold: [], newFeather: false });
    } finally {
      setSending(false);
    }
  };

  const answer = (i: number) => {
    if (!q || picked !== null || outcome) return;
    if (i === q.correctIndex) {
      setPicked(i);
      playSparkle();
      const rec = {
        factKey: q.factKey, kind: q.kind,
        correct: retries === 0, retries,
      };
      window.setTimeout(() => {
        const all = [...results, rec];
        setResults(all);
        setPicked(null); setRetries(0); setShowHint(false);
        if (qi + 1 < deck.length) setQi(qi + 1);
        else finish(all);
      }, 650);
    } else {
      // A miss costs nothing and fades the PICTURE in — recalling the
      // scene is the act being practiced.
      setRetries(r => r + 1);
      setShowHint(true);
    }
  };

  if (outcome) {
    return (
      <div className="rounded-2xl p-4 text-center" style={{ background: PAPER, border: `2px solid ${WOOD}` }}>
        <h2 className="font-bold text-lg" style={{ color: INK }}>
          {outcome.firstTry} of {deck.length} on the first try.
        </h2>
        {outcome.newlyGold.length > 0 && (
          <div className="rounded-xl p-3 mt-3" style={{ background: '#F5D98F' }}>
            <p className="text-[13px] font-bold" style={{ color: '#5A4520' }}>
              ★ {outcome.newlyGold.map(k => k.replace('x', ' × ')).join(', ')}
              {outcome.newlyGold.length === 1 ? ' held across days — its frame is GOLD now.' : ' held across days — their frames are GOLD now.'}
            </p>
          </div>
        )}
        {outcome.newFeather && (
          <div className="rounded-xl p-3 mt-2 flex items-center gap-2" style={{ background: '#2E2B33' }}>
            <span className="text-2xl" aria-hidden>🪶</span>
            <p className="text-[13px] font-bold text-left" style={{ color: '#F5D98F' }}>
              Every frame is gold. The crow looked at you for a long
              moment — and left you its feather.
            </p>
          </div>
        )}
        <p className="text-[12px] italic mt-3" style={{ color: '#8A7A5E' }}>
          A frame turns gold when its fact holds on different days —
          come back tomorrow and see.
        </p>
        <button onClick={onDone}
                className="w-full rounded-xl mt-3 font-bold text-sm"
                style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52 }}>
          back to the wall
        </button>
      </div>
    );
  }

  if (!q) return null;
  return (
    <div className="rounded-2xl p-4" style={{ background: PAPER, border: `2px solid ${WOOD}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold" style={{ color: '#8A7A5E' }}>
          {qi + 1} of {deck.length}
        </span>
        <div className="flex gap-1">
          {deck.map((_, i) => (
            <span key={i} className="rounded-full"
                  style={{ width: 7, height: 7,
                           background: i < qi ? '#5A8C4A' : i === qi ? '#C9A227' : '#D8CEBA' }} />
          ))}
        </div>
      </div>

      {q.kind === 'forward' ? (
        <>
          <p className="text-2xl font-bold text-center my-3" style={{ color: INK }}>
            {q.a} × {q.b} = ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {q.choices.map((c, i) => (
              <button key={i} onClick={() => answer(i)}
                      className="rounded-xl font-bold text-xl"
                      style={{
                        background: picked === i ? '#5A8C4A' : '#F4EDDC',
                        color: picked === i ? '#FFF' : INK,
                        border: '1px solid #C9A227', minHeight: 60,
                        touchAction: 'manipulation',
                      }}>
                {c}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-xl font-bold text-center my-3" style={{ color: INK }}>
            <span className="text-3xl">{q.product}</span> — whose picture is this?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {q.choices.map((code, i) => (
              <button key={code} onClick={() => answer(i)}
                      className="rounded-xl p-1"
                      style={{
                        background: picked === i ? '#5A8C4A' : WOOD,
                        border: `2px solid ${WOOD_DARK}`,
                        touchAction: 'manipulation',
                      }}>
                <CrowSceneArt code={code} quiz />
                <span className="block text-center text-[10px] font-bold py-0.5"
                      style={{ color: '#F4EDDC' }}>
                  {getScene(code)?.title}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {showHint && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }}
                    className="mt-3 rounded-xl overflow-hidden"
                    style={{ border: '2px dashed #C9A227' }}>
          <CrowSceneArt code={q.sceneCode} quiz />
          <p className="text-[11px] text-center py-1" style={{ color: '#8A7A5E' }}>
            the crow taps its picture…
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ══ the nines — the finger trick, on interactive hands ═════════ */

function FingerTrick({ muted, onBack }: { muted: boolean; onBack: () => void }) {
  // Which finger (1–10) is folded. Starts unfolded: the first thing
  // she does is choose, which is the trick itself.
  const [folded, setFolded] = useState<number | null>(null);
  const fold = folded ? nineFold(folded) : null;

  useEffect(() => {
    if (!muted) speak(FINGER_TRICK.rhyme, { rate: 0.92, pitch: 1.1 });
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Finger geometry: two hands, five fingers each, heights like a
  // real hand (short pinky, tall middle). Numbered 1–10 left to
  // right, thumbs innermost — the counting order the trick needs.
  const H = [46, 62, 72, 66, 40];               // pinky → thumb, left hand
  const fingers = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const hand = i < 5 ? 0 : 1;
    const withinHand = i % 5;
    const x = 34 + i * 30 + hand * 22;
    const h = hand === 0 ? H[withinHand] : H[4 - withinHand];
    return { n, x, h, hand };
  });

  return (
    <div>
      <h2 className="font-bold text-base mb-1" style={{ color: INK }}>
        {FINGER_TRICK.title}
      </h2>
      <p className="text-[13px] leading-relaxed mb-2" style={{ color: '#6B5C42' }}>
        {FINGER_TRICK.intro}
      </p>

      <svg viewBox="0 0 360 240" className="w-full"
           style={{ display: 'block', background: '#FBF6EA', borderRadius: 8 }}>
        {/* palms */}
        <ellipse cx={106} cy={196} rx={78} ry={34} fill="#E8C9A8" stroke="#B08247" strokeWidth={2.5} />
        <ellipse cx={278} cy={196} rx={78} ry={34} fill="#E8C9A8" stroke="#B08247" strokeWidth={2.5} />

        {fingers.map(f => {
          const isFolded = folded === f.n;
          const tens = folded !== null && f.n < folded;
          const ones = folded !== null && f.n > folded;
          const baseY = 178;
          return (
            <g key={f.n}
               onClick={() => setFolded(cur => (cur === f.n ? null : f.n))}
               style={{ cursor: 'pointer', touchAction: 'manipulation' }}
               role="button" aria-label={`Fold finger ${f.n}`}>
              <rect x={f.x - 14} y={baseY - 90} width={28} height={96} fill="transparent" />
              {/* the tadpole hides behind the folded finger */}
              {isFolded && <Tadpole x={f.x} y={baseY - 44} scale={1.0} />}
              <rect x={f.x - 10} y={baseY - (isFolded ? 22 : f.h)}
                    width={20} height={isFolded ? 22 : f.h} rx={9}
                    fill={tens ? '#A9C68C' : ones ? '#F5D98F' : '#E8C9A8'}
                    stroke={isFolded ? '#8F3F30' : '#B08247'} strokeWidth={2.5} />
              {/* knuckle curl on the folded stub */}
              {isFolded && (
                <path d={`M ${f.x - 10} ${baseY - 22} Q ${f.x} ${baseY - 34} ${f.x + 10} ${baseY - 22}`}
                      fill="none" stroke="#8F3F30" strokeWidth={2.5} />
              )}
              <text x={f.x} y={baseY - (isFolded ? 4 : f.h - 16)} textAnchor="middle"
                    fontSize={13} fontWeight={800}
                    fill={isFolded ? '#8F3F30' : INK}>
                {f.n}
              </text>
            </g>
          );
        })}

        {/* the read-out, under the hands */}
        {fold && folded !== null ? (
          <g>
            <rect x={22} y={216} width={110} height={20} rx={10} fill="#A9C68C" />
            <text x={77} y={230} textAnchor="middle" fontSize={12} fontWeight={800} fill="#2E3820">
              tens: {fold.left}
            </text>
            <rect x={228} y={216} width={110} height={20} rx={10} fill="#F5D98F" />
            <text x={283} y={230} textAnchor="middle" fontSize={12} fontWeight={800} fill="#5A4520">
              ones: {fold.right}
            </text>
            <rect x={138} y={212} width={84} height={28} rx={14} fill={INK} />
            <text x={180} y={231} textAnchor="middle" fontSize={14} fontWeight={800} fill="#F5D98F">
              {folded} × 9 = {fold.product}
            </text>
          </g>
        ) : (
          <text x={180} y={230} textAnchor="middle" fontSize={13} fontWeight={700} fill="#8A7A5E">
            tap any finger to fold it
          </text>
        )}
      </svg>

      <p className="text-[15px] font-bold leading-relaxed mt-3 px-1" style={{ color: INK }}>
        “{FINGER_TRICK.rhyme}”
      </p>
      <p className="text-[13px] leading-relaxed mt-2 px-1" style={{ color: '#6B5C42' }}>
        {FINGER_TRICK.outro}
      </p>
      <button onClick={onBack}
              className="w-full rounded-xl mt-3 font-bold text-sm"
              style={{ background: '#EADFC6', color: INK, minHeight: 48 }}>
        ← the wall
      </button>
    </div>
  );
}
