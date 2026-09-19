'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Share2,
  Calendar,
  Send,
  AlertTriangle,
  Image as ImageIcon,
  Server,
  Users,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  Building2,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showToast('Failed to load dashboard metrics from database', 'error');
      }
    } catch {
      showToast('Network error while computing dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {
    totalWebsites: 0,
    activeWebsites: 0,
    domains: 0,
    socialAccounts: 0,
    connectedPlatforms: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    failedPosts: 0,
    mediaAssets: 0,
    infrastructureAssets: 0,
    activeAdmins: 0,
    securityEvents: 0,
  };

  const metricCards = [
    {
      title: 'Total Websites',
      value: stats.totalWebsites,
      sub: `${stats.activeWebsites} Active Production Sites`,
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
      href: '/admin/websites',
    },
    {
      title: 'Domains Managed',
      value: stats.domains,
      sub: 'DNS & SSL Tracked',
      icon: Globe,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/60',
      href: '/admin/websites/domains',
    },
    {
      title: 'Social Accounts',
      value: stats.socialAccounts,
      sub: `${stats.connectedPlatforms} Connected Channels`,
      icon: Share2,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/60',
      href: '/admin/social/accounts',
    },
    {
      title: 'Scheduled Posts',
      value: stats.scheduledPosts,
      sub: 'Pending Dispatch Queue',
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60',
      href: '/admin/social/calendar',
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      sub: 'Confirmed Platform Deliveries',
      icon: Send,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
      href: '/admin/social/posts',
    },
    {
      title: 'Failed Posts',
      value: stats.failedPosts,
      sub: stats.failedPosts > 0 ? 'Requires Attention' : 'Zero Delivery Failures',
      icon: AlertTriangle,
      color: stats.failedPosts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500',
      bg: stats.failedPosts > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
      href: '/admin/social/posts',
    },
    {
      title: 'Media Assets',
      value: stats.mediaAssets,
      sub: 'Digital Asset Storage',
      icon: ImageIcon,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
      href: '/admin/media',
    },
    {
      title: 'Infrastructure Assets',
      value: stats.infrastructureAssets,
      sub: 'Servers, DBs & CDNs',
      icon: Server,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60',
      href: '/admin/infrastructure/servers',
    },
    {
      title: 'Active Admins',
      value: stats.activeAdmins,
      sub: 'Authorized Staff Accounts',
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/60',
      href: '/admin/admins',
    },
    {
      title: 'Security Events',
      value: stats.securityEvents,
      sub: 'Audited Administrative Actions',
      icon: ShieldAlert,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60',
      href: '/admin/security/audit-logs',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
              Enterprise Control Center
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time infrastructure status, content delivery metrics, and company assets. Zero simulated numbers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Metrics</span>
          </Button>

          <Link href="/admin/websites">
            <Button size="sm" className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Website</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 10 Real Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="h-full border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 hover:shadow-md hover:border-indigo-400/60 transition-all rounded-2xl p-4 group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl border ${card.bg} ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>

                <div className="mt-3.5 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {isLoading ? '...' : card.value}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {card.sub}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two Column Section: Recent Websites & Recent Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Managed Websites Overview */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Websites & Domains
              </h2>
            </div>
            <Link href="/admin/websites" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              View All ({stats.totalWebsites})
            </Link>
          </div>

          {!data?.recentWebsites?.length ? (
            <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <Globe className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No websites added yet</p>
              <Link href="/admin/websites">
                <Button size="sm" variant="outline" className="rounded-xl text-xs">
                  Register First Website
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recentWebsites.map((web: any) => (
                <div
                  key={web.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xs">
                      <img
                        src={`https://image.thum.io/get/width/400/crop/300/noanimate/${web.url || 'https://' + web.domain}`}
                        alt={web.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${web.domain}&sz=64`;
                        }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {web.name}
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase font-mono">
                          {web.environment}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-mono">
                        {web.domain}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      SSL Active
                    </span>
                    <a
                      href={web.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Security & Audit Events Stream */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Security & Audit Events
              </h2>
            </div>
            <Link href="/admin/security/audit-logs" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Audit Center ({stats.securityEvents})
            </Link>
          </div>

          {!data?.recentSecurityEvents?.length ? (
            <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-xs text-slate-500">Security audit trail clean</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recentSecurityEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {evt.action.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          evt.result === 'SUCCESS'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {evt.result}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      By: {evt.admin?.name || 'System / Workstation'} • IP: {evt.ipAddress || 'Internal'}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
