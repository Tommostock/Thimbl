/** @type {import('tailwindcss').Config} */

// tailwind.config.js — Tailwind CSS configuration for Clavis
// Tailwind scans your files and only includes the CSS classes you actually use,
// keeping the final bundle tiny and fast.
module.exports = {
  // Tell Tailwind which files to scan for class names
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // Custom colour palette for the Clavis dark/hacker aesthetic
      colors: {
        // Background layers
        'bg-base':    '#0a0a0f',   // deepest dark background
        'bg-surface': '#111118',   // card/panel backgrounds
        'bg-raised':  '#1a1a25',   // slightly raised surfaces

        // Accent colours
        'cyan':    '#00F5FF',      // primary electric cyan
        'cyan-dim': '#00b8c0',     // dimmer version for hover states
        'green':   '#00FF88',      // success / strong password
        'red':     '#FF4466',      // danger / weak password / cracked
        'orange':  '#FF8C42',      // warning / fair password
        'yellow':  '#FFD700',      // caution

        // Text
        'text-primary':   '#E8E8F0',
        'text-secondary': '#7878A0',
        'text-dim':       '#4a4a6a',
      },

      // Custom font families
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'Courier New', 'monospace'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },

      // Custom animations
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite',
        'blink':      'blink 1s step-end infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #00F5FF40' },
          '50%':      { boxShadow: '0 0 20px #00F5FF80, 0 0 40px #00F5FF40' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
    },
  },

  plugins: [],
};
