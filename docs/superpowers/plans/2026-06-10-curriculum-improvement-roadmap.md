# Curriculum Improvement Roadmap + Phase 1 (Interest Signal Wiring) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate the emergent-curriculum loop (world actions -> interest signals -> session planning), then close the remaining verified curriculum gaps in later phases.

**Architecture:** A new `interest_signal` table records tagged events from world actions (habitat builds, flora discoveries). A pure engine function decays signal weights per-session (0.6x/session, per design spec) and aggregates them by tag. The candidates route feeds the decayed tags into `generateExpeditionCandidates`, which already scores skills by `themeTags` overlap (`tagBonus * 5`) — that consumption side is built and tested; only the producing side is missing.

**Tech Stack:** Next.js 14 route handlers, Supabase (Postgres + RLS), TypeScript, vitest.

---

## Context: corrected curriculum review findings (2026-06-10)

An initial review pass (subagent-based) claimed several gaps that **direct verification disproved**. Record of ground truth so future sessions don't re-litigate:

| Claim | Verdict | Evidence |
|---|---|---|
| "Math skills have only 1 item each; bank exhausts in weeks" | **FALSE** | `buildMathItems()` produces **2,029 items** across 46 skills (thinnest: `skip_5s` at 11). Live DB confirmed in sync: 2,500 items total (2,029 math + 471 reading). README's "~52 items" is stale. |
| "Baseline Elo not applied on learner creation" | **FALSE** | `app/api/learner/route.ts:54-101` seeds grade-appropriate baseline mastery; `app/api/learner/[id]/apply-baseline/route.ts` + parent UI button also exist. |
| "Interest mixer dead-wired — planner always gets `interestTagDecay: []`" | **TRUE** | `app/api/plan/candidates/route.ts:65` hardcodes `[]`. No code anywhere emits interest signals. |
| "Geometry (1.G) and length measurement (1.MD.A) absent" | **TRUE** | `lib/packs/math/skills.ts` measurement strand = time/money/fractions only. No shape/length skills exist. |
| "Word problems are template-cycled, all result-unknown structure" | **TRUE** | 25 add + 25 subtract + 15 two-step, all `a±b=?` EquationTap; no compare / part-part-whole / start-unknown structures (CCSS 1.OA.A.1). |
| "`generateItems` throws Plan 3 placeholder" | **TRUE** | `lib/packs/math/index.ts:42`. Low urgency given 2,500-item bank. |

### Phase order (revisit this doc when picking up a new phase)

