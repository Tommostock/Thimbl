/**
 * wordlists.ts — Embedded data for attack simulations
 *
 * These lists are used to simulate real-world attacks.
 * In reality, attackers use lists with millions of entries.
 * We embed a representative sample so the simulation works
 * entirely in the browser with no internet required.
 */

// ─────────────────────────────────────────────────────────
// COMMON PASSWORDS — The most frequently breached passwords.
// If a user's password is in this list, a dictionary attack
// would crack it in milliseconds.
// ─────────────────────────────────────────────────────────
export const COMMON_PASSWORDS: string[] = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password1', '111111', '1234567', 'iloveyou', 'admin',
  'letmein', 'welcome', 'monkey', 'login', 'princess',
  'solo', 'master', 'dragon', 'pass', 'hello',
  'shadow', 'superman', 'michael', 'football', 'baseball',
  'trustno1', 'batman', 'access', 'mustang', 'hockey',
  'test', 'flower', 'sunshine', 'whatever', 'jessica',
  'ninja', 'andrew', 'tiger', 'charlie', 'jordan',
  'hunter', 'buster', 'soccer', 'harley', 'ranger',
  'password123', 'qwerty123', 'Password1', 'password!',
  '1q2w3e4r', 'qwertyuiop', '1qaz2wsx', '12341234',
  '1234567890', '0987654321', 'password2', 'admin123',
  'welcome1', 'root', 'toor', 'secret', 'pass123',
  '654321', '666666', '123123', '7777777', 'qwerty1',
  'zxcvbnm', 'asdfghjkl', 'abcdefg', '1111111', '2222222',
  'myspace1', 'fuckyou', 'superman1', 'batman1', 'soccer1',
  'hockey1', 'golfer', 'testing', 'daniel', 'george',
  'thomas', 'jordan1', 'pokemon', 'spongebob', 'starwars',
  'harrypotter', 'minecraft', 'iloveyou1', 'abc1234',
  'letmein1', 'sunshine1', 'Summer2023', 'Winter2023',
  'Spring2024', 'Fall2023', 'P@ssword', 'P@ssw0rd',
  'Passw0rd', 'P@$$word', 'pass@123', 'Admin@123',
  'qwerty!', '!password', 'hello123', 'test123', 'user',
  'login123', 'demo', 'guest', 'change_me', 'changeme',
];

// ─────────────────────────────────────────────────────────
// DICTIONARY WORDS — Common English words used as base words
// in hybrid attacks. Attackers combine these with numbers
// and symbols (e.g. "apple123", "summer!", "dragon@2024").
// ─────────────────────────────────────────────────────────
export const DICTIONARY_WORDS: string[] = [
  'apple', 'summer', 'winter', 'dragon', 'tiger',
  'eagle', 'shadow', 'silver', 'golden', 'crystal',
  'falcon', 'hunter', 'ranger', 'warrior', 'thunder',
  'mystic', 'phoenix', 'blazing', 'frozen', 'cosmic',
  'legend', 'vortex', 'nebula', 'galaxy', 'stellar',
  'mighty', 'brave', 'swift', 'sharp', 'proud',
  'coffee', 'pizza', 'cherry', 'berry', 'peach',
  'forest', 'ocean', 'desert', 'valley', 'mountain',
  'rocket', 'comet', 'meteor', 'solar', 'lunar',
  'crimson', 'violet', 'indigo', 'scarlet', 'amber',
  'castle', 'kingdom', 'empire', 'citadel', 'fortress',
  'spring', 'autumn', 'morning', 'evening', 'midnight',
  'monkey', 'penguin', 'dolphin', 'jaguar', 'panther',
  'electric', 'digital', 'quantum', 'matrix', 'cyber',
  'master', 'ninja', 'pirate', 'knight', 'wizard',
  'secret', 'hidden', 'mystic', 'ancient', 'forgotten',
  'danger', 'power', 'storm', 'blaze', 'surge',
  'alpha', 'omega', 'sigma', 'delta', 'gamma',
  'echo', 'nova', 'pulse', 'wave', 'beam',
  'robot', 'android', 'cyborg', 'droid', 'mech',
];

// ─────────────────────────────────────────────────────────
// COMMON SUFFIXES — Numbers and symbols attackers append
// to dictionary words in hybrid attacks.
// ─────────────────────────────────────────────────────────
export const COMMON_SUFFIXES: string[] = [
  '1', '12', '123', '1234', '12345', '123456',
  '1!', '123!', '!', '@', '#', '!@#',
  '1990', '1991', '1992', '1993', '1994', '1995',
  '1996', '1997', '1998', '1999', '2000', '2001',
  '2020', '2021', '2022', '2023', '2024', '2025',
  '@123', '#123', '!123', '007', '69', '99', '00',
];

// ─────────────────────────────────────────────────────────
// KEYBOARD WALKS — Sequences typed by sliding fingers across
// the keyboard. These are checked in dictionary attacks too.
// ─────────────────────────────────────────────────────────
export const KEYBOARD_WALKS: string[] = [
  'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl',
  'zxcvbn', 'zxcvbnm', '1qaz2wsx', '1q2w3e4r',
  'qazwsx', 'wsxedc', 'edcrfv', 'rfvtgb',
  '123qwe', 'qwe123', 'asd123', 'zxc123',
  '1234qwer', 'qwer1234',
];

// ─────────────────────────────────────────────────────────
// DISPLAY WORDS — Shown in the terminal animation during
// attacks. These scroll past to make the simulation look
// realistic and educational.
// ─────────────────────────────────────────────────────────
export const DISPLAY_WORDS_DICT: string[] = [
  ...COMMON_PASSWORDS.slice(0, 40),
  ...KEYBOARD_WALKS.slice(0, 8),
];

export const DISPLAY_WORDS_HYBRID: string[] = [
  ...DICTIONARY_WORDS.slice(0, 20).map(w => `${w}123`),
  ...DICTIONARY_WORDS.slice(0, 10).map(w => `${w}!`),
  ...DICTIONARY_WORDS.slice(0, 10).map(w => `${w}2024`),
  ...DICTIONARY_WORDS.slice(0, 10).map(w => `${w}@1`),
];
