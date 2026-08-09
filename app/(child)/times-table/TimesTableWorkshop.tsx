// app/(child)/times-table/TimesTableWorkshop.tsx
//
// The Times Table Workshop. Reteaching, not drilling.
//
// The data was specific: ×0–×5 at 87%, ×6–×10 at 66%, and every single
// miss involving a 6, 7, 8 or 9. More reps of the same drill would have
// been the obvious answer and the wrong one — she has already done 109
// attempts at that band.
//
// Two tools, and both of them are things you LOOK at.
//
//   THE CHART shows the whole table with what she already knows lit up,
//   folded along its diagonal. Tapping 7×6 lights 6×7 at the same time,
//   because they are one array seen two ways. She is currently missing
//   4×7 and 7×4, 9×6 and 6×9, 2×6 and 6×2 — three facts she is paying
//   for twice. Seeing the fold is worth more than any single fact.
//
//   THE SPLITTER is the real lesson. Nobody memorises 7×6. You cut the
//   array into 5 rows and 2 rows, and you already know both pieces:
//   30 and 12. She can move the cut herself and watch both halves
//   relabel. It turns a wall of memorisation into adding two numbers
//   she is fluent in — and, unlike a mnemonic, it is true of every fact
//   in the table and stays true into long multiplication.
//
// No timer anywhere in here. Speed is what she is bad at right now, and
// a clock on a thing you cannot do yet teaches you that you cannot do
// it.

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { playSparkle } from '@/lib/audio/sfx';
import PipChipmunk from '@/components/child/garden/PipChipmunk';
import { LearnTable, Practice, Flashcards } from './PipTools';
import {
  factKey, strategyFor, weakestFacts, type Fact,
} from '@/lib/packs/math/timesTable';

type Tool = 'learn' | 'split' | 'practice' | 'cards' | 'chart';

