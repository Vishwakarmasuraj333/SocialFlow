'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Share2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function ReportsPage() {
  const { showToast } = useToast();
  const [days, setDays] = useState('30');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?days=${days}&format=json`);
      if (res.ok) {
        const json = await res.json();
        setReportData(json);
      }
    } catch {
      showToast('Failed to generate report', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [days]);

  const handleDownloadCSV = () => {
    window.open(`/api/reports?days=${days}&format=csv`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Executive Performance Reports
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automated multi-channel summaries formatted for agency stakeholders and executive review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none shadow-sm dark:shadow-none cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <Button onClick={handleDownloadCSV} className="flex items-center gap-1.5 shadow-md shadow-indigo-600/20">
            <Download className="h-4 w-4" /> Export CSV Data
          </Button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-6 shadow-sm dark:shadow-none">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {reportData?.meta?.workspaceName || 'Workspace'} Executive Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generated: {new Date().toLocaleDateString()} • Timeframe: {days} Days
            </p>
          </div>
          <Badge variant="success">Verified Database Records</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Followers</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {reportData?.summary?.totalFollowers?.value || '0'}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Reach</span>
            <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
              {reportData?.summary?.totalReach?.value || '0'}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Impressions</span>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {reportData?.summary?.totalImpressions?.value || '0'}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
            <span className="text-xs text-slate-500 dark:text-slate-400">Avg. Engagement</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {reportData?.summary?.engagementRate?.value || '0%'}
            </p>
          </div>
        </div>

        {/* Top Published Content */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Top Content Dispatches ({days}d)
          </h3>

          <div className="space-y-2">
            {reportData?.topPosts?.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <Share2 className="h-6 w-6 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No published dispatches in this timeframe</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Create and schedule live content from the Publisher to track multi-channel impressions, engagement, and reach metrics.
                </p>
              </div>
            ) : (
              reportData?.topPosts?.map((post: any) => (
                <div
                  key={post.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{post.title || post.globalContent}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Author: {post.author.name} • {new Date(post.publishedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {post.targets?.map((t: any) => (
                      <span key={t.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono">
                        {t.platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
