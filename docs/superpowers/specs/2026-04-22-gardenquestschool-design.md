# GardenQuestSchool — Design Spec

**Date:** 2026-04-22
**Author:** Dylan Brock
**Learners:** Cecily (primary, first grade), Esme (sister, fast-follow)
**Status:** Design approved, ready for implementation planning

---

## 1. Executive Summary

GardenQuestSchool is a personal learning web app for first graders, optimized for iPad. It teaches Reading, Spelling, Math, and Science/Nature through a persistent "naturalist garden" world: the learner is a young scientist who builds habitats, attracts real species, and documents her discoveries in a field journal. Learning activities (expeditions) unlock habitat pieces, attract creatures, and earn virtue gems (Persistence, Curiosity, etc.) — but there is **no currency, no score, no streak, no leaderboard**.

The architecture is a **modular platform with pluggable subject packs**. V1 ships the platform plus a Math pack. Reading and Spelling packs follow with minimal platform changes.

**Core philosophical commitment:** the engine is rigorous (mastery tracking, spaced repetition, adaptive difficulty, curriculum-aligned content generation), but the learner never sees metrics, scores, or gamified extrinsic motivators. The parent dashboard carries the data; the child sees documentation and narrative. Grounded in Alfie Kohn (*Punished by Rewards*), Reggio Emilia, and Chance School's 13 progressive tenets.

---

## 2. Goals & Non-Goals

### Goals (V1)
- Cecily can independently run through a 10-15 min learning session on her iPad, 3-4× per week
- The app is self-sufficient: it generates new content nightly without parent input for weeks at a time
- Parent can author custom content (word lists, math problems, topics) with minimal friction
- Architecture extends cleanly to Reading + Spelling packs and to a second learner (Esme)
- Total monthly run-cost ≤ $15 at expected usage

### Non-goals
- Classroom / multi-family deployment
- Teacher-facing tools
- Standardized test prep
- Leaderboards, social sharing, or any competitive framing
- Offline-first (online-first is acceptable for V1; PWA/offline is V2.5)
- Native iOS app (web + PWA is sufficient)
- Luna outfits, breed unlocks, or any "decorate your pet" layer

---

## 3. Learner Profiles

### Cecily (V1 primary)
- First grader, 7 years old
- **Reading:** transitioning from simple sentences to short books (approx. Fountas & Pinnell E/F)
- **Spelling:** CVC + digraphs solid, starting two-syllable words
- **Math:** fluent add/subtract within 20, ready for multiplication concepts via arrays and skip-counting
- **Typing:** none, but interested in learning
- **Device:** iPad primarily, occasional desktop/laptop
- **Reads simple UI text**; needs audio narration for anything beyond ~4 words
- Interests: cats, ants, butterflies, bees, frogs, bunnies, moles, plants — all garden life
- Parent-observed language: "practice makes progress", "remember how things are difficult until they become easy" — growth mindset reinforced at home

### Esme (fast-follow)
- Will receive her own learner profile via the family tab
- 3-4 years old, preschool, can count recognize letters and numbers, group.
- Level will be set at onboarding (may differ from Cecily)
- No code changes required to support her — the schema is multi-learner from day one

---

## 4. Pedagogy & Philosophy

### Rooted in
- **Alfie Kohn** — *Punished by Rewards*; rejection of extrinsic motivation as a corrupting influence on intrinsic curiosity
- **Reggio Emilia** — image of the child as capable, emergent curriculum driven by interest, 100 languages of expression, documentation as reflection, environment as third teacher
- **Virginia Chance School (Louisville, KY)** — 13 progressive tenets: whole-child development, intrinsic motivation, active experiential learning, process-centered, child voice and agency, integrated thematic curriculum, authentic assessment

### Rejected
- Coin / currency economies as primary motivators (extrinsic reward displaces intrinsic curiosity)
- Badges as trophies or competitive milestones
- "80% mastered" progress bars shown to the child
- Streak-shaming, loss-aversion, or "don't break your X-day streak"
- Drill framed as drill
- Praise-as-control ("good job!" as manipulation)
- Mandatory linear paths
- Multiple choice as the *only* response mode

### Embraced
- Intrinsic motivation via authentic naturalist investigation
- **Documentation** (Reggio) — showing her work, not her score
- **Choice** at every session — never a single forced path
- **Emergent curriculum** — her world-building choices shape next content
- **Integrated thematic** — math lives in ant colonies, words in journal entries
- **"100 languages"** — tap, drag, draw, speak, arrange, build as answer modes
- **Environment as teacher** — ambient facts appear on tap, never lecture
- **Spaced revisiting** reframed as "returning to what you've been noticing"
- **Growth-mindset narration** — specific moments embedded in feedback ("you made 10 first, then added 3 more — that's the make-10 way")

### Seven operating principles

1. **Rewards live inside the world, not above it.** No currency to spend. The garden grows because she did naturalist work; planting and building are what naturalists *do next*, not what they buy.
2. **Badges → "Wonderings" and "Discoveries".** Named specifically, grounded in what she did ("I noticed ants walk in lines"), not trophies.
3. **She sees stories, you see data.** Her session-end screen is narrative documentation. The parent dashboard carries the metrics.
4. **Choice at every expedition.** 2-3 themed options each session, never one forced path. The planner ensures weekly balance behind the scenes.
5. **Emergent curriculum.** World-building actions feed interest tags into the planner; thematically-aligned content surfaces.
6. **100 languages of response.** Response mode matches content, not a template.
7. **Environment as third teacher.** Tap-to-learn ambient facts throughout the garden.

### Language shifts (enforced across the whole app)

| ❌ Avoid | ✅ Use |
|---|---|
| coins / currency / seeds-as-currency | (gone — no economy) |
| "badge earned" | "wondering noticed" / "discovery made" |
| "skill mastered (87%)" | "something you've been exploring" |
| "level up!" | "new territory" / "new kind of work" |
| "great job!" | specific observation ("you used the make-10 trick") |
| "today's mandatory quest" | "pick your exploration" |
| "correct / incorrect" | ✓ / "let's look at it again" |
| "daily streak" | (not shown) |

An ESLint rule forbids these strings in `app/(child)/**` and `components/child/**`. Design-review checklist item.

### Growth-mindset hooks (engine-driven)

- **Spaced-review visits** fire narrator moments: *"Remember when 8+5 felt tricky? You're coming back to it. That's how practice works."*
- **Difficulty-ladder memory** — engine stores when each skill transitioned `new → learning → known`, references the journey: *"You used to need fingers for this. Now it feels quick."*
- **Persistence amplification** on wrong answers: *"Let's look at it again — this is the hard part before it gets easy."*

---

## 5. System Overview

Four horizontal layers with a hard boundary between layer ② and ③:

