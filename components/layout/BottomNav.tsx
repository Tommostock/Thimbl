'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Heart, BookOpen, GraduationCap, User } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Floating Bottom Navigation Bar
 *
 * Pill-shaped tab bar floating above the bottom edge with rounded
 * corners and shadow, matching BakeBook's style.
 * Five tabs: Home, Favourites, Journal, Learn, Profile.
 */

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/favorites', label: 'Favourites', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed z-50"
      style={{
        bottom: 12,
        left: 12,
        right: 12,
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="flex items-center justify-around rounded-2xl py-2"
        style={{
          backgroundColor: 'var(--bg-nav)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px var(--border-colour)',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-w-[52px] min-h-[44px]"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-1 rounded-xl"
                  style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  color: isActive
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
                }}
              />
              <span
                className="text-[9px] font-medium leading-none"
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
