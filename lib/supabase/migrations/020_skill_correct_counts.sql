-- 020_skill_correct_counts.sql
--
-- Per-skill correct-answer counts, computed in the database.
--
-- Four pages used to fetch a learner's entire correct-attempt history
-- in one select and count it in JavaScript. PostgREST silently caps a
-- select at 1000 rows, so past 1000 lifetime attempts every per-skill
-- count came from an arbitrary truncated window — and those counts
-- unlock habitats (20+ correct at a prereq) and drive every progress
-- badge on every map. The first symptom in the wild was a seven-year-
-- old writing to ask why Crystal Cavern had locked itself: her 28
-- correct answers at the gate skill were outside the window.
--
-- Pagination fixed the correctness and left the shape wrong: three
-- round trips and 2,400 rows over the wire on every garden render,
-- growing forever as she plays. This returns ONE row per skill —
-- about 66 today and 66 at ten thousand attempts.
--
-- Nothing here writes learner state. It is a read-only function over
-- existing tables, and re-running it is free — which matters, because
-- scripts/migrate.ts has no tracking table and re-applies every file
-- on every run.

create or replace function skill_correct_counts(p_learner_id uuid)
returns table (skill_code text, correct_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select s.code, count(*)::bigint
  from attempt a
  join item i on i.id = a.item_id
  join skill s on s.id = i.skill_id
  where a.learner_id = p_learner_id
    and a.outcome = 'correct'
  group by s.code;
$$;

comment on function skill_correct_counts(uuid) is
  'Lifetime correct answers per skill code. Replaces four in-app row '
  'counts that silently truncated at PostgREST''s 1000-row cap.';

-- The join this function walks, every time a map renders. Without it
-- the aggregate is a sequential scan of the whole attempt table.
create index if not exists attempt_learner_outcome_item_idx
  on attempt (learner_id, outcome, item_id);