```
┌─────────────────────────────────────────────────────────────┐
│ ① User Shell                                                │
│   ExpeditionMode · FreeBuildMode · FieldJournal · ParentZone│
└─────────────────────────────────────────────────────────────┘
                    ↓ events / content pulls
┌─────────────────────────────────────────────────────────────┐
│ ② Subject Packs (pluggable)                                 │
│   MathPack (V1) · ReadingPack (V1.5) · SpellingPack (V2)    │
└─────────────────────────────────────────────────────────────┘
                    ↓ skill state reads/writes
┌─────────────────────────────────────────────────────────────┐
│ ③ Learning Engine (subject-agnostic brain)                  │
│   SkillGraph · SessionPlanner · MasteryTracker ·            │
│   SpacedReview · AdaptiveDifficulty · InterestMixer ·       │
│   VirtueDetector · NarratorHooks · EventBus                 │
└─────────────────────────────────────────────────────────────┘
                    ↓ persistence
┌─────────────────────────────────────────────────────────────┐
│ ④ Data (Supabase)                                           │
│   Auth · Skills+Items · Progress · WorldState · Authoring · │
│   Storage (TTS)                                             │
└─────────────────────────────────────────────────────────────┘
```

**Crucial boundary: layer ③ never mentions cats, ants, or gardens.** It emits neutral events. Layer ① translates: `skill.state_changed → mastered` becomes "Luna purrs, the butterfly bush grew a flower, journal page unlocks." This separation is what makes the system growable.

### Architectural commitments

- **Packs import at build-time**, not runtime plugins (no dynamic loading complexity)
- **Engine is pure TypeScript**, no React, no Supabase — fully unit-testable in isolation
- **All cross-layer communication via event bus** — engine never reads shell state, shell never reads engine internals
- **Graceful degradation** — if garden art isn't ready, the engine still works; she can still learn with a minimalist reward view
- **Multi-learner from day one** — schema scopes everything to `(parent_id, learner_id)`

---

## 6. Data Model (Supabase)

Five regions with clear ownership. All user-data tables carry `parent_id` or `learner_id`; RLS scopes reads/writes to the authenticated parent's associated learners.

### Region ① — Identity

```sql
create table parent (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table learner (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parent(id) on delete cascade,
  first_name text not null,
  avatar_key text,                   -- seed key for avatar illustration
  birthday date,
  onboarding_level jsonb,            -- initial skill placement per subject
  created_at timestamptz default now()
);

create index on learner(parent_id);
```

### Region ② — Content (packs)

```sql
create table subject (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,         -- 'math', 'reading', 'spelling'
  name text not null,
  pack_version text not null,
  active boolean default true
);

create table strand (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subject(id),
  code text not null,
  name text not null,
  sort_order int,
  unique (subject_id, code)
);

create table skill (
  id uuid primary key default gen_random_uuid(),
  strand_id uuid references strand(id),
  code text unique not null,         -- e.g. 'math.add.within_20.crossing_ten'
  name text not null,
  description text,
  level numeric,                     -- 0.0-1.0 difficulty estimate
  prereq_skill_codes text[] default '{}',
  curriculum_refs jsonb,             -- {"ccss": "1.OA.C.6"}
  theme_tags text[] default '{}',    -- ['arrays','insect-line']
  sort_order int
);

create index on skill(strand_id);

create table item (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill(id),
  type text not null,                -- 'NumberBonds', 'ArrayBuilder', etc.
  content jsonb not null,            -- pack-defined shape
  answer jsonb not null,
  audio_url text,                    -- pre-generated TTS
  difficulty_elo int default 1000,
  generated_by text,                 -- 'claude' | 'parent' | 'seed'
  generated_at timestamptz default now(),
  approved_at timestamptz,           -- NULL = in staging
  approved_by uuid references parent(id),
  quality_score numeric,
  usage_count int default 0,
  last_served_at timestamptz
);

create index on item(skill_id) where approved_at is not null;
create index on item(skill_id, difficulty_elo) where approved_at is not null;
```

### Region ③ — Progress & Sessions

```sql
create table session (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  mode text not null,                -- 'expedition' | 'free_build'
  subject_planned text,
  skill_planned text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  items_attempted int default 0,
  items_correct int default 0,
  ended_reason text                  -- 'completed' | 'user_stopped' | 'soft_timeout'
);

create index on session(learner_id, started_at desc);

create table attempt (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references session(id) on delete cascade,
  item_id uuid references item(id),
  outcome text not null,             -- 'correct' | 'incorrect' | 'skipped'
  response jsonb,                    -- may be hashed/truncated for privacy
  time_ms int,
  retry_count int default 0,
  attempted_at timestamptz default now()
);

create index on attempt(session_id);
create index on attempt(item_id, attempted_at desc);

create table skill_progress (
  learner_id uuid references learner(id) on delete cascade,
  skill_id uuid references skill(id),
  mastery_state text default 'new', -- new | learning | review | mastered
  leitner_box int default 1,        -- 1-5
  student_elo int default 1000,
  streak_correct int default 0,
  total_attempts int default 0,
  total_correct int default 0,
  first_introduced_at timestamptz default now(),
  last_attempted_at timestamptz,
  next_review_at timestamptz,
  state_transitions jsonb default '[]',  -- audit trail for narrator
  primary key (learner_id, skill_id)
);

create index on skill_progress(learner_id, next_review_at)
  where next_review_at is not null;
```

### Region ④ — World State

```sql
create table world_state (
  learner_id uuid primary key references learner(id) on delete cascade,
  garden jsonb not null default '{"grid":{"rows":12,"cols":18},"tiles":[],"plants":[],"decor":[]}',
  cat_companion jsonb default '{"name":null,"breed":"calico","mood":"content","position":{"x":8,"y":10}}',
  season text default 'spring',
  day_phase text default 'day',      -- 'dawn' | 'day' | 'dusk' | 'night'
  last_updated_at timestamptz default now()
);

-- Content tables (seeded from JSON on deploy)
create table habitat_type (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,         -- 'ant_hill', 'butterfly_bush', etc.
  name text not null,
  description text,
  attracts_species_codes text[],
  prereq_skill_codes text[],         -- unlock gate
  illustration_key text
);

create table species (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  common_name text not null,
  scientific_name text,
  description text,
  fun_fact text,
  illustration_key text,
  habitat_req_codes text[]           -- AND within the array, OR across if multiple rows
);

-- User installations
create table habitat (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  habitat_type_id uuid references habitat_type(id),
  position jsonb,                    -- {x, y} grid coords
  state text default 'healthy',
  installed_at timestamptz default now()
);

create table journal_entry (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  species_id uuid references species(id),
  discovered_at timestamptz default now(),
  triggered_by_session_id uuid references session(id),
  unique (learner_id, species_id)
);

create table virtue_gem (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  virtue text not null,              -- 'persistence'|'curiosity'|'noticing'|'care'|'practice'|'courage'|'wondering'
  evidence jsonb not null,           -- {item_id, session_id, narrative_text, observed_at}
  granted_at timestamptz default now()
);

create index on virtue_gem(learner_id, virtue);
create index on virtue_gem(learner_id, granted_at desc);
```

