/**
 * analyzer.ts — Core password analysis engine for Clavis
 *
 * This file does all the "thinking" about your password.
 * It checks character variety, detects weak patterns, and
 * calculates a mathematical measure called "entropy" to
 * score how strong the password really is.
 *
 * Everything here runs in your browser. Nothing is sent anywhere.
 */

import { COMMON_PASSWORDS, KEYBOARD_WALKS } from './wordlists';

// ─────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// TypeScript lets us define the exact shape of our data.
// ─────────────────────────────────────────────────────────

/** All the information we extract from a password */
export interface PasswordAnalysis {
  password: string;
  length: number;

  /** Which character types are present */
  has: {
    lower: boolean;   // a–z
    upper: boolean;   // A–Z
    digit: boolean;   // 0–9
    symbol: boolean;  // !@#$%^&*...
  };

  /**
   * How many unique characters the attacker must try per position.
   * e.g. lowercase only = 26, lowercase+digits = 36, all types = 94
   */
  charsetSize: number;

  /**
   * Entropy in bits. Higher = harder to crack.
   * Formula: entropy = length × log₂(charsetSize)
   * Think of it as the number of coin flips needed to guess the password.
   */
  entropy: number;

  /** Detected weakness patterns */
  patterns: {
    isCommonPassword: boolean;   // found in the breach list
    hasKeyboardWalk: boolean;    // qwerty, asdf, 12345...
    hasRepeats: boolean;         // aaa, 111, !!!
    hasSequential: boolean;      // abc, xyz, 123, 987
    hasLeetSpeak: boolean;       // p@ssw0rd — looks fancy but attackers try these
    hasCommonSuffix: boolean;    // ends in 123, !, 2024 etc.
  };

  /** Penalty-adjusted score from 0 to 100 */
  score: number;

  /** Human-readable strength label */
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

  /** Colour hex for the strength indicator */
  color: string;
}

// ─────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────

/** Calculate log base 2 of a number (JavaScript only has Math.log) */
function log2(n: number): number {
  return Math.log(n) / Math.log(2);
}

/** Check if a string contains a keyboard walk pattern */
function detectKeyboardWalk(password: string): boolean {
  const lower = password.toLowerCase();
  return KEYBOARD_WALKS.some(walk => lower.includes(walk));
}

/**
 * Check for repeated characters: "aaa", "111", "!!!"
 * We look for any character repeated 3+ times in a row.
 */
function detectRepeats(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

/**
 * Check for sequential characters: "abc", "xyz", "123", "987"
 * We look for 3+ characters that follow each other in order.
 */
function detectSequential(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'zyxwvutsrqponmlkjihgfedcba',
    '0123456789',
    '9876543210',
  ];
  const lower = password.toLowerCase();
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.slice(i, i + 3))) return true;
    }
  }
  return false;
}

/**
 * Detect "leet speak" substitutions: @ for a, 3 for e, 0 for o, etc.
 * These are well-known to attackers and add very little security.
 */
function detectLeetSpeak(password: string): boolean {
  // A password that contains leet chars AND looks like a word when reversed
  const leetMap: Record<string, string> = {
    '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i',
    '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't',
  };
  let reversed = password.toLowerCase();
  for (const [leet, normal] of Object.entries(leetMap)) {
    reversed = reversed.split(leet).join(normal);
  }
  // Check if the "de-leeted" version is a common password or dictionary word
  return COMMON_PASSWORDS.includes(reversed) && reversed !== password.toLowerCase();
}

/**
 * Detect common suffixes: passwords ending in 123, !, 2023, @, etc.
 * Attackers always try these since many users add them to "improve" weak passwords.
 */
function detectCommonSuffix(password: string): boolean {
  const suffixes = ['123', '1234', '12345', '!', '@', '#', '!@#', '007',
    '2020', '2021', '2022', '2023', '2024', '2025', '99', '01', '1'];
  const lower = password.toLowerCase();
  return suffixes.some(s => lower.endsWith(s));
}

