'use client';

import { useCallback, useEffect, useRef } from 'react';
import { speak as webSpeak, stopSpeaking } from './tts';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

// Voice names that start with this prefix are Google Cloud voices.
// Everything else is treated as a Web Speech API voice name.
export const GOOGLE_VOICE_PREFIX = 'google:';

/**
 * Auto-narrates `text` once when it changes. If the selected voice is a
 * Google voice, fetches modern Neural2/Studio audio from our /api/tts
 * proxy and plays it via an HTMLAudioElement. Falls back to the Web
 * Speech API if no voice is selected, the fetch fails, or the API key
 * is missing in production.
 */
export function useNarrator(text: string): { replay: () => void } {
  const { settings } = useAccessibilitySettings();
  const lastSpokenRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  const stopAll = useCallback(() => {
    // Stop both Web Speech and any active audio
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
  }, []);

  const playText = useCallback(async (textToSpeak: string) => {
    const voiceName = settings.voiceName;
    if (voiceName && voiceName.startsWith(GOOGLE_VOICE_PREFIX)) {
      const googleVoice = voiceName.slice(GOOGLE_VOICE_PREFIX.length);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            voice: googleVoice,
            rate: settings.voiceRate,
          }),
        });
        if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
        const blob = await res.blob();
        stopAll();
        const url = URL.createObjectURL(blob);
        currentUrlRef.current = url;
        const audio = new Audio(url);
        audio.onended = () => {
          if (currentUrlRef.current === url) {
            URL.revokeObjectURL(url);
            currentUrlRef.current = null;
          }
        };
        audioRef.current = audio;
        await audio.play();
        return;
      } catch (err) {
        console.warn('Google TTS failed, falling back to Web Speech:', err);
        // fall through
      }
    }
    // Web Speech API fallback
    void webSpeak(textToSpeak, {
      voice: voiceName && !voiceName.startsWith(GOOGLE_VOICE_PREFIX) ? voiceName : undefined,
      rate: settings.voiceRate,
    });
  }, [settings.voiceName, settings.voiceRate, stopAll]);

  useEffect(() => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    // Slight delay helps iOS Safari "wake" the speech engine after nav.
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
