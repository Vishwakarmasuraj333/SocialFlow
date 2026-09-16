'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdminAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showStatus?: boolean;
  statusColor?: 'emerald' | 'amber' | 'indigo' | 'rose';
  title?: string;
}

export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'SF';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SF';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminAvatar({
  src,
  name = 'Admin User',
  size = 'md',
  className,
  showStatus = false,
  statusColor = 'emerald',
  title,
}: AdminAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // When src changes, reset error state so fresh uploads or updates display immediately
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8.5 h-8.5 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-2xl font-bold',
  }[size];

  // Properly positioned dot at the bottom-right corner without overlapping the face
  const statusDotSizes = {
    xs: 'w-2 h-2 bottom-0 right-0 translate-x-0.5 translate-y-0.5 ring-1.5',
    sm: 'w-2.5 h-2.5 bottom-0 right-0 translate-x-0.5 translate-y-0.5 ring-2',
    md: 'w-3 h-3 bottom-0 right-0 translate-x-0.5 translate-y-0.5 ring-2',
    lg: 'w-3.5 h-3.5 bottom-0 right-0 ring-2',
    xl: 'w-4 h-4 bottom-0.5 right-0.5 ring-2',
    '2xl': 'w-5 h-5 bottom-1 right-1 ring-2',
  }[size];

  const statusColors = {
    emerald: 'bg-emerald-500 ring-white dark:ring-slate-900',
    amber: 'bg-amber-500 ring-white dark:ring-slate-900',
    indigo: 'bg-indigo-500 ring-white dark:ring-slate-900',
    rose: 'bg-rose-500 ring-white dark:ring-slate-900',
  }[statusColor];

  const isPhotoAvailable = Boolean(src) && !imageError;

  return (
    <div
      className={cn(
        'relative shrink-0 select-none inline-flex items-center justify-center rounded-full',
        sizeClasses,
        className
      )}
      title={title || name || 'Administrator Profile'}
    >
      {isPhotoAvailable && src ? (
        <img
          src={src}
          alt={name || 'Admin'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs bg-slate-100 dark:bg-slate-900"
        />
      ) : (
        <div
          className={cn(
            'w-full h-full rounded-full flex items-center justify-center font-bold tracking-tight',
            'bg-linear-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-2xs',
            'border border-indigo-400/30'
          )}
          aria-label={name || 'Admin'}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute rounded-full z-10 pointer-events-none',
            statusDotSizes,
            statusColors
          )}
        />
      )}
    </div>
  );
}

export function Avatar({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)}>{children}</div>;
}

export function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error) return null;
  return <img src={src} alt={alt || ''} onError={() => setError(true)} className={cn('aspect-square h-full w-full object-cover', className)} />;
}

export function AvatarFallback({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold', className)}>
      {children}
    </div>
  );
}
