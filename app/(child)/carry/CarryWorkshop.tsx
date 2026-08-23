'use client';

// The Carrying Lanes — the ant colony teaches regrouping.
//
// The animation and the algorithm are the same event: ten seeds in a
// lane become one bundle, and one strong ant carries it over the
// wall. The "+1" she writes is that ant, drawn arriving. Nothing is
// ever carried except a completed ten — the model refuses.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { playSparkle, playHarvest } from '@/lib/audio/sfx';
import {
  analyzeSum, makeCarrySum, WATCH_DEMO, type CarrySum,
} from '@/lib/packs/math/carry';

const INK = '#3A2E1E';
const PAPER = '#FFFDF6';
const SOIL = '#8A6238';
const SOIL_DARK = '#5E4020';
const SEED = '#D9A441';
const ANT = '#5E3A28';

type Tool = 'watch' | 'help' | 'sums';

export default function CarryWorkshop({
  learnerId, has4digit,
}: {
  learnerId: string;
  has4digit: boolean;
}) {
  const [tool, setTool] = useState<Tool>('watch');
  return (
    <div className="min-h-screen" style={{ background: '#F3EBDD' }}>
      <div className="max-w-2xl mx-auto p-4 pb-16">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: INK }}>
              The Carrying Lanes
            </h1>
            <p className="text-xs" style={{ color: '#8A7A5E' }}>
              Ants carry fifty times their own weight. So can you.
            </p>
          </div>
          <Link href={`/garden/habitat/ant_hill?learner=${learnerId}`}
                className="text-sm rounded-xl px-3 py-2 shrink-0"
                style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 44,
                         display: 'inline-flex', alignItems: 'center' }}>
            ← ant hill
          </Link>
        </div>

        <div className="flex gap-2 mb-4">
          {([['watch', '👀 Watch'], ['help', '🐜 Help carry'], ['sums', '✏️ Real sums']] as const)
            .map(([k, label]) => (
            <button key={k} onClick={() => setTool(k)}
                    className="rounded-xl font-bold text-sm px-3 flex-1"
                    style={{ minHeight: 48, touchAction: 'manipulation',
                             background: tool === k ? '#5A8C4A' : '#EADFC6',
                             color: tool === k ? '#FFF' : '#4A3B24' }}>
              {label}
            </button>
          ))}
        </div>

        {tool === 'watch' && <Watch />}
        {tool === 'help' && <HelpCarry />}
        {tool === 'sums' && <RealSums learnerId={learnerId} has4digit={has4digit} />}
      </div>
    </div>
  );
}

/* ── the lanes, drawn ───────────────────────────────────────────── */

function Seeds({ x, count, small = false }: { x: number; count: number; small?: boolean }) {
  const r = small ? 5 : 7;
  const per = 5;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i}
                cx={x + (i % per) * (r * 2 + 3) - ((per - 1) * (r * 2 + 3)) / 2}
                cy={196 - Math.floor(i / per) * (r * 2 + 4)}
                r={r} fill={SEED} stroke="#8A6534" strokeWidth={1.5} />
      ))}
    </g>
  );
}

function AntWithBundle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={0} cy={-16} r={13} fill={SEED} stroke="#8A6534" strokeWidth={2} />
      <text x={0} y={-11} textAnchor="middle" fontSize={12} fontWeight={900} fill="#5E4020">10</text>
      <ellipse cx={-2} cy={2} rx={7} ry={4.5} fill={ANT} />
      <circle cx={5} cy={0} r={3.4} fill={ANT} />
      <circle cx={-9} cy={2} r={4} fill={ANT} />
      {[-6, -1, 4].map(lx => (
        <path key={lx} d={`M ${lx} 5 L ${lx - 2} 10`} stroke={ANT} strokeWidth={1.6} strokeLinecap="round" />
      ))}
      <path d="M 7 -2 Q 10 -5 12 -4 M 7 -1 Q 11 -2 13 0" stroke={ANT} strokeWidth={1.2} fill="none" />
    </g>
  );
}

/**
 * Two lanes with the wall between, seeds for the current column sum,
 * and — on carry steps — the carrier crossing the wall.
 */
