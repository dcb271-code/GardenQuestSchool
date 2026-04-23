import type { VirtueName, VirtueEvidence, MasteryState } from './types';

export interface DetectedVirtue {
  virtue: VirtueName;
  evidence: VirtueEvidence;
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

export interface DetectionInput {
  sessionId: string;
  learnerId: string;
  attempts: SessionAttempt[];
  masteryTransitions: MasteryTransition[];
  journalTaps: number;
}

const MAX_GEMS_PER_SESSION = 3;

export function detectVirtuesFromSession(input: DetectionInput): DetectedVirtue[] {
  const { sessionId, attempts, masteryTransitions, journalTaps } = input;
  const now = new Date();
  const detected: DetectedVirtue[] = [];

  const persistenceAttempt = attempts.find(
    a => a.outcome === 'correct' && a.retryCount >= 2
  );
  if (persistenceAttempt) {
    detected.push({
      virtue: 'persistence',
      evidence: {
        itemId: persistenceAttempt.itemId,
        sessionId,
        narrativeText: 'You came back to a tricky one a few times — then it clicked.',
        observedAt: now,
      },
    });
  }

  const practiceTransition = masteryTransitions.find(
    t => t.from === 'review' && t.to === 'mastered'
  );
  if (practiceTransition) {
    detected.push({
      virtue: 'practice',
      evidence: {
        sessionId,
        narrativeText: `Remember how ${friendlySkillName(practiceTransition.skillCode)} felt new? Now it feels quicker. That's how practice works.`,
        observedAt: now,
      },
    });
  }

  if (journalTaps >= 2) {
    detected.push({
      virtue: 'curiosity',
      evidence: {
        sessionId,
        narrativeText: 'You went exploring the journal — curiosity is how naturalists find new things.',
        observedAt: now,
      },
    });
  }

  const firstTryCorrect = attempts.filter(
    a => a.outcome === 'correct' && a.retryCount === 0
  );
  if (firstTryCorrect.length >= 4) {
    detected.push({
      virtue: 'noticing',
      evidence: {
        sessionId,
        narrativeText: 'You spotted the pattern quickly on several questions — Naturalist Eyes.',
        observedAt: now,
      },
    });
  }

  return detected.slice(0, MAX_GEMS_PER_SESSION);
}

function friendlySkillName(skillCode: string): string {
  const parts = skillCode.split('.');
  const leaf = parts[parts.length - 1];
  return leaf.replace(/_/g, ' ');
}

// Back-compat stub for earlier callers
export function detectVirtuesForEvent(_evt: any): DetectedVirtue[] {
  return [];
}
