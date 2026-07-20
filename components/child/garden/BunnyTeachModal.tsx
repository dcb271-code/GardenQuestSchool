'use client';

// The Burrow Bunny's fireside school. Tap the bunny → pick a topic →
// pick a lesson → a narrated slide deck of tips and mental-math
// strategies with visuals. TEACHING only — no questions, no scoring.

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNarrator } from '@/lib/audio/useNarrator';
import { playPageTurn, playSparkle } from '@/lib/audio/sfx';
import {
  lessonsForLevel, lessonTopics, type BunnyLesson, type LessonVisual,
} from '@/lib/world/bunnyLessons';

const INK = '#3F2614';

// ─── Typed lesson visuals (house-style SVG) ─────────────────────────

function TenFrame({ filled, extra = 0, leftOver = 0 }: { filled: number; extra?: number; leftOver?: number }) {
  return (
    <svg viewBox="0 0 350 120" className="w-full max-w-[340px] mx-auto">
      {Array.from({ length: 10 }).map((_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const x = 10 + col * 50, y = 12 + row * 50;
        const state = i < filled ? 'filled' : i < filled + extra ? 'extra' : 'empty';
        return (
          <g key={i}>
            <rect x={x} y={y} width={44} height={44} rx={8} fill="#FFFAF2" stroke={INK} strokeWidth={2} />
            {state !== 'empty' && (
              <circle cx={x + 22} cy={y + 22} r={14}
                      fill={state === 'filled' ? '#E8A87C' : '#95B88F'}
                      stroke={INK} strokeWidth={1.6} />
            )}
          </g>
        );
      })}
      {/* the remainder the lesson talks about — "and you have 3 left
          over" was described but never drawn */}
      {leftOver > 0 && (
        <g>
          <line x1={266} y1={18} x2={266} y2={102} stroke={INK} strokeWidth={1.4}
                strokeDasharray="4 4" opacity={0.5} />
          {Array.from({ length: leftOver }).map((_, i) => (
            <circle key={i} cx={296 + (i % 2) * 34} cy={34 + Math.floor(i / 2) * 40}
                    r={14} fill="#95B88F" stroke={INK} strokeWidth={1.6} />
          ))}
          <text x={310} y={114} textAnchor="middle" fontSize={11} fontWeight={700}
                fontStyle="italic" fill={INK} opacity={0.75}>left over</text>
        </g>
      )}
    </svg>
  );
}

function NumberLine({ from, to, hops, startAt }: { from: number; to: number; hops: number[]; startAt?: number }) {
  const W = 340, PAD = 20;
  const span = to - from;
  const xOf = (n: number) => PAD + ((n - from) / span) * (W - PAD * 2);
  let pos = startAt ?? from;
  const arcs = hops.map(h => { const a = pos; pos += h; return { a, b: pos, h }; });
  // Tick every integer only while they stay legible; otherwise step.
  const step = span <= 14 ? 1 : span <= 40 ? 5 : Math.ceil(span / 12 / 10) * 10;
  const ticks: number[] = [];
  for (let n = Math.ceil(from / step) * step; n <= to; n += step) ticks.push(n);
  return (
    <svg viewBox={`0 0 ${W} 118`} className="w-full max-w-[360px] mx-auto">
      <line x1={PAD - 8} y1={78} x2={W - PAD + 8} y2={78} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {ticks.map(n => (
        <g key={n}>
          <line x1={xOf(n)} y1={70} x2={xOf(n)} y2={78} stroke={INK} strokeWidth={2} />
          <text x={xOf(n)} y={96} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK}>{n}</text>
        </g>
      ))}
      {arcs.map((arc, i) => {
        const back = arc.h < 0;
        const mid = (xOf(arc.a) + xOf(arc.b)) / 2;
        // A step BACK is drawn under the line, so "one too far, step
        // back" reads as a different move, not another forward hop.
        const d = back
          ? `M ${xOf(arc.a)} 82 Q ${mid} 104 ${xOf(arc.b)} 82`
          : `M ${xOf(arc.a)} 70 Q ${mid} ${34 - Math.min(16, Math.abs(arc.h))} ${xOf(arc.b)} 70`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={back ? '#8A7E6C' : '#C34A36'} strokeWidth={2.6} strokeLinecap="round" />
            <text x={mid} y={back ? 116 : 28} textAnchor="middle" fontSize={12}
                  fontWeight={800} fill={back ? '#8A7E6C' : '#C34A36'}>
              {back ? `\u2212${Math.abs(arc.h)}` : `+${arc.h}`}
            </text>
          </g>
        );
      })}
      {startAt !== undefined && (
        <circle cx={xOf(startAt)} cy={78} r={5} fill="#95B88F" stroke={INK} strokeWidth={1.6} />
      )}
    </svg>
  );
}

