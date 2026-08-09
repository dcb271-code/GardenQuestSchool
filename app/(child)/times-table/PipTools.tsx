// app/(child)/times-table/PipTools.tsx
//
// Pip's three teaching tools: Learn, Practice, Cards.
//
// All three SPEAK, and that is the point rather than an accessibility
// afterthought. A times table is learned by ear before it is learned by
// eye — "seven, fourteen, twenty-one" is a tune, and a child who can
// chant the sevens can recover 7×6 by counting on her fingers on a bad
// day. A silent grid cannot do that.
//
// LEARN counts a table out loud while the array stacks up a row at a
// time, so the chant and the picture arrive together.
//
// PRACTICE asks only the facts she actually misses, reads the question
// aloud, and on a miss Pip says the answer AND the route to it. Never
// "wrong" — she already believes she is bad at the sevens, and the job
// is to stop that being true, not to confirm it.
//
// CARDS is the plain flashcard deck, because sometimes a child just
// wants to test herself and every gentle scaffold is in the way.
//
// Speech degrades silently: if the device has no voice, everything
// still works, muted.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, stopSpeaking, isSpeechAvailable } from '@/lib/audio/tts';
import { playSparkle } from '@/lib/audio/sfx';
import PipChipmunk from '@/components/child/garden/PipChipmunk';
import { strategyFor, type Fact } from '@/lib/packs/math/timesTable';

/* ─── shared speech ───────────────────────────────────────────────── */

function usePipVoice(muted: boolean) {
  const available = typeof window !== 'undefined' && isSpeechAvailable();
  const say = useCallback((text: string) => {
    if (muted || !available) return Promise.resolve();
    // A slightly quicker, brighter voice than the storybook default —
    // he is counting, not reading a bedtime story.
    return speak(text, { rate: 0.95, pitch: 1.15 });
  }, [muted, available]);
  useEffect(() => () => stopSpeaking(), []);
  return { say, available };
}

