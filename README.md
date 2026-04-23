# GardenQuestSchool

A personal learning web app for first graders (Cecily, Esme).
Reading, Spelling, Math via a persistent naturalist garden world.
Kohn / Reggio / Chance-informed pedagogy: intrinsic motivation, documentation over scores, emergent curriculum.

**Stack:** Next.js 14 · Supabase · TypeScript · framer-motion · `@dnd-kit` · Claude API (content gen, Plan 2) · ElevenLabs (TTS, Plan 2)

**Design spec:** [docs/superpowers/specs/2026-04-22-gardenquestschool-design.md](docs/superpowers/specs/2026-04-22-gardenquestschool-design.md)

**Plan 1 (this milestone):** [docs/superpowers/plans/2026-04-22-v1-plan1-foundations-and-first-playable.md](docs/superpowers/plans/2026-04-22-v1-plan1-foundations-and-first-playable.md)

## Run locally

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run db:seed       # (only once per fresh Supabase DB; migrations already applied)
npm run dev
# open http://localhost:3000
```

Cecily appears on the picker. Tap her, pick an expedition, complete items.

## Run tests

```bash
npm test              # engine + pack unit tests (26 passing)
npm run test:e2e      # Playwright golden path on Chromium
```

## Database

Migrations live in `lib/supabase/migrations/` and were applied manually via Supabase SQL Editor.
Seed data (Cecily, Math pack, ~52 hand-authored items) applies via `npm run db:seed` using the service role key.
A migration runner (`npm run db:migrate`) is wired for future migrations once `DATABASE_URL` is added to `.env.local`.

## Status

- **Plan 1 — Foundations + First Playable Loop** — ✅ complete + deployed
- **Plan 2 — Reading Pack (V1.5)** — ✅ complete + deployed
- **Plan 3 — Content Generation + Parent Zone** — pending
- **Plan 4 — World Delight + Accessibility** — pending

## Subject Packs

Each pack implements a common contract (`SubjectPack`). V1.5 ships:

- **Math** — 8 skills, 3 item types (NumberBonds, CountingTiles, EquationTap), ~110 items
- **Reading** — 6 skills, 4 item types (SightWordTap, PhonemeBlend, DigraphSort, ReadAloudSimple), ~75 items

Adding a new pack = new folder under `lib/packs/`, register its item types in `lib/packs/index.ts`. No engine changes.

Audio narration via Web Speech API (browser-native). Runs on iPad Safari.

## Architecture

- `lib/engine/` — subject-agnostic learning engine (pure TS, fully unit-tested)
- `lib/packs/math/` — Math subject pack (skills, scoring, renderers)
- `lib/supabase/` — Supabase clients + SQL migrations
- `app/(child)/` — kid UI (picker, explore, lesson, session-end)
- `app/(parent)/` — parent zone (magic-link auth, stub dashboard)
- `app/api/` — session + plan API routes
- `components/` — React components (child, parent, shared)
- `scripts/` — DB utility scripts (migrate, seed)
- `tests/` — Vitest unit tests + Playwright E2E