function ArrayGrid({ rows, cols, splitAtCol, splitAtRow, rotate }: {
  rows: number; cols: number; splitAtCol?: number; splitAtRow?: number; rotate?: boolean;
}) {
  const CELL = 26, GAP = 6;
  const w = cols * (CELL + GAP) + GAP, h = rows * (CELL + GAP) + GAP;
  // When the grid is going to pivot, the viewBox has to be square or
  // the rotated array falls straight out of its own box — which is
  // exactly what the turn-around lesson was doing.
  const S = Math.max(w, h);
  const vb = rotate ? `0 0 ${S} ${S}` : `0 0 ${w} ${h}`;
  const ox = rotate ? (S - w) / 2 : 0;
  const oy = rotate ? (S - h) / 2 : 0;
  const dot = (r: number, c: number) => {
    const splitCol = splitAtCol !== undefined && splitAtCol > 0 && c >= splitAtCol;
    const splitRow = splitAtRow !== undefined && splitAtRow > 0 && r >= splitAtRow;
    return splitCol || splitRow ? '#95B88F' : '#E8A87C';
  };
  return (
    <div className="flex justify-center">
      <motion.svg
        viewBox={vb}
        style={{ width: rotate ? Math.min(240, S * 1.05) : Math.min(340, w * 1.1), height: 'auto' }}
        initial={rotate ? { rotate: 0 } : false}
        animate={rotate ? { rotate: 90 } : { rotate: 0 }}
        transition={{ duration: 1.3, ease: [0.22, 0.9, 0.34, 1], delay: rotate ? 0.7 : 0 }}
      >
        <g transform={`translate(${ox}, ${oy})`}>
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => (
              <circle
                key={`${r}-${c}`}
                cx={GAP + c * (CELL + GAP) + CELL / 2}
                cy={GAP + r * (CELL + GAP) + CELL / 2}
                r={CELL / 2}
                fill={dot(r, c)}
                stroke={INK} strokeWidth={1.6}
              />
            )),
          )}
          {splitAtCol !== undefined && splitAtCol > 0 && (
            <line
              x1={GAP / 2 + splitAtCol * (CELL + GAP)} y1={0}
              x2={GAP / 2 + splitAtCol * (CELL + GAP)} y2={h}
              stroke="#C34A36" strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round"
            />
          )}
          {splitAtRow !== undefined && splitAtRow > 0 && (
            <line
              x1={0} y1={GAP / 2 + splitAtRow * (CELL + GAP)}
              x2={w} y2={GAP / 2 + splitAtRow * (CELL + GAP)}
              stroke="#C34A36" strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round"
            />
          )}
        </g>
      </motion.svg>
    </div>
  );
}

/** A drawn carrot — the fair-sharing lesson used to deal out emoji. */
function Carrot({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M -6 -8 q -3 -8 -8 -12 M 0 -8 q 0 -9 -1 -14 M 6 -8 q 3 -8 8 -12"
            stroke="#6B8E5A" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M -7 -7 L 7 -7 L 1.5 24 q -1.5 4 -3 0 Z"
            fill="#E8A87C" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <line x1={-4.6} y1={1} x2={4.6} y2={1} stroke={INK} strokeWidth={0.8} opacity={0.4} />
      <line x1={-3.6} y1={9} x2={3.6} y2={9} stroke={INK} strokeWidth={0.8} opacity={0.4} />
    </g>
  );
}

