import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LockedGate from '@/components/child/garden/LockedGate';

describe('LockedGate', () => {
  it('renders locked state by default with destination label', () => {
    render(
      <LockedGate
        destinationLabel="Math Mountain"
        unlocked={false}
        justUnlocked={false}
        onTapWhenLocked={() => {}}
        onTapWhenUnlocked={() => {}}
      />,
    );
    expect(screen.getByText(/Math Mountain/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringMatching(/locked/i));
  });

  it('renders unlocked state without lock affordance', () => {
    render(
      <LockedGate
        destinationLabel="Math Mountain"
        unlocked={true}
        justUnlocked={false}
        onTapWhenLocked={() => {}}
        onTapWhenUnlocked={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringMatching(/to math mountain/i));
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-label', expect.stringMatching(/locked/i));
  });

  it('fires onTapWhenLocked when locked and tapped', () => {
    const onLocked = vi.fn();
    const onUnlocked = vi.fn();
    render(
      <LockedGate
        destinationLabel="Reading Forest"
        unlocked={false}
        justUnlocked={false}
        onTapWhenLocked={onLocked}
        onTapWhenUnlocked={onUnlocked}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onLocked).toHaveBeenCalledOnce();
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it('fires onTapWhenUnlocked when unlocked and tapped', () => {
    const onLocked = vi.fn();
    const onUnlocked = vi.fn();
    render(
      <LockedGate
        destinationLabel="Reading Forest"
        unlocked={true}
        justUnlocked={false}
        onTapWhenLocked={onLocked}
        onTapWhenUnlocked={onUnlocked}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onUnlocked).toHaveBeenCalledOnce();
    expect(onLocked).not.toHaveBeenCalled();
  });

  it('adds an unlock-animation marker when justUnlocked is true', () => {
    render(
      <LockedGate
        destinationLabel="Math Mountain"
        unlocked={true}
        justUnlocked={true}
        onTapWhenLocked={() => {}}
        onTapWhenUnlocked={() => {}}
      />,
    );
    const node = document.querySelector('[data-just-unlocked="true"]');
    expect(node).not.toBeNull();
  });
});
