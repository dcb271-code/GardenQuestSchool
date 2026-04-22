export interface Parent {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface Learner {
  id: string;
  parentId: string;
  firstName: string;
  avatarKey?: string;
  birthday?: Date;
  createdAt: Date;
}

export interface Item {
  id: string;
  skillId: string;
  type: string;
  content: Record<string, any>;
  answer: Record<string, any>;
  audioUrl?: string;
  difficultyElo: number;
  generatedBy: 'claude' | 'parent' | 'seed';
  approvedAt?: Date | null;
  usageCount?: number;
}

export interface ScoreOutcome {
  outcome: 'correct' | 'incorrect' | 'skipped';
}
