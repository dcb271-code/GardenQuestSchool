// tests/world/parentGate.test.ts
//
// The grown-up gate on family management. Written the day two
// profiles a seven-year-old had made were deleted from the family.

import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookieStore = { value: undefined as string | undefined };
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) =>
      name === 'gqs:parent-auth' && cookieStore.value !== undefined
        ? { value: cookieStore.value }
        : undefined,
  }),
}));

import { isParentAuthed, requireParent, PARENT_COOKIE } from '@/lib/auth/parentGate';

beforeEach(() => { cookieStore.value = undefined; });

describe('the grown-up gate', () => {
  it('is closed when no one has signed in', async () => {
    expect(isParentAuthed()).toBe(false);
    const res = requireParent();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
    const body = await res!.json();
    expect(body.needsParent).toBe(true);
    // The refusal reaches a CHILD in words — house law.
    expect(body.error).toMatch(/grown-ups?/i);
    expect(body.error).not.toMatch(/unauthorized|401|forbidden/i);
  });

  it('opens once the passcode cookie is set', () => {
    cookieStore.value = '1';
    expect(isParentAuthed()).toBe(true);
    expect(requireParent()).toBeNull();
  });

  it('is not fooled by a cookie with any other value', () => {
    for (const v of ['0', 'true', 'yes', '', 'nope']) {
      cookieStore.value = v;
      expect(isParentAuthed()).toBe(false);
      expect(requireParent()).not.toBeNull();
    }
  });

  it('names the cookie the passcode route actually writes', () => {
    expect(PARENT_COOKIE).toBe('gqs:parent-auth');
  });
});
