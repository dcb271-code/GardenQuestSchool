import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonPage from '@/app/(child)/lesson/[sessionId]/page';

const pushMock = vi.fn();
// The real Next.js router is referentially stable across renders; the
// mock must be too, or loadNext's useCallback identity churns and the
// load effect re-fires on every render.
const routerMock = { push: pushMock };
vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/components/child/LessonHeader', () => ({
  default: () => <div data-testid="lesson-header" />,
}));
vi.mock('@/components/child/SkillIntroOverlay', () => ({
  default: () => null,
}));
vi.mock('@/lib/audio/useNarrator', () => ({
  useNarrator: () => ({ replay: vi.fn() }),
}));
vi.mock('@/lib/audio/sfx', () => ({
  playCorrectChime: vi.fn(),
  playSettle: vi.fn(),
  playSoftTap: vi.fn(),
  playPageTurn: vi.fn(),
}));
vi.mock('@/lib/settings/useAccessibilitySettings', () => ({
  useAccessibilitySettings: () => ({
    settings: { reducedMotion: true, challengeLevel: 'normal' },
    update: vi.fn(),
  }),
}));
vi.mock('@/lib/packs', () => ({
  getItemHandler: () => ({
    renderer: ({ onSubmit }: { onSubmit: (r: unknown) => void }) => (
      <button onClick={() => onSubmit({ tapped: true })}>Answer</button>
    ),
  }),
  getPromptText: () => '',
}));

function itemJson() {
  return {
    itemId: 'item-1',
    type: 'FakeItem',
    content: {},
    learnerId: 'L1',
  };
}

describe('lesson error recovery', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('shows a retry card instead of silently leaving the lesson when the item fetch fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => itemJson() });
    vi.stubGlobal('fetch', fetchMock);

    render(<LessonPage params={{ sessionId: 's1' }} />);

    const retry = await screen.findByRole('button', { name: /try again/i });
    expect(pushMock).not.toHaveBeenCalled();

    fireEvent.click(retry);

    expect(await screen.findByRole('button', { name: /answer/i })).toBeInTheDocument();
  });

  it('keeps the item on screen when submitting an answer fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => itemJson() })
      .mockRejectedValueOnce(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    render(<LessonPage params={{ sessionId: 's1' }} />);

    const answer = await screen.findByRole('button', { name: /answer/i });
    fireEvent.click(answer);

    // The child should be able to try tapping again — no crash, no redirect.
    expect(await screen.findByRole('button', { name: /answer/i })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
