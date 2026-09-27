'use client';

// The morning gate, as a child meets it. Three screens:
//   code    — a number pad; "ask a grown-up for today's code"
//   chores  — the checklist: up to three, tick at least one, "done"
//   wait    — the sun comes up over the garden gate; no clock, no
//             countdown; the rules (not this screen) end the pause
// Every prompt is spoken at once — Esme cannot read it. Cecily can,
// so it is also on the screen.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNarrator } from '@/lib/audio/useNarrator';
import { useReadAloud } from '@/lib/audio/useReadAloud';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { playSparkle } from '@/lib/audio/sfx';
import { CHORE_WAIT_MS, choreQuestion, type GateStep, type MorningConfig } from '@/lib/gate/morning';
import { GATE_WORDS, hourWord } from '@/lib/gate/words';
import { ChoreGlyph, TickBox, Sunrise } from '@/components/child/gate/GateArt';
import ReadToMeButton from '@/components/child/ReadToMeButton';

const INK = '#3f2614';

export default function GateScene({
  learnerId, firstName, config, initialStep, initialWaitMs, initialChores,
}: {
  learnerId: string;
  firstName: string;
  config: MorningConfig;
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
  const rowSpeech = useReadAloud();

  /* ── code ── */
  const [code, setCode] = useState('');
  const [codeNote, setCodeNote] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  /* ── chores ── */
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [choreNote, setChoreNote] = useState<string | null>(null);
  const anyTicked = config.chores.some(c => ticked[c.id]);

  /* ── wait ── */
  const [waitMs, setWaitMs] = useState(initialWaitMs);
  const [answered, setAnswered] = useState<Record<string, boolean> | null>(initialChores);

  useEffect(() => {
    if (step === 'code') say(GATE_WORDS.early(firstName, hourWord(config.cutoffHour)));
    if (step === 'chores') say(GATE_WORDS.choresIntro(firstName));
    if (step === 'wait') {
      const left = config.chores.filter(c => answered && !answered[c.id]).map(c => c.text);
      say(left.length === 0 ? GATE_WORDS.allDone : GATE_WORDS.someLeft(left));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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

  const tick = (id: string, text: string) => {
    setTicked(t => ({ ...t, [id]: !t[id] }));
    setChoreNote(null);
    // a tap on a row says the chore, for a child who cannot read the row
    rowSpeech.say(`chore:${id}`, choreQuestion({ text }));
  };

  const submitChores = async () => {
    if (!anyTicked) { setChoreNote(GATE_WORDS.tickOne); say(GATE_WORDS.tickOne); return; }
    const res = await fetch('/api/gate/morning', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'chores', learnerId, ticked: Object.keys(ticked).filter(k => ticked[k]) }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setChoreNote(d.error ?? GATE_WORDS.tickOne); say(d.error ?? GATE_WORDS.tickOne); return; }
    const answers: Record<string, boolean> = {};
    for (const c of config.chores) answers[c.id] = !!ticked[c.id];
    setAnswered(answers);
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

        {step === 'chores' && (
          <div className="w-full flex flex-col gap-3">
            {config.chores.map(c => (
              <button key={c.id} type="button" onClick={() => tick(c.id, c.text)}
                      role="checkbox" aria-checked={!!ticked[c.id]}
                      className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left"
                      style={{
                        minHeight: 84, touchAction: 'manipulation',
                        background: ticked[c.id] ? '#E8F0D8' : '#fffaf2',
                        border: `2px solid ${ticked[c.id] ? '#6b8e5a' : '#d8c9a8'}`,
                        color: INK,
                      }}>
                <TickBox ticked={!!ticked[c.id]} />
                <svg viewBox="0 0 48 48" width={56} height={56} aria-hidden><ChoreGlyph icon={c.icon} /></svg>
                <span className="text-xl font-bold flex-1">{choreQuestion(c)}</span>
              </button>
            ))}
            {choreNote && <p className="text-sm text-center rounded-xl px-3 py-2" style={{ background: '#4A2A1A', color: '#F0C4A8' }}>{choreNote}</p>}
            <button type="button" onClick={() => void submitChores()}
                    className="w-full rounded-2xl font-bold text-xl"
                    style={{
                      minHeight: 72, touchAction: 'manipulation',
                      background: anyTicked ? '#6b8e5a' : '#d8c9a8', color: anyTicked ? '#fffaf2' : '#8a7c62',
                    }}>
              {GATE_WORDS.done}
            </button>
          </div>
        )}

        {step === 'wait' && (
          <div className="w-full flex flex-col items-center gap-4">
            <Sunrise ms={waitMs} total={CHORE_WAIT_MS} reduced={reduced} />
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
