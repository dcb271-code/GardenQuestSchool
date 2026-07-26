// lib/birds/photoStorage.ts
//
// Public URLs for bird media. Two buckets: stills and sound.

import { publicStorageUrl, type PublicUrlOptions } from '@/lib/storage/publicUrl';

export const PHOTO_BUCKET = 'bird-photos';
export const AUDIO_BUCKET = 'bird-audio';

export function birdPhotoUrl(
  baseUrl: string, storagePath: string, opts: PublicUrlOptions = {},
): string {
  return publicStorageUrl(baseUrl, PHOTO_BUCKET, storagePath, opts);
}

export function birdAudioUrl(baseUrl: string, storagePath: string): string {
  // No width transform — it's a sound file.
  return publicStorageUrl(baseUrl, AUDIO_BUCKET, storagePath);
}