### Region ⑤ — Authoring & Generation

```sql
create table authored_content (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parent(id) on delete cascade,
  target_skill_code text,
  kind text not null,                -- 'word_list' | 'math_problems' | 'topic'
  content jsonb not null,
  status text default 'processing',  -- processing | live | error
  created_at timestamptz default now()
);

create table generation_job (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill(id),
  requested_at timestamptz default now(),
  completed_at timestamptz,
  status text,                       -- 'queued'|'running'|'done'|'error'
  items_generated int default 0,
  items_passed_critic int default 0,
  critic_scores numeric[],
  cost_usd numeric,
  error_message text
);

create index on generation_job(status, requested_at) where status != 'done';

create table tts_cache (
  text_hash text primary key,
  text text not null,
  voice_id text not null,
  audio_url text not null,
  duration_ms int,
  generated_at timestamptz default now()
);
```

### RLS Policies

```sql
-- Parent can only see their own rows across all user tables
alter table learner enable row level security;
create policy "learners accessible to parent"
  on learner for all using (parent_id = auth.uid());

alter table session enable row level security;
create policy "sessions accessible to parent"
  on session for all using (
    learner_id in (select id from learner where parent_id = auth.uid())
  );

-- Repeat for: attempt, skill_progress, world_state, habitat, journal_entry,
-- virtue_gem, authored_content. Same pattern.

-- Content tables are public-read
alter table subject enable row level security;
create policy "subjects public read" on subject for select using (true);
-- Same for strand, skill, item, habitat_type, species.
```

### Design notes

- **Skill identified by `code`** (human-readable), rows also have UUIDs for FK. Codes appear in logs, prereqs, pack definitions.
- **`jsonb` for flexible shapes** (item content, garden state, Luna mood) — these evolve and tight columns would force weekly migrations.
- **`attempt.response` can be hashed/truncated** — user agreed; full responses aren't needed for future analysis.
- **No soft deletes in V1** — single-family scale, simpler.
- **`virtue_gem.evidence` carries the narrative text** — the shell's specific-moment language.

---

## 7. Learning Engine

Subject-agnostic. No React. Pure TypeScript. Testable in isolation. Emits neutral events consumed by the shell.

### 7.1 Skill Graph
DAG of skills per pack. State per `(learner, skill)` lives in `skill_progress`. Engine exposes:
- `getReadySkills(learnerId, packId)` → skills whose prereqs are met and not mastered
- `getDueReviews(learnerId, before?: Date)` → rows where `next_review_at <= now()`
- `getProgressSummary(learnerId, packId)` → counts per mastery state

### 7.2 Session Planner
At session start, generates **2-3 candidate expeditions** using:
- **Subject balance** — days since last practiced per subject
- **Due reviews** — overdue Leitner items prioritized
- **Readiness** — prereqs met
- **Interest bias** — theme tags from recent world actions boost matching skills

Each candidate comes with:
- An expedition **title** (pack-provided, themed — "Ants in Rows")
- A **skill code** targeted
- A **gentle hint** of the underlying skill for the parent ("counting arrays — multiplication")
- An estimated item count (5-8) + estimated duration

After the learner picks, planner locks in items: chooses 5-8 items around her student-Elo band, prioritizing recent-review eligibles, with one "stretch" item slightly above her band.

**Subject-balance guard:** if she picks the same subject 4+ days in a row, the planner surfaces an alternative with a slightly richer visual treatment (a card edge-glow, not a block) — a gentle nudge, never a forced rotation.

### 7.3 Mastery Tracker
States: `new → learning → review → mastered`. Transitions:
- `new → learning` on first attempt
- `learning → review` on 3-correct streak *within* a single session
- `review → mastered` on a correct response in a *later* session (overnight-consolidation rule)
- Any state ← back one notch on a wrong answer when the student-Elo is within ±100 of item-Elo (prevents "lucky guess" and "careless miss" from triggering giant moves)

Child never sees these states. Shell maps them to kid-friendly phrasing.

### 7.4 Spaced Review (Leitner 5-box)
- Box 1 (new): review within the same session + next session
- Box 2: next day
- Box 3: +2 days
- Box 4: +4 days
- Box 5: +7 days ("consolidated")
- Correct → promote one box
- Wrong → drop one box (not back to 1 — too punishing for a 6-year-old)

`ts-fsrs` is installed dormant. Swap once item library exceeds ~500 items (scheduled for V2+).

### 7.5 Adaptive Difficulty (Elo per item)
- Each item has a difficulty rating (starts at 1000, K=32)
- Student has an implicit rating per skill, emerging from outcomes
- Planner selects items in a band of ±150 around student rating, with one stretch item at +200
- **Asymmetric hysteresis**: up-adjust requires 2 consecutive strong sessions; down-adjust fires on 1 weak session. Frustration > boredom at this age.

```typescript
function updateElo(itemRating: number, studentRating: number, correct: boolean, k = 32) {
  const expected = 1 / (1 + Math.pow(10, (itemRating - studentRating) / 400));
  const actual = correct ? 1 : 0;
  return {
    newItemRating: itemRating + k * (expected - actual),
    newStudentRating: studentRating + k * (actual - expected),
  };
}
```

### 7.6 Interest Signal Mixer (the Reggio piece)

World actions emit `interest.signal` events with theme tags:
- Built frog pond → tags: `water`, `amphibian`, `pond`
- Named Luna → tags: `cat`, `companion`
- Placed ant colony → tags: `insect`, `arrays`, `lines`
- Lingered on a journal entry → tags from that entry

Tags decay over 2-3 sessions (multiplicative decay factor 0.6 per session). Planner biases candidate expeditions toward high-tag skills/items. The engine can't author new content in response to her interests, but it can surface what's already in the item bank that thematically fits.

### 7.7 Virtue Detector

Passive observer on the event stream. Detection rules:

| Virtue | Trigger |
|---|---|
| **Persistence** | 2+ retry attempts on same item in a session, eventually correct |
| **Practice** | Correct response on a spaced-review visit (she returned to something) |
| **Curiosity** | Voluntarily opened a journal entry or tapped an ambient fact |
| **Noticing** | Answer demonstrates pattern recognition (e.g., used skip-counting on an array) |
| **Care** | Tended the garden (watered, fed Luna) without a prompt |
| **Courage** | Attempted an item in a skill marked `new` for her |
| **Wondering** | Used the "❓ why?" button during a lesson |

Fires `virtue.observed` with `{ virtue, evidence: { item_id, session_id, narrative_text, observed_at } }`. Shell translates to a naturalist gem grant with the specific-moment language.

**Gem sensitivity default:** target ~2 per session rolling 7-day average. Auto-calibration: thresholds soften below 1/session average, tighten above 3. Parent override slider in Settings.

### 7.8 Narrator Hooks (growth-mindset moments)

