import type { NarratorKind, MasteryState } from './types';

export interface NarratorMoment {
  kind: NarratorKind;
  text: string;
  skillCode: string;
}

interface SessionAttempt {
  itemId: string;
  outcome: 'correct' | 'incorrect' | 'skipped';
  retryCount: number;
  skillCode: string;
}

interface MasteryTransition {
  skillCode: string;
  from: MasteryState;
  to: MasteryState;
}

export interface NarratorInput {
  masteryTransitions: MasteryTransition[];
  attempts: SessionAttempt[];
}

export function computeNarratorMomentsFromSession(input: NarratorInput): NarratorMoment[] {
  const moments: NarratorMoment[] = [];

  for (const t of input.masteryTransitions) {
    if (t.from === 'review' && t.to === 'mastered') {
      moments.push({
        kind: 'remember_when_hard',
        skillCode: t.skillCode,
        text: `Remember when ${friendlyLeaf(t.skillCode)} felt new? It feels quicker now.`,
      });
    }
  }

  const hardRetries = input.attempts.filter(
    a => a.outcome === 'correct' && a.retryCount >= 2
  );
  if (hardRetries.length >= 2) {
    moments.push({
      kind: 'practice_is_working',
      skillCode: hardRetries[0].skillCode,
      text: 'You stayed with the hard parts until they clicked. Practice IS making it easier.',
    });
  }

  return moments;
}

export function computeNarratorMoments(_events: any[]): NarratorMoment[] {
  return [];
}

function friendlyLeaf(skillCode: string): string {
  return skillCode.split('.').pop()!.replace(/_/g, ' ');
}
