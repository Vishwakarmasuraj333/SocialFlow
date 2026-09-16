'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';
import { SocialFlowLogo } from '@/components/brand/SocialFlowLogo';

interface PlatformItem {
  id: string;
  name: string;
  badge: string;
  brandColor: string;
  isCustomGoogle?: boolean;
}

const ORBIT_PLATFORMS: PlatformItem[] = [
  { id: 'instagram', name: 'Instagram', badge: 'Reels & Stories', brandColor: '#E4405F' },
  { id: 'youtube', name: 'YouTube', badge: 'Shorts & HD', brandColor: '#FF0000' },
  { id: 'tiktok', name: 'TikTok', badge: 'Viral Algorithm', brandColor: '#00F2FE' },
  { id: 'snapchat', name: 'Snapchat', badge: 'Spotlight & Stories', brandColor: '#FFFC00' },
  { id: 'mastodon', name: 'Mastodon', badge: 'Fediverse Hub', brandColor: '#6364FF' },
  { id: 'pinterest', name: 'Pinterest', badge: 'Visual Pins', brandColor: '#E60023' },
  { id: 'threads', name: 'Threads', badge: 'Viral Discourse', brandColor: '#0F172A' },
  { id: 'bluesky', name: 'Bluesky', badge: 'AT Protocol', brandColor: '#0285FF' },
  { id: 'whatsapp', name: 'WhatsApp', badge: 'Channel Broadcast', brandColor: '#25D366' },
  { id: 'telegram', name: 'Telegram', badge: 'Subscribers Hub', brandColor: '#26A5E4' },
  { id: 'facebook', name: 'Facebook', badge: 'Pages & Groups', brandColor: '#1877F2' },
  { id: 'x', name: 'X / Twitter', badge: 'Real-time Feed', brandColor: '#0F172A' },
  { id: 'linkedin', name: 'LinkedIn', badge: 'B2B Authority', brandColor: '#0A66C2' },
  { id: 'google-business', name: 'Google Business', badge: 'Reviews & Local', brandColor: '#1A73E8', isCustomGoogle: true },
];