function Lanes({
  leftLabel, rightLabel, rightSeeds, leftSeeds, carrying, wroteRight, wroteLeft,
}: {
  leftLabel: string; rightLabel: string;
  leftSeeds: number; rightSeeds: number;
  carrying: boolean;
  wroteRight?: number; wroteLeft?: number;
}) {
  return (
    <svg viewBox="0 0 360 260" className="w-full"
         style={{ background: '#EFE3CE', borderRadius: 10, display: 'block' }}>
      {/* soil floor */}
      <rect x={0} y={210} width={360} height={50} fill={SOIL} />
      {/* the wall between lanes */}
      <rect x={172} y={80} width={16} height={132} rx={4} fill={SOIL_DARK} />
      <text x={90} y={36} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
        {leftLabel}
      </text>
      <text x={270} y={36} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>
        {rightLabel}
      </text>
      <Seeds x={90} count={leftSeeds} />
      <Seeds x={270} count={rightSeeds} small={rightSeeds > 10} />
      {carrying && (
        <motion.g initial={{ x: 60, y: 0 }} animate={{ x: -60, y: 0 }}
                  transition={{ type: 'spring', stiffness: 40, damping: 12 }}>
          <AntWithBundle x={180} y={66} />
        </motion.g>
      )}
      {/* written digits under each lane */}
      {wroteLeft !== undefined && (
        <text x={90} y={244} textAnchor="middle" fontSize={22} fontWeight={900} fill={PAPER}>
          {wroteLeft}
        </text>
      )}
      {wroteRight !== undefined && (
        <text x={270} y={244} textAnchor="middle" fontSize={22} fontWeight={900} fill={PAPER}>
          {wroteRight}
        </text>
      )}
    </svg>
  );
}

/* ── WATCH: the stepped demo, 47 + 38 ───────────────────────────── */

const DEMO = WATCH_DEMO; // 47 + 38 = 85, one carry
const WATCH_STEPS = [
  {
    text: `The colony is adding ${DEMO.a} + ${DEMO.b}. Ones seeds go in the ones lane, tens bundles in the tens lane. Ones first — always ones first.`,
    ones: DEMO.columns[0].aDigit + DEMO.columns[0].bDigit, tens: DEMO.columns[1].aDigit + DEMO.columns[1].bDigit,
    carrying: false, wroteOnes: undefined as number | undefined, wroteTens: undefined as number | undefined,
  },
  {
    text: `Count the ones lane: ${DEMO.columns[0].aDigit} + ${DEMO.columns[0].bDigit} = ${DEMO.columns[0].sum}. That is MORE than nine — too many seeds for one lane.`,
    ones: DEMO.columns[0].sum, tens: DEMO.columns[1].aDigit + DEMO.columns[1].bDigit,
    carrying: false, wroteOnes: undefined, wroteTens: undefined,
  },
  {
    text: 'So ten of them bundle up, and ONE STRONG ANT carries the bundle over the wall into the tens lane. That is all "carrying" has ever meant.',
    ones: DEMO.columns[0].writes, tens: DEMO.columns[1].aDigit + DEMO.columns[1].bDigit,
    carrying: true, wroteOnes: undefined, wroteTens: undefined,
  },
  {
    text: `The ones lane keeps what is left: write ${DEMO.columns[0].writes}.`,
    ones: DEMO.columns[0].writes, tens: DEMO.columns[1].aDigit + DEMO.columns[1].bDigit + 1,
    carrying: false, wroteOnes: DEMO.columns[0].writes, wroteTens: undefined,
  },
  {
    text: `Now the tens lane: ${DEMO.columns[1].aDigit} + ${DEMO.columns[1].bDigit}, plus the bundle that just arrived — ${DEMO.columns[1].sum}. Write ${DEMO.columns[1].writes}.`,
    ones: DEMO.columns[0].writes, tens: DEMO.columns[1].sum,
    carrying: false, wroteOnes: DEMO.columns[0].writes, wroteTens: DEMO.columns[1].writes,
  },
  {
    text: `${DEMO.a} + ${DEMO.b} = ${DEMO.total}. The ants never carry anything except a finished ten — and neither do you.`,
    ones: DEMO.columns[0].writes, tens: DEMO.columns[1].sum,
    carrying: false, wroteOnes: DEMO.columns[0].writes, wroteTens: DEMO.columns[1].writes,
  },
];

