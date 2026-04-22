-- lib/supabase/migrations/002_content.sql
create table if not exists subject (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  pack_version text not null,
  active boolean default true
);

create table if not exists strand (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subject(id) on delete cascade,
  code text not null,
  name text not null,
  sort_order int default 0,
  unique (subject_id, code)
);

create table if not exists skill (
  id uuid primary key default gen_random_uuid(),
  strand_id uuid references strand(id) on delete cascade,
  code text unique not null,
  name text not null,
  description text,
  level numeric default 0.5,
  prereq_skill_codes text[] default '{}',
  curriculum_refs jsonb default '{}',
  theme_tags text[] default '{}',
  sort_order int default 0
);

create index if not exists skill_strand_idx on skill(strand_id);

create table if not exists item (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill(id) on delete cascade,
  type text not null,
  content jsonb not null,
  answer jsonb not null,
  audio_url text,
  difficulty_elo int default 1000,
  generated_by text default 'seed',
  generated_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references parent(id),
  quality_score numeric,
  usage_count int default 0,
  last_served_at timestamptz
);

create index if not exists item_skill_approved_idx
  on item(skill_id) where approved_at is not null;
create index if not exists item_skill_elo_idx
  on item(skill_id, difficulty_elo) where approved_at is not null;
