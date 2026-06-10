import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MysteryPeek from '@/components/child/naturalist/MysteryPeek';

const photo = {
  url: 'https://example.com/maple-leaf.jpg',
  alt: 'A red maple leaf',
  attribution: { photographer: 'Jo', licenseCode: 'cc-by', sourceUrl: 'https://example.com' },
};

describe('MysteryPeek', () => {
  it('renders a thumbnail button that names the action for the child', () => {
    render(<MysteryPeek photo={photo} emoji="🌳" reducedMotion />);
    const btn = screen.getByRole('button', { name: /look at your plant again/i });
    expect(btn).toBeInTheDocument();
    expect(screen.getByText(/your plant/i)).toBeInTheDocument();
  });

  it('opens a large view on tap and closes it on the close button', () => {
    render(<MysteryPeek photo={photo} emoji="🌳" reducedMotion />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /look at your plant again/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getAllByAltText('A red maple leaf').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /back to the question/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('falls back to the emoji when there is no photo', () => {
    render(<MysteryPeek photo={null} emoji="🌳" reducedMotion />);
    fireEvent.click(screen.getByRole('button', { name: /look at your plant again/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('🌳');
  });
});
