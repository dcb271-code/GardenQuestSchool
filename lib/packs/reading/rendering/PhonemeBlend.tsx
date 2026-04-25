'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhonemeBlendContent, PhonemeBlendResponse } from '@/lib/packs/reading/types';
import { useSpeechRecognition, speechMatchesWord } from '@/lib/audio/useSpeechRecognition';

/**
 * Blend the phonemes and SAY the word.
 *
 * The point of this exercise is decoding-then-blending out loud — if
 * the child can pick the right word from a tap menu they're not
 * actually blending, they're matching. So the multiple-choice tiles
 * are HIDDEN by default. They only appear when:
 *
 *   • the browser doesn't support Speech Recognition (Firefox, etc.)
 *     → tap is the only viable input
 *   • the child has spoken the wrong word twice in a row
 *     → we offer the tiles as a soft "if you're stuck" affordance
 *   • the child taps "show choices" themselves (escape hatch)
 *
 * On supported browsers with the child on track, the only thing on
 * screen is the phoneme tiles + a big mic button.
 */
export default function PhonemeBlend({
  content, onSubmit,
}: {
  content: PhonemeBlendContent;
  onSubmit: (r: PhonemeBlendResponse) => void;
  retries: number;
}) {
  const choices = useMemo(() => {
    const all = [content.word, ...content.distractors];
    return [...all].sort(() => Math.random() - 0.5);
  }, [content.word, content.distractors]);

  const speech = useSpeechRecognition();
  const [matched, setMatched] = useState(false);
  // Count of completed-but-wrong speech attempts on THIS item. We bump
  // it from a settled-attempt effect (transcript present + listening
  // ended + no match) and use it to decide whether to reveal tiles.
  const [failedSpeechAttempts, setFailedSpeechAttempts] = useState(0);
  // Flag so we don't double-count the same failed attempt across
  // re-renders. Reset whenever a fresh start() fires.
  const failedAttemptCountedRef = useRef(false);
  const [revealChoicesManually, setRevealChoicesManually] = useState(false);

  // When we get a transcript that matches the target, auto-submit.
  useEffect(() => {
    if (matched) return;
    if (!speech.transcript && speech.alternatives.length === 0) return;
    if (speechMatchesWord(speech.transcript, speech.alternatives, content.word)) {
      setMatched(true);
      // Brief celebration before submitting so the child sees the match.
      setTimeout(() => {
        onSubmit({ chosen: content.word });
      }, 700);
    }
  }, [speech.transcript, speech.alternatives, content.word, onSubmit, matched]);

  // When a speech attempt completes with the WRONG word, register
  // that as a failure. Used to decide when to reveal tap-to-pick.
  useEffect(() => {
    if (matched) return;
    if (speech.listening) return;
    if (failedAttemptCountedRef.current) return;
    const heardSomething = speech.transcript.length > 0 || speech.alternatives.length > 0;
    if (!heardSomething) return;
    if (!speechMatchesWord(speech.transcript, speech.alternatives, content.word)) {
      failedAttemptCountedRef.current = true;
      setFailedSpeechAttempts(n => n + 1);
    }
  }, [
    matched, speech.listening, speech.transcript, speech.alternatives, content.word,
  ]);

  const heardSomething =
    !matched && (speech.transcript.length > 0 || speech.alternatives.length > 0);
  const heardButWrong =
    heardSomething &&
    !speech.listening &&
    !speechMatchesWord(speech.transcript, speech.alternatives, content.word);

  // Tiles visible when speech can't help us OR the child is struggling
  // OR they've explicitly asked for the tiles.
  const showChoices =
    !speech.supported ||
    failedSpeechAttempts >= 2 ||
    revealChoicesManually;

  return (
    <div className="space-y-5 py-3">
      {/* Prompt */}
      <div className="text-center font-display text-[20px] text-bark bg-cream/60 p-4 rounded-2xl border-2 border-ochre/40">
        {content.promptText}
      </div>

      {/* Phoneme tiles */}
      <div className="flex justify-center items-center gap-2.5">
        {content.phonemes.map((p, i) => (
          <motion.div
            key={i}
            className="bg-white border-4 border-sage rounded-2xl p-4 min-w-[52px] text-center font-mono text-bark"
            style={{ fontSize: 28, fontWeight: 700 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
          >
            {p}
          </motion.div>
        ))}
      </div>

      {/* Microphone box (only if supported) */}
      {speech.supported && (
        <MicPanel
          listening={speech.listening}
          transcript={speech.transcript}
          alternatives={speech.alternatives}
          matched={matched}
          heardButWrong={heardButWrong}
          error={speech.error}
          onStart={() => {
            // Fresh attempt — clear last transcript and arm the
            // failure counter for a new round.
            failedAttemptCountedRef.current = false;
            speech.reset();
            speech.start();
          }}
          onStop={speech.stop}
        />
      )}

      {/* Soft escape hatch — only when we're still hiding the tiles
          AND the child has at least tried the mic once. Prevents the
          first thing they see from being "or pick" which would just
          collapse back to multiple-choice matching. */}
      {speech.supported && !showChoices && (failedSpeechAttempts >= 1 || heardButWrong) && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setRevealChoicesManually(true)}
            className="font-display italic text-[13px] text-bark/55 underline-offset-2 underline hover:text-bark/80"
            style={{ touchAction: 'manipulation', minHeight: 30 }}
          >
            show me the choices instead
          </button>
        </div>
      )}

      {/* Multiple choice tiles — only when we've decided the child needs them */}
      <AnimatePresence>
        {showChoices && (
          <motion.div
            key="choices"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.9, 0.34, 1] }}
            className="space-y-3"
          >
            {speech.supported && (
              <div className="flex items-center gap-3 px-2">
                <div className="flex-1 h-px bg-ochre/30" />
                <div className="font-display italic text-[12px] text-bark/55 tracking-[0.2em] uppercase">
                  or pick the word
                </div>
                <div className="flex-1 h-px bg-ochre/30" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {choices.map((w, i) => (
                <motion.button
                  key={i}
                  onClick={() => onSubmit({ chosen: w })}
                  disabled={matched}
                  className="bg-white hover:bg-rose/20 active:bg-rose/40 border-4 border-rose rounded-2xl py-7 font-bold disabled:opacity-50"
                  style={{ touchAction: 'manipulation', minHeight: 60, fontSize: 28 }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  {w}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MicPanel({
  listening, transcript, alternatives, matched, heardButWrong, error,
  onStart, onStop,
}: {
  listening: boolean;
  transcript: string;
  alternatives: string[];
  matched: boolean;
  heardButWrong: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="bg-cream/70 border-2 border-sage rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={listening ? onStop : onStart}
          disabled={matched}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg disabled:opacity-50 ${
            listening
              ? 'bg-rose text-white'
              : matched
                ? 'bg-sage text-white'
                : 'bg-forest text-white'
          }`}
          style={{ touchAction: 'manipulation' }}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.04 }}
          aria-label={listening ? 'stop recording' : 'tap to speak'}
        >
          {/* pulsing aura while listening */}
          {listening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-rose"
              animate={{ scale: [1, 1.4, 1.7], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <span className="relative">
            {matched ? '✓' : listening ? '◼' : '🎤'}
          </span>
        </motion.button>

        <div className="flex-1">
          <div className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase">
            {matched ? 'you got it' : listening ? 'listening…' : 'say the word'}
          </div>
          <AnimatePresence mode="wait">
            {transcript || alternatives.length > 0 ? (
              <motion.div
                key={transcript || alternatives[0]}
                className="font-display text-[20px] text-bark mt-0.5"
                style={{ fontWeight: 600 }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="italic text-bark/60">i heard&nbsp;</span>
                <span style={{ color: matched ? '#6B8E5A' : heardButWrong ? '#C94C3E' : '#6B4423' }}>
                  &ldquo;{transcript || alternatives[0]}&rdquo;
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="hint"
                className="font-display italic text-[14px] text-bark/65 mt-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {listening ? 'go ahead — i&rsquo;m listening' : 'tap the mic and blend the sounds out loud'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error === 'not-allowed' && (
        <div className="font-display italic text-[12px] text-terracotta text-center">
          microphone permission was blocked — you can still pick the word below
        </div>
      )}
      {heardButWrong && (
        <div className="font-display italic text-[12px] text-bark/65 text-center">
          not quite — try saying it again
        </div>
      )}
    </div>
  );
}
