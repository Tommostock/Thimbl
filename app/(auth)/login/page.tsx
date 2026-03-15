'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scissors, Mail, Lock, Loader2, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * Login Page
 *
 * Supports email/password and magic link (passwordless) login.
 */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email + password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  // Magic link (passwordless) login
  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <Scissors size={28} className="text-white" />
        </div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Welcome Back
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sign in to continue your crafting journey
        </p>
      </div>

      {/* Magic link success message */}
      {magicLinkSent ? (
        <div
          className="card p-6 text-center"
        >
          <Mail size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Check your inbox!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            We&apos;ve sent a magic link to <strong>{email}</strong>. Click it to sign in.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="mt-4 text-sm underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            Try a different method
          </button>
        </div>
      ) : (
        <div className="card p-6">
          {/* Error message */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--dusty-rose-light, #F5E0E0)',
                color: '#9B3B3B',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-colour)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-colour)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-colour)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-colour)' }} />
          </div>

          {/* Magic link button */}
          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-opacity disabled:opacity-50 min-h-[44px]"
            style={{
              borderColor: 'var(--border-colour)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <Wand2 size={18} />
            Send Magic Link
          </button>
        </div>
      )}

      {/* Sign up link */}
      <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        New to Thimbl?{' '}
        <Link
          href="/signup"
          className="font-semibold underline"
          style={{ color: 'var(--accent-primary)' }}
        >
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
