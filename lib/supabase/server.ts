import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

export function createServiceClient() {
  // At runtime on Vercel these are always set. Fallback to empty strings during
  // build-time static analysis so `next build` doesn't crash before envs are wired.
  //
  // ── Why the custom fetch ──
  // Next.js 14 App Router patches global `fetch` to cache GETs by default,
  // and that cache survives across renders even on `dynamic = 'force-dynamic'`
  // pages — `force-dynamic` opts the PAGE render out of caching, not the
  // individual `fetch()` calls supabase-js makes under the hood. Without
  // this override, the garden's per-skill correct count silently kept
  // serving a stale snapshot for ages: prod showed 0/10 long after the
  // database had moved on. Forcing `cache: 'no-store'` on every PostgREST
  // request makes the service-role client behave the way you'd expect a
  // server-side DB call to behave.
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    {
      global: {
        fetch: (url, options) =>
          fetch(url, { ...(options ?? {}), cache: 'no-store' as RequestCache }),
      },
    },
  );
}
