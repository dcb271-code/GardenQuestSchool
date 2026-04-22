-- lib/supabase/migrations/005_authoring.sql
create table if not exists authored_content (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parent(id) on delete cascade,
  target_skill_code text,
  kind text not null,
  content jsonb not null,
  status text default 'processing',
  created_at timestamptz default now()
);

create table if not exists generation_job (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill(id) on delete cascade,
  requested_at timestamptz default now(),
  completed_at timestamptz,
  status text,
  items_generated int default 0,
  items_passed_critic int default 0,
  critic_scores numeric[],
  cost_usd numeric,
  error_message text
);

create index if not exists generation_job_active_idx
  on generation_job(status, requested_at) where status != 'done';

create table if not exists tts_cache (
  text_hash text primary key,
  text text not null,
  voice_id text not null,
  audio_url text not null,
  duration_ms int,
  generated_at timestamptz default now()
);
