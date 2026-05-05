import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';

function svgWrap(content: React.ReactNode) {
  return <svg>{content}</svg>;
}

describe('PlantStageIllustration', () => {
  it('renders a known plant_radish_seed code', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_radish_seed" x={0} y={0} size={40} />));
    // The component should produce SVG output, not be null
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('returns null for an unknown code', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="nope" x={0} y={0} size={40} />));
    expect(container.querySelector('g')).toBeNull();
  });

  it('renders plant_mint_mature', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_mint_mature" x={0} y={0} size={50} />));
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('renders plant_lettuce_mature', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_lettuce_mature" x={0} y={0} size={50} />));
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('renders plant_tulip_bloom', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_tulip_bloom" x={0} y={0} size={50} />));
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('renders plant_daisy_bloom', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_daisy_bloom" x={0} y={0} size={50} />));
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('renders plant_sunflower_bloom', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_sunflower_bloom" x={0} y={0} size={50} />));
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('renders plant_apple_mature', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_apple_mature" x={0} y={0} size={60} />));
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('renders plant_bamboo_cluster', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_bamboo_cluster" x={0} y={0} size={60} />));
    expect(container.querySelector('g')).not.toBeNull();
  });
});
