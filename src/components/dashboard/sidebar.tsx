'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Globe,
  Share2,
  Image as ImageIcon,
  Server,
  Shield,
  Users,
  Settings,
  Trash2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Calendar,
  PenTool,
  Layers,
  BarChart3,
  KeyRound,
  FileText,
  Activity,
  Lock,
  Database,
  HardDrive,
  Radio,
  FileCheck2,
  Search,
  Sparkles,
  MapPin,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialFlowLogo } from '@/components/brand/logo';
import { AdminAvatar } from '@/components/ui/avatar';

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    isSuperAdmin?: boolean;
    role?: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavSection {
  title: string;
  icon: any;
  href?: string;
  badge?: string;
  children?: {
    name: string;
    href: string;
    badge?: string;
  }[];
}

export function Sidebar({
  user,
  workspace,
  isOpenMobile,
  onCloseMobile,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const isCurrentAdminRoute = pathname.startsWith('/admin');
  const [mode, setMode] = useState<'studio' | 'admin'>(isCurrentAdminRoute ? 'admin' : 'studio');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    }
  };

  // Synchronized real-time avatar URL
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null | undefined>(user.avatarUrl);

  React.useEffect(() => {
    setCurrentAvatarUrl(user.avatarUrl);
  }, [user.avatarUrl]);

  React.useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail && 'avatarUrl' in e.detail) {
        setCurrentAvatarUrl(e.detail.avatarUrl);
      }
    };
    window.addEventListener('admin-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('admin-avatar-updated', handleAvatarUpdate);
  }, []);

  React.useEffect(() => {
    setMode(pathname.startsWith('/admin') ? 'admin' : 'studio');
  }, [pathname]);

  // Global Keyboard Shortcut: Ctrl+B or Cmd+B to toggle sidebar collapse
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleCollapse?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Publishing: true,
    Engagement: true,
    Intelligence: true,
    Organization: false,
    Company: true,
    Websites: true,
    Social: true,
    Infrastructure: false,
    Security: false,
    Admins: false,
    Settings: false,
  });

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const studioNavSections: NavSection[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Publishing',
      icon: PenTool,
      children: [
        { name: 'Studio Composer', href: '/content/create', badge: 'NEW' },
        { name: 'Content & Posts', href: '/content' },
        { name: 'Content Calendar', href: '/calendar' },
        { name: 'Approvals Queue', href: '/approvals' },
      ],
    },
    {
      title: 'Engagement',
      icon: Activity,
      children: [
        { name: 'Unified Inbox', href: '/inbox' },
        { name: 'Social Channels', href: '/social-accounts' },
        { name: 'Active Campaigns', href: '/campaigns' },
      ],
    },
    {
      title: 'Intelligence',
      icon: BarChart3,
      children: [
        { name: 'Performance Analytics', href: '/analytics' },
        { name: 'Media Vault', href: '/media' },
        { name: 'Executive Reports', href: '/reports' },
      ],
    },
    {
      title: 'Organization',
      icon: Users,
      children: [
        { name: 'Team Members', href: '/team' },
        { name: 'Trash Recovery', href: '/trash' },
        { name: 'Workspace Settings', href: '/settings' },
      ],
    },
  ];

  const adminNavSections: NavSection[] = [
    {
      title: 'Admin Center',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      title: 'Company',
      icon: Building2,
      children: [
        { name: 'Overview', href: '/admin/company' },
        { name: 'Profile', href: '/admin/company/profile' },
        { name: 'Locations', href: '/admin/company/locations' },
        { name: 'Activity', href: '/admin/company/activity' },
      ],
    },
    {
      title: 'Websites Fleet',
      icon: Globe,
      children: [
        { name: 'All Websites', href: '/admin/websites' },
        { name: 'Domains', href: '/admin/websites/domains' },
        { name: 'DNS Records', href: '/admin/websites/dns' },
        { name: 'Hosting & Infra', href: '/admin/websites/infrastructure' },
        { name: 'Deployments', href: '/admin/websites/deployments' },
        { name: 'Content & CMS', href: '/admin/websites/content' },
        { name: 'SEO & Metadata', href: '/admin/websites/seo' },
      ],
    },
    {
      title: 'Social Governance',
      icon: Share2,
      children: [
        { name: 'Accounts', href: '/admin/social/accounts' },
        { name: 'Publisher', href: '/admin/social/publisher' },
        { name: 'Calendar', href: '/admin/social/calendar' },
        { name: 'Posts & Feed', href: '/admin/social/posts' },
        { name: 'Campaigns', href: '/admin/social/campaigns' },
        { name: 'Analytics', href: '/admin/social/analytics' },
      ],
    },
    {
      title: 'Media Library',
      icon: ImageIcon,
      children: [
        { name: 'All Assets', href: '/admin/media' },
        { name: 'Images', href: '/admin/media?type=image' },
        { name: 'Videos', href: '/admin/media?type=video' },
        { name: 'Documents', href: '/admin/media?type=document' },
      ],
    },
    {
      title: 'Infrastructure',
      icon: Server,
      children: [
        { name: 'System Diagnostics & Health', href: '/admin/system-health' },
        { name: 'Servers & VPS', href: '/admin/infrastructure/servers' },
        { name: 'Databases', href: '/admin/infrastructure/databases' },
        { name: 'Cloud Storage', href: '/admin/infrastructure/storage' },
        { name: 'CDN Networks', href: '/admin/infrastructure/cdn' },
        { name: 'Services & APIs', href: '/admin/infrastructure/services' },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      children: [
        { name: 'Login Activity', href: '/admin/security/login-activity' },
        { name: 'Active Sessions', href: '/admin/security/sessions' },
        { name: 'Audit Logs', href: '/admin/security/audit-logs' },
        { name: 'Integrations', href: '/admin/security/integrations' },
        { name: 'System Reports', href: '/admin/reports' },
      ],
    },
    {
      title: 'Admins & Tenancy',
      icon: Users,
      badge: user.isSuperAdmin ? 'SUPER' : undefined,
      children: [
        { name: 'All Admins', href: '/admin/admins' },
        { name: 'Workspaces Fleet', href: '/admin/workspaces' },
        { name: 'Platform Users', href: '/admin/users' },
        { name: 'Roles & RBAC', href: '/admin/admins/roles' },
        { name: 'Permissions', href: '/admin/admins/permissions' },
      ],
    },
    {
      title: 'Trash Recovery',
      icon: Trash2,
      href: '/admin/trash',
    },
    {
      title: 'Enterprise Settings',
      icon: Settings,
      children: [
        { name: 'Company Settings', href: '/admin/settings/company' },
        { name: 'My Profile', href: '/admin/settings/profile' },
        { name: 'Security & 2FA', href: '/admin/settings/security' },
        { name: 'Notifications', href: '/admin/settings/notifications' },
        { name: 'API & Webhooks', href: '/admin/settings/integrations' },
      ],
    },
  ];

  const currentNavSections = mode === 'admin' ? adminNavSections : studioNavSections;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 select-none">
      {/* Brand Header */}
      <div>
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-200 shrink-0',
            collapsed ? 'justify-center px-2' : 'justify-between px-3.5'
          )}
        >
          <Link href={mode === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5 overflow-hidden group min-w-0">
            {collapsed ? (
              <SocialFlowLogo iconOnly size="sm" />
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <SocialFlowLogo size="sm" />
                <span className={cn(
                  "text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md border shrink-0",
                  mode === 'admin'
                    ? "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                    : "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                )}>
                  {mode === 'admin' ? 'ADMIN' : 'STUDIO'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Mode Switcher Segmented Control */}
        {!collapsed ? (
          <div className="px-3 pt-3 pb-1">
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('studio')}
                className={cn(
                  'flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer',
                  mode === 'studio'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span>Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={cn(
                  'flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer',
                  mode === 'admin'
                    ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2 flex justify-center border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode(mode === 'admin' ? 'studio' : 'admin')}
              title={mode === 'admin' ? 'Switch to Studio Mode' : 'Switch to Admin Console'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {mode === 'admin' ? <Shield className="w-4 h-4 text-rose-500" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        )}

        {/* Navigation items list */}
        <div className="px-2.5 py-2 space-y-1 max-h-[calc(100vh-17rem)] overflow-y-auto scrollbar-thin">
          {currentNavSections.map((section) => {
            const Icon = section.icon;

            // Direct link item
            if (section.href) {
              const isActive =
                pathname === section.href ||
                (section.href === '/dashboard' && pathname === '/dashboard') ||
                (section.href === '/admin/dashboard' && (pathname === '/admin' || pathname === '/admin/dashboard'));

              return (
                <Link
                  key={section.title}
                  href={section.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  )}
                  title={collapsed ? section.title : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{section.title}</span>}
                  </div>
                </Link>
              );
            }

            // Accordion section
            const isExpanded = Boolean(expandedSections[section.title]);
            const isChildActive = section.children?.some(
              (c) => pathname === c.href || (c.href !== '/admin' && pathname.startsWith(c.href))
            );

            return (
              <div key={section.title} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    isChildActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  )}
                  title={collapsed ? section.title : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{section.title}</span>}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1">
                      {section.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          {section.badge}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sub-items */}
                {!collapsed && isExpanded && section.children && (
                  <div className="pl-7 pr-1 space-y-0.5 pt-0.5 border-l-2 border-slate-100 dark:border-slate-800/80 ml-4">
                    {section.children.map((child) => {
                      const isSubActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onCloseMobile}
                          className={cn(
                            'block px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors truncate',
                            isSubActive
                              ? 'text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/40'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Profile, Logout & Bottom Collapse Control */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-950/60 shrink-0">
        {/* TOP: Collapse / Expand Toggle Button with Text & Chevrons */}
        {onToggleCollapse && (
          <div>
            {!collapsed ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar (<>)"
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100/60 dark:group-hover:bg-indigo-900/60 border border-slate-200/80 dark:border-slate-700/80 transition-all">
                    <ChevronsLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </span>
                  <span className="font-medium">Collapse Sidebar</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">
                  &lt;&gt;
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Expand sidebar (<>)"
                className="w-9 h-9 mx-auto flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 shadow-xs transition-all duration-150 cursor-pointer group"
              >
                <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        )}

        {/* BOTTOM: Admin User Profile Card & Admin Logout */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
          {!collapsed ? (
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 shadow-2xs">
              <Link
                href="/settings"
                onClick={onCloseMobile}
                title="View & Edit Account Settings"
                className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity cursor-pointer"
              >
                <AdminAvatar
                  src={currentAvatarUrl}
                  name={user.name}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                    {user.isSuperAdmin ? 'Platform Admin' : (user.role || 'Admin')}
                  </p>
                </div>
              </Link>

              {/* Admin Logout Button */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign Out of Admin Console"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60 transition-all cursor-pointer ml-1 shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/settings"
                onClick={onCloseMobile}
                title={`${user.name} (${user.email}) - Settings`}
                className="relative group cursor-pointer"
              >
                <AdminAvatar
                  src={currentAvatarUrl}
                  name={user.name}
                  size="sm"
                  className="group-hover:scale-105 transition-transform"
                />
              </Link>

              {/* Collapsed Admin Logout */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign Out of Admin Console"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden md:block transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-[85vw] flex-col bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

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
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
