import { describe, it, expect } from 'vitest';
import { partitionRecommendations } from '@/lib/world/characterRecommendation';

const fakeCandidates = [
  { skillCode: 'math.add.within_10', title: 'Bee Swarms', themeEmoji: '🐝', skillHint: 'add' },
  { skillCode: 'reading.sight_words.dolch_primer', title: 'Word Stump', themeEmoji: '🌳', skillHint: 'sight words' },
  { skillCode: 'math.multiply.equal_groups', title: 'Equal Gardens', themeEmoji: '🌻', skillHint: 'groups' },
  { skillCode: 'reading.phonics.cvc_blend', title: 'Blending Brook', themeEmoji: '🪨', skillHint: 'blend' },
  { skillCode: 'math.subtract.within_10', title: 'Petal Falls', themeEmoji: '🌺', skillHint: 'subtract' },
];

describe('characterRecommendation', () => {
  it('Hodge gets the first math candidate', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('Nana gets the first reading candidate', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.nana?.skillCode).toBe('reading.sight_words.dolch_primer');
  });

  it('Signpost gets up to 4 mixed-subject candidates in order', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.signpost.length).toBe(4);
    expect(out.signpost[0].skillCode).toBe('math.add.within_10');
  });

  it('handles missing math candidates gracefully', () => {
    const onlyReading = fakeCandidates.filter(c => c.skillCode.startsWith('reading.'));
    const out = partitionRecommendations(onlyReading);
    expect(out.hodge).toBeNull();
    expect(out.nana?.skillCode).toBe('reading.sight_words.dolch_primer');
  });

  it('handles missing reading candidates gracefully', () => {
    const onlyMath = fakeCandidates.filter(c => c.skillCode.startsWith('math.'));
    const out = partitionRecommendations(onlyMath);
    expect(out.nana).toBeNull();
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('handles empty input', () => {
    const out = partitionRecommendations([]);
    expect(out.hodge).toBeNull();
    expect(out.nana).toBeNull();
    expect(out.signpost).toEqual([]);
  });
});
