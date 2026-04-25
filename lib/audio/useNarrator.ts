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
 * Auto-narrates `text` once when it changes. If the selected voice is a
 * Google voice, plays the cached audio via an HTMLAudioElement (browser
 * HTTP cache makes repeat plays instant). Falls back to Web Speech.
 */
export function useNarrator(text: string): { replay: () => void } {
  const { settings } = useAccessibilitySettings();
  const lastSpokenRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const googleVoice = voiceName.slice(GOOGLE_VOICE_PREFIX.length);
      try {
        stopAll();
        const url = buildTtsUrl(textToSpeak, googleVoice, settings.voiceRate);
        const audio = new Audio(url);
        audio.preload = 'auto';
        audioRef.current = audio;
        await audio.play();
        return;
      } catch (err) {
        console.warn('Google TTS failed, falling back to Web Speech:', err);
      }
    }
    void webSpeak(textToSpeak, {
      voice: voiceName && !voiceName.startsWith(GOOGLE_VOICE_PREFIX) ? voiceName : undefined,
      rate: settings.voiceRate,
    });
  }, [settings.voiceName, settings.voiceRate, stopAll]);

  useEffect(() => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    const timer = setTimeout(() => { void playText(text); }, 80);
    return () => {
      clearTimeout(timer);
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, settings.voiceName, settings.voiceRate]);

  const replay = useCallback(() => {
    if (!text) return;
    void playText(text);
  }, [text, playText]);

  return { replay };
}
