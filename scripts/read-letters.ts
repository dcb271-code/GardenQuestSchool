#!/usr/bin/env tsx
/**
 * Read the letterbox, and write back.
 *
 *   npm run letters                          # everything, newest first
 *   npm run letters -- --unanswered          # only ones still waiting
 *   npm run letters -- --reply 2026-08-06-1 "Yes! I built it. Look…"
 *
 * This is the other half of the letterbox. She writes in the app; this
 * is where whoever builds the garden reads it and answers. A reply
 * appears under her letter next time she opens the box, and puts the
 * flag up on the map until she does.
 *
 * Reply like a person writing to a seven-year-old, because that is
 * what is happening. She asked for this channel herself.
 */

import { config } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { replyTo, addBuilderLetter, type Letterbox } from '../lib/world/letters';

config({ path: '.env.local' });

async function garden(db: SupabaseClient, learnerId: string) {
  const { data } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  return (data?.garden as Record<string, unknown>) ?? {};
}

function parseArgs() {
  const a = process.argv.slice(2);
  const unanswered = a.includes('--unanswered');
  const i = a.indexOf('--reply');
  const reply = i >= 0 ? { id: a[i + 1], text: a[i + 2] } : null;
  const si = a.indexOf('--send');
  const send = si >= 0 ? { firstName: a[si + 1], text: a[si + 2] } : null;
  // Ids are per-learner and COLLIDE across children ("2026-08-07-1"
  // exists for both sisters). --to scopes the reply to one child;
  // without it the first matching box wins, which nearly overwrote
  // Cecily's cavern reply with a letter meant for Esme.
  const ti = a.indexOf('--to');
  const to = ti >= 0 ? a[ti + 1] : null;
  return { unanswered, reply, send, to };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { unanswered, reply, send, to } = parseArgs();

  // A letter FROM the builder, unprompted. Used for news that cannot
  // wait for her next letter; raises the flag like a reply.
  if (send) {
    if (!send.firstName || !send.text) {
      console.error('Usage: npm run letters -- --send <FirstName> "your letter"');
      process.exit(1);
    }
    const { data: target } = await db
      .from('learner').select('id, first_name').eq('first_name', send.firstName).maybeSingle();
    if (!target) { console.error(`no learner called ${send.firstName}`); process.exit(1); }
    const tid = String(target.id);
    const tg = await garden(db, tid);
    const tbox = (tg.letters as Letterbox) ?? [];
    const added = addBuilderLetter(tbox, send.text, new Date().toISOString());
    if (!added) { console.error('empty letter — nothing sent'); process.exit(1); }
    tg.letters = added.box;
    const { error } = await db.from('world_state').upsert(
      { learner_id: tid, garden: tg, last_updated_at: new Date().toISOString() },
      { onConflict: 'learner_id' },
    );
    console.log(error
      ? `! send failed: ${error.message}`
      : `✓ letter ${added.letter.id} delivered to ${target.first_name} — the flag is up`);
    return;
  }

  const { data: learners } = await db.from('learner').select('*');
  let found = 0;

  for (const l of (learners ?? []) as Array<Record<string, unknown>>) {
    const id = String(l.id);
    const name = String(l.first_name ?? id.slice(0, 8));
    const g = await garden(db, id);
    const box = (g.letters as Letterbox) ?? [];
    if (box.length === 0) continue;

    if (reply?.id) {
      if (to && name.toLowerCase() !== to.toLowerCase()) continue;
      const target = box.find(x => x.id === reply.id);
      if (!target) continue;
      if (!reply.text) {
        console.error('Usage: npm run letters -- --reply <id> "your reply"');
        process.exit(1);
      }
      // One reply slot per letter — a second reply OVERWRITES the
      // first, silently, which has already eaten one reply she had
      // not... luckily had already read. Refuse without --force.
      if (target.reply && !process.argv.includes('--force')) {
        console.error(`! ${reply.id} already has a reply (${target.repliedAt?.slice(0, 10)}).`);
        console.error('  Replying again REPLACES it. Add --force if you mean to.');
        process.exit(1);
      }
      g.letters = replyTo(box, reply.id, reply.text, new Date().toISOString());
      const { error } = await db.from('world_state').upsert(
        { learner_id: id, garden: g, last_updated_at: new Date().toISOString() },
        { onConflict: 'learner_id' },
      );
      console.log(error
        ? `! reply failed: ${error.message}`
        : `✓ replied to ${name}'s letter ${reply.id} — the flag is up on her letterbox`);
      return;
    }

    // Builder letters are FROM us — they are never 'awaiting a reply'.
    const shown = unanswered ? box.filter(x => !x.reply && x.from !== 'builder') : box;
    if (shown.length === 0) continue;
    found += shown.length;

    console.log(`\n${'═'.repeat(60)}\n${name}\n${'═'.repeat(60)}`);
    for (const letter of shown) {
      console.log(`\n[${letter.id}]  ${letter.sentAt.slice(0, 10)}`);
      console.log(letter.text.split('\n').map(t => '  ' + t).join('\n'));
      if (letter.reply) {
        console.log(`\n  ↳ replied ${letter.repliedAt?.slice(0, 10)}` +
                    `${letter.readAt ? ' (she has read it)' : ' (not opened yet)'}`);
        console.log(letter.reply.split('\n').map(t => '    ' + t).join('\n'));
      }
    }
  }

  if (reply?.id) { console.error(`No letter with id ${reply.id}`); process.exit(1); }
  console.log(found === 0
    ? (unanswered ? '\nNo letters waiting for a reply.' : '\nThe letterbox is empty.')
    : `\n${found} letter(s). Reply with: npm run letters -- --reply <id> "…"`);
}

main().catch(e => { console.error(e); process.exit(1); });
