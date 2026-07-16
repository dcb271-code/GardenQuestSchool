import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DichotomousStep from '@/components/child/naturalist/DichotomousStep';

const photo = (alt: string) => ({
  url: `https://example.com/${alt}.jpg`,
  alt,
  attribution: { photographer: 'Jo', licenseCode: 'cc-by', sourceUrl: 'https://example.com' },
});

const base = {
  question: 'Look at the leaves. Are they...',
  leftLabel: 'long thin needles?',
  rightLabel: 'broad flat leaves?',
  leftPhoto: photo('needles'),
  rightPhoto: photo('broadleaf'),
  reducedMotion: true,
};

describe('DichotomousStep', () => {
  it('reports which side the child chose', () => {
    const onChoose = vi.fn();
    render(<DichotomousStep {...base} onChoose={onChoose} />);
    fireEvent.click(screen.getByRole('button', { name: /choose: broad flat leaves/i }));
    expect(onChoose).toHaveBeenCalledWith('right');
    fireEvent.click(screen.getByRole('button', { name: /choose: long thin needles/i }));
    expect(onChoose).toHaveBeenCalledWith('left');
  });

  it('shows no nudge until a wrong side is passed', () => {
    render(<DichotomousStep {...base} onChoose={vi.fn()} />);
    expect(screen.queryByText(/take another look/i)).not.toBeInTheDocument();
  });

  it('nudges the child to re-look after a wrong tap', () => {
    render(<DichotomousStep {...base} onChoose={vi.fn()} wrongSide="left" />);
    expect(screen.getByText(/take another look/i)).toBeInTheDocument();
    // and does not give the answer away yet
    expect(screen.queryByText(/it’s this one/i)).not.toBeInTheDocument();
  });

  it('reveals the correct side after repeated misses so she is never stuck', () => {
    render(
      <DichotomousStep {...base} onChoose={vi.fn()} wrongSide="left" revealCorrect="right" />,
    );
    expect(screen.getByText(/it’s this one/i)).toBeInTheDocument();
  });

  it('keeps both options tappable while nudging', () => {
    const onChoose = vi.fn();
    render(<DichotomousStep {...base} onChoose={onChoose} wrongSide="left" />);
    fireEvent.click(screen.getByRole('button', { name: /choose: broad flat leaves/i }));
    expect(onChoose).toHaveBeenCalledWith('right');
  });
});
