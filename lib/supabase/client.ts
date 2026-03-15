import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Browser Client
 *
 * Use this in Client Components ('use client') for:
 * - User interactions (form submissions, button clicks)
 * - Real-time subscriptions
 * - Client-side data mutations
 *
 * This client runs in the browser and uses cookies for auth.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
