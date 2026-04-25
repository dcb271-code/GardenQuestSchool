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
    expect(events[0].evidence.narrativeText).toContain('came back');
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

  it('grants Noticing for 3+ first-try corrects (pattern signal)', () => {
    // Threshold is 3 (not 4): with a 5-item session cap, requiring 4
    // first-try-correct made the gem nearly unreachable. 3/5 is the
    // honest "this child sees the pattern" signal.
    const attempts: AttemptRow[] = Array.from({ length: 3 }, (_, i) => ({
      itemId: `i${i}`, outcome: 'correct' as const, retryCount: 0, skillCode: 'math.counting.skip_2s',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
    });
    const noticing = events.filter(e => e.virtue === 'noticing');
    expect(noticing.length).toBe(1);
    expect(noticing[0].evidence.narrativeText).toMatch(/pattern|spotted|noticed|Naturalist/i);
  });

  it('does NOT grant Noticing for only 2 first-try corrects', () => {
    const attempts: AttemptRow[] = Array.from({ length: 2 }, (_, i) => ({
      itemId: `i${i}`, outcome: 'correct' as const, retryCount: 0, skillCode: 'math.counting.skip_2s',
    }));
    const events = detectVirtuesFromSession({
      sessionId: 's1', learnerId: 'l1', attempts,
      masteryTransitions: [], journalTaps: 0,
    });
    expect(events.filter(e => e.virtue === 'noticing').length).toBe(0);
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
