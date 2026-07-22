-- Ikebana with Bachan: quiet flower arranging from harvested blooms.
--
-- An arrangement uses three stems in the classic shin/soe/hikae
-- (heaven/human/earth) structure. Consumption is relational, exactly
-- like meals (015) and companion feeding (017): each spent harvest row
-- points at the arrangement that used it, so the flower basket is
-- simply harvested_at IS NOT NULL AND all consumed_by_* IS NULL.
create table if not exists arrangement (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  -- The three stems, tallest to shortest.
  shin_plant_code text not null,
  soe_plant_code text not null,
  hikae_plant_code text not null,
  arranged_at timestamptz not null default now()
);
create index if not exists arrangement_learner_idx on arrangement(learner_id);

alter table garden_plot
  add column if not exists consumed_by_arrangement_id uuid
  references arrangement(id) on delete set null;

alter table arrangement enable row level security;
drop policy if exists "arrangement owned via learner" on arrangement;
create policy "arrangement owned via learner" on arrangement for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
