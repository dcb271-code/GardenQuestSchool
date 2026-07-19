import { describe, it, expect } from 'vitest';
import { detectVirtuesFromSession } from '@/lib/engine/virtueDetector';

type AttemptRow = { itemId: string; outcome: 'correct' | 'incorrect' | 'skipped'; retryCount: number; skillCode: string };

describe('virtueDetector — rules', () => {
  it('grants Persistence when a learner retries and eventually gets it right', () => {
    const attempts: AttemptRow[] = [
      { itemId: 'i1', outcome: 'correct', retryCount: 2, skillCode: 'reading.phonics.digraphs' },
    ];
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
    });
    expect(events.length).toBe(1);
    expect(events[0].virtue).toBe('persistence');
    // Narrative is picked from a pool now, so just assert it's non-empty
    // and reasonably "persistence-shaped" — it should mention sticking
    // with it or trying again, in some form.
    expect(events[0].evidence.narrativeText.length).toBeGreaterThan(0);
    expect(events[0].evidence.narrativeText).toMatch(/came back|stuck|tries|grow|hard|second look/i);
  });

  it('does NOT grant Persistence for a first-try correct', () => {
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1',
      attempts: [{ itemId: 'i1', outcome: 'correct', retryCount: 0, skillCode: 's' }],
      masteryTransitions: [], journalTaps: 0,
    });
    expect(events.filter(e => e.virtue === 'persistence').length).toBe(0);
  });

  it('grants Practice on review → mastered', () => {
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts: [],
      masteryTransitions: [{ skillCode: 'math.add.within_20.crossing_ten', from: 'review', to: 'mastered' }],
      journalTaps: 0,
    });
    const practice = events.filter(e => e.virtue === 'practice');
    expect(practice.length).toBe(1);
    expect(practice[0].evidence.narrativeText).toMatch(/practice|quicker|new/i);
  });

  it('grants Curiosity when learner taps journal entries', () => {
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1',
      attempts: [], masteryTransitions: [], journalTaps: 2,
    });
    expect(events.filter(e => e.virtue === 'curiosity').length).toBe(1);
  });

  it('grants Noticing for a full 5-item first-try-perfect session at level', () => {
    const attempts: AttemptRow[] = Array.from({ length: 5 }, (_, i) => ({
      itemId: `i${i}`, outcome: 'correct' as const, retryCount: 0, skillCode: 'math.counting.skip_2s',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0, avgItemEloGap: 10,
    });
    const noticing = events.filter(e => e.virtue === 'noticing');
    expect(noticing.length).toBe(1);
    // Pool-based narrative — match any of the recurring themes across
    // the noticing line variants.
    expect(noticing[0].evidence.narrativeText).toMatch(/pattern|spotted|noticed|naturalist|recognised|fast|catch/i);
  });

  it('does NOT grant Noticing for a 4-item session (needs a full 5)', () => {
    const attempts: AttemptRow[] = Array.from({ length: 4 }, (_, i) => ({
      itemId: `i${i}`, outcome: 'correct' as const, retryCount: 0, skillCode: 'math.counting.skip_2s',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
    });
    expect(events.filter(e => e.virtue === 'noticing').length).toBe(0);
  });

  it('does NOT grant Noticing for cruising far-below-level reviews', () => {
    const attempts: AttemptRow[] = Array.from({ length: 5 }, (_, i) => ({
      itemId: `i${i}`, outcome: 'correct' as const, retryCount: 0, skillCode: 'reading.sight_words.dolch_primer',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0, avgItemEloGap: -300,
    });
    expect(events.filter(e => e.virtue === 'noticing').length).toBe(0);
  });

  it('grants Courage for a session on a brand-new skill with ≥3 attempts and a win', () => {
    const attempts: AttemptRow[] = [
      { itemId: 'i1', outcome: 'incorrect', retryCount: 1, skillCode: 'math.fractions.equivalent' },
      { itemId: 'i2', outcome: 'correct', retryCount: 1, skillCode: 'math.fractions.equivalent' },
      { itemId: 'i3', outcome: 'incorrect', retryCount: 0, skillCode: 'math.fractions.equivalent' },
    ];
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
      plannedSkillStateAtStart: 'new',
    });
    const courage = events.filter(e => e.virtue === 'courage');
    expect(courage.length).toBe(1);
    expect(courage[0].evidence.narrativeText).toMatch(/courage|brave|new|hard|wobbly/i);
  });

  it('grants Courage for punching well above her Elo even on a review skill', () => {
    const attempts: AttemptRow[] = Array.from({ length: 4 }, (_, i) => ({
      itemId: `i${i}`, outcome: (i === 0 ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
      retryCount: 0, skillCode: 'math.divide.long_division',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
      plannedSkillStateAtStart: 'review', avgItemEloGap: 140,
    });
    expect(events.filter(e => e.virtue === 'courage').length).toBe(1);
  });

  it('does NOT grant Courage for comfortable at-level review work', () => {
    const attempts: AttemptRow[] = Array.from({ length: 5 }, (_, i) => ({
      itemId: `i${i}`, outcome: 'correct' as const, retryCount: 0, skillCode: 'math.add.within_10',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
      plannedSkillStateAtStart: 'mastered', avgItemEloGap: -50,
    });
    expect(events.filter(e => e.virtue === 'courage').length).toBe(0);
  });

  it('does NOT grant Courage for a tiny abandoned attempt (<3 items)', () => {
    const attempts: AttemptRow[] = [
      { itemId: 'i1', outcome: 'correct', retryCount: 0, skillCode: 'math.fractions.equivalent' },
    ];
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
      plannedSkillStateAtStart: 'new',
    });
    expect(events.filter(e => e.virtue === 'courage').length).toBe(0);
  });

  it('caps gems at 3 per session to avoid dilution', () => {
    const attempts: AttemptRow[] = [
      { itemId: 'i1', outcome: 'correct', retryCount: 2, skillCode: 'a' },
      { itemId: 'i2', outcome: 'correct', retryCount: 0, skillCode: 'b' },
      { itemId: 'i3', outcome: 'correct', retryCount: 0, skillCode: 'c' },
      { itemId: 'i4', outcome: 'correct', retryCount: 0, skillCode: 'd' },
    ];
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [{ skillCode: 'x', from: 'review', to: 'mastered' }],
      journalTaps: 3,
    });
    expect(events.length).toBeLessThanOrEqual(3);
  });
});
