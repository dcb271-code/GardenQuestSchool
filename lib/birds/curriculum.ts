// lib/birds/curriculum.ts
//
// Units and generated exercises for the bird curriculum.
//
// Shape follows lib/music/curriculum.ts — a typed config array plus a
// seeded generator — because that pattern has now survived two
// subjects: content is cheap to add, questions can't be memorised by
// position, and the generator is testable against the catalog.
//
// The ordering inside a unit is Cornell's Four Keys, and it is not
// arbitrary:  size & shape  →  colour  →  behaviour & habitat  →  the
// fine marks. Their instruction is explicit that field marks matter
// "after you've placed your bird in the right group", and a beginner
// who jumps straight to marks ends up memorising spots without ever
// learning to see a bird.
//
// Photo exercises carry a {birdCode, role} REFERENCE, not a URL. The
// server resolves them against bird_photo at request time, so a bird
// whose photos haven't been curated yet simply produces fewer
// exercises rather than a broken screen.

import {
  BIRD_CATALOG, birdsOfCrew, crewCodes, getBird, sizeComparison,
  BILL_HINT, ANCHOR_INCHES,
  type BirdData, type SizeAnchor, type BillShape,
  type VoiceKind, type PitchShape, type ToneQuality, type BirdVoice,
} from '@/lib/world/birdCatalog';

export type Stage = 'look' | 'know' | 'listen' | 'match';

export const STAGE_LABEL: Record<Stage, string> = {
  look: 'who is it?',
  know: 'how it lives',
  listen: 'what it says',
  match: 'name that tune',
};

export const STAGE_EMOJI: Record<Stage, string> = {
  look: '👀', know: '📖', listen: '👂', match: '🎯',
};

export type BirdPhotoRole =
  | 'perched' | 'flight' | 'male' | 'female' | 'nonbreeding'
  | 'juvenile' | 'head' | 'back' | 'silhouette';

/** Resolved server-side against the bird_photo table. */
export interface BirdPhotoRef {
  birdCode: string;
  role: BirdPhotoRole;
}

/**
 * Resolved against the bird_audio table, exactly as photos are —
 * and with the same consequence: a bird whose clips have not been
 * auditioned yet produces fewer exercises, not a broken screen.
 */
export interface BirdClipRef {
  birdCode: string;
  kind: VoiceKind;
}

/**
 * Kid-facing names for what the ear is being asked to notice. The
 * pitch words deliberately mirror the music room's ear strand — she
 * has already answered "does it go up or down?" about piano notes,
 * and a chickadee is the identical skill wearing feathers.
 */
export const PITCH_LABEL: Record<PitchShape, string> = {
  rising: 'it slides UP',
  falling: 'it slides DOWN',
  flat: 'it stays on one level',
  wandering: 'it wanders up and down',
};

export const TONE_LABEL: Record<ToneQuality, string> = {
  whistle: 'a clean whistle',
  buzzy: 'a buzzy sound',
  trill: 'a fast trill',
  nasal: 'a pinched, nosey sound',
  harsh: 'a harsh, scratchy sound',
  flute: 'soft and smooth, like a little flute',
  chatter: 'a fast jumbled chatter',
};

export interface TeachPage {
  heading: string;
  body: string;
  figure?:
    | { kind: 'size_ladder'; highlight?: SizeAnchor }
    | { kind: 'bills'; highlight?: BillShape }
    | { kind: 'photo'; ref: BirdPhotoRef }
    | { kind: 'marks'; birdCode: string }
    | { kind: 'four_keys' }
    /** A playable clip with its spectrogram — sound made visible. */
    | { kind: 'clip'; ref: BirdClipRef };
}

export interface BirdUnit {
  code: string;
  title: string;
  crew: string;
  stage: Stage;
  blurb: string;
  teach: TeachPage[];
  birdCodes: string[];
  exerciseCount: number;
  outro: string;
}

