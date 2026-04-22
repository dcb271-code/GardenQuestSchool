-- lib/supabase/migrations/001_identity.sql
create extension if not exists "uuid-ossp";

create table if not exists parent (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists learner (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parent(id) on delete cascade,
  first_name text not null,
  avatar_key text,
  birthday date,
  onboarding_level jsonb,
  created_at timestamptz default now()
);

create index if not exists learner_parent_idx on learner(parent_id);
