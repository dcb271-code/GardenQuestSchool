// lib/world/japaneseSchool.ts
//
// Bachan's writing table — a small Japanese curriculum that lives in
// the japanese garden bed. It opens once the bed is awake AND
// something is actually growing in it, so the language arrives with
// the garden rather than as a worksheet bolted onto it.
//
// The shape is deliberately modest and extensible: an ordered list of
// UNITS, each a handful of characters with a mnemonic, taught as
// flashcards and then drilled with generated multiple-choice
// questions. Finishing a unit unlocks the next and is recorded in
// world_state.garden.japanese_units (no migration needed).
//
// Starting curriculum: the first five rows of hiragana — the "alphabet"
// — plus three kanji sets. The first kanji set is the payoff for the
// whole garden: the five plants she has actually grown, written in the
// characters printed on their own plant cards.
//
// Room to grow, in order: the remaining five hiragana rows (は ま や
// ら わ), dakuten (が ざ だ ば), katakana, greetings, and counting.

export type UnitKind = 'hiragana' | 'kanji';

export interface JapaneseChar {
  char: string;        // あ / 竹
  romaji: string;      // a / take
  /** For kanji: what it means. Hiragana are sounds, so this is absent. */
  meaning?: string;
  /** One kid-sized hook for remembering the SHAPE. */
  mnemonic: string;
}

export interface JapaneseUnit {
  code: string;
  title: string;
  /** The characters, shown under the title on the unit card. */
  subtitle: string;
  kind: UnitKind;
  intro: string;
  outro: string;
  chars: JapaneseChar[];
}

