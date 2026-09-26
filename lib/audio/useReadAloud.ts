'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { speak as webSpeak, stopSpeaking } from './tts';
import { GOOGLE_VOICE_PREFIX, buildTtsUrl } from './useNarrator';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

/**
 * Read something aloud ON DEMAND — a letter, a name on a chip. The
 * narrator (useNarrator) auto-speaks a prompt when it changes; this
 * speaks only when asked, and knows which thing it is reading so a
 * button can show "stop" while its own text is playing.
 *
 * Built for a child who cannot read her mail. Rules:
 *   - VERBATIM. Whatever the writer wrote is what the voice says —
 *     a keyboard song, a row of hearts, sixty exclamation points.
 *     Nothing here summarizes, trims, or tidies a child's letter.
 *   - Long letters are read in pieces: /api/tts caps a request at 800
 *     characters, so text is split at sentence ends into pieces under
 *     that and played back to back. The child hears one letter.
 *   - Same voice choice as everything else (Google voice via the
 *     proxy when configured, else Web Speech), and like the narrator,
 *     no fallback from Google to a mechanical voice mid-letter.
 */

/** Under the proxy's 800-char cap with room for the URL encoding. */
export const READ_ALOUD_PIECE_MAX = 700;

/**
 * Split text into pieces of at most `max` characters, preferring to
 * break after sentence punctuation, then at whitespace, and only as a
 * last resort mid-word (a 900-character keyboard song has no spaces).
 * Joining the pieces gives back every non-whitespace character of
 * the original, in order — tested.
 */
export function splitForSpeech(text: string, max: number = READ_ALOUD_PIECE_MAX): string[] {
  const pieces: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    const window = rest.slice(0, max + 1);
    let cut = -1;
    // Prefer: the last sentence end that is followed by whitespace.
    for (let i = max - 1; i > 0; i--) {
      if (/[.!?…]/.test(window[i]) && /\s/.test(window[i + 1] ?? '')) { cut = i + 1; break; }
    }
    // Then: the last whitespace.
    if (cut <= 0) {
      for (let i = max; i > 0; i--) {
        if (/\s/.test(window[i])) { cut = i; break; }
      }
    }
    // Last resort: mid-word (a keyboard song has no spaces).
    if (cut <= 0) cut = max;
    const head = rest.slice(0, cut).trim();
    if (head) pieces.push(head);
    rest = rest.slice(cut).trim();
  }
  if (rest) pieces.push(rest);
  return pieces;
}

export function useReadAloud(): {
  /** Which key is being read right now, or null. */
  readingKey: string | null;
  /** Start reading `text` under `key`; asking again with the same key stops it. */
  toggle: (key: string, text: string) => void;
  /** Always start (restarting if something is playing) — for a tap that changed what there is to say. */
  say: (key: string, text: string) => void;
  stop: () => void;
} {
  const { settings } = useAccessibilitySettings();
  const [readingKey, setReadingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Bumped on every stop so a piece that finishes after a stop does
  // not start the next piece of a letter nobody is listening to.
  const runRef = useRef(0);

  const stop = useCallback(() => {
    runRef.current += 1;
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setReadingKey(null);
  }, []);

  const playPieces = useCallback(async (pieces: string[], run: number) => {
    const voiceName = settings.voiceName;
    const google = voiceName?.startsWith(GOOGLE_VOICE_PREFIX)
      ? voiceName.slice(GOOGLE_VOICE_PREFIX.length) : null;
    for (const piece of pieces) {
      if (runRef.current !== run) return;
      if (google) {
        await new Promise<void>((resolve) => {
          const audio = new Audio(buildTtsUrl(piece, google, settings.voiceRate));
          audio.preload = 'auto';
          audioRef.current = audio;
          audio.onended = () => resolve();
          audio.onerror = () => resolve();   // silent, like the narrator
          audio.play().catch(() => resolve());
        });
      } else {
        await webSpeak(piece, { voice: voiceName ?? undefined, rate: settings.voiceRate });
      }
    }
    if (runRef.current === run) setReadingKey(null);
  }, [settings.voiceName, settings.voiceRate]);

  const say = useCallback((key: string, text: string) => {
    stop();
    const run = runRef.current;
    const pieces = splitForSpeech(text);
    if (pieces.length === 0) return;
    setReadingKey(key);
    void playPieces(pieces, run);
  }, [stop, playPieces]);

  const toggle = useCallback((key: string, text: string) => {
    if (readingKey === key) stop();
    else say(key, text);
  }, [readingKey, stop, say]);

  // Leaving the screen silences it.
  useEffect(() => stop, [stop]);

  return { readingKey, toggle, say, stop };
}