Before the shell renders a session-end screen, the engine computes:
- Any skill that moved `review → mastered` this session → "remember when this felt hard?" moment
- Any skill with ≥3 weeks of attempts just successfully reviewed → "you used to need fingers for this" moment
- Any streak of persistent retries → "practice IS making it easier" moment

Emitted as `narrator.moment` with structured payload the shell localizes.

### 7.9 Event Bus

Single source of truth between engine and shell. Events are typed plain objects:

```typescript
type EngineEvent =
  | { type: 'item.attempted'; sessionId: string; itemId: string; skillCode: string; outcome: 'correct'|'incorrect'|'skipped'; retries: number; timeMs: number }
  | { type: 'skill.state_changed'; skillCode: string; from: MasteryState; to: MasteryState }
  | { type: 'skill.due_for_review'; skillCode: string; overdueMs: number }
  | { type: 'session.completed'; sessionId: string; stats: SessionStats }
  | { type: 'virtue.observed'; virtue: VirtueName; evidence: VirtueEvidence }
  | { type: 'interest.signal'; tags: string[]; source: 'world'|'journal'|'habitat' }
  | { type: 'difficulty.adapted'; skillCode: string; direction: 'up'|'down' }
  | { type: 'narrator.moment'; kind: NarratorKind; payload: NarratorPayload };
```

Shell never reads engine state directly. Everything flows through events.