export type BirdExercise =
  // ── shape first ──────────────────────────────────────────────
  | { kind: 'size_anchor'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'bill_face'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  // ── then colour and name ─────────────────────────────────────
  | { kind: 'photo_name'; prompt: string; photo: BirdPhotoRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'name_photo'; prompt: string; birdCode: string;
      photos: BirdPhotoRef[]; correctIndex: number; hint: string }
  // ── then behaviour and habitat ───────────────────────────────
  | { kind: 'behaviour'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'habitat'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  // ── and only then the fine marks ─────────────────────────────
  | { kind: 'field_mark'; prompt: string; photo: BirdPhotoRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'true_false'; prompt: string; birdCode: string;
      answer: boolean; hint: string }
  // ── LISTEN — Cornell's listening skills: words, then rhythm,
  //    then pitch, then tone. All multiple choice over a played clip.
  //    There is deliberately NO 'repetitions' exercise even though the
  //    catalog carries `repeats`: that field describes the TYPICAL
  //    phrase count, and any individual recording is free to differ.
  //    An exercise must never mark a child wrong for hearing the clip
  //    correctly.
  | { kind: 'mnemonic'; prompt: string; clip: BirdClipRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'song_or_call'; prompt: string; clip: BirdClipRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'pitch_shape'; prompt: string; clip: BirdClipRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'tone'; prompt: string; clip: BirdClipRef;
      choices: string[]; correctIndex: number; hint: string }
  // ── MATCH — the requested game: song → photo ─────────────────
  | { kind: 'song_to_photo'; prompt: string; clip: BirdClipRef;
      photos: BirdPhotoRef[]; correctIndex: number; hint: string }
  | { kind: 'which_did_you_hear'; prompt: string; clips: BirdClipRef[];
      correctIndex: number; hint: string };

// ── seeded helpers (same private shape as the other subjects) ────

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a multiple choice.
 *
 * Deduplicates the distractor pool and drops anything equal to the
 * correct answer. Both matter: two birds in a crew can honestly share
 * a habitat ("shady yards" belongs to the titmouse AND the nuthatch),
 * and offering it twice would put two correct answers on screen.
 */
function mc(
  correct: string, wrong: string[], rand: () => number, count: number,
): { choices: string[]; correctIndex: number } {
  const pool = Array.from(new Set(wrong)).filter(w => w !== correct);
  const distractors = shuffle(pool, rand).slice(0, Math.max(0, count - 1));
  const choices = shuffle([correct, ...distractors], rand);
  return { choices, correctIndex: choices.indexOf(correct) };
}

/**
 * How many choices this exercise offers.
 *
 * Ramps 2 → 3 → 4 across a unit. Two is not a token difficulty — for a
 * first meeting it's the difference between a guess she can reason
 * about and a wall of four unfamiliar names.
 */
export function choiceCount(index: number, total: number): number {
  if (total <= 2) return 2;
  const third = total / 3;
  if (index < third) return 2;
  if (index < third * 2) return 3;
  return 4;
}

/** Distractors, hardest-first: confusable birds before random ones. */
function otherBirds(bird: BirdData, pool: BirdData[]): BirdData[] {
  const confusable = (bird.confusableWith ?? [])
    .map(getBird)
    .filter((b): b is BirdData => !!b && b.code !== bird.code);
  const rest = pool.filter(
    b => b.code !== bird.code && !confusable.some(c => c.code === b.code),
  );
  return [...confusable, ...rest];
}

// ── the generator ────────────────────────────────────────────────

function lookExercise(
  bird: BirdData, pool: BirdData[], rand: () => number, n: number,
): BirdExercise | null {
  const others = otherBirds(bird, pool);
  const roll = rand();

  // Size — the first of Cornell's keys.
  if (roll < 0.2) {
    const correct = sizeComparison(bird);
    const anchors: SizeAnchor[] = ['sparrow', 'robin', 'crow'];
    const wrong = anchors
      .flatMap(a => [`smaller than a ${a}`, `about the size of a ${a}`, `bigger than a ${a}`])
      .filter(s => s !== correct);
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'size_anchor',
      prompt: `How big is the ${bird.commonName}?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: `A ${bird.commonName} is about ${bird.lengthInches} inches long, and a ${bird.sizeAnchor} is about ${ANCHOR_INCHES[bird.sizeAnchor]}.`,
    };
  }

  // Bill and face — Sibley's version of shape, and the one a child can see.
  if (roll < 0.4) {
    const correct = BILL_HINT[bird.bill];
    const wrong = Object.entries(BILL_HINT)
      .filter(([k]) => k !== bird.bill)
      .map(([, v]) => v);
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'bill_face',
      prompt: `What kind of bill does the ${bird.commonName} have?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: `Look at what it eats. ${bird.colourHook}`,
    };
  }

  // Name the photo.
  if (roll < 0.75) {
    const { choices, correctIndex } = mc(
      bird.commonName, others.map(b => b.commonName), rand, n,
    );
    return {
      kind: 'photo_name',
      prompt: 'Which bird is this?',
      photo: { birdCode: bird.code, role: bird.dimorphic ? pickSexRole(rand) : 'perched' },
      choices, correctIndex,
      hint: bird.fieldMarks[0] ? `Look for ${bird.fieldMarks[0]}.` : bird.colourHook,
    };
  }

  // Find the bird by name — harder, because it needs recall not recognition.
  const wrongBirds = shuffle(others, rand).slice(0, Math.max(0, n - 1));
  const photos: BirdPhotoRef[] = shuffle(
    [bird, ...wrongBirds].map(b => ({
      birdCode: b.code, role: 'perched' as BirdPhotoRole,
    })),
    rand,
  );
  return {
    kind: 'name_photo',
    prompt: `Which one is the ${bird.commonName}?`,
    birdCode: bird.code,
    photos,
    correctIndex: photos.findIndex(p => p.birdCode === bird.code),
    hint: bird.fieldMarks[0] ? `Look for ${bird.fieldMarks[0]}.` : bird.colourHook,
  };
}

function pickSexRole(rand: () => number): BirdPhotoRole {
  return rand() < 0.5 ? 'male' : 'female';
}

function knowExercise(
  bird: BirdData, pool: BirdData[], rand: () => number, n: number,
): BirdExercise | null {
  const others = otherBirds(bird, pool);
  const roll = rand();

  if (roll < 0.4 && bird.behaviour.length) {
    const correct = pick(bird.behaviour, rand);
    // Filter against THIS bird's whole list, not just the chosen line:
    // two birds in a crew can honestly share a behaviour, and offering
    // it as the wrong answer would mark a right answer wrong.
    const wrong = others
      .flatMap(b => b.behaviour)
      .filter(x => !bird.behaviour.includes(x));
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'behaviour',
      prompt: `Which of these does the ${bird.commonName} do?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: bird.facts[0] ?? bird.colourHook,
    };
  }

  if (roll < 0.7 && bird.habitat.length) {
    const correct = pick(bird.habitat, rand);
    const wrong = others.flatMap(b => b.habitat).filter(h => !bird.habitat.includes(h));
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'habitat',
      prompt: `Where would you look for a ${bird.commonName}?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: bird.colourHook,
    };
  }

  // True/false, drawn from real field marks — half the time about a
  // DIFFERENT bird's mark, which is what makes it worth asking.
  const askAboutSelf = rand() < 0.5 || others.length === 0;
  if (askAboutSelf && bird.fieldMarks.length) {
    return {
      kind: 'true_false',
      prompt: `True or false — the ${bird.commonName} has ${bird.fieldMarks[0]}.`,
      birdCode: bird.code,
      answer: true,
      hint: bird.colourHook,
    };
  }
  const other = pick(others, rand);
  // Only borrow a mark that is genuinely NOT true of this bird —
  // otherwise the "false" answer is actually true.
  const borrowable = other.fieldMarks.filter(m => !bird.fieldMarks.includes(m));
  const borrowed = borrowable[0];
  if (!borrowed) return null;
  return {
    kind: 'true_false',
    prompt: `True or false — the ${bird.commonName} has ${borrowed}.`,
    birdCode: bird.code,
    answer: false,
    hint: `That belongs to the ${other.commonName}. ${bird.colourHook}`,
  };
}

