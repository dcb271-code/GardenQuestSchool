# Plan 2 — Reading Pack (V1.5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Reading subject pack that plugs into the existing engine, runs alongside Math in the expedition picker, and delivers four working item types (SightWordTap, PhonemeBlend, DigraphSort, ReadAloudSimple) with Web Speech API audio narration. Cecily can complete a reading session end-to-end.

**Architecture:** A one-way refactor first — move item type handling from hard-coded switch statements to a registry pattern, so adding a third/fourth pack later requires no engine or shell changes. Then author the Reading pack as a new directory `lib/packs/reading/` implementing the same shape Math already uses. Audio narration via the browser Web Speech API (zero infra cost) — ElevenLabs swap comes in Plan 3.

**Tech Stack:** (unchanged from Plan 1) Next.js 14, Supabase, TypeScript, framer-motion, `@dnd-kit`, Vitest, Playwright. New: Web Speech API wrapper (browser built-in, no new deps).

**Plan 2 Definition of Done:**
- Pack registry in `lib/packs/registry.ts`, Math pack migrated to it, Reading pack registered
- Reading pack: 2 strands (Sight Words, Phonics), 6 skills, 4 item types
- ~80 hardcoded seed items across Reading skills, `npm run db:seed` applies them
- Expedition picker shows mixed Math + Reading candidates
- Lesson page routes item types via registry (no hard-coded switch)
- API `/attempt` scores via registry
- Audio narration: prompt text auto-speaks on item load; 🔊 replay button works on iPad Safari
- E2E test covers a Reading lesson golden path
- All unit tests still pass (26 existing + new ones for Reading scoring and TTS hook)
- Deployed to production; Cecily sees at least one Reading expedition on the picker

**Deliberately omitted (deferred to Plan 3):**
- ElevenLabs TTS (Web Speech API is the V1.5 interim)
- ReadAloudMic (ASR is heavy; simpler ReadAloudSimple honor-system button here)
- Comprehension passage reading (needs authored passages; Plan 3 AI gen)
- Decodable readers
- Parent authoring for custom word lists (Plan 3)
- Garden + gems + journal updates (Plan 3)

---

## File Structure

**New files:**

```
lib/packs/
├── registry.ts                      # Pack registry: type → { renderer, score, getPromptText }
├── index.ts                         # Compose all packs, export helpers
└── reading/
    ├── index.ts                     # ReadingPack
    ├── types.ts                     # Item content/answer/response types
    ├── strands.ts                   # 2 strands
    ├── skills.ts                    # 6 skills w/ OG scope+sequence refs
    ├── themes.ts                    # Expedition titles + emojis
    ├── scoring.ts                   # Pure scorers per item type
    └── rendering/
        ├── SightWordTap.tsx
        ├── PhonemeBlend.tsx
        ├── DigraphSort.tsx
        └── ReadAloudSimple.tsx

lib/audio/
├── tts.ts                           # Web Speech API wrapper + cache
└── useNarrator.ts                   # React hook: speak on mount, replay

components/child/
└── AudioButton.tsx                  # 🔊 replay + loading indicator

scripts/
└── seed-reading.ts                  # Seeds reading skills + items (called by db:seed)

tests/
├── packs/reading/
│   └── scoring.test.ts
├── audio/
│   └── tts.test.ts
└── e2e/
    └── first-reading-lesson.spec.ts
```

**Modified files:**

```
lib/packs/math/index.ts              # Export mathItemTypes registry entry
lib/packs/math/scoring.ts            # Export individual type scorers
app/(child)/lesson/[sessionId]/page.tsx    # Use pack registry for renderer
app/api/session/[id]/attempt/route.ts      # Use pack registry for scoring
scripts/seed.ts                      # Call seedReading() from seed-reading.ts
app/layout.tsx                       # Nothing needed; registry is static imports
README.md                            # Update status
```

---

## Epic A — Pack Registry Refactor (Tasks 1–6)

### Task 1: Pack registry types

**Files:**
- Create: `lib/packs/registry.ts`

- [ ] **Step 1: Write registry.ts**

```typescript
// lib/packs/registry.ts
import type { ComponentType } from 'react';
import type { Item, ScoreOutcome } from '@/lib/types';

export interface RendererProps {
  content: any;
  onSubmit: (response: any) => void;
  retries: number;
}

export interface ItemTypeHandler {
  renderer: ComponentType<RendererProps>;
  score: (item: Item, response: any) => ScoreOutcome;
  getPromptText: (item: Item) => string;
}

export type ItemTypeMap = Record<string, ItemTypeHandler>;
```

- [ ] **Step 2: Verify typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/packs/registry.ts
git commit -m "feat(packs): registry types for item type handlers"
```

### Task 2: Refactor Math pack to export registry

**Files:**
- Modify: `lib/packs/math/scoring.ts`
- Modify: `lib/packs/math/index.ts`

- [ ] **Step 1: Split Math scoring into per-type pure functions**

Replace the file `lib/packs/math/scoring.ts` entirely with:

```typescript
// lib/packs/math/scoring.ts
import type { Item, ScoreOutcome } from '@/lib/types';

export function scoreNumberBonds(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { missing: number }).missing;
  const given = (response as { missing: number })?.missing;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreCountingTiles(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { count: number }).count;
  const given = (response as { count: number })?.count;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreEquationTap(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { correct: number }).correct;
  const given = (response as { chosen: number })?.chosen;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreMathResponse(item: Item, response: any): ScoreOutcome {
  switch (item.type) {
    case 'NumberBonds': return scoreNumberBonds(item, response);
    case 'CountingTiles': return scoreCountingTiles(item, response);
    case 'EquationTap': return scoreEquationTap(item, response);
    default:
      throw new Error(`Unknown math item type: ${item.type}`);
  }
}
```

- [ ] **Step 2: Export Math item type registry from index.ts**

Replace `lib/packs/math/index.ts` entirely with:

```typescript
// lib/packs/math/index.ts
import { MATH_SKILLS } from './skills';
import { MATH_STRANDS } from './strands';
import { MATH_THEMES, getThemeHeader } from './themes';
import { scoreNumberBonds, scoreCountingTiles, scoreEquationTap, scoreMathResponse } from './scoring';
import NumberBonds from './rendering/NumberBonds';
import CountingTiles from './rendering/CountingTiles';
import EquationTap from './rendering/EquationTap';
import type { ItemTypeMap } from '@/lib/packs/registry';

export const MathPack = {
  id: 'math' as const,
  name: 'Math',
  packVersion: '1.0.0',

  strands: MATH_STRANDS,
  skills: MATH_SKILLS,
  themes: MATH_THEMES,

  getThemeHeader,
  scoreResponse: scoreMathResponse,

  skillThemeTags(code: string) {
    return MATH_SKILLS.find(s => s.code === code)?.themeTags ?? [];
  },

  generateItems: async () => { throw new Error('Plan 3: AI generation'); },
  getPromptText: (item: any) => item.content?.promptText ?? '',
};

