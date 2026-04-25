'use client';

import { useState } from 'react';
import { speak } from '@/lib/audio/tts';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { GOOGLE_VOICE_PREFIX, buildTtsUrl } from '@/lib/audio/useNarrator';
import type { ReadAloudSimpleContent, ReadAloudSimpleResponse } from '@/lib/packs/reading/types';

/**
 * Show a word, ask the child to read it aloud. The narrator deliberately
 * does NOT speak the word on auto-narration (that would defeat the
 * exercise). A "hear the word" hint button lets a stuck child hear it
 * spoken — marked visually as a hint.
 */
export default function ReadAloudSimple({
  content, onSubmit,
}: {
  content: ReadAloudSimpleContent;
  onSubmit: (r: ReadAloudSimpleResponse) => void;
  retries: number;
}) {
  const { settings } = useAccessibilitySettings();
  const [speaking, setSpeaking] = useState(false);

  const hearWord = async () => {
    if (speaking) return;
    setSpeaking(true);
    const voiceName = settings.voiceName;
    try {
      if (voiceName?.startsWith(GOOGLE_VOICE_PREFIX)) {
        // Use Google TTS via our cacheable GET endpoint for instant
        // playback after first hear.
        const url = buildTtsUrl(
          content.word,
          voiceName.slice(GOOGLE_VOICE_PREFIX.length),
          Math.max(0.75, settings.voiceRate - 0.05),
        );
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        await audio.play();
      } else {
        await speak(content.word, {
          voice: voiceName ?? undefined,
          rate: Math.max(0.75, settings.voiceRate - 0.05),
        });
        setSpeaking(false);
      }
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 py-6 text-center">
      <div className="font-display text-[22px] text-bark bg-cream/60 p-5 rounded-2xl border-2 border-ochre/40" style={{ fontWeight: 600 }}>
        {content.promptText}
      </div>

      <div className="text-[72px] font-bold text-bark tracking-wide" style={{ letterSpacing: '0.04em' }}>
        {content.word}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => onSubmit({ claimed: true })}
          className="bg-forest text-white rounded-full px-8 py-4 font-display"
          style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
        >
          ✓ I read it
        </button>
        <button
          onClick={hearWord}
          disabled={speaking}
          className="bg-white border-4 border-ochre rounded-full px-5 py-4 font-display italic text-bark/75 disabled:opacity-60"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          {speaking ? '🔊 playing…' : '🔊 hear it'}
        </button>
        <button
          onClick={() => onSubmit({ claimed: false })}
          className="bg-white border-4 border-ochre rounded-full px-5 py-4 font-display italic text-bark/60"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          skip
        </button>
      </div>
    </div>
  );
}
