'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';
import { SocialFlowIcon } from '@/components/brand/SocialFlowLogo';
import { Sparkles, Play, Pause, ExternalLink } from 'lucide-react';

interface PlatformNode {
  key: string;
  name: string;
  badge: string;
  brandColor: string;
}

const ORBIT_PLATFORMS: PlatformNode[] = [
  { key: 'instagram', name: 'Instagram', badge: 'Reels & Stories', brandColor: '#E4405F' },
  { key: 'youtube', name: 'YouTube', badge: 'Shorts & HD', brandColor: '#FF0000' },
  { key: 'tiktok', name: 'TikTok', badge: 'Viral Algorithm', brandColor: '#000000' },
  { key: 'linkedin', name: 'LinkedIn', badge: 'B2B Authority', brandColor: '#0A66C2' },
  { key: 'facebook', name: 'Facebook', badge: 'Pages & Groups', brandColor: '#1877F2' },
  { key: 'x', name: 'X / Twitter', badge: 'Real-time Feed', brandColor: '#000000' },
  { key: 'whatsapp', name: 'WhatsApp', badge: 'Channel Broadcast', brandColor: '#25D366' },
  { key: 'telegram', name: 'Telegram', badge: 'Subscribers Hub', brandColor: '#26A5E4' },
  { key: 'threads', name: 'Threads', badge: 'Viral Discourse', brandColor: '#000000' },
  { key: 'pinterest', name: 'Pinterest', badge: 'Visual Pins', brandColor: '#E60023' },
  { key: 'bluesky', name: 'Bluesky', badge: 'Decentralized', brandColor: '#0285FF' },
  { key: 'mastodon', name: 'Mastodon', badge: 'Fediverse', brandColor: '#6364FF' },
  { key: 'discord', name: 'Discord', badge: 'Community Ops', brandColor: '#5865F2' },
];