/** The hint every clip exercise falls back on: the voice's own note. */
function voiceHint(voice: BirdVoice): string {
  return voice.mnemonic
    ? `It sounds like “${voice.mnemonic}”. ${voice.note}`
    : voice.note;
}

/**
 * The FIRST voice of each kind, and only that.
 *
 * A clip reference is {birdCode, kind}, so one stored clip answers for
 * a kind — and the audition page shows the first-of-kind mnemonic when
 * a human chooses that clip. The Blue Jay is why this matters: it has
 * two call voices (the scream falls, the pump-handle squeak RISES),
 * and an exercise generated from the second would ask about a pitch
 * the auditioned clip does not have. Second voices wait until clips
 * can be pinned to a specific voice (a Phase 4 problem).
 */
function primaryVoices(bird: BirdData): BirdVoice[] {
  const seen = new Set<VoiceKind>();
  return bird.voices.filter(v =>
    seen.has(v.kind) ? false : (seen.add(v.kind), true),
  );
}

function listenExercise(
  bird: BirdData, pool: BirdData[], rand: () => number, n: number,
): BirdExercise | null {
  const voice = pick(primaryVoices(bird), rand);
  const clip: BirdClipRef = { birdCode: bird.code, kind: voice.kind };
  const roll = rand();

  // The words — the single best handle a child has on a song.
  if (roll < 0.35 && voice.mnemonic) {
    const wrong = pool.flatMap(b =>
      b.code === bird.code
        ? []
        : b.voices.map(v => v.mnemonic).filter((m): m is string => !!m),
    );
    const { choices, correctIndex } = mc(voice.mnemonic, wrong, rand, n);
    return {
      kind: 'mnemonic',
      prompt: `Listen. Which words fit what the ${bird.commonName} is saying?`,
      clip, choices, correctIndex,
      hint: voice.note,
    };
  }

  // Song or call — the distinction that makes winter listening make
  // sense. Only asked of kinds where the answer is one of the two.
  if (roll < 0.55 && (voice.kind === 'song' || voice.kind === 'call')) {
    const choices = [
      'its song — the long fancy one',
      'its call — the short everyday one',
    ];
    return {
      kind: 'song_or_call',
      prompt: `Is the ${bird.commonName} giving its song or its call?`,
      clip, choices,
      correctIndex: voice.kind === 'song' ? 0 : 1,
      hint: voice.note,
    };
  }

  // Pitch shape — the music room's ear strand, wearing feathers.
  if (roll < 0.8) {
    const correct = PITCH_LABEL[voice.pitchShape];
    const wrong = Object.values(PITCH_LABEL).filter(l => l !== correct);
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'pitch_shape',
      prompt: 'Listen to the shape of the sound. Which way does it go?',
      clip, choices, correctIndex,
      hint: voiceHint(voice),
    };
  }

  // Tone — whistle, buzz, honk. Timbre is what the spectrogram makes
  // visible: one clean line against fuzzy stacks.
  const correct = TONE_LABEL[voice.tone];
  const wrong = Object.values(TONE_LABEL).filter(l => l !== correct);
  const { choices, correctIndex } = mc(correct, wrong, rand, n);
  return {
    kind: 'tone',
    prompt: 'What KIND of sound is that?',
    clip, choices, correctIndex,
    hint: voiceHint(voice),
  };
}