export const JAPANESE_UNITS: JapaneseUnit[] = [
  {
    code: 'hira_vowels',
    title: 'The Five Sounds',
    subtitle: 'あ い う え お',
    kind: 'hiragana',
    intro: 'Every Japanese word is built from these five sounds. Learn them and you have the corners of the whole language.',
    outro: 'Five sounds down. Every other row you learn is just these five wearing a hat.',
    chars: [
      { char: 'あ', romaji: 'a', mnemonic: 'There is a capital A hiding inside it, with a little scarf tied on.' },
      { char: 'い', romaji: 'i', mnemonic: 'Two strokes leaning together — like the two dots in "ii".' },
      { char: 'う', romaji: 'u', mnemonic: 'A face seen from the side with a big nose, going "ooo".' },
      { char: 'え', romaji: 'e', mnemonic: 'Someone with their arms flung out saying "eh?!"' },
      { char: 'お', romaji: 'o', mnemonic: 'Almost the same as あ — but お has a tail kicking out behind.' },
    ],
  },
  {
    code: 'hira_ka',
    title: 'The Ka Row',
    subtitle: 'か き く け こ',
    kind: 'hiragana',
    intro: 'Now the five sounds get a K in front. Ka, ki, ku, ke, ko.',
    outro: 'Ten characters. You can already spell かき — persimmon, the fruit in your orchard.',
    chars: [
      { char: 'か', romaji: 'ka', mnemonic: 'A mosquito with a bite mark beside it — and "mosquito" in Japanese IS ka.' },
      { char: 'き', romaji: 'ki', mnemonic: 'It looks like a key you would turn in a lock.' },
      { char: 'く', romaji: 'ku', mnemonic: 'A bird\'s open beak, going "ku-ku".' },
      { char: 'け', romaji: 'ke', mnemonic: 'A keg lying on its side with a tap sticking out.' },
      { char: 'こ', romaji: 'ko', mnemonic: 'Two little coils of rope, one above the other.' },
    ],
  },
  {
    code: 'hira_sa',
    title: 'The Sa Row',
    subtitle: 'さ し す せ そ',
    kind: 'hiragana',
    intro: 'Sa, shi, su, se, so. Watch out for し — it is one single stroke.',
    outro: 'Now you can read さくら — sakura. The cherry tree in your garden.',
    chars: [
      { char: 'さ', romaji: 'sa', mnemonic: 'A fishing hook with the line cut across the top.' },
      { char: 'し', romaji: 'shi', mnemonic: 'One long curved hook — like a smile lying on its side.' },
      { char: 'す', romaji: 'su', mnemonic: 'A loop with a tail, like a swing hanging from a branch.' },
      { char: 'せ', romaji: 'se', mnemonic: 'A mouth wide open saying "seh", with a tongue sticking out.' },
      { char: 'そ', romaji: 'so', mnemonic: 'A zigzag of thread being sewn back and forth.' },
    ],
  },
  {
    code: 'hira_ta',
    title: 'The Ta Row',
    subtitle: 'た ち つ て と',
    kind: 'hiragana',
    intro: 'Ta, chi, tsu, te, to. Two of these are secretly pictures of what they mean.',
    outro: 'Now you can read たけ — take. The bamboo in your bed.',
    chars: [
      { char: 'た', romaji: 'ta', mnemonic: 'A little t next to a little a, standing side by side.' },
      { char: 'ち', romaji: 'chi', mnemonic: 'A number 5 that got turned around backwards.' },
      { char: 'つ', romaji: 'tsu', mnemonic: 'A wave curling over — think of a tsunami.' },
      { char: 'て', romaji: 'te', mnemonic: 'It looks like the kanji 手, which means HAND — and te means hand.' },
      { char: 'と', romaji: 'to', mnemonic: 'A toe with a splinter stuck in it. Ouch.' },
    ],
  },
  {
    code: 'hira_na',
    title: 'The Na Row',
    subtitle: 'な に ぬ ね の',
    kind: 'hiragana',
    intro: 'Na, ni, nu, ne, no. The last one may be the easiest character in the language.',
    outro: 'Twenty-five characters! Half of hiragana. And you can spell ねこ — neko. Cat. Luna approves.',
    chars: [
      { char: 'な', romaji: 'na', mnemonic: 'A nail hammered into a board, with a knot in the wood.' },
      { char: 'に', romaji: 'ni', mnemonic: 'A needle on the left, and the thread it pulls behind it.' },
      { char: 'ぬ', romaji: 'nu', mnemonic: 'Noodles being twirled up onto a fork.' },
      { char: 'ね', romaji: 'ne', mnemonic: 'A cat with its tail curled up — and neko means cat.' },
      { char: 'の', romaji: 'no', mnemonic: 'A big swirl, like the NO sign with a line through it.' },
    ],
  },
  {
    code: 'kanji_garden',
    title: 'Your Own Garden, in Kanji',
    subtitle: '竹 桜 菊 藤 苔',
    kind: 'kanji',
    intro: 'These five characters are already printed on your plant cards. You grew every one of them.',
    outro: 'Three of these wear the grass hat ⺾ — 菊, 藤 and 苔. Once you notice it, you spot plants everywhere.',
    chars: [
      { char: '竹', romaji: 'take', meaning: 'bamboo', mnemonic: 'Two bamboo stems side by side, with leaves drooping down.' },
      { char: '桜', romaji: 'sakura', meaning: 'cherry blossom', mnemonic: 'The left half, 木, means tree — so you know it grows.' },
      { char: '菊', romaji: 'kiku', meaning: 'chrysanthemum', mnemonic: 'A grass hat ⺾ on top, and a handful of grain gathered underneath.' },
      { char: '藤', romaji: 'fuji', meaning: 'wisteria', mnemonic: 'Another grass hat. You will meet this one in family names too.' },
      { char: '苔', romaji: 'koke', meaning: 'moss', mnemonic: 'Grass hat again — the mark of a small growing thing.' },
    ],
  },
  {
    code: 'kanji_numbers',
    title: 'Counting Stones',
    subtitle: '一 二 三 四 五',
    kind: 'kanji',
    intro: 'The first three are the easiest kanji there are. Just count the lines.',
    outro: 'One, two, three are literally one, two, three strokes. Four and five got fancy later on.',
    chars: [
      { char: '一', romaji: 'ichi', meaning: 'one', mnemonic: 'One single line. That is the whole character.' },
      { char: '二', romaji: 'ni', meaning: 'two', mnemonic: 'Two lines stacked up.' },
      { char: '三', romaji: 'san', meaning: 'three', mnemonic: 'Three lines. You can see where this is going.' },
      { char: '四', romaji: 'shi', meaning: 'four', mnemonic: 'A box with legs inside — four stopped being lines because too many lines get confusing.' },
      { char: '五', romaji: 'go', meaning: 'five', mnemonic: 'A shape like a spool of thread between two lines.' },
    ],
  },
  {
    code: 'kanji_nature',
    title: 'Out in the World',
    subtitle: '木 花 山 川 日',
    kind: 'kanji',
    intro: 'Five characters that are small pictures of the thing they mean. Squint a little.',
    outro: 'Look at 木 and 桜 together — the tree is hiding inside the cherry blossom.',
    chars: [
      { char: '木', romaji: 'ki', meaning: 'tree', mnemonic: 'A trunk with branches going up and roots going down.' },
      { char: '花', romaji: 'hana', meaning: 'flower', mnemonic: 'The grass hat again, over a person bending to look.' },
      { char: '山', romaji: 'yama', meaning: 'mountain', mnemonic: 'Three peaks — a tall one in the middle, two smaller either side.' },
      { char: '川', romaji: 'kawa', meaning: 'river', mnemonic: 'Three lines of water running downstream.' },
      { char: '日', romaji: 'hi', meaning: 'sun, day', mnemonic: 'The sun drawn as a box with a line — it used to be a circle with a dot.' },
    ],
  },
];

