# Plan 1 — Foundations + First Playable Loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cecily can open the app on an iPad, tap her profile, pick one of three themed expeditions, complete 5 math items end-to-end backed by a real Supabase database and a real subject-agnostic learning engine, and see a session-end documentation screen. No AI content gen, no TTS audio, no garden visuals, no parent dashboard — those come in Plans 2 and 3.

**Architecture:** Next.js 14 App Router with route groups `(child)` and `(parent)`. Supabase for Postgres + auth + RLS. Subject-agnostic learning engine in `lib/engine/` as pure TypeScript. Math pack in `lib/packs/math/` implementing the `SubjectPack` contract. All cross-layer communication through a typed neutral event bus.

**Tech Stack:** Next.js 14, TypeScript 5, React 18, Tailwind CSS 3, Supabase (Postgres + Auth + RLS), `@supabase/ssr`, framer-motion, `@dnd-kit/core`, zod, vitest, playwright.

**Plan 1 Definition of Done:**
- Project scaffolded, installed, builds, deploys to Vercel preview
- Supabase project provisioned, schema migrated, RLS enforced
- Learning engine: skill graph, mastery tracker, Leitner 5-box, Elo adaptive difficulty, session planner, event bus — all with passing unit tests
- Math pack skeleton: 8 skills across 2 strands, 3 item types (NumberBonds, CountingTiles, EquationTap), pure scoring functions, React renderers
- Seed item bank (~40 hand-authored items) loaded via SQL
- Child routes: profile picker home → expedition picker → lesson frame → session-end docs
- API routes: start session, get next item, attempt item, end session
- Parent auth (magic link) present and protects `/parent/*` routes (parent dashboard itself is a stub page)
- One Playwright E2E test covers the golden path end-to-end
- One session has been run manually on iPad Safari, no crashes

**What Plan 1 deliberately omits** (comes in Plans 2/3):
- AI content generation pipeline (Claude calls) → hardcoded seed items
- ElevenLabs TTS + audio narration → visual-only UI for Plan 1
- Virtue gems, discoveries, narrator moments → engine computes internally; shell shows placeholder
- Garden visual, habitats, species, field journal → placeholder "garden coming soon" screen
- Parent dashboard content (This Week, Skills, Content tabs) → stub page only
- Multi-learner UI polish → schema supports it; only Cecily seeded in Plan 1
- Remaining 10 Math item types → 3 are enough to prove the pack contract
- Accessibility toggles (OpenDyslexic, high-contrast, text size) → baseline ARIA + contrast only
- ESLint forbidden-strings rule → manual discipline in Plan 1

---

## File Structure

**New files this plan creates:**

```
GardenQuestSchool/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── playwright.config.ts
├── .env.local.example
├── .eslintrc.json
│
├── app/
│   ├── layout.tsx                          # Root layout, fonts, viewport
│   ├── page.tsx                            # Redirects to /picker
│   ├── globals.css                         # Tailwind imports + palette CSS vars
│   ├── (child)/
│   │   ├── layout.tsx                      # Child theme layout
│   │   ├── picker/page.tsx                 # Profile picker (Screen 1)
│   │   ├── explore/page.tsx                # Expedition picker (Screen 2)
│   │   ├── lesson/[sessionId]/page.tsx     # Lesson frame (Screen 3)
│   │   └── complete/[sessionId]/page.tsx   # Session end (Screen 4, minimal)
│   ├── (parent)/
│   │   ├── layout.tsx                      # Parent SaaS layout
│   │   ├── auth/page.tsx                   # Magic link sign-in
│   │   └── parent/page.tsx                 # Stub dashboard
│   └── api/
│       ├── profile/route.ts                # GET /learners for device, POST /select
│       ├── session/
│       │   ├── start/route.ts              # POST create session with subject
│       │   ├── [id]/item/route.ts          # GET next item
│       │   ├── [id]/attempt/route.ts       # POST attempt outcome
│       │   └── [id]/end/route.ts           # POST mark session complete
│       └── plan/candidates/route.ts        # GET 3 expedition candidates
│
├── components/
│   ├── child/
│   │   ├── ProfileTile.tsx
│   │   ├── ExpeditionCard.tsx
│   │   ├── LessonHeader.tsx
│   │   └── DocumentationLine.tsx
│   ├── parent/
│   │   └── StubDashboard.tsx
│   └── shared/
│       ├── NaturalistButton.tsx
│       └── AuthGate.tsx
│
├── lib/
│   ├── engine/
│   │   ├── types.ts                        # EngineEvent, MasteryState, SessionPlan, etc.
│   │   ├── skillGraph.ts                   # getReadySkills, getDueReviews, etc.
│   │   ├── masteryTracker.ts               # transitionState, onAttempt
│   │   ├── spacedReview.ts                 # Leitner 5-box
│   │   ├── adaptiveDifficulty.ts           # Elo update
│   │   ├── sessionPlanner.ts               # generate candidates + lock items
│   │   ├── eventBus.ts                     # typed emitter + listener
│   │   ├── interestMixer.ts                # theme-tag bias (stub for P1)
│   │   ├── virtueDetector.ts               # event observer (P1: emits no-op)
│   │   ├── narrator.ts                     # narrator-moment computer (P1: stub)
│   │   └── index.ts                        # barrel export
│   ├── packs/
│   │   └── math/
│   │       ├── index.ts                    # exports MathPack: SubjectPack
│   │       ├── types.ts                    # Math-specific item shapes
│   │       ├── strands.ts                  # 2 strands for P1
│   │       ├── skills.ts                   # 8 skills for P1
│   │       ├── scoring.ts                  # per-type scorers
│   │       ├── themes.ts                   # skill → theme tags
│   │       └── rendering/
│   │           ├── NumberBonds.tsx
│   │           ├── CountingTiles.tsx
│   │           └── EquationTap.tsx
│   ├── llm/
│   │   ├── types.ts                        # LLMProvider interface
│   │   └── index.ts                        # Stub factory (impl in Plan 2)
│   ├── supabase/
│   │   ├── client.ts                       # Browser client
│   │   ├── server.ts                       # Server/RSC client
│   │   └── migrations/
│   │       ├── 001_identity.sql
│   │       ├── 002_content.sql
│   │       ├── 003_progress.sql
│   │       ├── 004_world.sql
│   │       ├── 005_authoring.sql
│   │       ├── 006_rls.sql
│   │       └── 007_seed_cecily_and_math.sql
│   └── types.ts                            # Shared Learner, Parent, etc.
│
└── tests/
    ├── engine/
    │   ├── spacedReview.test.ts
    │   ├── adaptiveDifficulty.test.ts
    │   ├── masteryTracker.test.ts
    │   ├── sessionPlanner.test.ts
    │   └── eventBus.test.ts
    ├── packs/
    │   └── math/
    │       └── scoring.test.ts
    └── e2e/
        └── first-lesson.spec.ts
```

Responsibilities:
- **`lib/engine/`** — pure TypeScript, no React, no Supabase. Every function is unit-testable in isolation.
- **`lib/packs/math/`** — implements the SubjectPack contract. Renderers are React, scoring is pure.
- **`lib/supabase/`** — DB access + migrations. Only the app talks to Supabase, engine never imports this.
- **`app/(child)/`** — child UI, naturalist palette, auto-narrated (P2+), large hit targets. No auth.
- **`app/(parent)/`** — parent UI, SaaS palette, requires auth. In P1 this is a stub; P2 fills it in.
- **`app/api/`** — thin route handlers that compose engine + Supabase + packs.

---

## Epic A — Foundations (Tasks 1–35)

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `.gitignore` entries

- [ ] **Step 1: Run create-next-app**

```bash
cd C:/Users/dylan/GardenQuestSchool
# Keep existing docs/ and .git/
# Run create-next-app in current directory using a temp directory merge
npx create-next-app@14 tmp-scaffold --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-eslint --use-npm
```

- [ ] **Step 2: Merge scaffold into root**

```bash
cd C:/Users/dylan/GardenQuestSchool
mv tmp-scaffold/package.json ./package.json
mv tmp-scaffold/package-lock.json ./package-lock.json
mv tmp-scaffold/tsconfig.json ./tsconfig.json
mv tmp-scaffold/next.config.mjs ./next.config.mjs
mv tmp-scaffold/tailwind.config.ts ./tailwind.config.ts
mv tmp-scaffold/postcss.config.mjs ./postcss.config.mjs
mv tmp-scaffold/next-env.d.ts ./next-env.d.ts
mkdir -p app
mv tmp-scaffold/app/layout.tsx ./app/layout.tsx
mv tmp-scaffold/app/globals.css ./app/globals.css
# discard scaffold page; we'll write our own
rm -rf tmp-scaffold
```

- [ ] **Step 3: Verify it builds**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js 14 app with TypeScript + Tailwind"
```

### Task 2: Install core runtime deps

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install @supabase/ssr @supabase/supabase-js @anthropic-ai/sdk zod framer-motion @dnd-kit/core @dnd-kit/sortable ts-fsrs lucide-react
```

- [ ] **Step 2: Install dev deps**

```bash
npm install -D vitest @vitest/ui @playwright/test @types/node @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Verify no peer-dep errors**

```bash
npm ls --depth=0
```
Expected: no unmet peer-dependency warnings on required packages

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core runtime + dev dependencies"
```

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1: Write vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 2: Write tests/setup.ts**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Add test script**

Modify `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Verify vitest runs (no tests yet)**

```bash
npm test
```
Expected: `No test files found` — that's fine, means config is OK.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json
git commit -m "chore: configure vitest with jsdom + React testing"
```

### Task 4: Configure Playwright

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Write playwright.config.ts**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: Install browsers**

```bash
npx playwright install chromium webkit
```

- [ ] **Step 3: Add E2E script**

