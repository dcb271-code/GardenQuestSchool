'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhonemeBlendContent, PhonemeBlendResponse } from '@/lib/packs/reading/types';
import { useSpeechRecognition, speechMatchesWord } from '@/lib/audio/useSpeechRecognition';

/**
 * Blend the phonemes and SAY the word — primary input is the
 * microphone, with multiple-choice tiles as a tap-to-pick fallback
 * for browsers without speech recognition support (Firefox) or for
 * children who'd rather tap than speak.
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

  const heardSomething =
    !matched && (speech.transcript.length > 0 || speech.alternatives.length > 0);
  const heardButWrong =
    heardSomething &&
    !speech.listening &&
    !speechMatchesWord(speech.transcript, speech.alternatives, content.word);

  return (
    <div className="space-y-5 py-3">
      {/* Prompt (kept simple — narrator reads the full prompt) */}
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
          onStart={() => { speech.reset(); speech.start(); }}
          onStop={speech.stop}
        />
      )}

      {/* Divider — only if mic is shown above */}
      {speech.supported && (
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-ochre/30" />
          <div className="font-display italic text-[12px] text-bark/55 tracking-[0.2em] uppercase">
            or pick the word
          </div>
          <div className="flex-1 h-px bg-ochre/30" />
        </div>
      )}

      {/* Multiple choice tiles — always available as tap fallback */}
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
          not quite — try saying it again, or pick from below
        </div>
      )}
    </div>
  );
}
