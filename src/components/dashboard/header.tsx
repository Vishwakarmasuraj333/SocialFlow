'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Building2,
  Share2,
  Layers,
  Image as ImageIcon,
  CheckCheck,
  Sparkles,
  User,
  Settings,
  Calendar,
  Shield,
  LogOut,
  HelpCircle,
  ExternalLink,
  LayoutDashboard,
  Globe,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/providers';
import { useToast } from '@/components/ui/toast';
import { AdminAvatar } from '@/components/ui/avatar';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    isSuperAdmin?: boolean;
    role?: string;
  };
  activeWorkspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onOpenMobileMenu: () => void;
}

export function Header({
  user,
  activeWorkspace,
  workspaces,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onOpenMobileMenu,
}: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Dropdown states
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Synchronized real-time avatar URL
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null | undefined>(user.avatarUrl);

  useEffect(() => {
    setCurrentAvatarUrl(user.avatarUrl);
  }, [user.avatarUrl]);

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail && 'avatarUrl' in e.detail) {
        setCurrentAvatarUrl(e.detail.avatarUrl);
      }
    };
    window.addEventListener('admin-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('admin-avatar-updated', handleAvatarUpdate);
  }, []);

  const notifRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchWorkspace = async (workspaceId: string) => {
    setWorkspaceMenuOpen(false);
    await fetch('/api/auth/switch-workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    window.location.reload();
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = async () => {
    await fetch('/api/notifications?clearAll=true', { method: 'DELETE' });
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    showToast('Signing out securely...', 'info');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 400);
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200">
      {/* Left side: Animated Hamburger-to-X Cross & Workspace Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu || onOpenMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden relative w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        >
          <div className="w-4 h-3.5 relative flex flex-col justify-between items-center pointer-events-none">
            <span
              className={`w-4 h-0.5 bg-slate-700 dark:bg-slate-200 rounded-full transition-all duration-300 ease-in-out transform origin-center ${
                isMobileMenuOpen ? "rotate-45 translate-y-[6px]" : ""
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-slate-700 dark:bg-slate-200 rounded-full transition-all duration-200 ease-in-out ${
                isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-slate-700 dark:bg-slate-200 rounded-full transition-all duration-300 ease-in-out transform origin-center ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
              }`}
            />
          </div>
        </button>

        {/* Workspace Dropdown */}
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[180px]">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Workspaces ({workspaces.length})
              </div>
              <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitchWorkspace(ws.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <div className="truncate">
                      <p className="font-semibold truncate">{ws.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ws.role}</p>
                    </div>
                    {ws.id === activeWorkspace?.id && (
                      <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search / Command Trigger with Smooth Hover & Focus Animation */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-command-palette'));
          }}
          className="w-full group flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 text-xs text-slate-500 dark:text-slate-400 transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span className="group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Search posts, accounts, campaigns...</span>
          </span>
          <kbd className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono border border-slate-300/80 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right side: Actions, Notifications, Theme, User Avatar Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Quick Search Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          aria-label="Search"
          className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shadow-xs"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        {/* + Create Action Menu */}
        <div className="relative" ref={createRef}>
          <Button
            size="sm"
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center gap-1.5 shadow-md shadow-indigo-600/20 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Button>

          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="space-y-1 pb-1">
                <Link
                  href="/admin/social/publisher"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <Share2 className="h-4 w-4 text-indigo-500" />
                  <span>Create Social Post</span>
                </Link>
                <Link
                  href="/admin/websites"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                >
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Register Website</span>
                </Link>
                <Link
                  href="/admin/websites/domains"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-600/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                >
                  <Layers className="h-4 w-4 text-emerald-500" />
                  <span>Add Domain</span>
                </Link>
              </div>

              <div className="space-y-1 pt-1">
                <Link
                  href="/admin/media"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-600/20 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <ImageIcon className="h-4 w-4 text-purple-500" />
                  <span>Upload Media Asset</span>
                </Link>
                <Link
                  href="/admin/company/locations"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-600/20 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                >
                  <Building2 className="h-4 w-4 text-amber-500" />
                  <span>Add Office Location</span>
                </Link>
                <Link
                  href="/admin/admins"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Staff Directory</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Open notifications"
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && <Badge variant="default">{unreadCount} new</Badge>}
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-slate-400 hover:text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                    <Bell className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600 mb-1.5 opacity-60" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No new notifications</p>
                    <p className="text-[11px] text-slate-400">System alerts and publishing updates will appear here.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.linkUrl) router.push(n.linkUrl);
                        setNotificationsOpen(false);
                      }}
                      className={`relative group p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        n.isRead
                          ? 'border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400'
                          : 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/20 text-slate-900 dark:text-slate-200 font-medium shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(e, n.id)}
                          title="Dismiss notification"
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="Open user menu"
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:pr-3 rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-md transition-all cursor-pointer group"
          >
            <AdminAvatar
              src={currentAvatarUrl}
              name={user.name}
              size="sm"
              className="ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all"
            />
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user.isSuperAdmin ? 'Super Admin' : (user.role || 'Admin')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Info Header */}
              <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <AdminAvatar
                    src={currentAvatarUrl}
                    name={user.name}
                    size="md"
                    className="ring-2 ring-indigo-500/30"
                  />
                  <div className="truncate min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-wider">
                    {user.isSuperAdmin ? 'Super Admin' : (user.role || 'Admin')}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
                    Active Verified
                  </Badge>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/settings?tab=profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Admin Profile & Photo</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-500">Edit</span>
                </Link>
                <Link
                  href="/settings?tab=workspace"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </Link>
                <Link
                  href="/settings?tab=security"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security & Sessions</span>
                </Link>
              </div>

              {/* Logout Action */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign Out of Admin Console?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Are you sure you want to end your current session?</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

