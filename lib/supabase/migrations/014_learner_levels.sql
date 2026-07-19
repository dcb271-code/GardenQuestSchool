-- Grades are now "levels" (Garden Quest's own 1–5 ladder, anchored to
-- CCSS grades but not called that in the UI), and the ladder gains
-- Levels 4 and 5. The column keeps its historical name grade_level;
-- only the allowed range changes.
alter table learner drop constraint if exists learner_grade_level_chk;
alter table learner add constraint learner_grade_level_chk
  check (grade_level between 1 and 5);
