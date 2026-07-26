// lib/naturalist/floraPhotoStorage.ts
//
// Pure helpers for building public Supabase Storage URLs to the
// flora-photos bucket. Both the API route and the page rendering
// code consume these — keeping it pure means no Supabase client
// instantiation in hot paths.
//
// The URL shape moved to lib/storage/publicUrl when birds wanted the
// same thing. This file's exports are unchanged, so no caller cares.

import { publicStorageUrl, type PublicUrlOptions } from '@/lib/storage/publicUrl';

export const BUCKET_NAME = 'flora-photos';

export type { PublicUrlOptions };

export function publicUrlFor(
  baseUrl: string,
  storagePath: string,
  opts: PublicUrlOptions = {},
): string {
  return publicStorageUrl(baseUrl, BUCKET_NAME, storagePath, opts);
}
