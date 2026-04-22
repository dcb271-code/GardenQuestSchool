import { MasteryState } from './types';

export interface MasteryInput {
  currentState: MasteryState;
  correct: boolean;
  streakCorrect: number;
  sameSessionStreak: number;
  isNewSession: boolean;
  studentElo: number;
  itemElo: number;
}

export interface MasteryTransition {
  newState: MasteryState;
  demoted: boolean;
  promoted: boolean;
}

export function computeMasteryTransition(input: MasteryInput): MasteryTransition {
  const { currentState, correct, sameSessionStreak, isNewSession, studentElo, itemElo } = input;

  if (correct) {
    if (currentState === 'new') {
      return { newState: 'learning', demoted: false, promoted: true };
    }
    if (currentState === 'learning' && sameSessionStreak >= 3) {
      return { newState: 'review', demoted: false, promoted: true };
    }
    if (currentState === 'review' && isNewSession) {
      return { newState: 'mastered', demoted: false, promoted: true };
    }
    return { newState: currentState, demoted: false, promoted: false };
  }

  const eloDelta = Math.abs(studentElo - itemElo);
  if (eloDelta > 100) {
    return { newState: currentState, demoted: false, promoted: false };
  }

  const demoteMap: Record<MasteryState, MasteryState> = {
    mastered: 'review',
    review: 'learning',
    learning: 'learning',
    new: 'new',
  };
  return { newState: demoteMap[currentState], demoted: true, promoted: false };
}
