/**
 * crackTime.ts — Crack time estimator for Clavis
 *
 * Given a password's entropy (in bits), this calculates how long
 * it would take an attacker to crack it under different scenarios.
 *
 * Key concept: To crack a password, an attacker tries combinations.
 * On average, they'll find it after trying half the total combinations.
 * Total combinations = 2^entropy
 * Average attempts needed = 2^entropy / 2 = 2^(entropy - 1)
 */

// ─────────────────────────────────────────────────────────
// HASH RATES — Attempts per second for different scenarios
//
// "Hashing" is how passwords are stored — even if an attacker
// steals a database, they get a scrambled "hash" not the password.
// But some hash algorithms are much faster to attack than others.
// ─────────────────────────────────────────────────────────
export const HASH_RATES = {
  // Scenario 1: Online attack, with rate limiting
  // (e.g. trying passwords on a website that locks you out after 10 fails)
  onlineThrottled: {
    label: 'Online (throttled)',
    subtitle: 'Website with login rate-limiting',
    attemptsPerSecond: 10,
    icon: '🌐',
  },

  // Scenario 2: Online attack, no rate limiting
  // (e.g. an API with no brute-force protection)
  onlineFast: {
    label: 'Online (unprotected)',
    subtitle: 'Unprotected API or login endpoint',
    attemptsPerSecond: 1_000,
    icon: '⚡',
  },

  // Scenario 3: Offline attack against MD5/SHA1 hashes
  // (attacker stole a database using a fast, weak hash algorithm)
  offlineMD5: {
    label: 'Offline (MD5/SHA1)',
    subtitle: 'Stolen database with weak hashing',
    attemptsPerSecond: 10_000_000_000, // 10 billion/sec on modern GPU
    icon: '💀',
  },

  // Scenario 4: Offline attack against bcrypt
  // (attacker stole a database using a slow, strong hash algorithm)
  // bcrypt is intentionally slow — this is why good apps use it!
  offlineBcrypt: {
    label: 'Offline (bcrypt)',
    subtitle: 'Stolen database with strong hashing',
    attemptsPerSecond: 10_000, // 10 thousand/sec — bcrypt is slow by design!
    icon: '🔒',
  },
} as const;

export type ScenarioKey = keyof typeof HASH_RATES;

// ─────────────────────────────────────────────────────────
// TIME FORMATTING
// ─────────────────────────────────────────────────────────

/**
 * formatSeconds — Converts a number of seconds into a human-readable string.
 *
 * @param seconds — Number of seconds (can be huge)
 * @returns e.g. "3 minutes", "847 years", "centuries"
 */
export function formatSeconds(seconds: number): string {
  if (!isFinite(seconds) || seconds > 1e20) return 'centuries';
  if (seconds < 1)             return 'instantly';
  if (seconds < 60)            return `${Math.round(seconds)} second${Math.round(seconds) !== 1 ? 's' : ''}`;
  if (seconds < 3_600)         return `${Math.round(seconds / 60)} minute${Math.round(seconds / 60) !== 1 ? 's' : ''}`;
  if (seconds < 86_400)        return `${Math.round(seconds / 3_600)} hour${Math.round(seconds / 3_600) !== 1 ? 's' : ''}`;
  if (seconds < 2_592_000)     return `${Math.round(seconds / 86_400)} day${Math.round(seconds / 86_400) !== 1 ? 's' : ''}`;
  if (seconds < 31_536_000)    return `${Math.round(seconds / 2_592_000)} month${Math.round(seconds / 2_592_000) !== 1 ? 's' : ''}`;
  if (seconds < 1e10)          return `${Math.round(seconds / 31_536_000).toLocaleString()} year${Math.round(seconds / 31_536_000) !== 1 ? 's' : ''}`;
  if (seconds < 3.15e13)       return 'thousands of years';
  if (seconds < 3.15e16)       return 'millions of years';
  if (seconds < 3.15e19)       return 'billions of years';
  return 'centuries';
}

// ─────────────────────────────────────────────────────────
// CRACK TIME ESTIMATOR
// ─────────────────────────────────────────────────────────

export interface CrackTimeResult {
  scenario: typeof HASH_RATES[ScenarioKey];
  attemptsNeeded: number;    // 2^(entropy-1) — average attempts to crack
  secondsNeeded: number;
  timeString: string;        // e.g. "847 years"
  isSafe: boolean;           // true if it would take > 1 year
}

/**
 * estimateCrackTimes — Calculate crack time across all 4 scenarios.
 *
 * @param entropy — Password entropy in bits (from analyzePassword)
 * @returns Array of CrackTimeResult, one per attack scenario
 */
export function estimateCrackTimes(entropy: number): CrackTimeResult[] {
  // Average number of guesses needed = half the search space
  // Search space = 2^entropy
  // We use Math.pow(2, entropy - 1) but cap it to avoid Infinity
  const cappedEntropy = Math.min(entropy, 200); // cap at 2^200 to avoid Infinity
  const attemptsNeeded = Math.pow(2, Math.max(0, cappedEntropy - 1));

  return (Object.entries(HASH_RATES) as [ScenarioKey, typeof HASH_RATES[ScenarioKey]][]).map(
    ([, scenario]) => {
      const secondsNeeded = attemptsNeeded / scenario.attemptsPerSecond;
      return {
        scenario,
        attemptsNeeded,
        secondsNeeded,
        timeString: formatSeconds(secondsNeeded),
        isSafe: secondsNeeded > 31_536_000, // more than 1 year = "safe"
      };
    }
  );
}
