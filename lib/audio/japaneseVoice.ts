// lib/audio/japaneseVoice.ts
//
// Saying a Japanese character out loud, so the shape she just traced
// connects to a sound.
//
// Two paths, in order:
//   1. /api/tts with a ja-JP voice. The route derives languageCode from
//      the voice name and the response is immutable-cached, so the
//      whole curriculum is ~40 short clips that are fetched once and
//      then free forever. This is the good pronunciation.
//   2. Web Speech with any installed Japanese voice. No network, but
//      availability varies by device.
// If neither works we resolve quietly — a missing voice must never
// block the lesson.
//
// NOTE: the shared speak() in lib/audio/tts.ts deliberately picks an
// ENGLISH voice from a curated list, so it can't be reused here; an
// English voice reading あ produces nonsense.

const JA_VOICE = 'ja-JP-Neural2-B';   // clear female; Google Cloud TTS
const JA_RATE = 0.85;                 // a touch slow, for copying

let audioEl: HTMLAudioElement | null = null;

function ttsUrl(text: string): string {
  const params = new URLSearchParams({
    text,
    voice: JA_VOICE,
    rate: String(JA_RATE),
  });
  return `/api/tts?${params.toString()}`;
}

function speakViaWebSpeech(text: string): boolean {
  if (typeof window === 'undefined') return false;
  const synth = (window as any).speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return false;
  const jaVoice = synth.getVoices?.().find((v: SpeechSynthesisVoice) => v.lang?.startsWith('ja'));
  if (!jaVoice) return false;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = jaVoice;
    u.lang = jaVoice.lang;
    u.rate = 0.85;
    synth.cancel();
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Say a character or word in Japanese. Never throws, never rejects —
 * the worst case is silence.
 */
export async function speakJapanese(text: string): Promise<void> {
  if (!text.trim() || typeof window === 'undefined') return;
  try {
    if (!audioEl) audioEl = new Audio();
    audioEl.pause();
    audioEl.src = ttsUrl(text);
    await audioEl.play();
    return;
  } catch {
    // Autoplay refusal, offline, or no API key — fall through.
  }
  speakViaWebSpeech(text);
}

/**
 * Warm the browser cache for the characters a unit is about to teach,
 * so the first correct trace speaks instantly instead of after a
 * network round-trip.
 */
export function prefetchJapanese(texts: string[]): void {
  if (typeof window === 'undefined') return;
  for (const t of texts.slice(0, 12)) {
    fetch(ttsUrl(t)).catch(() => {});
  }
}
