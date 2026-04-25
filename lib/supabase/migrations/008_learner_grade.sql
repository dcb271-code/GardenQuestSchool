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

-- Cecily was seeded as a Grade-2 stretch learner, mark her accordingly
-- so the UI shows the right grade badge.
update learner
   set grade_level = 2,
       default_challenge = 'harder'
 where id = '11111111-1111-1111-1111-111111111111';

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
