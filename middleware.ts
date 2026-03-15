import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js Middleware
 *
 * Runs on every matched request before the page renders.
 * Refreshes the Supabase auth session and handles route protection.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico (browser icon)
     * - public folder files (icons, images, sw.js, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|placeholders/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
