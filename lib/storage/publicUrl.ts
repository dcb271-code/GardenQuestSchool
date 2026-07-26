// lib/storage/publicUrl.ts
//
// One builder for public Supabase Storage URLs.
//
// Flora photos, bird photos and bird audio all live in public buckets
// and all need the same URL shape. This is the shared part; each
// subject keeps its own bucket name and re-exports a thin wrapper, so
// callers never pass a bucket string around by hand.
//
// Pure on purpose — the API routes and the render path both call it,
// and neither should be instantiating a Supabase client to build a
// string.

export interface PublicUrlOptions {
  /** Appended as ?width=<N> for the Supabase image transform. Images only. */
  widthPx?: number;
}

export function publicStorageUrl(
  baseUrl: string,
  bucket: string,
  storagePath: string,
  opts: PublicUrlOptions = {},
): string {
  if (!storagePath) throw new Error('publicStorageUrl: storagePath must be non-empty');
  if (!bucket) throw new Error('publicStorageUrl: bucket must be non-empty');
  const base = baseUrl.replace(/\/+$/, '');
  let u = `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
  if (opts.widthPx) u += `?width=${opts.widthPx}`;
  return u;
}
