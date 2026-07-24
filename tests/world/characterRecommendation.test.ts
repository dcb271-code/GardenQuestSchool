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
  it('Hodge gets the first math candidate from the engine when available', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('Nana gets the first reading candidate from the engine when available', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.nana?.skillCode).toBe('reading.sight_words.dolch_primer');
  });

  it('Signpost gets up to 4 mixed-subject candidates in order', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.signpost.length).toBe(4);
    expect(out.signpost[0].skillCode).toBe('math.add.within_10');
  });

  it('Hodge falls back to a math baseline when engine has no math candidates', () => {
    const onlyReading = fakeCandidates.filter(c => c.skillCode.startsWith('reading.'));
    const out = partitionRecommendations(onlyReading);
    expect(out.hodge?.skillCode).toMatch(/^math\./);
    expect(out.nana?.skillCode).toBe('reading.sight_words.dolch_primer');
  });

  it('Nana falls back to a reading baseline when engine has no reading candidates', () => {
    const onlyMath = fakeCandidates.filter(c => c.skillCode.startsWith('math.'));
    const out = partitionRecommendations(onlyMath);
    expect(out.nana?.skillCode).toMatch(/^reading\./);
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('all characters fall back to baselines when input is empty (no dead taps)', () => {
    const out = partitionRecommendations([]);
    expect(out.hodge?.skillCode).toMatch(/^math\./);
    expect(out.nana?.skillCode).toMatch(/^reading\./);
    expect(out.signpost.length).toBeGreaterThan(0);
    expect(out.signpost[0].skillCode).toBeTruthy();
  });

  it('at Level 3+, Hodge picks the MOST ADVANCED math candidate, not the first', () => {
    const out = partitionRecommendations(fakeCandidates, 3);
    // multiply.equal_groups (level 0.55) beats add.within_10 (0.2) and
    // subtract.within_10 (0.2).
    expect(out.hodge?.skillCode).toBe('math.multiply.equal_groups');
  });

  it('below Level 3, Hodge keeps the engine\'s first math candidate', () => {
    const out = partitionRecommendations(fakeCandidates, 2);
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('at Level 3+, Hodge\'s empty-engine fallback is multiplication, not baby subtraction', () => {
    const out = partitionRecommendations([], 3);
    expect(out.hodge?.skillCode).toBe('math.multiply.facts_to_5');
    const out2 = partitionRecommendations([], 2);
    expect(out2.hodge?.skillCode).toBe('math.subtract.within_10');
  });
});
