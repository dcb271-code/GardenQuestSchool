-- lib/supabase/migrations/008_learner_grade.sql
-- Each learner now has a grade level (1, 2, 3) and a within-grade
-- challenge preference (easier / normal / harder). The two together
-- decide:
--   • the starting Elo seeded for new skill_progress rows
--   • which foundational skills get marked mastered up-front
--   • the default offset applied to item difficulty during sessions
-- so a Grade-1 / easier learner doesn't get blasted with Grade-2
-- crossing-ten addition on their first day.
--
-- Idempotent — safe to re-run.

alter table learner
  add column if not exists grade_level int,
  add column if not exists default_challenge text;

-- Sane defaults for any existing rows. We keep the column nullable in
-- the schema but backfill nulls now so all UI paths can assume a
-- value exists.
update learner
   set grade_level = 2
 where grade_level is null;

update learner
   set default_challenge = 'normal'
 where default_challenge is null;

-- REMOVED 2026-07-26, and it must not come back.
--
-- This used to stamp one hardcoded learner id to grade_level 2 and
-- default_challenge 'harder', unconditionally. `npm run db:migrate`
-- re-applies every file on every run, so that line reset Cecily to
-- Level 2 — and silently changed her difficulty — every single time
-- anyone migrated. She was promoted to Level 3 in July and kept
-- reverting; this was why.
--
-- The backfills above already give a fresh database sane defaults, so
-- nothing is lost. A learner's level and challenge are THEIR state,
-- edited in the parent UI. Migrations own the schema, never the
-- child's progress.
--
-- Guarded by tests/world/migrationSafety.test.ts.

-- Keep value space tight; CHECK survives re-runs because the constraint
-- name is fixed.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'learner_default_challenge_chk'
  ) then
    alter table learner
      add constraint learner_default_challenge_chk
      check (default_challenge in ('easier', 'normal', 'harder'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'learner_grade_level_chk'
  ) then
    alter table learner
      add constraint learner_grade_level_chk
      check (grade_level between 1 and 3);
  end if;
end $$;
