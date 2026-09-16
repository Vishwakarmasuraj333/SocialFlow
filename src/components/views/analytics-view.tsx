'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Eye,
  Activity,
  Calendar,
  Share2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsView() {
  const { showToast } = useToast();
  const [days, setDays] = useState('30');
  const [platform, setPlatform] = useState('ALL');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}&platform=${platform}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.analytics);
      }
    } catch {
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, platform]);

  const handleExportCSV = () => {
    window.open(`/api/reports?days=${days}&platform=${platform}&format=csv`, '_blank');
  };

  const kpis = data?.kpis;
  const hasTimeSeriesData = data?.timeSeries && data.timeSeries.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Advanced Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Aggregated cross-platform intelligence, reach trajectories, and database-verified benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none shadow-sm dark:shadow-none cursor-pointer"
          >
            <option value="7">Past 7 Days</option>
            <option value="30">Past 30 Days</option>
            <option value="90">Past 90 Days</option>
          </select>

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none shadow-sm dark:shadow-none cursor-pointer"
          >
            <option value="ALL">All Platforms</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TWITTER">X (Twitter)</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="TIKTOK">TikTok</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="YOUTUBE">YouTube</option>
          </select>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-xl text-xs">
            <Download className="h-3.5 w-3.5" /> CSV Export
          </Button>
        </div>
      </div>

      {/* KPI Cards (Section 6 & 21: Real delta or Growth data unavailable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Audience</span>
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {isLoading ? '...' : kpis?.totalFollowers?.value || '0'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {kpis?.totalFollowers?.changePercent !== null && kpis?.totalFollowers?.changePercent !== undefined
              ? `${kpis.totalFollowers.trend === 'up' ? '+' : '-'}${kpis.totalFollowers.changePercent}% growth`
              : 'Growth data unavailable'}
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Avg. Engagement</span>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {isLoading ? '...' : kpis?.engagementRate?.value || '0.0%'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across live database posts</p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Unique Reach</span>
            <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {isLoading ? '...' : kpis?.totalReach?.value || '0'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {kpis?.totalReach?.changePercent !== null && kpis?.totalReach?.changePercent !== undefined
              ? `+${kpis.totalReach.changePercent}% period-over-period`
              : 'Growth data unavailable'}
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Impressions</span>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {isLoading ? '...' : kpis?.totalImpressions?.value || '0'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total visual exposures</p>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Followers Growth Curve */}
        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm dark:shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Audience Growth Trajectory</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Net follower growth over {days} days from official API syncs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="h-64 w-full flex items-center justify-center">
              {hasTimeSeriesData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Line type="monotone" dataKey="followers" stroke="#6366f1" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center space-y-1">
                  <BarChart3 className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Growth data unavailable</p>
                  <p className="text-[11px] text-slate-400">Sync connected accounts to start plotting trajectory.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate Distribution */}
        <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm dark:shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Engagement Rate Index (%)</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Daily interaction ratio per exposure.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="h-64 w-full flex items-center justify-center">
              {hasTimeSeriesData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="engagement" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center space-y-1">
                  <Activity className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">No engagement records</p>
                  <p className="text-[11px] text-slate-400">Publish posts to generate live interaction telemetry.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown & Channel Comparison */}
      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm dark:shadow-none">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Channel Distribution & Network Benchmarks</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Real subscriber distribution and interaction health per connected channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          {!data?.platformBreakdown || data.platformBreakdown.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <Share2 className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">No active channel distribution</p>
              <p className="text-[11px] text-slate-400">Connect social channels to view network breakdown.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.platformBreakdown.map((pb: any, idx: number) => (
                <div
                  key={`${pb.platform}-${idx}`}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{pb.platform}</span>
                      {pb.accountsCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-500 font-mono">
                          {pb.accountsCount} {pb.accountsCount === 1 ? 'ch' : 'chs'}
                        </span>
                      )}
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: pb.color }} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Total Audience:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {pb.followers > 0 ? pb.followers.toLocaleString() : 'No data available'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Avg. Engagement:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{pb.engagementRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
