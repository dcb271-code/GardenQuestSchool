import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NaturalistWalkPage from '@/app/(child)/naturalist/walk/page';

const pushMock = vi.fn();
// Keep the mocked router referentially stable like the real one.
const routerMock = { push: pushMock };
vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => new URLSearchParams('learner=L1'),
}));

function walkSessionJson() {
  return {
    id: 'walk-1',
    species: [
      {
        position: 0,
        floraCode: 'tulip_poplar',
        commonName: 'Tulip Poplar',
        scientificName: 'Liriodendron tulipifera',
        notableFeatures: [],
        facts: [],
        emoji: '🌳',
        exposures: 0,
        showQuickRecognize: false,
        heroPhoto: null,
        heroRole: null,
        keyPath: [],
        revealPhotos: [],
      },
    ],
  };
}

describe('naturalist walk error recovery', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('shows a Try again button when the walk fetch fails, and retrying loads the walk', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'walk fetch failed: 500' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => walkSessionJson(),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<NaturalistWalkPage />);

    const retry = await screen.findByRole('button', { name: /try again/i });
    expect(screen.getByText(/could not start a walk/i)).toBeInTheDocument();

    fireEvent.click(retry);

    expect(await screen.findByText(/look at something growing here/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('still offers a way back to the garden from the error state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    );

    render(<NaturalistWalkPage />);

    const back = await screen.findByRole('button', { name: /back to the garden/i });
    fireEvent.click(back);
    expect(pushMock).toHaveBeenCalledWith('/garden?learner=L1');
  });
});
