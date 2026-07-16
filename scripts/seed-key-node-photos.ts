#!/usr/bin/env tsx
/**
 * Seeds key_node_photo — curated photos pinned to one side of one
 * dichotomous-key question.
 *
 * Why this exists: key steps otherwise resolve their comparison photos
 * dynamically from flora_photo (species + role, preferring tier 1).
 * When a species has no tier-1 photo in the requested role, the pick
 * silently falls back to a harder tier — and the photo can then
 * CONTRADICT its own label. The real case this was written for: the
 * option labelled "three large white petals?" was illustrated with a
 * PINK trillium (trillium has no flower/tier-1 row, so it fell back to
 * flower/tier-2 "pale" and tier-3 "faded to pink"). A literal-minded
 * 6-year-old learning colors from photos is being taught wrong.
 *
 * Rows here win over the dynamic pick (see app/api/naturalist/walk).
 * Only pin a side when the label makes a claim the dynamic pool can't
 * reliably honour — every pinned row is a photo that stops rotating,
 * which costs exposure variety.
 *
 * Idempotent: deletes + reinserts each node_id it manages.
 *
 * Usage: npx tsx scripts/seed-key-node-photos.ts
 */
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('✗ DATABASE_URL not set in .env.local');
  process.exit(1);
}

interface CuratedNodePhoto {
  nodeId: string;       // '<key node id>.<left|right>'
  why: string;
  storagePath: string;
  source: string;
  sourceUrl: string;
  photographer: string | null;
  licenseCode: 'cc0' | 'cc-by' | 'cc-by-sa';
  altText: string;
}

const CURATED: CuratedNodePhoto[] = [
  {
    nodeId: 'flower_three_petals.left',
    why: 'Label claims "three large WHITE petals" — trillium has no flower/tier-1 row, so the dynamic pick served a pink flower/tier-2 or faded-pink tier-3 photo.',
    storagePath: 'trillium/whole_1_inat_inat_506560854.jpg',
    source: 'inat',
    sourceUrl: 'https://www.inaturalist.org/observations/281973063',
    photographer: 'Donald Davesne',
    licenseCode: 'cc-by',
    altText: 'A white trillium flower with three wide petals above three big green leaves',
  },
  {
    nodeId: 'flower_blue.right',
    why: 'This is the step BEFORE the white-petals question, and it also illustrates trillium. A faded-pink trillium here then contradicts "white petals" one step later — pin a white one so the key stays internally consistent.',
    storagePath: 'trillium/whole_2_inat_inat_121448358.jpg',
    source: 'inat',
    sourceUrl: 'https://www.inaturalist.org/observations/121448358',
    photographer: null,
    licenseCode: 'cc-by',
    altText: 'A white trillium flower with three wide leaves on the forest floor',
  },
];

async function main() {
  const sql = postgres(DATABASE_URL!, { ssl: 'require', prepare: false });
  try {
    for (const c of CURATED) {
      await sql`delete from key_node_photo where node_id = ${c.nodeId}`;
      await sql`
        insert into key_node_photo
          (node_id, storage_path, source, source_url, photographer, license_code, alt_text)
        values (${c.nodeId}, ${c.storagePath}, ${c.source}, ${c.sourceUrl},
                ${c.photographer}, ${c.licenseCode}, ${c.altText})`;
      console.log(`✓ ${c.nodeId} → ${c.storagePath}`);
    }
    const [{ n }] = await sql`select count(*)::int as n from key_node_photo`;
    console.log(`\n✅ key_node_photo now has ${n} curated rows.`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
