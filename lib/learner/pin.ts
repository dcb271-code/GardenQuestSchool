// lib/learner/pin.ts
//
// Hashing and checking a learner's profile PIN.
//
// Scope, stated plainly: this keeps a sibling out of a sibling's
// garden. Four digits is 10,000 possibilities and a determined person
// with a keyboard will get through it. That is the right trade for two
// children sharing a tablet — a real password would mean a five-year-
// old cannot get into her own account, which is a worse failure than
// her sister reading her letters.
//
// It is still hashed rather than stored. Children reuse numbers across
// things that matter more than this, and the same table holds their
// names and ages.

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/** Four digits. Long enough to be a secret, short enough to be typed. */
export const PIN_LENGTH = 4;

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** Bytes in the derived key. Fixed, and checked on the way back in. */
const KEY_LEN = 32;
const SALT_LEN = 16;

/** `salt:key`, both hex. */
export function hashPin(pin: string): string {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(pin, salt, KEY_LEN);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

/**
 * Constant-time check. A length mismatch or a malformed stored value
 * returns false rather than throwing, because this runs on a request
 * path where a crash would be a lockout.
 */
export function verifyPin(pin: string, stored: string | null): boolean {
  if (!stored) return true;          // no PIN set — the profile is open
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;
  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(keyHex, 'hex');
    // Length is checked against the CONSTANTS, not against each other.
    //
    // Buffer.from(x, 'hex') silently drops invalid characters, so a
    // corrupted row like "zz:zz" decodes to two empty buffers — and
    // timingSafeEqual(empty, empty) is true. Comparing the two decoded
    // lengths to one another would therefore have let a garbage hash
    // accept ANY pin. They have to match the sizes we actually write.
    if (salt.length !== SALT_LEN || expected.length !== KEY_LEN) return false;
    const actual = scryptSync(pin, salt, KEY_LEN);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/* ─── the unlock cookie ───────────────────────────────────────────── */

export const UNLOCK_COOKIE = 'gq_unlocked';

/**
 * Which learners this device has unlocked this session.
 *
 * A cookie rather than per-request re-entry, because a child navigating
 * from her garden to her journal to her letterbox should not be asked
 * four times. Cleared when the browser closes.
 */
export function parseUnlocked(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function withUnlocked(raw: string | undefined, learnerId: string): string {
  const set = new Set(parseUnlocked(raw));
  set.add(learnerId);
  return Array.from(set).join(',');
}