export function SocialOrbitShowcase() {
  const [angle, setAngle] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformNode | null>(null);
  const [dimensions, setDimensions] = useState({ rx: 195, ry: 110, size: 520 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Responsive dimension calibration
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width < 380) {
        setDimensions({ rx: 125, ry: 70, size: 340 });
      } else if (width < 500) {
        setDimensions({ rx: 155, ry: 85, size: 420 });
      } else if (width < 640) {
        setDimensions({ rx: 175, ry: 98, size: 460 });
      } else {
        setDimensions({ rx: 200, ry: 115, size: 520 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 60fps Smooth Rotational Physics
  useEffect(() => {
    const speed = 0.00038; // radians per millisecond (~16.5s per revolution)

    const step = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = now - lastTimeRef.current;
        if (!isHovered) {
          setAngle((prev) => (prev + delta * speed) % (Math.PI * 2));
        }
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered]);

  // Compute 3D node positions, sizes and depth stacks
  const nodes = useMemo(() => {
    const total = ORBIT_PLATFORMS.length;
    const { rx, ry } = dimensions;

    return ORBIT_PLATFORMS.map((platform, idx) => {
      const nodeAngle = angle + (idx * 2 * Math.PI) / total;
      const x = Math.cos(nodeAngle) * rx;
      const y = Math.sin(nodeAngle) * ry;

      // Depth metric: -1 is topmost/back, +1 is bottommost/front
      const sinVal = Math.sin(nodeAngle);
      const depth = (sinVal + 1) / 2; // Range [0, 1]

      // Dynamic scale: smaller in background (0.72x), larger in foreground (1.35x)
      const scale = 0.72 + depth * 0.63; // [0.72 -> 1.35]
      const opacity = 0.75 + depth * 0.25; // [0.75 -> 1.00]
      const zIndex = Math.round(10 + depth * 40); // [10 -> 50]

      // Disc dimensions based on scale
      const baseDiameter = 46; // base px
      const currentDiameter = Math.round(baseDiameter * scale);

      return {
        platform,
        x,
        y,
        scale,
        opacity,
        zIndex,
        depth,
        diameter: currentDiameter,
      };
    });
  }, [angle, dimensions]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[540px] aspect-square flex items-center justify-center select-none overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActivePlatform(null);
      }}
    >
      {/* 1. Ambient Background Ethereal Waves (Inspired by reference visual) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-full">
        {/* Soft Multi-color Ambient Radial Glow */}
        <div className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-sky-400/20 via-indigo-500/20 to-pink-500/20 dark:from-sky-500/15 dark:via-purple-600/20 dark:to-pink-600/20 blur-[70px] animate-pulse" />

        {/* Ethereal curved wave glow bands */}
        <svg
          viewBox="0 0 500 500"
          className="absolute w-full h-full opacity-35 dark:opacity-20 text-indigo-400 dark:text-cyan-400"
          fill="none"
        >
          <path
            d="M -50 380 C 120 360, 240 460, 550 320"
            stroke="currentColor"
            strokeWidth="38"
            strokeLinecap="round"
            className="blur-xl"
          />
          <path
            d="M -50 240 C 150 180, 320 340, 550 200"
            stroke="url(#wave-gradient)"
            strokeWidth="14"
            strokeLinecap="round"
            className="blur-md"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. 3D Elliptical Orbital Track Ring */}
      <div
        className="absolute pointer-events-none rounded-[50%]"
        style={{
          width: `${dimensions.rx * 2}px`,
          height: `${dimensions.ry * 2}px`,
          border: '1.5px dashed rgba(99, 102, 241, 0.22)',
          boxShadow: '0 0 35px rgba(99, 102, 241, 0.08) inset',
        }}
      />
      {/* Secondary subtle guide orbit */}
      <div
        className="absolute pointer-events-none rounded-[50%]"
        style={{
          width: `${dimensions.rx * 2 + 30}px`,
          height: `${dimensions.ry * 2 + 18}px`,
          border: '1px solid rgba(147, 197, 253, 0.15)',
        }}
      />

      {/* 3. Central Brand Hub (SocialFlow Logo in center as requested) */}
      <div
        className="relative z-25 flex items-center justify-center pointer-events-auto"
        style={{ zIndex: 28 }}
      >
        <Link
          href="/#features"
          className="group/hub flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/15 shadow-[0_20px_50px_-10px_rgba(99,102,241,0.22)] dark:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:scale-105 hover:shadow-[0_25px_65px_-10px_rgba(99,102,241,0.35)] transition-all duration-300 cursor-pointer"
          title="SocialFlow All-In-One Social Platform"
        >
          {/* Animated SocialFlow Brand Symbol */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 opacity-40 group-hover/hub:opacity-80 blur-sm transition-opacity" />
            <SocialFlowIcon size="lg" className="relative z-10 drop-shadow-md" />
          </div>

          {/* Typography Brand Block */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Social<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Flow</span>
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-1">
              Social Operations OS
            </span>
          </div>
        </Link>
      </div>

      {/* 4. Orbiting Circular Platform Nodes (Size scales dynamically based on 3D depth) */}
      {nodes.map((node) => {
        const { platform, x, y, scale, opacity, zIndex, depth, diameter } = node;
        const isHoveredNode = activePlatform?.key === platform.key;

        // Determine icon size string for SocialPlatformIcon
        const iconSize = scale > 1.2 ? 'md' : scale > 0.95 ? 'sm' : 'xs';

        return (
          <div
            key={platform.key}
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
              zIndex: isHoveredNode ? 60 : zIndex,
              opacity: isHoveredNode ? 1 : opacity,
            }}
            className="absolute flex items-center justify-center pointer-events-auto transition-opacity duration-150"
            onMouseEnter={() => setActivePlatform(platform)}
          >
            {/* The Crisp Rounded Circular Badge (Exactly like reference image) */}
            <Link
              href="/#platforms"
              aria-label={platform.name}
              style={{
                width: `${diameter}px`,
                height: `${diameter}px`,
              }}
              className={`relative rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer group/node ${
                depth > 0.6
                  ? 'bg-white/95 dark:bg-slate-900/95 border-2 border-white dark:border-slate-700/80 shadow-[0_12px_28px_-4px_rgba(0,0,0,0.18)] dark:shadow-[0_14px_35px_-4px_rgba(0,0,0,0.85)]'
                  : 'bg-white/90 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-[0_6px_16px_-2px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.7)]'
              } hover:scale-125 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-[0_16px_35px_rgba(99,102,241,0.35)]`}
            >
              {/* Inner ambient glow on hover */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover/node:opacity-30 transition-opacity duration-200 blur-xs pointer-events-none"
                style={{ backgroundColor: platform.brandColor }}
              />

              {/* Vector Platform Icon */}
              <div className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover/node:scale-110">
                <SocialPlatformIcon platform={platform.key} size={iconSize} />
              </div>

              {/* Floating Tooltip Pill on Hover */}
              {isHoveredNode && (
                <div
                  className="absolute left-1/2 -bottom-10 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-slate-950 text-white text-[10px] font-bold tracking-tight shadow-2xl border border-white/20 whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-150"
                  style={{ zIndex: 100 }}
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

      {/* 5. Minimal Play/Pause Speed Status Pill in Bottom Corner */}
      <div className="absolute bottom-1 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 text-[10px] font-semibold text-slate-500 dark:text-slate-400 backdrop-blur-md">
        <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
        <span>{isHovered ? 'Hovered (Paused)' : '13 Connected Channels'}</span>
      </div>
    </div>
  );
}
