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

function TenFrame({ filled, extra = 0 }: { filled: number; extra?: number }) {
  return (
    <svg viewBox="0 0 260 110" className="w-full max-w-[320px] mx-auto">
      {Array.from({ length: 10 }).map((_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const x = 10 + col * 50, y = 8 + row * 50;
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
    </svg>
  );
}

function NumberLine({ from, to, hops, startAt }: { from: number; to: number; hops: number[]; startAt?: number }) {
  const W = 320, PAD = 18;
  const span = to - from;
  const xOf = (n: number) => PAD + ((n - from) / span) * (W - PAD * 2);
  let pos = startAt ?? from;
  const arcs = hops.map(h => { const a = pos; pos += h; return { a, b: pos, h }; });
  return (
    <svg viewBox={`0 0 ${W} 100`} className="w-full max-w-[360px] mx-auto">
      <line x1={PAD - 8} y1={70} x2={W - PAD + 8} y2={70} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {Array.from({ length: span + 1 }).map((_, i) => {
        const n = from + i;
        const major = n % 5 === 0 || span <= 12;
        return (
          <g key={n}>
            <line x1={xOf(n)} y1={major ? 62 : 66} x2={xOf(n)} y2={70} stroke={INK} strokeWidth={major ? 2 : 1.2} />
            {major && <text x={xOf(n)} y={88} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK}>{n}</text>}
          </g>
        );
      })}
      {arcs.map((arc, i) => (
        <g key={i}>
          <path d={`M ${xOf(arc.a)} 62 Q ${(xOf(arc.a) + xOf(arc.b)) / 2} ${28 - Math.min(14, arc.h)} ${xOf(arc.b)} 62`}
                fill="none" stroke="#C34A36" strokeWidth={2.6} strokeLinecap="round" />
          <text x={(xOf(arc.a) + xOf(arc.b)) / 2} y={22} textAnchor="middle" fontSize={12}
                fontWeight={800} fill="#C34A36">+{arc.h}</text>
        </g>
      ))}
      {startAt !== undefined && (
        <circle cx={xOf(startAt)} cy={70} r={5} fill="#95B88F" stroke={INK} strokeWidth={1.6} />
      )}
    </svg>
  );
}

function ArrayGrid({ rows, cols, splitAtCol, rotate }: { rows: number; cols: number; splitAtCol?: number; rotate?: boolean }) {
  const CELL = 26, GAP = 6;
  const w = cols * (CELL + GAP) + GAP, h = rows * (CELL + GAP) + GAP;
  return (
    <div className="flex justify-center">
      <motion.svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: Math.min(340, w * 1.1), height: 'auto' }}
        animate={rotate ? { rotate: 90 } : { rotate: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 0.9, 0.34, 1], delay: rotate ? 0.6 : 0 }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => (
            <circle
              key={`${r}-${c}`}
              cx={GAP + c * (CELL + GAP) + CELL / 2}
              cy={GAP + r * (CELL + GAP) + CELL / 2}
              r={CELL / 2}
              fill={splitAtCol !== undefined && splitAtCol > 0 && c >= splitAtCol ? '#95B88F' : '#E8A87C'}
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
      </motion.svg>
    </div>
  );
}

function EqualGroups({ groups, per, emoji }: { groups: number; per: number; emoji: string }) {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {Array.from({ length: groups }).map((_, g) => (
        <div key={g} className="bg-white border-2 rounded-2xl px-3 py-2 text-center"
             style={{ borderColor: INK }}>
          <div className="text-xl leading-tight" style={{ maxWidth: 90 }}>
            {Array.from({ length: per }).map((__, i) => <span key={i}>{emoji}</span>)}
          </div>
        </div>
      ))}
    </div>
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
  const One = ({ x, y, color }: { x: number; y: number; color: string }) => (
    <rect x={x} y={y} width={14} height={14} rx={3} fill={color} stroke={INK} strokeWidth={1.4} />
  );
  const groupW = (n: number, o: number) => n * 22 + Math.ceil(o / 3) * 18 + 20;
  const w1 = groupW(tens, ones);
  const total = tens2 !== undefined ? w1 + groupW(tens2 ?? 0, ones2 ?? 0) + 30 : w1;
  return (
    <svg viewBox={`0 0 ${total} 104`} className="mx-auto" style={{ width: Math.min(360, total * 1.4), height: 'auto' }}>
      <g transform="translate(6, 6)">
        {Array.from({ length: tens }).map((_, i) => <Ten key={i} x={i * 22} color="#E8A87C" />)}
        {Array.from({ length: ones }).map((_, i) => (
          <One key={i} x={tens * 22 + 6 + Math.floor(i / 3) * 18} y={72 - (i % 3) * 18} color="#E8A87C" />
        ))}
      </g>
      {tens2 !== undefined && (
        <>
          <text x={w1 + 8} y={58} fontSize={22} fontWeight={800} fill={INK}>+</text>
          <g transform={`translate(${w1 + 28}, 6)`}>
            {Array.from({ length: tens2 }).map((_, i) => <Ten key={i} x={i * 22} color="#95B88F" />)}
            {Array.from({ length: ones2 ?? 0 }).map((_, i) => (
              <One key={i} x={(tens2 ?? 0) * 22 + 6 + Math.floor(i / 3) * 18} y={72 - (i % 3) * 18} color="#95B88F" />
            ))}
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
    return <g>{slices}</g>;
  };
  return (
    <svg viewBox="0 0 240 100" className="w-full max-w-[300px] mx-auto">
      {draw(num, den, 60)}
      {second && <text x={120} y={58} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>vs</text>}
      {second && draw(second.num, second.den, 180)}
    </svg>
  );
}

function Equations({ lines, highlight }: { lines: string[]; highlight?: number }) {
  return (
    <div className="space-y-1.5 text-center">
      {lines.map((l, i) => (
        <div
          key={i}
          className={`font-mono text-[22px] ${i === highlight ? 'bg-ochre/25 rounded-xl px-3 py-1 inline-block' : ''}`}
          style={{ fontWeight: i === highlight ? 800 : 600, color: INK }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}

export function LessonVisualView({ visual }: { visual: LessonVisual }) {
  switch (visual.kind) {
    case 'ten_frame': return <TenFrame filled={visual.filled} extra={visual.extra} />;
    case 'number_line': return <NumberLine from={visual.from} to={visual.to} hops={visual.hops} startAt={visual.startAt} />;
    case 'array': return <ArrayGrid rows={visual.rows} cols={visual.cols} splitAtCol={visual.splitAtCol} rotate={visual.rotate} />;
    case 'equal_groups': return <EqualGroups groups={visual.groups} per={visual.per} emoji={visual.emoji} />;
    case 'blocks': return <Blocks tens={visual.tens} ones={visual.ones} tens2={visual.tens2} ones2={visual.ones2} />;
    case 'pie': return <Pie num={visual.num} den={visual.den} second={visual.second} />;
    case 'equations': return <Equations lines={visual.lines} highlight={visual.highlight} />;
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
