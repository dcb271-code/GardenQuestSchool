-- lib/supabase/migrations/004_world.sql
create table if not exists world_state (
  learner_id uuid primary key references learner(id) on delete cascade,
  garden jsonb not null default '{"grid":{"rows":12,"cols":18},"tiles":[],"plants":[],"decor":[]}',
  cat_companion jsonb default '{"name":null,"breed":"calico","mood":"content","position":{"x":8,"y":10}}',
  season text default 'spring',
  day_phase text default 'day',
  last_updated_at timestamptz default now()
);

create table if not exists habitat_type (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  attracts_species_codes text[] default '{}',
  prereq_skill_codes text[] default '{}',
  illustration_key text
);

create table if not exists species (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  common_name text not null,
  scientific_name text,
  description text,
  fun_fact text,
  illustration_key text,
  habitat_req_codes text[] default '{}'
);

create table if not exists habitat (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  habitat_type_id uuid references habitat_type(id),
  position jsonb,
  state text default 'healthy',
  installed_at timestamptz default now()
);

create table if not exists journal_entry (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  species_id uuid references species(id),
  discovered_at timestamptz default now(),
  triggered_by_session_id uuid references session(id),
  unique (learner_id, species_id)
);

create table if not exists virtue_gem (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learner(id) on delete cascade,
  virtue text not null,
  evidence jsonb not null,
  granted_at timestamptz default now()
);

create index if not exists virtue_gem_learner_virtue_idx on virtue_gem(learner_id, virtue);
create index if not exists virtue_gem_learner_granted_idx on virtue_gem(learner_id, granted_at desc);