function Watch() {
  const [step, setStep] = useState(0);
  const s = WATCH_STEPS[step];
  return (
    <div className="rounded-2xl p-3" style={{ background: PAPER }}>
      <p className="text-center font-bold text-lg mb-2" style={{ color: INK }}>
        {DEMO.a} + {DEMO.b}
      </p>
      <Lanes leftLabel="tens" rightLabel="ones"
             leftSeeds={s.tens} rightSeeds={s.ones}
             carrying={s.carrying}
             wroteLeft={s.wroteTens} wroteRight={s.wroteOnes} />
      <p className="text-sm leading-relaxed mt-3 px-1" style={{ color: '#4a4034' }}>
        {s.text}
      </p>
      <div className="flex gap-2 mt-3">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                className="flex-1 rounded-xl font-bold text-sm disabled:opacity-40"
                style={{ background: '#EADFC6', color: INK, minHeight: 48 }}>
          ← back
        </button>
        <button onClick={() => setStep(Math.min(WATCH_STEPS.length - 1, step + 1))}
                disabled={step === WATCH_STEPS.length - 1}
                className="flex-1 rounded-xl font-bold text-sm disabled:opacity-40"
                style={{ background: '#5A8C4A', color: '#FFF', minHeight: 48 }}>
          next →
        </button>
      </div>
    </div>
  );
}

/* ── HELP: she does the bundling ────────────────────────────────── */

type HelpPhase = 'count_ones' | 'bundle' | 'carry' | 'write_ones' | 'write_tens' | 'done';

function HelpCarry() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 0xffff) + 1);
  const sum = useMemo(() => makeCarrySum(seed, 2), [seed]);
  const ones = sum.columns[0], tens = sum.columns[1];
  const [phase, setPhase] = useState<HelpPhase>('count_ones');
  const [wrong, setWrong] = useState(false);

  const digitChoices = (correct: number) => {
    const opts = new Set([correct]);
    while (opts.size < 3) opts.add(Math.floor(Math.random() * 10));
    return Array.from(opts).sort();
  };
  const [onesChoices] = useState(() => digitChoices(ones.writes));
  const [tensChoices] = useState(() => digitChoices(tens.writes));

  const lanes = {
    count_ones: { ones: ones.sum, tens: tens.aDigit + tens.bDigit, carrying: false, wo: undefined, wt: undefined },
    bundle:     { ones: ones.sum, tens: tens.aDigit + tens.bDigit, carrying: false, wo: undefined, wt: undefined },
    carry:      { ones: ones.writes, tens: tens.aDigit + tens.bDigit, carrying: true, wo: undefined, wt: undefined },
    write_ones: { ones: ones.writes, tens: tens.sum, carrying: false, wo: undefined, wt: undefined },
    write_tens: { ones: ones.writes, tens: tens.sum, carrying: false, wo: ones.writes, wt: undefined },
    done:       { ones: ones.writes, tens: tens.sum, carrying: false, wo: ones.writes, wt: tens.writes },
  }[phase];

  const prompt = {
    count_ones: `${sum.a} + ${sum.b}. The ones lane has ${ones.aDigit} + ${ones.bDigit} = ${ones.sum} seeds — too many! What do the ants do?`,
    bundle: 'Ten seeds, one bundle. Tap the bundle to tie it up.',
    carry: 'Send the carrier over the wall!',
    write_ones: `The bundle is delivered. What does the ones lane write down?`,
    write_tens: `Now the tens lane — ${tens.aDigit} + ${tens.bDigit} plus the bundle that arrived. What does it write?`,
    done: `${sum.a} + ${sum.b} = ${sum.total}. Carried like a colony.`,
  }[phase];

  return (
    <div className="rounded-2xl p-3" style={{ background: PAPER }}>
      <Lanes leftLabel="tens" rightLabel="ones"
             leftSeeds={lanes.tens} rightSeeds={lanes.ones}
             carrying={lanes.carrying} wroteLeft={lanes.wt} wroteRight={lanes.wo} />
      <p className="text-sm leading-relaxed mt-3 px-1 font-bold" style={{ color: INK }}>
        {prompt}
      </p>
      {wrong && (
        <p className="text-xs mt-1 px-1" style={{ color: '#8F3F30' }}>
          Count the seeds in the lane — they never lie.
        </p>
      )}
      <div className="flex gap-2 mt-3">
        {phase === 'count_ones' && (
          <button onClick={() => { setPhase('bundle'); playSparkle(); }}
                  className="flex-1 rounded-xl font-bold text-sm"
                  style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52 }}>
            🐜 bundle ten of them!
          </button>
        )}
        {phase === 'bundle' && (
          <button onClick={() => { setPhase('carry'); playSparkle(); }}
                  className="flex-1 rounded-xl font-bold text-sm"
                  style={{ background: '#C9A227', color: '#2A2420', minHeight: 52 }}>
            tie the bundle
          </button>
        )}
        {phase === 'carry' && (
          <button onClick={() => { setPhase('write_ones'); playSparkle(); }}
                  className="flex-1 rounded-xl font-bold text-sm"
                  style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52 }}>
            over the wall →
          </button>
        )}
        {(phase === 'write_ones' || phase === 'write_tens') && (
          (phase === 'write_ones' ? onesChoices : tensChoices).map(d => (
            <button key={d}
                    onClick={() => {
                      const correct = phase === 'write_ones' ? ones.writes : tens.writes;
                      if (d === correct) {
                        setWrong(false); playSparkle();
                        setPhase(phase === 'write_ones' ? 'write_tens' : 'done');
                        if (phase === 'write_tens') playHarvest();
                      } else setWrong(true);
                    }}
                    className="flex-1 rounded-xl font-bold text-xl"
                    style={{ background: '#F4EDDC', color: INK,
                             border: '1px solid #C9A227', minHeight: 56 }}>
              {d}
            </button>
          ))
        )}
        {phase === 'done' && (
          <button onClick={() => { setSeed(Math.floor(Math.random() * 0xffff) + 1); setPhase('count_ones'); setWrong(false); }}
                  className="flex-1 rounded-xl font-bold text-sm"
                  style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52 }}>
            another sum →
          </button>
        )}
      </div>
    </div>
  );
}

