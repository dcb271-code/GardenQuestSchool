'use client';

// The morning gate, as a child meets it. Three screens:
//   code    — a number pad; "ask a grown-up for today's code"
//   chores  — three questions, one at a time, yes / not yet
//   wait    — a seed sprouts while the garden wakes up; no clock,
//             no countdown; the rules (not this screen) end the pause
// Every prompt is spoken at once — Esme cannot read it. Cecily can,
// so it is also on the screen.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNarrator } from '@/lib/audio/useNarrator';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';
import { CHORES, CHORE_WAIT_MS, type GateStep } from '@/lib/gate/morning';
import { GATE_WORDS, CHORE_TODO } from '@/lib/gate/words';
import ReadToMeButton from '@/components/child/ReadToMeButton';

const INK = '#3f2614';

export default function GateScene({
  learnerId, firstName, initialStep, initialWaitMs, initialChores,
}: {
  learnerId: string;
  firstName: string;
  initialStep: GateStep;
  initialWaitMs: number;
  initialChores: Record<string, boolean> | null;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reduced = settings.reducedMotion;
  const [step, setStep] = useState<GateStep>(initialStep);
  const [prompt, setPrompt] = useState('');
  const { replay } = useNarrator(prompt, false, { immediate: true });
  const say = useCallback((words: string) => setPrompt(p => (p === words ? `${words} ` : words)), []);

  /* ── code ── */
  const [code, setCode] = useState('');
  const [codeNote, setCodeNote] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  /* ── chores ── */
  const [choreIndex, setChoreIndex] = useState(0);
  const answers = useRef<Record<string, boolean>>({});

  /* ── wait ── */
  const [waitMs, setWaitMs] = useState(initialWaitMs);
  const [answered, setAnswered] = useState<Record<string, boolean> | null>(initialChores);

  useEffect(() => {
    if (step === 'code') say(GATE_WORDS.early(firstName));
    if (step === 'chores') say(GATE_WORDS.choresIntro(firstName));
    if (step === 'wait') {
      const left = CHORES.filter(c => answered && answered[c.code] === false).map(c => CHORE_TODO[c.code]);
      say(left.length === 0 ? GATE_WORDS.allDone : GATE_WORDS.someLeft(left));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // The chore question is spoken when it appears.
  useEffect(() => {
    if (step !== 'chores') return;
    const c = CHORES[choreIndex];
    if (c) window.setTimeout(() => say(c.ask), choreIndex === 0 ? 2600 : 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, choreIndex]);

  // The pause: when it is over, say so and go in. The server enforces
  // the same clock, so a refresh lands back here with the remainder.
  useEffect(() => {
    if (step !== 'wait') return;
    const t = window.setTimeout(() => {
      say(GATE_WORDS.open);
      playSparkle();
      setWaitMs(0);
      window.setTimeout(() => router.push(`/garden?learner=${learnerId}`), 1800);
    }, waitMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const submitCode = async () => {
    if (!code) return;
    const res = await fetch('/api/gate/morning', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'code', learnerId, code }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setCodeNote(d.error ?? GATE_WORDS.codeWrong);
      say(d.error ?? GATE_WORDS.codeWrong);
      setShake(s => s + 1);
      setCode('');
      return;
    }
    setCodeNote(null);
    say(GATE_WORDS.codeRight);
    playSparkle();
    window.setTimeout(() => {
      if (d.step === 'open') router.push(`/garden?learner=${learnerId}`);
      else setStep(d.step ?? 'chores');
    }, 1400);
  };

  const answerChore = async (yes: boolean) => {
    const c = CHORES[choreIndex];
    if (!c) return;
    answers.current = { ...answers.current, [c.code]: yes };
    if (choreIndex + 1 < CHORES.length) { setChoreIndex(choreIndex + 1); return; }
    const res = await fetch('/api/gate/morning', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'chores', learnerId, chores: answers.current }),
    });
    const d = await res.json().catch(() => ({}));
    setAnswered(answers.current);
    setWaitMs(typeof d.remainingMs === 'number' ? d.remainingMs : CHORE_WAIT_MS);
    setStep('wait');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(#efe7d6, #e3d9c4)' }}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href="/picker"
              className="rounded-full bg-white border border-ochre text-lg"
              aria-label={GATE_WORDS.back}
              style={{ minWidth: 48, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </Link>
        <h1 className="font-bold flex-1" style={{ color: INK }}>Good morning, {firstName}</h1>
        <ReadToMeButton reading={false} onToggle={replay} label="say it again" size={64} />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-8 gap-4" style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <p className="text-base leading-relaxed rounded-2xl p-4 w-full" style={{ background: '#fffdf5', border: '1px solid #d8c9a8', color: INK }}>
          {prompt.trim()}
        </p>

        {step === 'code' && (
          <>
            <motion.div key={shake}
              animate={shake && !reduced ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl px-6 py-3 text-4xl font-bold tracking-widest"
              style={{ background: '#fffdf5', border: '2px solid #8A6A48', color: INK, minWidth: 200, minHeight: 72, textAlign: 'center' }}
              aria-label={GATE_WORDS.codeLabel}>
              {code || ' '}
            </motion.div>
            {codeNote && <p className="text-sm text-center rounded-xl px-3 py-2" style={{ background: '#4A2A1A', color: '#F0C4A8' }}>{codeNote}</p>}
            <div className="grid grid-cols-3 gap-3" style={{ width: 280 }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'open'].map(k => (
                <button key={k} type="button"
                        onClick={() => k === 'clear' ? setCode('') : k === 'open' ? void submitCode() : setCode(c => (c + k).slice(0, 4))}
                        className="rounded-2xl font-bold"
                        style={{
                          minHeight: 72, fontSize: k.length > 1 ? 16 : 30, touchAction: 'manipulation',
                          background: k === 'open' ? '#6b8e5a' : '#fffaf2',
                          color: k === 'open' ? '#fffaf2' : INK,
                          border: '2px solid #d8c9a8',
                        }}>
                  {k === 'clear' ? GATE_WORDS.codeClear : k === 'open' ? GATE_WORDS.codeEnter : k}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'chores' && CHORES[choreIndex] && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex gap-2" aria-hidden>
              {CHORES.map((c, i) => (
                <span key={c.code} className="rounded-full" style={{ width: 12, height: 12, background: i <= choreIndex ? '#6b8e5a' : '#d8c9a8' }} />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-center" style={{ color: INK }}>{CHORES[choreIndex].ask}</h2>
            <div className="flex gap-4 w-full">
              <button type="button" onClick={() => void answerChore(true)}
                      className="flex-1 rounded-2xl font-bold text-xl"
                      style={{ minHeight: 88, background: '#6b8e5a', color: '#fffaf2', touchAction: 'manipulation' }}>
                {GATE_WORDS.yes}
              </button>
              <button type="button" onClick={() => void answerChore(false)}
                      className="flex-1 rounded-2xl font-bold text-xl"
                      style={{ minHeight: 88, background: '#fffaf2', color: INK, border: '2px solid #d8c9a8', touchAction: 'manipulation' }}>
                {GATE_WORDS.notYet}
              </button>
            </div>
          </div>
        )}

        {step === 'wait' && (
          <div className="w-full flex flex-col items-center gap-4">
            <Sprout ms={waitMs} reduced={reduced} />
            {waitMs === 0 && (
              <button type="button" onClick={() => router.push(`/garden?learner=${learnerId}`)}
                      className="rounded-full px-8 font-bold text-lg"
                      style={{ minHeight: 60, background: '#6b8e5a', color: '#fffaf2', touchAction: 'manipulation' }}>
                {GATE_WORDS.goIn}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * A seed becoming a seedling over the pause — the only "clock" a
 * child sees, and it is not one: the stem grows, two leaves open, a
 * bud comes at the end. `ms` is how long is left; the stem's length
 * animates over exactly that span, so a refresh mid-pause resumes at
 * the right height.
 */
function Sprout({ ms, reduced }: { ms: number; reduced: boolean }) {
  const secs = Math.max(0.1, ms / 1000);
  const startFrac = 1 - ms / CHORE_WAIT_MS;   // how far along we already are
  return (
    <svg viewBox="0 0 240 240" width={240} height={240} aria-hidden>
      {/* soil */}
      <path d="M 20 200 Q 120 180 220 200 L 220 240 L 20 240 Z" fill="#8A6238" />
      <ellipse cx={120} cy={200} rx={18} ry={8} fill="#5A3E22" />
      {/* the stem, drawn upward */}
      <motion.path
        d="M 120 200 C 118 160, 124 130, 120 80"
        fill="none" stroke="#5E8443" strokeWidth={7} strokeLinecap="round"
        initial={{ pathLength: reduced ? 1 : startFrac }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : secs, ease: 'linear' }}
      />
      {/* two leaves, opening partway through */}
      {[[-1, 150], [1, 120]].map(([side, y], i) => (
        <motion.path key={i}
          d={`M 120 ${y} C ${120 + 20 * (side as number)} ${(y as number) - 8}, ${120 + 42 * (side as number)} ${(y as number) - 4}, ${120 + 48 * (side as number)} ${(y as number) + 10} C ${120 + 36 * (side as number)} ${(y as number) + 16}, ${120 + 12 * (side as number)} ${(y as number) + 10}, 120 ${y}`}
          fill="#7BA35A" stroke="#5E8443" strokeWidth={2}
          initial={{ scale: reduced ? 1 : (startFrac > (0.35 + i * 0.25) ? 1 : 0), opacity: reduced ? 1 : (startFrac > (0.35 + i * 0.25) ? 1 : 0) }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: reduced ? 0 : Math.max(0, secs * ((0.35 + i * 0.25) - startFrac) / Math.max(0.01, 1 - startFrac)), duration: 0.8 }}
          style={{ transformBox: 'fill-box', transformOrigin: `${side === -1 ? 'right' : 'left'} center` }}
        />
      ))}
      {/* the bud, at the very end */}
      <motion.g
        initial={{ scale: ms === 0 ? 1 : 0, opacity: ms === 0 ? 1 : 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: reduced ? 0 : secs, duration: 0.6 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
      >
        <circle cx={120} cy={74} r={13} fill="#E8B4C0" stroke="#C97B8A" strokeWidth={2} />
        <circle cx={120} cy={74} r={5} fill="#F5D98F" />
      </motion.g>
    </svg>
  );
}