function matchExercise(
  bird: BirdData, pool: BirdData[], rand: () => number, n: number,
): BirdExercise | null {
  const voice = pick(primaryVoices(bird), rand);
  const clip: BirdClipRef = { birdCode: bird.code, kind: voice.kind };
  const others = otherBirds(bird, pool);
  if (others.length === 0) return null;

  // The headline game: hear a sound, find the face.
  if (rand() < 0.65) {
    const wrongBirds = shuffle(others, rand).slice(0, Math.max(0, n - 1));
    const photos: BirdPhotoRef[] = shuffle(
      [bird, ...wrongBirds].map(b => ({
        birdCode: b.code, role: 'perched' as BirdPhotoRole,
      })),
      rand,
    );
    return {
      kind: 'song_to_photo',
      prompt: 'Who is making this sound?',
      clip, photos,
      correctIndex: photos.findIndex(p => p.birdCode === bird.code),
      hint: voiceHint(voice),
    };
  }

  // The mirror image: know the bird, pick its sound from a rival's.
  const rival = pick(others, rand);
  const rivalVoice = pick(primaryVoices(rival), rand);
  const clips: BirdClipRef[] = shuffle(
    [clip, { birdCode: rival.code, kind: rivalVoice.kind }],
    rand,
  );
  return {
    kind: 'which_did_you_hear',
    prompt: `One of these is the ${bird.commonName}. Which one?`,
    clips,
    correctIndex: clips.findIndex(c => c.birdCode === bird.code),
    hint: voiceHint(voice),
  };
}

