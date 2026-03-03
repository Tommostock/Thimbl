/**
 * attacks.ts — Attack simulation logic for Clavis
 *
 * These functions simulate three types of real-world attacks.
 * They don't actually crack anything — instead they:
 *   1. Use the password analysis to decide the outcome (cracked or not)
 *   2. Animate through realistic-looking attempts
 *   3. Call an `onUpdate` callback so the UI can show live progress
 *
 * This makes the simulation educational and visually engaging.
 */

import { PasswordAnalysis } from './analyzer';
import { COMMON_PASSWORDS, DICTIONARY_WORDS, COMMON_SUFFIXES,
         DISPLAY_WORDS_DICT, DISPLAY_WORDS_HYBRID } from './wordlists';

// ─────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────

export type AttackStatus = 'idle' | 'running' | 'cracked' | 'resistant';

export interface AttackState {
  status: AttackStatus;
  progress: number;        // 0–100 (for the progress bar)
  currentAttempt: string;  // The word/combo currently being "tried"
  attemptsCount: number;   // Total attempts shown
  result: string;          // Final result message
  crackedIn?: string;      // e.g. "1.3 seconds"
}

/** Callback type — called on every animation frame to update the UI */
export type UpdateCallback = (state: AttackState) => void;

// ─────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────

/** Sleep for N milliseconds — used to pace the animation */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Pick a random item from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────
// ATTACK 1: DICTIONARY ATTACK
// Tries every word in a known list of common passwords.
// Fastest attack — if your password is common, it's instant.
// ─────────────────────────────────────────────────────────

/**
 * runDictionaryAttack — Simulates a dictionary attack.
 *
 * How it works in real life:
 *   Attackers download lists of billions of breached passwords.
 *   They check each one against your hashed password.
 *   If you use a common password, it's cracked in under a second.
 *
 * @param analysis  — The result of analyzePassword()
 * @param onUpdate  — Called each animation frame with the current state
 */
export async function runDictionaryAttack(
  analysis: PasswordAnalysis,
  onUpdate: UpdateCallback
): Promise<AttackState> {
  const TOTAL_STEPS = 30; // How many animation frames to show
  const DELAY_MS = 80;    // Milliseconds between each frame

  // Determine outcome before animation starts
  const willCrack = analysis.patterns.isCommonPassword || analysis.patterns.hasKeyboardWalk;
  const crackedAtStep = willCrack ? Math.floor(TOTAL_STEPS * 0.6 + Math.random() * TOTAL_STEPS * 0.3) : TOTAL_STEPS;

  let attemptsCount = 0;

  for (let step = 0; step <= TOTAL_STEPS; step++) {
    // If this is the step where we "crack" it, show the actual password
    const currentAttempt = (willCrack && step === crackedAtStep)
      ? analysis.password
      : pick(DISPLAY_WORDS_DICT);

    attemptsCount += Math.floor(5000 + Math.random() * 15000);
    const progress = Math.round((step / TOTAL_STEPS) * 100);

    const state: AttackState = {
      status: 'running',
      progress,
      currentAttempt,
      attemptsCount,
      result: '',
    };
    onUpdate(state);

    // Stop early if cracked
    if (willCrack && step >= crackedAtStep) break;

    await sleep(DELAY_MS);
  }

  // Final result state
  const finalState: AttackState = {
    status: willCrack ? 'cracked' : 'resistant',
    progress: 100,
    currentAttempt: willCrack ? analysis.password : '[ exhausted ]',
    attemptsCount,
    result: willCrack
      ? `Password found in dictionary after ${attemptsCount.toLocaleString()} attempts`
      : `Not found in ${attemptsCount.toLocaleString()} dictionary entries`,
    crackedIn: willCrack ? `${(Math.random() * 2 + 0.5).toFixed(1)}s` : undefined,
  };

  onUpdate(finalState);
  return finalState;
}

// ─────────────────────────────────────────────────────────
// ATTACK 2: HYBRID ATTACK
// Combines dictionary words with numbers/symbols.
// e.g. "apple123", "dragon!", "summer2024"
// ─────────────────────────────────────────────────────────

/**
 * runHybridAttack — Simulates a hybrid dictionary + mutation attack.
 *
 * How it works in real life:
 *   Attackers take a word list and combine each word with common
 *   number/symbol suffixes, prefixes, and substitutions.
 *   This catches passwords like "dragon123" that escape pure dictionary attacks.
 *
 * @param analysis  — The result of analyzePassword()
 * @param onUpdate  — Called each animation frame
 */