export function getUnit(code: string): JapaneseUnit | undefined {
  return JAPANESE_UNITS.find(u => u.code === code);
}

/**
 * Units unlock in order: the first is always open, and each later one
 * opens when the unit before it is finished. Keeps a five-year-old
 * from face-planting into kanji on day one.
 */
export function isUnitUnlocked(code: string, completed: string[]): boolean {
  const idx = JAPANESE_UNITS.findIndex(u => u.code === code);
  if (idx <= 0) return idx === 0;
  return completed.includes(JAPANESE_UNITS[idx - 1].code);
}

export function nextUnit(completed: string[]): JapaneseUnit | undefined {
  return JAPANESE_UNITS.find(u => !completed.includes(u.code));
}

/**
 * The writing table appears only when the bed is open AND something is
 * growing in it — the child's own plants are the curriculum's first
 * vocabulary, so the lesson should not arrive before they do.
 */
export function isSchoolOpen(
  japaneseQuadrantOpen: boolean,
  japanesePlantsGrowing: number,
): boolean {
  return japaneseQuadrantOpen && japanesePlantsGrowing > 0;
}

// ─── DRILL ──────────────────────────────────────────────────────────────

export interface DrillQuestion {
  /** 'read' shows the character; 'write' shows the sound or meaning. */
  kind: 'read' | 'write';
  prompt: string;
  /** What the child is choosing between — characters or romaji. */
  choices: string[];
  correctIndex: number;
  /** Shown after answering, so a wrong tap still teaches. */
  hint: string;
}

/** Tiny deterministic PRNG so a unit drills the same way on retry. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Two questions per character: recognise the shape, then recall it.
 * Distractors come from the same unit, so the choices are genuinely
 * confusable and the child has to look properly.
 */
export function buildDrill(unit: JapaneseUnit, seed = 1): DrillQuestion[] {
  const rand = rng(seed);
  const questions: DrillQuestion[] = [];

  for (const c of unit.chars) {
    const others = unit.chars.filter(o => o.char !== c.char);
    const label = (x: JapaneseChar) =>
      unit.kind === 'kanji' ? `${x.romaji} — ${x.meaning}` : x.romaji;

    // READ: here is the character, which sound/word is it?
    const readWrong = shuffle(others, rand).slice(0, 3).map(label);
    const readChoices = shuffle([label(c), ...readWrong], rand);
    questions.push({
      kind: 'read',
      prompt: c.char,
      choices: readChoices,
      correctIndex: readChoices.indexOf(label(c)),
      hint: c.mnemonic,
    });

    // WRITE: here is the sound/meaning, which character is it?
    const writeWrong = shuffle(others, rand).slice(0, 3).map(o => o.char);
    const writeChoices = shuffle([c.char, ...writeWrong], rand);
    questions.push({
      kind: 'write',
      prompt: unit.kind === 'kanji'
        ? `Which one means “${c.meaning}”?`
        : `Which one says “${c.romaji}”?`,
      choices: writeChoices,
      correctIndex: writeChoices.indexOf(c.char),
      hint: c.mnemonic,
    });
  }

  return shuffle(questions, rand);
}
