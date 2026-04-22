export type MasteryState = 'new' | 'learning' | 'review' | 'mastered';

export type VirtueName =
  | 'persistence' | 'curiosity' | 'noticing'
  | 'care' | 'practice' | 'courage' | 'wondering';

export interface SkillDefinition {
  code: string;
  name: string;
  strandCode: string;
  level: number;
  prereqSkillCodes: string[];
  curriculumRefs?: Record<string, string>;
  themeTags: string[];
  sortOrder: number;
}

export interface SkillProgressRow {
  learnerId: string;
  skillId: string;
  skillCode: string;
  masteryState: MasteryState;
  leitnerBox: number;
  studentElo: number;
  streakCorrect: number;
  totalAttempts: number;
  totalCorrect: number;
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null;
}

export interface ExpeditionCandidate {
  skillCode: string;
  skillName: string;
  title: string;
  themeEmoji: string;
  skillHint: string;
  estItemCount: number;
  estDurationMs: number;
}

export interface SessionItemPlan {
  itemId: string;
  orderIndex: number;
  isStretch: boolean;
}

export interface SessionPlan {
  sessionId: string;
  skillCode: string;
  items: SessionItemPlan[];
}

export interface SessionStats {
  itemsAttempted: number;
  itemsCorrect: number;
  durationMs: number;
  skillsTouched: string[];
}

export interface VirtueEvidence {
  itemId?: string;
  sessionId: string;
  narrativeText: string;
  observedAt: Date;
}

export type NarratorKind = 'remember_when_hard' | 'used_to_need_fingers' | 'practice_is_working';
export interface NarratorPayload {
  skillCode: string;
  text: string;
}

export type EngineEvent =
  | { type: 'item.attempted'; sessionId: string; itemId: string; skillCode: string; outcome: 'correct' | 'incorrect' | 'skipped'; retries: number; timeMs: number }
  | { type: 'skill.state_changed'; learnerId: string; skillCode: string; from: MasteryState; to: MasteryState }
  | { type: 'skill.due_for_review'; learnerId: string; skillCode: string; overdueMs: number }
  | { type: 'session.completed'; sessionId: string; stats: SessionStats }
  | { type: 'virtue.observed'; learnerId: string; virtue: VirtueName; evidence: VirtueEvidence }
  | { type: 'interest.signal'; learnerId: string; tags: string[]; source: 'world' | 'journal' | 'habitat' }
  | { type: 'difficulty.adapted'; learnerId: string; skillCode: string; direction: 'up' | 'down' }
  | { type: 'narrator.moment'; learnerId: string; kind: NarratorKind; payload: NarratorPayload };
