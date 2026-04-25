'use client';

import { useCallback, useEffect, useRef } from 'react';
import { speak as webSpeak, stopSpeaking } from './tts';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

// Voice names that start with this prefix are Google Cloud voices.
// Everything else is treated as a Web Speech API voice name.
export const GOOGLE_VOICE_PREFIX = 'google:';

/**
 * Build the GET URL for the /api/tts proxy. Browser HTTP cache will hit
 * for repeated prompts, so the same word/sentence never triggers a
 * second network round-trip on the device.
 */
export function buildTtsUrl(text: string, voice: string, rate: number): string {
  const params = new URLSearchParams({
    text,
    voice,
    rate: rate.toFixed(2),
  });
  return `/api/tts?${params.toString()}`;
}

/**
 * Fire-and-forget audio prefetch. Browsers will keep the response in
 * the HTTP cache, so a subsequent <audio src=...>.play() is instant.
 */
export function prefetchTts(text: string, voice: string, rate: number): void {
  if (typeof window === 'undefined' || !text.trim()) return;
  // Use Image-style prefetch via fetch with low priority. Keep the
  // promise alive without blocking.
  void fetch(buildTtsUrl(text, voice, rate), {
    method: 'GET',
    cache: 'force-cache',
  }).catch(() => {});
}

/**
 * Auto-narrates `text` once when it changes.
 *
 * Voice selection:
 *   - If a Google voice is configured, we play through the /api/tts proxy
 *     so the child hears the warm AI voice. We do NOT fall back to Web
 *     Speech on failure — the previous fallback caused a "mechanical
 *     voice on first load, then good voice takes over" race when the
 *     Google audio took longer than expected to start. If Google fails,
 *     we just stay quiet; the speaker button can replay manually.
 *   - If no Google voice is configured, Web Speech is the only option.
 *
 * Timing:
 *   - First narration of a session waits FIRST_PROMPT_DELAY_MS (~4.5s)
 *     so a child who's reading along has time to take in the prompt
 *     visually before audio starts. Subsequent items use a tiny 80ms
 *     settle delay.
 *   - `paused`: when true, suppresses auto-narration AND silences
 *     anything currently speaking. The lesson page lifts this from the
 *     SkillIntroOverlay so the narrator doesn't talk under the card.
 */

const FIRST_PROMPT_DELAY_MS = 4500;
const SUBSEQUENT_PROMPT_DELAY_MS = 80;

export function useNarrator(text: string, paused: boolean = false): { replay: () => void } {
  const { settings } = useAccessibilitySettings();
  const lastSpokenRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // True only for the very first auto-narration in this hook's
  // lifetime. Used to apply a longer delay so the child has time to
  // read the prompt before the voice starts. Subsequent items drop
  // back to the tiny settle delay.
  const isFirstNarrationRef = useRef(true);

  const stopAll = useCallback(() => {
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  const playText = useCallback(async (textToSpeak: string) => {
    const voiceName = settings.voiceName;
    if (voiceName && voiceName.startsWith(GOOGLE_VOICE_PREFIX)) {
      // Google-only path: no Web Speech fallback, ever. A silent
      // failure is much better than getting talked-over by a
      // mechanical voice while Google is still warming up.
      const googleVoice = voiceName.slice(GOOGLE_VOICE_PREFIX.length);
      try {
        stopAll();
        const url = buildTtsUrl(textToSpeak, googleVoice, settings.voiceRate);
        const audio = new Audio(url);
        audio.preload = 'auto';
        audioRef.current = audio;
        await audio.play();
      } catch (err) {
        console.warn('Google TTS failed (silent — speaker button can retry):', err);
      }
      return;
    }
    // No Google voice configured — Web Speech is the only choice.
    void webSpeak(textToSpeak, {
      voice: voiceName && !voiceName.startsWith(GOOGLE_VOICE_PREFIX) ? voiceName : undefined,
      rate: settings.voiceRate,
    });
  }, [settings.voiceName, settings.voiceRate, stopAll]);

  // If we just paused, silence whatever is currently playing.
  useEffect(() => {
    if (paused) stopAll();
  }, [paused, stopAll]);

  useEffect(() => {
    if (paused) return;
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    const delay = isFirstNarrationRef.current ? FIRST_PROMPT_DELAY_MS : SUBSEQUENT_PROMPT_DELAY_MS;
    isFirstNarrationRef.current = false;
    const timer = setTimeout(() => { void playText(text); }, delay);
    return () => {
      clearTimeout(timer);
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, paused, settings.voiceName, settings.voiceRate]);

  const replay = useCallback(() => {
    if (!text) return;
    // Replay button bypasses the first-prompt delay — explicit user
    // request, no warm-up beat needed.
    void playText(text);
  }, [text, playText]);

  return { replay };
}
