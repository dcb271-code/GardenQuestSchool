// Web Speech API wrapper. Runs only in the browser; returns a no-op on SSR.
// Prefers warm, whimsical female voices with an accent (storybook-narrator
// feel) over flat robotic defaults.

export interface SpeakOptions {
  rate?: number;       // 0.1..10, default 0.88 (slightly slow, storybook tempo)
  pitch?: number;      // 0..2, default 1.1 (warm, friendly)
  voice?: string;      // voice name override
}

const DEFAULT_OPTIONS: SpeakOptions = {
  rate: 0.88,
  pitch: 1.1,
};

// Preferred voices in priority order. Top of list = most whimsical,
// storybook-accented female voices we've actually heard sound good for
// a 7-year-old. Platform availability varies — we fall back gracefully.
const VOICE_PREFERENCES = [
  // Microsoft Natural voices (very high quality, available on Edge + some
  // Win/Mac setups that have downloaded Natural voice packs). British
  // female Sonia/Libby and Aussie Natasha are our top picks.
  'Microsoft Sonia Online (Natural) - English (United Kingdom)',
  'Microsoft Libby Online (Natural) - English (United Kingdom)',
  'Microsoft Natasha Online (Natural) - English (Australia)',
  'Microsoft Clara Online (Natural) - English (Canada)',
  'Microsoft Aria Online (Natural) - English (United States)',
  // Apple "Enhanced" voices on macOS — warmer than the free tier.
  'Moira (Enhanced)',          // Irish female — lilting, storybook
  'Serena (Enhanced)',         // British female — warm narrator
  'Karen (Enhanced)',          // Australian female — friendly
  'Fiona (Enhanced)',          // Scottish female — fairy-tale
  // Apple default voices (come free on macOS/iOS):
  'Moira',                     // Irish
  'Serena',                    // British
  'Karen',                     // Australian
  'Fiona',                     // Scottish
  'Tessa',                     // South African
  'Kate',                      // British
  'Veena',                     // Indian English
  // Microsoft classic voices (Windows):
  'Microsoft Hazel Desktop - English (Great Britain)',
  'Microsoft Hazel - English (Great Britain)',
  'Microsoft Susan - English (Australia)',
  'Microsoft Heera - English (India)',
  // Google voices (Chrome/Android):
  'Google UK English Female',
  'Google Australian English Female',
  'Google Indian English Female',
  // Last resorts
  'Samantha',                  // macOS default (still decent)
  'Ava',
  'Google US English',
];

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined'
    && !!(window as any).speechSynthesis
    && typeof (globalThis as any).SpeechSynthesisUtterance !== 'undefined';
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechAvailable()) return [];
  return window.speechSynthesis.getVoices();
}

export function pickVoice(desiredName?: string): SpeechSynthesisVoice | undefined {
  if (!isSpeechAvailable()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;

  // Explicit preference (from settings)
  if (desiredName) {
    const match = voices.find(v => v.name === desiredName);
    if (match) return match;
  }
  // Curated preference list
  for (const name of VOICE_PREFERENCES) {
    const match = voices.find(v => v.name === name);
    if (match) return match;
  }
  // Any English female-sounding voice (by name heuristic)
  const femaleHeuristic = /samantha|karen|moira|fiona|serena|kate|tessa|veena|hazel|susan|heera|sonia|libby|natasha|clara|aria|ava|amy|joanna|emma|olivia|female/i;
  const englishFemale = voices.find(v => v.lang.startsWith('en') && femaleHeuristic.test(v.name));
  if (englishFemale) return englishFemale;
  // Any English
  return voices.find(v => v.lang.startsWith('en')) ?? voices[0];
}

export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isSpeechAvailable() || !text.trim()) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const merged = { ...DEFAULT_OPTIONS, ...opts };
    u.rate = merged.rate!;
    u.pitch = merged.pitch!;
    const voice = pickVoice(merged.voice);
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    try { window.speechSynthesis.cancel(); } catch {}
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking(): void {
  if (!isSpeechAvailable()) return;
  try { window.speechSynthesis.cancel(); } catch {}
}