/* ── REAL SUMS: sessions on the real skills ─────────────────────── */

function RealSums({ learnerId, has4digit }: { learnerId: string; has4digit: boolean }) {
  const router = useRouter();
  const [starting, setStarting] = useState<string | null>(null);
  const start = async (skillCode: string) => {
    if (starting) return;
    setStarting(skillCode);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, skillCode }),
      });
      const { sessionId } = await res.json();
      if (sessionId) router.push(`/lesson/${sessionId}`);
      else setStarting(null);
    } catch { setStarting(null); }
  };
  const rows: Array<[string, string, string, boolean]> = [
    ['math.add.within_100.with_regrouping', '2-digit sums', 'one wall to carry over', true],
    ['math.add.within_1000', '3-digit sums', 'two walls, same ants', true],
    ['math.add.within_10000', '4-digit sums', 'the deep lanes', has4digit],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([code, title, blurb, ready]) => (
        <button key={code} onClick={() => ready && start(code)} disabled={!ready}
                className="w-full rounded-2xl p-4 text-left flex items-center gap-3 disabled:opacity-60"
                style={{ background: PAPER, border: `2px solid ${ready ? '#C9A227' : '#D8CEBA'}` }}>
          <span className="text-2xl" aria-hidden>🐜</span>
          <span className="flex-1">
            <span className="block font-bold text-sm" style={{ color: INK }}>{title}</span>
            <span className="block text-[11px]" style={{ color: '#8A7A5E' }}>
              {ready ? blurb : 'the ants are still digging this lane — it opens soon'}
            </span>
          </span>
          <span className="text-lg" style={{ color: '#8A7A5E' }}>
            {starting === code ? '…' : '→'}
          </span>
        </button>
      ))}
      <p className="text-[11px] text-center italic mt-2" style={{ color: '#9A8C76' }}>
        Real practice, counted like any lesson. The lanes are here
        whenever a carry feels heavy.
      </p>
    </div>
  );
}
