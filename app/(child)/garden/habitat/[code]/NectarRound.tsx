'use client';

// A nectar round: ten quick sums, one sip per answer, and NOT ONE
// CLOCK ANYWHERE. Time is measured silently for the bird's private
// comparison against her own best; what she sees is a hummingbird
// working down a row of flowers.

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSparkle, playHarvest } from '@/lib/audio/sfx';
import {
  buildNectarRound, ROUND_LENGTH, type NectarFact,
} from '@/lib/packs/math/hummingbird';

export default function NectarRound({
  learnerId, onClose,
}: {
  learnerId: string;
  onClose: () => void;
}) {
  const [seed] = useState(() => Math.floor(Math.random() * 0xffff) + 1);
  const facts = useMemo(() => buildNectarRound(seed), [seed]);
  const [qi, setQi] = useState(0);
  const [retries, setRetries] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<Array<{
    a: number; b: number; correct: boolean; retries: number;
  }>>([]);
  const [outcome, setOutcome] = useState<{
    remark: string; flowerEarned: boolean; firstTryCount: number;
  } | null>(null);
  const startedAt = useRef<number>(Date.now());
  const fact: NectarFact | undefined = facts[qi];

  const finish = async (all: typeof results) => {
    const totalMs = Date.now() - startedAt.current;
    const firstTryCount = all.filter(r => r.correct && r.retries === 0).length;
    try {
      const res = await fetch('/api/hummingbird', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, results: all, totalMs }),
      });
      const d = await res.json();
      setOutcome({
        remark: d.remark ?? 'The hummingbird zipped off into the hedge.',
        flowerEarned: !!d.flowerEarned,
        firstTryCount: d.firstTryCount ?? firstTryCount,
      });
      if (d.flowerEarned) playHarvest();
    } catch {
      setOutcome({
        remark: 'The hummingbird zipped off before the count was written down. The practice still happened.',
        flowerEarned: false,
        firstTryCount,
      });
    }
  };

  const answer = (i: number) => {
    if (!fact || picked !== null || outcome) return;
    if (i === fact.correctIndex) {
      setPicked(i);
      playSparkle();
      const rec = { a: fact.a, b: fact.b, correct: retries === 0, retries };
      window.setTimeout(() => {
        const all = [...results, rec];
        setResults(all);
        setPicked(null); setRetries(0);
        if (qi + 1 < facts.length) setQi(qi + 1);
        else finish(all);
      }, 420);
    } else {
      setRetries(r => r + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4"
         style={{ background: 'rgba(20,24,14,0.72)' }}>
      <div className="rounded-2xl p-4 w-full" style={{ background: '#FFFAF2', maxWidth: 400 }}>
        {!outcome ? (
          <>
            {/* the flower row IS the progress bar */}
            <svg viewBox="0 0 360 64" className="w-full">
              {facts.map((_, i) => (
                <g key={i} transform={`translate(${26 + i * 34}, 40)`}>
                  <line x1={0} y1={6} x2={0} y2={18} stroke="#5F7F4A" strokeWidth={2.5} />
                  <circle cx={0} cy={0} r={9}
                          fill={i < qi ? '#C94C3E' : '#EADFC6'}
                          stroke={i === qi ? '#C9A227' : '#B9A98A'}
                          strokeWidth={i === qi ? 3 : 1.5} />
                  <circle cx={0} cy={0} r={3.4} fill={i < qi ? '#F5D98F' : '#D8CEBA'} />
                </g>
              ))}
              {/* the bird hovers at the current flower */}
              <motion.g
                initial={false}
                animate={{ x: 26 + qi * 34 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              >
                <g transform="translate(0, 12)">
                  <ellipse cx={0} cy={0} rx={8} ry={5.5} fill="#5F7F4A" stroke="#3F5A32" strokeWidth={1.4} />
                  <circle cx={7} cy={-3.5} r={4} fill="#5F7F4A" stroke="#3F5A32" strokeWidth={1.4} />
                  <path d="M 10.5 -3 L 20 -1.5" stroke="#2E2216" strokeWidth={1.6} strokeLinecap="round" />
                  <path d="M 5.5 -2 Q 8 0 7 1.8 Q 5.5 1 5.5 -2" fill="#C94C3E" />
                  <motion.path d="M -2 -3 Q -8 -13 -1 -15 Q 4 -10 1 -3 Z" fill="#A9C68C"
                               animate={{ opacity: [0.9, 0.35, 0.9] }}
                               transition={{ duration: 0.22, repeat: Infinity }} />
                </g>
              </motion.g>
            </svg>

            {fact && (
              <>
                <p className="text-3xl font-bold text-center my-3" style={{ color: '#3A2E1E' }}>
                  {fact.a} + {fact.b}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {fact.choices.map((c, i) => (
                    <button key={i} onClick={() => answer(i)}
                            className="rounded-xl font-bold text-2xl"
                            style={{
                              background: picked === i ? '#5A8C4A' : '#F4EDDC',
                              color: picked === i ? '#FFF' : '#3A2E1E',
                              border: '1px solid #C9A227', minHeight: 64,
                              touchAction: 'manipulation',
                            }}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button onClick={onClose}
                    className="w-full rounded-xl mt-3 text-sm font-bold"
                    style={{ background: '#EFE7D8', color: '#6B5C42', minHeight: 44 }}>
              put the feeder down
            </button>
          </>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center">
              <span className="text-4xl" aria-hidden>🌺</span>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: '#4a4034' }}>
                {outcome.remark}
              </p>
              {outcome.flowerEarned && (
                <p className="text-xs mt-2 rounded-lg p-2 inline-block"
                   style={{ background: '#EFE0B0', color: '#5A4520' }}>
                  🌸 A new nectar flower opened by the feeder.
                </p>
              )}
              <button onClick={onClose}
                      className="w-full rounded-xl mt-4 font-bold text-sm"
                      style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52 }}>
                back to the window
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
