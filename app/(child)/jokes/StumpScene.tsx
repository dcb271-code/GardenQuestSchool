// app/(child)/jokes/StumpScene.tsx
//
// The Silly Stump. Cecily specified it herself: a brown stump with
// green leaves, a 😜 face, jokes and math, and "a section where I
// could add jokes to it." So it does three things:
//
//   - tells a joke — anyone's: every child's jokes are shared, signed
//     with who told it, mixed with the stump's own starter jokes;
//   - asks a math riddle — answered on a big number pad, checked by
//     the server, and counted as practice (up to a daily cap);
//   - takes her jokes — a question line, an answer line, and a list of
//     hers she can take back out.
//
// Everything has a read-to-me speaker: her five-year-old sister will
// visit too, and a joke you cannot read is no joke at all.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReadAloud } from '@/lib/audio/useReadAloud';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';
import ReadToMeButton from '@/components/child/ReadToMeButton';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle, playCorrectChime, playGentleTone, playSoftTap } from '@/lib/audio/sfx';
import { SillyStumpArt } from '@/components/child/garden/SillyStumpArt';
import {
  MAX_SETUP_LENGTH, MAX_PUNCHLINE_LENGTH, RIDDLE_SEEDS_PER_DAY,
  type Joke, type ToldJoke,
} from '@/lib/world/jokeStump';

type Mode = 'joke' | 'riddle' | 'add';

const INK = '#3f2614';
const PAPER = '#fffdf5';
const LEAF = '#6b8e5a';
const BARK = '#8A5A34';