export async function runHybridAttack(
  analysis: PasswordAnalysis,
  onUpdate: UpdateCallback
): Promise<AttackState> {
  const TOTAL_STEPS = 28;
  const DELAY_MS = 90;

  // Crack if: common suffix on a dictionary-ish word, OR leet speak
  const lowerPwd = analysis.password.toLowerCase();
  const baseWordMatch = DICTIONARY_WORDS.find(w => lowerPwd.startsWith(w));
  const suffixMatch   = COMMON_SUFFIXES.find(s => lowerPwd.endsWith(s));
  const willCrack     = (!!baseWordMatch && !!suffixMatch) || analysis.patterns.hasLeetSpeak || analysis.patterns.hasCommonSuffix;
  const crackedAtStep = willCrack ? Math.floor(TOTAL_STEPS * 0.5 + Math.random() * TOTAL_STEPS * 0.3) : TOTAL_STEPS;

  let attemptsCount = 0;

  for (let step = 0; step <= TOTAL_STEPS; step++) {
    const currentAttempt = (willCrack && step === crackedAtStep)
      ? analysis.password
      : pick(DISPLAY_WORDS_HYBRID);

    attemptsCount += Math.floor(20000 + Math.random() * 50000);
    const progress = Math.round((step / TOTAL_STEPS) * 100);

    onUpdate({ status: 'running', progress, currentAttempt, attemptsCount, result: '' });

    if (willCrack && step >= crackedAtStep) break;
    await sleep(DELAY_MS);
  }

  const finalState: AttackState = {
    status: willCrack ? 'cracked' : 'resistant',
    progress: 100,
    currentAttempt: willCrack ? analysis.password : '[ all combos tried ]',
    attemptsCount,
    result: willCrack
      ? `Hybrid match found: word + suffix pattern detected`
      : `No word+suffix pattern found in ${attemptsCount.toLocaleString()} combos`,
    crackedIn: willCrack ? `${(Math.random() * 8 + 2).toFixed(1)}s` : undefined,
  };

  onUpdate(finalState);
  return finalState;
}

// ─────────────────────────────────────────────────────────
// ATTACK 3: BRUTE FORCE
// Tries every possible combination of characters.
// Guaranteed to eventually crack any password — but time varies wildly.
// ─────────────────────────────────────────────────────────

/**
 * runBruteForce — Calculates brute force crack time (no animation needed).
 *
 * How it works in real life:
 *   Attackers try every possible combination: a, b, c... aa, ab... etc.
 *   Modern GPUs can try ~10 billion MD5 hashes per second.
 *   A password with 60+ bits of entropy would take longer than the universe's age.
 *
 * This is synchronous (instant) — we just calculate the math.
 *
 * @param analysis  — The result of analyzePassword()
 * @returns Final state showing crack time estimate
 */
export function runBruteForce(analysis: PasswordAnalysis): AttackState {
  const GPU_SPEED = 10_000_000_000; // 10 billion MD5 hashes/sec (high-end GPU)
  const searchSpace = Math.pow(2, analysis.entropy);
  const avgAttempts = searchSpace / 2;
  const secondsTocrack = avgAttempts / GPU_SPEED;

  // Format the time
  let timeStr: string;
  if (secondsTocrack < 1)                    timeStr = 'instantly';
  else if (secondsTocrack < 60)              timeStr = `${secondsTocrack.toFixed(0)}s`;
  else if (secondsTocrack < 3600)            timeStr = `${(secondsTocrack/60).toFixed(0)} minutes`;
  else if (secondsTocrack < 86400)           timeStr = `${(secondsTocrack/3600).toFixed(0)} hours`;
  else if (secondsTocrack < 2592000)         timeStr = `${(secondsTocrack/86400).toFixed(0)} days`;
  else if (secondsTocrack < 31536000)        timeStr = `${(secondsTocrack/2592000).toFixed(0)} months`;
  else if (secondsTocrack < 1e10)            timeStr = `${(secondsTocrack/31536000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} years`;
  else if (secondsTocrack < 3.15e13)         timeStr = 'thousands of years';
  else if (secondsTocrack < 3.15e16)         timeStr = 'millions of years';
  else                                        timeStr = 'centuries';

  const isSafe = secondsTocrack > 31536000 * 10; // 10+ years = safe

  return {
    status: isSafe ? 'resistant' : 'cracked',
    progress: 100,
    currentAttempt: `${analysis.charsetSize}^${analysis.length} combinations`,
    attemptsCount: Math.min(avgAttempts, 1e15),
    result: `Estimated crack time: ${timeStr} at 10 billion guesses/sec`,
    crackedIn: isSafe ? undefined : timeStr,
  };
}

// ─────────────────────────────────────────────────────────
// HELPER: Generate brute force display characters
// Used in the UI to show characters "being tried"
// ─────────────────────────────────────────────────────────
export function generateBruteChars(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let result = '';
  for (let i = 0; i < Math.min(length, 10); i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
