'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { CommandPalette } from '@/components/command-palette';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
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
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  activeWorkspace,
  workspaces,
  children,
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  React.useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  React.useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail && 'avatarUrl' in e.detail) {
        setCurrentUser((prev) => ({
          ...prev,
          avatarUrl: e.detail.avatarUrl,
        }));
      }
    };
    window.addEventListener('admin-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('admin-avatar-updated', handleAvatarUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Global Admin Command Palette */}
      <CommandPalette />

      {/* Sidebar */}
      <Sidebar
        user={currentUser}
        workspace={activeWorkspace}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <Header
          user={currentUser}
          activeWorkspace={activeWorkspace}
          workspaces={workspaces}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>
    </div>
  );
}

