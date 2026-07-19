import type { VirtueName, VirtueEvidence, MasteryState } from './types';

export interface DetectedVirtue {
  virtue: VirtueName;
  evidence: VirtueEvidence;
}

// Per-virtue narrative pools — picked deterministically by sessionId
// so the SAME session always gets the same line, but consecutive
// sessions cycle through. Without this, a child who triggers the
// same virtue ten sessions in a row sees the identical sentence
// every time, which made the gem feel mechanical.
const NOTICING_LINES = [
  'You spotted the pattern quickly on several questions — Naturalist Eyes.',
  'You read this set fast — your eyes are catching things that used to take longer.',
  'You found the right answer on the first try most of the way through. Patterns are starting to feel obvious.',
  'A naturalist notices what others miss. That\'s what just happened here.',
  'You recognised the shape of the question and went straight for it.',
];
const PERSISTENCE_LINES = [
  'You came back to a tricky one a few times — then it clicked.',
  'You didn\'t give up on the hard one. That\'s how brains grow.',
  'It took a few tries, and you found it anyway. That counts double.',
  'Some questions need a second look — and you gave one.',
];
const CURIOSITY_LINES = [
  'You went exploring the journal — curiosity is how naturalists find new things.',
  'You wandered the journal looking at creatures. That\'s exactly what naturalists do.',
  'A few quiet taps in the journal. The garden notices.',
];
const PRACTICE_LINES_PREFIX = [
  'Remember how',
  'It feels like ages ago, but',
  'You used to think about',
];
const COURAGE_LINES = [
  'It was brand new and you tried it anyway — that\'s courage.',
  'You didn\'t know how it would go, and you began. That\'s the brave part.',
  'New things feel wobbly at first. You stepped in anyway.',
  'Trying something hard on purpose — that\'s what courage looks like.',
];

function pickLine(pool: string[], sessionId: string): string {
  // Tiny deterministic hash so the line is stable per session.
  let h = 0;
  for (let i = 0; i < sessionId.length; i++) h = (h * 31 + sessionId.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
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
  /** Mastery state of the session's planned skill at session START
   *  (earliest transition's `from`, else current state). Drives courage. */
  plannedSkillStateAtStart?: MasteryState;
  /** Mean attempt item Elo minus the learner's Elo on the planned
   *  skill. Positive = punching above her weight. Drives courage and
   *  keeps noticing honest. */
  avgItemEloGap?: number;
}

const MAX_GEMS_PER_SESSION = 3;

export function detectVirtuesFromSession(input: DetectionInput): DetectedVirtue[] {
  const {
    sessionId, attempts, masteryTransitions, journalTaps,
    plannedSkillStateAtStart, avgItemEloGap,
  } = input;
  const now = new Date();
  const detected: DetectedVirtue[] = [];

  // Courage — she took on something genuinely at (or past) her edge:
  // a skill she'd never worked before, or items rated well above her,
  // stuck with it (≥3 attempts) and landed at least one.
  const correctCount = attempts.filter(a => a.outcome === 'correct').length;
  const wasFrontier =
    plannedSkillStateAtStart === 'new' || plannedSkillStateAtStart === 'learning';
  const wasAboveHerWeight = (avgItemEloGap ?? -Infinity) >= 100;
  if (attempts.length >= 3 && correctCount >= 1 && (wasFrontier || wasAboveHerWeight)) {
    detected.push({
      virtue: 'courage',
      evidence: {
        sessionId,
        narrativeText: pickLine(COURAGE_LINES, sessionId),
        observedAt: now,
      },
    });
  }

  const persistenceAttempt = attempts.find(
    a => a.outcome === 'correct' && a.retryCount >= 2
  );
  if (persistenceAttempt) {
    detected.push({
      virtue: 'persistence',
      evidence: {
        itemId: persistenceAttempt.itemId,
        sessionId,
        narrativeText: pickLine(PERSISTENCE_LINES, sessionId),
        observedAt: now,
      },
    });
  }

  const practiceTransition = masteryTransitions.find(
    t => t.from === 'review' && t.to === 'mastered'
  );
  if (practiceTransition) {
    const skillName = friendlySkillName(practiceTransition.skillCode);
    const prefix = pickLine(PRACTICE_LINES_PREFIX, sessionId);
    detected.push({
      virtue: 'practice',
      evidence: {
        sessionId,
        narrativeText: `${prefix} ${skillName} felt new? Now it feels quicker. That's how practice works.`,
        observedAt: now,
      },
    });
  }

  if (journalTaps >= 2) {
    detected.push({
      virtue: 'curiosity',
      evidence: {
        sessionId,
        narrativeText: pickLine(CURIOSITY_LINES, sessionId),
        observedAt: now,
      },
    });
  }

  // Noticing — "spotted the pattern" should be RARE and special. The
  // ≥4-of-anything rule fired on essentially every session (×158 for
  // one learner). Now require:
  //   • A FULL session: at least 5 attempts, all first-try correct
  //   • Content at (or near) her level — no gem for cruising far-easy
  //     reviews (avgItemEloGap ≥ −20 when the gap is known)
  // The 1/day cap in virtueGrants keeps it special even so.
  const firstTryCorrect = attempts.filter(
    a => a.outcome === 'correct' && a.retryCount === 0
  );
  const anyIncorrect = attempts.some(a => a.outcome === 'incorrect');
  const anyRetried = attempts.some(a => a.retryCount > 0);
  const enoughAttempts = attempts.length >= 5;
  const atLevel = avgItemEloGap === undefined || avgItemEloGap >= -20;
  if (firstTryCorrect.length >= 5 && !anyIncorrect && !anyRetried && enoughAttempts && atLevel) {
    detected.push({
      virtue: 'noticing',
      evidence: {
        sessionId,
        narrativeText: pickLine(NOTICING_LINES, sessionId),
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
