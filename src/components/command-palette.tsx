'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Share2,
  BarChart3,
  Layers,
  Image as ImageIcon,
  Users,
  Settings,
  Trash2,
  Search,
  X,
  Shield,
  Globe,
  Building2,
  Server,
  FileText,
  MapPin,
  Bell,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for keyboard shortcuts: Ctrl+K, Cmd+K, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) setQuery('');
          return !prev;
        });
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setQuery('');
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: 'create-post',
      title: 'Create Social Post',
      description: 'Open studio composer to schedule or draft posts',
      category: 'Quick Actions',
      icon: PlusCircle,
      action: () => router.push('/content/create'),
    },
    {
      id: 'add-website',
      title: 'Register Website Fleet Property',
      description: 'Add new domain or web property',
      category: 'Quick Actions',
      icon: Globe,
      action: () => router.push('/admin/websites'),
    },
    {
      id: 'upload-media',
      title: 'Upload Media Asset',
      description: 'Add images, videos or branding assets',
      category: 'Quick Actions',
      icon: ImageIcon,
      action: () => router.push('/admin/media'),
    },
    {
      id: 'company-settings',
      title: 'Edit Company Profile & Settings',
      description: 'Legal identity, headquarters, address and phone',
      category: 'Quick Actions',
      icon: Building2,
      action: () => router.push('/admin/company'),
    },

    // Navigation - Core Modules
    {
      id: 'dashboard',
      title: 'Admin Command Center',
      description: 'Platform overview, system health and metrics',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => router.push('/admin/dashboard'),
    },
    {
      id: 'company',
      title: 'Company Management & HQ',
      description: 'Manage legal entities, locations and profile',
      category: 'Navigation',
      icon: Building2,
      action: () => router.push('/admin/company'),
    },
    {
      id: 'websites',
      title: 'Websites & Fleet Properties',
      description: 'Manage production and staging websites',
      category: 'Navigation',
      icon: Globe,
      action: () => router.push('/admin/websites'),
    },
    {
      id: 'domains',
      title: 'Domain Portfolio & SSL Tracker',
      description: 'DNS status, verification and SSL certificates',
      category: 'Navigation',
      icon: Layers,
      action: () => router.push('/admin/websites/domains'),
    },
    {
      id: 'social-accounts',
      title: 'Connected Social Media Channels',
      description: 'LinkedIn, X, Instagram, Facebook accounts',
      category: 'Navigation',
      icon: Share2,
      action: () => router.push('/admin/social/accounts'),
    },
    {
      id: 'posts-manager',
      title: 'Posts & Scheduled Content Feed',
      description: 'View, edit, duplicate or delete social posts',
      category: 'Navigation',
      icon: FileText,
      action: () => router.push('/admin/social/posts'),
    },
    {
      id: 'calendar',
      title: 'Social Editorial Calendar',
      description: 'Monthly and weekly scheduled post planner',
      category: 'Navigation',
      icon: Calendar,
      action: () => router.push('/calendar'),
    },
    {
      id: 'media-vault',
      title: 'Media Asset Vault',
      description: 'Uploaded files, dimensions, mime types and storage',
      category: 'Navigation',
      icon: ImageIcon,
      action: () => router.push('/admin/media'),
    },
    {
      id: 'analytics',
      title: 'Performance & Growth Analytics',
      description: 'Reach, engagement, impressions and growth trends',
      category: 'Navigation',
      icon: BarChart3,
      action: () => router.push('/analytics'),
    },
    {
      id: 'notifications',
      title: 'Admin Notifications & Alerts',
      description: 'System events, failed posts and security alerts',
      category: 'Navigation',
      icon: Bell,
      action: () => router.push('/admin/notifications'),
    },
    {
      id: 'trash',
      title: 'Central Trash & Soft-Delete Recovery',
      description: 'Recover or permanently purge deleted items',
      category: 'Navigation',
      icon: Trash2,
      action: () => router.push('/admin/trash'),
    },

    // Admin & Security Settings
    {
      id: 'admin-profile',
      title: 'Admin Profile & Identity',
      description: 'Name, photo upload, bio headline and admin ID',
      category: 'Settings & Security',
      icon: Users,
      action: () => router.push('/settings?tab=profile'),
    },
    {
      id: 'email-account',
      title: 'Change Email & Account Verification',
      description: 'Update primary administrator email with password check',
      category: 'Settings & Security',
      icon: Lock,
      action: () => router.push('/settings?tab=email'),
    },
    {
      id: 'password-security',
      title: 'Password Security & Active Sessions',
      description: 'Change password, view sessions, revoke tokens',
      category: 'Settings & Security',
      icon: Shield,
      action: () => router.push('/settings?tab=security'),
    },
    {
      id: 'workspace-settings',
      title: 'Workspace Configuration & Brand',
      description: 'Timezone, default currency, brand colors',
      category: 'Settings & Security',
      icon: Settings,
      action: () => router.push('/settings?tab=workspace'),
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q))
    );
  });

  const categories = Array.from(new Set(filteredCommands.map((cmd) => cmd.category)));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5),0_0_35px_rgba(99,102,241,0.12)] backdrop-blur-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (filteredCommands.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = filteredCommands[selectedIndex];
                if (item) {
                  item.action();
                  setIsOpen(false);
                }
              }
            }}
            placeholder="Search commands, websites, posts, settings..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              title="Clear search"
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Close (Esc)"
            aria-label="Close command palette"
            className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-800/60 shadow-xs transition-all duration-200 cursor-pointer group shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.4] transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <Search className="w-6 h-6 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-slate-400">Try searching for posts, companies, websites, or settings</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {cat}
                </div>
                {filteredCommands
                  .filter((cmd) => cmd.category === cat)
                  .map((cmd) => {
                    const globalIdx = filteredCommands.findIndex((c) => c.id === cmd.id);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-left cursor-pointer group border transition-all duration-150 ${
                          isSelected
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-transparent'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-600 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100/60 dark:group-hover:bg-indigo-900/60'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold truncate ${
                              isSelected
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}
                          >
                            {cmd.title}
                          </p>
                          {cmd.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 transition-all ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                              : 'text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5'
                          }`}
                        />
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">SocialFlow Command Center</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">↵</kbd>
              select
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">Esc</kbd>
              exit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
