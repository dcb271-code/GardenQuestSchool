-- Level 0: letters and numbers, spoken. A band below Level 1 for a
-- child who cannot read yet (spec: docs/superpowers/specs/
-- 2026-09-26-level-zero-spec.md). Only the allowed range changes;
-- the column keeps its historical name and nobody's level is touched
-- here — moving a child to Level 0 is scripts/rebaseline-level0.ts,
-- run once, by hand.
alter table learner drop constraint if exists learner_grade_level_chk;
alter table learner add constraint learner_grade_level_chk
  check (grade_level between 0 and 5);
