'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, Scissors, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Bottom Navigation Bar
 *
 * Fixed to the bottom of the screen on mobile.
 * Five tabs: Home, Explore, My Projects, Shopping, Profile.
 * Minimum 44px tap targets for accessibility.
 */

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/my-projects', label: 'Projects', icon: Scissors },
  { href: '/shopping-list', label: 'Shopping', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: 'var(--bg-nav)',
        borderColor: 'var(--border-colour)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Safe area padding for iPhones with home indicator */}
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          // Check if the current path matches this nav item
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[64px] min-h-[44px]"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  color: isActive
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
                }}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{
                  color: isActive
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
