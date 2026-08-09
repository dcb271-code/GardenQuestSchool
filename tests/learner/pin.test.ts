import { describe, it, expect } from 'vitest';
import {
  hashPin, verifyPin, isValidPin, parseUnlocked, withUnlocked, PIN_LENGTH,
} from '@/lib/learner/pin';

describe('learner PIN', () => {
  it('accepts exactly four digits and nothing else', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('0000')).toBe(true);
    for (const bad of ['123', '12345', 'abcd', '12a4', '', ' 123', '12 4']) {
      expect(isValidPin(bad), bad).toBe(false);
    }
    expect(PIN_LENGTH).toBe(4);
  });

  it('never stores the digits themselves', () => {
    const h = hashPin('4271');
    expect(h).not.toContain('4271');
    expect(h.split(':')).toHaveLength(2);
  });

  it('salts, so the same PIN hashes differently every time', () => {
    expect(hashPin('1234')).not.toBe(hashPin('1234'));
  });

  it('verifies the right PIN and rejects the wrong one', () => {
    const h = hashPin('8317');
    expect(verifyPin('8317', h)).toBe(true);
    expect(verifyPin('8318', h)).toBe(false);
    expect(verifyPin('', h)).toBe(false);
    expect(verifyPin('83170', h)).toBe(false);
  });

  // A profile with no PIN has to stay open, or setting one on a sibling
  // would lock everybody out of everything.
  it('treats a profile with no PIN as open', () => {
    expect(verifyPin('anything', null)).toBe(true);
  });

  // This runs on a request path; throwing here would be a lockout.
  it('returns false rather than throwing on a malformed stored value', () => {
    // 'zz:zz' is the dangerous one: hex decoding drops invalid
    // characters, so it becomes two EMPTY buffers, and an empty buffer
    // compares equal to an empty buffer. A corrupt row must reject, not
    // accept everything.
    for (const bad of ['nocolon', 'zz:zz', ':', 'abc:', 'ab:cd', '00:00']) {
      expect(() => verifyPin('1234', bad)).not.toThrow();
      expect(verifyPin('1234', bad), bad).toBe(false);
    }
  });

  describe('the unlock cookie', () => {
    it('round-trips a set of learner ids', () => {
      expect(parseUnlocked(undefined)).toEqual([]);
      const a = withUnlocked(undefined, 'aaa');
      expect(parseUnlocked(a)).toEqual(['aaa']);
      const b = withUnlocked(a, 'bbb');
      expect(parseUnlocked(b).sort()).toEqual(['aaa', 'bbb']);
    });

    it('does not duplicate an already-unlocked learner', () => {
      const once = withUnlocked(undefined, 'aaa');
      expect(parseUnlocked(withUnlocked(once, 'aaa'))).toEqual(['aaa']);
    });

    it('ignores empty segments', () => {
      expect(parseUnlocked(',, ,aaa,')).toEqual(['aaa']);
    });
  });
});
