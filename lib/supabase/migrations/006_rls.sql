-- lib/supabase/migrations/006_rls.sql
-- parent references auth.uid()
alter table parent enable row level security;
create policy "parent reads own row" on parent
  for select using (id = auth.uid());
create policy "parent updates own row" on parent
  for update using (id = auth.uid());

-- learner scoped to parent_id
alter table learner enable row level security;
create policy "learner owned by parent" on learner
  for all using (parent_id = auth.uid());

-- Everything learner-scoped
alter table session enable row level security;
create policy "session owned via learner" on session for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table attempt enable row level security;
create policy "attempt owned via session" on attempt for all using (
  session_id in (select id from session where learner_id in
    (select id from learner where parent_id = auth.uid()))
);

alter table skill_progress enable row level security;
create policy "skill_progress owned via learner" on skill_progress for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table world_state enable row level security;
create policy "world_state owned via learner" on world_state for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table habitat enable row level security;
create policy "habitat owned via learner" on habitat for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table journal_entry enable row level security;
create policy "journal owned via learner" on journal_entry for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table virtue_gem enable row level security;
create policy "virtue_gem owned via learner" on virtue_gem for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

alter table authored_content enable row level security;
create policy "authored owned by parent" on authored_content for all using (
  parent_id = auth.uid()
);

-- Content tables: public read
alter table subject enable row level security;
create policy "subject public read" on subject for select using (true);

alter table strand enable row level security;
create policy "strand public read" on strand for select using (true);

alter table skill enable row level security;
create policy "skill public read" on skill for select using (true);

alter table item enable row level security;
create policy "item public read" on item for select using (approved_at is not null);

alter table habitat_type enable row level security;
create policy "habitat_type public read" on habitat_type for select using (true);

alter table species enable row level security;
create policy "species public read" on species for select using (true);

alter table generation_job enable row level security;
-- only service role accesses generation_job; no user policies

alter table tts_cache enable row level security;
create policy "tts_cache public read" on tts_cache for select using (true);
