import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSpeechAvailable, speak, stopSpeaking } from '@/lib/audio/tts';

describe('tts (Web Speech API wrapper)', () => {
  const originalSpeechSynthesis = (window as any).speechSynthesis;
  const originalUtterance = (globalThis as any).SpeechSynthesisUtterance;

  beforeEach(() => {
    (window as any).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((u: any) => { setTimeout(() => u.onend?.(), 1); }),
      getVoices: () => [],
    };
    (globalThis as any).SpeechSynthesisUtterance = class {
      text: string;
      rate = 1;
      pitch = 1;
      voice: any = null;
      onend: any = null;
      onerror: any = null;
      constructor(text: string) { this.text = text; }
    };
  });

  afterEach(() => {
    (window as any).speechSynthesis = originalSpeechSynthesis;
    (globalThis as any).SpeechSynthesisUtterance = originalUtterance;
  });

  it('isSpeechAvailable reflects window.speechSynthesis', () => {
    expect(isSpeechAvailable()).toBe(true);
    (window as any).speechSynthesis = undefined;
    expect(isSpeechAvailable()).toBe(false);
  });

  it('speak resolves after utterance ends', async () => {
    await expect(speak('hello')).resolves.toBeUndefined();
    expect((window as any).speechSynthesis.speak).toHaveBeenCalled();
  });

  it('speak is a no-op on empty text', async () => {
    await expect(speak('   ')).resolves.toBeUndefined();
    expect((window as any).speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('stopSpeaking calls cancel', () => {
    stopSpeaking();
    expect((window as any).speechSynthesis.cancel).toHaveBeenCalled();
  });
});
