-- Garden Friend: a gentle creature-care companion.
--
-- One active companion per learner (DB-enforced by partial unique
-- index); bond history is kept per species so re-adopting an old
-- friend restores the relationship. Feeding consumes a harvested
-- garden_plot row via a second consumption FK (mirrors 015's
-- consumed_by_meal_id — every spent harvest points at what ate it).
create table if not exists companion (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  species_code text not null,
  nickname text,
  bond_xp int not null default 0,
  active boolean not null default false,
  adopted_at timestamptz not null default now(),
  -- Day-scoped needs use DATEs on purpose: a missed day never stacks,
  -- it just means "hungry again today".
  last_fed_on date,
  last_played_on date,
  unique (learner_id, species_code)
);
create unique index if not exists companion_one_active
  on companion(learner_id) where active;
create index if not exists companion_learner_idx on companion(learner_id);

alter table garden_plot
  add column if not exists consumed_by_companion_id uuid
  references companion(id) on delete set null;

alter table companion enable row level security;
drop policy if exists "companion owned via learner" on companion;
create policy "companion owned via learner" on companion for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
