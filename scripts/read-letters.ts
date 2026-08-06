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
import { replyTo, type Letterbox } from '../lib/world/letters';

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
  return { unanswered, reply };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { unanswered, reply } = parseArgs();

  const { data: learners } = await db.from('learner').select('*');
  let found = 0;

  for (const l of (learners ?? []) as Array<Record<string, unknown>>) {
    const id = String(l.id);
    const name = String(l.first_name ?? id.slice(0, 8));
    const g = await garden(db, id);
    const box = (g.letters as Letterbox) ?? [];
    if (box.length === 0) continue;

    if (reply?.id) {
      if (!box.some(x => x.id === reply.id)) continue;
      if (!reply.text) {
        console.error('Usage: npm run letters -- --reply <id> "your reply"');
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

    const shown = unanswered ? box.filter(x => !x.reply) : box;
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
