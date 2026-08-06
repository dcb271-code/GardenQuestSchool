// tests/components/MicDeniedFallback.test.tsx
//
// A blocked microphone must never be a dead end.
//
// Found by asking why 22% of Esme's sessions ended with zero questions
// answered. Her two worst skills were `reading.read_aloud.simple` (6
// abandoned to 4 finished) and `reading.phonics.cvc_blend` (4 to 3) —
// the only two item types that need a microphone.
//
// The bug: both components gated their manual fallback on
// `speech.supported`. A browser that SUPPORTS speech recognition but
// whose mic permission is BLOCKED therefore showed the message
// "microphone permission was blocked — use the buttons below" while
// the button it referred to rendered only when speech was unsupported.
// The only remaining controls were a hint and "skip", and skip submits
// a wrong answer. In PhonemeBlend the tiles were gated on two failed
// speech attempts, which a mic that never runs can never produce.
//
// So the child is told to use a control that is not on screen. There
// is no way to answer the question and the only exit is to leave —
// which is exactly the shape the session data showed.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ReadAloudSimple from '@/lib/packs/reading/rendering/ReadAloudSimple';
import PhonemeBlend from '@/lib/packs/reading/rendering/PhonemeBlend';

const speechState = {
  supported: true, listening: false, transcript: '', interim: '',
  alternatives: [] as string[], error: null as string | null,
  usable: true,
  start: vi.fn(), stop: vi.fn(), reset: vi.fn(),
};

vi.mock('@/lib/audio/useSpeechRecognition', async (orig) => {
  const actual = await orig<typeof import('@/lib/audio/useSpeechRecognition')>();
  return { ...actual, useSpeechRecognition: () => speechState };
});

function setMic(state: 'ok' | 'blocked' | 'unsupported') {
  speechState.supported = state !== 'unsupported';
  speechState.error = state === 'blocked' ? 'not-allowed' : null;
  speechState.usable = speechState.supported && speechState.error === null;
}

afterEach(cleanup);

describe('ReadAloudSimple with the mic blocked', () => {
  it('offers a way to answer, not just a hint and a skip', () => {
    setMic('blocked');
    render(
      <ReadAloudSimple
        content={{ type: 'ReadAloudSimple', word: 'cat', promptText: 'Say it out loud.' }}
        onSubmit={vi.fn()} retries={0}
      />,
    );
    expect(
      screen.queryByText(/I read it/i),
      'told to "use the buttons below" with no such button on screen',
    ).not.toBeNull();
  });

  it('still offers it when speech is simply unsupported', () => {
    setMic('unsupported');
    render(
      <ReadAloudSimple
        content={{ type: 'ReadAloudSimple', word: 'dog', promptText: 'Say it out loud.' }}
        onSubmit={vi.fn()} retries={0}
      />,
    );
    expect(screen.queryByText(/I read it/i)).not.toBeNull();
  });

  it('hides it when the mic genuinely works — reading aloud is the exercise', () => {
    setMic('ok');
    render(
      <ReadAloudSimple
        content={{ type: 'ReadAloudSimple', word: 'sun', promptText: 'Say it out loud.' }}
        onSubmit={vi.fn()} retries={0}
      />,
    );
    expect(
      screen.queryByText(/I read it/i),
      'a self-report button would let her skip the actual reading',
    ).toBeNull();
  });
});

describe('PhonemeBlend with the mic blocked', () => {
  const content = {
    type: 'PhonemeBlend' as const,
    word: 'cat', phonemes: ['c', 'a', 't'], distractors: ['cot', 'cap'],
    promptText: 'Blend the sounds and say the word.',
  };

  it('reveals the word tiles, which the error message promises', () => {
    // failedSpeechAttempts only counts attempts where the mic HEARD
    // something wrong, so a blocked mic can never reach the threshold
    // that would otherwise reveal them.
    setMic('blocked');
    render(<PhonemeBlend content={content} onSubmit={vi.fn()} retries={0} />);
    expect(
      screen.queryByText('cat'),
      'told she could "pick the word below" with nothing to pick',
    ).not.toBeNull();
  });

  it('keeps them hidden when the mic works, so she blends rather than matches', () => {
    setMic('ok');
    render(<PhonemeBlend content={content} onSubmit={vi.fn()} retries={0} />);
    expect(screen.queryByText('cot')).toBeNull();
  });
});
