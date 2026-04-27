import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterSpot from '@/components/child/garden/CharacterSpot';

describe('CharacterSpot', () => {
  it('renders the character name as accessible label', () => {
    render(
      <CharacterSpot
        characterCode="nana"
        name="Nana Mira"
        emoji="👵"
        alert={true}
        recommendation="Word Stump — sight words"
        onTap={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/nana mira/i),
    );
  });

  it('shows recommendation hint when alert', () => {
    render(
      <CharacterSpot
        characterCode="nana"
        name="Nana Mira"
        emoji="👵"
        alert={true}
        recommendation="Word Stump — sight words"
        onTap={() => {}}
      />,
    );
    expect(screen.getByText(/Word Stump/i)).toBeInTheDocument();
  });

  it('does NOT show recommendation hint when sleeping', () => {
    render(
      <CharacterSpot
        characterCode="hodge"
        name="Hodge"
        emoji="🦫"
        alert={false}
        recommendation="Bee Swarms — addition"
        onTap={() => {}}
      />,
    );
    expect(screen.queryByText(/Bee Swarms/i)).not.toBeInTheDocument();
  });

  it('fires onTap when clicked', () => {
    const onTap = vi.fn();
    render(
      <CharacterSpot
        characterCode="signpost"
        name="Wanderer's Signpost"
        emoji="🪧"
        alert={true}
        recommendation="quick start"
        onTap={onTap}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledOnce();
  });

  it('marks awake / asleep via data-state attribute', () => {
    const { rerender } = render(
      <CharacterSpot
        characterCode="hodge"
        name="Hodge"
        emoji="🦫"
        alert={true}
        recommendation="x"
        onTap={() => {}}
      />,
    );
    expect(document.querySelector('[data-state="awake"]')).not.toBeNull();
    rerender(
      <CharacterSpot
        characterCode="hodge"
        name="Hodge"
        emoji="🦫"
        alert={false}
        recommendation="x"
        onTap={() => {}}
      />,
    );
    expect(document.querySelector('[data-state="asleep"]')).not.toBeNull();
  });
});
