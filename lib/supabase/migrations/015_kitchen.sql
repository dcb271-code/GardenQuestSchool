-- Bachan's Kitchen: cooked meals + ingredient consumption.
--
-- A meal is cooked from harvested garden_plot rows. Consumption is
-- relational: each spent harvest row points at the meal that used it,
-- so the basket count is simply harvested_at IS NOT NULL AND
-- consumed_by_meal_id IS NULL — no separate inventory table to drift.
create table if not exists meal (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  recipe_code text not null,
  guest_code text,
  cooked_at timestamptz not null default now()
);
create index if not exists meal_learner_idx on meal(learner_id);

alter table garden_plot
  add column if not exists consumed_by_meal_id uuid references meal(id) on delete set null;

alter table meal enable row level security;
drop policy if exists "meal owned via learner" on meal;
create policy "meal owned via learner" on meal for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
