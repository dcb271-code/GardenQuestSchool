// components/child/garden/EstimationDuelModal.tsx
//
// Hodge's Estimation Duel (Level 3+). Three rounds from
// estimationDuel.ts: a scene with a visible BENCHMARK (a marked bundle
// of 10, Hodge-the-meter-stick, or friendly-number rounding), four
// candidate estimates, then a reveal comparing the child's estimate
// with Hodge's authored guess. Closest wins the round; the reveal
// always shows the reasoning strategy so the duel teaches estimation
// even on a lost round. Beating or tying Hodge posts to
// /api/garden/hodge-duel for a 'noticing' gem (1/day cap server-side).

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  duelRoundsForDay, scoreRound, DUEL_ROUNDS_PER_GAME,
  type DuelRound, type DuelScene,
} from '@/lib/world/estimationDuel';

type Phase = 'intro' | 'estimate' | 'reveal' | 'result';

export default function EstimationDuelModal({
  open, learnerId, onClose,
}: {
  open: boolean;
  learnerId: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [kidChoice, setKidChoice] = useState<number | null>(null);
  const [kidScore, setKidScore] = useState(0);
  const [hodgeScore, setHodgeScore] = useState(0);
  const [gemGranted, setGemGranted] = useState(false);

  const rounds = useMemo(
    () => duelRoundsForDay(new Date().toISOString().slice(0, 10)),
    [open],
  );
  const round = rounds[roundIdx];

  useEffect(() => {
    if (open) {
      setPhase('intro');
      setRoundIdx(0);
      setKidChoice(null);
      setKidScore(0);
      setHodgeScore(0);
      setGemGranted(false);
    }
  }, [open]);

  // Shuffle the choice order once per round.
  const choiceOrder = useMemo(
    () => round ? round.choices.map((_, i) => i).sort(() => Math.random() - 0.5) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round?.id, open],
  );

  if (!round) return null;

  const pick = (value: number) => {
    setKidChoice(value);
    const { winner } = scoreRound(round, value);
    if (winner === 'kid') setKidScore(s => s + 1);
    else if (winner === 'hodge') setHodgeScore(s => s + 1);
    else { setKidScore(s => s + 1); setHodgeScore(s => s + 1); }
    setPhase('reveal');
  };

  const nextRound = async () => {
    if (roundIdx + 1 >= DUEL_ROUNDS_PER_GAME) {
      setPhase('result');
      try {
        const res = await fetch('/api/garden/hodge-duel', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ learnerId, kidScore, hodgeScore }),
        });
        const json = await res.json().catch(() => ({}));
        setGemGranted(!!json.gemGranted);
      } catch { /* result screen still shows */ }
    } else {
      setRoundIdx(i => i + 1);
      setKidChoice(null);
      setPhase('estimate');
    }
  };

  const { winner } = kidChoice !== null
    ? scoreRound(round, kidChoice)
    : { winner: 'tie' as const };
  const kidWon = kidScore > hodgeScore;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-3 max-h-[92dvh] overflow-y-auto"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-0.5">
              <div className="text-4xl">🦫🎯</div>
              <div className="font-display italic text-[11px] tracking-[0.3em] uppercase text-bark/55">
                estimation duel
              </div>
              {phase !== 'intro' && phase !== 'result' && (
                <div className="font-display text-[13px] text-bark/70">
                  round {roundIdx + 1} of {DUEL_ROUNDS_PER_GAME} · you {kidScore} — hodge {hodgeScore}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div key="intro" className="space-y-3 text-center"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="font-display italic text-[16px] text-bark/80 leading-snug px-2">
                    &ldquo;I&rsquo;m the best guesser at this brook,&rdquo; says Hodge.
                    &ldquo;Bet you can&rsquo;t estimate better than me.&rdquo;
                  </p>
                  <p className="font-display text-[14px] text-bark/65 leading-snug px-2">
                    Don&rsquo;t count everything — find the marked <span style={{ fontWeight: 700 }}>bundle of 10</span>,
                    see how many bundles there are, and reason it out. Closest estimate wins the round.
                  </p>
                  <motion.button
                    onClick={() => setPhase('estimate')}
                    className="w-full bg-forest text-white rounded-full py-4 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    you&rsquo;re on, hodge
                  </motion.button>
                </motion.div>
              )}

              {(phase === 'estimate' || phase === 'reveal') && (
                <motion.div key={`round-${roundIdx}-${phase}`} className="space-y-3"
                  initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.3 }}>
                  <div className="bg-white/70 rounded-2xl p-3 border-2 border-ochre/40">
                    <div className="font-display text-[16px] text-bark leading-snug" style={{ fontWeight: 600 }}>
                      {round.prompt}
                    </div>
                  </div>

                  <RoundScene round={round} revealed={phase === 'reveal'} />

                  {phase === 'estimate' && (
                    <div className="grid grid-cols-2 gap-2">
                      {choiceOrder.map(ci => (
                        <motion.button
                          key={ci}
                          onClick={() => pick(round.choices[ci])}
                          className="bg-white border-4 border-ochre rounded-2xl px-3 py-3 font-display text-[20px] text-bark hover:bg-ochre/10"
                          style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 700 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {round.choices[ci]}
                          <span className="block text-[11px] font-normal italic text-bark/55">{round.unitWord}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {phase === 'reveal' && kidChoice !== null && (
                    <motion.div className="space-y-2"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="bg-white/80 border-2 border-forest/40 rounded-2xl px-4 py-3 text-center">
                        <div className="font-display text-[15px] text-bark">
                          exactly <span className="text-[22px]" style={{ fontWeight: 700 }}>{round.exact}</span> {round.unitWord}
                        </div>
                        <div className="font-display italic text-[13px] text-bark/70 mt-1">
                          {round.reasonHint}
                        </div>
                      </div>
                      <div className="flex gap-2 text-center font-display text-[13px]">
                        <div className={`flex-1 rounded-xl px-2 py-2 border-2 ${winner !== 'hodge' ? 'border-forest bg-forest/10' : 'border-ochre/40 bg-white/60'}`}>
                          <div style={{ fontWeight: 700 }}>you: {kidChoice}</div>
                          <div className="text-bark/60 italic">off by {Math.abs(kidChoice - round.exact)}</div>
                        </div>
                        <div className={`flex-1 rounded-xl px-2 py-2 border-2 ${winner !== 'kid' ? 'border-forest bg-forest/10' : 'border-ochre/40 bg-white/60'}`}>
                          <div style={{ fontWeight: 700 }}>hodge: {round.hodgeGuess}</div>
                          <div className="text-bark/60 italic">off by {Math.abs(round.hodgeGuess - round.exact)}</div>
                        </div>
                      </div>
                      <div className="font-display italic text-[13px] text-bark/70 text-center px-2">
                        🦫 &ldquo;{round.hodgeLine}&rdquo;
                      </div>
                      <motion.button
                        onClick={nextRound}
                        className="w-full bg-forest text-white rounded-full py-3.5 font-display"
                        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {roundIdx + 1 >= DUEL_ROUNDS_PER_GAME ? 'final score →' : 'next round →'}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {phase === 'result' && (
                <motion.div key="result" className="space-y-3 text-center py-1"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="font-display text-[26px] text-bark" style={{ fontWeight: 700 }}>
                    you {kidScore} — hodge {hodgeScore}
                  </div>
                  <p className="font-display italic text-[16px] text-bark/80 leading-snug px-2">
                    {kidWon
                      ? '🦫 "Impossible! Rematch tomorrow — new piles, same brook."'
                      : kidScore === hodgeScore
                        ? '🦫 "A tie?! You estimate suspiciously well for someone without a tail."'
                        : '🦫 "Ha! The brook remains mine. Come back tomorrow — counting bundles of ten, that\'s the trick."'}
                  </p>
                  {gemGranted && (
                    <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark">
                      💎 a <span style={{ fontWeight: 700 }}>noticing</span> gem — estimating with reasons is noticing
                    </div>
                  )}
                  <motion.button
                    onClick={onClose}
                    className="w-full bg-sage text-white rounded-full py-4 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    back to the garden
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Scene renderers — the benchmark is always VISIBLE so the estimate is
// grouping logic, not a shot in the dark.
// ─────────────────────────────────────────────────────────────────────────

const CLUSTER_POSITIONS = [
  { x: 78, y: 74 }, { x: 202, y: 60 }, { x: 140, y: 150 },
  { x: 268, y: 138 }, { x: 66, y: 176 }, { x: 240, y: 208 },
];

function RoundScene({ round, revealed }: { round: DuelRound; revealed: boolean }) {
  if (round.kind === 'benchmark_count') {
    return (
      <svg viewBox="0 0 320 240" className="w-full rounded-2xl border-2 border-ochre/40 bg-[#EAF2DC]">
        {round.clusters.map((count, ci) => {
          const pos = CLUSTER_POSITIONS[ci % CLUSTER_POSITIONS.length];
          return (
            <g key={ci}>
              {/* the items, in a sunflower-spiral pile so clusters read
                  as roughly-equal heaps */}
              {Array.from({ length: count }).map((_, i) => {
                const r = 4 + Math.sqrt(i) * 7;
                const a = i * 2.4;
                return (
                  <SceneItem
                    key={i}
                    scene={round.scene}
                    x={pos.x + Math.cos(a) * r}
                    y={pos.y + Math.sin(a) * r * 0.7}
                    seed={ci * 20 + i}
                  />
                );
              })}
              {/* benchmark ring on cluster 0 — or on ALL clusters at
                  reveal, to show the grouping strategy */}
              {(ci === 0 || revealed) && (
                <ellipse
                  cx={pos.x} cy={pos.y} rx={34} ry={27}
                  fill="none" stroke={ci === 0 ? '#C05F33' : '#6B8E5A'}
                  strokeWidth={2} strokeDasharray="5 4"
                />
              )}
              {revealed && ci !== 0 && (
                <text x={pos.x} y={pos.y - 32} textAnchor="middle" fontSize={11}
                      fontWeight={700} fill="#4F6F42">~10</text>
              )}
            </g>
          );
        })}
        {/* benchmark label */}
        <g>
          <rect x={CLUSTER_POSITIONS[0].x - 44} y={CLUSTER_POSITIONS[0].y - 52} width={88} height={16} rx={6}
                fill="rgba(255,250,242,0.95)" stroke="#C05F33" strokeWidth={1} />
          <text x={CLUSTER_POSITIONS[0].x} y={CLUSTER_POSITIONS[0].y - 40} textAnchor="middle"
                fontSize={10} fontStyle="italic" fontWeight={700} fill="#8a4520">
            {round.benchmarkLabel}
          </text>
        </g>
      </svg>
    );
  }

  if (round.kind === 'benchmark_length') {
    const damLen = round.units * 48;
    return (
      <svg viewBox="0 0 320 150" className="w-full rounded-2xl border-2 border-ochre/40 bg-[#DDEBF0]">
        {/* water */}
        <rect x={0} y={0} width={320} height={150} fill="#C4DCE4" />
        <path d="M 0 20 Q 80 12 160 20 T 320 20" stroke="#A8C8D4" strokeWidth={3} fill="none" />
        {/* the dam — a stick-textured bar of the true length */}
        <g transform={`translate(${(320 - damLen) / 2}, 52)`}>
          <rect x={0} y={0} width={damLen} height={26} rx={7} fill="#8A6238" stroke="#5A3B1F" strokeWidth={1.5} />
          {Array.from({ length: Math.round(round.units * 6) }).map((_, i) => (
            <line key={i} x1={6 + i * 8} y1={3 + (i % 3)} x2={2 + i * 8} y2={23 - (i % 3)}
                  stroke="#6B4B27" strokeWidth={1.6} strokeLinecap="round" />
          ))}
          {/* at reveal: unit ticks show how many Hodges fit */}
          {revealed && Array.from({ length: round.units + 1 }).map((_, i) => (
            <line key={i} x1={i * 48} y1={-6} x2={i * 48} y2={32}
                  stroke="#C05F33" strokeWidth={1.5} strokeDasharray="3 3" />
          ))}
        </g>
        {/* Hodge the unit — solid beaver below, same scale (48px = 1m) */}
        <g transform={`translate(${(320 - damLen) / 2}, 108)`}>
          <HodgeSilhouette />
          <text x={58} y={14} fontSize={10} fontStyle="italic" fontWeight={700} fill="#6b4423">
            {round.unitLabel}
          </text>
        </g>
      </svg>
    );
  }

  // rounding — a wooden board with the computation
  return (
    <svg viewBox="0 0 320 110" className="w-full rounded-2xl border-2 border-ochre/40 bg-[#EAF2DC]">
      <rect x={30} y={16} width={260} height={78} rx={10} fill="#A9774C" stroke="#6B4423" strokeWidth={2.5} />
      <rect x={40} y={26} width={240} height={58} rx={7} fill="#C99A6B" opacity={0.5} />
      <text x={160} y={52} textAnchor="middle" fontSize={20} fontWeight={700} fill="#3F2614">
        {round.expression}
      </text>
      <text x={160} y={76} textAnchor="middle" fontSize={13} fontStyle="italic" fill="#5A3B1F">
        {revealed ? round.reasonHint : 'round to a friendly number first…'}
      </text>
    </svg>
  );
}

function SceneItem({ scene, x, y, seed }: { scene: DuelScene; x: number; y: number; seed: number }) {
  const rot = ((seed * 47) % 360);
  switch (scene) {
    case 'logs':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rot % 60 - 30})`}>
          <rect x={-8} y={-3} width={16} height={6} rx={3} fill="#8A6238" stroke="#5A3B1F" strokeWidth={0.8} />
          <ellipse cx={8} cy={0} rx={2} ry={3} fill="#C9A66A" stroke="#5A3B1F" strokeWidth={0.6} />
        </g>
      );
    case 'acorns':
      return (
        <g transform={`translate(${x}, ${y})`}>
          <ellipse cx={0} cy={1.5} rx={3.4} ry={4} fill="#C9A66A" stroke="#5A3B1F" strokeWidth={0.7} />
          <path d="M -3.6 -1 Q 0 -4 3.6 -1 Z" fill="#7B4F2C" stroke="#5A3B1F" strokeWidth={0.6} />
        </g>
      );
    case 'cattails':
      return (
        <g transform={`translate(${x}, ${y})`}>
          <line x1={0} y1={8} x2={0} y2={-8} stroke="#5C7E4F" strokeWidth={1.2} strokeLinecap="round" />
          <ellipse cx={0} cy={-5} rx={2.2} ry={5} fill="#6E4A28" stroke="#5A3B1F" strokeWidth={0.5} />
        </g>
      );
    case 'fish':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${rot % 40 - 20})`}>
          <ellipse cx={0} cy={0} rx={6} ry={2.6} fill="#9BB8C4" stroke="#4F7E84" strokeWidth={0.7} />
          <path d="M 5 0 L 9 -3 L 9 3 Z" fill="#9BB8C4" stroke="#4F7E84" strokeWidth={0.6} />
          <circle cx={-3} cy={-0.6} r={0.7} fill="#1F1006" />
        </g>
      );
  }
}

function HodgeSilhouette() {
  // 48px nose-to-tail — the same scale the dam is drawn at (1m = 48px).
  return (
    <g>
      <ellipse cx={20} cy={6} rx={13} ry={8} fill="#6E4A28" stroke="#3F2614" strokeWidth={1.2} />
      <circle cx={35} cy={2} r={6} fill="#6E4A28" stroke="#3F2614" strokeWidth={1.2} />
      <ellipse cx={2} cy={7} rx={7} ry={4.5} fill="#5A3B1F" stroke="#3F2614" strokeWidth={1}
               transform="rotate(-18 2 7)" />
      <circle cx={37} cy={0} r={0.9} fill="#1F1006" />
      <rect x={36} y={6} width={3} height={3.4} rx={0.8} fill="#F0E4CF" stroke="#3F2614" strokeWidth={0.5} />
    </g>
  );
}
