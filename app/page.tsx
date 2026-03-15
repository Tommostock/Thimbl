import { redirect } from 'next/navigation';

/**
 * Root Page
 *
 * Redirects to the dashboard. The actual home content lives at /(app)/dashboard.
 */
export default function RootPage() {
  redirect('/dashboard');
}