export function buildExercises(unit: BirdUnit, seed: number): BirdExercise[] {
  const rand = rng(seed);
  const pool = unit.birdCodes
    .map(getBird)
    .filter((b): b is BirdData => !!b);
  if (pool.length === 0) return [];

  const out: BirdExercise[] = [];
  // Walk the birds in rotation so every bird in the crew gets asked
  // about before any bird is asked about twice.
  const order = shuffle(pool, rand);
  for (let i = 0; i < unit.exerciseCount; i++) {
    const bird = order[i % order.length];
    const n = Math.min(choiceCount(i, unit.exerciseCount), pool.length);
    const ex =
      unit.stage === 'look' ? lookExercise(bird, pool, rand, n)
      : unit.stage === 'know' ? knowExercise(bird, pool, rand, n)
      : unit.stage === 'listen' ? listenExercise(bird, pool, rand, n)
      : matchExercise(bird, pool, rand, n);
    if (ex) out.push(ex);
  }
  return out;
}

// ── the units ────────────────────────────────────────────────────

const FOUR_KEYS_PAGE: TeachPage = {
  heading: 'Four things to look at',
  body:
    'Birders look at four things, always in the same order. First how BIG it is and what SHAPE — especially the bill and the face. Then the COLOUR pattern. Then what it is DOING. Then WHERE it is. The little spots and stripes come last, once you already know roughly what kind of bird it is.',
  figure: { kind: 'four_keys' },
};

const SIZE_PAGE: TeachPage = {
  heading: 'The measuring stick',
  body:
    'Every bird gets measured against three you already know. Sparrow-sized, robin-sized, or crow-sized. When you see a new bird, that is the very first question: which of the three is it closest to?',
  figure: { kind: 'size_ladder' },
};

const BILL_PAGE: TeachPage = {
  heading: 'The bill tells you what it eats',
  body:
    'A fat cone bill cracks seeds. A straight chisel drills wood. Fine tweezers pick insects out of cracks. Before you look at a single colour, look at the bill — it puts the bird in the right family straight away.',
  figure: { kind: 'bills' },
};

