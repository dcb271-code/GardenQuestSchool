// components/child/garden/JapaneseSchoolModal.tsx
//
// Bachan's writing table, reached from the japanese garden bed.
//
// Three phases per unit, deliberately in this order:
//   learn  — flashcards. The character huge, its sound, its mnemonic.
//            No scoring, no pressure; you can page back and forth.
//   drill  — generated multiple choice, both directions (see the
//            shape → name the sound, hear the sound → find the shape).
//            A wrong tap shows the mnemonic instead of a buzzer.
//   done   — the unit is recorded and the next one opens.
//
// Characters are rendered with lang="ja" and a generous font size,
// because the whole point is that they are legible enough to copy.

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  JAPANESE_UNITS, buildDrill, isUnitUnlocked, getUnit,
  type JapaneseUnit, type DrillQuestion,
} from '@/lib/world/japaneseSchool';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

type Phase = 'units' | 'learn' | 'drill' | 'done';

export default function JapaneseSchoolModal({
  open, learnerId, onClose,
}: {
  open: boolean;
  learnerId: string;
  onClose: () => void;
}) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  const [completed, setCompleted] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('units');
  const [unitCode, setUnitCode] = useState<string | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [missed, setMissed] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [gemGranted, setGemGranted] = useState(false);

  const unit: JapaneseUnit | null = unitCode ? getUnit(unitCode) ?? null : null;
  const drill: DrillQuestion[] = useMemo(
    () => (unit ? buildDrill(unit, unit.code.length * 7 + unit.chars.length) : []),
    [unit?.code],  // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!open) return;
    setPhase('units');
    setUnitCode(null);
    setGemGranted(false);
    fetch(`/api/garden/japanese?learner=${learnerId}`)
      .then(r => r.json())
      .then(d => setCompleted(d.completed ?? []))
      .catch(() => {});
  }, [open, learnerId]);

  const startUnit = (code: string) => {
    setUnitCode(code);
    setCardIdx(0);
    setQIdx(0);
    setMissed(false);
    setWrongCount(0);
    setPhase('learn');
  };

  const answer = (idx: number) => {
    const q = drill[qIdx];
    if (idx !== q.correctIndex) {
      setMissed(true);
      setWrongCount(c => c + 1);
      return;
    }
    setMissed(false);
    if (qIdx + 1 >= drill.length) void finish();
    else setQIdx(i => i + 1);
  };

  const finish = async () => {
    setPhase('done');
    try {
      const res = await fetch('/api/garden/japanese', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, unitCode }),
      });
      const d = await res.json();
      if (Array.isArray(d.completed)) setCompleted(d.completed);
      setGemGranted(!!d.gemGranted);
    } catch { /* the celebration still shows */ }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.62))',
          backdropFilter: 'blur(2px)',
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-3 max-h-[92dvh] overflow-y-auto"
          initial={{ scale: 0.92, y: 12, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 8, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center space-y-0.5">
            <div className="text-4xl">🖌️</div>
            <div className="font-display italic text-[11px] tracking-[0.3em] uppercase text-bark/55">
              bachan&rsquo;s writing table
            </div>
            {unit && phase !== 'units' && (
              <div className="font-display text-[15px] text-bark" style={{ fontWeight: 700 }}>
                {unit.title}
                <span lang="ja" className="block text-[13px] font-normal text-bark/70">{unit.subtitle}</span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* ── UNIT LIST ─────────────────────────────────────── */}
            {phase === 'units' && (
              <motion.div key="units" className="space-y-2"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <p className="font-display italic text-[14px] text-bark/75 leading-snug text-center px-2">
                  &ldquo;Sit with me a moment,&rdquo; says Bachan. &ldquo;I will show you how the writing works.&rdquo;
                </p>
                {JAPANESE_UNITS.map(u => {
                  const done = completed.includes(u.code);
                  const unlocked = isUnitUnlocked(u.code, completed);
                  return (
                    <button
                      key={u.code}
                      disabled={!unlocked}
                      onClick={() => unlocked && startUnit(u.code)}
                      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left border-2 ${
                        done ? 'bg-forest/10 border-forest/50'
                          : unlocked ? 'bg-white border-ochre'
                            : 'bg-bark/5 border-bark/20 opacity-60'
                      }`}
                      style={{ touchAction: 'manipulation', minHeight: 56 }}
                    >
                      <span lang="ja" className="text-[20px] text-bark shrink-0" style={{ minWidth: 92 }}>
                        {unlocked ? u.subtitle : '🔒'}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-[14px] text-bark" style={{ fontWeight: 700 }}>
                          {u.title}
                        </span>
                        <span className="block font-display italic text-[11px] text-bark/55">
                          {u.kind === 'kanji' ? 'kanji' : 'hiragana'} · {u.chars.length} characters
                        </span>
                      </span>
                      {done && <span className="text-forest text-lg">✓</span>}
                    </button>
                  );
                })}
                <button
                  onClick={onClose}
                  className="w-full bg-white border-2 border-ochre rounded-full py-2.5 font-display italic text-bark/70"
                  style={{ touchAction: 'manipulation', minHeight: 48 }}
                >
                  another time
                </button>
              </motion.div>
            )}

            {/* ── LEARN (flashcards) ────────────────────────────── */}
            {phase === 'learn' && unit && (
              <motion.div key={`learn-${cardIdx}`} className="space-y-3"
                initial={reducedMotion ? undefined : { opacity: 0, x: 16 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.28 }}>
                {cardIdx === 0 && (
                  <p className="font-display italic text-[14px] text-bark/75 leading-snug text-center px-2">
                    {unit.intro}
                  </p>
                )}
                <div className="bg-white/80 border-2 border-sage/50 rounded-2xl py-5 px-4 text-center space-y-2">
                  <div lang="ja" className="text-bark leading-none" style={{ fontSize: 76, fontWeight: 500 }}>
                    {unit.chars[cardIdx].char}
                  </div>
                  <div className="font-display text-[22px] text-forest" style={{ fontWeight: 700 }}>
                    {unit.chars[cardIdx].romaji}
                    {unit.chars[cardIdx].meaning && (
                      <span className="text-bark/70 text-[16px] font-normal italic">
                        {' '}— {unit.chars[cardIdx].meaning}
                      </span>
                    )}
                  </div>
                  <div className="font-display text-[13px] text-bark/75 leading-snug">
                    {unit.chars[cardIdx].mnemonic}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {unit.chars.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= cardIdx ? 'bg-forest' : 'bg-ochre/40'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {cardIdx > 0 && (
                    <button
                      onClick={() => setCardIdx(i => i - 1)}
                      className="flex-1 bg-white border-2 border-ochre rounded-full py-3 font-display text-bark/70"
                      style={{ touchAction: 'manipulation', minHeight: 52 }}
                    >
                      ← back
                    </button>
                  )}
                  <button
                    onClick={() => cardIdx + 1 < unit.chars.length ? setCardIdx(i => i + 1) : setPhase('drill')}
                    className="flex-[2] bg-forest text-white rounded-full py-3 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 52, fontWeight: 600 }}
                  >
                    {cardIdx + 1 < unit.chars.length ? 'next →' : 'try it out →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── DRILL ─────────────────────────────────────────── */}
            {phase === 'drill' && unit && drill[qIdx] && (
              <motion.div key={`drill-${qIdx}`} className="space-y-3"
                initial={reducedMotion ? undefined : { opacity: 0, x: 16 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.28 }}>
                <div className="font-display italic text-[11px] tracking-[0.2em] uppercase text-bark/55 text-center">
                  {qIdx + 1} of {drill.length}
                </div>

                <div className="bg-white/80 border-2 border-ochre/50 rounded-2xl py-4 px-4 text-center">
                  {drill[qIdx].kind === 'read' ? (
                    <div lang="ja" className="text-bark leading-none" style={{ fontSize: 66, fontWeight: 500 }}>
                      {drill[qIdx].prompt}
                    </div>
                  ) : (
                    <div className="font-display text-[19px] text-bark" style={{ fontWeight: 600 }}>
                      {drill[qIdx].prompt}
                    </div>
                  )}
                </div>

                <div className={drill[qIdx].kind === 'write' ? 'grid grid-cols-4 gap-2' : 'space-y-2'}>
                  {drill[qIdx].choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      className="bg-white border-4 border-ochre rounded-2xl font-display text-bark hover:bg-ochre/10"
                      style={{
                        touchAction: 'manipulation',
                        minHeight: 60,
                        fontWeight: 600,
                        fontSize: drill[qIdx].kind === 'write' ? 30 : 17,
                      }}
                      {...(drill[qIdx].kind === 'write' ? { lang: 'ja' } : {})}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                {missed && (
                  <motion.div
                    className="bg-terracotta/10 border-2 border-terracotta/40 rounded-xl px-3 py-2 text-center font-display text-[13px] text-bark"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  >
                    not that one — {drill[qIdx].hint}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── DONE ──────────────────────────────────────────── */}
            {phase === 'done' && unit && (
              <motion.div key="done" className="space-y-3 text-center py-1"
                initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}>
                <div lang="ja" className="text-bark" style={{ fontSize: 40 }}>{unit.subtitle}</div>
                <div className="font-display text-[22px] text-bark" style={{ fontWeight: 700 }}>
                  <span className="italic text-forest">{unit.title}</span> — learned
                </div>
                <p className="font-display italic text-[15px] text-bark/75 leading-snug px-2">
                  {unit.outro}
                </p>
                {wrongCount === 0 && (
                  <div className="font-display text-[13px] text-forest" style={{ fontWeight: 600 }}>
                    ✨ not a single wrong tap
                  </div>
                )}
                {gemGranted && (
                  <div className="bg-white/70 border-2 border-ochre/40 rounded-2xl px-4 py-3 font-display text-[15px] text-bark">
                    💎 a <span style={{ fontWeight: 700 }}>curiosity</span> gem
                  </div>
                )}
                <button
                  onClick={() => setPhase('units')}
                  className="w-full bg-forest text-white rounded-full py-3.5 font-display"
                  style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                >
                  back to the table
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-white border-2 border-ochre rounded-full py-2.5 font-display italic text-bark/70"
                  style={{ touchAction: 'manipulation', minHeight: 48 }}
                >
                  back to the garden
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
