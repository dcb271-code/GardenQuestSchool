-- 012_interest_signal.sql
--
-- Interest signals: world actions (building a habitat, discovering a
-- flora species) emit tagged events. The session planner decays these
-- 0.6x per session and biases expedition candidates toward matching
-- skill themeTags. This is the "emergent curriculum" loop from the
-- 2026-04-22 design spec.
--
-- Idempotent (uses `if not exists`).

create table if not exists interest_signal (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  tag text not null,                -- must match a skill themeTag to have effect
  weight numeric not null default 1.0,
  source text not null,             -- 'habitat_build' | 'naturalist_identify'
  created_at timestamptz not null default now()
);

create index if not exists interest_signal_learner_created_idx
  on interest_signal(learner_id, created_at desc);

alter table interest_signal enable row level security;

drop policy if exists "interest_signal owned via learner" on interest_signal;
create policy "interest_signal owned via learner" on interest_signal for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