export function SocialFlowEcosystem() {
  const [angle, setAngle] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ rx: 325, ry: 160 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const speedRef = useRef<number>(0.00014); // current interpolated speed

  // Responsive orbit calibration: generous gap and padding above and below ("upar niche proper gap")
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width < 380) {
        setDimensions({ rx: 160, ry: 82 });
      } else if (width < 520) {
        setDimensions({ rx: 215, ry: 108 });
      } else if (width < 768) {
        setDimensions({ rx: 270, ry: 135 });
      } else {
        setDimensions({ rx: 325, ry: 160 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Medium-slow, majestic pacing ("animation medium do and mast do slow")
  // Smoothly lerps velocity so hover deceleration and resume are butter-smooth
  useEffect(() => {
    const targetNormalSpeed = 0.00014; // ~45s per full rotation: elegant, medium-slow, non-distracting
    const targetHoverSpeed = 0.00003;  // gentle whisper glide when hovering

    const step = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = Math.min(now - lastTimeRef.current, 50); // cap delta against tab-switch jumps
        const target = hoveredId ? targetHoverSpeed : targetNormalSpeed;
        
        // Smooth exponential approach (lerp) towards target speed
        speedRef.current += (target - speedRef.current) * 0.05;
        setAngle((prev) => (prev + delta * speedRef.current) % (Math.PI * 2));
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hoveredId]);

  // Compute 3D "cross andakaar" node positions (Tilted Oval / Elliptical Orbit, NOT round)
  const nodes = useMemo(() => {
    const total = ORBIT_PLATFORMS.length;
    const { rx, ry } = dimensions;

    // Diagonal tilt angle for "cross andakaar" (~ -20 degrees slant)
    const tiltAngle = -0.35; // in radians (~ -20.0°)
    const cosT = Math.cos(tiltAngle);
    const sinT = Math.sin(tiltAngle);

    return ORBIT_PLATFORMS.map((platform, idx) => {
      const nodeAngle = angle + (idx * 2 * Math.PI) / total;
      
      // 1. Raw oval coordinates (distinctly andakaar with rx:ry ratio > 2.5:1)
      const x0 = Math.cos(nodeAngle) * rx;
      const y0 = Math.sin(nodeAngle) * ry;

      // 2. Rotate by tiltAngle to create the diagonal 3D "cross andakaar" slant
      const x = x0 * cosT - y0 * sinT;
      const y = x0 * sinT + y0 * cosT;

      // 3. 3D depth metric: sin(nodeAngle) ranges from -1 (top/back) to +1 (bottom/front)
      const sinVal = Math.sin(nodeAngle);
      const depth = (sinVal + 1) / 2; // [0, 1]

      // Dynamic scale: 0.72x at top/back (chhota), 1.28x at bottom/front (bada)
      const scale = 0.72 + depth * 0.56; // [0.72 -> 1.28]
      const opacity = 0.82 + depth * 0.18; // [0.82 -> 1.00]
      const zIndex = Math.round(12 + depth * 36); // [12 (behind logo) -> 48 (in front of logo)]

      // Base diameter of badge
      const baseDiameter = 46;
      const diameter = Math.round(baseDiameter * scale);

      // Icon size code
      const iconSize: 'xs' | 'sm' | 'md' = scale > 1.15 ? 'md' : scale > 0.92 ? 'sm' : 'xs';

      return {
        platform,
        x,
        y,
        scale,
        opacity,
        zIndex,
        depth,
        diameter,
        iconSize,
      };
    });
  }, [angle, dimensions]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[700px] h-[480px] sm:h-[520px] py-6 mx-auto flex items-center justify-center select-none overflow-visible bg-transparent"
    >
      {/* =========================================================
          1. CLEAN ATMOSPHERIC AMBIENT GLOW
             - Removed crossing wave lines as requested ("dono line remove")
             - Pure soft ethereal glow behind central visual
          ========================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute w-[80%] h-[75%] rounded-full bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-indigo-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* =========================================================
          2. CENTER: Clean SocialFlow Brand Logo
             - Proper generous gap and padding upar-niche
             - Directly on canvas with subtle luminous radial glow
          ========================================================= */}
      <div
        className="relative flex items-center justify-center pointer-events-auto my-3"
        style={{ zIndex: 25 }}
      >
        {/* Soft Radial Ambient Glow */}
        <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        <Link
          href="/#features"
          className="group relative flex items-center gap-3 select-none hover:scale-105 transition-transform duration-300 cursor-pointer px-6 py-3.5 rounded-2xl"
          title="SocialFlow All-In-One Social Media Management"
        >
          {/* Authentic SocialFlow Brand Logo */}
          <SocialFlowLogo size="xl" className="drop-shadow-lg" />
        </Link>
      </div>

      {/* =========================================================
          3. 3D CONTINUOUS REVOLVING ICONS ("gol gol ghumte rhe")
             - Pure WHITE circular glass discs
             - Scales dynamically: BADA at front/bottom, CHHOTA at back/top
             - Passes in front of and behind central logo
             - Hover smoothly glides and highlights ("hover hote rehe")
          ========================================================= */}
      {nodes.map((node) => {
        const { platform, x, y, scale, opacity, zIndex, depth, diameter, iconSize } = node;
        const isCurrentHovered = hoveredId === platform.id;

        return (
          <div
            key={platform.id}
            style={{
              transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`,
              zIndex: isCurrentHovered ? 60 : zIndex,
              opacity: isCurrentHovered ? 1 : opacity,
              willChange: 'transform, opacity',
            }}
            className="absolute flex items-center justify-center pointer-events-auto transition-opacity duration-200"
            onMouseEnter={() => setHoveredId(platform.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Platform-specific halo glow behind hovered icon and bottom foreground icons */}
            {(isCurrentHovered || depth > 0.65) && (
              <div
                className="absolute rounded-full pointer-events-none blur-md transition-all duration-300"
                style={{
                  width: `${diameter + (isCurrentHovered ? 18 : 12)}px`,
                  height: `${diameter + (isCurrentHovered ? 18 : 12)}px`,
                  backgroundColor: isCurrentHovered ? `${platform.brandColor}35` : 'rgba(255, 255, 255, 0.45)',
                  boxShadow: isCurrentHovered
                    ? `0 10px 30px ${platform.brandColor}55`
                    : '0 8px 24px rgba(0, 0, 0, 0.12)',
                }}
              />
            )}

            {/* Pure White Circular Disc Badge with Brand-Specific Hover Border */}
            <Link
              href="/#platforms"
              aria-label={platform.name}
              style={{
                width: `${diameter}px`,
                height: `${diameter}px`,
                borderColor: isCurrentHovered ? platform.brandColor : 'rgba(255, 255, 255, 0.95)',
                boxShadow: isCurrentHovered
                  ? `0 14px 34px -4px ${platform.brandColor}50, 0 0 0 2.5px ${platform.brandColor}, 0 6px 16px rgba(0,0,0,0.16)`
                  : depth > 0.6
                  ? '0 12px 28px rgba(0,0,0,0.22)'
                  : '0 6px 16px rgba(0,0,0,0.14)',
              }}
              className={`relative rounded-full bg-white flex items-center justify-center transition-all duration-200 cursor-pointer group border ${
                isCurrentHovered ? 'scale-125' : ''
              }`}
            >
              {/* Subtle top rim gloss highlight */}
              <span className="absolute inset-x-2 top-1 h-1/3 rounded-t-full bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />

              {/* Vector Icon */}
              <div className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                {platform.isCustomGoogle ? (
                  // Google Business Profile Storefront Badge (Blue circle with white building)
                  <svg
                    width={iconSize === 'md' ? 28 : iconSize === 'sm' ? 22 : 18}
                    height={iconSize === 'md' ? 28 : iconSize === 'sm' ? 22 : 18}
                    viewBox="0 0 36 36"
                    fill="none"
                  >
                    <rect width="36" height="36" rx="18" fill="#1A73E8" />
                    <path
                      d="M9 14.5L11 8H25L27 14.5V16C27 17.3 25.9 18.4 24.6 18.4C23.3 18.4 22.2 17.3 22.2 16C22.2 17.3 21.1 18.4 19.8 18.4C18.5 18.4 17.4 17.3 17.4 16C17.4 17.3 16.3 18.4 15 18.4C13.7 18.4 12.6 17.3 12.6 16C12.6 17.3 11.5 18.4 10.2 18.4C8.9 18.4 7.8 17.3 7.8 16V14.5H9Z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M10.5 18.4V27H25.5V18.4H23V25H13V18.4H10.5Z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M15.5 27V20H20.5V27H15.5Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                ) : (
                  <SocialPlatformIcon platform={platform.id} size={iconSize} />
                )}
              </div>

              {/* Rich Tooltip on Hover */}
              {isCurrentHovered && (
                <div
                  className="absolute left-1/2 -bottom-10 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-slate-950 text-white text-[10px] font-bold tracking-tight shadow-2xl border border-white/20 whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: platform.brandColor }}
                  />
                  <span>{platform.name}</span>
                  <span className="text-slate-400 font-medium">({platform.badge})</span>
                </div>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