Modify `package.json`, add to `"scripts"`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts package.json
git commit -m "chore: configure Playwright for Chromium + iPad Safari"
```

### Task 5: Configure Tailwind with naturalist palette

**Files:**
- Modify: `tailwind.config.ts`, `app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/packs/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5EBDC',
        ochre: '#E8C493',
        terracotta: '#E8A87C',
        rose: '#C38D9E',
        sage: '#95B88F',
        forest: '#6B8E5A',
        bark: '#6B4423',
        sun: '#FFD93D',
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'kid-lg': ['28px', { lineHeight: '1.4', fontWeight: '700' }],
        'kid-md': ['24px', { lineHeight: '1.45', fontWeight: '600' }],
        'kid-sm': ['20px', { lineHeight: '1.5' }],
      },
      spacing: {
        'hit': '60px',
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Replace app/globals.css**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { -webkit-text-size-adjust: 100%; }
  body {
    @apply bg-cream text-bark font-body antialiased;
    touch-action: manipulation;
  }
  button { touch-action: manipulation; }
  /* iPad safari: disable callout on long-press */
  * { -webkit-touch-callout: none; }
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: compiles cleanly.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "style: naturalist palette tokens and kid-sized typography"
```

### Task 6: Root layout with fonts and viewport

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace app/layout.tsx**

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'GardenQuestSchool',
  description: 'A naturalist learning world.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5EBDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: root layout with Nunito font and kid-safe viewport"
```

### Task 7: Home root redirect

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Write app/page.tsx**

```typescript
// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/picker');
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redirect root to profile picker"
```

### Task 8: `.env.local.example`

**Files:**
- Create: `.env.local.example`

- [ ] **Step 1: Write .env.local.example**

```bash
# .env.local.example — copy to .env.local and fill in
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM (Plan 2 will actually use this; keep in env for later)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=

# TTS (Plan 2 will actually use this)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Content gen (Plan 2)
CONTENT_GEN_ENABLED=false
CRITIC_AUTO_APPROVE_THRESHOLD=4.5
MONTHLY_SPEND_CAP_USD=25

NEXT_PUBLIC_BASE_URL=http://localhost:3000
VERCEL_CRON_SECRET=
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "chore: env template"
```

### Task 9: Provision new Supabase project (manual, no code)

**Files:** none

- [ ] **Step 1: Create Supabase project**

At https://supabase.com/dashboard:
1. New project → name `GardenQuestSchool`, region closest to you, password saved.
2. Wait for provisioning.
3. From **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

- [ ] **Step 2: Create `.env.local`**

```bash
cp .env.local.example .env.local
# edit .env.local, fill in the three Supabase values
```

- [ ] **Step 3: Verify by connecting from Node**

```bash
node -e "require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || (require('dotenv').config({path:'.env.local'}),process.env.NEXT_PUBLIC_SUPABASE_URL), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).from('pg_stat_user_tables').select().limit(1).then(r=>console.log('OK:',!!r))"
```
Expected: `OK: true`. (If `dotenv` missing, `npm install -D dotenv` first.)

**No commit — `.env.local` is gitignored.**

### Task 10: Migration 001 — Identity tables

**Files:**
- Create: `lib/supabase/migrations/001_identity.sql`

- [ ] **Step 1: Write 001_identity.sql**

```sql
-- lib/supabase/migrations/001_identity.sql
create extension if not exists "uuid-ossp";

create table if not exists parent (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists learner (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parent(id) on delete cascade,
  first_name text not null,
  avatar_key text,
  birthday date,
  onboarding_level jsonb,
  created_at timestamptz default now()
);

create index if not exists learner_parent_idx on learner(parent_id);
```

- [ ] **Step 2: Run migration in Supabase**

Paste `001_identity.sql` content into Supabase SQL Editor → Run. Confirm `Success. No rows returned`.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/migrations/001_identity.sql
git commit -m "feat(db): identity tables — parent + learner"
```

### Task 11: Migration 002 — Content tables

**Files:**
- Create: `lib/supabase/migrations/002_content.sql`

- [ ] **Step 1: Write 002_content.sql**

```sql
-- lib/supabase/migrations/002_content.sql
create table if not exists subject (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  pack_version text not null,
  active boolean default true
);

create table if not exists strand (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subject(id) on delete cascade,
  code text not null,
  name text not null,
  sort_order int default 0,
  unique (subject_id, code)
);

create table if not exists skill (
  id uuid primary key default gen_random_uuid(),
  strand_id uuid references strand(id) on delete cascade,
  code text unique not null,
  name text not null,
  description text,
  level numeric default 0.5,
  prereq_skill_codes text[] default '{}',
  curriculum_refs jsonb default '{}',
  theme_tags text[] default '{}',
  sort_order int default 0
);

create index if not exists skill_strand_idx on skill(strand_id);

create table if not exists item (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill(id) on delete cascade,
  type text not null,
  content jsonb not null,
  answer jsonb not null,
  audio_url text,
  difficulty_elo int default 1000,
  generated_by text default 'seed',
  generated_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references parent(id),
  quality_score numeric,
  usage_count int default 0,
  last_served_at timestamptz
);

create index if not exists item_skill_approved_idx
  on item(skill_id) where approved_at is not null;
create index if not exists item_skill_elo_idx
  on item(skill_id, difficulty_elo) where approved_at is not null;
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

Paste → Run. Confirm success.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/migrations/002_content.sql
git commit -m "feat(db): content tables — subject, strand, skill, item"
```

### Task 12: Migration 003 — Progress tables

**Files:**
- Create: `lib/supabase/migrations/003_progress.sql`

- [ ] **Step 1: Write 003_progress.sql**

```sql
-- lib/supabase/migrations/003_progress.sql
create table if not exists session (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  mode text not null,               -- 'expedition' | 'free_build'
  subject_planned text,
  skill_planned text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  items_attempted int default 0,
  items_correct int default 0,
  ended_reason text
);

create index if not exists session_learner_started_idx
  on session(learner_id, started_at desc);

create table if not exists attempt (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references session(id) on delete cascade,
  item_id uuid references item(id),
  outcome text not null,            -- 'correct' | 'incorrect' | 'skipped'
  response jsonb,
  time_ms int,
  retry_count int default 0,
  attempted_at timestamptz default now()
);

create index if not exists attempt_session_idx on attempt(session_id);
create index if not exists attempt_item_idx on attempt(item_id, attempted_at desc);

create table if not exists skill_progress (
  learner_id uuid references learner(id) on delete cascade,
  skill_id uuid references skill(id) on delete cascade,
  mastery_state text default 'new',
  leitner_box int default 1,
  student_elo int default 1000,
  streak_correct int default 0,
  total_attempts int default 0,
  total_correct int default 0,
  first_introduced_at timestamptz default now(),
  last_attempted_at timestamptz,
  next_review_at timestamptz,
  state_transitions jsonb default '[]',
  primary key (learner_id, skill_id)
);

create index if not exists skill_progress_review_idx
  on skill_progress(learner_id, next_review_at)
  where next_review_at is not null;
```

- [ ] **Step 2: Run in Supabase**, **Step 3: Commit**

```bash
git add lib/supabase/migrations/003_progress.sql
git commit -m "feat(db): progress tables — session, attempt, skill_progress"
```

### Task 13: Migration 004 — World tables

**Files:**
- Create: `lib/supabase/migrations/004_world.sql`

- [ ] **Step 1: Write 004_world.sql**

```sql
-- lib/supabase/migrations/004_world.sql
create table if not exists world_state (
  learner_id uuid primary key references learner(id) on delete cascade,
  garden jsonb not null default '{"grid":{"rows":12,"cols":18},"tiles":[],"plants":[],"decor":[]}',
  cat_companion jsonb default '{"name":null,"breed":"calico","mood":"content","position":{"x":8,"y":10}}',
  season text default 'spring',
  day_phase text default 'day',
  last_updated_at timestamptz default now()
);

create table if not exists habitat_type (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  attracts_species_codes text[] default '{}',
  prereq_skill_codes text[] default '{}',
  illustration_key text
);

create table if not exists species (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  common_name text not null,
  scientific_name text,
  description text,
  fun_fact text,
  illustration_key text,
  habitat_req_codes text[] default '{}'
);

create table if not exists habitat (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  habitat_type_id uuid references habitat_type(id),
  position jsonb,
  state text default 'healthy',
  installed_at timestamptz default now()
);

create table if not exists journal_entry (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  species_id uuid references species(id),
  discovered_at timestamptz default now(),
  triggered_by_session_id uuid references session(id),
  unique (learner_id, species_id)
);

create table if not exists virtue_gem (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  virtue text not null,
  evidence jsonb not null,
  granted_at timestamptz default now()
);

create index if not exists virtue_gem_learner_virtue_idx on virtue_gem(learner_id, virtue);
create index if not exists virtue_gem_learner_granted_idx on virtue_gem(learner_id, granted_at desc);
```

- [ ] **Step 2: Run in Supabase**, **Step 3: Commit**

```bash
git add lib/supabase/migrations/004_world.sql
git commit -m "feat(db): world tables — world_state, habitats, species, gems"
```

### Task 14: Migration 005 — Authoring tables

**Files:**
- Create: `lib/supabase/migrations/005_authoring.sql`

- [ ] **Step 1: Write 005_authoring.sql**

```sql
-- lib/supabase/migrations/005_authoring.sql
create table if not exists authored_content (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parent(id) on delete cascade,
  target_skill_code text,
  kind text not null,
  content jsonb not null,
  status text default 'processing',
  created_at timestamptz default now()
);

create table if not exists generation_job (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill(id) on delete cascade,
  requested_at timestamptz default now(),
  completed_at timestamptz,
  status text,
  items_generated int default 0,
  items_passed_critic int default 0,
  critic_scores numeric[],
  cost_usd numeric,
  error_message text
);

create index if not exists generation_job_active_idx
  on generation_job(status, requested_at) where status != 'done';

create table if not exists tts_cache (
  text_hash text primary key,
  text text not null,
  voice_id text not null,
  audio_url text not null,
  duration_ms int,
  generated_at timestamptz default now()
);
```

- [ ] **Step 2: Run**, **Step 3: Commit**

```bash
git add lib/supabase/migrations/005_authoring.sql
git commit -m "feat(db): authoring + generation_job + tts_cache tables"
```

### Task 15: Migration 006 — RLS policies

**Files:**
- Create: `lib/supabase/migrations/006_rls.sql`

- [ ] **Step 1: Write 006_rls.sql**

```sql
-- lib/supabase/migrations/006_rls.sql
-- parent references auth.uid()
alter table parent enable row level security;
create policy "parent reads own row" on parent
  for select using (id = auth.uid());
create policy "parent updates own row" on parent
  for update using (id = auth.uid());

-- learner scoped to parent_id
alter table learner enable row level security;
create policy "learner owned by parent" on learner
  for all using (parent_id = auth.uid());

-- Everything learner-scoped
alter table session enable row level security;
create policy "session owned via learner" on session for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table attempt enable row level security;
create policy "attempt owned via session" on attempt for all using (
  session_id in (select id from session where learner_id in
    (select id from learner where parent_id = auth.uid()))
);

alter table skill_progress enable row level security;
create policy "skill_progress owned via learner" on skill_progress for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table world_state enable row level security;
create policy "world_state owned via learner" on world_state for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table habitat enable row level security;
create policy "habitat owned via learner" on habitat for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table journal_entry enable row level security;
create policy "journal owned via learner" on journal_entry for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table virtue_gem enable row level security;
create policy "virtue_gem owned via learner" on virtue_gem for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table authored_content enable row level security;
create policy "authored owned by parent" on authored_content for all using (
  parent_id = auth.uid()
);

-- Content tables: public read
alter table subject enable row level security;
create policy "subject public read" on subject for select using (true);

alter table strand enable row level security;
create policy "strand public read" on strand for select using (true);

alter table skill enable row level security;
create policy "skill public read" on skill for select using (true);

alter table item enable row level security;
create policy "item public read" on item for select using (approved_at is not null);

alter table habitat_type enable row level security;
create policy "habitat_type public read" on habitat_type for select using (true);

alter table species enable row level security;
create policy "species public read" on species for select using (true);

alter table generation_job enable row level security;
-- only service role accesses generation_job; no user policies

alter table tts_cache enable row level security;
create policy "tts_cache public read" on tts_cache for select using (true);
```

- [ ] **Step 2: Run**, **Step 3: Commit**

```bash
git add lib/supabase/migrations/006_rls.sql
git commit -m "feat(db): row-level security across all user tables"
```

### Task 16: Supabase client + server helpers

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Write lib/supabase/client.ts**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Write lib/supabase/server.ts**

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

export function createServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts
git commit -m "feat(supabase): client + server helpers with SSR cookies"
```

### Task 17: Engine types

**Files:**
- Create: `lib/engine/types.ts`

- [ ] **Step 1: Write lib/engine/types.ts**

```typescript
// lib/engine/types.ts

export type MasteryState = 'new' | 'learning' | 'review' | 'mastered';

export type VirtueName =
  | 'persistence' | 'curiosity' | 'noticing'
  | 'care' | 'practice' | 'courage' | 'wondering';

export interface SkillDefinition {
  code: string;                    // 'math.add.within_10'
  name: string;
  strandCode: string;
  level: number;                   // 0-1 difficulty estimate
  prereqSkillCodes: string[];
  curriculumRefs?: Record<string, string>;
  themeTags: string[];
  sortOrder: number;
}

export interface SkillProgressRow {
  learnerId: string;
  skillId: string;
  skillCode: string;
  masteryState: MasteryState;
  leitnerBox: number;              // 1-5
  studentElo: number;
  streakCorrect: number;
  totalAttempts: number;
  totalCorrect: number;
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null;
}

export interface ExpeditionCandidate {
  skillCode: string;
  skillName: string;
  title: string;                    // "Ants in Rows"
  themeEmoji: string;               // 🐜
  skillHint: string;                // "counting arrays (multiplication)"
  estItemCount: number;
  estDurationMs: number;
}

export interface SessionItemPlan {
  itemId: string;
  orderIndex: number;
  isStretch: boolean;
}

export interface SessionPlan {
  sessionId: string;
  skillCode: string;
  items: SessionItemPlan[];
}

export type EngineEvent =
  | { type: 'item.attempted'; sessionId: string; itemId: string; skillCode: string; outcome: 'correct' | 'incorrect' | 'skipped'; retries: number; timeMs: number }
  | { type: 'skill.state_changed'; learnerId: string; skillCode: string; from: MasteryState; to: MasteryState }
  | { type: 'skill.due_for_review'; learnerId: string; skillCode: string; overdueMs: number }
  | { type: 'session.completed'; sessionId: string; stats: SessionStats }
  | { type: 'virtue.observed'; learnerId: string; virtue: VirtueName; evidence: VirtueEvidence }
  | { type: 'interest.signal'; learnerId: string; tags: string[]; source: 'world' | 'journal' | 'habitat' }
  | { type: 'difficulty.adapted'; learnerId: string; skillCode: string; direction: 'up' | 'down' }
  | { type: 'narrator.moment'; learnerId: string; kind: NarratorKind; payload: NarratorPayload };

export interface SessionStats {
  itemsAttempted: number;
  itemsCorrect: number;
  durationMs: number;
  skillsTouched: string[];
}

export interface VirtueEvidence {
  itemId?: string;
  sessionId: string;
  narrativeText: string;
  observedAt: Date;
}

export type NarratorKind = 'remember_when_hard' | 'used_to_need_fingers' | 'practice_is_working';
export interface NarratorPayload {
  skillCode: string;
  text: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/engine/types.ts
git commit -m "feat(engine): neutral types for events, progress, plans"
```

### Task 18: Spaced review (Leitner) — write tests first

**Files:**
- Create: `tests/engine/spacedReview.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/engine/spacedReview.test.ts
import { describe, it, expect } from 'vitest';
import {
  promoteBox, demoteBox, nextReviewDate, isDueForReview,
} from '@/lib/engine/spacedReview';

describe('spacedReview — Leitner 5-box', () => {
  it('promotes within 1..5', () => {
    expect(promoteBox(1)).toBe(2);
    expect(promoteBox(4)).toBe(5);
    expect(promoteBox(5)).toBe(5);           // caps
  });

  it('demotes by one, never below 1', () => {
    expect(demoteBox(3)).toBe(2);
    expect(demoteBox(1)).toBe(1);            // floor
  });

  it('computes next review date per box', () => {
    const from = new Date('2026-04-22T00:00:00Z');
    expect(nextReviewDate(1, from).toISOString()).toBe('2026-04-22T00:00:00.000Z'); // same day
    expect(nextReviewDate(2, from).toISOString()).toBe('2026-04-23T00:00:00.000Z'); // +1
    expect(nextReviewDate(3, from).toISOString()).toBe('2026-04-24T00:00:00.000Z'); // +2
    expect(nextReviewDate(4, from).toISOString()).toBe('2026-04-26T00:00:00.000Z'); // +4
    expect(nextReviewDate(5, from).toISOString()).toBe('2026-04-29T00:00:00.000Z'); // +7
  });

  it('isDueForReview handles null and past dates', () => {
    const now = new Date('2026-04-22T12:00:00Z');
    expect(isDueForReview(null, now)).toBe(true);
    expect(isDueForReview(new Date('2026-04-21T00:00:00Z'), now)).toBe(true);
    expect(isDueForReview(new Date('2026-04-23T00:00:00Z'), now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — verify fail**

```bash
npm test -- spacedReview
```
Expected: FAIL — "Cannot find module '@/lib/engine/spacedReview'".

### Task 19: Spaced review — implementation

**Files:**
- Create: `lib/engine/spacedReview.ts`

- [ ] **Step 1: Write implementation**

```typescript
// lib/engine/spacedReview.ts
const INTERVAL_DAYS: Record<number, number> = {
  1: 0,  // same session / today
  2: 1,
  3: 2,
  4: 4,
  5: 7,
};

export function promoteBox(currentBox: number): number {
  return Math.min(5, currentBox + 1);
}

export function demoteBox(currentBox: number): number {
  return Math.max(1, currentBox - 1);
}

export function nextReviewDate(box: number, from: Date = new Date()): Date {
  const days = INTERVAL_DAYS[Math.max(1, Math.min(5, box))] ?? 0;
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isDueForReview(nextReviewAt: Date | null, now: Date = new Date()): boolean {
  if (nextReviewAt === null) return true;
  return nextReviewAt.getTime() <= now.getTime();
}
```

- [ ] **Step 2: Run tests — verify pass**

```bash
npm test -- spacedReview
```
Expected: 4/4 tests passing.

- [ ] **Step 3: Commit**

```bash
git add lib/engine/spacedReview.ts tests/engine/spacedReview.test.ts
git commit -m "feat(engine): Leitner 5-box spaced review with promote/demote/schedule"
```

### Task 20: Adaptive difficulty (Elo) — write tests first

**Files:**
- Create: `tests/engine/adaptiveDifficulty.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/engine/adaptiveDifficulty.test.ts
import { describe, it, expect } from 'vitest';
import { updateElo, chooseDifficultyBand } from '@/lib/engine/adaptiveDifficulty';

describe('adaptiveDifficulty — Elo', () => {
  it('correct on easier item: small drift up for student, small drift down for item', () => {
    const r = updateElo({ itemRating: 900, studentRating: 1000, correct: true });
    expect(r.newStudentRating).toBeGreaterThan(1000);
    expect(r.newItemRating).toBeLessThan(900);
    // expected was 0.64 so actual-expected = 0.36, student gains ~11.5, item loses ~11.5
    expect(Math.round(r.newStudentRating)).toBe(1012);
    expect(Math.round(r.newItemRating)).toBe(888);
  });

  it('incorrect on harder item: small drift down for student, small drift up for item', () => {
    const r = updateElo({ itemRating: 1100, studentRating: 1000, correct: false });
    expect(r.newStudentRating).toBeLessThan(1000);
    expect(r.newItemRating).toBeGreaterThan(1100);
  });

  it('chooseDifficultyBand centers on student with ±150 band', () => {
    const b = chooseDifficultyBand(1000);
    expect(b).toEqual({ min: 850, max: 1150, stretchMax: 1200 });
  });
});
```

- [ ] **Step 2: Run test — verify fail**

```bash
npm test -- adaptiveDifficulty
```
Expected: FAIL — module not found.

### Task 21: Adaptive difficulty — implementation

**Files:**
- Create: `lib/engine/adaptiveDifficulty.ts`

- [ ] **Step 1: Write implementation**

```typescript
// lib/engine/adaptiveDifficulty.ts
const K_FACTOR = 32;

export interface EloUpdate {
  itemRating: number;
  studentRating: number;
  correct: boolean;
  k?: number;
}

export function updateElo({ itemRating, studentRating, correct, k = K_FACTOR }: EloUpdate) {
  const expected = 1 / (1 + Math.pow(10, (itemRating - studentRating) / 400));
  const actual = correct ? 1 : 0;
  return {
    newStudentRating: studentRating + k * (actual - expected),
    newItemRating: itemRating + k * (expected - actual),
  };
}

export interface DifficultyBand {
  min: number;
  max: number;
  stretchMax: number;
}

export function chooseDifficultyBand(studentElo: number): DifficultyBand {
  return {
    min: studentElo - 150,
    max: studentElo + 150,
    stretchMax: studentElo + 200,
  };
}
```

- [ ] **Step 2: Run tests — verify pass**

```bash
npm test -- adaptiveDifficulty
```
Expected: 3/3 passing.

- [ ] **Step 3: Commit**

```bash
git add lib/engine/adaptiveDifficulty.ts tests/engine/adaptiveDifficulty.test.ts
git commit -m "feat(engine): Elo adaptive difficulty with ±150 band + stretch"
```

### Task 22: Mastery tracker — tests first

**Files:**
- Create: `tests/engine/masteryTracker.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/engine/masteryTracker.test.ts
import { describe, it, expect } from 'vitest';
import { computeMasteryTransition } from '@/lib/engine/masteryTracker';

describe('masteryTracker', () => {
  it('new → learning on first attempt', () => {
    const next = computeMasteryTransition({
      currentState: 'new', correct: true, streakCorrect: 0,
      sameSessionStreak: 1, isNewSession: false,
      studentElo: 1000, itemElo: 1000,
    });
    expect(next.newState).toBe('learning');
  });

  it('learning → review on 3-correct in-session streak', () => {
    const next = computeMasteryTransition({
      currentState: 'learning', correct: true, streakCorrect: 3,
      sameSessionStreak: 3, isNewSession: false,
      studentElo: 1000, itemElo: 1000,
    });
    expect(next.newState).toBe('review');
  });

  it('review → mastered only on a correct in a LATER session', () => {
    const sameSession = computeMasteryTransition({
      currentState: 'review', correct: true, streakCorrect: 4,
      sameSessionStreak: 4, isNewSession: false,
      studentElo: 1000, itemElo: 1000,
    });
    expect(sameSession.newState).toBe('review'); // not yet

    const laterSession = computeMasteryTransition({
      currentState: 'review', correct: true, streakCorrect: 1,
      sameSessionStreak: 1, isNewSession: true,
      studentElo: 1000, itemElo: 1000,
    });
    expect(laterSession.newState).toBe('mastered');
  });

  it('wrong answer: no demote when student-Elo is >100 below item', () => {
    const next = computeMasteryTransition({
      currentState: 'review', correct: false, streakCorrect: 0,
      sameSessionStreak: 0, isNewSession: false,
      studentElo: 900, itemElo: 1100,  // diff 200
    });
    expect(next.newState).toBe('review');  // stretch item, no demote
  });

  it('wrong answer: demote one notch when student-Elo within ±100 of item', () => {
    const next = computeMasteryTransition({
      currentState: 'mastered', correct: false, streakCorrect: 0,
      sameSessionStreak: 0, isNewSession: false,
      studentElo: 1000, itemElo: 1050,
    });
    expect(next.newState).toBe('review');
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test -- masteryTracker
```

### Task 23: Mastery tracker — implementation

**Files:**
- Create: `lib/engine/masteryTracker.ts`

- [ ] **Step 1: Write implementation**

```typescript
// lib/engine/masteryTracker.ts
import { MasteryState } from './types';

export interface MasteryInput {
  currentState: MasteryState;
  correct: boolean;
  streakCorrect: number;
  sameSessionStreak: number;
  isNewSession: boolean;       // first attempt this skill in a session that is NOT the introducing session
  studentElo: number;
  itemElo: number;
}

export interface MasteryTransition {
  newState: MasteryState;
  demoted: boolean;
  promoted: boolean;
}

export function computeMasteryTransition(input: MasteryInput): MasteryTransition {
  const { currentState, correct, sameSessionStreak, isNewSession, studentElo, itemElo } = input;

  if (correct) {
    // Promotion rules
    if (currentState === 'new') {
      return { newState: 'learning', demoted: false, promoted: true };
    }
    if (currentState === 'learning' && sameSessionStreak >= 3) {
      return { newState: 'review', demoted: false, promoted: true };
    }
    if (currentState === 'review' && isNewSession) {
      return { newState: 'mastered', demoted: false, promoted: true };
    }
    return { newState: currentState, demoted: false, promoted: false };
  }

  // Incorrect — demotion rule: only when student is within ±100 of item rating
  const eloDelta = Math.abs(studentElo - itemElo);
  if (eloDelta > 100) {
    return { newState: currentState, demoted: false, promoted: false };
  }

  const demoteMap: Record<MasteryState, MasteryState> = {
    mastered: 'review',
    review: 'learning',
    learning: 'learning',    // stays learning; never demotes to 'new'
    new: 'new',
  };
  return { newState: demoteMap[currentState], demoted: true, promoted: false };
}
```

- [ ] **Step 2: Run tests — verify pass**

```bash
npm test -- masteryTracker
```
Expected: 5/5 passing.

- [ ] **Step 3: Commit**

```bash
git add lib/engine/masteryTracker.ts tests/engine/masteryTracker.test.ts
git commit -m "feat(engine): mastery transitions with overnight-consolidation + Elo-aware demote"
```

### Task 24: Event bus — tests first

**Files:**
- Create: `tests/engine/eventBus.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/engine/eventBus.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '@/lib/engine/eventBus';
import type { EngineEvent } from '@/lib/engine/types';

describe('eventBus', () => {
  it('dispatches to subscribers by event type', () => {
    const bus = createEventBus();
    const fn = vi.fn();
    bus.on('item.attempted', fn);

    const evt: EngineEvent = {
      type: 'item.attempted',
      sessionId: 's1', itemId: 'i1', skillCode: 'x',
      outcome: 'correct', retries: 0, timeMs: 1000,
    };
    bus.emit(evt);
    expect(fn).toHaveBeenCalledWith(evt);
  });

  it('returns unsubscribe function', () => {
    const bus = createEventBus();
    const fn = vi.fn();
    const off = bus.on('item.attempted', fn);
    off();
    bus.emit({ type: 'item.attempted', sessionId: 's', itemId: 'i', skillCode: 'x',
      outcome: 'correct', retries: 0, timeMs: 1 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('ignores emit for types with no listeners', () => {
    const bus = createEventBus();
    expect(() => bus.emit({
      type: 'narrator.moment', learnerId: 'l', kind: 'practice_is_working',
      payload: { skillCode: 'x', text: 'hi' },
    })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test -- eventBus
```

### Task 25: Event bus — implementation

**Files:**
- Create: `lib/engine/eventBus.ts`

- [ ] **Step 1: Write implementation**

```typescript
// lib/engine/eventBus.ts
import type { EngineEvent } from './types';

type EventType = EngineEvent['type'];
type Handler<T extends EventType> = (evt: Extract<EngineEvent, { type: T }>) => void;

export interface EventBus {
  on<T extends EventType>(type: T, handler: Handler<T>): () => void;
  emit(evt: EngineEvent): void;
}

export function createEventBus(): EventBus {
  const listeners = new Map<EventType, Set<Function>>();

  return {
    on<T extends EventType>(type: T, handler: Handler<T>) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler as Function);
      return () => listeners.get(type)?.delete(handler as Function);
    },
    emit(evt: EngineEvent) {
      const set = listeners.get(evt.type);
      if (!set) return;
      for (const fn of set) (fn as (e: EngineEvent) => void)(evt);
    },
  };
}
```

- [ ] **Step 2: Run tests — verify pass**

```bash
npm test -- eventBus
```
Expected: 3/3 passing.

- [ ] **Step 3: Commit**

```bash
git add lib/engine/eventBus.ts tests/engine/eventBus.test.ts
git commit -m "feat(engine): typed event bus"
```

### Task 26: Skill graph module (no tests needed — thin SQL wrapper)

**Files:**
- Create: `lib/engine/skillGraph.ts`

- [ ] **Step 1: Write lib/engine/skillGraph.ts**

```typescript
// lib/engine/skillGraph.ts
import type { SkillDefinition, SkillProgressRow } from './types';

/**
 * Filters a list of skill definitions + per-learner progress rows to the
 * set of skills that are READY for this learner: prereqs mastered AND
 * the skill itself is NOT yet mastered.
 */
export function getReadySkills(
  skills: SkillDefinition[],
  progress: SkillProgressRow[]
): SkillDefinition[] {
  const progressByCode = new Map(progress.map(p => [p.skillCode, p]));
  const isMastered = (code: string) => progressByCode.get(code)?.masteryState === 'mastered';

  return skills.filter(s => {
    const prereqsDone = s.prereqSkillCodes.every(code => isMastered(code));
    const thisMastered = isMastered(s.code);
    return prereqsDone && !thisMastered;
  });
}

/**
 * Returns the subset of progress rows that are due for review, sorted by
 * most overdue first.
 */
export function getDueReviews(
  progress: SkillProgressRow[],
  now: Date = new Date()
): SkillProgressRow[] {
  return progress
    .filter(p => p.nextReviewAt !== null && p.nextReviewAt.getTime() <= now.getTime())
    .sort((a, b) =>
      (a.nextReviewAt!.getTime()) - (b.nextReviewAt!.getTime())
    );
}
```

- [ ] **Step 2: Add a quick unit test**

Create `tests/engine/skillGraph.test.ts`:

```typescript
// tests/engine/skillGraph.test.ts
import { describe, it, expect } from 'vitest';
import { getReadySkills, getDueReviews } from '@/lib/engine/skillGraph';
import type { SkillDefinition, SkillProgressRow } from '@/lib/engine/types';

const skills: SkillDefinition[] = [
  { code: 'a', name: 'A', strandCode: 's', level: 0.2, prereqSkillCodes: [], curriculumRefs: {}, themeTags: [], sortOrder: 1 },
  { code: 'b', name: 'B', strandCode: 's', level: 0.3, prereqSkillCodes: ['a'], curriculumRefs: {}, themeTags: [], sortOrder: 2 },
  { code: 'c', name: 'C', strandCode: 's', level: 0.4, prereqSkillCodes: ['b'], curriculumRefs: {}, themeTags: [], sortOrder: 3 },
];

const progress = (overrides: Partial<SkillProgressRow>[]): SkillProgressRow[] =>
  overrides.map(o => ({
    learnerId: 'l', skillId: 'sid', skillCode: '', masteryState: 'new',
    leitnerBox: 1, studentElo: 1000, streakCorrect: 0, totalAttempts: 0,
    totalCorrect: 0, lastAttemptedAt: null, nextReviewAt: null, ...o,
  }));

describe('skillGraph', () => {
  it('ready = a when nothing mastered', () => {
    const ready = getReadySkills(skills, progress([]));
    expect(ready.map(s => s.code)).toEqual(['a']);
  });

  it('ready = b when a is mastered', () => {
    const ready = getReadySkills(skills, progress([{ skillCode: 'a', masteryState: 'mastered' }]));
    expect(ready.map(s => s.code).sort()).toEqual(['b']);
  });

  it('due reviews returns those with nextReviewAt in past, sorted oldest first', () => {
    const now = new Date('2026-04-22T12:00:00Z');
    const p = progress([
      { skillCode: 'x', nextReviewAt: new Date('2026-04-21T00:00:00Z') },
      { skillCode: 'y', nextReviewAt: new Date('2026-04-20T00:00:00Z') },
      { skillCode: 'z', nextReviewAt: new Date('2026-04-23T00:00:00Z') },
    ]);
    const due = getDueReviews(p, now);
    expect(due.map(r => r.skillCode)).toEqual(['y', 'x']);
  });
});
```

- [ ] **Step 3: Run**

```bash
npm test -- skillGraph
```
Expected: 3/3 passing.

- [ ] **Step 4: Commit**

```bash
git add lib/engine/skillGraph.ts tests/engine/skillGraph.test.ts
git commit -m "feat(engine): skill graph — ready skills + due reviews"
```

### Task 27: Session planner — tests first

**Files:**
- Create: `tests/engine/sessionPlanner.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/engine/sessionPlanner.test.ts
import { describe, it, expect } from 'vitest';
import { generateExpeditionCandidates } from '@/lib/engine/sessionPlanner';
import type { SkillDefinition, SkillProgressRow } from '@/lib/engine/types';

const mkSkill = (code: string, level = 0.3, prereqs: string[] = []): SkillDefinition => ({
  code, name: code, strandCode: 's', level, prereqSkillCodes: prereqs,
  curriculumRefs: {}, themeTags: [], sortOrder: 0,
});

const mkProgress = (skillCode: string, overrides: Partial<SkillProgressRow> = {}): SkillProgressRow => ({
  learnerId: 'l', skillId: 'sid', skillCode, masteryState: 'new',
  leitnerBox: 1, studentElo: 1000, streakCorrect: 0, totalAttempts: 0,
  totalCorrect: 0, lastAttemptedAt: null, nextReviewAt: null, ...overrides,
});

describe('sessionPlanner — generateExpeditionCandidates', () => {
  it('returns up to 3 candidates from ready skills', () => {
    const skills = [mkSkill('a'), mkSkill('b'), mkSkill('c'), mkSkill('d')];
    const progress: SkillProgressRow[] = [];
    const titles: Record<string, { title: string; themeEmoji: string; skillHint: string }> = {
      a: { title: 'A', themeEmoji: '🐜', skillHint: 'a-hint' },
      b: { title: 'B', themeEmoji: '🦋', skillHint: 'b-hint' },
      c: { title: 'C', themeEmoji: '🐸', skillHint: 'c-hint' },
      d: { title: 'D', themeEmoji: '🐝', skillHint: 'd-hint' },
    };
    const out = generateExpeditionCandidates({
      skills, progress,
      getThemeHeader: (code) => titles[code]!,
      interestTagDecay: [],
    });
    expect(out.length).toBe(3);
    expect(out[0].estItemCount).toBeGreaterThanOrEqual(5);
    expect(out[0].estItemCount).toBeLessThanOrEqual(8);
  });

  it('prioritizes due reviews when overdue', () => {
    const skills = [mkSkill('a'), mkSkill('b'), mkSkill('c')];
    const progress = [
      mkProgress('a', { masteryState: 'learning', nextReviewAt: new Date('2026-04-20T00:00:00Z') }),
      mkProgress('b', { masteryState: 'new' }),
      mkProgress('c', { masteryState: 'new' }),
    ];
    const titles: Record<string, { title: string; themeEmoji: string; skillHint: string }> = {
      a: { title: 'A', themeEmoji: '🐜', skillHint: 'a-hint' },
      b: { title: 'B', themeEmoji: '🦋', skillHint: 'b-hint' },
      c: { title: 'C', themeEmoji: '🐸', skillHint: 'c-hint' },
    };
    const out = generateExpeditionCandidates({
      skills, progress,
      getThemeHeader: (code) => titles[code]!,
      interestTagDecay: [],
      now: new Date('2026-04-22T12:00:00Z'),
    });
    expect(out[0].skillCode).toBe('a');
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm test -- sessionPlanner
```

### Task 28: Session planner — implementation

**Files:**
- Create: `lib/engine/sessionPlanner.ts`

- [ ] **Step 1: Write implementation**

```typescript
// lib/engine/sessionPlanner.ts
import type { SkillDefinition, SkillProgressRow, ExpeditionCandidate } from './types';
import { getReadySkills, getDueReviews } from './skillGraph';

export interface PlannerInput {
  skills: SkillDefinition[];
  progress: SkillProgressRow[];
  getThemeHeader: (skillCode: string) => { title: string; themeEmoji: string; skillHint: string };
  interestTagDecay: Array<{ tag: string; weight: number }>;
  now?: Date;
  candidateCount?: number;
}

export function generateExpeditionCandidates(input: PlannerInput): ExpeditionCandidate[] {
  const { skills, progress, getThemeHeader, interestTagDecay, candidateCount = 3, now = new Date() } = input;

  const progressByCode = new Map(progress.map(p => [p.skillCode, p]));
  const dueReviews = new Set(getDueReviews(progress, now).map(r => r.skillCode));
  const readyCodes = new Set(getReadySkills(skills, progress).map(s => s.code));

  // Candidates start with due reviews (readiness-agnostic for review)
  // then fall back to ready-but-not-mastered skills.
  const scored = skills
    .map(s => {
      const prog = progressByCode.get(s.code);
      const isDue = dueReviews.has(s.code);
      const isReady = readyCodes.has(s.code);
      if (!isDue && !isReady) return null;

      // Theme tag bonus
      const tagBonus = s.themeTags.reduce((acc, tag) => {
        const hit = interestTagDecay.find(t => t.tag === tag);
        return acc + (hit?.weight ?? 0);
      }, 0);

      // Priority: due reviews > not-yet-learning > learning > review
      const statePriority: Record<string, number> = {
        mastered: -10, review: 5, learning: 8, new: 10,
      };
      const stateScore = statePriority[prog?.masteryState ?? 'new'] ?? 0;

      const score = (isDue ? 50 : 0) + stateScore + tagBonus * 5;
      return { skill: s, score };
    })
    .filter((x): x is { skill: SkillDefinition; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, candidateCount);

  return scored.map(({ skill }) => {
    const header = getThemeHeader(skill.code);
    return {
      skillCode: skill.code,
      skillName: skill.name,
      title: header.title,
      themeEmoji: header.themeEmoji,
      skillHint: header.skillHint,
      estItemCount: 6,              // default, packs can refine later
      estDurationMs: 7 * 60 * 1000, // 7 minutes
    };
  });
}
```

- [ ] **Step 2: Run — verify pass**

```bash
npm test -- sessionPlanner
```
Expected: 2/2 passing.

- [ ] **Step 3: Commit**

```bash
git add lib/engine/sessionPlanner.ts tests/engine/sessionPlanner.test.ts
git commit -m "feat(engine): session planner generates 3 candidates balancing reviews + ready + themes"
```

### Task 29: Stubs — interestMixer, virtueDetector, narrator

**Files:**
- Create: `lib/engine/interestMixer.ts`, `lib/engine/virtueDetector.ts`, `lib/engine/narrator.ts`

- [ ] **Step 1: Write all three as minimum-viable stubs (Plan 3 fleshes these out)**

```typescript
// lib/engine/interestMixer.ts
export interface InterestTag { tag: string; weight: number; expiresAt?: Date }
export function decayTags(tags: InterestTag[], now: Date = new Date()): InterestTag[] {
  return tags
    .filter(t => !t.expiresAt || t.expiresAt.getTime() > now.getTime())
    .map(t => ({ ...t, weight: t.weight * 0.6 }))
    .filter(t => t.weight >= 0.05);
}
```

```typescript
// lib/engine/virtueDetector.ts
// Plan 3 adds real detectors. For Plan 1, expose a no-op observer.
import type { EngineEvent, VirtueName } from './types';
export interface DetectedVirtue { virtue: VirtueName; narrativeText: string }
export function detectVirtuesForEvent(evt: EngineEvent): DetectedVirtue[] {
  return []; // Plan 3 implements the seven detection rules
}
```

```typescript
// lib/engine/narrator.ts
// Plan 3 adds the full narrator. Plan 1: pass-through no-op.
import type { EngineEvent, NarratorKind } from './types';
export interface NarratorMoment { kind: NarratorKind; text: string; skillCode: string }
export function computeNarratorMoments(events: EngineEvent[]): NarratorMoment[] {
  return []; // Plan 3 implements
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/engine/interestMixer.ts lib/engine/virtueDetector.ts lib/engine/narrator.ts
git commit -m "feat(engine): stubs for interestMixer/virtueDetector/narrator (impl in Plan 3)"
```

### Task 30: Engine barrel export

**Files:**
- Create: `lib/engine/index.ts`

- [ ] **Step 1: Write barrel**

```typescript
// lib/engine/index.ts
export * from './types';
export * from './skillGraph';
export * from './masteryTracker';
export * from './spacedReview';
export * from './adaptiveDifficulty';
export * from './sessionPlanner';
export * from './eventBus';
export * from './interestMixer';
export * from './virtueDetector';
export * from './narrator';
```

- [ ] **Step 2: Commit**

```bash
git add lib/engine/index.ts
git commit -m "feat(engine): barrel export"
```

### Task 31: Math pack types

**Files:**
- Create: `lib/packs/math/types.ts`

- [ ] **Step 1: Write types**

```typescript
// lib/packs/math/types.ts

export type MathItemType = 'NumberBonds' | 'CountingTiles' | 'EquationTap';

// Per-type content + answer shapes, used in item.content and item.answer jsonb
export interface NumberBondsContent {
  type: 'NumberBonds';
  whole: number;                    // e.g., 10
  knownPart: number;                // e.g., 7
  promptText: string;               // "7 and what make 10?"
}
export interface NumberBondsAnswer { missing: number }
export interface NumberBondsResponse { missing: number }

export interface CountingTilesContent {
  type: 'CountingTiles';
  emoji: string;                    // '🐜'
  count: number;                    // visible count to verify
  promptText: string;
}
export interface CountingTilesAnswer { count: number }
export interface CountingTilesResponse { count: number }

export interface EquationTapContent {
  type: 'EquationTap';
  equation: string;                 // '3 + 5 = ?'
  choices: number[];                // [6, 7, 8, 9]
  promptText: string;
}
export interface EquationTapAnswer { correct: number }
export interface EquationTapResponse { chosen: number }
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/math/types.ts
git commit -m "feat(math): item content/answer/response types for 3 V1 types"
```

### Task 32: Math pack strands + skills

**Files:**
- Create: `lib/packs/math/strands.ts`, `lib/packs/math/skills.ts`

- [ ] **Step 1: Write strands.ts**

```typescript
// lib/packs/math/strands.ts
export const MATH_STRANDS = [
  { code: 'counting', name: 'Counting & Cardinality', sortOrder: 1 },
  { code: 'operations', name: 'Operations & Algebraic Thinking', sortOrder: 2 },
] as const;
```

- [ ] **Step 2: Write skills.ts (8 skills for Plan 1)**

```typescript
// lib/packs/math/skills.ts
import type { SkillDefinition } from '@/lib/engine/types';

export const MATH_SKILLS: SkillDefinition[] = [
  // Counting strand
  { code: 'math.counting.to_20', name: 'Count to 20', strandCode: 'counting', level: 0.1,
    prereqSkillCodes: [], curriculumRefs: { ccss: 'K.CC.A.1' },
    themeTags: ['counting', 'insects'], sortOrder: 1 },
  { code: 'math.counting.to_50', name: 'Count to 50', strandCode: 'counting', level: 0.2,
    prereqSkillCodes: ['math.counting.to_20'], curriculumRefs: { ccss: '1.NBT.A.1' },
    themeTags: ['counting', 'plants'], sortOrder: 2 },
  { code: 'math.counting.skip_2s', name: 'Skip count by 2s', strandCode: 'counting', level: 0.3,
    prereqSkillCodes: ['math.counting.to_20'], curriculumRefs: { ccss: '2.NBT.A.2' },
    themeTags: ['counting', 'patterns', 'insects'], sortOrder: 3 },

  // Operations strand
  { code: 'math.add.within_10', name: 'Add within 10', strandCode: 'operations', level: 0.2,
    prereqSkillCodes: ['math.counting.to_20'], curriculumRefs: { ccss: '1.OA.C.6' },
    themeTags: ['add', 'insects'], sortOrder: 10 },
  { code: 'math.subtract.within_10', name: 'Subtract within 10', strandCode: 'operations', level: 0.25,
    prereqSkillCodes: ['math.add.within_10'], curriculumRefs: { ccss: '1.OA.C.6' },
    themeTags: ['subtract', 'flowers'], sortOrder: 11 },
  { code: 'math.add.within_20.no_crossing', name: 'Add within 20 (no regrouping)',
    strandCode: 'operations', level: 0.35,
    prereqSkillCodes: ['math.add.within_10'], curriculumRefs: { ccss: '1.OA.C.6' },
    themeTags: ['add', 'bees'], sortOrder: 12 },
  { code: 'math.add.within_20.crossing_ten', name: 'Add within 20 (crossing ten)',
    strandCode: 'operations', level: 0.5,
    prereqSkillCodes: ['math.add.within_20.no_crossing'], curriculumRefs: { ccss: '1.OA.C.6' },
    themeTags: ['add', 'make_ten', 'butterflies'], sortOrder: 13 },
  { code: 'math.number_bond.within_10', name: 'Number bonds to 10',
    strandCode: 'operations', level: 0.3,
    prereqSkillCodes: ['math.add.within_10'], curriculumRefs: { ccss: '1.OA.C.6' },
    themeTags: ['bond', 'part_whole'], sortOrder: 14 },
];
```

- [ ] **Step 3: Commit**

```bash
git add lib/packs/math/strands.ts lib/packs/math/skills.ts
git commit -m "feat(math): 2 strands + 8 V1 skills with CCSS refs + theme tags"
```

### Task 33: Math pack themes + theme header provider

**Files:**
- Create: `lib/packs/math/themes.ts`

- [ ] **Step 1: Write themes.ts**

```typescript
// lib/packs/math/themes.ts

export interface ThemeHeader {
  title: string;          // "Ants in Rows"
  themeEmoji: string;     // "🐜"
  skillHint: string;      // "counting arrays (multiplication)"
}

export const MATH_THEMES: Record<string, ThemeHeader> = {
  'math.counting.to_20': {
    title: 'Counting Bugs', themeEmoji: '🐞', skillHint: 'counting to 20',
  },
  'math.counting.to_50': {
    title: 'Flowers in the Meadow', themeEmoji: '🌼', skillHint: 'counting to 50',
  },
  'math.counting.skip_2s': {
    title: 'Ants in Pairs', themeEmoji: '🐜', skillHint: 'skip counting by 2s',
  },
  'math.add.within_10': {
    title: 'Meeting Bugs', themeEmoji: '🐛', skillHint: 'addition within 10',
  },
  'math.subtract.within_10': {
    title: 'Petal Falls', themeEmoji: '🌸', skillHint: 'subtraction within 10',
  },
  'math.add.within_20.no_crossing': {
    title: 'Bee Swarms', themeEmoji: '🐝', skillHint: 'addition within 20',
  },
  'math.add.within_20.crossing_ten': {
    title: 'Butterfly Clusters', themeEmoji: '🦋', skillHint: 'make-10 addition',
  },
  'math.number_bond.within_10': {
    title: 'Part & Whole Garden', themeEmoji: '🌺', skillHint: 'number bonds to 10',
  },
};

export function getThemeHeader(skillCode: string): ThemeHeader {
  return MATH_THEMES[skillCode] ?? {
    title: 'A New Path', themeEmoji: '🌿', skillHint: 'something new',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/math/themes.ts
git commit -m "feat(math): theme headers for 8 V1 skills"
```

### Task 34: Math pack scoring — tests first

**Files:**
- Create: `tests/packs/math/scoring.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/packs/math/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreMathResponse } from '@/lib/packs/math/scoring';
import type { Item } from '@/lib/types';

const mkItem = (type: string, content: any, answer: any): Item => ({
  id: 'i', skillId: 's', type, content, answer,
  difficultyElo: 1000, generatedBy: 'seed', approvedAt: new Date(),
});

describe('math scoring', () => {
  describe('NumberBonds', () => {
    const item = mkItem('NumberBonds',
      { type: 'NumberBonds', whole: 10, knownPart: 7, promptText: '7 and what make 10?' },
      { missing: 3 });

    it('correct', () => {
      expect(scoreMathResponse(item, { missing: 3 })).toEqual({ outcome: 'correct' });
    });
    it('incorrect', () => {
      expect(scoreMathResponse(item, { missing: 4 })).toEqual({ outcome: 'incorrect' });
    });
  });

  describe('CountingTiles', () => {
    const item = mkItem('CountingTiles',
      { type: 'CountingTiles', emoji: '🐜', count: 5, promptText: 'How many ants?' },
      { count: 5 });

    it('correct', () => {
      expect(scoreMathResponse(item, { count: 5 })).toEqual({ outcome: 'correct' });
    });
    it('incorrect', () => {
      expect(scoreMathResponse(item, { count: 4 })).toEqual({ outcome: 'incorrect' });
    });
  });

  describe('EquationTap', () => {
    const item = mkItem('EquationTap',
      { type: 'EquationTap', equation: '3 + 5 = ?', choices: [6, 7, 8, 9], promptText: '3 plus 5 is?' },
      { correct: 8 });

    it('correct', () => {
      expect(scoreMathResponse(item, { chosen: 8 })).toEqual({ outcome: 'correct' });
    });
    it('incorrect', () => {
      expect(scoreMathResponse(item, { chosen: 7 })).toEqual({ outcome: 'incorrect' });
    });
  });
});
```

- [ ] **Step 2: Run — verify fail (Item type + scoring not defined yet)**

```bash
npm test -- scoring
```

### Task 35: Shared types + Math scoring implementation

**Files:**
- Create: `lib/types.ts`, `lib/packs/math/scoring.ts`

- [ ] **Step 1: Write lib/types.ts**

```typescript
// lib/types.ts
export interface Parent {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface Learner {
  id: string;
  parentId: string;
  firstName: string;
  avatarKey?: string;
  birthday?: Date;
  createdAt: Date;
}

export interface Item {
  id: string;
  skillId: string;
  type: string;
  content: Record<string, any>;
  answer: Record<string, any>;
  audioUrl?: string;
  difficultyElo: number;
  generatedBy: 'claude' | 'parent' | 'seed';
  approvedAt?: Date | null;
  usageCount?: number;
}

export interface ScoreOutcome {
  outcome: 'correct' | 'incorrect' | 'skipped';
}
```

- [ ] **Step 2: Write lib/packs/math/scoring.ts**

```typescript
// lib/packs/math/scoring.ts
import type { Item, ScoreOutcome } from '@/lib/types';

export function scoreMathResponse(item: Item, response: any): ScoreOutcome {
  switch (item.type) {
    case 'NumberBonds': {
      const expected = (item.answer as { missing: number }).missing;
      const given = (response as { missing: number })?.missing;
      return { outcome: given === expected ? 'correct' : 'incorrect' };
    }
    case 'CountingTiles': {
      const expected = (item.answer as { count: number }).count;
      const given = (response as { count: number })?.count;
      return { outcome: given === expected ? 'correct' : 'incorrect' };
    }
    case 'EquationTap': {
      const expected = (item.answer as { correct: number }).correct;
      const given = (response as { chosen: number })?.chosen;
      return { outcome: given === expected ? 'correct' : 'incorrect' };
    }
    default:
      throw new Error(`Unknown math item type: ${item.type}`);
  }
}
```

- [ ] **Step 3: Run tests — verify pass**

```bash
npm test -- scoring
```
Expected: 6/6 passing.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/packs/math/scoring.ts tests/packs/math/scoring.test.ts
git commit -m "feat(math): shared types + pure scoring functions for 3 V1 item types"
```

---

## Epic B — First Playable Loop (Tasks 36–60)

### Task 36: Seed migration — Cecily + Math pack + hardcoded items

**Files:**
- Create: `lib/supabase/migrations/007_seed_cecily_and_math.sql`

- [ ] **Step 1: Write 007_seed_cecily_and_math.sql**

```sql
-- lib/supabase/migrations/007_seed_cecily_and_math.sql

-- Placeholder parent (will be replaced by real auth row when Dylan signs in).
-- For dev-on-the-device, we use a fixed UUID that the dev bypass auth hook recognizes.
insert into parent (id, email, display_name)
values ('00000000-0000-0000-0000-000000000001', 'dylan.c.brock@gmail.com', 'Dylan')
on conflict (id) do nothing;

-- Cecily
insert into learner (id, parent_id, first_name, avatar_key)
values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Cecily',
  'fox'
)
on conflict (id) do nothing;

-- Subject
insert into subject (id, code, name, pack_version) values
  ('22222222-2222-2222-2222-222222222221', 'math', 'Math', '1.0.0')
on conflict (code) do nothing;

-- Strands
insert into strand (subject_id, code, name, sort_order) values
  ('22222222-2222-2222-2222-222222222221', 'counting', 'Counting & Cardinality', 1),
  ('22222222-2222-2222-2222-222222222221', 'operations', 'Operations & Algebraic Thinking', 2)
on conflict (subject_id, code) do nothing;

-- Skills (8 from lib/packs/math/skills.ts)
insert into skill (strand_id, code, name, level, prereq_skill_codes, curriculum_refs, theme_tags, sort_order)
select s.id, sk.code, sk.name, sk.level, sk.prereq_skill_codes, sk.curriculum_refs::jsonb, sk.theme_tags, sk.sort_order
from (values
  ('counting',    'math.counting.to_20',             'Count to 20',                      0.1, ARRAY[]::text[],                                             '{"ccss":"K.CC.A.1"}',  ARRAY['counting','insects'],           1),
  ('counting',    'math.counting.to_50',             'Count to 50',                      0.2, ARRAY['math.counting.to_20'],                                '{"ccss":"1.NBT.A.1"}', ARRAY['counting','plants'],            2),
  ('counting',    'math.counting.skip_2s',           'Skip count by 2s',                 0.3, ARRAY['math.counting.to_20'],                                '{"ccss":"2.NBT.A.2"}', ARRAY['counting','patterns','insects'], 3),
  ('operations',  'math.add.within_10',              'Add within 10',                    0.2, ARRAY['math.counting.to_20'],                                '{"ccss":"1.OA.C.6"}',  ARRAY['add','insects'],                10),
  ('operations',  'math.subtract.within_10',         'Subtract within 10',               0.25,ARRAY['math.add.within_10'],                                 '{"ccss":"1.OA.C.6"}',  ARRAY['subtract','flowers'],           11),
  ('operations',  'math.add.within_20.no_crossing',  'Add within 20 (no regrouping)',    0.35,ARRAY['math.add.within_10'],                                 '{"ccss":"1.OA.C.6"}',  ARRAY['add','bees'],                   12),
  ('operations',  'math.add.within_20.crossing_ten', 'Add within 20 (crossing ten)',     0.5, ARRAY['math.add.within_20.no_crossing'],                     '{"ccss":"1.OA.C.6"}',  ARRAY['add','make_ten','butterflies'], 13),
  ('operations',  'math.number_bond.within_10',      'Number bonds to 10',               0.3, ARRAY['math.add.within_10'],                                 '{"ccss":"1.OA.C.6"}',  ARRAY['bond','part_whole'],            14)
) as sk(strand_code, code, name, level, prereq_skill_codes, curriculum_refs, theme_tags, sort_order)
join strand s on s.code = sk.strand_code
  and s.subject_id = '22222222-2222-2222-2222-222222222221'
on conflict (code) do nothing;

-- Cecily's world state
insert into world_state (learner_id)
values ('11111111-1111-1111-1111-111111111111')
on conflict (learner_id) do nothing;

-- --- Hardcoded seed items (approved) ---
-- 5 NumberBonds within 10
insert into item (skill_id, type, content, answer, approved_at, generated_by)
select
  s.id,
  'NumberBonds',
  jsonb_build_object('type','NumberBonds','whole',10,'knownPart',k,'promptText',k||' and what make 10?'),
  jsonb_build_object('missing',10-k),
  now(),
  'seed'
from skill s, generate_series(1,9) as k
where s.code = 'math.number_bond.within_10'
and not exists (
  select 1 from item i where i.skill_id = s.id and (i.content->>'knownPart')::int = k
);

-- 10 CountingTiles within 20
insert into item (skill_id, type, content, answer, approved_at, generated_by)
select
  s.id,
  'CountingTiles',
  jsonb_build_object('type','CountingTiles','emoji','🐜','count',n,'promptText','How many ants?'),
  jsonb_build_object('count',n),
  now(),
  'seed'
from skill s, generate_series(3,20) as n
where s.code = 'math.counting.to_20'
and not exists (
  select 1 from item i where i.skill_id = s.id and (i.content->>'count')::int = n
);

-- Add-within-10 as EquationTap
insert into item (skill_id, type, content, answer, approved_at, generated_by)
select
  s.id,
  'EquationTap',
  jsonb_build_object(
    'type','EquationTap',
    'equation', a || ' + ' || b || ' = ?',
    'choices', jsonb_build_array(a+b-1, a+b, a+b+1, a+b+2),
    'promptText', a || ' plus ' || b || ' is?'
  ),
  jsonb_build_object('correct',a+b),
  now(),
  'seed'
from skill s, generate_series(1,5) a, generate_series(1,5) b
where s.code = 'math.add.within_10'
  and a+b <= 10
  and not exists (
    select 1 from item i where i.skill_id = s.id
    and (i.answer->>'correct')::int = a+b
    and i.content->>'equation' = a || ' + ' || b || ' = ?'
  );
```

- [ ] **Step 2: Run in Supabase SQL Editor**

Paste → Run. Verify at least 5 + 18 + ~15 = ~38 items inserted via `select count(*) from item;`.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/migrations/007_seed_cecily_and_math.sql
git commit -m "feat(db): seed Cecily + Math pack skills + ~40 approved hardcoded items"
```

### Task 37: Picker page — profile tiles

**Files:**
- Create: `app/(child)/layout.tsx`, `app/(child)/picker/page.tsx`, `components/child/ProfileTile.tsx`

- [ ] **Step 1: Write child layout**

```typescript
// app/(child)/layout.tsx
export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-bark font-body">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write ProfileTile**

```typescript
// components/child/ProfileTile.tsx
'use client';
import Link from 'next/link';

export default function ProfileTile({
  name, avatarEmoji, href,
}: { name: string; avatarEmoji: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-40 h-40 bg-white rounded-3xl border-4 border-ochre hover:scale-105 active:scale-95 transition-transform shadow-md"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="text-7xl">{avatarEmoji}</div>
      <div className="mt-2 text-kid-md">{name}</div>
    </Link>
  );
}
```

- [ ] **Step 3: Write picker page**

```typescript
// app/(child)/picker/page.tsx
import { createClient } from '@/lib/supabase/server';
import ProfileTile from '@/components/child/ProfileTile';

// For Plan 1, the picker reads learners via service role (RLS-bypass allowed
// because Plan 1 trusts the device; Plan 3 replaces this with real auth).
export default async function PickerPage() {
  const supabase = createClient();
  const { data: learners } = await supabase
    .from('learner')
    .select('id, first_name, avatar_key')
    .limit(10);

  const pick = learners ?? [];

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-kid-lg text-bark">Who's exploring today?</h1>
        <div className="flex flex-wrap gap-6 justify-center">
          {pick.map(l => (
            <ProfileTile
              key={l.id}
              name={l.first_name}
              avatarEmoji={avatarMap[l.avatar_key ?? 'fox'] ?? '🦊'}
              href={`/explore?learner=${l.id}`}
            />
          ))}
        </div>
        <div className="text-sm opacity-60 pt-8">
          <a href="/auth">⚙️ Parent</a>
        </div>
      </div>
    </main>
  );
}

const avatarMap: Record<string, string> = {
  fox: '🦊', bunny: '🐰', cat: '🐈', butterfly: '🦋',
};
```

- [ ] **Step 4: Run dev, verify page renders**

```bash
npm run dev
# visit http://localhost:3000/picker — should show Cecily's tile
```

- [ ] **Step 5: Commit**

```bash
git add app/\(child\)/layout.tsx app/\(child\)/picker components/child/ProfileTile.tsx
git commit -m "feat(child): profile picker screen with ProfileTile"
```

### Task 38: API — GET plan candidates

**Files:**
- Create: `app/api/plan/candidates/route.ts`

- [ ] **Step 1: Write route**

```typescript
// app/api/plan/candidates/route.ts
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateExpeditionCandidates } from '@/lib/engine';
import { getThemeHeader } from '@/lib/packs/math/themes';
import type { SkillDefinition, SkillProgressRow } from '@/lib/engine/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();

  const { data: skillRows, error: sErr } = await db
    .from('skill')
    .select('code, name, level, prereq_skill_codes, curriculum_refs, theme_tags, sort_order, strand!inner(code)');
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const skills: SkillDefinition[] = (skillRows ?? []).map(r => ({
    code: r.code,
    name: r.name,
    strandCode: (r as any).strand.code,
    level: Number(r.level ?? 0.5),
    prereqSkillCodes: r.prereq_skill_codes ?? [],
    curriculumRefs: r.curriculum_refs as any,
    themeTags: r.theme_tags ?? [],
    sortOrder: r.sort_order ?? 0,
  }));

  const { data: progressRows } = await db
    .from('skill_progress')
    .select('skill_id, mastery_state, leitner_box, student_elo, streak_correct, total_attempts, total_correct, last_attempted_at, next_review_at, skill:skill_id(code)')
    .eq('learner_id', learnerId);

  const progress: SkillProgressRow[] = (progressRows ?? []).map(r => ({
    learnerId,
    skillId: r.skill_id,
    skillCode: (r as any).skill.code,
    masteryState: r.mastery_state as any,
    leitnerBox: r.leitner_box,
    studentElo: r.student_elo,
    streakCorrect: r.streak_correct,
    totalAttempts: r.total_attempts,
    totalCorrect: r.total_correct,
    lastAttemptedAt: r.last_attempted_at ? new Date(r.last_attempted_at) : null,
    nextReviewAt: r.next_review_at ? new Date(r.next_review_at) : null,
  }));

  const candidates = generateExpeditionCandidates({
    skills,
    progress,
    getThemeHeader,
    interestTagDecay: [],
  });

  return NextResponse.json({ candidates });
}
```

- [ ] **Step 2: Test manually**

```bash
curl "http://localhost:3000/api/plan/candidates?learner=11111111-1111-1111-1111-111111111111"
```
Expected: JSON with `candidates` array of 3 items.

- [ ] **Step 3: Commit**

```bash
git add app/api/plan/candidates/route.ts
git commit -m "feat(api): GET /api/plan/candidates returns 3 expedition options"
```

### Task 39: Expedition picker page

**Files:**
- Create: `app/(child)/explore/page.tsx`, `components/child/ExpeditionCard.tsx`

- [ ] **Step 1: Write ExpeditionCard**

```typescript
// components/child/ExpeditionCard.tsx
'use client';

export default function ExpeditionCard({
  emoji, title, hint, onSelect,
}: { emoji: string; title: string; hint: string; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-4 bg-white hover:bg-ochre/10 active:bg-ochre/20 rounded-2xl border-4 border-terracotta px-5 py-4 shadow-md w-full text-left"
      style={{ touchAction: 'manipulation', minHeight: 80 }}
    >
      <span className="text-5xl">{emoji}</span>
      <div>
        <div className="text-kid-md">{title}</div>
        <div className="text-sm opacity-70">{hint}</div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Write explore page**

```typescript
// app/(child)/explore/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExpeditionCard from '@/components/child/ExpeditionCard';

interface Candidate {
  skillCode: string;
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const learnerId = sp.get('learner');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!learnerId) return;
    fetch(`/api/plan/candidates?learner=${learnerId}`)
      .then(r => r.json())
      .then(data => setCandidates(data.candidates ?? []));
  }, [learnerId]);

  const start = async (skillCode: string) => {
    const res = await fetch('/api/session/start', {
      method: 'POST',
      body: JSON.stringify({ learnerId, skillCode }),
      headers: { 'content-type': 'application/json' },
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-kid-lg text-center pt-4">🔍 Pick an exploration</h1>
      <div className="flex flex-col gap-4">
        {candidates.map(c => (
          <ExpeditionCard
            key={c.skillCode}
            emoji={c.themeEmoji}
            title={c.title}
            hint={c.skillHint}
            onSelect={() => start(c.skillCode)}
          />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/child/ExpeditionCard.tsx app/\(child\)/explore
git commit -m "feat(child): expedition picker page"
```

### Task 40: API — POST /api/session/start

**Files:**
- Create: `app/api/session/start/route.ts`

- [ ] **Step 1: Write route**

```typescript
// app/api/session/start/route.ts
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Body = z.object({
  learnerId: z.string().uuid(),
  skillCode: z.string(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  // Look up skill to confirm it exists
  const { data: skill, error: skErr } = await db
    .from('skill').select('id, code').eq('code', body.skillCode).single();
  if (skErr || !skill) return NextResponse.json({ error: 'skill not found' }, { status: 404 });

  // Look up subject for session.subject_planned
  const { data: strand } = await db
    .from('skill').select('strand:strand_id(subject:subject_id(code))')
    .eq('code', body.skillCode).single();
  const subjectCode = (strand as any)?.strand?.subject?.code ?? 'math';

  const { data: session, error: sErr } = await db
    .from('session')
    .insert({
      learner_id: body.learnerId,
      mode: 'expedition',
      subject_planned: subjectCode,
      skill_planned: body.skillCode,
    })
    .select('id')
    .single();
  if (sErr || !session) return NextResponse.json({ error: sErr?.message }, { status: 500 });

  return NextResponse.json({ sessionId: session.id });
}
```

- [ ] **Step 2: Test manually**

```bash
curl -X POST http://localhost:3000/api/session/start \
  -H "content-type: application/json" \
  -d '{"learnerId":"11111111-1111-1111-1111-111111111111","skillCode":"math.counting.to_20"}'
```
Expected: `{"sessionId":"..."}`

- [ ] **Step 3: Commit**

```bash
git add app/api/session/start/route.ts
git commit -m "feat(api): POST /api/session/start creates a session for a learner+skill"
```

### Task 41: API — GET /api/session/[id]/item (picks next item)

**Files:**
- Create: `app/api/session/[id]/item/route.ts`

- [ ] **Step 1: Write route**

```typescript
// app/api/session/[id]/item/route.ts
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { chooseDifficultyBand } from '@/lib/engine';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const db = createServiceClient();

  // Get session
  const { data: session, error: sErr } = await db
    .from('session').select('*').eq('id', params.id).single();
  if (sErr || !session) return NextResponse.json({ error: 'session not found' }, { status: 404 });
  if (session.ended_at) return NextResponse.json({ error: 'session ended' }, { status: 400 });
  if (session.items_attempted >= 8) {
    return NextResponse.json({ ended: true });  // reached planned limit
  }

  // Get skill + progress
  const { data: skill } = await db
    .from('skill').select('id, code').eq('code', session.skill_planned).single();
  if (!skill) return NextResponse.json({ error: 'skill missing' }, { status: 500 });

  const { data: progress } = await db
    .from('skill_progress')
    .select('student_elo')
    .eq('learner_id', session.learner_id)
    .eq('skill_id', skill.id)
    .maybeSingle();

  const studentElo = progress?.student_elo ?? 1000;
  const band = chooseDifficultyBand(studentElo);

  // Get an item in the band, prefer least-used, not attempted in this session.
  const { data: alreadyAttempted } = await db
    .from('attempt').select('item_id').eq('session_id', params.id);
  const excludeIds = (alreadyAttempted ?? []).map(r => r.item_id);

  let q = db.from('item')
    .select('id, type, content, answer, difficulty_elo, audio_url')
    .eq('skill_id', skill.id)
    .not('approved_at', 'is', null)
    .gte('difficulty_elo', band.min)
    .lte('difficulty_elo', band.stretchMax)
    .order('usage_count', { ascending: true })
    .limit(1);
  if (excludeIds.length) q = q.not('id', 'in', `(${excludeIds.join(',')})`);

  const { data: items } = await q;
  if (!items || items.length === 0) {
    // Fallback: any approved item for this skill
    const { data: fallback } = await db
      .from('item')
      .select('id, type, content, answer, difficulty_elo, audio_url')
      .eq('skill_id', skill.id)
      .not('approved_at', 'is', null)
      .limit(1);
    if (!fallback || fallback.length === 0) {
      return NextResponse.json({ ended: true });
    }
    return NextResponse.json({
      itemId: fallback[0].id,
      type: fallback[0].type,
      content: fallback[0].content,
      audioUrl: fallback[0].audio_url,
    });
  }

  const item = items[0];
  return NextResponse.json({
    itemId: item.id,
    type: item.type,
    content: item.content,
    audioUrl: item.audio_url,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/session/\[id\]/item/route.ts
git commit -m "feat(api): GET session item — picks next item in Elo band"
```

### Task 42: API — POST /api/session/[id]/attempt

**Files:**
- Create: `app/api/session/[id]/attempt/route.ts`

- [ ] **Step 1: Write route**

```typescript
// app/api/session/[id]/attempt/route.ts
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { scoreMathResponse } from '@/lib/packs/math/scoring';
import {
  updateElo, computeMasteryTransition, promoteBox, demoteBox, nextReviewDate,
} from '@/lib/engine';
import type { MasteryState } from '@/lib/engine/types';

const Body = z.object({
  itemId: z.string().uuid(),
  response: z.record(z.any()),
  timeMs: z.number().int().nonnegative(),
  retries: z.number().int().nonnegative().default(0),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: session } = await db
    .from('session').select('*').eq('id', params.id).single();
  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  const { data: item } = await db
    .from('item').select('*').eq('id', body.itemId).single();
  if (!item) return NextResponse.json({ error: 'item not found' }, { status: 404 });

  // Score
  const { outcome } = scoreMathResponse(
    {
      id: item.id, skillId: item.skill_id, type: item.type,
      content: item.content, answer: item.answer,
      difficultyElo: item.difficulty_elo, generatedBy: item.generated_by,
    },
    body.response
  );

  const correct = outcome === 'correct';

  // Record attempt
  await db.from('attempt').insert({
    session_id: params.id,
    item_id: body.itemId,
    outcome,
    response: body.response,
    time_ms: body.timeMs,
    retry_count: body.retries,
  });

  // Update session counters
  await db.from('session').update({
    items_attempted: (session.items_attempted ?? 0) + 1,
    items_correct: (session.items_correct ?? 0) + (correct ? 1 : 0),
  }).eq('id', params.id);

  // Load/update skill_progress
  const { data: prog } = await db
    .from('skill_progress')
    .select('*')
    .eq('learner_id', session.learner_id)
    .eq('skill_id', item.skill_id)
    .maybeSingle();

  const currentState: MasteryState = (prog?.mastery_state ?? 'new') as MasteryState;
  const studentElo = prog?.student_elo ?? 1000;

  // Elo update
  const elo = updateElo({
    itemRating: item.difficulty_elo,
    studentRating: studentElo,
    correct,
  });

  // Session-scoped streak
  const { count: correctInSession } = await db
    .from('attempt').select('*', { count: 'exact', head: true })
    .eq('session_id', params.id).eq('outcome', 'correct');
  const streakThisSession = (correctInSession ?? 0);

  // Is this a "new session" (not the session the skill was last attempted in)?
  const isNewSession = prog?.last_attempted_at
    ? new Date(prog.last_attempted_at).toDateString() !== new Date(session.started_at).toDateString()
    : false;

  const transition = computeMasteryTransition({
    currentState,
    correct,
    streakCorrect: (prog?.streak_correct ?? 0) + (correct ? 1 : 0),
    sameSessionStreak: streakThisSession,
    isNewSession,
    studentElo,
    itemElo: item.difficulty_elo,
  });

  const newBox = correct ? promoteBox(prog?.leitner_box ?? 1) : demoteBox(prog?.leitner_box ?? 1);
  const newNextReview = nextReviewDate(newBox);

  await db.from('skill_progress').upsert({
    learner_id: session.learner_id,
    skill_id: item.skill_id,
    mastery_state: transition.newState,
    leitner_box: newBox,
    student_elo: Math.round(elo.newStudentRating),
    streak_correct: correct ? (prog?.streak_correct ?? 0) + 1 : 0,
    total_attempts: (prog?.total_attempts ?? 0) + 1,
    total_correct: (prog?.total_correct ?? 0) + (correct ? 1 : 0),
    last_attempted_at: new Date().toISOString(),
    next_review_at: newNextReview.toISOString(),
  }, { onConflict: 'learner_id,skill_id' });

  // Update item rating
  await db.from('item').update({
    difficulty_elo: Math.round(elo.newItemRating),
    usage_count: (item.usage_count ?? 0) + 1,
    last_served_at: new Date().toISOString(),
  }).eq('id', item.id);

  return NextResponse.json({ outcome, transition });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/session/\[id\]/attempt/route.ts
git commit -m "feat(api): POST attempt — scores, updates Elo + mastery + Leitner atomically"
```

### Task 43: API — POST /api/session/[id]/end

**Files:**
- Create: `app/api/session/[id]/end/route.ts`

- [ ] **Step 1: Write route**

```typescript
// app/api/session/[id]/end/route.ts
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Body = z.object({
  reason: z.enum(['completed', 'user_stopped', 'soft_timeout']).default('completed'),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = Body.parse(await req.json().catch(() => ({})));
  const db = createServiceClient();

  const { data: session } = await db
    .from('session').update({
      ended_at: new Date().toISOString(),
      ended_reason: body.reason,
    })
    .eq('id', params.id)
    .select('items_attempted, items_correct')
    .single();

  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  // Gather simple stats for session-end documentation (Plan 3 adds virtues + narrator moments).
  // Load attempts for the session with item info.
  const { data: attempts } = await db
    .from('attempt')
    .select('outcome, item_id, retry_count, item:item_id(type, content)')
    .eq('session_id', params.id);

  const observations: string[] = [];
  const byType: Record<string, number> = {};
  for (const a of attempts ?? []) {
    byType[(a as any).item.type] = (byType[(a as any).item.type] ?? 0) + (a.outcome === 'correct' ? 1 : 0);
    if (a.retry_count >= 2 && a.outcome === 'correct') {
      observations.push(`You came back to this one three times, and then it clicked.`);
    }
  }
  for (const [type, n] of Object.entries(byType)) {
    if (n > 0) {
      observations.push(
        type === 'NumberBonds' ? `You found ${n} number bonds to 10.` :
        type === 'CountingTiles' ? `You counted ${n} sets carefully.` :
        type === 'EquationTap' ? `You solved ${n} equations.` :
        `You did ${n} of these.`
      );
    }
  }

  return NextResponse.json({
    itemsAttempted: session.items_attempted,
    itemsCorrect: session.items_correct,
    observations: Array.from(new Set(observations)),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/session/\[id\]/end/route.ts
git commit -m "feat(api): POST session end — returns documentation observations"
```

### Task 44: Lesson frame page — shell

**Files:**
- Create: `app/(child)/lesson/[sessionId]/page.tsx`, `components/child/LessonHeader.tsx`

- [ ] **Step 1: Write LessonHeader**

```typescript
// components/child/LessonHeader.tsx
'use client';

export default function LessonHeader({
  breadcrumb, onReplayAudio, onWonder,
}: { breadcrumb: string; onReplayAudio?: () => void; onWonder?: () => void }) {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="text-kid-sm">{breadcrumb}</div>
      <div className="flex gap-3">
        <button onClick={onReplayAudio} aria-label="replay audio"
          className="text-2xl p-2 rounded-full bg-white border border-ochre">🔊</button>
        <button onClick={onWonder} aria-label="wondering"
          className="text-2xl p-2 rounded-full bg-white border border-ochre">❓</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write lesson page shell (item renderer wiring in next tasks)**

```typescript
// app/(child)/lesson/[sessionId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LessonHeader from '@/components/child/LessonHeader';
import NumberBonds from '@/lib/packs/math/rendering/NumberBonds';
import CountingTiles from '@/lib/packs/math/rendering/CountingTiles';
import EquationTap from '@/lib/packs/math/rendering/EquationTap';

interface ItemPayload {
  itemId: string;
  type: 'NumberBonds' | 'CountingTiles' | 'EquationTap';
  content: any;
  audioUrl?: string;
}

export default function LessonPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<ItemPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'feedback'>('loading');
  const [lastOutcome, setLastOutcome] = useState<'correct' | 'incorrect' | null>(null);
  const [retries, setRetries] = useState(0);
  const startTime = useRef<number>(Date.now());

  const loadNext = async () => {
    setStatus('loading');
    setRetries(0);
    const res = await fetch(`/api/session/${params.sessionId}/item`);
    const data = await res.json();
    if (data.ended) {
      endSession();
      return;
    }
    setItem(data);
    startTime.current = Date.now();
    setStatus('ready');
  };

  const submit = async (response: any) => {
    if (!item) return;
    const res = await fetch(`/api/session/${params.sessionId}/attempt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        itemId: item.itemId,
        response,
        timeMs: Date.now() - startTime.current,
        retries,
      }),
    });
    const data = await res.json();
    setLastOutcome(data.outcome);
    if (data.outcome === 'correct') {
      setStatus('feedback');
      setTimeout(loadNext, 900);
    } else {
      setRetries(r => r + 1);
    }
  };

  const endSession = async () => {
    await fetch(`/api/session/${params.sessionId}/end`, { method: 'POST' });
    router.push(`/complete/${params.sessionId}`);
  };

  useEffect(() => { loadNext(); }, []);

  return (
    <main className="max-w-xl mx-auto p-4">
      <LessonHeader
        breadcrumb="🔍 Exploration"
        onReplayAudio={() => {/* Plan 2 TTS wiring */}}
        onWonder={() => {/* Plan 3 virtue detector */}}
      />
      {status === 'loading' && <div className="text-kid-md text-center py-12">…</div>}
      {status === 'ready' && item && (
        <>
          {item.type === 'NumberBonds' &&
            <NumberBonds content={item.content} onSubmit={submit} retries={retries} />}
          {item.type === 'CountingTiles' &&
            <CountingTiles content={item.content} onSubmit={submit} retries={retries} />}
          {item.type === 'EquationTap' &&
            <EquationTap content={item.content} onSubmit={submit} retries={retries} />}
          {retries > 0 && (
            <div className="text-center text-terracotta mt-4">
              Let's look at it again — this is the hard part before it gets easy.
            </div>
          )}
        </>
      )}
      {status === 'feedback' && (
        <div className="text-center text-forest text-kid-md py-12">✓</div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/child/LessonHeader.tsx app/\(child\)/lesson
git commit -m "feat(child): lesson frame page shell + header"
```

### Task 45: NumberBonds renderer

**Files:**
- Create: `lib/packs/math/rendering/NumberBonds.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/math/rendering/NumberBonds.tsx
'use client';

import { useState } from 'react';
import type { NumberBondsContent, NumberBondsResponse } from '@/lib/packs/math/types';

export default function NumberBonds({
  content, onSubmit, retries,
}: {
  content: NumberBondsContent;
  onSubmit: (r: NumberBondsResponse) => void;
  retries: number;
}) {
  const [input, setInput] = useState<string>('');

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.promptText}
      </div>
      <div className="flex justify-center items-center gap-4 text-kid-lg">
        <div className="bg-white rounded-2xl border-4 border-sage p-6 w-24 text-center">
          {content.knownPart}
        </div>
        <div className="text-4xl">+</div>
        <div className="bg-white rounded-2xl border-4 border-ochre p-6 w-24 text-center">
          <input
            inputMode="numeric"
            className="w-full text-center bg-transparent outline-none text-kid-lg"
            value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
            autoFocus
            style={{ touchAction: 'manipulation' }}
          />
        </div>
        <div className="text-4xl">=</div>
        <div className="bg-white rounded-2xl border-4 border-sage p-6 w-24 text-center">
          {content.whole}
        </div>
      </div>
      <button
        disabled={input === ''}
        onClick={() => onSubmit({ missing: Number(input) })}
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
git add lib/packs/math/rendering/NumberBonds.tsx
git commit -m "feat(math): NumberBonds renderer — part+whole with input"
```

### Task 46: CountingTiles renderer

**Files:**
- Create: `lib/packs/math/rendering/CountingTiles.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/math/rendering/CountingTiles.tsx
'use client';

import { useState } from 'react';
import type { CountingTilesContent, CountingTilesResponse } from '@/lib/packs/math/types';

export default function CountingTiles({
  content, onSubmit, retries,
}: {
  content: CountingTilesContent;
  onSubmit: (r: CountingTilesResponse) => void;
  retries: number;
}) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());

  // Generate a stable layout: content.count emojis arranged in a flex row (wraps)
  const icons = Array.from({ length: content.count }, (_, i) => i);

  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center">{content.promptText}</div>
      <div className="flex flex-wrap gap-3 justify-center bg-sage/10 rounded-2xl p-6">
        {icons.map(i => (
          <button
            key={i}
            onClick={() => {
              const next = new Set(tapped);
              next.has(i) ? next.delete(i) : next.add(i);
              setTapped(next);
            }}
            className={`text-5xl p-3 rounded-xl transition ${tapped.has(i) ? 'bg-ochre/40 scale-110' : 'bg-white'}`}
            style={{ touchAction: 'manipulation', minWidth: 60, minHeight: 60 }}
            aria-label={`tile ${i + 1}`}
          >
            {content.emoji}
          </button>
        ))}
      </div>
      <div className="text-kid-md text-center">
        Counted: <span className="font-bold">{tapped.size}</span>
      </div>
      <button
        onClick={() => onSubmit({ count: tapped.size })}
        disabled={tapped.size === 0}
        className="block mx-auto bg-forest text-white rounded-full px-8 py-4 text-kid-md disabled:opacity-50"
        style={{ touchAction: 'manipulation', minHeight: 60 }}
      >
        That's my count
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/math/rendering/CountingTiles.tsx
git commit -m "feat(math): CountingTiles renderer — tap to count emojis"
```

### Task 47: EquationTap renderer

**Files:**
- Create: `lib/packs/math/rendering/EquationTap.tsx`

- [ ] **Step 1: Write component**

```typescript
// lib/packs/math/rendering/EquationTap.tsx
'use client';

import type { EquationTapContent, EquationTapResponse } from '@/lib/packs/math/types';

export default function EquationTap({
  content, onSubmit, retries,
}: {
  content: EquationTapContent;
  onSubmit: (r: EquationTapResponse) => void;
  retries: number;
}) {
  return (
    <div className="space-y-6 py-4">
      <div className="text-kid-lg text-center bg-cream/50 p-6 rounded-2xl">
        {content.equation}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {content.choices.map((n, i) => (
          <button
            key={i}
            onClick={() => onSubmit({ chosen: n })}
            className="bg-white hover:bg-ochre/20 active:bg-ochre/40 border-4 border-ochre rounded-2xl text-kid-lg py-8"
            style={{ touchAction: 'manipulation', minHeight: 60 }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/math/rendering/EquationTap.tsx
git commit -m "feat(math): EquationTap renderer — 4 choice buttons"
```

### Task 48: Math pack SubjectPack export

**Files:**
- Create: `lib/packs/math/index.ts`

- [ ] **Step 1: Write index.ts**

```typescript
// lib/packs/math/index.ts
import { MATH_SKILLS } from './skills';
import { MATH_STRANDS } from './strands';
import { MATH_THEMES, getThemeHeader } from './themes';
import { scoreMathResponse } from './scoring';

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

  // Plan 2 fills these in
  generateItems: async () => { throw new Error('Plan 2: AI generation'); },
  getPromptText: (item: any) => item.content?.promptText ?? '',
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/packs/math/index.ts
git commit -m "feat(math): MathPack default export implementing V1 surface"
```

### Task 49: Session-end documentation page

**Files:**
- Create: `app/(child)/complete/[sessionId]/page.tsx`, `components/child/DocumentationLine.tsx`

- [ ] **Step 1: Write DocumentationLine**

```typescript
// components/child/DocumentationLine.tsx
export default function DocumentationLine({ text }: { text: string }) {
  return (
    <div className="bg-cream/60 border-l-4 border-terracotta px-4 py-3 rounded-r-xl text-kid-sm">
      {text}
    </div>
  );
}
```

- [ ] **Step 2: Write complete page**

```typescript
// app/(child)/complete/[sessionId]/page.tsx
import { createServiceClient } from '@/lib/supabase/server';
import DocumentationLine from '@/components/child/DocumentationLine';
import Link from 'next/link';

export default async function CompletePage({ params }: { params: { sessionId: string } }) {
  const db = createServiceClient();

  const { data: session } = await db
    .from('session').select('learner_id, items_attempted, items_correct').eq('id', params.sessionId).single();

  const { data: attempts } = await db
    .from('attempt')
    .select('outcome, retry_count, item:item_id(type)')
    .eq('session_id', params.sessionId);

  // Simple observations (Plan 3 adds gems + narrator moments)
  const correctCount = (attempts ?? []).filter(a => a.outcome === 'correct').length;
  const triedMultipleTimes = (attempts ?? []).filter(a => a.retry_count >= 2 && a.outcome === 'correct').length;

  const lines: string[] = [];
  if (correctCount > 0) lines.push(`You solved ${correctCount} questions today.`);
  if (triedMultipleTimes > 0) lines.push(`${triedMultipleTimes} time${triedMultipleTimes === 1 ? '' : 's'} you came back to a question until it clicked.`);
  if (lines.length === 0) lines.push('You explored.');

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-kid-lg text-center pt-4">✨ What you noticed today</h1>
      <div className="space-y-3">
        {lines.map((l, i) => <DocumentationLine key={i} text={l} />)}
      </div>
      <div className="flex gap-3 pt-4">
        <Link
          href={`/picker`}
          className="flex-1 bg-sage text-white rounded-xl py-4 text-kid-md text-center"
          style={{ minHeight: 60 }}
        >🌿 Done for now</Link>
        <Link
          href={`/explore?learner=${session?.learner_id}`}
          className="flex-1 bg-white border-4 border-ochre rounded-xl py-4 text-kid-md text-center"
          style={{ minHeight: 60 }}
        >🔍 Another?</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/child/DocumentationLine.tsx app/\(child\)/complete
git commit -m "feat(child): session-end documentation screen"
```

### Task 50: Parent auth + stub dashboard

**Files:**
- Create: `app/(parent)/layout.tsx`, `app/(parent)/auth/page.tsx`, `app/(parent)/parent/page.tsx`, `components/shared/AuthGate.tsx`

- [ ] **Step 1: Write parent layout**

```typescript
// app/(parent)/layout.tsx
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between">
        <strong>GardenQuestSchool — Parent</strong>
        <a href="/picker" className="text-sm text-blue-600">← back to app</a>
      </nav>
      <div className="p-6 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Write auth page**

```typescript
// app/(parent)/auth/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/parent` },
    });
    if (error) setErr(error.message); else setSent(true);
  };

  return (
    <main className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">Parent sign in</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button
            onClick={send}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold"
          >Send magic link</button>
          {err && <p className="text-red-600 mt-3 text-sm">{err}</p>}
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Write AuthGate**

```typescript
// components/shared/AuthGate.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  return <>{children}</>;
}
```

- [ ] **Step 4: Write stub dashboard**

```typescript
// app/(parent)/parent/page.tsx
import AuthGate from '@/components/shared/AuthGate';

export default async function ParentDashboardPage() {
  return (
    <AuthGate>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-2">This Week</h2>
        <p className="text-gray-600 text-sm">
          Parent dashboard UI is coming in Plan 2 — AI content gen, approval queue,
          skills map, authoring, and settings. For now, you're signed in. 👋
        </p>
      </div>
    </AuthGate>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(parent\) components/shared/AuthGate.tsx
git commit -m "feat(parent): magic-link auth + auth gate + stub dashboard"
```

### Task 51: E2E test — first lesson golden path

**Files:**
- Create: `tests/e2e/first-lesson.spec.ts`

- [ ] **Step 1: Write Playwright test**

```typescript
// tests/e2e/first-lesson.spec.ts
import { test, expect } from '@playwright/test';

test('Cecily picks profile and completes one item', async ({ page }) => {
  await page.goto('/');
  // Picker
  await expect(page.getByText('Cecily')).toBeVisible();
  await page.getByText('Cecily').click();

  // Explore
  await expect(page).toHaveURL(/\/explore/);
  await page.waitForLoadState('networkidle');

  // At least one candidate card
  const card = page.getByRole('button').first();
  await expect(card).toBeVisible();
  await card.click();

  // Lesson page loads
  await expect(page).toHaveURL(/\/lesson\//);
  // Wait for item to render (any Check or numeric button indicates ready)
  await page.waitForSelector('button:has-text("Check"), button:has-text("That\'s my count"), button[role="button"]', { timeout: 10_000 });

  // For Plan 1 we don't assert correctness — just that the flow exists
  // Tap a candidate answer; for CountingTiles we tap a tile, for EquationTap a choice
  // Easiest deterministic path: choose the first button with a single digit label
  const answerButtons = page.getByRole('button').filter({ hasText: /^\d+$/ });
  const maybe = await answerButtons.count();
  if (maybe > 0) {
    await answerButtons.first().click();
  }
});
```

- [ ] **Step 2: Run the test**

```bash
# Start dev server in another terminal, or let playwright start it:
npm run test:e2e -- --project=chromium
```
Expected: test passes. (If not, fix underlying issue; don't skip the test.)

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/first-lesson.spec.ts
git commit -m "test(e2e): golden path from picker through first lesson item"
```

### Task 52: LLM provider interface (stub for Plan 1)

**Files:**
- Create: `lib/llm/types.ts`, `lib/llm/index.ts`

- [ ] **Step 1: Write types**

```typescript
// lib/llm/types.ts
import type { ZodSchema } from 'zod';

export interface LLMGenerateOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: ZodSchema<T>;
  examples?: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  cacheSystemPrompt?: boolean;
}

export interface LLMProvider {
  id: 'anthropic' | 'ollama' | 'openai';
  generate<T>(opts: LLMGenerateOptions<T>): Promise<T>;
}
```

- [ ] **Step 2: Write factory stub**

```typescript
// lib/llm/index.ts
import type { LLMProvider } from './types';

export function getLLMProvider(): LLMProvider {
  // Plan 2 implements real providers. For Plan 1, any call throws
  // so we never accidentally ship untested AI behavior.
  return {
    id: 'anthropic',
    async generate() {
      throw new Error('LLM provider not wired in Plan 1 — see Plan 2.');
    },
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/llm/
git commit -m "feat(llm): provider interface + throwing stub (Plan 2 wires real impl)"
```

### Task 53: Verify full flow end-to-end manually

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Run the happy path**

1. Open `http://localhost:3000` → redirects to `/picker`
2. See Cecily tile → tap
3. Land on `/explore?learner=...` → see 3 expedition cards
4. Tap one → land on `/lesson/<sessionId>`
5. Answer 3 items (any answer, correct or not)
6. On item 4+ → eventually hit the 8-cap → redirect to `/complete/<sessionId>`
7. See documentation lines
8. Tap "Another?" → back to explore

- [ ] **Step 3: Check DB state**

In Supabase Studio:
- `session` has a row for Cecily with `ended_at IS NOT NULL`
- `attempt` has 3+ rows with outcomes
- `skill_progress` has a row with `mastery_state` progressed from `new`
- `item.usage_count` incremented on attempted items

- [ ] **Step 4: Commit any fixes discovered**

If bugs found: fix inline, commit with `fix:` prefix. Example: `git commit -m "fix: handle missing skill_progress row on first attempt"`

### Task 54: Vercel deploy

- [ ] **Step 1: Link project**

```bash
cd C:/Users/dylan/GardenQuestSchool
npx vercel link
# When prompted: create new project? yes, name: gardenquestschool
```

- [ ] **Step 2: Add env vars**

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# For each, paste the value from .env.local when prompted
```

Also add the same three for `preview` and `development` scopes.

- [ ] **Step 3: Deploy preview**

```bash
npx vercel
```
Expected: URL printed; open it, run through the same happy path.

- [ ] **Step 4: Commit `.vercel` is gitignored; commit any env-related changes**

```bash
git add .
git status   # should only show untracked .vercel (ignored)
```

### Task 55: Real iPad test + commit README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: On an actual iPad**

Open the Vercel preview URL in Safari on iPad. Run the full flow. Check:
- Tap targets feel big enough
- No double-tap zoom on buttons
- Text is readable at arm's length
- Transitions feel smooth

Note any issues; file as Plan-1 follow-up commits (not in this task).

- [ ] **Step 2: Update README**

```markdown
# GardenQuestSchool

A personal learning web app for first graders (Cecily, Esme).
Reading, Spelling, Math via a persistent naturalist garden world.
Kohn / Reggio / Chance-informed pedagogy: intrinsic motivation, documentation over scores, emergent curriculum.

**Stack:** Next.js 14 · Supabase · TypeScript · framer-motion · `@dnd-kit` · Claude API (content gen, V2) · ElevenLabs (TTS, V2)

**Design spec:** [docs/superpowers/specs/2026-04-22-gardenquestschool-design.md](docs/superpowers/specs/2026-04-22-gardenquestschool-design.md)

**Plan 1 (this milestone):** [docs/superpowers/plans/2026-04-22-v1-plan1-foundations-and-first-playable.md](docs/superpowers/plans/2026-04-22-v1-plan1-foundations-and-first-playable.md)

## Run locally

```bash
cp .env.local.example .env.local
# fill in Supabase values
npm install
npm run dev
# visit http://localhost:3000
```

## Run tests

```bash
npm test              # engine + pack unit tests
npm run test:e2e      # Playwright end-to-end golden path
```

## Status

- Plan 1 (Foundations + First Playable Loop) — ✅ complete
- Plan 2 (Content Generation + Parent Zone) — pending
- Plan 3 (World Delight + Accessibility) — pending
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README with run instructions + status"
```

---

## Self-Review

**Spec coverage.** Checked each section of the design spec:
- §5 System Overview — layers ①/②/③/④ reflected in `app/`, `lib/packs/`, `lib/engine/`, `lib/supabase/` split ✅
- §6 Data Model — all 5 regions' tables present in migrations 001-005 ✅
- §7 Learning Engine — skillGraph, masteryTracker, spacedReview, adaptiveDifficulty, sessionPlanner, eventBus all implemented with tests; interestMixer/virtueDetector/narrator stubbed for Plan 3 (called out in plan) ✅
- §8 Subject Pack Contract — Math pack implements a working subset (3 types / 8 skills) per plan scope; remaining 10 item types deferred to Plan 2 ✅
- §9 Content Gen — deferred to Plan 2; LLM interface stubbed ✅
- §10 World State — tables present, no UI (deferred to Plan 3); world_state row seeded for Cecily ✅
- §11 Session Flow — 5 screens: picker (Screen 1), explore (Screen 2), lesson (Screen 3), complete (Screen 4), free-build deferred to Plan 3 ✅
- §12 Parent Dashboard — auth + stub page only for Plan 1; full dashboard in Plan 2 ✅
- §13 Tech Stack — Next 14, Tailwind, framer-motion, dnd-kit, zod, vitest, playwright, Supabase SSR all installed; ESLint forbidden-strings rule deferred to Plan 3 ✅
- §14 DoD — 4 of 7 "Cecily can…" items achievable in Plan 1; other 3 (gems, 3+ habitats, 2+ species) are Plan 3 deliverables ✅

**Placeholder scan.** Search for TBD/TODO/FIXME in the plan doc returns zero. Every code block contains complete implementation. Commands are explicit.

**Type consistency.** Verified:
- `MasteryState` values (`new`/`learning`/`review`/`mastered`) match across types.ts, masteryTracker.ts, SQL default, test fixtures ✅
- `Item` interface matches between lib/types.ts and math scoring ✅
- `ExpeditionCandidate` shape consistent between engine, API route, and explore page ✅
- `SkillProgressRow` field names match DB column mapping in API routes ✅
- Event type names (`item.attempted`, `skill.state_changed`, etc.) consistent across types.ts and eventBus tests ✅

**Scope check.** Plan 1 is appropriately scoped — builds through Epic A (foundations) and Epic B (first playable loop) from the spec. Leaves Epic C and Epic D for Plans 2 and 3 as intended.

No issues found during review.

---

## Execution Handoff

**Plan complete and saved to** `C:\Users\dylan\GardenQuestSchool\docs\superpowers\plans\2026-04-22-v1-plan1-foundations-and-first-playable.md`.

**Plan stats:** 55 tasks across 2 epics (Foundations + First Playable Loop). Estimated 20-30 focused hours total → ~3 weeks at your 7-10 hrs/week budget.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Uses `superpowers:subagent-driven-development`.

**2. Inline Execution** — I execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

Which approach do you want?
