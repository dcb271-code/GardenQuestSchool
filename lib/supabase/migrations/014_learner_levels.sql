-- Grades are now "levels" (Garden Quest's own 1–5 ladder, anchored to
-- CCSS grades but not called that in the UI), and the ladder gains
-- Levels 4 and 5. The column keeps its historical name grade_level;
-- only the allowed range changes.
--
-- Migrations are re-applied on every run, forever. This one used to
-- drop-and-re-add the 1–5 check unconditionally, which was fine until
-- 022 widened the range to 0–5 and a child was placed at Level 0:
-- the next full run failed HERE ("violated by some row") and never
-- reached 022 or anything after it. Now it only adds the constraint
-- when there is none — a first install gets 1–5, and 022 widens it.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'learner_grade_level_chk'
  ) then
    alter table learner add constraint learner_grade_level_chk
      check (grade_level between 1 and 5);
  end if;
end $$;
