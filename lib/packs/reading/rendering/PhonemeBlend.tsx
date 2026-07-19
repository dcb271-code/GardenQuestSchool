'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhonemeBlendContent, PhonemeBlendResponse } from '@/lib/packs/reading/types';
import { useSpeechRecognition, speechMatchesWord, presentableHeardWord } from '@/lib/audio/useSpeechRecognition';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { buildTtsUrl, GOOGLE_VOICE_PREFIX } from '@/lib/audio/useNarrator';
import { speak } from '@/lib/audio/tts';
import { decoyPhonemes } from '@/lib/packs/reading/distractors';

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
 *
 * WITHOUT speech recognition (many tablets/kiosk browsers), the old
 * fallback showed the phoneme tiles spelling the word right next to
 * word choices — pure visual letter-matching, no phonics at all. The
 * fallback is now LISTEN-AND-BUILD: the child taps 🔊 to hear the
 * word (the spelling is never shown), then builds it from a bank of
 * phoneme tiles that includes near-sound decoys. Ears first, then
 * encoding — the inverse of the speaking path, but honestly phonemic.
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

  // ── Listen-and-build mode (no speech recognition available) ──────
  const { settings } = useAccessibilitySettings();
  const buildMode = !speech.supported;
  // Deterministic tile bank: target phonemes + near-sound decoys,
  // shuffled by a hash of the word so the layout is stable per item.
  const bank = useMemo(() => {
    if (!buildMode) return [];
    const tiles = [
      ...content.phonemes.map((p, i) => ({ id: `t${i}`, label: p })),
      ...decoyPhonemes(content.phonemes, Math.min(3, Math.max(2, content.phonemes.length - 1)))
        .map((p, i) => ({ id: `d${i}`, label: p })),
    ];
    let h = 0;
    for (const ch of content.word) h = (h * 31 + ch.charCodeAt(0)) | 0;
    for (let i = tiles.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223) | 0;
      const j = Math.abs(h) % (i + 1);
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }, [buildMode, content.phonemes, content.word]);
  // Slot contents: tile ids (null = empty), one slot per phoneme.
  const [slots, setSlots] = useState<(string | null)[]>(
    () => content.phonemes.map(() => null),
  );
  const [speaking, setSpeaking] = useState(false);
  const [checking, setChecking] = useState<'ok' | 'no' | null>(null);
  const playedOnceRef = useRef(false);

  const hearWord = async () => {
    if (speaking) return;
    setSpeaking(true);
    const voiceName = settings.voiceName;
    const rate = Math.max(0.75, (settings.voiceRate ?? 0.88) - 0.05);
    try {
      if (voiceName?.startsWith(GOOGLE_VOICE_PREFIX)) {
        const audio = new Audio(buildTtsUrl(content.word, voiceName.slice(GOOGLE_VOICE_PREFIX.length), rate));
        audio.preload = 'auto';
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        await audio.play();
      } else {
        await speak(content.word, { voice: voiceName ?? undefined, rate });
        setSpeaking(false);
      }
    } catch {
      setSpeaking(false);
    }
  };

  // Say the word once when the item appears in build mode.
  useEffect(() => {
    if (buildMode && !playedOnceRef.current) {
      playedOnceRef.current = true;
      const t = setTimeout(hearWord, 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildMode]);

  const labelOf = (id: string) => bank.find(t => t.id === id)?.label ?? '';
  const placeTile = (id: string) => {
    if (checking) return;
    setSlots(prev => {
      if (prev.includes(id)) return prev;
      const idx = prev.indexOf(null);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = id;
      return next;
    });
  };
  const removeSlot = (slotIdx: number) => {
    if (checking) return;
    setSlots(prev => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  // When every slot is filled, check the built word.
  useEffect(() => {
    if (!buildMode || checking) return;
    if (slots.some(sl => sl === null)) return;
    const built = slots.map(id => labelOf(id!)).join('');
    const correct = built.toLowerCase() === content.word.toLowerCase();
    setChecking(correct ? 'ok' : 'no');
    setTimeout(() => {
      onSubmit({ chosen: correct ? content.word : built });
      if (!correct) {
        // The lesson keeps the item on a retry — reset for another go.
        setSlots(content.phonemes.map(() => null));
        setChecking(null);
      }
    }, correct ? 700 : 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, buildMode, checking]);

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

  if (buildMode) {
    return (
      <div className="space-y-5 py-3">
        <div className="text-center font-display text-[20px] text-bark bg-cream/60 p-4 rounded-2xl border-2 border-ochre/40">
          Listen, then build the word you hear.
        </div>

        {/* Hear the word — the spelling is never shown in this mode */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={hearWord}
            className="bg-forest text-white rounded-full px-8 py-4 font-display flex items-center gap-3"
            style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600, fontSize: 18 }}
            whileTap={{ scale: 0.96 }}
            animate={speaking ? { scale: [1, 1.04, 1] } : undefined}
            transition={speaking ? { duration: 0.8, repeat: Infinity } : undefined}
          >
            <span className="text-2xl">🔊</span>
            hear the word
          </motion.button>
        </div>

        {/* Slots — one per sound */}
        <div className="flex justify-center items-center gap-2.5">
          {slots.map((id, i) => (
            <motion.button
              key={`slot-${i}`}
              type="button"
              onClick={() => id && removeSlot(i)}
              className={`rounded-2xl p-4 min-w-[56px] min-h-[64px] text-center font-mono border-4 ${
                id
                  ? checking === 'ok'
                    ? 'bg-sage/30 border-sage text-bark'
                    : checking === 'no'
                      ? 'bg-rose/20 border-rose text-bark'
                      : 'bg-white border-sage text-bark'
                  : 'bg-cream/60 border-dashed border-ochre/60 text-bark/30'
              }`}
              style={{ fontSize: 26, fontWeight: 700, touchAction: 'manipulation' }}
              animate={checking === 'no' ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
              transition={{ duration: 0.45 }}
            >
              {id ? labelOf(id) : '·'}
            </motion.button>
          ))}
        </div>

        {/* Tile bank */}
        <div className="flex justify-center items-center gap-2.5 flex-wrap px-2">
          {bank.map(tile => {
            const used = slots.includes(tile.id);
            return (
              <motion.button
                key={tile.id}
                type="button"
                onClick={() => placeTile(tile.id)}
                disabled={used || checking !== null}
                className={`rounded-2xl p-4 min-w-[56px] text-center font-mono border-4 ${
                  used
                    ? 'bg-cream/40 border-ochre/30 text-bark/25'
                    : 'bg-white border-ochre text-bark hover:bg-ochre/15'
                }`}
                style={{ fontSize: 26, fontWeight: 700, touchAction: 'manipulation', minHeight: 60 }}
                whileTap={!used ? { scale: 0.94 } : undefined}
              >
                {tile.label}
              </motion.button>
            );
          })}
        </div>

        <div className="text-center font-display italic text-[13px] text-bark/55">
          tap the sounds in order — tap a filled box to put one back
        </div>
      </div>
    );
  }

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
            {(() => {
              // Only ever show a CLEANED single word from a final
              // result — raw interim hypotheses are frequently garbled
              // and have no business on a child's screen.
              const heard = !listening && (transcript || alternatives.length > 0)
                ? presentableHeardWord(transcript, alternatives)
                : null;
              if (heard) {
                return (
                  <motion.div
                    key={heard}
                    className="font-display text-[20px] text-bark mt-0.5"
                    style={{ fontWeight: 600 }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span className="italic text-bark/60">i heard&nbsp;</span>
                    <span style={{ color: matched ? '#6B8E5A' : heardButWrong ? '#C94C3E' : '#6B4423' }}>
                      &ldquo;{heard}&rdquo;
                    </span>
                  </motion.div>
                );
              }
              if (!listening && (transcript || alternatives.length > 0) && !matched) {
                return (
                  <motion.div
                    key="unclear"
                    className="font-display italic text-[14px] text-bark/65 mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    hmm, i didn&rsquo;t quite catch that — try once more
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key="hint"
                  className="font-display italic text-[14px] text-bark/65 mt-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {listening ? 'go ahead — i\u2019m listening' : 'tap the mic and blend the sounds out loud'}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      {(error === 'start-failed' || error === 'network') && (
        <div className="font-display italic text-[12px] text-terracotta text-center">
          the microphone had trouble starting — tap it once more, or use the tiles below
        </div>
      )}
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
