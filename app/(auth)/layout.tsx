/**
 * Auth Layout
 *
 * Used for login, signup, and onboarding pages.
 * Centred card layout — no bottom navigation bar.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