function EqualGroups({ groups, per }: { groups: number; per: number }) {
  const bw = per * 22 + 16, bh = 52;
  const W = groups * (bw + 12);
  return (
    <svg viewBox={`0 0 ${W} ${bh + 16}`} className="w-full max-w-[340px] mx-auto">
      {Array.from({ length: groups }).map((_, g) => (
        <g key={g} transform={`translate(${g * (bw + 12) + 6}, 6)`}>
          <rect x={0} y={0} width={bw} height={bh} rx={12} fill="#FFFAF2" stroke={INK} strokeWidth={2} />
          {Array.from({ length: per }).map((__, i) => (
            <Carrot key={i} x={14 + i * 22} y={22} s={0.86} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Blocks({ tens, ones, tens2, ones2 }: { tens: number; ones: number; tens2?: number; ones2?: number }) {
  const Ten = ({ x, color }: { x: number; color: string }) => (
    <g transform={`translate(${x}, 0)`}>
      <rect x={0} y={0} width={16} height={90} rx={3} fill={color} stroke={INK} strokeWidth={1.6} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={0} y1={9 * (i + 1)} x2={16} y2={9 * (i + 1)} stroke={INK} strokeWidth={0.7} opacity={0.5} />
      ))}
    </g>
  );
  // Ones sit in a tidy 2-wide column bottom-aligned with the rods, so
  // "four ones" reads as one quantity instead of 3-and-a-stray.
  const onesW = (o: number) => (o > 0 ? Math.min(2, o) * 18 + 6 : 0);
  const groupW = (n: number, o: number) => n * 22 + onesW(o) + 10;
  const Ones = ({ n, x, color }: { n: number; x: number; color: string }) => (
    <g transform={`translate(${x}, 0)`}>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={(i % 2) * 18} y={76 - Math.floor(i / 2) * 18}
              width={14} height={14} rx={3} fill={color} stroke={INK} strokeWidth={1.4} />
      ))}
    </g>
  );
  const w1 = groupW(tens, ones);
  const total = tens2 !== undefined ? w1 + groupW(tens2 ?? 0, ones2 ?? 0) + 28 : w1;
  return (
    <svg viewBox={`0 0 ${total} 104`} className="mx-auto" style={{ width: Math.min(340, total * 1.5), height: 'auto' }}>
      <g transform="translate(6, 6)">
        {Array.from({ length: tens }).map((_, i) => <Ten key={i} x={i * 22} color="#E8A87C" />)}
        <Ones n={ones} x={tens * 22 + 6} color="#E8A87C" />
      </g>
      {tens2 !== undefined && (
        <>
          <text x={w1 + 6} y={58} fontSize={22} fontWeight={800} fill={INK}>+</text>
          <g transform={`translate(${w1 + 26}, 6)`}>
            {Array.from({ length: tens2 }).map((_, i) => <Ten key={i} x={i * 22} color="#95B88F" />)}
            <Ones n={ones2 ?? 0} x={(tens2 ?? 0) * 22 + 6} color="#95B88F" />
          </g>
        </>
      )}
    </svg>
  );
}

function Pie({ num, den, second }: { num: number; den: number; second?: { num: number; den: number } }) {
  const draw = (n: number, d: number, cx: number) => {
    const R = 44;
    const slices = Array.from({ length: d }).map((_, i) => {
      const a0 = (i / d) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
      const large = 1 / d > 0.5 ? 1 : 0;
      return (
        <path key={i}
          d={`M ${cx} 50 L ${cx + R * Math.cos(a0)} ${50 + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(a1)} ${50 + R * Math.sin(a1)} Z`}
          fill={i < n ? '#FFB7C5' : '#FFFAF2'} stroke={INK} strokeWidth={1.8} />
      );
    });
    return (
      <g>
        {slices}
        <text x={cx} y={112} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>
          {n}/{d}
        </text>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 240 122" className="w-full max-w-[300px] mx-auto">
      {draw(num, den, 60)}
      {second && <text x={120} y={58} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>vs</text>}
      {second && draw(second.num, second.den, 180)}
    </svg>
  );
}

/** The clock the fives lesson always claimed to be about.
 *  Radii step cleanly inward — case, face, minute numbers, ticks,
 *  numerals, hand — so nothing lands on top of anything else. */
function Clock({ minuteHandOn }: { minuteHandOn: number }) {
  const CX = 150, CY = 100;
  const CASE = 92, FACE = 84, MINS = 73, TICK = 62, NUMS = 45, HAND = 34, HOUR = 22;
  const ang = (n: number) => (n / 12) * Math.PI * 2 - Math.PI / 2;
  const px = (n: number, r: number) => CX + r * Math.cos(ang(n));
  const py = (n: number, r: number) => CY + r * Math.sin(ang(n));
  const target = ((minuteHandOn - 1) % 12) + 1;
  const minutes = target * 5;
  // Sweep from noon round to the hand: "how far the hand has travelled"
  // and "how many fives" are literally the same arc.
  const sweep = `M ${CX} ${CY - TICK + 8} A ${TICK - 8} ${TICK - 8} 0 ${target > 6 ? 1 : 0} 1 ${px(target, TICK - 8)} ${py(target, TICK - 8)}`;
  return (
    <svg viewBox="0 0 300 232" className="w-full max-w-[300px] mx-auto">
      {/* feet + shadow, so it sits on the burrow shelf */}
      <ellipse cx={CX} cy={196} rx={78} ry={6} fill="#000" opacity={0.13} />
      <path d="M 104 182 q -5 12 5 12 l 20 0 q 10 0 5 -12 Z" fill="#8B5A2B" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M 171 182 q -5 12 5 12 l 20 0 q 10 0 5 -12 Z" fill="#8B5A2B" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      {/* the little bell on top */}
      <circle cx={CX} cy={CY - CASE - 4} r={8} fill="#E8A87C" stroke={INK} strokeWidth={1.6} />
      {/* wooden case, then the cream dial */}
      <circle cx={CX} cy={CY} r={CASE} fill="#8B5A2B" stroke={INK} strokeWidth={2} />
      <circle cx={CX} cy={CY} r={FACE} fill="#FFFAF2" stroke={INK} strokeWidth={1.8} />

      {/* every minute ticked, so five-at-a-time is countable by eye */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const big = i % 5 === 0;
        return (
          <line key={i}
                x1={CX + (TICK - (big ? 9 : 4)) * Math.cos(a)} y1={CY + (TICK - (big ? 9 : 4)) * Math.sin(a)}
                x2={CX + TICK * Math.cos(a)} y2={CY + TICK * Math.sin(a)}
                stroke={INK} strokeWidth={big ? 2 : 0.9} opacity={big ? 0.9 : 0.4} />
        );
      })}

      {/* how far round the hand has gone */}
      <path d={sweep} fill="none" stroke="#E8A87C" strokeWidth={8} strokeLinecap="round" opacity={0.5} />

      {/* the minute each numeral really means, on its own ring */}
      {Array.from({ length: 12 }).map((_, i) => {
        const n = i + 1, on = n === target;
        return (
          <g key={n}>
            <text x={px(n, MINS)} y={py(n, MINS) + 3.6} textAnchor="middle"
                  fontSize={10} fontWeight={800} fill={on ? '#C34A36' : INK}
                  opacity={on ? 1 : 0.4}>{n * 5}</text>
            <text x={px(n, NUMS)} y={py(n, NUMS) + 5.5} textAnchor="middle"
                  fontSize={16} fontWeight={800} fill={on ? '#C34A36' : INK}>{n}</text>
          </g>
        );
      })}

      {/* hands — the big hand stops short of the numeral it points at */}
      <line x1={CX} y1={CY} x2={px(1, HOUR)} y2={py(1, HOUR)}
            stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <line x1={CX} y1={CY} x2={px(target, HAND)} y2={py(target, HAND)}
            stroke="#C34A36" strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={5} fill={INK} />

      <text x={CX} y={224} textAnchor="middle" fontSize={15} fontWeight={800} fill="#C34A36">
        {target} × 5 = {minutes} minutes past
      </text>
    </svg>
  );
}

/** Two aligned columns of facts. An equations list collapses runs of
 *  spaces, so the fives table used to arrive as one jumbled line. */
function FactTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mx-auto w-fit grid grid-cols-2 gap-x-7 gap-y-1.5">
      {rows.flat().map((cell, i) => (
        <div key={i} className="font-mono text-[19px] text-right" style={{ fontWeight: 700, color: INK }}>
          {cell}
        </div>
      ))}
    </div>
  );
}