1. **Interest signal wiring** — THIS PLAN (detailed tasks below).
2. **Geometry + length measurement** — new skills `math.geometry.shape_identify`, `math.geometry.compose`, `math.geometry.partition_halves_quarters` (CCSS 1.G.A.1-3), `math.measure.length_compare`, `math.measure.length_nonstandard_units` (1.MD.A.1-2). Two new renderers: ShapeTap (reuse FractionIdentify's SVG approach — partitioning halves/quarters is nearly the same component) and LengthCompare (garden-themed objects: twigs, leaves, caterpillars; "how many acorns long?"). Seed items in `scripts/seed-math.ts` following its existing per-skill block + Elo-pricing conventions. **Needs its own detailed plan.**
3. **Word-problem structural variety** — add compare ("who has more?"), part-part-whole, and start-unknown problem structures to the existing word-problem skills in `scripts/seed-math.ts`. Optionally an interim CLI (`scripts/gen-items.ts`) that drafts items via Claude into JSON for manual review + seeding — defers the full Plan 3 pipeline (cron/critic/approval UI). **Needs its own detailed plan.**
4. **Reading polish** (not urgent — 471 items, healthy scope & sequence): minimal-pair silent-e items (cap/cape comparison so the rule is discovered, not stated); phonologically-similar distractors for SightWordTap (currently random pool picks); 1-2 decodable connected-text items per phonics skill. **Needs its own detailed plan.**

Also: update README's stale "~52 hand-authored items" line when convenient.

---

## Phase 1: Interest Signal Wiring — detailed tasks

### Design decisions

- **Decay model:** effective weight = `rawWeight * 0.6^(sessions started since signal)`, dropped below 0.05, summed per tag, capped at 2.0 per tag. Cap rationale: planner scores `tagBonus * 5`; cap 2.0 -> max +10, equal to "new skill" priority, so interests nudge but never outrank due reviews (+50).
- **Tag vocabulary:** interest tags MUST be drawn from the union of skill `themeTags` (else they match nothing). Nature tags that exist in skills today: `ants, bees, butterflies, flowers, frogs, insects, nature, plants`. A validator test enforces this.
- **Emission points (this phase):** habitat build (deliberate choice, weight 1.0) and first flora identification on a naturalist walk (weight 0.5). Journal-view signals deferred — GET-based emission would overcount.
- **Signal inserts are non-fatal:** a failed signal insert must never fail the world action that triggered it.

### Task 1: Pure decay/aggregation function in the engine

**Files:**
- Modify: `lib/engine/interestMixer.ts` (replace unused `decayTags` — it has no callers outside this file)
- Test: `tests/engine/interestMixer.test.ts` (create)
- Check: `lib/engine/index.ts` — update export if `decayTags` is re-exported there

- [ ] **Step 1: Write the failing tests**

```ts
// tests/engine/interestMixer.test.ts
import { describe, it, expect } from 'vitest';
import { computeInterestTagDecay } from '@/lib/engine/interestMixer';

const d = (iso: string) => new Date(iso);

describe('computeInterestTagDecay', () => {
  it('returns full weight when no sessions have started since the signal', () => {
    const out = computeInterestTagDecay(
      [{ tag: 'frogs', weight: 1, createdAt: d('2026-06-10T10:00:00Z') }],
      [d('2026-06-09T10:00:00Z')], // session BEFORE the signal — no decay
    );
    expect(out).toEqual([{ tag: 'frogs', weight: 1 }]);
  });

  it('decays 0.6x per session started after the signal', () => {
    const out = computeInterestTagDecay(
      [{ tag: 'bees', weight: 1, createdAt: d('2026-06-01T00:00:00Z') }],
      [d('2026-06-02T00:00:00Z'), d('2026-06-03T00:00:00Z')],
    );
    expect(out[0].weight).toBeCloseTo(0.36);
  });

  it('drops signals decayed below 0.05', () => {
    const sessions = [1, 2, 3, 4, 5, 6].map(n => d(`2026-06-0${n}T12:00:00Z`));
    const out = computeInterestTagDecay(
      [{ tag: 'ants', weight: 1, createdAt: d('2026-06-01T00:00:00Z') }],
      sessions, // 0.6^6 ≈ 0.047 < 0.05
    );
    expect(out).toEqual([]);
  });

  it('sums multiple signals for the same tag and caps at 2.0', () => {
    const out = computeInterestTagDecay(
      [
        { tag: 'flowers', weight: 1, createdAt: d('2026-06-10T00:00:00Z') },
        { tag: 'flowers', weight: 1, createdAt: d('2026-06-10T01:00:00Z') },
        { tag: 'flowers', weight: 1, createdAt: d('2026-06-10T02:00:00Z') },
      ],
      [],
    );
    expect(out).toEqual([{ tag: 'flowers', weight: 2 }]);
  });

  it('sorts descending by weight and handles empty input', () => {
    expect(computeInterestTagDecay([], [])).toEqual([]);
    const out = computeInterestTagDecay(
      [
        { tag: 'ants', weight: 0.5, createdAt: d('2026-06-10T00:00:00Z') },
        { tag: 'frogs', weight: 1, createdAt: d('2026-06-10T00:00:00Z') },
      ],
      [],
    );
    expect(out.map(t => t.tag)).toEqual(['frogs', 'ants']);
  });
});
```

- [ ] **Step 2: Run, verify it fails** — `npx vitest run tests/engine/interestMixer.test.ts` -> FAIL (`computeInterestTagDecay` not exported)

- [ ] **Step 3: Implement**

```ts
// lib/engine/interestMixer.ts  (replaces the unused decayTags)
export interface RawInterestSignal { tag: string; weight: number; createdAt: Date }

const DECAY_PER_SESSION = 0.6;
const MIN_WEIGHT = 0.05;
const MAX_TAG_WEIGHT = 2.0;

/**
 * Decays each signal 0.6x for every session started after it (the
 * design-spec "0.6x/session" rule), drops the dust (<0.05), then
 * aggregates by tag. The per-tag cap keeps stacked signals from
 * outranking due reviews in the planner (cap 2.0 -> tagBonus*5 = +10,
 * the same priority as a brand-new skill).
 */
export function computeInterestTagDecay(
  signals: RawInterestSignal[],
  sessionStarts: Date[],
): Array<{ tag: string; weight: number }> {
  const byTag = new Map<string, number>();
  for (const s of signals) {
    const sessionsSince = sessionStarts.filter(
      t => t.getTime() > s.createdAt.getTime(),
    ).length;
    const effective = s.weight * Math.pow(DECAY_PER_SESSION, sessionsSince);
    if (effective < MIN_WEIGHT) continue;
    byTag.set(s.tag, (byTag.get(s.tag) ?? 0) + effective);
  }
  return Array.from(byTag.entries())
    .map(([tag, weight]) => ({ tag, weight: Math.min(weight, MAX_TAG_WEIGHT) }))
    .sort((a, b) => b.weight - a.weight);
}
```

- [ ] **Step 4: Run, verify pass** — `npx vitest run tests/engine/interestMixer.test.ts` -> PASS; then full suite `npm test` -> PASS
- [ ] **Step 5: Commit** — `git commit -m "feat(engine): computeInterestTagDecay — per-session interest decay + tag aggregation"`

### Task 2: `interest_signal` migration

**Files:**
- Create: `lib/supabase/migrations/012_interest_signal.sql`

- [ ] **Step 1: Write the migration** (style matches `010_garden_plot.sql`)

```sql
-- 012_interest_signal.sql
--
-- Interest signals: world actions (building a habitat, discovering a
-- flora species) emit tagged events. The session planner decays these
-- 0.6x per session and biases expedition candidates toward matching
-- skill themeTags. This is the "emergent curriculum" loop from the
-- 2026-04-22 design spec.
--
-- Idempotent (uses `if not exists`).

create table if not exists interest_signal (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  tag text not null,                -- must match a skill themeTag to have effect
  weight numeric not null default 1.0,
  source text not null,             -- 'habitat_build' | 'naturalist_identify'
  created_at timestamptz not null default now()
);

create index if not exists interest_signal_learner_created_idx
  on interest_signal(learner_id, created_at desc);

alter table interest_signal enable row level security;

drop policy if exists "interest_signal owned via learner" on interest_signal;
create policy "interest_signal owned via learner" on interest_signal for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
```

- [ ] **Step 2: Apply** — `npm run db:migrate` if `DATABASE_URL` is in `.env.local`; otherwise paste into Supabase SQL Editor (README documents this as the established path). Verify: insert+select+delete a probe row via service client.
- [ ] **Step 3: Commit** — `git commit -m "feat(db): interest_signal table for emergent-curriculum signals"`

### Task 3: Habitat catalog interest tags + vocabulary validator

**Files:**
- Modify: `lib/world/habitatCatalog.ts` (add `interestTags` to interface + all 7 entries)
- Test: `tests/world/habitatCatalog.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/habitatCatalog.test.ts
import { describe, it, expect } from 'vitest';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills'; // confirm export name at implementation time

describe('habitat interest tags', () => {
  const knownTags = new Set(
    [...MATH_SKILLS, ...READING_SKILLS].flatMap(s => s.themeTags),
  );

  it('every habitat has at least one interest tag', () => {
    for (const h of HABITAT_CATALOG) {
      expect(h.interestTags.length, h.code).toBeGreaterThan(0);
    }
  });

  it('every interest tag matches a real skill themeTag (else it can never bias anything)', () => {
    for (const h of HABITAT_CATALOG) {
      for (const tag of h.interestTags) {
        expect(knownTags.has(tag), `${h.code}: '${tag}' matches no skill themeTag`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run, verify fail** -> `interestTags` undefined
- [ ] **Step 3: Implement** — add `interestTags: string[]` to `HabitatTypeData` and to each entry:

| habitat | interestTags |
|---|---|
| ant_hill | `['ants', 'insects', 'counting']` |
| butterfly_bush | `['butterflies', 'insects', 'flowers']` |
| bee_hotel | `['bees', 'insects', 'part_whole']` |
| frog_pond | `['frogs', 'nature']` |
| bunny_burrow | `['nature', 'subtract']` |
| log_pile | `['insects', 'nature', 'patterns']` |
| operations_cave | `['regrouping', 'mental_math']` |

- [ ] **Step 4: Run, verify pass**; full suite
- [ ] **Step 5: Commit** — `git commit -m "feat(world): habitat interestTags + vocabulary validator test"`

### Task 4: Emit signals on habitat build

**Files:**
- Modify: `app/api/garden/habitat/build/route.ts` (after the successful insert, before the final return)

- [ ] **Step 1: Implement** (non-fatal; skip when `alreadyBuilt`)

```ts
  // Emit interest signals — the child CHOSE this habitat, so bias the
  // next sessions toward its themes. Non-fatal: a logging failure must
  // never break the build.
  const { error: sigErr } = await db.from('interest_signal').insert(
    habitat.interestTags.map(tag => ({
      learner_id: body.learnerId,
      tag,
      weight: 1.0,
      source: 'habitat_build',
    })),
  );
  if (sigErr) console.error('interest_signal insert failed:', sigErr.message);
```

- [ ] **Step 2: Verify** — typecheck (`npx tsc --noEmit`) + full test suite
- [ ] **Step 3: Commit** — `git commit -m "feat(world): habitat builds emit interest signals"`

### Task 5: Emit signals on first flora identification

**Files:**
- Modify: `app/api/naturalist/walk/identified/route.ts` (in the `isNew` branch, after successful insert)
- Check: `lib/naturalist` flora catalog for a tree/flower kind field; tags = trees -> `['plants', 'nature']`, flowers -> `['flowers', 'plants', 'nature']`. Weight 0.5 (discovery is lighter-touch than a deliberate build).

- [ ] **Step 1: Implement**

```ts
  // First discovery of this species — emit gentle interest signals so
  // the planner can surface plant/flower-themed skills next session.
  const FLORA_TAGS = isFlower ? ['flowers', 'plants', 'nature'] : ['plants', 'nature'];
  const { error: sigErr } = await db.from('interest_signal').insert(
    FLORA_TAGS.map(tag => ({
      learner_id: body.learnerId,
      tag,
      weight: 0.5,
      source: 'naturalist_identify',
    })),
  );
  if (sigErr) console.error('interest_signal insert failed:', sigErr.message);
```

- [ ] **Step 2: Verify** — typecheck + full suite
- [ ] **Step 3: Commit** — `git commit -m "feat(naturalist): first flora identification emits interest signals"`

### Task 6: Consume signals in the candidates route

**Files:**
- Modify: `app/api/plan/candidates/route.ts:61-66`

- [ ] **Step 1: Implement** — replace the hardcoded `interestTagDecay: []`:

```ts
  // Emergent curriculum: fetch recent interest signals + the sessions
  // started since each, decay 0.6x/session, and bias candidate scoring
  // toward matching skill themeTags.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: signalRows }, { data: sessionRows }] = await Promise.all([
    db.from('interest_signal')
      .select('tag, weight, created_at')
      .eq('learner_id', learnerId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('session')
      .select('started_at')
      .eq('learner_id', learnerId)
      .gte('started_at', thirtyDaysAgo),
  ]);
  const interestTagDecay = computeInterestTagDecay(
    (signalRows ?? []).map(r => ({ tag: r.tag, weight: Number(r.weight), createdAt: new Date(r.created_at) })),
    (sessionRows ?? []).map(r => new Date(r.started_at)),
  );

  const candidates = generateExpeditionCandidates({
    skills,
    progress,
    getThemeHeader,
    interestTagDecay,
  });
```

(`computeInterestTagDecay` imported from `@/lib/engine` — confirm it's re-exported from `lib/engine/index.ts` in Task 1.)

- [ ] **Step 2: Verify** — typecheck + full suite + manual smoke: insert a `frogs` signal for Cecily, hit `/api/plan/candidates?learner=<id>`, confirm a frog-tagged skill rises into the top 3 (then clean up the probe signal).
- [ ] **Step 3: Commit** — `git commit -m "feat(planner): wire interest signals into expedition candidates"`

### Task 7: Wrap-up

- [ ] Full suite + `npx tsc --noEmit` green
- [ ] Update README status section: note interest-signal loop active; fix stale "~52 items" claim -> "~2,500 seeded items"
- [ ] Commit — `git commit -m "docs: README status — interest signals live, correct item counts"`
