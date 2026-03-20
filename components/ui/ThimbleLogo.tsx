'use client';

interface ThimbleLogoProps {
  size?: number;
}

/**
 * Custom thimble logo — tilted 45°, with a needle + trailing thread
 * for a distinctive, recognisable brand mark.
 *
 * Palette: terracotta body, golden rim, sage needle, dusty-rose thread.
 */
export default function ThimbleLogo({ size = 28 }: ThimbleLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Body gradient — terracotta warm tones */}
        <linearGradient id="tb" x1="20" y1="10" x2="55" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0A68E" />
          <stop offset="45%" stopColor="#C67B5C" />
          <stop offset="100%" stopColor="#9E5538" />
        </linearGradient>
        {/* Dome cap — slightly lighter */}
        <linearGradient id="tc" x1="28" y1="6" x2="46" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8B9A4" />
          <stop offset="100%" stopColor="#C67B5C" />
        </linearGradient>
        {/* Golden rim */}
        <linearGradient id="tr" x1="18" y1="48" x2="50" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EDD28C" />
          <stop offset="50%" stopColor="#D4A843" />
          <stop offset="100%" stopColor="#A8852E" />
        </linearGradient>
        {/* Needle — sage metal */}
        <linearGradient id="tn" x1="56" y1="50" x2="74" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A8C4A5" />
          <stop offset="100%" stopColor="#6E8B6B" />
        </linearGradient>
        {/* Drop shadow */}
        <filter id="ts" x="-4" y="-2" width="88" height="88">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#2C2825" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* ── Entire thimble group tilted 45° clockwise ── */}
      <g transform="rotate(45, 40, 40)" filter="url(#ts)">
        {/* Main body */}
        <path
          d="M24 20C24 13 28 7 38 7C48 7 52 13 52 20V48C52 53 48 57 38 57C28 57 24 53 24 48V20Z"
          fill="url(#tb)"
        />

        {/* Dome top */}
        <ellipse cx="38" cy="11" rx="12.5" ry="5.5" fill="url(#tc)" />

        {/* Golden rim band */}
        <path
          d="M24 47C24 47 28 45 38 45C48 45 52 47 52 47V51C52 55.5 48 57 38 57C28 57 24 55.5 24 51V47Z"
          fill="url(#tr)"
        />

        {/* Dimple pattern — honeycomb layout */}
        {/* Row 1 */}
        <circle cx="32" cy="17" r="1.6" fill="#9E5538" opacity="0.45" />
        <circle cx="38" cy="17" r="1.6" fill="#9E5538" opacity="0.45" />
        <circle cx="44" cy="17" r="1.6" fill="#9E5538" opacity="0.45" />
        {/* Row 2 */}
        <circle cx="29" cy="22" r="1.6" fill="#9E5538" opacity="0.4" />
        <circle cx="35" cy="22" r="1.6" fill="#9E5538" opacity="0.4" />
        <circle cx="41" cy="22" r="1.6" fill="#9E5538" opacity="0.4" />
        <circle cx="47" cy="22" r="1.6" fill="#9E5538" opacity="0.4" />
        {/* Row 3 */}
        <circle cx="32" cy="27" r="1.6" fill="#9E5538" opacity="0.4" />
        <circle cx="38" cy="27" r="1.6" fill="#9E5538" opacity="0.4" />
        <circle cx="44" cy="27" r="1.6" fill="#9E5538" opacity="0.4" />
        {/* Row 4 */}
        <circle cx="29" cy="32" r="1.6" fill="#9E5538" opacity="0.35" />
        <circle cx="35" cy="32" r="1.6" fill="#9E5538" opacity="0.35" />
        <circle cx="41" cy="32" r="1.6" fill="#9E5538" opacity="0.35" />
        <circle cx="47" cy="32" r="1.6" fill="#9E5538" opacity="0.35" />
        {/* Row 5 */}
        <circle cx="32" cy="37" r="1.6" fill="#9E5538" opacity="0.3" />
        <circle cx="38" cy="37" r="1.6" fill="#9E5538" opacity="0.3" />
        <circle cx="44" cy="37" r="1.6" fill="#9E5538" opacity="0.3" />
        {/* Row 6 */}
        <circle cx="35" cy="42" r="1.4" fill="#9E5538" opacity="0.25" />
        <circle cx="41" cy="42" r="1.4" fill="#9E5538" opacity="0.25" />

        {/* Light highlight — left edge reflection */}
        <path
          d="M28 16C28 11 31 8 38 8C39 8 39.5 8.1 40 8.2C33 8.5 30 11 30 16V45C29.2 44.6 28.4 44 28 43.5V16Z"
          fill="white"
          opacity="0.2"
        />
      </g>

      {/* ── Needle poking out bottom-right (not rotated with thimble) ── */}
      <line
        x1="52" y1="52" x2="74" y2="74"
        stroke="url(#tn)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Needle eye */}
      <ellipse cx="72" cy="72" rx="1.2" ry="2" transform="rotate(45, 72, 72)" fill="#6E8B6B" />

      {/* ── Trailing thread — dusty rose, gentle curve ── */}
      <path
        d="M74 74C70 78 62 76 58 72C54 68 48 70 44 74C40 78 34 76 30 73"
        stroke="#D4A0A0"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}