export default function TimesTableWorkshop({
  learnerId, accuracy,
}: {
  learnerId: string;
  /** factKey → [correct, total], already merged across mirrors. */
  accuracy: Record<string, [number, number]>;
}) {
  const [tool, setTool] = useState<Tool>('learn');
  // One mute switch for all of Pip's tools, not one per screen.
  const [muted, setMuted] = useState(false);

  const accMap = useMemo(() => {
    const m = new Map<string, { correct: number; total: number }>();
    for (const [k, [c, t]] of Object.entries(accuracy)) m.set(k, { correct: c, total: t });
    return m;
  }, [accuracy]);

  const weak = useMemo(() => weakestFacts(accMap, 8), [accMap]);
  // Fall back to the classically hardest facts before she has a record.
  const queue: Fact[] = weak.length
    ? weak.map(f => ({ a: f.a, b: f.b }))
    : [{ a: 6, b: 7 }, { a: 6, b: 8 }, { a: 7, b: 8 }, { a: 3, b: 8 }];

  return (
    <div className="min-h-screen" style={{ background: '#FBF6EA' }}>
      <div className="max-w-2xl mx-auto p-4 pb-16">

        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#3A2E1E' }}>
              Pip's Larder
            </h1>
            <p className="text-xs" style={{ color: '#8A7A5E' }}>
              The same number, over and over, until there's a pile.
            </p>
          </div>
          <Link href={`/garden?learner=${learnerId}`}
                className="text-sm rounded-xl px-3 py-2 shrink-0"
                style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 44,
                         display: 'inline-flex', alignItems: 'center' }}>
            ← garden
          </Link>
        </div>

        {/* Five tools is a lot for a seven-year-old, so they scroll in
            one row rather than wrapping into a wall of buttons. */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1"
             style={{ scrollbarWidth: 'none' }}>
          {([
            ['learn', '🔊 Count'],
            ['split', '✂️ Cut up'],
            ['practice', '🌰 Practise'],
            ['cards', '🃏 Cards'],
            ['chart', '▦ Table'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTool(k as Tool)}
              className="rounded-xl font-bold text-sm px-3 shrink-0"
              style={{
                minHeight: 48, touchAction: 'manipulation',
                background: tool === k ? '#5A8C4A' : '#EADFC6',
                color: tool === k ? '#FFF' : '#4A3B24',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tool === 'learn'    && <LearnTable muted={muted} onToggleMute={() => setMuted(m => !m)} />}
        {tool === 'split'    && <Splitter queue={queue} />}
        {tool === 'practice' && <Practice queue={queue} muted={muted} onToggleMute={() => setMuted(m => !m)} />}
        {tool === 'cards'    && <Flashcards queue={queue} muted={muted} onToggleMute={() => setMuted(m => !m)} />}
        {tool === 'chart'    && <Chart accuracy={accMap} />}
      </div>
    </div>
  );
}

/* ─── the splitter ────────────────────────────────────────────────── */

function Splitter({ queue }: { queue: Fact[] }) {
  const [idx, setIdx] = useState(0);
  const fact = queue[idx % queue.length];
  // Always show the larger factor as ROWS, so the cut is a horizontal
  // line through a tall array — easier to read than a vertical one.
  const rows = Math.max(fact.a, fact.b);
  const cols = Math.min(fact.a, fact.b);
  const strategy = strategyFor(fact.a, fact.b);

  const [cut, setCut] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const suggested = strategy.split && strategy.kind !== 'nines'
    ? strategy.split.top : Math.min(5, rows - 1);

  const reset = (nextIdx: number) => {
    setIdx(nextIdx); setCut(null); setRevealed(false);
  };

  const top = cut ?? 0;
  const bottom = rows - top;

  return (
    <div>
      <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1px solid #E0D4B8' }}>
        <div className="text-center mb-2">
          <div className="text-3xl font-bold" style={{ color: '#3A2E1E' }}>
            {rows} × {cols}
          </div>
          <p className="text-xs mt-1" style={{ color: '#8A7A5E' }}>
            {cut === null
              ? 'A big one. Cut it into two easy ones — tap a line.'
              : `${top} rows and ${bottom} rows.`}
          </p>
        </div>

        {/* the array, cuttable between any two rows */}
        <div className="flex justify-center my-3">
          <div>
            {Array.from({ length: rows }, (_, r) => (
              <div key={r}>
                <div className="flex gap-1.5 justify-center"
                     style={{ marginBottom: cut !== null && r + 1 === cut ? 26 : 4 }}>
                  {Array.from({ length: cols }, (_, c) => (
                    <motion.div
                      key={c}
                      initial={false}
                      animate={{
                        backgroundColor: cut === null ? '#9BC48A'
                          : r < cut ? '#5A8C4A' : '#D89A4A',
                      }}
                      style={{ width: 20, height: 20, borderRadius: 6 }}
                    />
                  ))}
                </div>
                {/* a tappable cut line under every row but the last */}
                {cut === null && r < rows - 1 && (
                  <button
                    onClick={() => { setCut(r + 1); playSparkle(); }}
                    className="w-full flex items-center justify-center"
                    style={{ height: 16, touchAction: 'manipulation' }}
                    aria-label={`cut after row ${r + 1}`}
                  >
                    <span style={{
                      display: 'block', height: 2, width: '100%',
                      background: r + 1 === suggested ? '#C86A3A' : '#E4D9C0',
                      borderRadius: 2,
                    }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {cut !== null && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 text-lg font-bold flex-wrap">
              <Piece n={top} cols={cols} colour="#5A8C4A" />
              <span style={{ color: '#8A7A5E' }}>+</span>
              <Piece n={bottom} cols={cols} colour="#D89A4A" />
              <span style={{ color: '#8A7A5E' }}>=</span>
              {revealed ? (
                <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                             style={{ color: '#3A2E1E', fontSize: 26 }}>
                  {rows * cols}
                </motion.span>
              ) : (
                <button
                  onClick={() => { setRevealed(true); playSparkle(); }}
                  className="rounded-xl px-4 font-bold text-sm"
                  style={{ background: '#5A8C4A', color: '#FFF', minHeight: 44,
                           touchAction: 'manipulation' }}
                >
                  add them
                </button>
              )}
            </div>

            <p className="text-xs text-center mt-3 leading-relaxed" style={{ color: '#6B5C42' }}>
              {top * cols} + {bottom * cols} = {rows * cols}, so <strong>{rows} × {cols} = {rows * cols}</strong>.
            </p>

            {revealed && (
              <p className="text-xs text-center mt-2 italic px-2" style={{ color: '#8A7A5E' }}>
                {strategy.explain}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setCut(null); setRevealed(false); }}
                className="flex-1 rounded-xl font-bold text-sm"
                style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 48,
                         touchAction: 'manipulation' }}
              >
                cut it somewhere else
              </button>
              <button
                onClick={() => reset(idx + 1)}
                className="flex-1 rounded-xl font-bold text-sm"
                style={{ background: '#5A8C4A', color: '#FFF', minHeight: 48,
                         touchAction: 'manipulation' }}
              >
                next one →
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <p className="text-[11px] text-center mt-3 px-4" style={{ color: '#8A7A5E' }}>
        Any cut works — that is the point. Try a silly one and the two
        pieces still add up.
      </p>
    </div>
  );
}

function Piece({ n, cols, colour }: { n: number; cols: number; colour: string }) {
  return (
    <span className="rounded-lg px-2 py-1" style={{ background: colour + '22', color: colour }}>
      {n}×{cols} = {n * cols}
    </span>
  );
}

/* ─── the chart ───────────────────────────────────────────────────── */

function Chart({ accuracy }: { accuracy: Map<string, { correct: number; total: number }> }) {
  const [sel, setSel] = useState<Fact | null>(null);
  const N = 9;

  const stateOf = (a: number, b: number) => {
    const v = accuracy.get(factKey(a, b));
    if (!v || v.total === 0) return 'unseen';
    const pct = v.correct / v.total;
    return pct >= 0.8 ? 'known' : pct >= 0.5 ? 'shaky' : 'weak';
  };

  return (
    <div>
      <div className="rounded-2xl p-3 overflow-x-auto"
           style={{ background: '#FFF', border: '1px solid #E0D4B8' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3, margin: '0 auto' }}>
          <tbody>
            <tr>
              <td />
              {Array.from({ length: N }, (_, i) => (
                <th key={i} className="text-[11px] font-bold" style={{ color: '#8A7A5E', width: 30 }}>
                  {i + 1}
                </th>
              ))}
            </tr>
            {Array.from({ length: N }, (_, r) => {
              const a = r + 1;
              return (
                <tr key={a}>
                  <th className="text-[11px] font-bold pr-1" style={{ color: '#8A7A5E' }}>{a}</th>
                  {Array.from({ length: N }, (_, c) => {
                    const b = c + 1;
                    const st = stateOf(a, b);
                    const isSel = sel && factKey(sel.a, sel.b) === factKey(a, b);
                    const onDiag = a === b;
                    return (
                      <td key={b}>
                        <button
                          onClick={() => setSel({ a, b })}
                          className="rounded-md text-[11px] font-bold w-full"
                          style={{
                            width: 30, height: 30, touchAction: 'manipulation',
                            background: st === 'unseen' ? '#F0E7D4'
                              : st === 'known' ? '#5A8C4A'
                              : st === 'shaky' ? '#E8C77A' : '#D96A4A',
                            color: st === 'known' || st === 'weak' ? '#FFF' : '#5C4E36',
                            outline: isSel ? '3px solid #3A2E1E' : onDiag ? '1px dashed #B8A882' : 'none',
                            opacity: sel && !isSel ? 0.55 : 1,
                          }}
                          aria-label={`${a} times ${b} is ${a * b}`}
                        >
                          {a * b}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex gap-3 justify-center mt-3 text-[10px]" style={{ color: '#8A7A5E' }}>
          {[['#5A8C4A', 'got it'], ['#E8C77A', 'wobbly'], ['#D96A4A', 'not yet'],
            ['#F0E7D4', 'not asked']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c,
                             display: 'inline-block' }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div
            className="rounded-2xl p-3 mt-3"
            style={{ background: '#FFF', border: '1px solid #E0D4B8' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <p className="text-center text-lg font-bold" style={{ color: '#3A2E1E' }}>
              {sel.a} × {sel.b} = {sel.a * sel.b}
              {sel.a !== sel.b && (
                <>
                  {'  and  '}
                  {sel.b} × {sel.a} = {sel.a * sel.b}
                </>
              )}
            </p>
            {sel.a !== sel.b && (
              <p className="text-xs text-center mt-1" style={{ color: '#6B5C42' }}>
                Same array, turned on its side. Learn one and you get the
                other free — so there are only <strong>36</strong> facts
                in here, not 81.
              </p>
            )}
            <p className="text-xs text-center mt-2 italic" style={{ color: '#8A7A5E' }}>
              {strategyFor(sel.a, sel.b).explain}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[11px] text-center mt-3 px-4" style={{ color: '#8A7A5E' }}>
        The dashed squares down the middle are the ones that only appear
        once — 6×6, 7×7, 8×8. Everything else has a twin.
      </p>
    </div>
  );
}