// ─────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ─────────────────────────────────────────────────────────

/**
 * analyzePassword — The main function. Pass in a password string,
 * get back a full analysis object.
 *
 * @param password — The test password to analyse
 * @returns PasswordAnalysis — Complete breakdown of the password's strength
 */
export function analyzePassword(password: string): PasswordAnalysis {
  // ── 1. CHARACTER TYPE DETECTION ──────────────────────
  const has = {
    lower:  /[a-z]/.test(password),
    upper:  /[A-Z]/.test(password),
    digit:  /[0-9]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  };

  // ── 2. CHARSET SIZE ───────────────────────────────────
  // The number of possible characters per position.
  // More variety = more possible combinations = harder to crack.
  let charsetSize = 0;
  if (has.lower)  charsetSize += 26;   // a–z
  if (has.upper)  charsetSize += 26;   // A–Z
  if (has.digit)  charsetSize += 10;   // 0–9
  if (has.symbol) charsetSize += 32;   // common symbols
  if (charsetSize === 0) charsetSize = 1; // edge case: empty string

  // ── 3. ENTROPY CALCULATION ────────────────────────────
  // Entropy measures unpredictability in bits.
  // Higher bits = harder to brute-force.
  //
  // Example: 8-char password with only lowercase (26 chars):
  //   entropy = 8 × log₂(26) = 8 × 4.7 = 37.6 bits
  //   That means 2^37.6 ≈ 100 billion possible passwords.
  //
  // Same length with all character types (94 chars):
  //   entropy = 8 × log₂(94) = 8 × 6.55 = 52.4 bits
  //   That's 2^52.4 ≈ 6 quadrillion — much harder!
  const entropy = password.length > 0
    ? password.length * log2(charsetSize)
    : 0;

  // ── 4. PATTERN DETECTION ─────────────────────────────
  const patterns = {
    isCommonPassword: COMMON_PASSWORDS.includes(password.toLowerCase()),
    hasKeyboardWalk:  detectKeyboardWalk(password),
    hasRepeats:       detectRepeats(password),
    hasSequential:    detectSequential(password),
    hasLeetSpeak:     detectLeetSpeak(password),
    hasCommonSuffix:  detectCommonSuffix(password),
  };

  // ── 5. SCORING ────────────────────────────────────────
  // Start with a base score from entropy, then apply penalties.
  // Entropy of 60 bits ≈ 100/100 before penalties.
  let score = Math.min(100, (entropy / 60) * 100);

  // Apply penalties for detected weaknesses
  if (patterns.isCommonPassword) score  = Math.min(score, 5);   // almost zero
  if (patterns.hasKeyboardWalk)  score -= 20;
  if (patterns.hasRepeats)       score -= 15;
  if (patterns.hasSequential)    score -= 10;
  if (patterns.hasLeetSpeak)     score -= 15;
  if (patterns.hasCommonSuffix)  score -= 10;

  // Bonus for length — length is one of the most important factors
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // Clamp to 0–100
  score = Math.max(0, Math.min(100, score));

  // ── 6. STRENGTH LABEL & COLOUR ───────────────────────
  let label: PasswordAnalysis['label'];
  let color: string;

  if (score < 20)      { label = 'Very Weak';  color = '#FF4466'; }
  else if (score < 40) { label = 'Weak';        color = '#FF8C42'; }
  else if (score < 60) { label = 'Fair';        color = '#FFD700'; }
  else if (score < 80) { label = 'Strong';      color = '#4488FF'; }
  else                  { label = 'Very Strong'; color = '#00FF88'; }

  return {
    password,
    length: password.length,
    has,
    charsetSize,
    entropy,
    patterns,
    score,
    label,
    color,
  };
}

/** Returns an empty/default analysis for an empty password */
export function emptyAnalysis(): PasswordAnalysis {
  return analyzePassword('');
}