export const UNITS: BirdUnit[] = [
  {
    code: 'crew1_look',
    title: 'Meet the Everyday Five',
    crew: 'crew1',
    stage: 'look',
    blurb: 'The five birds you can see from the window almost any day.',
    teach: [
      FOUR_KEYS_PAGE,
      SIZE_PAGE,
      BILL_PAGE,
      {
        heading: 'The cardinal is yours',
        body:
          'The Northern Cardinal is the state bird of Kentucky. Schoolchildren campaigned for it and the state agreed in 1926. The male is scarlet with a black mask. The female is warm brown — but look at her crest and her heavy orange bill and you will see she is the same bird in different colours.',
        figure: { kind: 'marks', birdCode: 'northern_cardinal' },
      },
      {
        heading: 'Blue, and not really blue',
        body:
          'The Blue Jay has no blue paint in it at all. The feather is built so that when light hits it, only blue bounces back to your eye. Crush the feather and the blue disappears completely.',
        figure: { kind: 'photo', ref: { birdCode: 'blue_jay', role: 'perched' } },
      },
      {
        heading: 'The little one with the black cap',
        body:
          'The Carolina Chickadee is tiny — smaller than a sparrow. Black cap, black bib, and a bright white cheek squeezed between the two. Watch the feeder: it takes exactly one seed, flies off to eat it, and comes straight back.',
        figure: { kind: 'marks', birdCode: 'carolina_chickadee' },
      },
    ],
    birdCodes: ['northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee', 'american_robin'],
    exerciseCount: 9,
    outro: 'Five birds. Now look out of a window — one of them is probably there right now.',
  },
  {
    code: 'crew1_know',
    title: 'How the Everyday Five Live',
    crew: 'crew1',
    stage: 'know',
    blurb: 'What they eat, where they go, and the strange things they do.',
    teach: [
      {
        heading: 'Watch what it is doing',
        body:
          'Behaviour identifies a bird as surely as colour does. A robin runs, stops dead, tilts its head, then pulls. A dove walks on the ground and almost never lands on the feeder. A chickadee grabs one seed and leaves. You can name all three with your eyes half shut.',
        figure: { kind: 'four_keys' },
      },
      {
        heading: 'The head tilt',
        body:
          'When a robin stops and tilts its head on the lawn, it is aiming ONE eye at the ground. Its eyes are on the sides of its head, so it cannot look straight down with both at once. Then it pulls the worm up.',
        figure: { kind: 'photo', ref: { birdCode: 'american_robin', role: 'perched' } },
      },
      {
        heading: 'Counting the dees',
        body:
          'The chickadee is saying its own name — chick-a-DEE-DEE-DEE. It is an alarm call, and the number of dees tells the other birds how much danger there is. More dees means a more dangerous animal nearby. Next time you hear it, count.',
      },
    ],
    birdCodes: ['northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee', 'american_robin'],
    exerciseCount: 7,
    outro: 'Knowing what a bird does is knowing the bird.',
  },
  {
    code: 'crew1_listen',
    title: 'The Everyday Five Speak',
    crew: 'crew1',
    stage: 'listen',
    blurb: 'Close your eyes. You can still name every one of them.',
    teach: [
      {
        heading: 'Songs and calls are different things',
        body:
          'A bird’s SONG is the long fancy one — it is for saying "this is my garden" and "come and meet me", so it mostly happens in spring and summer. A CALL is the short everyday one — "watch out!", "where are you?", "I’m here" — and you can hear calls all year round. Most birds have both.',
      },
      {
        heading: 'Put words to it',
        body:
          'Birders remember songs by putting silly words to them. The cardinal whistles birdie-birdie-birdie. The chickadee says its own name. The words are not what the bird means — they are a handle for YOUR memory, and they work astonishingly well.',
        figure: { kind: 'clip', ref: { birdCode: 'northern_cardinal', kind: 'song' } },
      },
      {
        heading: 'You already know how to do this',
        body:
          'In the music room you answered "does it go up or down?" about piano notes. A bird song is the same question. The cardinal’s whistle slides DOWN. The picture under each sound shows it too — a whistle draws one clean line, and you can watch it fall.',
      },
      {
        heading: 'The dove is not an owl',
        body:
          'That soft sad coo-OO-oo from the wires? People hear it their whole lives and think it is an owl. It is the Mourning Dove — and the cooing IS its song. The second note is the highest; then it settles down, like a sigh.',
        figure: { kind: 'clip', ref: { birdCode: 'mourning_dove', kind: 'song' } },
      },
      {
        heading: 'The jay does not really sing',
        body:
          'The Blue Jay mostly shouts — a loud harsh JAY! JAY! that carries across the whole street. No sweet song, no fancy tune. If you hear a scream like that, you already know who it is.',
        figure: { kind: 'clip', ref: { birdCode: 'blue_jay', kind: 'call' } },
      },
    ],
    birdCodes: ['northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee', 'american_robin'],
    exerciseCount: 9,
    outro: 'Now open the window and just listen for a minute.',
  },
  {
    code: 'crew1_match',
    title: 'Name That Tune: the Everyday Five',
    crew: 'crew1',
    stage: 'match',
    blurb: 'The game: hear a sound, find the bird.',
    teach: [
      {
        heading: 'Hear it, then find the face',
        body:
          'This is what real birders do every day: a sound comes out of a bush, and before they see anything at all they already know who is in there. Listen first. Ask yourself — long and fancy, or short? Whistle or scream? Sliding down, or staying level? THEN look at the pictures.',
        figure: { kind: 'clip', ref: { birdCode: 'american_robin', kind: 'song' } },
      },
    ],
    birdCodes: ['northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee', 'american_robin'],
    exerciseCount: 8,
    outro: 'You can name a bird you cannot even see. That is a superpower.',
  },
  {
    code: 'crew2_look',
    title: 'Meet the Little Gang',
    crew: 'crew2',
    stage: 'look',
    blurb: 'Five small birds — and in winter they all travel together.',
    teach: [
      {
        heading: 'They come as a gang',
        body:
          'In winter, chickadees, titmice and nuthatches move through the trees together in one loose flock. More birds means more eyes watching for hawks. If you find one of them, look around — the others are usually close by.',
      },
      {
        heading: 'Crest, or no crest?',
        body:
          'The Tufted Titmouse and the White-breasted Nuthatch are both small and grey and white. The titmouse has a pointed CREST and a big dark eye. The nuthatch has a smooth black cap and almost no tail — and it walks head-first DOWN the tree trunk, which nothing else in the yard does.',
        figure: { kind: 'marks', birdCode: 'white_breasted_nuthatch' },
      },
      {
        heading: 'The loudest small bird',
        body:
          'The Carolina Wren weighs about as much as four paperclips. Rusty brown, a bold white eyebrow, and a tail cocked straight up. It has one of the loudest voices in the whole yard, and it is the one bird here that sings all year round.',
        figure: { kind: 'marks', birdCode: 'carolina_wren' },
      },
      {
        heading: 'The same bird, twice',
        body:
          'In summer the male American Goldfinch is brilliant lemon yellow with a black cap. The female is a quiet olive-buff all year — and in WINTER the male changes to look very much like her. People are certain they are seeing two different birds. Look at the black wings with the white bars: those stay the same whatever else changes.',
        figure: { kind: 'photo', ref: { birdCode: 'american_goldfinch', role: 'male' } },
      },
    ],
    birdCodes: ['tufted_titmouse', 'white_breasted_nuthatch', 'carolina_wren', 'american_goldfinch', 'house_finch'],
    exerciseCount: 9,
    outro: 'Ten birds now. That is more than most grown-ups can name.',
  },
  {
    code: 'crew2_know',
    title: 'How the Little Gang Lives',
    crew: 'crew2',
    stage: 'know',
    blurb: 'Fur thieves, upside-down walkers, and a finch that came from a pet shop.',
    teach: [
      {
        heading: 'Upside down on purpose',
        body:
          'The nuthatch goes DOWN the tree head-first. Every other bird climbs up. Going down means it spots insects tucked into the bark that all the upward-climbing birds walked straight past — it is finding food nobody else can reach.',
        figure: { kind: 'photo', ref: { birdCode: 'white_breasted_nuthatch', role: 'perched' } },
      },
      {
        heading: 'The fur thief',
        body:
          'The Tufted Titmouse lines its nest with fur — and it takes the fur off living animals. Squirrels, dogs, and sometimes people. It lands, pulls out a beakful, and flies off before anyone can object.',
      },
      {
        heading: 'The finch that escaped',
        body:
          'House Finches are not really eastern birds. Pet shops in New York sold them illegally as "Hollywood Finches". In 1940 the sellers let them go to avoid being arrested, and those escaped birds spread across the whole eastern half of the country. They reached Kentucky in the late 1970s.',
        figure: { kind: 'photo', ref: { birdCode: 'house_finch', role: 'male' } },
      },
    ],
    birdCodes: ['tufted_titmouse', 'white_breasted_nuthatch', 'carolina_wren', 'american_goldfinch', 'house_finch'],
    exerciseCount: 7,
    outro: 'Every one of these is out there today, doing exactly this.',
  },
  {
    code: 'crew2_listen',
    title: 'The Little Gang Speaks',
    crew: 'crew2',
    stage: 'listen',
    blurb: 'A teakettle, a toy trumpet, and a bird that sings while it bounces.',
    teach: [
      {
        heading: 'The loudest voice sings all year',
        body:
          'The Carolina Wren sings teakettle-teakettle-teakettle — loud, rolling, three beats to a phrase — and it is the ONE bird here that sings in every month of the year. January snow, July heat, it does not care. If you learn a single song, learn this one: it is always out there to check yourself against.',
        figure: { kind: 'clip', ref: { birdCode: 'carolina_wren', kind: 'song' } },
      },
      {
        heading: 'One bird, two sounds',
        body:
          'The chickadee’s CALL is the buzzy chick-a-dee-dee-dee — its own name, all year round. But its SONG is completely different: four sweet clear whistles, each a little lower than the last — fee-bee-fee-bay. Same tiny bird. Hearing that one bird owns both sounds is the whole trick of listening.',
        figure: { kind: 'clip', ref: { birdCode: 'carolina_chickadee', kind: 'song' } },
      },
      {
        heading: 'The nuthatch honks',
        body:
          'The nuthatch does not whistle and does not sing much at all. It honks — yank-yank — like a tiny toy trumpet, and it sounds slightly cross about something. A pinched, nosey sound like that is called NASAL, and once you know it, nothing else in the yard is mistaken for it.',
        figure: { kind: 'clip', ref: { birdCode: 'white_breasted_nuthatch', kind: 'call' } },
      },
      {
        heading: 'Look up!',
        body:
          'The goldfinch calls while it FLIES — po-ta-to-chip! — one little burst on each bounce of its roller-coaster flight path. It is the only sound in this game given from the air. When you hear it, look up, and you will see the bounces match the words.',
        figure: { kind: 'clip', ref: { birdCode: 'american_goldfinch', kind: 'flight_call' } },
      },
    ],
    birdCodes: ['tufted_titmouse', 'white_breasted_nuthatch', 'carolina_wren', 'american_goldfinch', 'house_finch'],
    exerciseCount: 9,
    outro: 'Ten birds by ear. Most grown-ups cannot do that with three.',
  },
  {
    code: 'crew2_match',
    title: 'Name That Tune: the Little Gang',
    crew: 'crew2',
    stage: 'match',
    blurb: 'The full game — every bird you know, by sound alone.',
    teach: [
      {
        heading: 'The hard ones sound alike on purpose',
        body:
          'The goldfinch and the house finch both ramble — long twittering warbles without tidy words. Here is the secret: the house finch usually ends on a rough BUZZY note that slides upward, like a little question. If the ramble ends scratchy, it is the house finch. If it just keeps sweetly going, think goldfinch.',
        figure: { kind: 'clip', ref: { birdCode: 'house_finch', kind: 'song' } },
      },
    ],
    birdCodes: ['tufted_titmouse', 'white_breasted_nuthatch', 'carolina_wren', 'american_goldfinch', 'house_finch'],
    exerciseCount: 8,
    outro: 'You did it — the whole yard, eyes shut. Go and listen to the real thing.',
  },
];

