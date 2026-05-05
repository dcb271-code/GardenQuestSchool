-- 010_garden_plot.sql
--
-- Persistence for the Tiny Garden reward-game. Each row is one
-- planted seed sitting in one plot. When a plant matures and the
-- learner taps "harvest", the row's harvested_at is set rather than
-- deleting the row — keeps the history.
--
-- Idempotent (uses `if not exists`).

create table if not exists garden_plot (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  plot_code text not null,                  -- 'veg-1' .. 'japanese-4'
  plant_code text not null,                 -- 'radish' .. 'cherry'
  planted_at_correct integer not null,      -- cumulative correct snapshot
  planted_at timestamptz not null default now(),
  harvested_at timestamptz                  -- null while still in the plot
);

-- One active plant per plot per learner. Allows multiple harvested
-- rows for the same plot over time (history).
create unique index if not exists garden_plot_active_uidx
  on garden_plot(learner_id, plot_code)
  where harvested_at is null;

create index if not exists garden_plot_learner_active_idx
  on garden_plot(learner_id)
  where harvested_at is null;

-- RLS: a learner can only see/modify their own plots.
alter table garden_plot enable row level security;

drop policy if exists "garden_plot owned via learner" on garden_plot;
create policy "garden_plot owned via learner" on garden_plot for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
