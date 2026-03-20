import BottomNav from '@/components/layout/BottomNav';
import WelcomeModal from '@/components/onboarding/WelcomeModal';

/**
 * App Layout
 *
 * Used for all app pages.
 * Includes the bottom navigation bar and first-launch welcome tutorial.
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
      <WelcomeModal />
    </>
  );
}
