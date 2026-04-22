const INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 4,
  5: 7,
};

export function promoteBox(currentBox: number): number {
  return Math.min(5, currentBox + 1);
}

export function demoteBox(currentBox: number): number {
  return Math.max(1, currentBox - 1);
}

export function nextReviewDate(box: number, from: Date = new Date()): Date {
  const days = INTERVAL_DAYS[Math.max(1, Math.min(5, box))] ?? 0;
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isDueForReview(nextReviewAt: Date | null, now: Date = new Date()): boolean {
  if (nextReviewAt === null) return true;
  return nextReviewAt.getTime() <= now.getTime();
}