function shuffled<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StumpScene({
  learnerId, firstName, riddles,
}: {
  learnerId: string;
  firstName: string;
  riddles: Array<{ id: string; question: string }>;
}) {
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;
  const readAloud = useReadAloud();
  const speakerFor = (key: string, spoken: string, label?: string) => (
    <ReadToMeButton
      reading={readAloud.readingKey === key}
      onToggle={() => readAloud.toggle(key, spoken)}
      label={label}
    />
  );

  const [mode, setMode] = useState<Mode>('joke');
  const [jokes, setJokes] = useState<ToldJoke[]>([]);
  const [mine, setMine] = useState<Joke[]>([]);
  const [seedsLeft, setSeedsLeft] = useState<number>(RIDDLE_SEEDS_PER_DAY);
  const [loaded, setLoaded] = useState(false);
  const [loadNote, setLoadNote] = useState<string | null>(null);
  const [wiggle, setWiggle] = useState(0);

  useEffect(() => {
    fetch(`/api/jokes?learner=${learnerId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoadNote('The stump is napping. Try again in a bit.'); return; }
        setJokes(d.jokes ?? []);
        setMine(d.mine ?? []);
        setSeedsLeft(d.seedsLeftToday ?? 0);
      })
      .catch(() => setLoadNote('The stump is napping. Try again in a bit.'))
      .finally(() => setLoaded(true));
  }, [learnerId]);

  /* ── telling jokes ─────────────────────────────────────────────── */

  // A shuffled deck, so she hears every joke before any comes twice.
  const [deck, setDeck] = useState<ToldJoke[]>([]);
  const [current, setCurrent] = useState<ToldJoke | null>(null);
  const [revealed, setRevealed] = useState(false);

  const nextJoke = () => {
    let d = deck;
    if (d.length === 0) d = shuffled(jokes.filter(j => j.id !== current?.id));
    if (d.length === 0) return;
    const [head, ...rest] = d;
    setDeck(rest);
    setCurrent(head);
    setRevealed(false);
    setWiggle(w => w + 1);
    playSoftTap();
  };

  // First joke as soon as the jokes arrive.
  useEffect(() => {
    if (loaded && !current && jokes.length > 0) nextJoke();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, jokes]);

  const tellerLine = (j: ToldJoke) =>
    j.by === null ? 'one of the stump’s own jokes'
      : j.by === firstName ? 'a joke from you!'
      : `a joke from ${j.by}`;

  /* ── riddles ───────────────────────────────────────────────────── */

  const order = useMemo(() => shuffled(riddles), [riddles]);
  const [ri, setRi] = useState(0);
  const riddle = order.length > 0 ? order[ri % order.length] : null;
  const [entry, setEntry] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<
    { correct: boolean; because: string; counted: boolean; note?: string } | null
  >(null);
  const [riddleNote, setRiddleNote] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());

  const press = (k: string) => {
    if (result || checking) return;
    playSoftTap();
    if (k === 'back') setEntry(e => e.slice(0, -1));
    else if (entry.length < 4) setEntry(e => (e === '0' ? k : e + k));
  };

  const checkAnswer = async () => {
    if (!riddle || !entry || checking || result) return;
    setChecking(true);
    setRiddleNote(null);
    try {
      const res = await fetch('/api/jokes', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'riddle', learnerId, riddleId: riddle.id,
          answer: Number(entry), timeMs: Math.min(600000, Date.now() - startedAt.current),
        }),
      });
      const d = await res.json();
      if (d.error) { setRiddleNote(d.error); return; }
      setResult({ correct: d.correct, because: d.because, counted: d.counted, note: d.note });
      setSeedsLeft(d.seedsLeftToday ?? 0);
      setWiggle(w => w + 1);
      if (d.correct) { playCorrectChime(); } else { playGentleTone(); }
    } catch {
      setRiddleNote('The stump didn’t hear that. Try the check button again.');
    } finally {
      setChecking(false);
    }
  };

  const nextRiddle = () => {
    setRi(i => i + 1);
    setEntry('');
    setResult(null);
    setRiddleNote(null);
    startedAt.current = Date.now();
  };

  /* ── adding jokes ──────────────────────────────────────────────── */

  const [setup, setSetup] = useState('');
  const [punch, setPunch] = useState('');
  const [field, setField] = useState<'setup' | 'punch'>('setup');
  const [saving, setSaving] = useState(false);
  const [addNote, setAddNote] = useState<{ ok: boolean; text: string } | null>(null);
  const speech = useSpeechRecognition();

  // Dictation goes into whichever line she tapped last.
  useEffect(() => {
    if (!speech.transcript) return;
    const t = speech.transcript;
    if (field === 'setup') setSetup(s => (s ? `${s} ${t}` : t).slice(0, MAX_SETUP_LENGTH));
    else setPunch(p => (p ? `${p} ${t}` : t).slice(0, MAX_PUNCHLINE_LENGTH));
    speech.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.transcript]);

  const saveJoke = async () => {
    if (!setup.trim() || saving) return;
    setSaving(true);
    setAddNote(null);
    try {
      const res = await fetch('/api/jokes', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'add', learnerId, setup,
          ...(punch.trim() ? { punchline: punch } : {}),
        }),
      });
      const d = await res.json();
      if (d.error) { setAddNote({ ok: false, text: d.error }); return; }
      setMine(d.mine ?? []);
      setJokes(d.jokes ?? []);
      setDeck([]);
      setSetup('');
      setPunch('');
      setField('setup');
      setWiggle(w => w + 1);
      playSparkle();
      setAddNote({ ok: true, text: 'The stump learned your joke! Everyone who visits can hear it now.' });
    } catch {
      // Keep her words. A failed save must never eat the joke.
      setAddNote({ ok: false, text: 'The stump didn’t catch that. Your joke is still here, so try again.' });
    } finally {
      setSaving(false);
    }
  };

  const takeOut = async (id: string) => {
    const before = mine;
    setMine(m => m.filter(j => j.id !== id));
    try {
      const res = await fetch('/api/jokes', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'remove', learnerId, jokeId: id }),
      });
      const d = await res.json();
      if (d.error) { setMine(before); setAddNote({ ok: false, text: d.error }); return; }
      setMine(d.mine ?? []);
      setJokes(d.jokes ?? []);
      setDeck([]);
    } catch {
      setMine(before);
      setAddNote({ ok: false, text: 'The stump couldn’t let go of that one. Try again.' });
    }
  };

  /* ── layout ────────────────────────────────────────────────────── */

  const tab = (m: Mode, label: string) => (
    <button
      onClick={() => { setMode(m); readAloud.stop(); }}
      aria-pressed={mode === m}
      className="rounded-xl px-3 font-bold text-sm flex-1"
      style={{
        minHeight: 52, touchAction: 'manipulation',
        background: mode === m ? LEAF : '#fffaf2',
        color: mode === m ? '#fffaf2' : INK,
        border: `2px solid ${LEAF}`,
      }}
    >{label}</button>
  );

  const bubble = (children: React.ReactNode) => (
    <div className="rounded-2xl p-4 relative"
         style={{ background: PAPER, border: `2px solid ${BARK}` }}>
      {/* the bubble's tail, pointing up at the stump */}
      <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden
           style={{ position: 'absolute', top: -15, left: '50%', marginLeft: -14 }}>
        <path d="M 0 16 L 14 0 L 28 16 Z" fill={PAPER} />
        <path d="M 0 16 L 14 0 L 28 16" fill="none" stroke={BARK} strokeWidth="2" />
      </svg>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(#e6f0d4, #d4e3bc)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href={`/garden?learner=${learnerId}`}
          className="rounded-full bg-white border border-ochre text-lg"
          aria-label="back to the garden"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold flex-1" style={{ color: INK }}>The Silly Stump</h1>
      </header>

      <main className="px-4 pb-12 max-w-xl mx-auto">
        {/* the stump itself — tap it for another joke */}
        <div className="flex flex-col items-center">
          <motion.button
            key={wiggle}
            onClick={() => { setMode('joke'); nextJoke(); }}
            aria-label="tap the stump for a joke"
            animate={reduced ? undefined : { rotate: [0, -4, 4, -2, 0] }}
            transition={{ duration: 0.5 }}
            style={{ background: 'none', border: 'none', touchAction: 'manipulation' }}
          >
            <SillyStumpArt size={170} />
          </motion.button>
          {/* credit where it is due */}
          <p className="text-xs italic mt-1" style={{ color: '#5a4a34' }}>
            Cecily’s idea · built from her letter
          </p>
        </div>

        <div className="flex gap-2 my-4">
          {tab('joke', 'tell me a joke')}
          {tab('riddle', 'math riddle')}
          {tab('add', '✏️ add my joke')}
        </div>

        {loadNote && (
          <p className="text-sm text-center" style={{ color: '#A2385A' }}>{loadNote}</p>
        )}

        {/* ── a joke ── */}
        {mode === 'joke' && loaded && current && bubble(
          <>
            <div className="flex items-start gap-2">
              <p className="text-lg font-bold flex-1" style={{ color: INK }}>{current.setup}</p>
              {speakerFor(`joke:${current.id}`,
                revealed && current.punchline ? `${current.setup} … ${current.punchline}` : current.setup)}
            </div>
            {current.punchline && !revealed && (
              <button onClick={() => { setRevealed(true); playSparkle(); readAloud.say(`joke:${current.id}`, current.punchline!); }}
                      className="rounded-xl px-4 mt-3 font-bold text-sm"
                      style={{ background: '#C9A227', color: INK, minHeight: 48, touchAction: 'manipulation' }}>
                tell me!
              </button>
            )}
            {current.punchline && revealed && (
              <motion.p
                initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
                animate={reduced ? undefined : { opacity: 1, scale: 1 }}
                className="text-lg mt-3" style={{ color: '#4a6b3a', fontWeight: 700 }}>
                {current.punchline}
              </motion.p>
            )}
            <div className="flex items-center gap-2 mt-4 pt-2" style={{ borderTop: '1px dashed #e0d4b8' }}>
              <span className="text-xs italic flex-1" style={{ color: '#8a7c62' }}>{tellerLine(current)}</span>
              <button onClick={nextJoke}
                      className="rounded-xl px-4 font-bold text-sm"
                      style={{ background: LEAF, color: '#fffaf2', minHeight: 48, touchAction: 'manipulation' }}>
                another one
              </button>
            </div>
          </>,
        )}

        {/* ── a riddle ── */}
        {mode === 'riddle' && riddle && bubble(
          <>
            <div className="flex items-start gap-2">
              <p className="text-lg font-bold flex-1" style={{ color: INK }}>{riddle.question}</p>
              {speakerFor(`riddle:${riddle.id}`, riddle.question)}
            </div>

            {/* her answer, big */}
            <div className="text-center my-3 rounded-xl py-2 text-3xl font-bold tabular-nums"
                 style={{ background: '#f4ecd8', color: INK, minHeight: 56,
                          border: '2px solid #d8c9a8' }}
                 aria-live="polite">
              {entry || <span style={{ color: '#b8a888' }}>?</span>}
            </div>

            {!result && (
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'check'].map(k => (
                  <button key={k}
                          onClick={() => (k === 'check' ? checkAnswer() : press(k))}
                          disabled={k === 'check' ? !entry || checking : false}
                          aria-label={k === 'back' ? 'erase one number' : k === 'check' ? 'check my answer' : k}
                          className="rounded-xl font-bold disabled:opacity-40"
                          style={{
                            minHeight: 64, touchAction: 'manipulation',
                            fontSize: k === 'check' ? 15 : 26,
                            background: k === 'check' ? LEAF : '#fffaf2',
                            color: k === 'check' ? '#fffaf2' : INK,
                            border: `2px solid ${k === 'check' ? LEAF : '#d8c9a8'}`,
                          }}>
                    {k === 'back' ? '⌫' : k === 'check' ? (checking ? '…' : 'check') : k}
                  </button>
                ))}
              </div>
            )}

            {result && (
              <motion.div
                initial={reduced ? undefined : { opacity: 0, y: -4 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                className="rounded-xl p-3"
                style={{
                  background: result.correct ? 'rgba(107,142,90,0.15)' : 'rgba(201,162,39,0.15)',
                  border: `2px solid ${result.correct ? LEAF : '#C9A227'}`,
                }}>
                <div className="flex items-start gap-2">
                  <p className="font-bold flex-1" style={{ color: INK }}>
                    {result.correct ? 'You got it! ' : 'Not quite. '}
                    <span style={{ fontWeight: 400 }}>{result.because}</span>
                  </p>
                  {speakerFor(`because:${riddle.id}`,
                    `${result.correct ? 'You got it!' : 'Not quite.'} ${result.because}`)}
                </div>
                {result.note && (
                  <p className="text-xs mt-1" style={{ color: '#A2385A' }}>{result.note}</p>
                )}
                <button onClick={nextRiddle}
                        className="rounded-xl px-4 mt-3 font-bold text-sm w-full"
                        style={{ background: LEAF, color: '#fffaf2', minHeight: 48, touchAction: 'manipulation' }}>
                  next riddle
                </button>
              </motion.div>
            )}

            {riddleNote && (
              <p className="text-xs mt-2" style={{ color: '#A2385A' }}>{riddleNote}</p>
            )}

            <p className="text-xs italic mt-3" style={{ color: '#8a7c62' }}>
              {seedsLeft > 0
                ? `${seedsLeft} more ${seedsLeft === 1 ? 'riddle' : 'riddles'} today will help your garden grow.`
                : 'Your garden has all its riddle seeds for today. The riddles are still here for fun!'}
            </p>
          </>,
        )}

        {/* ── adding her own ── */}
        {mode === 'add' && (
          <div className="rounded-2xl p-4" style={{ background: PAPER, border: `2px solid ${BARK}` }}>
            <label className="text-xs font-bold block mb-1" style={{ color: INK }}>
              The joke (or the question part)
            </label>
            <textarea
              value={setup}
              onFocus={() => setField('setup')}
              onChange={e => setSetup(e.target.value.slice(0, MAX_SETUP_LENGTH))}
              placeholder="Why did the cookie go to the doctor?"
              rows={2}
              className="w-full rounded-xl p-2 text-base outline-none resize-none"
              style={{ background: '#fffaf2', border: `2px solid ${field === 'setup' ? LEAF : '#d8c9a8'}`, color: INK, fontFamily: 'inherit' }}
            />
            <label className="text-xs font-bold block mt-3 mb-1" style={{ color: INK }}>
              The answer (if it has one)
            </label>
            <textarea
              value={punch}
              onFocus={() => setField('punch')}
              onChange={e => setPunch(e.target.value.slice(0, MAX_PUNCHLINE_LENGTH))}
              placeholder="Because it felt crummy!"
              rows={2}
              className="w-full rounded-xl p-2 text-base outline-none resize-none"
              style={{ background: '#fffaf2', border: `2px solid ${field === 'punch' ? LEAF : '#d8c9a8'}`, color: INK, fontFamily: 'inherit' }}
            />
            <div className="flex items-center gap-2 mt-3">
              {speech.usable && (
                <button
                  onClick={() => (speech.listening ? speech.stop() : speech.start())}
                  className="rounded-full text-lg"
                  aria-label={speech.listening ? 'stop talking' : 'say it instead of typing'}
                  style={{
                    minWidth: 44, minHeight: 44,
                    background: speech.listening ? '#c94c3e' : '#fffaf2',
                    color: speech.listening ? '#fff' : INK,
                    border: '1px solid #d8c9a8', touchAction: 'manipulation',
                  }}
                >{speech.listening ? '◼' : '🎤'}</button>
              )}
              <span className="text-xs italic flex-1" style={{ color: '#8a7c62' }}>
                {speech.listening ? 'listening — just talk' : `told by ${firstName}`}
              </span>
              <button onClick={saveJoke} disabled={!setup.trim() || saving}
                      className="rounded-xl px-5 font-bold text-sm disabled:opacity-40"
                      style={{ background: LEAF, color: '#fffaf2', minHeight: 48, touchAction: 'manipulation' }}>
                {saving ? 'teaching…' : 'teach the stump'}
              </button>
            </div>
            {addNote && (
              <p className="text-sm mt-3 font-bold" style={{ color: addNote.ok ? '#4a6b3a' : '#A2385A' }}>
                {addNote.text}
              </p>
            )}

            {mine.length > 0 && (
              <>
                <h2 className="text-sm font-bold mt-6 mb-2" style={{ color: INK }}>
                  Your jokes ({mine.length})
                </h2>
                <div className="space-y-2">
                  {mine.map(j => (
                    <div key={j.id} className="rounded-xl p-2 flex items-start gap-2"
                         style={{ background: '#fffaf2', border: '1px solid #d8c9a8' }}>
                      <div className="flex-1 text-sm" style={{ color: INK }}>
                        <div className="font-bold">{j.setup}</div>
                        {j.punchline && <div style={{ color: '#4a6b3a' }}>{j.punchline}</div>}
                      </div>
                      {speakerFor(`mine:${j.id}`, j.punchline ? `${j.setup} … ${j.punchline}` : j.setup)}
                      <button onClick={() => takeOut(j.id)}
                              aria-label="take this joke out of the stump"
                              className="rounded-full text-sm font-bold"
                              style={{ minWidth: 44, minHeight: 44, background: '#fffaf2',
                                       color: '#A2385A', border: '2px solid #d8c9a8',
                                       touchAction: 'manipulation' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