export function getUnit(code: string): BirdUnit | undefined {
  return UNITS.find(u => u.code === code);
}

export function unitsOfCrew(crew: string): BirdUnit[] {
  return UNITS.filter(u => u.crew === crew);
}

/**
 * Which units can be offered at all. Listen and Match need confirmed
 * clips, and clips arrive bird by bird through a human auditioning
 * them by ear — so until a crew has ANY audio, its listen/match units
 * are hidden rather than shown as a locked promise that taps into an
 * empty screen. `birdsWithAudioCodes` comes from the audio index; pass
 * undefined (e.g. in tests that only care about sequencing) to treat
 * everything as available.
 */
export function visibleUnits(birdsWithAudioCodes?: string[]): BirdUnit[] {
  if (!birdsWithAudioCodes) return UNITS;
  const has = new Set(birdsWithAudioCodes);
  return UNITS.filter(u =>
    (u.stage !== 'listen' && u.stage !== 'match') ||
    u.birdCodes.some(c => has.has(c)),
  );
}

/**
 * Strictly sequential, unlike music.
 *
 * Music unlocks per strand so she can follow whatever her teacher set
 * this week. Birds are the opposite: the request was explicitly see
 * them, then learn them, then hear them, then match — and the stages
 * genuinely depend on each other. You cannot match a song to a photo
 * of a bird you cannot yet recognise.
 *
 * Two subtleties, both born the day the listen units landed:
 *
 *  - The sequence is over the units currently VISIBLE, so a hidden
 *    listen unit does not padlock everything after it while its
 *    clips are still being auditioned.
 *  - A completed unit is always unlocked. It was legitimately open
 *    when it was passed; a unit inserted BEFORE it later (crew1_listen
 *    arrived after crew2_look was done) must not retroactively lock
 *    her out of reviewing it.
 */
export function isUnitUnlocked(
  code: string, completed: string[], units: BirdUnit[] = UNITS,
): boolean {
  if (completed.includes(code)) return true;
  const idx = units.findIndex(u => u.code === code);
  if (idx <= 0) return idx === 0;
  return completed.includes(units[idx - 1].code);
}

export function nextUnit(
  completed: string[], units: BirdUnit[] = UNITS,
): BirdUnit | undefined {
  return units.find(u => !completed.includes(u.code));
}

/** Birds she has been taught — drives the journal and, later, the garden. */
export function birdsLearned(completed: string[]): string[] {
  const codes = new Set<string>();
  for (const u of UNITS) {
    if (completed.includes(u.code)) u.birdCodes.forEach(c => codes.add(c));
  }
  return BIRD_CATALOG.filter(b => codes.has(b.code)).map(b => b.code);
}

export { BIRD_CATALOG, birdsOfCrew, crewCodes, getBird };
