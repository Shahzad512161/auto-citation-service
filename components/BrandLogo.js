import Link from "next/link";

export function LogoIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm ${className}`}
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#08338F" />
          <stop offset="50%" stop-color="#0F6FFF" />
          <stop offset="100%" stop-color="#00D2FF" />
        </linearGradient>

        <linearGradient id="logoFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="50%" stop-color="#FB923C" />
          <stop offset="100%" stop-color="#EF4444" />
        </linearGradient>

        <linearGradient id="logoWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DBEAFE" />
          <stop offset="100%" stop-color="#93C5FD" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Container */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logoBgGrad)" />
      <rect x="2" y="2" width="60" height="60" rx="16" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none" />

      {/* Global Citation Grid & Orbit */}
      <ellipse
        cx="32"
        cy="36"
        rx="22"
        ry="9"
        stroke="rgba(255,255,255,0.38)"
        stroke-width="1.6"
        stroke-dasharray="3 3"
        fill="none"
        transform="rotate(-20 32 36)"
      />
      <path d="M16 48 C 22 36, 26 24, 38 14" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" fill="none" />

      {/* Citation Location Beacons */}
      <circle cx="16" cy="42" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="48" cy="28" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="42" cy="45" r="1.8" fill="#FDE047" opacity="0.9" />
      <circle cx="21" cy="25" r="1.2" fill="#FFFFFF" opacity="0.6" />

      {/* Propulsion Blast Exhaust */}
      <path d="M23 41 L14 50 C 13.5 50.5, 17 48, 19 45 L23 41 Z" fill="url(#logoFlameGrad)" />
      <path d="M25 43 L18 52 C 19 49, 23 46, 25 43 Z" fill="#FDE047" />

      {/* Wings */}
      <path d="M27 34 L21 41 L27 41 Z" fill="url(#logoWingGrad)" />
      <path d="M34 27 L41 33 L41 39 L37 36 Z" fill="url(#logoWingGrad)" />

      {/* Main Aerodynamic Rocket Body */}
      <path
        d="M47 17 C 47 17, 36 21, 28 30 C 26 32, 25 36, 25 39 L31 39 C 34 39, 38 38, 40 36 C 49 28, 47 17, 47 17 Z"
        fill="#FFFFFF"
      />

      {/* Navigation Pin / Cockpit */}
      <circle cx="38" cy="26" r="3.2" fill="#0F6FFF" />
      <circle cx="38" cy="26" r="1.3" fill="#FFFFFF" />

      {/* Speed Flare Star */}
      <path d="M49 13 L51 15 L49 17 L47 15 Z" fill="#FFFFFF" opacity="0.95" />
      <circle cx="53" cy="22" r="1" fill="#FDE047" />
    </svg>
  );
}

export default function BrandLogo({ size = "md", href = "/dashboard", showSubtitle = true, className = "" }) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoIcon size={iconSizes[size] || 36} />
      <div>
        <div className={`font-black tracking-tight leading-none ${textSizes[size] || "text-lg"} text-gray-900`}>
          Citation<span className="text-[#0F6FFF] ml-0.5">Blaster</span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mt-0.5">
            Global Local SEO
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
