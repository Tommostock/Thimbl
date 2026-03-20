'use client';

interface ThimbleLogoProps {
  size?: number;
}

/**
 * Custom thimble logo SVG that matches the app's warm craft palette.
 * Terracotta body with golden band and dimple pattern.
 */
export default function ThimbleLogo({ size = 28 }: ThimbleLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Thimble body — terracotta gradient */}
      <defs>
        <linearGradient id="thimble-body" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D99A80" />
          <stop offset="50%" stopColor="#C67B5C" />
          <stop offset="100%" stopColor="#A85D3F" />
        </linearGradient>
        <linearGradient id="thimble-top" x1="22" y1="4" x2="42" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D99A80" />
          <stop offset="100%" stopColor="#C67B5C" />
        </linearGradient>
        <linearGradient id="thimble-band" x1="14" y1="44" x2="50" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E4C470" />
          <stop offset="50%" stopColor="#D4A843" />
          <stop offset="100%" stopColor="#B08A2E" />
        </linearGradient>
      </defs>

      {/* Main body — rounded rectangle / barrel shape */}
      <path
        d="M18 18C18 12 22 6 32 6C42 6 46 12 46 18V48C46 52 42 56 32 56C22 56 18 52 18 48V18Z"
        fill="url(#thimble-body)"
      />

      {/* Rounded dome top */}
      <ellipse cx="32" cy="10" rx="12" ry="5" fill="url(#thimble-top)" />

      {/* Golden band at bottom */}
      <path
        d="M18 46C18 46 22 44 32 44C42 44 46 46 46 46V50C46 54 42 56 32 56C22 56 18 54 18 50V46Z"
        fill="url(#thimble-band)"
      />

      {/* Dimple pattern — rows of small indentations */}
      {/* Row 1 */}
      <circle cx="26" cy="16" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="32" cy="16" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="38" cy="16" r="1.5" fill="#A85D3F" opacity="0.5" />

      {/* Row 2 — offset */}
      <circle cx="23" cy="21" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="29" cy="21" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="35" cy="21" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="41" cy="21" r="1.5" fill="#A85D3F" opacity="0.5" />

      {/* Row 3 */}
      <circle cx="26" cy="26" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="32" cy="26" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="38" cy="26" r="1.5" fill="#A85D3F" opacity="0.5" />

      {/* Row 4 — offset */}
      <circle cx="23" cy="31" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="29" cy="31" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="35" cy="31" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="41" cy="31" r="1.5" fill="#A85D3F" opacity="0.5" />

      {/* Row 5 */}
      <circle cx="26" cy="36" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="32" cy="36" r="1.5" fill="#A85D3F" opacity="0.5" />
      <circle cx="38" cy="36" r="1.5" fill="#A85D3F" opacity="0.5" />

      {/* Row 6 — offset */}
      <circle cx="29" cy="41" r="1.5" fill="#A85D3F" opacity="0.45" />
      <circle cx="35" cy="41" r="1.5" fill="#A85D3F" opacity="0.45" />

      {/* Subtle highlight on left side */}
      <path
        d="M22 14C22 10 25 7 32 7C33 7 33.5 7.1 34 7.2C27 7.5 24 10 24 14V44C24 44 23 43.5 22 43V14Z"
        fill="white"
        opacity="0.15"
      />
    </svg>
  );
}
