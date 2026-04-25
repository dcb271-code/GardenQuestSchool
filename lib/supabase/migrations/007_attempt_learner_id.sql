-- lib/supabase/migrations/007_attempt_learner_id.sql
-- Add learner_id to attempt so we can filter directly without joining
-- through session. Several queries (garden progress badges, explore
-- candidates, parent dashboard headline) were using
-- `.eq('learner_id', ...)` against attempt as if this column already
-- existed — Supabase silently returned no rows, so the x/n counters
-- on every garden structure stayed at 0/N forever.
--
-- Idempotent: safe to re-run.

alter table attempt
  add column if not exists learner_id uuid references learner(id) on delete cascade;

-- Backfill from session for any rows inserted before this migration.
update attempt
   set learner_id = session.learner_id
  from session
 where attempt.session_id = session.id
   and attempt.learner_id is null;

create index if not exists attempt_learner_idx
  on attempt(learner_id, attempted_at desc);
