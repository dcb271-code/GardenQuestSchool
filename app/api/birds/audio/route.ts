import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { birdAudioUrl } from '@/lib/birds/photoStorage';
import type { AudioIndex } from '@/lib/birds/audioResolve';
import type { VoiceKind } from '@/lib/world/birdCatalog';

/**
 * Every confirmed bird clip, grouped by bird and voice kind — the
 * audio twin of /api/birds/photos, and one call for the whole catalog
 * for the same reason: the scene needs arbitrary clips the moment a
 * generated exercise asks for them, and a network round trip between
 * "listen" and hearing something reads as broken.
 *
 * Exercises carry {birdCode, kind} references, not URLs, so a bird
 * whose clips are not auditioned yet resolves to nothing and the scene
 * skips that exercise rather than playing silence.
 */

export const revalidate = 3600;

interface Row {
  bird_code: string;
  kind: VoiceKind;
  storage_path: string;
  fallback_path: string | null;
  spectrogram_path: string | null;
  source_id: string;
  source_url: string;
  recordist: string;
  license_url: string;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: 'storage not configured' }, { status: 500 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from('bird_audio')
    .select('bird_code, kind, storage_path, fallback_path, spectrogram_path, source_id, source_url, recordist, license_url');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const audio: AudioIndex = {};
  for (const row of (data ?? []) as Row[]) {
    const byKind = (audio[row.bird_code] ??= {});
    (byKind[row.kind] ??= []).push({
      url: birdAudioUrl(baseUrl, row.storage_path),
      fallbackUrl: row.fallback_path ? birdAudioUrl(baseUrl, row.fallback_path) : null,
      spectrogramUrl: row.spectrogram_path ? birdAudioUrl(baseUrl, row.spectrogram_path) : null,
      attribution: {
        recordist: row.recordist,
        sourceId: row.source_id,
        sourceUrl: row.source_url,
        licenseUrl: row.license_url,
      },
    });
  }

  return NextResponse.json({ audio });
}
