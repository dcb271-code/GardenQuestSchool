// Web Speech API wrapper. Runs only in the browser; returns a no-op on SSR.

export interface SpeakOptions {
  rate?: number;       // 0.1..10, default 0.9 (slightly slow for a first grader)
  pitch?: number;      // 0..2, default 1.05
  voice?: string;      // voice name, e.g., 'Samantha' (en-US). Ignored if not found.
}

const DEFAULT_OPTIONS: SpeakOptions = {
  rate: 0.9,
  pitch: 1.05,
};

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined'
    && !!(window as any).speechSynthesis
    && typeof (globalThis as any).SpeechSynthesisUtterance !== 'undefined';
}

function pickVoice(desiredName?: string): SpeechSynthesisVoice | undefined {
  if (!isSpeechAvailable()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;

  if (desiredName) {
    const match = voices.find(v => v.name === desiredName);
    if (match) return match;
  }
  const preferences = [
    'Samantha',
    'Ava',
    'Google US English',
    'Microsoft Aria Online (Natural) - English (United States)',
  ];
  for (const name of preferences) {
    const match = voices.find(v => v.name === name);
    if (match) return match;
  }
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
