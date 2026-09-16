import React from "react";

export interface SocialFlowLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "dark" | "light" | "auto" | "monochrome";
  monochrome?: boolean;
  animated?: boolean;
}

export function SocialFlowLogo({
  className = "",
  iconOnly = false,
  size = "md",
  variant = "auto",
  monochrome = false,
  animated = false,
}: SocialFlowLogoProps) {
  const sizeMap: Record<string, { icon: number; text: string; subtext: string }> = {
    xs: { icon: 24, text: "text-sm font-extrabold tracking-tight", subtext: "text-[9px]" },
    sm: { icon: 30, text: "text-base font-black tracking-tight", subtext: "text-[10px]" },
    md: { icon: 36, text: "text-xl font-black tracking-tight", subtext: "text-[11px]" },
    lg: { icon: 46, text: "text-2xl font-black tracking-tight", subtext: "text-xs" },
    xl: { icon: 56, text: "text-3xl font-black tracking-tight", subtext: "text-sm" },
    "2xl": { icon: 72, text: "text-4xl font-black tracking-tight", subtext: "text-base" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isMono = monochrome || variant === "monochrome";

  const textColorClass =
    variant === "light"
      ? "text-slate-900"
      : variant === "dark"
      ? "text-white"
      : isMono
      ? "text-current"
      : "text-slate-900 dark:text-white";

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}
      aria-label="SocialFlow"
      role="img"
    >
      {/* Brand Icon: The Classic SocialFlow S-Network Emblem in Rounded Card with Ambient Glow */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Ambient Glow */}
        {!isMono && (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/70 via-purple-600/60 to-pink-500/60 rounded-2xl blur-md opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-all duration-300" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-65 transition-opacity duration-300" />
          </>
        )}

        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${
            animated ? "animate-pulse" : ""
          }`}
          aria-hidden={!iconOnly}
        >
          <defs>
            <radialGradient id="sf-s-bg" cx="50%" cy="20%" r="90%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="sf-s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#6366F1" />
              <stop offset="70%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="sf-s-border" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>

          {/* Squircle Card Container */}
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            rx="10"
            fill={isMono ? "currentColor" : "url(#sf-s-bg)"}
            stroke={isMono ? "currentColor" : "url(#sf-s-border)"}
            strokeWidth="1.2"
          />

          {/* Top Gloss Highlight */}
          {!isMono && (
            <path
              d="M1 10C1 5 5 1 10 1H26C31 1 35 5 35 10V13C35 13 20 8 1 13V10Z"
              fill="#FFFFFF"
              fillOpacity="0.15"
            />
          )}

          {/* Dynamic Flowing S Curve */}
          <path
            d="M25 11.5C25 9.5 22.5 8 18 8C13.5 8 10.5 10.5 10.5 14C10.5 18.5 25.5 16.5 25.5 22C25.5 25.5 22.5 28 18 28C14 28 11.5 26 11.5 23.5"
            stroke={isMono ? "#FFFFFF" : "url(#sf-s-grad)"}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Network Synchronizer Nodes */}
          {!isMono ? (
            <>
              <circle cx="25" cy="11.5" r="2" fill="#38BDF8" />
              <circle cx="25" cy="11.5" r="0.9" fill="#FFFFFF" />

              <circle cx="18" cy="18" r="1.6" fill="#A855F7" />

              <circle cx="11.5" cy="23.5" r="2" fill="#EC4899" />
              <circle cx="11.5" cy="23.5" r="0.9" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <circle cx="25" cy="11.5" r="1.6" fill="#FFFFFF" />
              <circle cx="18" cy="18" r="1.4" fill="#FFFFFF" />
              <circle cx="11.5" cy="23.5" r="1.6" fill="#FFFFFF" />
            </>
          )}
        </svg>
      </div>

      {/* Brand Wordmark */}
      {!iconOnly && (
        <span className={`${currentSize.text} flex items-center leading-none font-black tracking-tight`}>
          <span className={textColorClass}>Social</span>
          {isMono ? (
            <span className={textColorClass}>Flow</span>
          ) : (
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent ml-0.5 group-hover:from-indigo-400 group-hover:to-pink-400 transition-all duration-300">
              Flow
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function SocialFlowIcon({
  size = "md",
  className = "",
  variant = "auto",
  monochrome = false,
  animated = false,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  variant?: "dark" | "light" | "auto" | "monochrome";
  monochrome?: boolean;
  animated?: boolean;
}) {
  return <SocialFlowLogo iconOnly size={size} className={className} variant={variant} monochrome={monochrome} animated={animated} />;
}

// Backward compatibility exports
export const SocialLowLogo = SocialFlowLogo;
export const SocialLowIcon = SocialFlowIcon;
