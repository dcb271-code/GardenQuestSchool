'use client';

// Old Bramble's storytelling. Tap the bear → pick a topic → pick a
// lesson → read a few illustrated paragraphs → "what did you learn?"
// → 2-3 comprehension questions on the takeaways.
//
// This is the reading-comprehension sibling of BunnyTeachModal. The
// bunny teaches and asks nothing; the bear tells you something true
// and then checks whether it stuck. Wrong answers are never punished:
// the passage is one tap away at all times, and a miss just sends you
// back to look again.

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNarrator } from '@/lib/audio/useNarrator';
import { playPageTurn, playSparkle, playCorrectChime, playGentleTone } from '@/lib/audio/sfx';
import ForestVisualView from './forestVisuals';
import {
  lessonsForLevel, lessonTopics, type ForestLesson,
} from '@/lib/world/forestLessons';

const TOPIC_EMOJI: Record<string, string> = {
  'sky & weather': '☁️',
  'how plants work': '🍃',
  'seeds & growing': '🌱',
  'creatures': '🦋',
  'the forest floor': '🍄',
};

type Phase = 'topics' | 'lessons' | 'reading' | 'questions' | 'done';

export default function BearTeachModal({
  open, learnerLevel, onClose,
}: {
  open: boolean;
  learnerLevel: number;
  onClose: () => void;
}) {
  const available = useMemo(() => lessonsForLevel(learnerLevel), [learnerLevel]);
  const topics = useMemo(() => lessonTopics(available), [available]);

  const [phase, setPhase] = useState<Phase>('topics');
  const [topic, setTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<ForestLesson | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  /** Questions answered correctly on the first try. */
  const [firstTry, setFirstTry] = useState(0);
  const [missedThis, setMissedThis] = useState(false);

  const page = lesson?.pages[pageIdx] ?? null;
  const question = lesson?.questions[qIdx] ?? null;

  // Narrate the passage while reading. Questions are read by the child
  // themselves — that is the point of a comprehension check.
  useNarrator(open && phase === 'reading' && page ? page.text : '', false);

  const reset = () => {
    setPhase('topics'); setTopic(null); setLesson(null);
    setPageIdx(0); setQIdx(0); setPicked(null); setFirstTry(0); setMissedThis(false);
  };
  const close = () => { reset(); onClose(); };

  const openLesson = (l: ForestLesson) => {
    playPageTurn();
    setLesson(l); setPageIdx(0); setQIdx(0); setPicked(null);
    setFirstTry(0); setMissedThis(false); setPhase('reading');
  };

  const answer = (i: number) => {
    if (!question || picked !== null) return;
    setPicked(i);
    if (i === question.correct) {
      playCorrectChime();
      if (!missedThis) setFirstTry(n => n + 1);
    } else {
      // Gentle, not a buzzer — a miss here just means "look again".
      playGentleTone();
      setMissedThis(true);
    }
  };

  const nextQuestion = () => {
    if (!lesson) return;
    if (qIdx < lesson.questions.length - 1) {
      playPageTurn();
      setQIdx(qIdx + 1); setPicked(null); setMissedThis(false);
    } else {
      playSparkle();
      setPhase('done');
    }
  };

  const total = lesson?.questions.length ?? 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(20,25,40,0.4), rgba(20,25,40,0.6))',
            backdropFilter: 'blur(2px)',
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <motion.div
            className="relative bg-cream border-4 border-terracotta rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="text-4xl">🐻</div>
              <div className="font-display italic text-[12px] tracking-[0.3em] uppercase text-bark/55">
                old bramble&apos;s
              </div>
              <h2 className="font-display text-[26px] text-bark leading-tight" style={{ fontWeight: 600 }}>
                <span className="italic text-forest">
                  {(phase === 'reading' || phase === 'questions') && lesson
                    ? lesson.title.toLowerCase()
                    : 'reading tree'}
                </span>
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {/* ── pick a topic ── */}
              {phase === 'topics' && (
                <motion.div key="topics" className="space-y-3"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="font-display italic text-[15px] text-bark/75 text-center">
                    Sit down, little one. What shall I read you about today?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {topics.map(t => (
                      <motion.button
                        key={t}
                        onClick={() => { playPageTurn(); setTopic(t); setPhase('lessons'); }}
                        className="bg-white border-4 border-ochre rounded-2xl py-4 px-2 font-display text-[15px] text-bark hover:bg-ochre/10 leading-tight"
                        style={{ touchAction: 'manipulation', minHeight: 72, fontWeight: 600 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <div className="text-2xl mb-0.5">{TOPIC_EMOJI[t] ?? '✨'}</div>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── pick a story ── */}
              {phase === 'lessons' && topic && (
                <motion.div key="lessons" className="space-y-2.5"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {available.filter(l => l.topic === topic).map(l => (
                    <motion.button
                      key={l.code}
                      onClick={() => openLesson(l)}
                      className="w-full text-left bg-white border-4 border-ochre rounded-2xl px-4 py-3 text-bark hover:bg-ochre/10 flex items-center gap-3"
                      style={{ touchAction: 'manipulation', minHeight: 64 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl shrink-0">{l.emoji}</span>
                      <span className="min-w-0">
                        <span className="block font-display text-[16px] leading-tight" style={{ fontWeight: 600 }}>
                          {l.title}
                        </span>
                        <span className="block font-display italic text-[12px] text-bark/60 leading-snug">
                          {l.teaser}
                        </span>
                      </span>
                    </motion.button>
                  ))}
                  <button
                    onClick={() => setPhase('topics')}
                    className="w-full font-display italic text-[13px] text-bark/60 underline"
                    style={{ touchAction: 'manipulation', minHeight: 36 }}
                  >← something else</button>
                </motion.div>
              )}

              {/* ── read the passage ── */}
              {phase === 'reading' && lesson && page && (
                <motion.div key={`p-${pageIdx}`} className="space-y-4"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}>
                  <div className="bg-white/80 border-2 border-ochre/40 rounded-2xl p-3">
                    <ForestVisualView visual={page.visual} />
                  </div>
                  <p className="font-display text-[16px] text-bark/90 leading-relaxed">
                    {page.text}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => pageIdx > 0 ? setPageIdx(pageIdx - 1) : setPhase('lessons')}
                      className="bg-white border-2 border-ochre rounded-full px-5 py-2.5 font-display italic text-bark/70"
                      style={{ touchAction: 'manipulation', minHeight: 48 }}
                    >← back</button>
                    <div className="flex gap-1.5">
                      {lesson.pages.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i <= pageIdx ? 'bg-forest' : 'bg-ochre/40'}`} />
                      ))}
                    </div>
                    <motion.button
                      onClick={() => {
                        if (pageIdx < lesson.pages.length - 1) { playPageTurn(); setPageIdx(pageIdx + 1); }
                        else { playPageTurn(); setPhase('questions'); }
                      }}
                      className="bg-forest text-white rounded-full px-5 py-2.5 font-display"
                      style={{ touchAction: 'manipulation', minHeight: 48, fontWeight: 600 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {pageIdx < lesson.pages.length - 1 ? 'next →' : 'ask me! ✋'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── what did you learn? ── */}
              {phase === 'questions' && lesson && question && (
                <motion.div key={`q-${qIdx}`} className="space-y-3"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}>
                  <div className="text-center">
                    <div className="font-display italic text-[12px] tracking-[0.2em] uppercase text-bark/50">
                      what did you learn? · {qIdx + 1} of {total}
                    </div>
                  </div>
                  <p className="font-display text-[17px] text-bark leading-snug text-center" style={{ fontWeight: 600 }}>
                    {question.prompt}
                  </p>

                  <div className="space-y-2">
                    {question.choices.map((c, i) => {
                      const isPicked = picked === i;
                      const isRight = i === question.correct;
                      const reveal = picked !== null;
                      const tone =
                        reveal && isRight ? 'bg-forest/15 border-forest'
                        : reveal && isPicked ? 'bg-terracotta/20 border-terracotta'
                        : 'bg-white border-ochre hover:bg-ochre/10';
                      return (
                        <motion.button
                          key={i}
                          onClick={() => answer(i)}
                          disabled={reveal}
                          className={`w-full text-left border-4 rounded-2xl px-4 py-3 font-display text-[15px] text-bark leading-snug flex items-start gap-2.5 ${tone}`}
                          style={{ touchAction: 'manipulation', minHeight: 56 }}
                          whileTap={reveal ? undefined : { scale: 0.98 }}
                        >
                          <span className="shrink-0 w-5 text-center" style={{ fontWeight: 700 }}>
                            {reveal && isRight ? '✓' : reveal && isPicked ? '✗' : String.fromCharCode(97 + i) + '.'}
                          </span>
                          <span>{c}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {picked !== null && picked === question.correct && (
                    <motion.div
                      className="bg-forest/10 border-2 border-forest/40 rounded-2xl p-3"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="font-display text-[14px] text-bark/85 leading-relaxed">
                        <span className="italic text-forest" style={{ fontWeight: 600 }}>that&apos;s it. </span>
                        {question.why}
                      </p>
                    </motion.div>
                  )}

                  {picked !== null && picked !== question.correct && (
                    <motion.div
                      className="bg-terracotta/10 border-2 border-terracotta/40 rounded-2xl p-3 space-y-2"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="font-display italic text-[14px] text-bark/80 leading-relaxed">
                        Not that one. Have another look at the story — the answer is in there.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setPicked(null); }}
                          className="flex-1 bg-white border-2 border-ochre rounded-full py-2.5 font-display text-[14px] text-bark/75"
                          style={{ touchAction: 'manipulation', minHeight: 44, fontWeight: 600 }}
                        >try again</button>
                        <button
                          onClick={() => { setPicked(null); setPageIdx(0); setPhase('reading'); }}
                          className="flex-1 bg-white border-2 border-ochre rounded-full py-2.5 font-display text-[14px] text-bark/75"
                          style={{ touchAction: 'manipulation', minHeight: 44, fontWeight: 600 }}
                        >📖 read it again</button>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => { setPicked(null); setPageIdx(lesson.pages.length - 1); setPhase('reading'); }}
                      className="bg-white border-2 border-ochre rounded-full px-4 py-2.5 font-display italic text-[13px] text-bark/70"
                      style={{ touchAction: 'manipulation', minHeight: 48 }}
                    >← the story</button>
                    {picked === question.correct && (
                      <motion.button
                        onClick={nextQuestion}
                        className="bg-forest text-white rounded-full px-6 py-2.5 font-display"
                        style={{ touchAction: 'manipulation', minHeight: 48, fontWeight: 600 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      >
                        {qIdx < total - 1 ? 'next question →' : 'finish ✓'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── done ── */}
              {phase === 'done' && lesson && (
                <motion.div key="done" className="space-y-4 text-center py-2"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="text-5xl">{lesson.emoji}</div>
                  <div className="font-display text-[15px] text-bark/70">
                    {firstTry === total
                      ? 'Every one right the first time.'
                      : `${firstTry} of ${total} right straight away — and you found the rest by going back to look. That is exactly how reading works.`}
                  </div>
                  <p className="font-display italic text-[16px] text-bark/80 leading-snug">
                    {firstTry === total
                      ? 'You did not just read that story — you kept it. Come back and I will tell you another.'
                      : 'Good reading is not remembering everything. It is knowing where to go back and check.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={reset}
                      className="flex-1 bg-white border-4 border-ochre rounded-full py-3.5 font-display text-bark/75"
                      style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                    >another story</button>
                    <button
                      onClick={close}
                      className="flex-1 bg-forest text-white rounded-full py-3.5 font-display"
                      style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
                    >back to the forest</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
