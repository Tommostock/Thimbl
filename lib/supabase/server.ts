import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase Server Client
 *
 * Use this in Server Components, Server Actions, and Route Handlers for:
 * - Fetching data on the server (faster, more secure)
 * - Checking authentication status
 * - Server-side mutations
 *
 * This client runs on the server and reads auth cookies from the request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component — this is expected.
            // Cookies can only be set in Server Actions or Route Handlers.
          }
        },
      },
    }
  );
}