### 7.10 What the engine deliberately does NOT do
- Decide reward visuals (shell's job)
- Know subject-specific content (pack's job)
- Enforce time limits / screen-time guardrails (no such feature)
- Show progress bars or scores (none)
- Gate content behind "level X unlocks" (gated by skill prereqs, not levels)

---

## 8. Subject Pack Contract

Every pack implements a common TypeScript interface. The implementation is a directory, not a class.

```typescript
export interface SubjectPack {
  id: string;                              // 'math' | 'reading' | 'spelling'
  name: string;
  packVersion: string;                     // semver

  strands: StrandDefinition[];
  skills: SkillDefinition[];
  itemTypes: ItemTypeRegistry;

  generateItems(
    skill: SkillDefinition,
    difficultyBand: DifficultyBand,
    count: number,
    themeHints?: string[]
  ): Promise<ItemDraft[]>;

  renderItem(item: Item, ctx: LessonContext): ReactNode;

  scoreResponse(item: Item, response: Response): Outcome;

  getPromptText(item: Item): string;       // fed to TTS

  skillThemeTags(skillCode: string): string[];
}
```

### Math Pack (V1 — the reference implementation)

**Directory layout:**
```
lib/packs/math/
├── index.ts                    # exports MathPack: SubjectPack
├── skills.ts                   # 30-40 skills w/ prereqs + CCSS refs
├── strands.ts                  # 6 strands from curriculum research
├── generation/
│   ├── add-within-20.ts
│   ├── subtract-within-20.ts
│   ├── place-value.ts
│   ├── skip-counting.ts
│   ├── arrays-multiplication.ts
│   └── shared-prompts.ts       # few-shot examples + JSON schema
├── rendering/
│   ├── CountingTiles.tsx
│   ├── NumberBonds.tsx
│   ├── EquationTap.tsx
│   ├── ArrayBuilder.tsx
│   ├── SkipCountSequence.tsx
│   ├── NumberCompare.tsx
│   ├── PlaceValueSplit.tsx
│   ├── NumberLineMarker.tsx
│   ├── DrawAnswer.tsx
│   ├── SpeakAnswer.tsx
│   ├── WordProblemBuilder.tsx
│   ├── FactFamilyMatch.tsx
│   └── EqualGroupsPartitioner.tsx
├── scoring.ts                  # pure scorers per item type
├── themes.ts                   # skill → theme tags map
└── test/
```

**Strands** (from CCSS Grade 1 + early Grade 2 stretch):
1. Counting & Cardinality
2. Operations & Algebraic Thinking (add/subtract within 20)
3. Number & Operations in Base Ten (place value, comparison, 2-digit ops)
4. Measurement & Data (time, money, graphs)
5. Geometry (shapes, partitioning)
6. Multiplication Concepts (arrays, equal groups — the stretch)

**Skill starter set (~35 skills):**
- `math.counting.to_50`, `math.counting.to_120`
- `math.counting.skip_2s`, `skip_5s`, `skip_10s`
- `math.add.within_10`, `math.add.within_20.no_crossing`, `math.add.within_20.crossing_ten`, `math.add.2digit_plus_1digit`
- `math.subtract.within_10`, `math.subtract.within_20.no_crossing`, `math.subtract.within_20.crossing_ten`
- `math.fact_family.within_10`, `math.fact_family.within_20`
- `math.placevalue.tens_ones`, `math.placevalue.compare_2digit`, `math.placevalue.add_tens`
- `math.multiply.equal_groups`, `math.multiply.arrays`, `math.multiply.skip_count_bridge`, `math.multiply.table_2s`, `math.multiply.table_5s`, `math.multiply.table_10s`
- `math.measure.compare_length`, `math.measure.time_to_hour`, `math.measure.time_to_half_hour`, `math.measure.money_coin_id`
- `math.geometry.2d_shapes`, `math.geometry.partition_halves_fourths`
- `math.word_problem.add_within_20`, `math.word_problem.subtract_within_20`, `math.word_problem.equal_groups`

Each has CCSS refs in `curriculum_refs` + theme tags.

**V1 Math item types — 13 total:**
1. **CountingTiles** — tap visible objects to count
2. **NumberBonds** — part-part-whole (Singapore Math foundation)
3. **EquationTap** — 3-4 choice picker (fallback, used sparingly)
4. **ArrayBuilder** — drag tiles into rows × cols
5. **SkipCountSequence** — tap missing number in a sequence
6. **NumberCompare** — drag `<` `>` `=` between two numbers
7. **PlaceValueSplit** — drag to split 47 into 4 tens + 7 ones
8. **NumberLineMarker** — slide a marker on a number line
9. **DrawAnswer** — finger-draw a digit (100-languages principle)
10. **SpeakAnswer** — voice input via mic (opt-in, off by default)
11. **WordProblemBuilder** — translate word problem → equation
12. **FactFamilyMatch** — given `3+4=7`, build the other three facts
13. **EqualGroupsPartitioner** — "share 12 carrots among 3 bunnies"

### Reading Pack (V1.5 preview — fast-follow, separate spec)

Item types to plan for:
- **PhonemeBlend** — tap letter tiles in order to blend
- **SightWordTap** — tap target among distractors
- **DigraphSort** — drag pictures into buckets (ch/sh/th/wh)
- **DecodablePassage** — read, tap words as you go
- **TraceLetter** — finger-trace letters (handwriting foundation)
- **ReadAloudMic** — read passage aloud, ASR scores accuracy
- **ComprehensionQ** — short question after a passage

Grounded in Orton-Gillingham scope-and-sequence, Dolch/Fry sight word lists.

### Spelling Pack (V2 preview — separate spec)

Encoding mirrors reading's decoding sequence. Item types:
- **LetterTileSpell** — drag tiles to spell
- **TypeToSpell** — keyboard typing (teaches typing as byproduct)
- **DictationCapture** — voice dictation with visual word-build

---

## 9. Content Generation Pipeline

7-step flow, nightly. Parent authoring enters at step 3.

### 9.1 The flow

1. **Nightly cron scans** (Vercel Cron, 2am local) for skills whose approved-item count per difficulty band is below threshold (default 20).
2. **Claude generates** a batch (10 items) per queued skill. System prompt: curriculum scope + reading level + pack constraints. Few-shot examples (3-5) prime shape. JSON-schema tool use prevents prose parsing. Model: `claude-sonnet-4-6` with prompt caching on system prompt.
3. **Programmatic validation** — syllable count, numeric range, profanity blocklist, required fields, answer-in-choices, JSON schema. Fast, cheap.
4. **Critic pass** — second Claude call rates 1-5 on age + curriculum fit. Batched (10 items per call). Rejects < 4; thresholds at ≥ 4.5 for auto-approve.
5. **Staging queue** — surviving items sit with `approved_at = NULL`.
   - **Weeks 1-2:** all items require manual parent approval.
   - **Week 3+:** items ≥ 4.5 auto-approve, 4.0-4.4 go to quick-look queue, < 4 rejected.
   - **Parent-authored items always skip critic**, go live in ~30s.
6. **TTS synthesis** — approved items' prompt text → ElevenLabs → MP3 in Supabase Storage, keyed by `hash(text)`.
7. **Live** — session planner eligible.

### 9.2 Sample generation prompt (Math, add within 20 crossing ten)

```
SYSTEM:
You are generating math practice items for a U.S. first grader reading at Fountas & Pinnell Level E/F.
Target skill: math.add.within_20.crossing_ten (CCSS.1.OA.C.6)
The learner benefits from Singapore Math number bonds and the "make 10" strategy.
Generate items via the emit_item tool.

Constraints (STRICT):
- No currency, scores, or competitive language
- Word problems may reference nature (ants, bees, flowers, frogs, etc.)
- No "good job!" or praise — feedback-text fields describe WHAT the learner did
- Distractors must be plausible near-miss values
- Make-10 strategy reference when applicable in feedback

USER: Generate 10 items. Theme hints: [ants, arrays]. Difficulty band: 1000-1150 Elo.
```

### 9.3 LLM provider abstraction

```typescript
export interface LLMProvider {
  id: 'anthropic' | 'ollama' | 'openai';
  generate<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    schema: ZodSchema<T>;            // tool-use schema
    examples?: Array<{ role: 'user'|'assistant'; content: string }>;
    maxTokens?: number;
    cacheSystemPrompt?: boolean;
  }): Promise<T>;
}
```

Selected via `LLM_PROVIDER` env var. Claude primary, Ollama/OpenAI swap path for later.

### 9.4 Parent authoring

Three forms:
- **Word list:** paste words, one per line. System detects format (CVC, sight words, multi-syllable), infers target skill or asks once, expands into item variants (spell-it, hear-it, sentence-use).
- **Math problems:** paste `3+5=`, `12-7=`, `4×3=`. System creates items with optional nature-themed word-problem variants via AI.
- **Topic authoring:** prompt like *"Cosmos flowers and their pollinators"* → AI generates themed items across multiple skills. Enters normal approval queue.

Parent-authored items are rank-boosted in session selection so they surface quickly.

### 9.5 Budget & observability

- Gen (Sonnet 4.6, cached): ~$3-6/month
- Critic (batched): ~$3-5/month
- TTS (cached): ~$2-4/month after month 1
- **Total: ~$10-15/month steady state**

`generation_job` table tracks every run: `items_generated`, `items_passed_critic`, `critic_scores[]`, `cost_usd`. Parent dashboard "content health" widget surfaces buffer-weeks-remaining, last-run status, and monthly spend.

### 9.6 Emergency controls

- `CONTENT_GEN_ENABLED=false` env — cron becomes no-op
- Settings toggle: flip all generated content into manual review
- Monthly spend cap via `MONTHLY_SPEND_CAP_USD` with email alert

### 9.7 Failure modes

- Claude occasionally produces wrong-answered items → critic catches most; runtime flag fires if a just-generated item trends >70% wrong
- Vocabulary drift → monthly 20-item human sample; tighten critic prompt if detected
- Cron outage → 6-week item buffer absorbs

---

## 10. World State Model

Six regions with clear ownership.

### 10.1 Garden
- 12×18 grid sized for iPad
- Layers: terrain (grass/path/water/soil), structures (habitats, logs, rocks), plants, decor, ambient animals
- Season and day/night cycle slow — real week = app day-night cycle, real month ≈ season shift
- Stored as `world_state.garden` jsonb

### 10.2 Luna (cat companion)
- Named by learner on first run
- Mood ∈ {content, curious, sleepy, playful} — **never negative** (no sad-cat anxiety)
- Wanders, reacts to touch, responds to learning events (purrs on practice moments)
- Stored as `world_state.cat_companion` jsonb

### 10.3 Habitats (V1 — 6)

| Habitat | Unlocks after | Attracts |
|---|---|---|
| Ant Hill | `math.counting.to_50` mastered | Leafcutter ant, Carpenter ant |
| Butterfly Bush | `math.multiply.arrays` reached review | Monarch (+ milkweed), Swallowtail, Skipper |
| Bee Hotel | `math.add.within_20.crossing_ten` mastered | Mason bee, Honey bee, Bumble bee |
| Frog Pond | `math.placevalue.tens_ones` mastered | Tree frog, Spring peeper |
| Bunny Burrow | `math.subtract.within_20.crossing_ten` mastered | Cottontail rabbit |
| Log Pile | `math.counting.skip_5s` mastered | Ladybug, Centipede, Fire-belly newt |

**Habitats unlock via skill progression, never purchase.** Placement is free (drag from builder tray).

### 10.4 Species catalog (V1 — ~18)

Real organisms with real facts. Some require combinations:
- **Monarch** requires Butterfly Bush + Milkweed plant (real biology!)
- **Bumble bee** requires Bee Hotel + Wildflower Patch (V1.5 habitat)
- Others single-habitat: Leafcutter ant needs Ant Hill, etc.

### 10.5 Field Journal
- Pages auto-unlock on species arrival
- Each page: illustration + common + scientific name + real fun fact + date discovered
- Tappable for read-aloud
- Child can revisit anytime
- Tapping journal = Curiosity virtue signal

### 10.6 Virtue Gems

7 virtues:
- 💎 **Persistence**
- 🔍 **Curiosity**
- 👁️ **Noticing**
- 💗 **Care**
- 🔁 **Practice**
- 🦁 **Courage**
- ❓ **Wondering**

Accumulate forever, never spent. Each gem carries the specific-moment evidence: *"Tuesday, crossing-ten felt tricky three times — then clicked."*

### 10.7 Discoveries (one-time milestones)
- "First ant seen"
- "Luna purred for the first time"
- "Built 3 habitats"
- "Found a full fact family"

Less frequent than gems; milestone-flavored, still observational ("found"/"built"/"noticed"), never scored.

### 10.8 Event → World mapping (shell translator)

| Engine event | World result |
|---|---|
| `skill.state_changed → mastered` + skill is a habitat prereq | Habitat appears in builder; narrator moment fires |
| `skill.state_changed → review` (3-streak in session) | Luna purrs, small ambient animation |
| `virtue.observed` | Grant gem with evidence-specific narrative |
| `interest.signal` | Tag bias in next-session planner; matching residents become more active in ambient loop |
| `narrator.moment` | Scripted growth-mindset scene on session-end |
| `session.completed` | Weekly documentation accumulates |
| `habitat.placed_by_child` | Eligible species may arrive over next 1-2 sessions (not instant — preserves magic) |

### 10.9 Habitat → species puzzle

When she places a habitat:
1. System queues eligible arrivals per catalog match
2. One or two arrive over next 1-2 sessions (waiting is delightful)
3. On arrival: soft animation, journal page unlocks, Luna notices
4. Combos (Monarch needs milkweed + butterfly bush) create emergent goals — biology learned as side effect

### 10.10 Exclusions from V1

- No weather system
- Single garden (no multi-scene)
- No NPC dialogue trees
- No trades / gifts / multiplayer
- No breeding / evolution
- No Luna outfits or breed collection (ever)

### 10.11 Persistence
- Garden state writes on every mutation
- Optimistic UI — animation first, Supabase write in background, reconcile on failure
- Catalog tables read-only, seeded from `lib/world/seed/*.json` at deploy

---

## 11. Session Flow

Five screens. iPad-first. Naturalist palette (see Section 13). Wireframes are in `.superpowers/brainstorm/` for reference.

### 11.1 Screen 1 — Home (app open)

**NEW: profile picker at the top of the home flow**
- Device-trusted: after initial parent magic-link auth on this device, subsequent opens bypass auth and show profile picker
- Profile tiles: `[🌸 Cecily] [+ Add (Esme)]`
- Tapping a profile enters that learner's session context (all queries scoped to her `learner_id`)
- Top-right gear ⚙️ → Parent Zone (requires auth re-challenge if session > 7 days old)

After profile pick:
- Garden preview (her current state)
- Luna greets with her assigned name
- Two buttons: `🔍 Start exploring` or `🌿 Just visit garden`

**Deliberately missing:** streak counter, "days in a row", XP, level, daily goal progress bar.

### 11.2 Screen 2 — Expedition picker

- **Three themed cards.** Each shows a nature theme + gentle skill hint
- She picks one — **choice is real**
- Planner ensures weekly subject balance in background
- If same subject 4+ days running: gentle visual nudge toward alternative, never a block

### 11.3 Screen 3 — Lesson frame

One item at a time:
- Top-left: expedition breadcrumb
- Top-right: 🔊 re-narrate, ❓ Wondering button (tap = Wondering gem evidence)
- Big question text (auto-narrated on show)
- Big visual (the actual ants, tiles, number line, etc.)
- Response area matches item type

**On correct:** specific observational feedback ("you counted three rows of four"), short micro-animation (no fanfare), next item.

**On incorrect:** "Let's look at it again," optional hint on tap. Retry available.

**Retry / hint escalation:**
1. First wrong: *"Let's look at it again"* + re-narrate prompt
2. Second wrong: scaffolded hint (number-line highlight, array row separators)
3. Third wrong: step through the answer together, mark reviewed, move on (no lingering)

### 11.4 Screen 4 — Session-end documentation

The Kohn/Reggio screen. Replaces "X% correct / You scored Y."

Lists:
- **What she noticed** (concrete observations: "you counted ants as 3 rows of 4 — that's an array")
- **Virtue gems earned** with evidence ("Persistence gem — you came back to 8+5 three times, then it clicked")
- **Narrator moments** ("Remember when crossing-ten felt tricky? It's a little easier today.")
- **New species / discoveries** that arrived

Two soft exit buttons: `🌿 Build in the garden` or `📖 Read the journal`. **No "Continue to next level!"** — she decides when done.

### 11.5 Screen 5 — Free-build mode

Garden full-screen with habitat tray at bottom:
- Tap unlocked habitat → drag to grid → place
- Species arrive over 1-2 sessions (not instant)
- Luna wanders; tap for purr + ambient fact
- Tap any plant for a quiet fact whisper
- Gray/dashed tiles = not-yet-unlocked habitats with prereq named softly ("practice place value to unlock Frog Pond") — **information, not pressure**

### 11.6 Audio narration rules

- Prompt text auto-narrates on load (once); 🔊 to replay
- Feedback narrates on response
- Ambient facts whisper (lower volume than prompts)
- Parent zone has NO narration — keyboard-first
- All TTS is pre-generated MP3 (no runtime latency)

### 11.7 Response modes per item type

- **Tap-to-choose** (EquationTap, NumberCompare)
- **Drag** (ArrayBuilder, NumberBonds, PlaceValueSplit, EqualGroupsPartitioner) via `@dnd-kit`
- **Slide** (NumberLineMarker)
- **Tap-count** (CountingTiles)
- **Trace/draw** (DrawAnswer) — finger path, simple digit recognition
- **Speak** (SpeakAnswer) — Web Speech API; opt-in, off by default

### 11.8 Pacing

- Target 5-8 items per expedition → 6-10 min
- Planner targets `time_est_ms` per item based on historic data
- >90 seconds without response → gentle scaffolding appears
- 3+ min idle → session soft-pauses; resumes on return
- Session soft-ends at 18 min: *"we've been exploring for a while — want to save the rest for tomorrow?"*

### 11.9 Deliberately excluded interactions
- No confetti on correct (too-high dopamine spike per Kohn)
- No streak displays
- No XP / points counters
- No "level unlocked!" modals
- No avatars / outfits / dress-up
- No leaderboards — single-player, period

---

## 12. Parent Dashboard & Authoring

Separate URL (`/parent`). Separate layout and theme (neutral SaaS, not naturalist). Signed-in gate via Supabase magic-link.

### 12.1 Tabs

**This Week (default landing):**
- KPIs: sessions this week, durations, subject balance bar, items attempted, correctness %
- Skill mastery heat map (mastered / review / learning / not started) per active pack
- Weekly narrative digest (AI-generated from event stream, cached once per week)
- Content health widget (buffer weeks, monthly spend, last cron status, "approve all" shortcut)
- Alerts (stuck skills, unusual patterns — low-stakes language)

**Family:** (NEW — for multi-learner)
- List of learners (Cecily, Esme, +Add)
- Per-learner: name, avatar key, birthday, current pack set, onboarding level
- Add Learner button: first name + avatar pick, 10-second form

**Skills:**
- Full expandable tree across active packs
- Per-skill: mastery state, Leitner box, attempts, correctness %, student-Elo, last attempt, item bank size
- Filter: "weak", "mastered this month", "needs review", "no items in bank"
- Drill-in: every attempt + available items per skill

**Content:**
- Compose box (word list / math / topic)
- Approval queue with per-item ✓/✎/✕ buttons + "Approve all (N)" bulk action
- Item explorer — every live item, filterable, editable

**History:**
- Session log with per-item attempt drill-downs
- Skill-level timeline
- CSV export

**Settings:**
- TTS voice & speed, auto-narrate toggle
- Content: critic threshold, auto-approve threshold, emergency-stop toggle
- LLM provider selector (Anthropic / Ollama / OpenAI-compat)
- Monthly spend cap + alert email
- Gem sensitivity slider (default: auto-calibrate to ~2/session rolling avg)
- Accessibility: OpenDyslexic toggle, text size, reduced motion

### 12.2 Approval policy (explicit)

- **Weeks 1-2:** all auto-generated items require manual approval. Parent-authored items always skip critic, go live in ~30s.
- **Week 3+:** auto-approve at critic ≥ 4.5, "quick look" queue for 4.0-4.4, auto-reject < 4.0.
- **Emergency stop toggle** in Settings — flips all generated content back to manual review, survives deploys.
- **Kill switch** — `CONTENT_GEN_ENABLED=false` env var → cron no-ops.

### 12.3 Authoring UX details

- **Paste word list:**
  ```
  cat, hat, sat, mat
  the, was, said
  happy, quickly
  ```
  System detects format → infers target skill (or one-dropdown pick) → expands each word into item variants.

- **Paste math problems:**
  ```
  3+5=
  12-7=
  4×3=
  ```
  → creates items + optional AI-generated nature-themed word problems.

- **Topic authoring:** *"Cosmos flowers and their pollinators"* → AI generates themed items across multiple skills; enters normal approval queue.

- **Edit existing item:** ✎ button → JSON-lite modal → save.

### 12.4 Notifications

- Weekly email digest (optional, default on) — narrative + alerts
- Monthly spend threshold email (default $25)
- In-app "content ready" card on this-week tab
- Skill-stuck alert if same skill has >5 wrong attempts in 7 days

### 12.5 Excluded from parent dashboard

- No child-visible metrics presented as if they were for her (enforced by no-such-route)
- No social sharing
- No percentile / benchmark against other kids
- No letter grades — ever
- No analytics tracking (no Mixpanel, GA, etc.)

---

## 13. Tech Stack & UI / Accessibility

### 13.1 Library picks

| Concern | Library |
|---|---|
| Framework | `next@14` App Router, TypeScript 5, React 18 |
| Styling | `tailwindcss@3` with custom palette tokens |
| Animation | `framer-motion@11` |
| Drag/Drop | `@dnd-kit/core` |
| DB / Auth / Storage | `@supabase/ssr` |
| LLM | `@anthropic-ai/sdk` (behind LLMProvider interface) |
| Spaced Rep | `ts-fsrs` (installed dormant; Leitner home-grown V1) |
| Schema Validation | `zod@3` |
| Unit Tests | `vitest` |
| E2E Tests | `playwright` (Safari emulation + real iPad manual) |
| Cron | Vercel Cron (Supabase pg_cron fallback) |
| TTS | `elevenlabs-node` |
| PWA (deferred) | `@ducanh2912/next-pwa` |

### 13.2 Folder layout

```
app/
├── (child)/              # no auth; naturalist theme
│   ├── page.tsx          # Screen 1: profile picker + home
│   ├── explore/page.tsx  # Screen 2: expedition picker
│   ├── lesson/page.tsx   # Screen 3: lesson frame
│   ├── garden/page.tsx   # Screen 5: free-build
│   └── journal/page.tsx  # field journal
├── (parent)/             # auth required; SaaS theme
│   └── parent/
│       ├── page.tsx      # This Week
│       ├── family/page.tsx
│       ├── skills/page.tsx
│       ├── content/page.tsx
│       ├── history/page.tsx
│       └── settings/page.tsx
└── api/
    ├── session/          # plan, start, attempt, end
    ├── gen/              # nightly content gen + critic
    ├── tts/              # synthesize + cache check
    └── world/            # world state mutations

components/
├── child/
├── parent/
└── shared/

lib/
├── engine/               # subject-agnostic, pure TS
│   ├── skillGraph.ts
│   ├── sessionPlanner.ts
│   ├── masteryTracker.ts
│   ├── spacedReview.ts
│   ├── adaptiveDifficulty.ts
│   ├── interestMixer.ts
│   ├── virtueDetector.ts
│   ├── narrator.ts
│   └── eventBus.ts
├── packs/
│   ├── math/
│   ├── reading/          # V1.5
│   └── spelling/         # V2
├── llm/
│   ├── index.ts          # LLMProvider interface
│   ├── claude.ts
│   ├── ollama.ts
│   └── openai.ts
├── tts/
│   ├── elevenlabs.ts
│   └── webspeech.ts
├── world/
│   └── seed/             # habitat + species JSON
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── migrations/
└── types.ts

tests/
├── engine/
└── packs/math/
```

### 13.3 UI principles

| | Child (iPad-first) | Parent (desktop + tablet) |
|---|---|---|
| Hit target min | **60pt** with 8px spacing | 44pt |
| Body text | 24px+ | 14-16px |
| Font | Quicksand / Nunito (rounded) | SF Pro / Inter |
| Palette | Naturalist hybrid + bright accent pops | Neutral SaaS gray/blue |
| Animation | Soft 200-400ms; no celebration fanfare | Minimal (chart transitions) |
| Audio | Prompts auto-narrate | None |
| Keyboard nav | Partial | Full |

**Naturalist palette (the "warm field-guide" direction, D from brainstorm Q8):**
- Base: `#F5EBDC` cream, `#E8C493` ochre
- Green: `#95B88F` sage, `#6B8E5A` forest
- Accent pops: `#E8A87C` terracotta, `#C38D9E` rose, `#FFD93D` sun
- Text: `#6B4423` warm brown

### 13.4 iPad-specific notes

- `touch-action: manipulation` on all interactive elements (kills 300ms double-tap zoom)
- Pointer events everywhere (`onPointerDown/Up/Move`) — unified handling
- Prefer `transform` animations over `d`/`cx`/`cy` attributes (compositing vs repainting)
- Explicit `width`/`height` on inline SVGs + `viewBox` for responsive scaling
- `will-change: transform` used sparingly (iOS Safari compositor layers)
- Monitor with Safari DevTools on real iPad; emulator perf isn't reliable

### 13.5 Accessibility baseline (ship day 1)

- Audio narration on every prompt (essential for new readers)
- `prefers-reduced-motion` respected → fades instead of orchestrated motion
- **OpenDyslexic font toggle** in Settings
- High-contrast mode (palette swap, not CSS filter)
- Larger text toggle — 1.25×, 1.5× multipliers
- ARIA labels on all interactive elements
- Color contrast ≥ 4.5:1 text, 3:1 large
- No flashing, no autoplay video

### 13.6 Testing strategy

- **Unit (Vitest):** engine pure functions, pack scoring per item type, LLM provider contracts
- **Integration (Vitest + Supabase local):** full session flow, content gen pipeline
- **E2E (Playwright Safari emulation):** child golden path + parent golden path
- **Manual on real iPad:** animation smoothness, touch accuracy, audio latency — before every release

### 13.7 Env variables

```
# Supabase (new project)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434

# TTS
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM   # Rachel (warm female default)

# Content gen controls
CONTENT_GEN_ENABLED=true
CRITIC_AUTO_APPROVE_THRESHOLD=4.5
MONTHLY_SPEND_CAP_USD=25

# Deployment
NEXT_PUBLIC_BASE_URL=
VERCEL_CRON_SECRET=
```

---

## 14. V1 Scope, Roadmap, Definition of Done

### 14.1 V1 — "Math in the Garden"

**In:**
- Auth (parent email magic link); multi-learner profile switcher
- Supabase schema + migrations + RLS
- Habitat catalog (6) + species catalog (~18) seeded from JSON
- Child shell: home/profile picker, expedition picker, lesson frame, session-end docs, free-build garden, journal
- Parent zone: This Week, Family, Skills, Content (authoring + approval queue), History, Settings
- Learning engine — all 8 components
- Math pack (~35 skills, 13 item types, generation prompts, scoring)
- Content gen pipeline (cron, critic, TTS caching)
- LLM provider abstraction (Anthropic default)
- ElevenLabs TTS with Supabase Storage caching
- Accessibility baseline
- Virtue gems + discoveries + growth-mindset narrator
- Seed content: 2-3 weeks of approved items pre-generated on deploy

**Deferred past V1:**
- Reading pack (V1.5)
- Spelling pack (V2)
- PWA / offline (V2.5)
- Phaser arcade mini-games (V3)
- Local LLM swap evaluation (V4)

**Deferred forever (on principle):**
- Luna outfits / breed unlocks
- Analytics tracking
- Social sharing / leaderboards
- Currency economies

### 14.2 Phased roadmap

| Phase | Scope | Effort |
|---|---|---|
| V1 | Platform + Math pack + Parent zone | 6-8 weekends (at 8-10 hrs/weekend) |
| V1.5 | Reading pack | 2-3 weekends |
| V2 | Spelling pack | 2 weekends |
| V2.5 | PWA + offline | 1 weekend |
| V3 | Phaser arcade mini-games | 3-4 weekends |
| V4 | Local LLM swap | 1 weekend |
| V4+ | Science pack, sibling UX polish, weather, expanded catalog | flexible |

At 7-10 hrs/week, V1 elapsed timeline: **8-12 weeks**.

### 14.3 Definition of Done (V1)

Cecily can:
- [ ] Sign in via profile picker (no password) on the iPad
- [ ] Run a full expedition (home → pick → 5-8 items → end-doc → build) without crashes
- [ ] Have audio narration on every prompt
- [ ] See at least 3 virtue gems earned through normal play
- [ ] Unlock and place at least 3 habitats
- [ ] Have at least 2 species arrive and populate the journal

Dylan (parent) can:
- [ ] Authenticate via email magic link
- [ ] See the This Week dashboard with data
- [ ] Paste a word list or math problems, see them go live within ~1 minute
- [ ] Observe content cron running nightly; buffer > 4 weeks
- [ ] Monitor monthly spend with alert wired
- [ ] Add Esme as a second learner with a 10-second form

System:
- [ ] Accessibility baseline passes (reduced-motion fallback, OpenDyslexic toggle, contrast checks)
- [ ] No currency, no scores, no streaks visible anywhere in child UI (ESLint rule enforces forbidden strings)
- [ ] All RLS policies scope reads/writes correctly across multi-learner schema
- [ ] ≥ 80% critic-pass rate on generated items over 2 weeks of real data

---

## 15. Decisions Resolved (from brainstorm)

| # | Decision | Value |
|---|---|---|
| 1 | Primary learner name | Cecily |
| 2 | Multi-learner support | Yes — Esme fast-follow via Family tab |
| 3 | Vercel project | New: **GardenQuestSchool** |
| 4 | Supabase project | New (separate from genetic-variants-portal) |
| 5 | Parent auth | Email magic link (simplest) |
| 6 | Learner auth | Trusted device, profile-tile tap (no password) |
| 7 | TTS voice default | ElevenLabs Rachel (env-swappable) |
| 8 | Seed content strategy | AI-generated + critic-approved |
| 9 | Parent approval gate | Manual wks 1-2; auto ≥4.5 from wk 3 |
| 10 | Gem sensitivity default | Auto-calibrate to ~2/session rolling avg |
| 11 | Weekly time budget | 7-10 hrs/week (8-12 week V1 elapsed) |
| 12 | Subject priority order | Math (V1) → Reading (V1.5) → Spelling (V2) |

---

## 16. Open Questions (non-blocking — decide at implementation time)

1. **Custom domain** — `gardenquestschool.dcb.dev` or Vercel subdomain?
2. **Illustration style** — hand-crafted SVG assets vs AI-generated (Stable Diffusion / Midjourney) vs a mix?
3. **TTS voice experimentation** — try 2-3 ElevenLabs voices with Cecily and pick her favorite
4. **Seed content volume** — ship with 50 items per skill (conservative) or 100 (more variety early)?
5. **Weekly digest email format** — plain text vs branded HTML
6. **Backup strategy** — Supabase daily dump to Vercel Blob / personal S3?
7. **Ambient facts source** — curated human-written, AI-generated-and-reviewed, or mix?

These can be resolved as the implementation plan is written or during the build.

---

## 17. Implementation Plan Starter Pointers

The next skill to invoke is `superpowers:writing-plans`. The plan should:

1. Start with **project scaffolding** — `create-next-app`, Supabase project provisioning, Vercel linking, env var setup
2. Build **engine + data model first**, pure TS, zero UI — because every other layer depends on it
3. Ship a **minimal Math pack** (2-3 skills, 1 item type) end-to-end before scaling breadth — proves the pack contract works
4. Add **TTS + audio narration** before launching the lesson frame
5. Build **parent zone early** (you'll need it to approve content and debug)
6. Only then: garden visual polish, habitat placement, virtue detection — the delight layer

Consider the plan in 4 epics:
- **Epic A: Foundations** (scaffold, schema, engine core, Math pack skeleton)
- **Epic B: First playable loop** (profile picker → expedition → lesson frame → session-end)
- **Epic C: Content & parent** (content gen pipeline, TTS, parent dashboard, authoring)
- **Epic D: World delight** (garden, habitats, journal, gems, narrator, accessibility polish)

---

*End of design spec.*
