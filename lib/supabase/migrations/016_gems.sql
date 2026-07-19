-- Curiosity tracking: which facts a learner peeked at, per day.
-- Opening ≥3 DISTINCT fact cards (plants, species, flora) in a day
-- earns the curiosity gem (1/day cap lives in code). The primary key
-- makes repeat taps on the same card free — spam earns nothing.
create table if not exists fact_peek (
  learner_id uuid not null references learner(id) on delete cascade,
  code text not null,               -- 'plant:tomato' | 'species:monarch' | 'flora:red_oak'
  day date not null default current_date,
  primary key (learner_id, code, day)
);

alter table fact_peek enable row level security;
drop policy if exists "fact_peek owned via learner" on fact_peek;
create policy "fact_peek owned via learner" on fact_peek for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
