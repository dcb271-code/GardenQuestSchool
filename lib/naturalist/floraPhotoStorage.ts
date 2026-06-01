// lib/naturalist/floraPhotoStorage.ts
//
// Pure helpers for building public Supabase Storage URLs to the
// flora-photos bucket. Both the API route and the page rendering
// code consume these — keeping it pure means no Supabase client
// instantiation in hot paths.

export const BUCKET_NAME = 'flora-photos';

export interface PublicUrlOptions {
  widthPx?: number;   // appended as ?width=<N> for Supabase image transform
}

export function publicUrlFor(
  baseUrl: string,
  storagePath: string,
  opts: PublicUrlOptions = {},
): string {
  if (!storagePath) throw new Error('publicUrlFor: storagePath must be non-empty');
  const base = baseUrl.replace(/\/+$/, '');
  let u = `${base}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
  if (opts.widthPx) u += `?width=${opts.widthPx}`;
  return u;
}
