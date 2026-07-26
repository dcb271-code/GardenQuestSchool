// app/(child)/music/MusicScene.tsx
//
// The music room: pick a unit, read a page or two, then practise.
//
// Every answered exercise is posted to /api/music/practice, which
// writes attempt rows — so a session at the piano feeds the same
// counter that grows seeds in the garden. That was the point: practice
// here should be worth exactly what practice anywhere else is worth.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UNITS, getUnit, unitsOfStrand, isUnitUnlocked, buildExercises,
  STRAND_LABEL, STRAND_EMOJI,
  type MusicUnit, type Exercise, type Strand,
} from '@/lib/music/curriculum';
import { midiOf, BEATS, type Note } from '@/lib/music/theory';
import {
  dueUnits, badgeFor, BADGE_MARK, todayKey, type ReviewMap,
} from '@/lib/learning/review';
import { PianoKeyboard, Staff, RhythmStrip, FingerMap, keyId } from '@/components/child/music/musicVisuals';
import {
  playPitch, playSequence, playRhythm, playCountIn, playSuccessCadence,
} from '@/lib/audio/piano';

type Phase = 'menu' | 'teach' | 'practice' | 'done';

interface Result { exerciseKind: string; correct: boolean; retries: number }

const STRANDS: Strand[] = ['keyboard', 'notation', 'ear', 'rhythm'];

