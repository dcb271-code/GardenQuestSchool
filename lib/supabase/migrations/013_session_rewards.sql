-- Sessions record at start whether they count toward game rewards
-- (creature arrivals). A session on a skill that is already mastered
-- and not due for review is a comfort replay: still allowed, still
-- fun, but it earns no loot — otherwise farming the easiest structure
-- is the optimal creature strategy. Null (pre-migration rows) is
-- treated as earning, so history is unaffected.
alter table session add column if not exists earns_rewards boolean;