function Equations({ lines, highlight }: { lines: string[]; highlight?: number }) {
  // Several slides use this for a plain-English aside. Set in 22px
  // monospace those read as broken equations, so give prose its own
  // voice.
  const isProse = (l: string) => /[a-z]{3,}/.test(l);
  return (
    <div className="space-y-1.5 text-center">
      {lines.map((l, i) => {
        const prose = isProse(l);
        return (
          <div
            key={i}
            className={`${prose ? 'font-display italic text-[17px]' : 'font-mono text-[22px]'} ${
              i === highlight ? 'bg-ochre/25 rounded-xl px-3 py-1 inline-block' : ''
            }`}
            style={{ fontWeight: i === highlight ? 800 : prose ? 500 : 600, color: INK }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
}

export function LessonVisualView({ visual }: { visual: LessonVisual }) {
  switch (visual.kind) {
    case 'ten_frame': return <TenFrame filled={visual.filled} extra={visual.extra} leftOver={visual.leftOver} />;
    case 'number_line': return <NumberLine from={visual.from} to={visual.to} hops={visual.hops} startAt={visual.startAt} />;
    case 'array': return <ArrayGrid rows={visual.rows} cols={visual.cols} splitAtCol={visual.splitAtCol} splitAtRow={visual.splitAtRow} rotate={visual.rotate} />;
    case 'equal_groups': return <EqualGroups groups={visual.groups} per={visual.per} />;
    case 'blocks': return <Blocks tens={visual.tens} ones={visual.ones} tens2={visual.tens2} ones2={visual.ones2} />;
    case 'pie': return <Pie num={visual.num} den={visual.den} second={visual.second} />;
    case 'equations': return <Equations lines={visual.lines} highlight={visual.highlight} />;
    case 'clock': return <Clock minuteHandOn={visual.minuteHandOn} />;
    case 'fact_table': return <FactTable rows={visual.rows} />;
  }
}

// ─── The modal ──────────────────────────────────────────────────────

type Phase = 'topics' | 'lessons' | 'slides' | 'done';

export default function BunnyTeachModal({
  open, learnerLevel, onClose,
}: {
  open: boolean;
  learnerLevel: number;
  onClose: () => void;
}) {
  const available = useMemo(() => lessonsForLevel(learnerLevel), [learnerLevel]);
  const topics = useMemo(() => lessonTopics(available), [available]);
  const [phase, setPhase] = useState<Phase>('topics');
  const [topic, setTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<BunnyLesson | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  const slide = lesson?.slides[slideIdx] ?? null;
  useNarrator(open && phase === 'slides' && slide ? slide.text : '', false);

  const reset = () => { setPhase('topics'); setTopic(null); setLesson(null); setSlideIdx(0); };
  const close = () => { reset(); onClose(); };

  const TOPIC_EMOJI: Record<string, string> = {
    'adding': '➕', 'taking away': '➖', 'times tables': '✖️',
    'dividing': '➗', 'big numbers': '💯', 'fractions': '🍰',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(20,25,40,0.4), rgba(20,25,40,0.6))', backdropFilter: 'blur(2px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="text-4xl">🐰</div>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                the burrow bunny&apos;s
              </div>
              <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                <span className="italic text-forest">
                  {phase === 'slides' && lesson ? lesson.title.toLowerCase() : 'little school'}
                </span>
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {phase === 'topics' && (
                <motion.div key="topics" className="space-y-3"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="font-display italic text-[15px] text-bark/75 text-center">
                    What would you like to learn a trick about today?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {topics.map(t => (
                      <motion.button
                        key={t}
                        onClick={() => { playPageTurn(); setTopic(t); setPhase('lessons'); }}
                        className="bg-white border-4 border-ochre rounded-2xl py-4 font-display text-[16px] text-bark hover:bg-ochre/10"
                        style={{ touchAction: 'manipulation', minHeight: 64, fontWeight: 600 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <span className="text-2xl mr-2">{TOPIC_EMOJI[t] ?? '✨'}</span>{t}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === 'lessons' && topic && (
                <motion.div key="lessons" className="space-y-2.5"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {available.filter(l => l.topic === topic).map(l => (
                    <motion.button
                      key={l.code}
                      onClick={() => { playPageTurn(); setLesson(l); setSlideIdx(0); setPhase('slides'); }}
                      className="w-full text-left bg-white border-4 border-ochre rounded-2xl px-4 py-3 font-display text-[16px] text-bark hover:bg-ochre/10 flex items-center gap-3"
                      style={{ touchAction: 'manipulation', minHeight: 58, fontWeight: 600 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{l.emoji}</span>
                      {l.title}
                    </motion.button>
                  ))}
                  <button
                    onClick={() => setPhase('topics')}
                    className="w-full font-display italic text-[13px] text-bark/60 underline"
                    style={{ touchAction: 'manipulation', minHeight: 36 }}
                  >← different topic</button>
                </motion.div>
              )}

              {phase === 'slides' && lesson && slide && (
                <motion.div key={`s-${slideIdx}`} className="space-y-4"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}>
                  <div className="bg-white/80 border-2 border-ochre/40 rounded-2xl p-4">
                    <LessonVisualView visual={slide.visual} />
                  </div>
                  <p className="font-display text-[17px] text-bark/85 leading-relaxed text-center">
                    {slide.text}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => slideIdx > 0 ? setSlideIdx(slideIdx - 1) : setPhase('lessons')}
                      className="bg-white border-2 border-ochre rounded-full px-5 py-2.5 font-display italic text-bark/70"
                      style={{ touchAction: 'manipulation', minHeight: 48 }}
                    >← back</button>
                    <div className="flex gap-1.5">
                      {lesson.slides.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i <= slideIdx ? 'bg-forest' : 'bg-ochre/40'}`} />
                      ))}
                    </div>
                    <motion.button
                      onClick={() => {
                        if (slideIdx < lesson.slides.length - 1) { playPageTurn(); setSlideIdx(slideIdx + 1); }
                        else { playSparkle(); setPhase('done'); }
                      }}
                      className="bg-forest text-white rounded-full px-6 py-2.5 font-display"
                      style={{ touchAction: 'manipulation', minHeight: 48, fontWeight: 600 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {slideIdx < lesson.slides.length - 1 ? 'next →' : 'got it! ✓'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {phase === 'done' && lesson && (
                <motion.div key="done" className="space-y-4 text-center py-2"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="text-5xl">{lesson.emoji}</div>
                  <p className="font-display italic text-[16px] text-bark/80 leading-snug">
                    Now you know the bunny&apos;s trick! Try using it next time you practice — tricks get stronger every time you use them.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { reset(); }}
                      className="flex-1 bg-white border-4 border-ochre rounded-full py-3.5 font-display text-bark/75"
                      style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                    >another trick</button>
                    <button
                      onClick={close}
                      className="flex-1 bg-forest text-white rounded-full py-3.5 font-display"
                      style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                    >back to the burrow</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
