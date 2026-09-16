'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  User,
  Search,
  Shield,
  KeyRound,
  Globe,
  Monitor,
  Activity,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SessionItem {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  sessionTokenSnippet: string;
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isCurrent: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    isSuperAdmin?: boolean;
  };
}

export default function ActiveSessionsPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'SUPER_ADMIN' | 'CURRENT'>('ALL');
  const [sessionToRevoke, setSessionToRevoke] = useState<SessionItem | null>(null);
  const [showRevokeOthersModal, setShowRevokeOthersModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/security/sessions');
      if (res.ok) {
        const json = await res.json();
        setSessions(json.sessions || []);
      } else {
        showToast('Failed to load active sessions', 'error');
      }
    } catch {
      showToast('Failed to load active sessions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/security/sessions?id=${sessionToRevoke.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'Admin session terminated successfully.', 'success');
        setSessionToRevoke(null);
        fetchSessions();
      } else {
        showToast(json.error || 'Failed to revoke session', 'error');
      }
    } catch {
      showToast('Network error revoking session', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/security/sessions?revokeOthers=true', {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'All other active sessions revoked.', 'success');
        setShowRevokeOthersModal(false);
        fetchSessions();
      } else {
        showToast(json.error || 'Failed to revoke other sessions', 'error');
      }
    } catch {
      showToast('Network error revoking sessions', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics
  const totalSessions = sessions.length;
  const uniqueAdmins = new Set(sessions.map((s) => s.userId)).size;
  const superAdminSessions = sessions.filter(
    (s) => s.user?.isSuperAdmin || s.user?.role === 'SUPER_ADMIN'
  ).length;

  // Filtered Sessions
  const filteredSessions = sessions.filter((sess) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      sess.user?.name?.toLowerCase().includes(q) ||
      sess.user?.email?.toLowerCase().includes(q) ||
      sess.ipAddress?.toLowerCase().includes(q) ||
      sess.browser?.toLowerCase().includes(q) ||
      sess.os?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterRole === 'SUPER_ADMIN') {
      return sess.user?.isSuperAdmin || sess.user?.role === 'SUPER_ADMIN';
    }
    if (filterRole === 'CURRENT') {
      return sess.isCurrent;
    }
    return true;
  });

  const getDeviceIcon = (deviceType: 'desktop' | 'mobile' | 'tablet') => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Access Control & Audit
            </Badge>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Identity Monitor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Active Administrative Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Inspect live administrative tokens, workstation IP addresses, and terminate unauthorized or stale logins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          {sessions.length > 1 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRevokeOthersModal(true)}
              className="gap-1.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Revoke All Other Sessions</span>
            </Button>
          )}
        </div>
      </div>

      {/* Security Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Sessions</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {totalSessions}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Live workstation tokens</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Logged In Admins</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {uniqueAdmins}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Distinct user accounts</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Super Admins</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {superAdminSessions}
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Full platform clearance</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security Protocol</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                TLS 1.3
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">256-bit encrypted JWT</p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by administrator name, email, IP address, or browser..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shrink-0">
          {(['ALL', 'SUPER_ADMIN', 'CURRENT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterRole(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterRole === tab
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'ALL' && 'All Sessions'}
              {tab === 'SUPER_ADMIN' && 'Super Admins'}
              {tab === 'CURRENT' && 'This Device'}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
            <ShieldCheck className="h-9 w-9 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No sessions match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or refresh session list</p>
          </Card>
        ) : (
          filteredSessions.map((sess) => (
            <Card
              key={sess.id}
              className={`rounded-2xl transition-all duration-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 border ${
                sess.isCurrent
                  ? 'bg-gradient-to-r from-emerald-500/5 via-white to-white dark:from-emerald-950/20 dark:via-slate-900/80 dark:to-slate-900/80 border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Admin Info & Device Block */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs shrink-0">
                      <AvatarImage src={sess.user?.avatarUrl || ''} alt={sess.user?.name || 'Admin'} />
                      <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs rounded-xl">
                        {(sess.user?.name || 'A').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sess.user?.name || 'Authorized Admin'}
                        </h3>
                        {sess.isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] tracking-wide border border-emerald-300 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            THIS DEVICE • ACTIVE NOW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate">
                        {sess.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={sess.user?.isSuperAdmin || sess.user?.role === 'SUPER_ADMIN' ? 'destructive' : 'outline'}
                      className="text-[9px] font-bold uppercase tracking-wider"
                    >
                      {sess.user?.role || 'ADMIN'}
                    </Badge>
                  </div>
                </div>

                {/* Technical Session Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Device & OS</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate text-[11px]">
                      {getDeviceIcon(sess.deviceType)}
                      <span className="truncate">{sess.os}</span>
                    </p>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Browser</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate text-[11px]">
                      <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{sess.browser}</span>
                    </p>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">IP Address</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate">
                      {sess.ipAddress}
                    </p>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Sign-in Time</span>
                    <p className="font-mono text-slate-600 dark:text-slate-400 text-[11px] truncate" title={new Date(sess.createdAt).toLocaleString()}>
                      {new Date(sess.createdAt).toLocaleDateString()} {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 w-full lg:w-auto justify-end">
                {sess.isCurrent ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    Current Session
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSessionToRevoke(sess)}
                    className="h-8 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="h-3 w-3 mr-1.5" />
                    Force Logout
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Revoke Single Session Modal */}
      <Modal
        isOpen={Boolean(sessionToRevoke)}
        onClose={() => !isProcessing && setSessionToRevoke(null)}
        title="Terminate Administrative Session?"
        description="Immediately revoke this workstation token and force the administrator to log in again."
        maxWidth="md"
      >
        {sessionToRevoke && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Administrator:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {sessionToRevoke.user?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {sessionToRevoke.user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Workstation IP:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {sessionToRevoke.ipAddress}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Client:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {sessionToRevoke.browser} ({sessionToRevoke.os})
                </span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              This will invalidate the session cookie immediately. Any unsaved actions on that device will be safely halted.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                onClick={() => setSessionToRevoke(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isProcessing}
                onClick={handleRevokeSession}
                className="rounded-xl font-bold bg-rose-600 hover:bg-rose-500"
              >
                Confirm Force Logout
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke ALL Other Sessions Modal */}
      <Modal
        isOpen={showRevokeOthersModal}
        onClose={() => !isProcessing && setShowRevokeOthersModal(false)}
        title="Revoke All Other Sessions?"
        description="Terminate all active sessions on other browsers, laptops, or mobile devices."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">Security Protection Notice</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              All other login tokens associated with your account will be immediately purged. Your current workstation will remain logged in.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setShowRevokeOthersModal(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleRevokeOtherSessions}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-500"
            >
              Revoke All Others
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
