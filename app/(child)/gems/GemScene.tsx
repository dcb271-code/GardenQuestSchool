'use client';

// The study table. Unit list → teach pages → exercises → the result,
// in the bird module's footsteps but simpler: gems neither sing nor
// fly away, so there is no audio and no photos — the crystal-habit
// drawings the display case already proved carry the art.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GemSpecimen from '@/components/child/garden/GemSpecimen';
import { getGem, HARDNESS_TESTS } from '@/lib/world/gemCatalog';
import { playSparkle, playPageTurn, playHarvest } from '@/lib/audio/sfx';
import {
  GEM_UNITS, buildExercises, unitPassed,
  type GemUnit, type GemExercise, type GemTeachPage,
} from '@/lib/gems/curriculum';

type Phase = 'list' | 'teach' | 'exercise' | 'done';

interface Result { exerciseKind: string; correct: boolean; retries: number }

const PAPER = '#FFFAF2';
const INK = '#3f2614';
const GOLD = '#C9A227';
const ROCK = '#2A2430';
const ROCK_CARD = '#3A3244';

export default function GemScene({
  learnerId, initialCompleted,
}: {
  learnerId: string;
  initialCompleted: string[];
}) {
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [phase, setPhase] = useState<Phase>('list');
  const [unit, setUnit] = useState<GemUnit | null>(null);
  const [page, setPage] = useState(0);
  const [exIndex, setExIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [retries, setRetries] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [outcome, setOutcome] = useState<{
    passed: boolean; correctCount: number; stoneCode: string | null;
  } | null>(null);
  const [sending, setSending] = useState(false);

  // A fresh seed per run — the same unit asks different questions
  // next time, which is what makes a re-read worth doing.
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 0xffff) + 1);
  const exercises = useMemo(
    () => (unit ? buildExercises(unit, seed) : []),
    [unit, seed],
  );
  const ex = exercises[exIndex] ?? null;

  const start = (u: GemUnit) => {
    setUnit(u); setPage(0); setExIndex(0); setResults([]);
    setRetries(0); setPicked(null); setShowHint(false); setOutcome(null);
    setSeed(Math.floor(Math.random() * 0xffff) + 1);
    setPhase('teach');
    playPageTurn();
  };

  const answer = (i: number) => {
    if (!ex || picked !== null) return;
    if (i === ex.correctIndex) {
      setPicked(i);
      playSparkle();
      window.setTimeout(() => {
        setResults(r => [...r, { exerciseKind: ex.kind, correct: retries === 0, retries }]);
        setPicked(null); setRetries(0); setShowHint(false);
        if (exIndex + 1 < exercises.length) setExIndex(exIndex + 1);
        else finish([...results, { exerciseKind: ex.kind, correct: retries === 0, retries }]);
      }, 700);
    } else {
      // A wrong tap costs nothing but shows the hint — the hint is
      // the teaching, and she goes again.
      setRetries(r => r + 1);
      setShowHint(true);
    }
  };

  const finish = async (all: Result[]) => {
    if (!unit || sending) return;
    setSending(true);
    setPhase('done');
    const correctCount = all.filter(r => r.correct).length;
    try {
      const res = await fetch('/api/gems/practice', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, unitCode: unit.code, results: all }),
      });
      const d = await res.json();
      setOutcome({
        passed: !!d.passed,
        correctCount: d.correctCount ?? correctCount,
        stoneCode: d.stoneCode ?? null,
      });
      if (d.completed) setCompleted(d.completed);
      if (d.stoneCode) playHarvest();
    } catch {
      // The attempt at truth: local result, no stone claim.
      setOutcome({ passed: unitPassed(correctCount, all.length), correctCount, stoneCode: null });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: ROCK }}>
      <div className="max-w-2xl mx-auto p-4 pb-16">

        {/* ── header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          {phase === 'list' ? (
            <Link href={`/garden/habitat/crystal_cavern?learner=${learnerId}`}
                  className="rounded-full px-4 py-2 font-bold text-sm no-underline"
                  style={{ background: ROCK_CARD, color: '#E4D3A8', minHeight: 44,
                           display: 'inline-flex', alignItems: 'center' }}>
              ← the cavern
            </Link>
          ) : (
            <button onClick={() => { setPhase('list'); setUnit(null); }}
                    className="rounded-full px-4 py-2 font-bold text-sm"
                    style={{ background: ROCK_CARD, color: '#E4D3A8', minHeight: 44 }}>
              ← all lessons
            </button>
          )}
          <h1 className="font-bold text-base" style={{ color: '#F0DFAE' }}>
            💎 The Study Table
          </h1>
        </div>

        {/* ── the unit list ──────────────────────────────────────── */}
        {phase === 'list' && (
          <div className="space-y-3">
            <p className="text-xs italic" style={{ color: '#9A8C76' }}>
              Four lessons on the stones under Kentucky. Finish one for
              the first time and the seam pays you its stone.
            </p>
            {GEM_UNITS.map(u => {
              const done = completed.includes(u.code);
              const reward = getGem(u.rewardStone);
              return (
                <button key={u.code} onClick={() => start(u)}
                        className="w-full rounded-2xl p-4 text-left flex gap-3 items-center"
                        style={{ background: PAPER, border: `2px solid ${done ? '#6b8e5a' : GOLD}` }}>
                  {reward && (
                    <div className="shrink-0 rounded-xl" style={{ background: '#E4DCC8', padding: 4 }}>
                      <GemSpecimen gem={reward} size={56} ghost={!done} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-bold text-sm" style={{ color: INK }}>{u.title}</h2>
                      {done && (
                        <span className="text-[10px] rounded-full px-1.5"
                              style={{ background: '#5A8C4A', color: '#FFF' }}>learned</span>
                      )}
                    </div>
                    <p className="text-[11px] leading-snug mt-0.5" style={{ color: '#6B5C42' }}>
                      {u.blurb}
                    </p>
                    {!done && reward && (
                      <p className="text-[10px] italic mt-1" style={{ color: '#8A7A5E' }}>
                        pays one {reward.name.toLowerCase()}
                      </p>
                    )}
                  </div>
                  <span className="text-lg" style={{ color: '#8A7A5E' }}>→</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── teach pages ────────────────────────────────────────── */}
        {phase === 'teach' && unit && (
          <TeachView
            unit={unit}
            page={page}
            onBack={() => { if (page > 0) { setPage(page - 1); playPageTurn(); } }}
            onNext={() => {
              if (page + 1 < unit.teach.length) { setPage(page + 1); playPageTurn(); }
              else { setPhase('exercise'); playPageTurn(); }
            }}
          />
        )}

        {/* ── exercises ──────────────────────────────────────────── */}
        {phase === 'exercise' && unit && ex && (
          <div className="rounded-2xl p-4" style={{ background: PAPER }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold" style={{ color: '#8A7A5E' }}>
                {exIndex + 1} of {exercises.length}
              </span>
              <div className="flex gap-1">
                {exercises.map((_, i) => (
                  <span key={i} className="rounded-full"
                        style={{ width: 7, height: 7,
                                 background: i < exIndex ? '#6b8e5a' : i === exIndex ? GOLD : '#D8CEBA' }} />
                ))}
              </div>
            </div>
            {ex.gemCode && ex.kind !== 'shape_spot' && ex.kind !== 'origin_match'
              && ex.kind !== 'harder_which' && (
              <div className="flex justify-center mb-2">
                <GemSpecimen gem={getGem(ex.gemCode)!} size={72} />
              </div>
            )}
            <p className="text-sm font-bold leading-relaxed" style={{ color: INK }}>
              {ex.prompt}
            </p>
            <div className="space-y-2 mt-3">
              {ex.choices.map((c, i) => (
                <button key={i} onClick={() => answer(i)}
                        className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold"
                        style={{
                          background: picked === i ? '#6b8e5a' : '#F6EEDF',
                          color: picked === i ? '#fffaf2' : INK,
                          border: '1px solid #C9A227',
                          minHeight: 52, touchAction: 'manipulation',
                        }}>
                  {c}
                </button>
              ))}
            </div>
            {showHint && (
              <p className="text-xs mt-3 rounded-lg p-2 leading-relaxed"
                 style={{ background: '#EFE0B0', color: '#5A4520' }}>
                {ex.hint}
              </p>
            )}
          </div>
        )}

        {/* ── the result ─────────────────────────────────────────── */}
        <AnimatePresence>
          {phase === 'done' && unit && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-5 text-center" style={{ background: PAPER }}>
              {outcome === null ? (
                <p className="text-sm" style={{ color: '#6b6255' }}>counting up…</p>
              ) : (
                <>
                  <h2 className="font-bold text-lg" style={{ color: INK }}>
                    {outcome.passed ? 'Learned.' : 'A good try.'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#4a4034' }}>
                    {outcome.correctCount} of {exercises.length} right the first time.
                  </p>
                  {outcome.stoneCode && getGem(outcome.stoneCode) && (
                    <div className="rounded-xl p-3 mt-3 flex items-center gap-3"
                         style={{ background: '#EFE0B0' }}>
                      <GemSpecimen gem={getGem(outcome.stoneCode)!} size={52} />
                      <p className="text-xs text-left leading-snug" style={{ color: '#5A4520' }}>
                        <b>The seam paid you a {getGem(outcome.stoneCode)!.name.toLowerCase()}</b> for
                        learning its lesson. It is waiting in the cavern —
                        keep it or sell it, your choice.
                      </p>
                    </div>
                  )}
                  {!outcome.passed && (
                    <p className="text-xs mt-2 italic" style={{ color: '#6b6255' }}>
                      {unit.outro ? 'The lesson is still there to read again — no hurry.' : ''}
                    </p>
                  )}
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: '#4a4034' }}>
                    {outcome.passed ? unit.outro : ''}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setPhase('list'); setUnit(null); }}
                            className="flex-1 rounded-xl font-bold text-sm"
                            style={{ background: GOLD, color: '#2A2420', minHeight: 52 }}>
                      all lessons
                    </button>
                    {outcome.stoneCode && (
                      <Link href={`/garden/habitat/crystal_cavern?learner=${learnerId}`}
                            className="flex-1 rounded-xl font-bold text-sm no-underline flex items-center justify-center"
                            style={{ background: '#6b8e5a', color: '#fffaf2', minHeight: 52 }}>
                        to the cavern →
                      </Link>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── teach page view ────────────────────────────────────────────── */

function TeachView({
  unit, page, onBack, onNext,
}: {
  unit: GemUnit;
  page: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const p: GemTeachPage = unit.teach[page];
  return (
    <div className="rounded-2xl p-4" style={{ background: PAPER }}>
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#8A7A5E' }}>
        {unit.title} · page {page + 1} of {unit.teach.length}
      </p>
      <h2 className="font-bold text-lg mt-1" style={{ color: INK }}>{p.heading}</h2>

      {p.figure?.kind === 'specimen' && getGem(p.figure.gemCode) && (
        <div className="flex flex-col items-center my-3">
          <GemSpecimen gem={getGem(p.figure.gemCode)!} size={92} />
          <span className="text-[11px] mt-1 italic" style={{ color: '#8A7A5E' }}>
            {getGem(p.figure.gemCode)!.name} — {getGem(p.figure.gemCode)!.crystalShape}
          </span>
        </div>
      )}
      {p.figure?.kind === 'shelf' && (
        <div className="flex justify-center gap-4 my-3">
          {p.figure.gemCodes.map(c => getGem(c)).filter(Boolean).map(g => (
            <div key={g!.code} className="flex flex-col items-center">
              <GemSpecimen gem={g!} size={60} />
              <span className="text-[10px] mt-1" style={{ color: '#6B5C42' }}>{g!.name}</span>
            </div>
          ))}
        </div>
      )}
      {p.figure?.kind === 'hardness_ladder' && (
        <div className="my-3 rounded-xl p-3" style={{ background: '#F6EEDF' }}>
          {HARDNESS_TESTS.map(t => (
            <div key={t.thing} className="flex items-center gap-2 py-1">
              <span className="font-bold text-sm w-8 text-right" style={{ color: GOLD }}>
                {t.mohs}
              </span>
              <div className="rounded-full" style={{
                height: 8, background: GOLD, opacity: 0.5,
                width: `${t.mohs * 9}%`,
              }} />
              <span className="text-xs" style={{ color: INK }}>{t.thing}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4a4034' }}>{p.body}</p>

      <div className="flex items-center justify-between mt-4">
        <button onClick={onBack} disabled={page === 0}
                className="rounded-xl px-4 font-bold text-sm disabled:opacity-40"
                style={{ background: '#EFE7D8', color: INK, minHeight: 48 }}>
          ← back
        </button>
        <button onClick={onNext}
                className="rounded-xl px-5 font-bold text-sm"
                style={{ background: GOLD, color: '#2A2420', minHeight: 48 }}>
          {page + 1 < unit.teach.length ? 'next →' : 'try the questions →'}
        </button>
      </div>
    </div>
  );
}
