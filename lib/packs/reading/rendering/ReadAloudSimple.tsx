'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak } from '@/lib/audio/tts';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { GOOGLE_VOICE_PREFIX, buildTtsUrl } from '@/lib/audio/useNarrator';
import { useSpeechRecognition, speechMatchesWord } from '@/lib/audio/useSpeechRecognition';
import type { ReadAloudSimpleContent, ReadAloudSimpleResponse } from '@/lib/packs/reading/types';

/**
 * Show a word, ask the child to read it aloud. The narrator deliberately
 * does NOT speak the word on auto-narration (that would defeat the
 * exercise). The child taps the mic and reads it; speech recognition
 * verifies. A "hear it" hint button lets a stuck child hear it once.
 *
 * Falls back to self-report buttons ("I read it" / "skip") on browsers
 * without speech recognition (Firefox) or if the mic is denied.
 */
export default function ReadAloudSimple({
  content, onSubmit,
}: {
  content: ReadAloudSimpleContent;
  onSubmit: (r: ReadAloudSimpleResponse) => void;
  retries: number;
}) {
  const { settings } = useAccessibilitySettings();
  const [hintSpeaking, setHintSpeaking] = useState(false);
  const [matched, setMatched] = useState(false);
  const speech = useSpeechRecognition();

  useEffect(() => {
    if (matched) return;
    if (!speech.transcript && speech.alternatives.length === 0) return;
    if (speechMatchesWord(speech.transcript, speech.alternatives, content.word)) {
      setMatched(true);
      setTimeout(() => onSubmit({ claimed: true }), 700);
    }
  }, [speech.transcript, speech.alternatives, content.word, onSubmit, matched]);

  const heardSomething = !matched && (speech.transcript.length > 0 || speech.alternatives.length > 0);
  const heardButWrong =
    heardSomething &&
    !speech.listening &&
    !speechMatchesWord(speech.transcript, speech.alternatives, content.word);

  const hearWord = async () => {
    if (hintSpeaking) return;
    setHintSpeaking(true);
    const voiceName = settings.voiceName;
    try {
      if (voiceName?.startsWith(GOOGLE_VOICE_PREFIX)) {
        const url = buildTtsUrl(
          content.word,
          voiceName.slice(GOOGLE_VOICE_PREFIX.length),
          Math.max(0.75, settings.voiceRate - 0.05),
        );
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.onended = () => setHintSpeaking(false);
        audio.onerror = () => setHintSpeaking(false);
        await audio.play();
      } else {
        await speak(content.word, {
          voice: voiceName ?? undefined,
          rate: Math.max(0.75, settings.voiceRate - 0.05),
        });
        setHintSpeaking(false);
      }
    } catch {
      setHintSpeaking(false);
    }
  };

  return (
    <div className="space-y-6 py-4 text-center">
      <div
        className="font-display text-[20px] text-bark bg-cream/60 p-4 rounded-2xl border-2 border-ochre/40"
        style={{ fontWeight: 600 }}
      >
        {content.promptText}
      </div>

      {/* The word — large and tracked-out for easy reading */}
      <div
        className="text-[72px] font-bold text-bark tracking-wide"
        style={{ letterSpacing: '0.04em' }}
      >
        {content.word}
      </div>

      {speech.supported ? (
        <div className="bg-cream/70 border-2 border-sage rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <motion.button
              onClick={() => {
                if (matched) return;
                if (speech.listening) speech.stop();
                else { speech.reset(); speech.start(); }
              }}
              disabled={matched}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg disabled:opacity-50 ${
                matched ? 'bg-sage text-white' : speech.listening ? 'bg-rose text-white' : 'bg-forest text-white'
              }`}
              style={{ touchAction: 'manipulation' }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              aria-label={speech.listening ? 'stop recording' : 'tap to read aloud'}
            >
              {speech.listening && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-rose"
                  animate={{ scale: [1, 1.4, 1.7], opacity: [0.6, 0.2, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <span className="relative">
                {matched ? '✓' : speech.listening ? '◼' : '🎤'}
              </span>
            </motion.button>

            <div className="flex-1 text-left">
              <div className="font-display italic text-[13px] text-bark/55 tracking-[0.2em] uppercase">
                {matched ? 'you read it' : speech.listening ? 'listening…' : 'tap and read it aloud'}
              </div>
              <AnimatePresence mode="wait">
                {(speech.transcript || speech.alternatives[0]) ? (
                  <motion.div
                    key={speech.transcript || speech.alternatives[0]}
                    className="font-display text-[18px] mt-0.5"
                    style={{ fontWeight: 600 }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span className="italic text-bark/60">i heard&nbsp;</span>
                    <span style={{ color: matched ? '#6B8E5A' : heardButWrong ? '#C94C3E' : '#6B4423' }}>
                      &ldquo;{speech.transcript || speech.alternatives[0]}&rdquo;
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {speech.error === 'not-allowed' && (
            <div className="font-display italic text-[12px] text-terracotta">
              microphone permission was blocked — use the buttons below
            </div>
          )}
          {heardButWrong && (
            <div className="font-display italic text-[12px] text-bark/65">
              not quite — try again, or tap &ldquo;hear it&rdquo; for help
            </div>
          )}
        </div>
      ) : (
        <div className="font-display italic text-[13px] text-bark/55">
          mic isn&apos;t available — read it aloud and tap below
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        {!speech.supported && (
          <motion.button
            onClick={() => onSubmit({ claimed: true })}
            disabled={matched}
            className="bg-forest text-white rounded-full px-8 py-4 font-display"
            style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
            whileTap={{ scale: 0.97 }}
          >
            ✓ I read it
          </motion.button>
        )}
        <motion.button
          onClick={hearWord}
          disabled={hintSpeaking || matched}
          className="bg-white border-4 border-ochre rounded-full px-5 py-4 font-display italic text-bark/75 disabled:opacity-60"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
          whileTap={{ scale: 0.97 }}
        >
          {hintSpeaking ? '🔊 playing…' : '🔊 hear it'}
        </motion.button>
        <motion.button
          onClick={() => onSubmit({ claimed: false })}
          disabled={matched}
          className="bg-white border-4 border-ochre rounded-full px-5 py-4 font-display italic text-bark/60 disabled:opacity-60"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
          whileTap={{ scale: 0.97 }}
        >
          skip
        </motion.button>
      </div>
    </div>
  );
}