export default function MusicScene({ learnerId }: { learnerId: string }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [review, setReview] = useState<ReviewMap>({});
  const [phase, setPhase] = useState<Phase>('menu');
  const [unitCode, setUnitCode] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [retries, setRetries] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [wrong, setWrong] = useState(false);
  const [saved, setSaved] = useState<{ passed: boolean; gemGranted: boolean } | null>(null);
  const [seed, setSeed] = useState(1);

  const unit: MusicUnit | null = unitCode ? getUnit(unitCode) ?? null : null;
  const exercises = useMemo(
    () => (unit ? buildExercises(unit, seed) : []),
    [unit?.code, seed],  // eslint-disable-line react-hooks/exhaustive-deps
  );
  const ex: Exercise | null = exercises[exIdx] ?? null;

  useEffect(() => {
    fetch(`/api/music/practice?learner=${learnerId}`)
      .then(r => r.json())
      .then(d => { setCompleted(d.completed ?? []); setReview(d.review ?? {}); })
      .catch(() => {});
  }, [learnerId]);

  const due = useMemo(() => dueUnits(review, todayKey()), [review]);

  const start = (code: string) => {
    setUnitCode(code);
    setPage(0); setExIdx(0); setRetries(0); setResults([]); setWrong(false);
    setSaved(null);
    setSeed(Math.floor(Date.now() % 100000) + 1);
    setPhase('teach');
  };

  const recordAndAdvance = (correct: boolean) => {
    if (!ex) return;
    if (!correct) { setWrong(true); setRetries(r => r + 1); return; }
    setWrong(false);
    const next = [...results, { exerciseKind: ex.kind, correct: retries === 0, retries }];
    setResults(next);
    setRetries(0);
    if (exIdx + 1 >= exercises.length) void finish(next);
    else setExIdx(i => i + 1);
  };

  const finish = async (final: Result[]) => {
    setPhase('done');
    playSuccessCadence();
    try {
      const res = await fetch('/api/music/practice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, unitCode, results: final }),
      });
      const d = await res.json();
      if (Array.isArray(d.completed)) setCompleted(d.completed);
      if (d.review) setReview(d.review);
      setSaved({ passed: !!d.passed, gemGranted: !!d.gemGranted });
    } catch {
      setSaved({ passed: false, gemGranted: false });
    }
  };

  return (
    <div className="bg-[#F5EBDC] min-h-[100dvh] flex flex-col" style={{ paddingBottom: 'var(--scene-inset-bottom)' }}>
      <header className="flex items-center justify-between bg-cream/90 backdrop-blur border-b border-ochre/30 px-3 py-2"
              style={{ paddingTop: 'calc(0.5rem + var(--scene-inset-top))' }}>
        <Link href={`/garden?learner=${learnerId}`}
              className="text-xl p-1.5 rounded-full bg-white border border-ochre"
              aria-label="back to the garden"
              style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>←</Link>
        <h1 className="font-display text-[22px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span className="italic">the</span> music room
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="flex-1 p-4 max-w-lg w-full mx-auto">
        <AnimatePresence mode="wait">
          {/* ── MENU ─────────────────────────────────────────────── */}
          {phase === 'menu' && (
            <motion.div key="menu" className="space-y-4"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p className="font-display italic text-[15px] text-bark/75 text-center leading-snug">
                Four things a pianist needs. Start wherever your lesson is.
              </p>

              {/* Spaced review — the units she was shakiest on come back
                  first, and a clean run pushes one weeks away. */}
              {due.length > 0 && (
                <div className="bg-terracotta/10 border-2 border-terracotta/40 rounded-2xl p-3 space-y-2">
                  <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/60">
                    ↻ ready for another go
                  </div>
                  {due.slice(0, 3).map(code => {
                    const u = getUnit(code);
                    if (!u) return null;
                    return (
                      <button key={code} onClick={() => start(code)}
                        className="w-full text-left bg-white border-2 border-terracotta rounded-xl px-3 py-2"
                        style={{ touchAction: 'manipulation', minHeight: 50 }}>
                        <span className="block font-display text-[14px] text-bark" style={{ fontWeight: 700 }}>
                          {STRAND_EMOJI[u.strand]} {u.title}
                        </span>
                        <span className="block font-display italic text-[11px] text-bark/60">
                          a quick refresher — new questions each time
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {STRANDS.map(strand => (
                <div key={strand} className="space-y-1.5">
                  <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/55">
                    {STRAND_EMOJI[strand]} {STRAND_LABEL[strand]}
                  </div>
                  {unitsOfStrand(strand).map(u => {
                    const done = completed.includes(u.code);
                    const open = isUnitUnlocked(u.code, completed);
                    return (
                      <button key={u.code} disabled={!open} onClick={() => open && start(u.code)}
                        className={`w-full text-left rounded-2xl px-3 py-2.5 border-2 ${
                          done ? 'bg-forest/10 border-forest/50'
                            : open ? 'bg-white border-ochre' : 'bg-bark/5 border-bark/20 opacity-60'
                        }`}
                        style={{ touchAction: 'manipulation', minHeight: 54 }}>
                        <div className="flex items-center gap-2">
                          <span className="flex-1">
                            <span className="block font-display text-[15px] text-bark" style={{ fontWeight: 700 }}>
                              {open ? u.title : '🔒 ' + u.title}
                              {BADGE_MARK[badgeFor(review[u.code])] && (
                                <span className="ml-1">{BADGE_MARK[badgeFor(review[u.code])]}</span>
                              )}
                            </span>
                            <span className="block font-display italic text-[12px] text-bark/60">{u.blurb}</span>
                          </span>
                          {due.includes(u.code) && (
                            <span className="text-[10px] font-display italic text-terracotta border border-terracotta/50 rounded-full px-2 py-0.5">
                              review
                            </span>
                          )}
                          {done && <span className="text-forest text-lg">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div className="text-center font-display italic text-[12px] text-bark/55 pt-1">
                every answer here grows your garden too 🌱
              </div>
            </motion.div>
          )}

          {/* ── TEACH ────────────────────────────────────────────── */}
          {phase === 'teach' && unit && (
            <motion.div key={`teach-${page}`} className="space-y-4"
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
              <div className="text-center">
                <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/55">
                  {STRAND_EMOJI[unit.strand]} {unit.title}
                </div>
                <h2 className="font-display text-[22px] text-bark" style={{ fontWeight: 700 }}>
                  {unit.teach[page].heading}
                </h2>
              </div>
              <Figure page={unit.teach[page]} />
              <p className="font-display text-[15px] text-bark/85 leading-relaxed">
                {unit.teach[page].body}
              </p>
              <div className="flex gap-2">
                {page > 0 && (
                  <button onClick={() => setPage(p => p - 1)}
                    className="flex-1 bg-white border-2 border-ochre rounded-full py-3 font-display text-bark/70"
                    style={{ touchAction: 'manipulation', minHeight: 52 }}>← back</button>
                )}
                <button
                  onClick={() => page + 1 < unit.teach.length ? setPage(p => p + 1) : setPhase('practice')}
                  className="flex-[2] bg-forest text-white rounded-full py-3 font-display"
                  style={{ touchAction: 'manipulation', minHeight: 52, fontWeight: 600 }}>
                  {page + 1 < unit.teach.length ? 'next →' : "let's practise →"}
                </button>
              </div>
              <button onClick={() => setPhase('menu')}
                className="w-full font-display italic text-[13px] text-bark/50"
                style={{ touchAction: 'manipulation', minHeight: 40 }}>back to the list</button>
            </motion.div>
          )}

          {/* ── PRACTICE ─────────────────────────────────────────── */}
          {phase === 'practice' && unit && ex && (
            <motion.div key={`ex-${exIdx}`} className="space-y-3"
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
              <div className="flex items-center justify-between">
                <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/55">
                  {exIdx + 1} of {exercises.length}
                </div>
                <div className="flex gap-1.5">
                  {exercises.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < exIdx ? 'bg-forest' : i === exIdx ? 'bg-ochre' : 'bg-ochre/30'}`} />
                  ))}
                </div>
              </div>

              <div className="bg-white/80 border-2 border-ochre/50 rounded-2xl p-3">
                <div className="font-display text-[17px] text-bark text-center leading-snug" style={{ fontWeight: 600 }}>
                  {ex.prompt}
                </div>
              </div>

              <ExerciseView ex={ex} onAnswer={recordAndAdvance} />

              {wrong && (
                <motion.div className="bg-terracotta/10 border-2 border-terracotta/40 rounded-xl px-3 py-2 text-center font-display text-[13px] text-bark"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  {ex.hint}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── DONE ─────────────────────────────────────────────── */}
          {phase === 'done' && unit && (
            <motion.div key="done" className="space-y-4 text-center pt-6"
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-5xl">🎹</div>
              <h2 className="font-display text-[24px] text-bark" style={{ fontWeight: 700 }}>
                <span className="italic text-forest">{unit.title}</span>
              </h2>
              <p className="font-display italic text-[15px] text-bark/80 leading-snug px-2">{unit.outro}</p>
              <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark">
                {results.filter(r => r.correct).length} of {results.length} first time
                <div className="text-[13px] text-forest mt-1" style={{ fontWeight: 600 }}>
                  🌱 {results.length} answers counted toward your garden
                </div>
              </div>
              {saved?.gemGranted && (
                <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark">
                  💎 a <span style={{ fontWeight: 700 }}>practice</span> gem
                </div>
              )}
              <button onClick={() => setPhase('menu')}
                className="w-full bg-forest text-white rounded-full py-3.5 font-display"
                style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}>
                back to the music room
              </button>
              <Link href={`/garden?learner=${learnerId}`}
                className="block w-full bg-white border-2 border-ochre rounded-full py-3 font-display italic text-bark/70"
                style={{ touchAction: 'manipulation', minHeight: 52 }}>
                back to the garden
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── FIGURES ON TEACHING PAGES ─────────────────────────────────────────

function Figure({ page }: { page: MusicUnit['teach'][number] }) {
  const f = page.figure;
  if (!f) return null;
  if (f.kind === 'keyboard') {
    return <PianoKeyboard octaves={f.octaves ?? 1} highlight={f.highlight ?? []}
                          labelWhite={f.labelWhite} disabled />;
  }
  if (f.kind === 'staff') return <Staff notes={f.notes} caption={f.caption} clef={f.clef ?? 'treble'} />;
  if (f.kind === 'rhythm') return <RhythmStrip pattern={f.pattern} />;
  return <FingerMap />;
}

// ─── EXERCISE RENDERERS ────────────────────────────────────────────────

function ExerciseView({ ex, onAnswer }: { ex: Exercise; onAnswer: (correct: boolean) => void }) {
  if (ex.kind === 'find_key') return <FindKey ex={ex} onAnswer={onAnswer} />;
  if (ex.kind === 'tap_rhythm') return <TapRhythm ex={ex} onAnswer={onAnswer} />;
  if (ex.kind === 'echo_melody') return <EchoMelody ex={ex} onAnswer={onAnswer} />;

  // Everything else is a picture plus multiple choice.
  return (
    <div className="space-y-3">
      {ex.kind === 'read_note' && <Staff notes={[ex.note]} clef={ex.clef ?? 'treble'} />}
      {ex.kind === 'read_rhythm' && <RhythmStrip pattern={ex.pattern} />}
      {ex.kind === 'listen' && <ListenButton midis={ex.midis} together={ex.playTogether} />}
      <div className="space-y-2">
        {ex.choices.map((c, i) => (
          <motion.button key={i} onClick={() => onAnswer(i === ex.correctIndex)}
            className="w-full bg-white border-4 border-ochre rounded-2xl px-4 py-3 font-display text-[17px] text-bark"
            style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
            whileTap={{ scale: 0.98 }}>
            {c}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ListenButton({ midis, together }: { midis: number[]; together?: boolean }) {
  const play = () => {
    if (together) midis.forEach(m => playPitch(m, 1.1));
    else playSequence(midis);
  };
  useEffect(() => { const t = setTimeout(play, 350); return () => clearTimeout(t); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [midis.join(',')]);
  return (
    <button onClick={play}
      className="w-full bg-sage/15 border-4 border-sage rounded-2xl py-5 font-display text-bark"
      style={{ touchAction: 'manipulation', minHeight: 76, fontWeight: 700 }}>
      🔊 play it again
    </button>
  );
}

function FindKey({ ex, onAnswer }: { ex: Extract<Exercise, { kind: 'find_key' }>; onAnswer: (c: boolean) => void }) {
  const [tapped, setTapped] = useState<string | null>(null);
  const check = (note: Note, id: string) => {
    playPitch(midiOf(note), 0.9);
    setTapped(id);
    const isBlack = !!note.sharp;
    let correct: boolean;
    if (ex.answer === 'group2') correct = isBlack && (note.letter === 'C' || note.letter === 'D');
    else if (ex.answer === 'group3') correct = isBlack && ['F', 'G', 'A'].includes(note.letter);
    else correct = !isBlack && note.letter === ex.answer;
    window.setTimeout(() => onAnswer(correct), 260);
  };
  return (
    <PianoKeyboard octaves={2} onTapKey={check} highlight={tapped ? [tapped] : []} width={330} />
  );
}

function TapRhythm({ ex, onAnswer }: { ex: Extract<Exercise, { kind: 'tap_rhythm' }>; onAnswer: (c: boolean) => void }) {
  const [state, setState] = useState<'idle' | 'playing' | 'ready' | 'tapping'>('idle');
  const taps = useRef<number[]>([]);
  const t0 = useRef(0);

  const beats = ex.pattern.map(v => BEATS[v]);
  const beatSec = 60 / ex.bpm;

  const listen = () => {
    setState('playing');
    const lead = playCountIn(ex.bpm);
    window.setTimeout(() => {
      const dur = playRhythm(beats, ex.bpm);
      window.setTimeout(() => setState('ready'), dur * 1000 + 250);
    }, lead * 1000);
  };

  const tap = () => {
    const now = performance.now();
    if (state === 'ready') { setState('tapping'); taps.current = [0]; t0.current = now; playPitch(72, 0.2, 0, 0.24); return; }
    if (state !== 'tapping') return;
    playPitch(72, 0.2, 0, 0.24);
    taps.current.push((now - t0.current) / 1000);
    if (taps.current.length >= beats.length) {
      // Compare the gaps between taps to the gaps the rhythm wants.
      const wantGaps = beats.slice(0, -1).map(b => b * beatSec);
      const gotGaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const ok = wantGaps.every((w, i) => Math.abs((gotGaps[i] ?? 0) - w) <= Math.max(0.28, w * 0.45));
      window.setTimeout(() => onAnswer(ok), 220);
      setState('idle');
    }
  };

  return (
    <div className="space-y-3">
      <RhythmStrip pattern={ex.pattern} />
      {state === 'idle' || state === 'playing' ? (
        <button onClick={listen} disabled={state === 'playing'}
          className="w-full bg-sage/15 border-4 border-sage rounded-2xl py-5 font-display text-bark disabled:opacity-60"
          style={{ touchAction: 'manipulation', minHeight: 76, fontWeight: 700 }}>
          {state === 'playing' ? 'listen…' : '🔊 play the rhythm'}
        </button>
      ) : (
        <button onClick={tap}
          className="w-full bg-terracotta/15 border-4 border-terracotta rounded-2xl py-8 font-display text-bark"
          style={{ touchAction: 'manipulation', minHeight: 104, fontWeight: 700 }}>
          {state === 'ready' ? '👆 tap to start' : `tapping… ${taps.current.length}/${beats.length}`}
        </button>
      )}
    </div>
  );
}

/**
 * ECHO THE DITTY — Cecily's idea.
 *
 * A short melody plays, with the stones lighting as each note sounds
 * (or not, in the by-ear units). Then she plays it back on the
 * keyboard. Imitation before notation: the child holds a phrase in her
 * head and reproduces it, which is the foundation Gordon and Suzuki
 * both build on.
 *
 * Kind to be wrong: playing a wrong note doesn't end the attempt, it
 * just resets the phrase so she can try again, and she can replay the
 * tune as many times as she likes.
 */
function EchoMelody({
  ex, onAnswer,
}: {
  ex: Extract<Exercise, { kind: 'echo_melody' }>;
  onAnswer: (correct: boolean) => void;
}) {
  const [lit, setLit] = useState<string | null>(null);
  const [played, setPlayed] = useState<number[]>([]);
  const [state, setState] = useState<'idle' | 'playing' | 'your-turn'>('idle');
  const [slipped, setSlipped] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setPlayed([]); setSlipped(false); setState('idle');
    return () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; };
  }, [ex.midis.join(',')]);

  const noteFor = (midi: number): Note => {
    // Everything here lives in C position, so a small lookup is enough.
    const map: Record<number, Note> = {
      60: { letter: 'C', octave: 4 }, 62: { letter: 'D', octave: 4 },
      64: { letter: 'E', octave: 4 }, 65: { letter: 'F', octave: 4 },
      67: { letter: 'G', octave: 4 },
    };
    return map[midi] ?? { letter: 'C', octave: 4 };
  };

  const listen = () => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
    setState('playing');
    setPlayed([]);
    setSlipped(false);
    let t = 0;
    ex.midis.forEach((m, i) => {
      const beats = ex.beats?.[i] ?? 1;
      const secs = beats * 0.55;
      playPitch(m, Math.max(secs * 0.95, 0.4), t);
      const at = t * 1000;
      timers.current.push(window.setTimeout(
        () => setLit(ex.showLights ? keyId(noteFor(m)) : null), at));
      timers.current.push(window.setTimeout(() => setLit(null), at + secs * 900));
      t += secs;
    });
    timers.current.push(window.setTimeout(() => setState('your-turn'), t * 1000 + 220));
  };

  const tap = (note: Note) => {
    if (state !== 'your-turn') return;
    const midi = midiOf(note);
    playPitch(midi, 0.8);
    const next = [...played, midi];
    const i = next.length - 1;
    if (midi !== ex.midis[i]) {
      // Wrong note — show it, then quietly reset so she can try again.
      setSlipped(true);
      setPlayed([]);
      window.setTimeout(() => setSlipped(false), 900);
      return;
    }
    setPlayed(next);
    if (next.length === ex.midis.length) {
      window.setTimeout(() => onAnswer(true), 320);
    }
  };

  return (
    <div className="space-y-3">
      <PianoKeyboard
        octaves={1}
        width={330}
        labelWhite
        highlight={lit ? [lit] : []}
        onTapKey={(n) => tap(n)}
        disabled={state !== 'your-turn'}
      />

      {/* how much of the phrase she has echoed back */}
      <div className="flex justify-center gap-1.5">
        {ex.midis.map((_, i) => (
          <div key={i}
               className={`w-3 h-3 rounded-full ${i < played.length ? 'bg-forest' : 'bg-ochre/30'}`} />
        ))}
      </div>

      {state === 'your-turn' ? (
        <div className="text-center font-display italic text-[14px] text-forest" style={{ fontWeight: 600 }}>
          {slipped ? 'not that one — listen again and start over' : 'your turn — play it back'}
        </div>
      ) : (
        <div className="text-center font-display italic text-[13px] text-bark/55">
          {state === 'playing' ? 'listening…' : 'press play when you are ready'}
        </div>
      )}

      <button onClick={listen} disabled={state === 'playing'}
        className="w-full bg-sage/15 border-4 border-sage rounded-2xl py-4 font-display text-bark disabled:opacity-60"
        style={{ touchAction: 'manipulation', minHeight: 66, fontWeight: 700 }}>
        {state === 'idle' ? '🔊 play the ditty' : '🔊 play it again'}
      </button>
    </div>
  );
}
