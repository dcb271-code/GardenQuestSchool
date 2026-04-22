-- lib/supabase/migrations/003_progress.sql
create table if not exists session (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  mode text not null,
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
  outcome text not null,
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
