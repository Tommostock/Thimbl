'use client';
/**
 * PasswordInput.tsx — The main password entry field
 *
 * Features:
 *   - Large, touch-friendly input optimised for mobile
 *   - Eye icon to toggle password visibility
 *   - Animated cyan glow on focus
 *   - "This is not my real password" reminder label
 *   - Clears on demand
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PasswordInput({ value, onChange }: Props) {
  // Track whether we're showing plain text or bullets
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">

      {/* ── Label ─────────────────────────────────────────── */}
      <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-widest">
        <span className="text-base">🔐</span>
        Enter a test password
        <span
          className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(0, 245, 255, 0.08)',
            color: '#00F5FF',
            border: '1px solid rgba(0,245,255,0.2)',
          }}
        >
          not your real one!
        </span>
      </label>

      {/* ── Input wrapper ────────────────────────────────── */}
      <div className="relative flex items-center">
        {/* The actual input */}
        <input
          ref={inputRef}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. password123"
          autoComplete="new-password"     // Prevent browser autofill
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="
            w-full pr-20 pl-4 py-4
            rounded-2xl
            font-mono text-sm
            bg-transparent
            text-[var(--text-primary)]
            placeholder-[var(--text-dim)]
            outline-none
            transition-all duration-200
          "
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onFocus={e => {
            // Add glow on focus
            e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.5)';
            e.currentTarget.style.boxShadow   = '0 0 0 1px rgba(0,245,255,0.2), 0 0 20px rgba(0,245,255,0.08)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.boxShadow   = 'none';
          }}
        />

        {/* Right-side icon buttons */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Clear button — only shown when there's text */}
          {value.length > 0 && (
            <motion.button
              onClick={() => { onChange(''); inputRef.current?.focus(); }}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors"
              title="Clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ClearIcon />
            </motion.button>
          )}

          {/* Show/hide toggle */}
          <button
            onClick={() => setShowPassword(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--text-dim)] hover:text-[var(--cyan)] transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* ── Character count ───────────────────────────────── */}
      {value.length > 0 && (
        <motion.div
          className="text-right text-[10px] text-[var(--text-dim)] pr-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value.length} character{value.length !== 1 ? 's' : ''}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ICON COMPONENTS (inline SVG — no external dependencies)
// ─────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
