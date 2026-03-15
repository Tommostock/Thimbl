import BottomNav from '@/components/layout/BottomNav';

/**
 * App Layout
 *
 * Used for all authenticated app pages.
 * Includes the bottom navigation bar.
 */

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
