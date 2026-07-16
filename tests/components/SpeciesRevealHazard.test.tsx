import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpeciesReveal from '@/components/child/naturalist/SpeciesReveal';

const photo = {
  url: 'https://example.com/p.jpg',
  alt: 'a plant',
  attribution: { photographer: 'Jo', licenseCode: 'cc-by', sourceUrl: 'https://example.com' },
};

const base = {
  scientificName: 'Toxicodendron radicans',
  heroPhoto: photo,
  revealPhotos: [],
  notableFeatures: ['always exactly three leaflets'],
  facts: ['Leaves of three, let it be.'],
  emoji: '⚠️',
  onContinue: vi.fn(),
  reducedMotion: true,
};

describe('SpeciesReveal — hazard species', () => {
  it('does not celebrate finding poison ivy', () => {
    render(<SpeciesReveal {...base} commonName="Poison Ivy" hazard="touch" safetyNote="Do not touch it." />);
    expect(screen.queryByText(/you found a/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /found!/i })).not.toBeInTheDocument();
  });

  it('leads with look-dont-touch and shows the safety note', () => {
    render(
      <SpeciesReveal {...base} commonName="Poison Ivy" hazard="touch"
        safetyNote="Do not touch it — the oil gives most people a rash." />,
    );
    expect(screen.getByText(/look at, not touch/i)).toBeInTheDocument();
    expect(screen.getByText(/the oil gives most people a rash/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /leave it alone/i })).toBeInTheDocument();
  });

  it('celebrates normally for a harmless species', () => {
    render(<SpeciesReveal {...base} commonName="Trillium" />);
    expect(screen.getByText(/you found a/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /found!/i })).toBeInTheDocument();
    expect(screen.queryByText(/look at, not touch/i)).not.toBeInTheDocument();
  });

  it('reassures on a lookalike so the lesson does not become fear of all plants', () => {
    render(<SpeciesReveal {...base} commonName="Box Elder" hazardLookalike />);
    expect(screen.getByText(/this one is safe/i)).toBeInTheDocument();
    // still a normal, celebratory find
    expect(screen.getByRole('button', { name: /found!/i })).toBeInTheDocument();
  });
});
