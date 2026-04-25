'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HabitatTypeData } from '@/lib/world/habitatCatalog';
import { getHabitatQuest } from '@/lib/world/habitatQuests';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

type Phase = 'intro' | 'question' | 'celebrate' | 'building';

export default function HabitatQuestModal({
  open, habitat, learnerId, onClose, onBuilt,
}: {
  open: boolean;
  habitat: HabitatTypeData | null;
  learnerId: string;
  onClose: () => void;
  onBuilt: () => void;
}) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [shakeToken, setShakeToken] = useState(0);

  const quest = habitat ? getHabitatQuest(habitat.code) : null;

  // Reset on open / change
  useEffect(() => {
    if (open) {
      setPhase('intro');
      setQuestionIdx(0);
      setWrongOnce(false);
      setShakeToken(0);
    }
  }, [open, habitat?.code]);

  if (!habitat || !quest) return null;

  const current = quest.questions[questionIdx];
  const total = quest.questions.length;

  const onAnswer = (idx: number) => {
    if (idx === current.correctIndex) {
      // Correct — advance
      setWrongOnce(false);
      const next = questionIdx + 1;
      if (next >= total) {
        setPhase('celebrate');
      } else {
        setQuestionIdx(next);
      }
    } else {
      // Wrong — gentle shake, no penalty, allow retry
      setShakeToken(t => t + 1);
      setWrongOnce(true);
    }
  };

  const finishAndBuild = async () => {
    setPhase('building');
    try {
      await fetch('/api/garden/habitat/build', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, habitatCode: habitat.code }),
      });
      onBuilt();
    } catch (err) {
      console.error('Failed to build habitat:', err);
    } finally {
      // close after a beat so the celebration registers
      setTimeout(onClose, 250);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.4), rgba(20, 25, 40, 0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => phase !== 'building' && onClose()}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Habitat emoji + name banner */}
            <div className="text-center space-y-1">
              <div className="text-5xl">{habitat.emoji}</div>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                building a
              </div>
              <h2
                className="font-display text-[28px] text-bark leading-tight"
                style={{ fontWeight: 600, letterSpacing: '-0.015em' }}
              >
                <span className="italic text-forest">{habitat.name.toLowerCase()}</span>
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div
                  key="intro"
                  className="space-y-4 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-display italic text-[17px] text-bark/80 leading-snug px-2">
                    {quest.intro}
                  </p>
                  <p className="font-display text-[14px] text-bark/65">
                    a quick {total} questions about <span className="italic">how it works</span>.
                  </p>
                  <motion.button
                    onClick={() => setPhase('question')}
                    className="w-full bg-forest text-white rounded-full py-4 font-display"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    let&apos;s learn
                  </motion.button>
                </motion.div>
              )}

              {phase === 'question' && (
                <motion.div
                  key={`q-${questionIdx}`}
                  className="space-y-4"
                  initial={reducedMotion ? undefined : { opacity: 0, x: 18 }}
                  animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-display italic text-[12px] tracking-[0.2em] uppercase text-bark/55">
                      question {questionIdx + 1} of {total}
                    </div>
                    <ProgressDots total={total} active={questionIdx} />
                  </div>

                  <motion.div
                    key={`shake-${shakeToken}`}
                    initial={{ x: 0 }}
                    animate={shakeToken > 0 && !reducedMotion
                      ? { x: [0, -7, 7, -5, 5, -2, 0] }
                      : { x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-white/70 rounded-2xl p-4 border-2 border-ochre/40"
                  >
                    <div
                      className="font-display text-[19px] text-bark leading-snug"
                      style={{ fontWeight: 600 }}
                    >
                      {current.prompt}
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    {current.choices.map((choice, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => onAnswer(idx)}
                        className="w-full text-left bg-white border-4 border-ochre rounded-2xl px-4 py-3.5 font-display text-[17px] text-bark hover:bg-ochre/10"
                        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 500 }}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {choice}
                      </motion.button>
                    ))}
                  </div>

                  {wrongOnce && (
                    <motion.div
                      className="text-center font-display italic text-[15px] text-terracotta"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      not quite — give it another try
                    </motion.div>
                  )}
                </motion.div>
              )}

              {(phase === 'celebrate' || phase === 'building') && (
                <motion.div
                  key="celebrate"
                  className="space-y-4 text-center py-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.22, 0.9, 0.34, 1] }}
                >
                  {/* Sparkle burst around the habitat emoji (shown above) */}
                  {!reducedMotion && (
                    <div className="relative h-2">
                      <SparkleBurst />
                    </div>
                  )}
                  <div className="font-display text-[24px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                    <span className="italic text-forest">your {habitat.name.toLowerCase()}</span> is ready
                  </div>
                  <p className="font-display italic text-[16px] text-bark/75 leading-snug">
                    {quest.outro}
                  </p>
                  <motion.button
                    onClick={finishAndBuild}
                    disabled={phase === 'building'}
                    className="w-full bg-sage text-white rounded-full py-4 font-display disabled:opacity-70"
                    style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {phase === 'building' ? 'building…' : 'place it in the garden'}
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

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= active ? 'bg-forest' : 'bg-ochre/40'}`}
          animate={{ scale: i === active ? 1.3 : 1 }}
          transition={{ duration: 0.25 }}
        />
      ))}
    </div>
  );
}

function SparkleBurst() {
  return (
    <svg
      className="absolute pointer-events-none"
      width="220"
      height="80"
      viewBox="-110 -40 220 80"
      style={{ left: '50%', top: '-30px', transform: 'translateX(-50%)' }}
    >
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const dx = Math.cos(angle) * 80;
        const dy = Math.sin(angle) * 30;
        const color = ['#FFD166', '#E8A87C', '#FFB7C5', '#95B88F'][i % 4];
        return (
          <motion.circle
            key={i}
            cx={0} cy={0} r={3}
            fill={color}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: dx, y: dy, scale: 1.3, opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.04 }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        );
      })}
    </svg>
  );
}