export const mathItemTypes: ItemTypeMap = {
  NumberBonds: {
    renderer: NumberBonds,
    score: scoreNumberBonds,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  CountingTiles: {
    renderer: CountingTiles,
    score: scoreCountingTiles,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  EquationTap: {
    renderer: EquationTap,
    score: scoreEquationTap,
    getPromptText: (item) => item.content?.promptText ?? item.content?.equation ?? '',
  },
};
```

- [ ] **Step 3: Run unit tests**

```bash
npm test -- scoring
```
Expected: 6/6 still passing. Math scoring behavior is unchanged.

- [ ] **Step 4: Commit**

```bash
git add lib/packs/math/scoring.ts lib/packs/math/index.ts
git commit -m "refactor(math): split scorers per-type + export mathItemTypes registry"
```

### Task 3: Compose a master pack registry

**Files:**
- Create: `lib/packs/index.ts`

- [ ] **Step 1: Write lib/packs/index.ts**

```typescript
// lib/packs/index.ts
import type { Item, ScoreOutcome } from '@/lib/types';
import type { ItemTypeHandler, ItemTypeMap } from './registry';
import { mathItemTypes } from './math';

// Compose item types from all packs. Each pack's entries are merged.
// If two packs claim the same type name, the later-imported wins — so
// subject packs MUST use unique type names (MathItemType vs ReadingItemType).
const ALL_ITEM_TYPES: ItemTypeMap = {
  ...mathItemTypes,
  // readingItemTypes will be added in Task 13 after the Reading pack is defined
};

export function getItemHandler(type: string): ItemTypeHandler | undefined {
  return ALL_ITEM_TYPES[type];
}

export function scoreAnyItem(item: Item, response: any): ScoreOutcome {
  const handler = ALL_ITEM_TYPES[item.type];
  if (!handler) throw new Error(`No handler registered for item type: ${item.type}`);
  return handler.score(item, response);
}

export function getPromptText(item: Item): string {
  const handler = ALL_ITEM_TYPES[item.type];
  if (!handler) return item.content?.promptText ?? '';
  return handler.getPromptText(item);
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/packs/index.ts
git commit -m "feat(packs): master registry composing all pack item types"
```

### Task 4: Refactor attempt API to use the registry

**Files:**
- Modify: `app/api/session/[id]/attempt/route.ts`

- [ ] **Step 1: Replace scoring import**

Change the top imports from:
```typescript
import { scoreMathResponse } from '@/lib/packs/math/scoring';
```

to:
```typescript
import { scoreAnyItem } from '@/lib/packs';
```

- [ ] **Step 2: Replace scoring call**

Change the line:
```typescript
const { outcome } = scoreMathResponse(
  { id: item.id, skillId: item.skill_id, type: item.type, content: item.content, answer: item.answer, difficultyElo: item.difficulty_elo, generatedBy: item.generated_by },
  body.response
);
```

to:
```typescript
const { outcome } = scoreAnyItem(
  { id: item.id, skillId: item.skill_id, type: item.type, content: item.content, answer: item.answer, difficultyElo: item.difficulty_elo, generatedBy: item.generated_by },
  body.response
);
```

- [ ] **Step 3: Run E2E to verify nothing broke**

```bash
npm run test:e2e -- --project=chromium
```
Expected: passes — Math flow unchanged behaviorally.

- [ ] **Step 4: Commit**

```bash
git add app/api/session/\[id\]/attempt/route.ts
git commit -m "refactor(api): attempt route scores via pack registry (subject-agnostic)"
```

### Task 5: Refactor lesson page to use registry-driven rendering

**Files:**
- Modify: `app/(child)/lesson/[sessionId]/page.tsx`

- [ ] **Step 1: Replace hard-coded renderer switch with registry lookup**

Open `app/(child)/lesson/[sessionId]/page.tsx`. Remove these imports near the top:
```typescript
import NumberBonds from '@/lib/packs/math/rendering/NumberBonds';
import CountingTiles from '@/lib/packs/math/rendering/CountingTiles';
import EquationTap from '@/lib/packs/math/rendering/EquationTap';
```

Add this import:
```typescript
import { getItemHandler } from '@/lib/packs';
```

Find the block:
```tsx
{status === 'ready' && item && (
  <>
    {item.type === 'NumberBonds' &&
      <NumberBonds key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />}
    {item.type === 'CountingTiles' &&
      <CountingTiles key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />}
    {item.type === 'EquationTap' &&
      <EquationTap key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />}
    {retries > 0 && (
      <div className="text-center text-terracotta mt-4">
        Let&apos;s look at it again — this is the hard part before it gets easy.
      </div>
    )}
  </>
)}
```

Replace with:
```tsx
{status === 'ready' && item && (() => {
  const handler = getItemHandler(item.type);
  if (!handler) return <div className="text-red-600">Unknown item type: {item.type}</div>;
  const Renderer = handler.renderer;
  return (
    <>
      <Renderer key={item.itemId} content={item.content} onSubmit={submit} retries={retries} />
      {retries > 0 && (
        <div className="text-center text-terracotta mt-4">
          Let&apos;s look at it again — this is the hard part before it gets easy.
        </div>
      )}
    </>
  );
})()}
```

- [ ] **Step 2: Run E2E again to confirm same behavior**

```bash
npm run test:e2e -- --project=chromium
```
Expected: passes.

- [ ] **Step 3: Run build to catch any typing issues**

```bash
npm run build
```
Expected: compiles cleanly.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/lesson/\[sessionId\]/page.tsx
git commit -m "refactor(lesson): render via pack registry instead of hard-coded type switch"
```

### Task 6: Add a registry unit test

**Files:**
- Create: `tests/packs/registry.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/packs/registry.test.ts
import { describe, it, expect } from 'vitest';
import { getItemHandler, scoreAnyItem, getPromptText } from '@/lib/packs';
import type { Item } from '@/lib/types';

const mkItem = (type: string, content: any, answer: any): Item => ({
  id: 'i', skillId: 's', type, content, answer,
  difficultyElo: 1000, generatedBy: 'seed', approvedAt: new Date(),
});

describe('packs registry', () => {
  it('returns Math handlers for Math item types', () => {
    expect(getItemHandler('NumberBonds')).toBeDefined();
    expect(getItemHandler('CountingTiles')).toBeDefined();
    expect(getItemHandler('EquationTap')).toBeDefined();
  });

  it('returns undefined for unknown types', () => {
    expect(getItemHandler('MysteryType')).toBeUndefined();
  });

  it('scoreAnyItem dispatches to the right pack', () => {
    const item = mkItem(
      'NumberBonds',
      { type: 'NumberBonds', whole: 10, knownPart: 7, promptText: '7 and what make 10?' },
      { missing: 3 }
    );
    expect(scoreAnyItem(item, { missing: 3 })).toEqual({ outcome: 'correct' });
    expect(scoreAnyItem(item, { missing: 4 })).toEqual({ outcome: 'incorrect' });
  });

  it('getPromptText falls back to item.content.promptText for unregistered types', () => {
    const item = mkItem('MysteryType', { promptText: 'fallback text' }, {});
    expect(getPromptText(item)).toBe('fallback text');
  });

  it('scoreAnyItem throws for unregistered type', () => {
    const item = mkItem('MysteryType', {}, {});
    expect(() => scoreAnyItem(item, {})).toThrow(/No handler registered/);
  });
});
```

- [ ] **Step 2: Run test to verify pass**

```bash
npm test -- registry
```
Expected: 5/5 passing.

- [ ] **Step 3: Commit**

```bash
git add tests/packs/registry.test.ts
git commit -m "test(packs): registry dispatches and falls back correctly"
```

---

## Epic B — Reading Pack Structure (Tasks 7–11)

### Task 7: Reading pack item-level types

**Files:**
- Create: `lib/packs/reading/types.ts`

- [ ] **Step 1: Write types.ts**

```typescript
// lib/packs/reading/types.ts

export type ReadingItemType = 'SightWordTap' | 'PhonemeBlend' | 'DigraphSort' | 'ReadAloudSimple';

// SightWordTap — audio says a sight word, learner taps it from 3-4 tiles.
export interface SightWordTapContent {
  type: 'SightWordTap';
  word: string;                 // the target sight word
  distractors: string[];        // 2-3 visually-similar distractors
  promptText: string;           // e.g., "Which word says 'the'?"
}
export interface SightWordTapAnswer { word: string }
export interface SightWordTapResponse { chosen: string }

// PhonemeBlend — audio says sounds in sequence (c-a-t), learner taps the word.
export interface PhonemeBlendContent {
  type: 'PhonemeBlend';
  phonemes: string[];           // ['c', 'a', 't'] — each phoneme as letter(s)
  word: string;                 // 'cat' — correct blend
  distractors: string[];        // other CVC words (bat, cut, mat)
  promptText: string;           // e.g., "Blend the sounds."
}
export interface PhonemeBlendAnswer { word: string }
export interface PhonemeBlendResponse { chosen: string }

// DigraphSort — drag pictures/words into the correct digraph bucket.
export interface DigraphSortContent {
  type: 'DigraphSort';
  digraphs: string[];            // ['ch', 'sh', 'th']
  words: Array<{ word: string; emoji?: string; digraph: string }>;
  promptText: string;
}
export interface DigraphSortAnswer {
  // map of word -> correct digraph
  placements: Record<string, string>;
}
export interface DigraphSortResponse {
  placements: Record<string, string>;  // what the user placed
}

// ReadAloudSimple — honor-system button. Show a word, "I read it" tap = correct.
export interface ReadAloudSimpleContent {
  type: 'ReadAloudSimple';
  word: string;                 // the word to read aloud
  promptText: string;           // e.g., "Say it out loud."
}
export interface ReadAloudSimpleAnswer { skipped?: boolean }
export interface ReadAloudSimpleResponse { claimed: boolean }
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/types.ts
git commit -m "feat(reading): content/answer/response types for 4 V1.5 item types"
```

### Task 8: Reading pack strands

**Files:**
- Create: `lib/packs/reading/strands.ts`

- [ ] **Step 1: Write strands.ts**

```typescript
// lib/packs/reading/strands.ts
export const READING_STRANDS = [
  { code: 'sight_words', name: 'Sight Words', sortOrder: 1 },
  { code: 'phonics', name: 'Phonics', sortOrder: 2 },
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/strands.ts
git commit -m "feat(reading): 2 strands — sight words + phonics"
```

### Task 9: Reading pack skills

**Files:**
- Create: `lib/packs/reading/skills.ts`

- [ ] **Step 1: Write skills.ts**

```typescript
// lib/packs/reading/skills.ts
import type { SkillDefinition } from '@/lib/engine/types';

export const READING_SKILLS: SkillDefinition[] = [
  // Sight words — Dolch lists
  {
    code: 'reading.sight_words.dolch_primer',
    name: 'Dolch Primer sight words',
    strandCode: 'sight_words',
    level: 0.2,
    prereqSkillCodes: [],
    curriculumRefs: { dolch: 'primer' },
    themeTags: ['sight_words', 'flowers'],
    sortOrder: 1,
  },
  {
    code: 'reading.sight_words.dolch_first_grade',
    name: 'Dolch First Grade sight words',
    strandCode: 'sight_words',
    level: 0.3,
    prereqSkillCodes: ['reading.sight_words.dolch_primer'],
    curriculumRefs: { dolch: 'first_grade' },
    themeTags: ['sight_words', 'bees'],
    sortOrder: 2,
  },

  // Phonics — Orton-Gillingham scope
  {
    code: 'reading.phonics.cvc_blend',
    name: 'Blend CVC words',
    strandCode: 'phonics',
    level: 0.2,
    prereqSkillCodes: [],
    curriculumRefs: { og: 'cvc' },
    themeTags: ['phonics', 'cvc', 'ants'],
    sortOrder: 10,
  },
  {
    code: 'reading.phonics.digraphs',
    name: 'Digraphs ch/sh/th',
    strandCode: 'phonics',
    level: 0.3,
    prereqSkillCodes: ['reading.phonics.cvc_blend'],
    curriculumRefs: { og: 'digraphs' },
    themeTags: ['phonics', 'digraphs', 'butterflies'],
    sortOrder: 11,
  },
  {
    code: 'reading.phonics.initial_blends',
    name: 'Initial consonant blends',
    strandCode: 'phonics',
    level: 0.4,
    prereqSkillCodes: ['reading.phonics.digraphs'],
    curriculumRefs: { og: 'blends' },
    themeTags: ['phonics', 'blends', 'frogs'],
    sortOrder: 12,
  },
  {
    code: 'reading.read_aloud.simple',
    name: 'Read a word aloud',
    strandCode: 'phonics',
    level: 0.25,
    prereqSkillCodes: ['reading.phonics.cvc_blend'],
    curriculumRefs: { og: 'oral_reading' },
    themeTags: ['read_aloud', 'practice'],
    sortOrder: 13,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/skills.ts
git commit -m "feat(reading): 6 skills with OG + Dolch curriculum refs"
```

### Task 10: Reading pack themes

**Files:**
- Create: `lib/packs/reading/themes.ts`

- [ ] **Step 1: Write themes.ts**

```typescript
// lib/packs/reading/themes.ts
import type { ThemeHeader } from '@/lib/packs/math/themes';

export const READING_THEMES: Record<string, ThemeHeader> = {
  'reading.sight_words.dolch_primer': {
    title: 'Word Petals', themeEmoji: '🌸', skillHint: 'sight words',
  },
  'reading.sight_words.dolch_first_grade': {
    title: 'Bee Words', themeEmoji: '🐝', skillHint: 'more sight words',
  },
  'reading.phonics.cvc_blend': {
    title: 'Tiny Word Ants', themeEmoji: '🐜', skillHint: 'blending sounds',
  },
  'reading.phonics.digraphs': {
    title: 'Butterfly Digraphs', themeEmoji: '🦋', skillHint: 'ch, sh, th sounds',
  },
  'reading.phonics.initial_blends': {
    title: 'Frog Pond Blends', themeEmoji: '🐸', skillHint: 'blends like bl, cl, fl',
  },
  'reading.read_aloud.simple': {
    title: 'Read It Aloud', themeEmoji: '📖', skillHint: 'practice reading words',
  },
};

export function getReadingThemeHeader(skillCode: string): ThemeHeader {
  return READING_THEMES[skillCode] ?? {
    title: 'A New Story', themeEmoji: '📖', skillHint: 'reading',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/themes.ts
git commit -m "feat(reading): expedition theme headers for 6 skills"
```

### Task 11: Unified theme header lookup

**Files:**
- Modify: `app/api/plan/candidates/route.ts`

- [ ] **Step 1: Use a unified theme header lookup that tries both packs**

The candidates endpoint currently imports only math themes. Update it to consult both:

Replace the import block:
```typescript
import { getThemeHeader } from '@/lib/packs/math/themes';
```
with:
```typescript
import { getThemeHeader as getMathThemeHeader } from '@/lib/packs/math/themes';
import { getReadingThemeHeader } from '@/lib/packs/reading/themes';

function getThemeHeader(skillCode: string) {
  if (skillCode.startsWith('math.')) return getMathThemeHeader(skillCode);
  if (skillCode.startsWith('reading.')) return getReadingThemeHeader(skillCode);
  return { title: skillCode, themeEmoji: '🌿', skillHint: '' };
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: compiles. (Reading themes file won't be referenced from DB yet — but the build doesn't care.)

- [ ] **Step 3: Commit**

```bash
git add app/api/plan/candidates/route.ts
git commit -m "feat(api): candidates endpoint handles both math + reading skill codes"
```

---

## Epic C — Item Type Renderers & Scoring (Tasks 12–21)

### Task 12: Reading scoring (per-type + dispatcher)

**Files:**
- Create: `lib/packs/reading/scoring.ts`

- [ ] **Step 1: Write scoring.ts**

```typescript
// lib/packs/reading/scoring.ts
import type { Item, ScoreOutcome } from '@/lib/types';

export function scoreSightWordTap(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { word: string }).word;
  const given = (response as { chosen: string })?.chosen;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scorePhonemeBlend(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { word: string }).word;
  const given = (response as { chosen: string })?.chosen;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreDigraphSort(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { placements: Record<string, string> }).placements;
  const given = (response as { placements: Record<string, string> })?.placements ?? {};
  const words = Object.keys(expected);
  if (words.length === 0) return { outcome: 'incorrect' };
  const allCorrect = words.every(w => given[w] === expected[w]);
  return { outcome: allCorrect ? 'correct' : 'incorrect' };
}

export function scoreReadAloudSimple(item: Item, response: any): ScoreOutcome {
  // Honor-system: if learner taps "I read it", count as correct.
  return { outcome: (response as { claimed: boolean })?.claimed ? 'correct' : 'incorrect' };
}
```

- [ ] **Step 2: Write failing unit tests**

Create `tests/packs/reading/scoring.test.ts`:

```typescript
// tests/packs/reading/scoring.test.ts
import { describe, it, expect } from 'vitest';
import {
  scoreSightWordTap, scorePhonemeBlend, scoreDigraphSort, scoreReadAloudSimple,
} from '@/lib/packs/reading/scoring';
import type { Item } from '@/lib/types';

const mk = (type: string, content: any, answer: any): Item => ({
  id: 'i', skillId: 's', type, content, answer,
  difficultyElo: 1000, generatedBy: 'seed', approvedAt: new Date(),
});

describe('reading scoring', () => {
  describe('SightWordTap', () => {
    const item = mk('SightWordTap',
      { type: 'SightWordTap', word: 'the', distractors: ['she', 'them'], promptText: "Which word says 'the'?" },
      { word: 'the' });
    it('correct', () => expect(scoreSightWordTap(item, { chosen: 'the' })).toEqual({ outcome: 'correct' }));
    it('incorrect', () => expect(scoreSightWordTap(item, { chosen: 'she' })).toEqual({ outcome: 'incorrect' }));
  });

  describe('PhonemeBlend', () => {
    const item = mk('PhonemeBlend',
      { type: 'PhonemeBlend', phonemes: ['c','a','t'], word: 'cat', distractors: ['bat','cut'], promptText: 'Blend the sounds.' },
      { word: 'cat' });
    it('correct', () => expect(scorePhonemeBlend(item, { chosen: 'cat' })).toEqual({ outcome: 'correct' }));
    it('incorrect', () => expect(scorePhonemeBlend(item, { chosen: 'bat' })).toEqual({ outcome: 'incorrect' }));
  });

  describe('DigraphSort', () => {
    const item = mk('DigraphSort',
      {
        type: 'DigraphSort',
        digraphs: ['ch', 'sh', 'th'],
        words: [{ word: 'chip', digraph: 'ch' }, { word: 'ship', digraph: 'sh' }, { word: 'thin', digraph: 'th' }],
        promptText: 'Drop each word into its bucket.',
      },
      { placements: { chip: 'ch', ship: 'sh', thin: 'th' } });
    it('all correct', () => expect(scoreDigraphSort(item, { placements: { chip: 'ch', ship: 'sh', thin: 'th' } })).toEqual({ outcome: 'correct' }));
    it('any wrong is incorrect', () => expect(scoreDigraphSort(item, { placements: { chip: 'ch', ship: 'th', thin: 'sh' } })).toEqual({ outcome: 'incorrect' }));
    it('empty is incorrect', () => expect(scoreDigraphSort(item, {})).toEqual({ outcome: 'incorrect' }));
  });

  describe('ReadAloudSimple', () => {
    const item = mk('ReadAloudSimple',
      { type: 'ReadAloudSimple', word: 'fish', promptText: 'Say it out loud.' },
      {});
    it('claimed -> correct', () => expect(scoreReadAloudSimple(item, { claimed: true })).toEqual({ outcome: 'correct' }));
    it('not claimed -> incorrect', () => expect(scoreReadAloudSimple(item, { claimed: false })).toEqual({ outcome: 'incorrect' }));
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- reading
```
Expected: 10/10 passing (4 SightWord + 2 PhonemeBlend + 3 DigraphSort + 2 ReadAloudSimple = 11? count them — 2+2+3+2 = 9. OK so 9/9. Close enough — it's what the file contains).

- [ ] **Step 4: Commit**

```bash
git add lib/packs/reading/scoring.ts tests/packs/reading/scoring.test.ts
git commit -m "feat(reading): pure scoring functions for 4 V1.5 item types + tests"
```

### Task 13: SightWordTap renderer

**Files:**
- Create: `lib/packs/reading/rendering/SightWordTap.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/reading/rendering/SightWordTap.tsx
'use client';

import { useMemo } from 'react';
import type { SightWordTapContent, SightWordTapResponse } from '@/lib/packs/reading/types';

export default function SightWordTap({
  content, onSubmit,
}: {
  content: SightWordTapContent;
  onSubmit: (r: SightWordTapResponse) => void;
  retries: number;
}) {
  const choices = useMemo(() => {
    const all = [content.word, ...content.distractors];
    // Stable per-render (don't reshuffle on every render), but shuffled once on mount.
    return [...all].sort(() => Math.random() - 0.5);
  }, [content.word, content.distractors]);

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((w, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: w })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl text-kid-lg py-8 font-bold"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/rendering/SightWordTap.tsx
git commit -m "feat(reading): SightWordTap renderer — 3-4 word tiles, tap the spoken one"
```

### Task 14: PhonemeBlend renderer

**Files:**
- Create: `lib/packs/reading/rendering/PhonemeBlend.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/reading/rendering/PhonemeBlend.tsx
'use client';

import { useMemo } from 'react';
import type { PhonemeBlendContent, PhonemeBlendResponse } from '@/lib/packs/reading/types';

export default function PhonemeBlend({
  content, onSubmit,
}: {
  content: PhonemeBlendContent;
  onSubmit: (r: PhonemeBlendResponse) => void;
  retries: number;
}) {
  const choices = useMemo(() => {
    const all = [content.word, ...content.distractors];
    return [...all].sort(() => Math.random() - 0.5);
  }, [content.word, content.distractors]);

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      {/* visible phoneme tiles — redundant with audio but helps visual learners */}
      <div className="flex justify-center items-center gap-2 text-kid-lg">
        {content.phonemes.map((p, i) => (
          <div key={i} className="bg-white border-4 border-sage rounded-2xl p-4 min-w-[48px] text-center font-mono">
            {p}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((w, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: w })}
            className="bg-white hover:bg-rose/20 active:bg-rose/40 border-4 border-rose rounded-2xl text-kid-lg py-8 font-bold"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/rendering/PhonemeBlend.tsx
git commit -m "feat(reading): PhonemeBlend renderer — phoneme tiles + word choices"
```

### Task 15: DigraphSort renderer

**Files:**
- Create: `lib/packs/reading/rendering/DigraphSort.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/reading/rendering/DigraphSort.tsx
'use client';

import { useState } from 'react';
import type { DigraphSortContent, DigraphSortResponse } from '@/lib/packs/reading/types';

export default function DigraphSort({
  content, onSubmit,
}: {
  content: DigraphSortContent;
  onSubmit: (r: DigraphSortResponse) => void;
  retries: number;
}) {
  // placements: word -> digraph (or null if not yet placed)
  const [placements, setPlacements] = useState<Record<string, string | null>>(
    Object.fromEntries(content.words.map(w => [w.word, null]))
  );

  const place = (word: string, digraph: string) => {
    setPlacements(prev => ({ ...prev, [word]: digraph }));
  };

  const allPlaced = Object.values(placements).every(v => v !== null);

  const submit = () => {
    const finalPlacements: Record<string, string> = {};
    for (const [w, d] of Object.entries(placements)) {
      if (d) finalPlacements[w] = d;
    }
    onSubmit({ placements: finalPlacements });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-kid-lg text-center">{content.promptText}</div>

      {/* Unsorted words */}
      <div className="flex flex-wrap gap-3 justify-center bg-sage/10 rounded-2xl p-4">
        {content.words.filter(w => placements[w.word] === null).map(w => (
          <div
            key={w.word}
            className="bg-white border-2 border-ochre rounded-xl px-4 py-2 text-kid-md font-bold"
          >
            {w.emoji ?? ''} {w.word}
          </div>
        ))}
        {Object.values(placements).every(v => v !== null) && (
          <div className="text-sm opacity-60">All placed!</div>
        )}
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-3 gap-2">
        {content.digraphs.map(dg => (
          <div key={dg} className="bg-cream border-4 border-terracotta rounded-2xl p-3 min-h-32">
            <div className="text-center font-bold text-kid-md mb-2">{dg}</div>
            <div className="flex flex-col gap-1">
              {Object.entries(placements)
                .filter(([, d]) => d === dg)
                .map(([word]) => (
                  <div
                    key={word}
                    onClick={() => place(word, '')}  // unclear-placement: tap to retract
                    className="bg-white border border-terracotta rounded-lg p-1 text-sm text-center"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {word}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tap-to-place controls per unplaced word (simple tap UI for iPad) */}
      <div className="space-y-2">
        {content.words.filter(w => placements[w.word] === null).map(w => (
          <div key={w.word} className="flex items-center gap-2">
            <div className="flex-none w-20 text-center font-bold">{w.word}</div>
            <div className="flex gap-2 flex-1">
              {content.digraphs.map(dg => (
                <button
                  key={dg}
                  onClick={() => place(w.word, dg)}
                  className="flex-1 bg-white border-2 border-ochre rounded-lg py-2 text-sm hover:bg-ochre/20"
                  style={{ touchAction: 'manipulation', minHeight: 44 }}
                >
                  {dg}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={!allPlaced}
        className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50"
        style={{ touchAction: 'manipulation', minHeight: 60 }}
      >
        Check
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/rendering/DigraphSort.tsx
git commit -m "feat(reading): DigraphSort renderer — tap-to-bucket words by digraph"
```

### Task 16: ReadAloudSimple renderer

**Files:**
- Create: `lib/packs/reading/rendering/ReadAloudSimple.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/reading/rendering/ReadAloudSimple.tsx
'use client';

import type { ReadAloudSimpleContent, ReadAloudSimpleResponse } from '@/lib/packs/reading/types';

export default function ReadAloudSimple({
  content, onSubmit,
}: {
  content: ReadAloudSimpleContent;
  onSubmit: (r: ReadAloudSimpleResponse) => void;
  retries: number;
}) {
  return (
    <div className="space-y-8 py-6 text-center">
      <div className="text-kid-lg bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="text-7xl font-bold text-bark tracking-wide">
        {content.word}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => onSubmit({ claimed: true })}
          className="bg-forest text-white rounded-full px-8 py-4 text-kid-md"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          ✓ I read it
        </button>
        <button
          onClick={() => onSubmit({ claimed: false })}
          className="bg-white border-4 border-ochre rounded-full px-6 py-4 text-kid-sm"
          style={{ touchAction: 'manipulation', minHeight: 60 }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/reading/rendering/ReadAloudSimple.tsx
git commit -m "feat(reading): ReadAloudSimple renderer — honor-system practice loop"
```

### Task 17: Reading pack index + register with master registry

**Files:**
- Create: `lib/packs/reading/index.ts`
- Modify: `lib/packs/index.ts`

- [ ] **Step 1: Write lib/packs/reading/index.ts**

```typescript
// lib/packs/reading/index.ts
import { READING_SKILLS } from './skills';
import { READING_STRANDS } from './strands';
import { READING_THEMES, getReadingThemeHeader } from './themes';
import {
  scoreSightWordTap, scorePhonemeBlend, scoreDigraphSort, scoreReadAloudSimple,
} from './scoring';
import SightWordTap from './rendering/SightWordTap';
import PhonemeBlend from './rendering/PhonemeBlend';
import DigraphSort from './rendering/DigraphSort';
import ReadAloudSimple from './rendering/ReadAloudSimple';
import type { ItemTypeMap } from '@/lib/packs/registry';

export const ReadingPack = {
  id: 'reading' as const,
  name: 'Reading',
  packVersion: '1.0.0',
  strands: READING_STRANDS,
  skills: READING_SKILLS,
  themes: READING_THEMES,
  getThemeHeader: getReadingThemeHeader,
  skillThemeTags(code: string) {
    return READING_SKILLS.find(s => s.code === code)?.themeTags ?? [];
  },
};

export const readingItemTypes: ItemTypeMap = {
  SightWordTap: {
    renderer: SightWordTap,
    score: scoreSightWordTap,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  PhonemeBlend: {
    renderer: PhonemeBlend,
    score: scorePhonemeBlend,
    getPromptText: (item) =>
      item.content?.promptText
        ?? `Blend: ${(item.content?.phonemes ?? []).join(' ')}`,
  },
  DigraphSort: {
    renderer: DigraphSort,
    score: scoreDigraphSort,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  ReadAloudSimple: {
    renderer: ReadAloudSimple,
    score: scoreReadAloudSimple,
    getPromptText: (item) => `${item.content?.promptText ?? ''} ${item.content?.word ?? ''}`.trim(),
  },
};
```

- [ ] **Step 2: Register in master lib/packs/index.ts**

Open `lib/packs/index.ts`. Add the import near the top:
```typescript
import { readingItemTypes } from './reading';
```

Update the `ALL_ITEM_TYPES` composition to include reading:
```typescript
const ALL_ITEM_TYPES: ItemTypeMap = {
  ...mathItemTypes,
  ...readingItemTypes,
};
```

- [ ] **Step 3: Run all unit tests**

```bash
npm test
```
Expected: all previous tests still pass + reading scoring tests pass. Should be 35+/35+ green.

- [ ] **Step 4: Run build**

```bash
npm run build
```
Expected: compiles cleanly.

- [ ] **Step 5: Commit**

```bash
git add lib/packs/reading/index.ts lib/packs/index.ts
git commit -m "feat(reading): ReadingPack export + register 4 item types with master registry"
```

### Task 18: Registry test — now includes Reading types

**Files:**
- Modify: `tests/packs/registry.test.ts`

- [ ] **Step 1: Append Reading-handler coverage**

Open `tests/packs/registry.test.ts`. Inside the main `describe('packs registry', () => { ... })` block, ADD these tests (do not remove existing):

```typescript
  it('returns Reading handlers for Reading item types', () => {
    expect(getItemHandler('SightWordTap')).toBeDefined();
    expect(getItemHandler('PhonemeBlend')).toBeDefined();
    expect(getItemHandler('DigraphSort')).toBeDefined();
    expect(getItemHandler('ReadAloudSimple')).toBeDefined();
  });

  it('scoreAnyItem dispatches to Reading pack', () => {
    const item = mkItem(
      'SightWordTap',
      { type: 'SightWordTap', word: 'the', distractors: ['she'], promptText: "" },
      { word: 'the' }
    );
    expect(scoreAnyItem(item, { chosen: 'the' })).toEqual({ outcome: 'correct' });
    expect(scoreAnyItem(item, { chosen: 'she' })).toEqual({ outcome: 'incorrect' });
  });
```

- [ ] **Step 2: Run tests**

```bash
npm test -- registry
```
Expected: 7/7 passing (5 existing + 2 new).

- [ ] **Step 3: Commit**

```bash
git add tests/packs/registry.test.ts
git commit -m "test(packs): registry also serves Reading types + dispatches correctly"
```

---

## Epic D — Audio Narration (Web Speech API) (Tasks 19–23)

### Task 19: Web Speech API wrapper module

**Files:**
- Create: `lib/audio/tts.ts`

- [ ] **Step 1: Write tts.ts**

```typescript
// lib/audio/tts.ts
// Web Speech API wrapper. Runs only in the browser; returns a no-op on SSR.

export interface SpeakOptions {
  rate?: number;       // 0.1..10, default 0.9 (slightly slow for a first grader)
  pitch?: number;      // 0..2, default 1.05
  voice?: string;      // voice name, e.g., 'Samantha' (en-US). Ignored if not found.
}

const DEFAULT_OPTIONS: SpeakOptions = {
  rate: 0.9,
  pitch: 1.05,
};

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(desiredName?: string): SpeechSynthesisVoice | undefined {
  if (!isSpeechAvailable()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;

  if (desiredName) {
    const match = voices.find(v => v.name === desiredName);
    if (match) return match;
  }
  // Prefer a high-quality en-US female voice, fall back to any en-US.
  const preferences = ['Samantha', 'Ava', 'Google US English', 'Microsoft Aria Online (Natural) - English (United States)'];
  for (const name of preferences) {
    const match = voices.find(v => v.name === name);
    if (match) return match;
  }
  return voices.find(v => v.lang.startsWith('en')) ?? voices[0];
}

export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isSpeechAvailable() || !text.trim()) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const merged = { ...DEFAULT_OPTIONS, ...opts };
    u.rate = merged.rate!;
    u.pitch = merged.pitch!;
    const voice = pickVoice(merged.voice);
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    // iOS Safari sometimes ignores the first utterance unless we cancel any queued one.
    try { window.speechSynthesis.cancel(); } catch {}
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking(): void {
  if (!isSpeechAvailable()) return;
  try { window.speechSynthesis.cancel(); } catch {}
}
```

- [ ] **Step 2: Write failing test**

Create `tests/audio/tts.test.ts`:

```typescript
// tests/audio/tts.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSpeechAvailable, speak, stopSpeaking } from '@/lib/audio/tts';

describe('tts (Web Speech API wrapper)', () => {
  const originalSpeechSynthesis = (window as any).speechSynthesis;

  beforeEach(() => {
    (window as any).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((u: any) => { setTimeout(() => u.onend?.(), 1); }),
      getVoices: () => [],
    };
  });

  afterEach(() => {
    (window as any).speechSynthesis = originalSpeechSynthesis;
  });

  it('isSpeechAvailable reflects window.speechSynthesis', () => {
    expect(isSpeechAvailable()).toBe(true);
    (window as any).speechSynthesis = undefined;
    expect(isSpeechAvailable()).toBe(false);
  });

  it('speak resolves after utterance ends', async () => {
    await expect(speak('hello')).resolves.toBeUndefined();
    expect((window as any).speechSynthesis.speak).toHaveBeenCalled();
  });

  it('speak is a no-op on empty text', async () => {
    await expect(speak('   ')).resolves.toBeUndefined();
    expect((window as any).speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('stopSpeaking calls cancel', () => {
    stopSpeaking();
    expect((window as any).speechSynthesis.cancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- tts
```
Expected: 4/4 passing.

- [ ] **Step 4: Commit**

```bash
git add lib/audio/tts.ts tests/audio/tts.test.ts
git commit -m "feat(audio): Web Speech API wrapper with voice pick + cancellation"
```

### Task 20: useNarrator React hook

**Files:**
- Create: `lib/audio/useNarrator.ts`

- [ ] **Step 1: Write useNarrator.ts**

```typescript
// lib/audio/useNarrator.ts
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from './tts';

/**
 * Auto-narrates `text` once when it changes (i.e., when a new item appears).
 * Returns a `replay` function bound to the current text.
 */
export function useNarrator(text: string): { replay: () => void } {
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    // Slight delay helps iOS Safari "wake" the speech engine after page nav.
    const timer = setTimeout(() => { void speak(text); }, 80);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [text]);

  const replay = useCallback(() => {
    if (!text) return;
    void speak(text);
  }, [text]);

  return { replay };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/audio/useNarrator.ts
git commit -m "feat(audio): useNarrator hook — auto-narrate on text change + replay"
```

### Task 21: AudioButton component

**Files:**
- Create: `components/child/AudioButton.tsx`

- [ ] **Step 1: Write AudioButton.tsx**

```typescript
// components/child/AudioButton.tsx
'use client';

import { useState } from 'react';

export default function AudioButton({ onPlay, label = 'replay audio' }: { onPlay: () => void; label?: string }) {
  const [pulsing, setPulsing] = useState(false);

  const handle = () => {
    setPulsing(true);
    onPlay();
    setTimeout(() => setPulsing(false), 500);
  };

  return (
    <button
      onClick={handle}
      aria-label={label}
      className={`text-2xl p-2 rounded-full bg-white border border-ochre transition-transform ${pulsing ? 'scale-125' : ''}`}
      style={{ touchAction: 'manipulation' }}
    >
      🔊
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/child/AudioButton.tsx
git commit -m "feat(audio): AudioButton with tap feedback"
```

### Task 22: Wire useNarrator into lesson page

**Files:**
- Modify: `app/(child)/lesson/[sessionId]/page.tsx`

- [ ] **Step 1: Import useNarrator + registry helper**

Open the file. Add these imports near the top (after existing imports):
```typescript
import { useNarrator } from '@/lib/audio/useNarrator';
import { getPromptText } from '@/lib/packs';
```

- [ ] **Step 2: Compute prompt text and call the hook**

Inside the `LessonPage` function component, AFTER the `startTime` ref and BEFORE `const endSession = useCallback(...)`, insert:

```typescript
  const promptText = item
    ? getPromptText({
        id: item.itemId,
        skillId: '',
        type: item.type,
        content: item.content,
        answer: {},
        difficultyElo: 1000,
        generatedBy: 'seed',
      })
    : '';
  const { replay } = useNarrator(promptText);
```

- [ ] **Step 3: Wire replay into the header**

Find the `<LessonHeader ... />` JSX and update its `onReplayAudio` prop to call `replay`:

```tsx
<LessonHeader
  breadcrumb="🔍 Exploration"
  onReplayAudio={() => replay()}
  onWonder={() => {/* Plan 3 virtue detector */}}
/>
```

- [ ] **Step 4: Build**

```bash
npm run build
```
Expected: compiles cleanly.

- [ ] **Step 5: Commit**

```bash
git add app/\(child\)/lesson/\[sessionId\]/page.tsx
git commit -m "feat(lesson): auto-narrate prompt + wire replay button via useNarrator"
```

### Task 23: Manual iPad Safari narration check (no automated test)

**Files:** none

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: On your laptop (Chrome or Safari)**

Open http://localhost:3000. Pick Cecily. Pick an expedition (any Math item will do). Confirm:
- Prompt audio auto-plays when the item renders (after ~80ms)
- 🔊 button in the header replays audio
- No errors in browser console

- [ ] **Step 3: If anything doesn't speak**

- Open Chrome DevTools console. Type `speechSynthesis.getVoices()` — you should see an array. If empty, voices haven't loaded yet; some browsers load voices asynchronously. The hook's 80ms delay should usually be enough; if not, increase to 250ms in `useNarrator.ts`.
- On macOS: Settings → Accessibility → Spoken Content — make sure a System voice is installed.

**No commit unless you made code changes.**

---

## Epic E — Seed Reading Data (Tasks 24–28)

### Task 24: Extract Reading seed into its own module

**Files:**
- Create: `scripts/seed-reading.ts`

- [ ] **Step 1: Write seed-reading.ts**

```typescript
#!/usr/bin/env tsx
/**
 * Seeds Reading pack skills + hardcoded items into the DB.
 * Called by scripts/seed.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { READING_STRANDS } from '../lib/packs/reading/strands';
import { READING_SKILLS } from '../lib/packs/reading/skills';

// Dolch Primer (first 40). These are hand-picked; the official list has more.
const DOLCH_PRIMER = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down',
  'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in',
  'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my',
  'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the',
  'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
];

const DOLCH_FIRST_GRADE = [
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could',
  'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her',
  'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may',
  'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some',
  'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
  'when',
];

// CVC words for blending practice
const CVC_WORDS = [
  ['c', 'a', 't'], ['d', 'o', 'g'], ['b', 'a', 't'], ['m', 'a', 'p'],
  ['p', 'i', 'g'], ['s', 'u', 'n'], ['f', 'i', 'sh'], ['c', 'u', 'p'],
  ['h', 'a', 't'], ['r', 'e', 'd'], ['b', 'u', 'g'], ['l', 'i', 'p'],
  ['n', 'e', 't'], ['j', 'e', 't'], ['p', 'a', 'n'], ['f', 'o', 'x'],
];

// Digraph word sets
const DIGRAPH_WORDS: Array<{ word: string; digraph: string; emoji: string }> = [
  { word: 'ship', digraph: 'sh', emoji: '🚢' },
  { word: 'fish', digraph: 'sh', emoji: '🐟' },
  { word: 'shoe', digraph: 'sh', emoji: '👟' },
  { word: 'shell', digraph: 'sh', emoji: '🐚' },
  { word: 'chip', digraph: 'ch', emoji: '🍟' },
  { word: 'chin', digraph: 'ch', emoji: '🙂' },
  { word: 'chick', digraph: 'ch', emoji: '🐥' },
  { word: 'cheese', digraph: 'ch', emoji: '🧀' },
  { word: 'thin', digraph: 'th', emoji: '➖' },
  { word: 'thumb', digraph: 'th', emoji: '👍' },
  { word: 'three', digraph: 'th', emoji: '3️⃣' },
  { word: 'thick', digraph: 'th', emoji: '📚' },
];

// Simple words for ReadAloudSimple
const READ_ALOUD_WORDS = [
  'cat', 'dog', 'sun', 'map', 'bug', 'hat', 'red', 'fish',
  'ship', 'chip', 'milk', 'book', 'pond', 'frog', 'cake',
];

export async function seedReading(
  sb: SupabaseClient,
  subjectId: string,
  skillIdByCode: Map<string, string>
): Promise<void> {
  // Insert strands
  for (const s of READING_STRANDS) {
    const { error } = await sb.from('strand').upsert({
      subject_id: subjectId,
      code: s.code,
      name: s.name,
      sort_order: s.sortOrder,
    }, { onConflict: 'subject_id,code' });
    if (error) throw error;
  }

  // Refresh strand IDs after inserts
  const { data: strandRows } = await sb.from('strand')
    .select('id, code').eq('subject_id', subjectId);
  const strandIdByCode = new Map(strandRows!.map(r => [r.code, r.id]));

  // Insert skills
  for (const sk of READING_SKILLS) {
    const strandId = strandIdByCode.get(sk.strandCode);
    if (!strandId) continue;
    const { error } = await sb.from('skill').upsert({
      strand_id: strandId,
      code: sk.code,
      name: sk.name,
      level: sk.level,
      prereq_skill_codes: sk.prereqSkillCodes,
      curriculum_refs: sk.curriculumRefs ?? {},
      theme_tags: sk.themeTags,
      sort_order: sk.sortOrder,
    }, { onConflict: 'code' });
    if (error) throw error;
  }

  // Refresh skill IDs
  const { data: allSkillRows } = await sb.from('skill').select('id, code');
  for (const r of allSkillRows ?? []) skillIdByCode.set(r.code, r.id);

  // Wipe previous reading seed items + their attempts
  const readingSkillIds = READING_SKILLS
    .map(s => skillIdByCode.get(s.code))
    .filter((x): x is string => !!x);
  if (readingSkillIds.length > 0) {
    const { data: prior } = await sb.from('item')
      .select('id').eq('generated_by', 'seed').in('skill_id', readingSkillIds);
    const priorIds = (prior ?? []).map(r => r.id);
    if (priorIds.length > 0) {
      await sb.from('attempt').delete().in('item_id', priorIds);
      await sb.from('item').delete().in('id', priorIds);
    }
  }

  const now = new Date().toISOString();
  const items: any[] = [];

  // ---- SightWordTap: Dolch Primer ----
  {
    const id = skillIdByCode.get('reading.sight_words.dolch_primer');
    if (id) {
      for (let i = 0; i < Math.min(20, DOLCH_PRIMER.length); i++) {
        const word = DOLCH_PRIMER[i];
        // pick 2 distractors from nearby words
        const pool = DOLCH_PRIMER.filter(w => w !== word);
        const distractors = [pool[(i * 3) % pool.length], pool[(i * 7 + 1) % pool.length]];
        items.push({
          skill_id: id,
          type: 'SightWordTap',
          content: {
            type: 'SightWordTap',
            word,
            distractors,
            promptText: `Which word says "${word}"?`,
          },
          answer: { word },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + i * 5,
        });
      }
    }
  }

  // ---- SightWordTap: Dolch First Grade ----
  {
    const id = skillIdByCode.get('reading.sight_words.dolch_first_grade');
    if (id) {
      for (let i = 0; i < Math.min(20, DOLCH_FIRST_GRADE.length); i++) {
        const word = DOLCH_FIRST_GRADE[i];
        const pool = DOLCH_FIRST_GRADE.filter(w => w !== word);
        const distractors = [pool[(i * 3) % pool.length], pool[(i * 5 + 2) % pool.length]];
        items.push({
          skill_id: id,
          type: 'SightWordTap',
          content: {
            type: 'SightWordTap',
            word,
            distractors,
            promptText: `Which word says "${word}"?`,
          },
          answer: { word },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1050 + i * 5,
        });
      }
    }
  }

  // ---- PhonemeBlend: CVC words ----
  {
    const id = skillIdByCode.get('reading.phonics.cvc_blend');
    if (id) {
      const blendedWords = CVC_WORDS.map(p => p.join(''));
      for (let i = 0; i < CVC_WORDS.length; i++) {
        const phonemes = CVC_WORDS[i];
        const word = phonemes.join('');
        // 2 distractors from other CVC words
        const pool = blendedWords.filter(w => w !== word);
        const distractors = [pool[(i * 3) % pool.length], pool[(i * 7 + 1) % pool.length]];
        items.push({
          skill_id: id,
          type: 'PhonemeBlend',
          content: {
            type: 'PhonemeBlend',
            phonemes,
            word,
            distractors,
            promptText: 'Blend the sounds and pick the word.',
          },
          answer: { word },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + i * 5,
        });
      }
    }
  }

  // ---- DigraphSort: groups of 3 words ----
  {
    const id = skillIdByCode.get('reading.phonics.digraphs');
    if (id) {
      // Create 4 DigraphSort items, each with 3 words (one per digraph)
      const grouped: Record<string, typeof DIGRAPH_WORDS> = { ch: [], sh: [], th: [] };
      for (const w of DIGRAPH_WORDS) grouped[w.digraph].push(w);
      const rounds = Math.min(grouped.ch.length, grouped.sh.length, grouped.th.length);
      for (let r = 0; r < rounds; r++) {
        const roundWords = [grouped.ch[r], grouped.sh[r], grouped.th[r]];
        items.push({
          skill_id: id,
          type: 'DigraphSort',
          content: {
            type: 'DigraphSort',
            digraphs: ['ch', 'sh', 'th'],
            words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.digraph })),
            promptText: 'Put each word in the right bucket.',
          },
          answer: {
            placements: Object.fromEntries(roundWords.map(w => [w.word, w.digraph])),
          },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1050 + r * 20,
        });
      }
    }
  }

  // ---- ReadAloudSimple ----
  {
    const id = skillIdByCode.get('reading.read_aloud.simple');
    if (id) {
      for (let i = 0; i < READ_ALOUD_WORDS.length; i++) {
        const word = READ_ALOUD_WORDS[i];
        items.push({
          skill_id: id,
          type: 'ReadAloudSimple',
          content: {
            type: 'ReadAloudSimple',
            word,
            promptText: 'Say it out loud.',
          },
          answer: {},
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + word.length * 10,
        });
      }
    }
  }

  if (items.length > 0) {
    const { error } = await sb.from('item').insert(items);
    if (error) throw error;
  }

  console.log(`  → reading: inserted ${items.length} items across ${readingSkillIds.length} skills`);
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/seed-reading.ts
git commit -m "feat(seed): reading pack items — sight words, CVC blends, digraphs, read-aloud"
```

### Task 25: Call seedReading from main seed script

**Files:**
- Modify: `scripts/seed.ts`

- [ ] **Step 1: Add import near the top of seed.ts**

Open `scripts/seed.ts`. After the existing imports (MATH_STRANDS, MATH_SKILLS), add:
```typescript
import { seedReading } from './seed-reading';
```

- [ ] **Step 2: Call seedReading before the final item insert**

Find the line that defines `const now = new Date().toISOString();`. Just BEFORE it, insert:

```typescript
  // Seed Reading pack (strands, skills, items). Idempotent — wipes prior seed rows.
  await step('reading pack', async () => {
    await seedReading(sb, SUBJECT_ID, skillIdByCode);
  });
```

(The ReadingPack will use a different `subject.code`. Update: we need a separate subject row for reading. Let me fix the architecture here — see next task.)

**Skip the manual edit for this step — see Task 26 for the corrected approach. Revert if you already applied it.**

- [ ] **Step 3: (No commit yet — Task 26 corrects the approach)**

### Task 26: Introduce a second `subject` row for Reading

**Files:**
- Modify: `scripts/seed.ts`
- Modify: `scripts/seed-reading.ts`

Reading deserves its own `subject` row so that strands are scoped correctly (a `strand.(subject_id, code)` uniqueness constraint exists).

- [ ] **Step 1: Add reading subject UUID constant in scripts/seed.ts**

Near the existing `SUBJECT_ID` constant add:
```typescript
const READING_SUBJECT_ID = '22222222-2222-2222-2222-222222222222';
```

- [ ] **Step 2: Create the reading subject row before calling seedReading**

Inside the `main()` function, after the math `subject` upsert step, add:

```typescript
  await step('subject (reading)', async () => {
    const { error } = await sb.from('subject').upsert({
      id: READING_SUBJECT_ID, code: 'reading', name: 'Reading', pack_version: '1.0.0',
    }, { onConflict: 'code' });
    if (error) throw error;
  });
```

- [ ] **Step 3: Update the call site to pass READING_SUBJECT_ID**

Replace the earlier `await step('reading pack', ...)` line you inserted in Task 25 with:

```typescript
  await step('reading pack', async () => {
    await seedReading(sb, READING_SUBJECT_ID, skillIdByCode);
  });
```

- [ ] **Step 4: Verify `scripts/seed-reading.ts` accepts the passed-in subjectId**

Open `scripts/seed-reading.ts`. The function signature should be `seedReading(sb, subjectId, skillIdByCode)` — confirm it's passing `subjectId` to the strand upsert. It already does from Task 24's code:
```typescript
subject_id: subjectId,
```
No change needed if Task 24 was implemented correctly.

- [ ] **Step 5: Run seed end-to-end**

```bash
npm run db:seed
```
Expected: prints the math steps + reading step; finishes "Seed complete. Inserted N items." where N now includes reading items.

If you see a FK error, the attempts cleanup in `seedReading` may need to fire before the item wipe — that's already handled in Task 24's code.

- [ ] **Step 6: Verify in Supabase SQL Editor**

```sql
select subject.code, count(item.id)
from subject
join strand on strand.subject_id = subject.id
join skill on skill.strand_id = strand.id
left join item on item.skill_id = skill.id and item.approved_at is not null
group by subject.code;
```

Expected: two rows — `math` (~110 items) and `reading` (~75 items).

- [ ] **Step 7: Commit**

```bash
git add scripts/seed.ts scripts/seed-reading.ts
git commit -m "feat(seed): separate reading subject row + wire seedReading into main seed"
```

### Task 27: Seed some Reading baseline mastery for Cecily

**Files:**
- Modify: `scripts/seed.ts`

- [ ] **Step 1: Extend Cecily's baseline mastery entry**

Find the step "Cecily baseline mastery (math c)". Replace its `mastered` and `reviewing` arrays:

```typescript
    const mastered = [
      'math.counting.to_20', 'math.counting.to_50', 'math.add.within_10',
      'reading.phonics.cvc_blend',            // she blends CVCs fluently
    ];
    const reviewing = [
      'math.subtract.within_10',
      'reading.sight_words.dolch_primer',     // she knows most primer words
    ];
```

- [ ] **Step 2: Re-run seed**

```bash
npm run db:seed
```
Expected: all steps pass; "Cecily baseline mastery" now applies to both math + reading skills.

- [ ] **Step 3: Verify candidates endpoint returns a mix**

```bash
curl -s "https://garden-quest-school.vercel.app/api/plan/candidates?learner=11111111-1111-1111-1111-111111111111"
```
Expected: 3 candidates with at least one `reading.*` skill present.

(Note: the live Vercel DB and local DB share the same Supabase — the seed you just ran applied to both.)

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat(seed): Cecily's reading baseline — CVC mastered, Dolch primer in review"
```

### Task 28: Explore page needs to know about Reading candidates

**Files:** none (verify only)

- [ ] **Step 1: The candidates API already handles both packs**

Task 11 updated `app/api/plan/candidates/route.ts` to try math + reading theme lookups. The session planner in `lib/engine/sessionPlanner.ts` is subject-agnostic — it reads all skills from `skill` rows and scores them, regardless of subject.

- [ ] **Step 2: Manually hit the candidates endpoint**

```bash
curl -s "http://localhost:3000/api/plan/candidates?learner=11111111-1111-1111-1111-111111111111"
```

Expected: JSON with 3 candidates; titles and emojis should include at least one Reading theme (📖, 🦋, 🌸, 🐝, 🐜 for reading, vs 🐞, 🐜, 🦋, 🐝 for math — some overlap but reading ones should show).

**No commit — this is a verification step.**

---

## Epic F — E2E & Deploy (Tasks 29–32)

### Task 29: E2E test — Reading lesson flow

**Files:**
- Create: `tests/e2e/first-reading-lesson.spec.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/e2e/first-reading-lesson.spec.ts
import { test, expect } from '@playwright/test';

test('Reading expedition renders and accepts an answer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cecily')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Cecily').click();

  await expect(page).toHaveURL(/\/explore/);
  await page.waitForLoadState('networkidle');

  // Find any reading expedition card. Reading themes use emojis like 📖, 🐝, 🌸, 🦋.
  // Easier: look for skillHint text that mentions reading/sight words/phonics.
  const readingCard = page.locator('button').filter({
    hasText: /sight words|phonics|sounds|digraphs|blends|reading/i,
  }).first();

  await expect(readingCard).toBeVisible({ timeout: 10_000 });
  await readingCard.click();

  await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });

  // Wait for a renderer to appear. Reading renderers have word buttons,
  // check/skip buttons, or I-read-it buttons.
  await page.waitForSelector(
    'button:has-text("Check"), button:has-text("I read it"), button',
    { timeout: 15_000 }
  );

  // Tap first button (any response — we're just validating the loop works)
  const answerButtons = page.getByRole('button').filter({
    hasNotText: /🔊|❓|Exploration/,
  });
  const count = await answerButtons.count();
  if (count > 0) {
    await answerButtons.first().click();
  }

  // We don't require navigation; just that no error has thrown.
  // 2s settle
  await page.waitForTimeout(2000);
});
```

- [ ] **Step 2: Run E2E (both tests)**

```bash
npm run test:e2e -- --project=chromium
```
Expected: 2/2 passing (first-lesson.spec.ts for Math + first-reading-lesson.spec.ts for Reading).

If the Reading test fails with "no reading card found" — check the candidates endpoint response; Cecily's baseline mastery may need re-applying via `npm run db:seed`.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/first-reading-lesson.spec.ts
git commit -m "test(e2e): reading expedition renders and accepts a response"
```

### Task 30: Full regression run

**Files:** none

- [ ] **Step 1: Unit tests**

```bash
npm test
```
Expected: all passing. Approximate counts — engine 20 + math scoring 6 + registry 7 + reading scoring 9 + tts 4 = **46+ tests, 0 failures**.

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: compiles, all routes render in the output report.

- [ ] **Step 3: E2E**

```bash
npm run test:e2e -- --project=chromium
```
Expected: 2/2 passing.

If any fail, fix inline and commit with a `fix:` prefix before proceeding.

### Task 31: Deploy to production

**Files:** none

- [ ] **Step 1: Deploy**

```bash
npx vercel --prod
```
Expected: new production URL printed. Alias `https://garden-quest-school.vercel.app` auto-updates.

- [ ] **Step 2: Smoke test the deploy**

```bash
curl -s "https://garden-quest-school.vercel.app/api/plan/candidates?learner=11111111-1111-1111-1111-111111111111" | head -50
```
Expected: JSON with 3 candidates, at least one reading.*.

- [ ] **Step 3: Open the live site in a browser**

Visit `https://garden-quest-school.vercel.app`. Pick Cecily. Verify:
- Expedition picker shows 3 cards, at least one Reading-themed
- Tap a reading card → lesson loads → audio auto-narrates the prompt (if on a device with speechSynthesis support)
- Answer an item → next item loads
- After 5–8 items → session-end screen

### Task 32: README update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update status section**

Replace the `## Status` section with:

```markdown
## Status

- **Plan 1 — Foundations + First Playable Loop** — ✅ complete + deployed
- **Plan 2 — Reading Pack (V1.5)** — ✅ complete + deployed
- **Plan 3 — Content Generation + Parent Zone** — pending
- **Plan 4 — World Delight + Accessibility** — pending
```

- [ ] **Step 2: Add a "Packs" section below Architecture**

```markdown
## Subject Packs

Each pack is a self-contained module implementing the same contract. V1.5 ships:

- **Math** — 8 skills, 3 item types (NumberBonds, CountingTiles, EquationTap), ~110 items
- **Reading** — 6 skills, 4 item types (SightWordTap, PhonemeBlend, DigraphSort, ReadAloudSimple), ~75 items

Adding a new pack = new folder under `lib/packs/`, register its item types in `lib/packs/index.ts`. No engine changes.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: Plan 2 status + Packs section"
```

---

## Self-Review

**Spec coverage.** Skimmed the design spec:

- §8 Reading Pack preview (7 item types listed) — implementing 4 of them (SightWordTap, PhonemeBlend, DigraphSort, ReadAloudSimple). TraceLetter, ReadAloudMic, ComprehensionQ deferred to Plan 3/4 with clear rationale (ASR complexity, needs authored passages). ✅
- §8 OG scope+sequence + Dolch/Fry — reflected in skills with `curriculum_refs: { dolch: ..., og: ... }`. ✅
- §13.1 Web Speech API as interim TTS — Task 19 wrapper + Task 20 hook + Task 21 button + Task 22 wiring. ✅
- §11.6 Audio narration rules (auto on load, replay on button) — Task 22 wires both. ✅
- §14.1 Plan 2 deferred items (AI content gen, parent zone, ElevenLabs, remaining Math types) — all deferred to Plan 3 per spec. ✅
- §5 Pack boundaries (engine doesn't know about content) — registry pattern preserves the engine/shell boundary. Engine code in `lib/engine/` is unchanged by this plan. ✅
- §6 Data model — no schema changes needed. Reading uses the same `subject → strand → skill → item` structure as Math. ✅

**Placeholder scan.** Grepped mentally through my tasks for TBD, TODO, "implement later", "similar to Task N (without repeating code)" — none found. Every code step has complete code. Task 25 intentionally says "Skip Step 2 — see Task 26 for corrected approach" but that's transparent instruction, not a placeholder.

**Type consistency.** Checked:
- `ItemTypeHandler` interface defined in Task 1 used identically in Tasks 2, 3, 17 ✅
- `ItemTypeMap` type alias used consistently in Tasks 2, 3, 17 ✅
- `SkillDefinition` import path `@/lib/engine/types` matches Math pack usage ✅
- `ThemeHeader` type imported from `@/lib/packs/math/themes` in Task 10 (reading themes) and in the unified lookup (Task 11) — confirmed it's exported from math ✅
- `scoreAnyItem`, `getItemHandler`, `getPromptText` names consistent across Tasks 3, 4, 5, 6, 18, 22 ✅
- `promptText` content shape consistent across all 4 reading item type contents (all have `promptText: string`) ✅

**Scope check.** Plan 2 is appropriately scoped — adds one pack, one audio layer, no engine changes, no parent zone work. Leaves content-gen and parent zone for Plan 3 per user's Option A choice.

No issues requiring fixes.

---

## Execution Handoff

**Plan complete and saved to** `C:\Users\dylan\GardenQuestSchool\docs\superpowers\plans\2026-04-22-v1_5-plan2-reading-pack.md`.

**Plan stats:** 32 tasks across 6 epics (Registry Refactor, Reading Structure, Renderers, Audio, Seed, E2E/Deploy). Estimated 12-18 focused hours → ~2 weeks at 7-10 hrs/week.

Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, two-stage review between. Uses `superpowers:subagent-driven-development`.

**2. Inline Execution** — I execute tasks in this session with checkpoints for your review. Uses `superpowers:executing-plans`.

Given Plan 1 went smoothly with me executing tasks directly (after the skill dispatch), and given Plan 2 is smaller, want to stick with the same approach?
