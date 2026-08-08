import { describe, it, expect } from 'vitest';
import { checkLearnerDelete } from '@/lib/learner/deleteGuards';

describe('learner delete guards', () => {
  const base = { actualName: 'Otto', confirmName: 'Otto', totalLearners: 4 };

  it('allows deletion when the name matches and others remain', () => {
    expect(checkLearnerDelete(base)).toEqual({ ok: true });
  });

  it('404s when the learner does not exist', () => {
    const v = checkLearnerDelete({ ...base, actualName: null });
    expect(v).toMatchObject({ ok: false, status: 404 });
  });

  it('refuses to delete the last remaining profile', () => {
    const v = checkLearnerDelete({ ...base, totalLearners: 1 });
    expect(v).toMatchObject({ ok: false, status: 400 });
    expect((v as any).error).toContain('only profile');
  });

  it('refuses a mismatched confirmation', () => {
    for (const typed of ['', 'Otta', 'Cecily', 'Ott']) {
      const v = checkLearnerDelete({ ...base, confirmName: typed });
      expect(v.ok, `"${typed}" should not confirm`).toBe(false);
    }
  });

  it('is case-sensitive — the friction is the point', () => {
    expect(checkLearnerDelete({ ...base, confirmName: 'otto' }).ok).toBe(false);
    expect(checkLearnerDelete({ ...base, confirmName: 'OTTO' }).ok).toBe(false);
  });

  it('tolerates surrounding whitespace from a keyboard', () => {
    expect(checkLearnerDelete({ ...base, confirmName: '  Otto ' }).ok).toBe(true);
  });

  // The last-profile check runs BEFORE the name check on purpose: a
  // parent who types the name correctly on their only profile should be
  // told why it can't happen, not told their name was wrong.
  it('reports the last-profile reason even with a correct name', () => {
    const v = checkLearnerDelete({ actualName: 'Otto', confirmName: 'Otto', totalLearners: 1 });
    expect((v as any).error).toContain('only profile');
  });
});
