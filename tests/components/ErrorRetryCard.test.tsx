import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorRetryCard from '@/components/child/ErrorRetryCard';

describe('ErrorRetryCard', () => {
  it('renders the default kid-friendly message and a retry button', () => {
    render(<ErrorRetryCard onRetry={() => {}} />);
    expect(screen.getByText(/something got tangled/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders a custom message and detail text when provided', () => {
    render(
      <ErrorRetryCard
        message="We could not start a walk just now."
        detail="walk fetch failed: 500"
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText('We could not start a walk just now.')).toBeInTheDocument();
    expect(screen.getByText('walk fetch failed: 500')).toBeInTheDocument();
  });

  it('fires onRetry when the retry button is tapped', () => {
    const onRetry = vi.fn();
    render(<ErrorRetryCard onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders and fires the secondary action when provided', () => {
    const onSecondary = vi.fn();
    render(
      <ErrorRetryCard
        onRetry={() => {}}
        secondaryLabel="Back to the garden"
        onSecondary={onSecondary}
      />,
    );
    const secondary = screen.getByRole('button', { name: /back to the garden/i });
    fireEvent.click(secondary);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('does not render a secondary button when none is provided', () => {
    render(<ErrorRetryCard onRetry={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