function MuteToggle({ muted, onToggle, available }: {
  muted: boolean; onToggle: () => void; available: boolean;
}) {
  if (!available) {
    return (
      <span className="text-[11px] italic" style={{ color: '#8A7A5E' }}>
        this device has no voice
      </span>
    );
  }
  return (
    <button
      onClick={onToggle}
      className="text-sm rounded-xl px-3"
      style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 44,
               touchAction: 'manipulation' }}
      aria-label={muted ? 'turn Pip’s voice on' : 'turn Pip’s voice off'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

/* ─── LEARN — count a table out loud while it stacks ──────────────── */

export function LearnTable({ muted, onToggleMute }: {
  muted: boolean; onToggleMute: () => void;
}) {
  const { say, available } = usePipVoice(muted);
  const [table, setTable] = useState(7);
  const [upTo, setUpTo] = useState(0);
  const [running, setRunning] = useState(false);
  const canceled = useRef(false);

  useEffect(() => () => { canceled.current = true; stopSpeaking(); }, []);

  const run = async () => {
    if (running) return;
    canceled.current = false;
    setRunning(true);
    setUpTo(0);
    await say(`The ${table} times table. ${table} in every pouch.`);
    for (let i = 1; i <= 10; i++) {
      if (canceled.current) break;
      setUpTo(i);
      // The product alone, not "3 times 7 is 21" — the run of numbers
      // is what has to become automatic.
      await say(String(i * table));
      if (!available) await new Promise(r => setTimeout(r, 420));
    }
    if (!canceled.current) await say(`That is the ${table}s.`);
    setRunning(false);
  };

  const stop = () => { canceled.current = true; stopSpeaking(); setRunning(false); };

  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1px solid #E0D4B8' }}>
      <div className="flex items-start gap-3">
        <PipChipmunk size={64} cheeksFull={upTo > 0} />
        <div className="flex-1">
          <p className="text-sm" style={{ color: '#4A3B24' }}>
            Pick a table. I will count it out while you watch it stack up.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[2, 3, 4, 5, 6, 7, 8, 9].map(t => (
              <button
                key={t}
                onClick={() => { stop(); setTable(t); setUpTo(0); }}
                className="rounded-lg font-bold text-sm"
                style={{
                  width: 38, height: 38, touchAction: 'manipulation',
                  background: t === table ? '#5A8C4A' : '#F2E7D0',
                  color: t === table ? '#FFF' : '#4A3B24',
                }}
              >{t}</button>
            ))}
          </div>
        </div>
        <MuteToggle muted={muted} onToggle={onToggleMute} available={available} />
      </div>

      {/* the stack — one row of `table` acorns per multiple */}
      <div className="mt-4 space-y-1">
        {Array.from({ length: 10 }, (_, i) => {
          const n = i + 1;
          const shown = n <= upTo;
          return (
            <motion.div
              key={n}
              initial={false}
              animate={{ opacity: shown ? 1 : 0.38 }}
              className="flex items-center gap-2"
            >
              <span className="text-[11px] w-10 text-right shrink-0"
                    style={{ color: '#8A7A5E' }}>
                {n} × {table}
              </span>
              <div className="flex gap-1 flex-1 flex-wrap">
                {Array.from({ length: table }, (_, c) => (
                  <span key={c} style={{
                    width: 13, height: 13, borderRadius: 4,
                    background: shown ? '#C99A6E' : '#EFE6D4', display: 'block',
                  }} />
                ))}
              </div>
              <span className="text-sm font-bold w-9 shrink-0"
                    style={{ color: shown ? '#3A2E1E' : '#C9BCA4' }}>
                {n * table}
              </span>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={running ? stop : run}
        className="w-full rounded-xl font-bold text-sm mt-4"
        style={{ background: running ? '#EADFC6' : '#5A8C4A',
                 color: running ? '#4A3B24' : '#FFF',
                 minHeight: 52, touchAction: 'manipulation' }}
      >
        {running ? 'stop' : `▶ count the ${table}s`}
      </button>
    </div>
  );
}

/* ─── PRACTICE — voiced drill on the facts she actually misses ────── */

export function Practice({ queue, muted, onToggleMute }: {
  queue: Fact[]; muted: boolean; onToggleMute: () => void;
}) {
  const { say, available } = usePipVoice(muted);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const fact = queue[i % queue.length];
  const answer = fact.a * fact.b;
  const strategy = strategyFor(fact.a, fact.b);

  // Distractors that are wrong in the ways children are actually wrong:
  // the neighbouring multiples, and the sum instead of the product.
  const choices = (() => {
    const lo = Math.min(fact.a, fact.b), hi = Math.max(fact.a, fact.b);
    const pool = new Set<number>([answer, answer - lo, answer + lo, lo + hi, answer - hi]);
    const out = Array.from(pool).filter(n => n > 0 && n !== answer).slice(0, 3);
    const all = [answer, ...out];
    // Stable shuffle keyed on the fact, so the answer is not always 1st
    // and does not jump about while she is looking at it.
    return all.sort((x, y) => ((x * 37 + fact.a) % 11) - ((y * 37 + fact.b) % 11));
  })();

  useEffect(() => {
    setPicked(null);
    say(`What is ${fact.a} times ${fact.b}?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const choose = async (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === answer) {
      playSparkle();
      setStreak(s => s + 1);
      await say('Yes. Straight in the larder.');
      setTimeout(() => setI(v => v + 1), 400);
    } else {
      setStreak(0);
      // The answer AND the route. Never just "no".
      await say(`${fact.a} times ${fact.b} is ${answer}. ${strategy.explain}`);
    }
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1px solid #E0D4B8' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: '#8A7A5E' }}>
          {streak > 1 ? `${streak} in a row` : 'the ones you find hardest'}
        </span>
        <MuteToggle muted={muted} onToggle={onToggleMute} available={available} />
      </div>

      <div className="flex items-center gap-3 mt-2">
        <PipChipmunk size={56} cheeksFull={picked === answer} />
        <div className="text-4xl font-bold flex-1 text-center" style={{ color: '#3A2E1E' }}>
          {fact.a} × {fact.b}
        </div>
        <button
          onClick={() => say(`What is ${fact.a} times ${fact.b}?`)}
          className="rounded-xl px-3 text-sm"
          style={{ background: '#F2E7D0', color: '#4A3B24', minHeight: 44,
                   touchAction: 'manipulation' }}
          aria-label="say it again"
        >🔁</button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {choices.map(n => {
          const isAnswer = n === answer;
          const chosen = picked === n;
          return (
            <button
              key={n}
              onClick={() => choose(n)}
              disabled={picked !== null}
              className="rounded-xl text-2xl font-bold"
              style={{
                minHeight: 64, touchAction: 'manipulation',
                background: picked === null ? '#F2E7D0'
                  : isAnswer ? '#5A8C4A' : chosen ? '#D96A4A' : '#F2E7D0',
                color: picked !== null && (isAnswer || chosen) ? '#FFF' : '#4A3B24',
                opacity: picked !== null && !isAnswer && !chosen ? 0.5 : 1,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {picked !== null && picked !== answer && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3">
            <p className="text-sm" style={{ color: '#4A3B24' }}>
              <strong>{fact.a} × {fact.b} = {answer}.</strong> {strategy.explain}
            </p>
            <button
              onClick={() => setI(v => v + 1)}
              className="w-full rounded-xl font-bold text-sm mt-3"
              style={{ background: '#5A8C4A', color: '#FFF', minHeight: 48,
                       touchAction: 'manipulation' }}
            >
              next →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── CARDS — a plain deck, for when scaffolding is in the way ────── */

export function Flashcards({ queue, muted, onToggleMute }: {
  queue: Fact[]; muted: boolean; onToggleMute: () => void;
}) {
  const { say, available } = usePipVoice(muted);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [got, setGot] = useState<string[]>([]);

  const fact = queue[i % queue.length];
  const answer = fact.a * fact.b;

  const flip = () => {
    setFlipped(true);
    say(`${fact.a} times ${fact.b} is ${answer}.`);
  };

  const next = (knew: boolean) => {
    if (knew) setGot(g => [...g, `${fact.a}x${fact.b}`]);
    setFlipped(false);
    setI(v => v + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px]" style={{ color: '#8A7A5E' }}>
          {got.length > 0 ? `${got.length} known this round` : 'tap the card to turn it over'}
        </span>
        <MuteToggle muted={muted} onToggle={onToggleMute} available={available} />
      </div>

      <button
        onClick={() => !flipped && flip()}
        className="w-full rounded-2xl flex flex-col items-center justify-center"
        style={{
          background: '#FFF', border: '1px solid #E0D4B8', minHeight: 230,
          touchAction: 'manipulation',
        }}
      >
        <div className="text-5xl font-bold" style={{ color: '#3A2E1E' }}>
          {fact.a} × {fact.b}
        </div>
        <AnimatePresence mode="wait">
          {flipped ? (
            <motion.div key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-6xl font-bold" style={{ color: '#5A8C4A' }}>
              {answer}
            </motion.div>
          ) : (
            <motion.div key="q" className="mt-3 text-sm" style={{ color: '#8A7A5E' }}>
              say it, then tap
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {flipped && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => next(false)}
            className="flex-1 rounded-xl font-bold text-sm"
            style={{ background: '#EADFC6', color: '#4A3B24', minHeight: 52,
                     touchAction: 'manipulation' }}
          >
            not yet
          </button>
          <button
            onClick={() => next(true)}
            className="flex-1 rounded-xl font-bold text-sm"
            style={{ background: '#5A8C4A', color: '#FFF', minHeight: 52,
                     touchAction: 'manipulation' }}
          >
            knew it
          </button>
        </div>
      )}

      <p className="text-[11px] text-center mt-3 px-4" style={{ color: '#8A7A5E' }}>
        Nothing is scored here and nothing is timed. This deck is just
        for checking yourself.
      </p>
    </div>
  );
}
