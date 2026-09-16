'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Eye,
  Activity,
  Send,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Share2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, postsRes, accountsRes, authRes] = await Promise.all([
        fetch(`/api/analytics?days=${timeframe}`),
        fetch('/api/posts?limit=5'),
        fetch('/api/social-accounts'),
        fetch('/api/auth/me'),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setData(aData.analytics);
      }
      if (postsRes.ok) {
        const pData = await postsRes.json();
        setRecentPosts(pData.posts || []);
      }
      if (accountsRes.ok) {
        const accData = await accountsRes.json();
        setAccounts(accData.accounts || []);
      }
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setCurrentUser(authData.user);
        if (authData.workspace) setCurrentWorkspace(authData.workspace);
      }
    } catch (err: any) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpis = data?.kpis;

  const kpiCards = [
    {
      title: 'Total Followers',
      value: kpis?.totalFollowers?.value ?? '0',
      change: kpis?.totalFollowers?.changePercent ?? 0,
      trend: kpis?.totalFollowers?.trend ?? 'neutral',
      period: kpis?.totalFollowers?.comparisonPeriod ?? 'vs prev 30 days',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-600/10 border-indigo-500/20',
    },
    {
      title: 'Avg. Engagement Rate',
      value: kpis?.engagementRate?.value ?? '0.0%',
      change: kpis?.engagementRate?.changePercent ?? 0,
      trend: kpis?.engagementRate?.trend ?? 'neutral',
      period: kpis?.engagementRate?.comparisonPeriod ?? 'vs prev 30 days',
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10 border-emerald-500/20',
    },
    {
      title: 'Total Reach',
      value: kpis?.totalReach?.value ?? '0',
      change: kpis?.totalReach?.changePercent ?? 0,
      trend: kpis?.totalReach?.trend ?? 'neutral',
      period: kpis?.totalReach?.comparisonPeriod ?? 'vs prev 30 days',
      icon: Eye,
      color: 'text-sky-400',
      bg: 'bg-sky-600/10 border-sky-500/20',
    },
    {
      title: 'Total Impressions',
      value: kpis?.totalImpressions?.value ?? '0',
      change: kpis?.totalImpressions?.changePercent ?? 0,
      trend: kpis?.totalImpressions?.trend ?? 'neutral',
      period: kpis?.totalImpressions?.comparisonPeriod ?? 'vs prev 30 days',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-600/10 border-purple-500/20',
    },
    {
      title: 'Published Posts',
      value: kpis?.publishedPosts?.value ?? 0,
      change: kpis?.publishedPosts?.changePercent ?? 0,
      trend: kpis?.publishedPosts?.trend ?? 'neutral',
      period: kpis?.publishedPosts?.comparisonPeriod ?? 'vs prev 30 days',
      icon: Send,
      color: 'text-pink-400',
      bg: 'bg-pink-600/10 border-pink-500/20',
    },
    {
      title: 'Scheduled Queue',
      value: kpis?.scheduledPosts?.value ?? 0,
      change: 0,
      trend: 'neutral',
      period: 'Active pending queue',
      icon: Calendar,
      color: 'text-amber-400',
      bg: 'bg-amber-600/10 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex flex-wrap items-center gap-2.5">
            <span>Welcome back, {currentUser?.name || 'Creator'}!</span>
            <span className="text-amber-500">👋</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {currentWorkspace?.name ? `${currentWorkspace.name} • Active Multi-Network Telemetry` : 'Executive Growth Workspace • Active Sync'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm dark:shadow-none cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Link href="/content/create">
            <Button size="sm" className="flex items-center gap-1.5 shadow-md shadow-indigo-600/20">
              <Plus className="h-4 w-4" />
              <span>Create Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State Banner if 0 connected accounts */}
      {!isLoading && accounts.length === 0 && (
        <div className="p-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No social accounts connected yet</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Connect your LinkedIn, Instagram, X (Twitter), or Facebook accounts to start publishing and collecting analytics.
              </p>
            </div>
          </div>
          <Link href="/social-accounts">
            <Button className="shrink-0">
              Connect Channels <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none relative overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">{card.title}</span>
                <div className={`p-1.5 rounded-lg border ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                  {card.trend === 'up' && (
                    <span className="flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +{card.change}%
                    </span>
                  )}
                  {card.trend === 'down' && (
                    <span className="flex items-center font-semibold text-red-600 dark:text-red-400">
                      <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" /> -{card.change}%
                    </span>
                  )}
                  {card.trend === 'neutral' && (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">—</span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400 truncate">{card.period}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audience Reach & Impressions Chart */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Audience Reach & Impressions
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">({timeframe}d curve)</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aggregated daily impression and unique audience reach distribution.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Impressions
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-sky-400" /> Reach
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {data?.timeSeries?.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorImpressions)"
                    />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReach)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <BarChart3 className="h-10 w-10 mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">No snapshot analytics recorded</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Once connected accounts start generating impressions, historical curves will graph here automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Channels & Platform Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Channel Distribution</span>
              <Link href="/social-accounts" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-normal">
                Manage
              </Link>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Live followers and engagement rate per network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {accounts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No accounts currently active.
              </div>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${acc.accountHandle}`}
                      alt={acc.accountName}
                      className="h-9 w-9 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{acc.accountName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{acc.accountHandle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={acc.status === 'CONNECTED' ? 'success' : 'destructive'} className="text-[10px]">
                      {acc.platform}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Recent Content Dispatches</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Latest posts across all channels.</CardDescription>
            </div>
            <Link href="/content">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400">
                View All Posts
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No posts created yet.</div>
            ) : (
              recentPosts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          p.status === 'PUBLISHED'
                            ? 'success'
                            : p.status === 'SCHEDULED'
                            ? 'info'
                            : p.status === 'PENDING_APPROVAL'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {p.status}
                      </Badge>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.targets.map((t: any) => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono">
                          {t.platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 font-medium">
                    {p.title || p.globalContent}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Launch & Platform Status */}
        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Quick Production Shortcuts</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">High frequency agency actions.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link
              href="/content/create"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all flex flex-col justify-between group cursor-pointer shadow-sm dark:shadow-none"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Studio Composer</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Live previews & multi-network dispatch</p>
              </div>
            </Link>

            <Link
              href="/calendar"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-500/40 transition-all flex flex-col justify-between group cursor-pointer shadow-sm dark:shadow-none"
            >
              <div className="h-8 w-8 rounded-lg bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300">Content Calendar</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Schedule grid & drag-and-drop planning</p>
              </div>
            </Link>

            <Link
              href="/inbox"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between group cursor-pointer shadow-sm dark:shadow-none"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300">Unified Inbox</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Reply to comments & monitor mentions</p>
              </div>
            </Link>

            <Link
              href="/reports"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-500/40 transition-all flex flex-col justify-between group cursor-pointer shadow-sm dark:shadow-none"
            >
              <div className="h-8 w-8 rounded-lg bg-sky-600/10 dark:bg-sky-600/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300">Export Reports</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Generate CSV & analytics executive summaries</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
