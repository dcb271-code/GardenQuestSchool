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
});
