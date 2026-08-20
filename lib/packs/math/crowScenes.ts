// lib/packs/math/crowScenes.ts
//
// The crow's picture cache — data for the six mnemonic scenes.
//
// Spec: docs/superpowers/specs/2026-08-19-crow-mnemonics-spec.md.
// THE RULE: the answer must be derivable from the scene — countable
// in the picture, true of the animal's body, built from the
// characters' shapes, or arithmetic itself. Every rhyme was
// individually approved by the owner; do not edit casually.

export interface CrowScene {
  /** Canonical fact, a <= b. 8×7 summons the same scene as 7×8. */
  a: number;
  b: number;
  product: number;
  /** Scene id, doubles as the art component key. */
  code: string;
  title: string;
  /** The approved rhyme, spoken aloud in teach mode. */
  rhyme: string;
  /**
   * The derivation in plain words — what to LOOK at to rebuild the
   * answer when the rhyme is gone. This is the mnemonic's fallback
   * into thinking.
   */
  derivation: string;
  /**
   * Spoken/shown only where needed — the fence carries a warning
   * because its trick generalizes falsely.
   */
  caution?: string;
}

export const CROW_SCENES: CrowScene[] = [
  {
    a: 6, b: 6, product: 36, code: 'growing_shell',
    title: 'The Growing Shell',
    rhyme:
      "The little snail's shell hasn't curled all the way — still a three! Grandma's is a six. Thirty-six.",
    derivation:
      'Snail shells grow their curl as the snail grows up. A young shell is an unfinished six — which is exactly what a three is. Little shell, then big shell: 3, then 6.',
  },
  {
    a: 6, b: 7, product: 42, code: 'snail_mail',
    title: 'Snail Mail',
    rhyme:
      'Six weeks of seven days it\'s due — snail mail comes on day forty-two.',
    derivation:
      'A week is seven days — that is just what a week is. The snail takes six whole weeks. Count the calendar: six rows of seven days is 42 days.',
  },
  {
    a: 6, b: 8, product: 48, code: 'honeycomb',
    title: 'The Honeycomb',
    rhyme:
      'Eight honey rooms, six walls apiece — forty-eight walls, and the snail signs the lease.',
    derivation:
      'A honeycomb cell always has six walls — that is just what bees build. Eight rooms, six walls each. Count every wall: 48. The snail (one house on its back) is moving into the bee\'s apartment building.',
  },
  {
    a: 7, b: 7, product: 49, code: 'star_quilt',
    title: 'The Star Quilt',
    rhyme:
      'Seven rows of seven stars shine — one short of fifty: forty-nine.',
    derivation:
      'The two flags sewed a star quilt to become a real flag: seven rows of seven stars. The real flag has fifty. Count the quilt — or remember it is one star short: 50 take away 1 is 49.',
  },
  {
    a: 7, b: 8, product: 56, code: 'famous_fence',
    title: 'The Famous Fence',
    rhyme:
      'Five, six, seven, eight — read the fence and don\'t be late: fifty-six is seven times eight.',
    derivation:
      'The posts are numbered 5, 6, 7, 8 in a row. The flag stands on post 7 and the bee on post 8 — and the answer is the two posts before them: 56.',
    caution:
      'This fence is the only one in the whole times table where the numbers line up like this. It works exactly once — that is what makes it famous.',
  },
  {
    a: 8, b: 8, product: 64, code: 'bee_anatomy',
    title: 'Two Bees Compare',
    rhyme:
      'Six legs on the floor, four wings that soar — the bee counts up: sixty-four.',
    derivation:
      'Every bee really has six legs and four wings. Count from the floor up: legs first (6), then wings (4). 64.',
  },
];

/** The character alphabet — digits ghosted into garden citizens. */
export const CROW_ALPHABET = [
  { digit: 6, name: 'the Snail', why: 'its shell curls into a 6' },
  { digit: 7, name: 'the Flag', why: 'a letterbox flag is a 7 sideways' },
  { digit: 8, name: 'the Bee', why: 'head and body — two circles stacked' },
  { digit: 9, name: 'the Tadpole', why: 'a round head with a curling tail' },
] as const;

/** Scene lookup that honors commutativity: 8×7 finds the 7×8 scene. */
export function sceneForFact(a: number, b: number): CrowScene | undefined {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return CROW_SCENES.find(s => s.a === lo && s.b === hi);
}

export function getScene(code: string): CrowScene | undefined {
  return CROW_SCENES.find(s => s.code === code);
}

/* ── the nines: the finger trick ────────────────────────────────── */

export const FINGER_TRICK = {
  title: 'The Nines — Fold a Finger',
  rhyme:
    "Ten fingers up, fold one down — tens on the left, ones on the right, the answer's found.",
  intro:
    'Every nine lives on your own two hands. Hold all ten fingers up, and to multiply a number by nine, fold THAT finger down. The fingers left of the fold are the tens. The fingers right of it are the ones. The tadpole hides behind one finger — and the answer is just standing there.',
  outro:
    'This works for every single nine — no pictures to remember, because you carry the trick with you. Try it on your real hands right now.',
} as const;

/**
 * Fold finger n (1–10): fingers left of it are tens, right of it are
 * ones. True for every n because 9n = 10(n−1) + (10−n).
 */
export function nineFold(n: number): { left: number; right: number; product: number } {
  return { left: n - 1, right: 10 - n, product: 9 * n };
}
