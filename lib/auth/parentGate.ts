// lib/auth/parentGate.ts
//
// The grown-up gate. Family management — creating a profile, renaming
// one, changing a level, deleting one — is a PARENT action, and until
// now nothing enforced that: the passcode cookie was written at sign
// in and then never read by anything.
//
// It became real on 2026-09-06, when two profiles ("Mom", a second
// "Esme") turned up in the family. A seven-year-old had found the
// "add a new explorer" button on the picker. No harm done — but the
// same unguarded routes could have deleted a sibling's whole garden,
// and one of those profiles quietly misrouted a letter between
// sisters for a week.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const PARENT_COOKIE = 'gqs:parent-auth';

/** Has this device signed in as a grown-up? */
export function isParentAuthed(): boolean {
  return cookies().get(PARENT_COOKIE)?.value === '1';
}

/**
 * Guard a family-management route. Returns a refusal RESPONSE when
 * the gate is closed, or null to proceed.
 *
 * The refusal is in words and addressed to whoever is actually
 * reading it — which, given how this gate came to exist, may well be
 * a child who found the button. It should not read like an error.
 */
export function requireParent(): NextResponse | null {
  if (isParentAuthed()) return null;
  return NextResponse.json(
    {
      error:
        'This part is for grown-ups. Ask a grown-up to sign in on the parent page, then try again.',
      needsParent: true,
    },
    { status: 401 },
  );
}
