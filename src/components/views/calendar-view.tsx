'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Share2,
  Filter,
  Eye,
  CheckCircle2,
  Send,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
  Flame,
  Globe,
  Image as ImageIcon,
  ExternalLink,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Radio,
  BarChart3,
  Tag,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

// Helper to determine real client brand and Google Favicon ("geecon")
export function getPostBrandMeta(post: any) {
  const text = `${post.title || ''} ${post.globalContent || ''} ${post.campaign?.name || ''}`.toLowerCase();
  
  if (text.includes('foto trendz') || text.includes('fototrendz') || text.includes('portrait') || text.includes('studio showcase') || text.includes('pet studio') || text.includes('newborn')) {
    return {
      name: 'Foto Trendz',
      domain: 'fototrendz.vercel.app',
      handle: '@fototrendz_official',
      color: '#ec4899',
      bgColor: 'bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300',
      badgeClass: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/60',
      category: 'Creative Photography Studio',
    };
  }
  if (text.includes('tuvaa') || text.includes('bbam') || text.includes('wellbeing') || text.includes('mentorship')) {
    return {
      name: 'TUVAA Non-Profit',
      domain: 'tuvaa1.vercel.app',
      handle: '@tuvaa_foundation',
      color: '#10b981',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      category: 'Culture & Youth Mentorship',
    };
  }
  if (text.includes('aerox') || text.includes('digital experience')) {
    return {
      name: 'AERØX OG',
      domain: 'aerox1.vercel.app',
      handle: '@aerox_agency',
      color: '#8b5cf6',
      bgColor: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300',
      badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      category: 'Digital Experience Agency',
    };
  }
  if (text.includes('tillu') || text.includes('direct commerce') || text.includes('commerce')) {
    return {
      name: 'Tillu Direct Commerce',
      domain: 'tillu.co.uk',
      handle: '@tillu_commerce',
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      category: 'Direct Commerce & Retail',
    };
  }
  if (text.includes('pdf') || text.includes('ilovepdf')) {
    return {
      name: 'Love PDF',
      domain: 'www.ilovepdf.com',
      handle: '@ilovepdf_tools',
      color: '#ef4444',
      bgColor: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
      badgeClass: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
      category: 'Document & PDF Suite',
    };
  }
  if (text.includes('workcomposer') || text.includes('productivity')) {
    return {
      name: 'WorkComposer',
      domain: 'www.workcomposer.com',
      handle: '@workcomposer_hq',
      color: '#06b6d4',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
      badgeClass: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
      category: 'Enterprise Productivity',
    };
  }

  // Default to SocialFlow Official
  return {
    name: 'SocialFlow Global',
    domain: 'socialflow.io',
    handle: '@socialflow_hq',
    color: '#6366f1',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    category: 'Omnichannel Publishing Suite',
  };
}

export default function CalendarView() {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 12)); // Default to Sept 12, 2026
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY' | 'LIST'>('MONTH');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Interactive Quick View / Quick Schedule modal state
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<string>('LINKEDIN');
  const [quickScheduleDate, setQuickScheduleDate] = useState<Date | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickBrandDomain, setQuickBrandDomain] = useState('fototrendz.vercel.app');
  const [quickTime, setQuickTime] = useState('10:00');
  const [quickPlatforms, setQuickPlatforms] = useState<string[]>(['LINKEDIN', 'INSTAGRAM', 'TWITTER']);
  const [isSubmittingQuickPost, setIsSubmittingQuickPost] = useState(false);

  const fetchCalendarPosts = async () => {
    setIsLoading(true);
    try {
      let start: string;
      let end: string;

      if (viewMode === 'MONTH') {
        start = startOfWeek(startOfMonth(currentDate)).toISOString();
        end = endOfWeek(endOfMonth(currentDate)).toISOString();
      } else if (viewMode === 'WEEK') {
        start = startOfWeek(currentDate).toISOString();
        end = endOfWeek(currentDate).toISOString();
      } else if (viewMode === 'DAY') {
        const dStart = new Date(currentDate);
        dStart.setHours(0, 0, 0, 0);
        const dEnd = new Date(currentDate);
        dEnd.setHours(23, 59, 59, 999);
        start = dStart.toISOString();
        end = dEnd.toISOString();
      } else {
        start = subMonths(currentDate, 2).toISOString();
        end = addMonths(currentDate, 2).toISOString();
      }

      const res = await fetch(`/api/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      showToast('Failed to load calendar events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarPosts();
  }, [currentDate, viewMode]);

  // Date intervals
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate),
  });

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
      
      if (selectedPlatform !== 'ALL') {
        const hasPlat = p.targets?.some((t: any) => t.platform?.toLowerCase() === selectedPlatform.toLowerCase());
        if (!hasPlat) return false;
      }

      if (selectedBrand !== 'ALL') {
        const brand = getPostBrandMeta(p);
        if (brand.domain !== selectedBrand) return false;
      }

      return true;
    });
  }, [posts, selectedStatus, selectedPlatform, selectedBrand]);

  const getPostsForDay = (day: Date) => {
    return filteredPosts.filter((p) => {
      const targetDate = p.scheduledAt ? new Date(p.scheduledAt) : p.publishedAt ? new Date(p.publishedAt) : null;
      return targetDate ? isSameDay(targetDate, day) : false;
    });
  };

  const handleNavigate = (direction: 'PREV' | 'NEXT') => {
    if (viewMode === 'MONTH') {
      setCurrentDate(direction === 'PREV' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'WEEK') {
      setCurrentDate(direction === 'PREV' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else if (viewMode === 'DAY') {
      setCurrentDate(direction === 'PREV' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    } else {
      setCurrentDate(direction === 'PREV' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };

  const handleQuickCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickContent.trim() || !quickScheduleDate) return;

    setIsSubmittingQuickPost(true);
    try {
      const [hours, minutes] = quickTime.split(':').map(Number);
      const scheduledDateTime = new Date(quickScheduleDate);
      scheduledDateTime.setHours(hours || 10, minutes || 0, 0, 0);

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle,
          globalContent: quickContent,
          scheduledAt: scheduledDateTime.toISOString(),
          status: 'SCHEDULED',
          platforms: quickPlatforms,
        }),
      });

      if (res.ok) {
        showToast('Post scheduled successfully on calendar!', 'success');
        setQuickScheduleDate(null);
        setQuickTitle('');
        setQuickContent('');
        fetchCalendarPosts();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to schedule post', 'error');
      }
    } catch {
      showToast('Network error scheduling post', 'error');
    } finally {
      setIsSubmittingQuickPost(false);
    }
  };

  // KPIs
  const scheduledCount = posts.filter((p) => p.status === 'SCHEDULED').length;
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const activeFleetBrands = [
    { name: 'Foto Trendz', domain: 'fototrendz.vercel.app' },
    { name: 'TUVAA', domain: 'tuvaa1.vercel.app' },
    { name: 'SocialFlow', domain: 'socialflow.io' },
    { name: 'AERØX OG', domain: 'aerox1.vercel.app' },
    { name: 'Tillu', domain: 'tillu.co.uk' },
    { name: 'Love PDF', domain: 'www.ilovepdf.com' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-3 h-3" />
              Interactive Multi-Channel Scheduler
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Queue Status
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Publishing Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visual publication matrix with drag schedules, multi-network previews, and live queue status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs shadow-xs">
            {(['MONTH', 'WEEK', 'DAY', 'LIST'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode === 'MONTH' ? 'Month' : mode === 'WEEK' ? 'Week' : mode === 'DAY' ? 'Day' : 'List'}
              </button>
            ))}
          </div>

          <Link href="/content/create">
            <Button size="sm" className="flex items-center gap-1.5 shadow-md shadow-indigo-600/20 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>Compose Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Queue</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{scheduledCount}</span>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Upcoming Posts</span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Published Live</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{publishedCount}</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Published This Month</span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Targets</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">14</span>
            <span className="text-[10px] font-semibold text-slate-500">Supported Networks</span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Connected Fleets</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {activeFleetBrands.slice(0, 5).map((b) => (
              <img
                key={b.domain}
                src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`}
                alt={b.name}
                title={b.name}
                className="w-5 h-5 rounded-md object-contain border border-slate-200 dark:border-slate-700 bg-white p-0.5 shadow-2xs"
              />
            ))}
            <span className="text-[10px] font-bold text-slate-500">+{activeFleetBrands.length - 5}</span>
          </div>
        </Card>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white min-w-[180px]">
            {viewMode === 'DAY'
              ? format(currentDate, 'EEEE, MMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleNavigate('PREV')}
              aria-label="Previous date"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 8, 12))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigate('NEXT')}
              aria-label="Next date"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Multi-Filters: Brand Favicon, Platform & Status */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Brand Fleets</option>
              {activeFleetBrands.map((b) => (
                <option key={b.domain} value={b.domain}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Network Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Networks</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">X / Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="threads">Threads</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="pinterest">Pinterest</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs rounded-2xl">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 py-3">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-950/40">
            {monthDays.map((day, idx) => {
              const dayPosts = getPostsForDay(day);
              const inMonth = isSameMonth(day, monthStart);
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  onClick={() => setQuickScheduleDate(day)}
                  className={`min-h-[145px] p-2.5 flex flex-col justify-between transition-colors group cursor-pointer relative ${
                    !inMonth
                      ? 'opacity-35 bg-slate-50/50 dark:bg-slate-950/60'
                      : 'hover:bg-indigo-50/40 dark:hover:bg-slate-900/70'
                  }`}
                >
                  {/* Top Cell Header: Date Number & Add Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-black h-6 w-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                          today
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-700'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {today && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          Today
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickScheduleDate(day);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1.5 my-2 overflow-y-auto max-h-28 pr-0.5">
                    {dayPosts.map((p) => {
                      const brand = getPostBrandMeta(p);
                      const isPublished = p.status === 'PUBLISHED';
                      let mediaCount = 0;
                      try {
                        if (p.mediaUrlsJson) {
                          const m = JSON.parse(p.mediaUrlsJson);
                          mediaCount = Array.isArray(m) ? m.length : 0;
                        }
                      } catch {}

                      return (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(p);
                          }}
                          className={`p-1.5 rounded-xl text-[11px] font-medium border transition-all hover:scale-[1.02] shadow-2xs cursor-pointer flex flex-col gap-1 ${
                            isPublished
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                              : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-950 dark:text-indigo-200'
                          }`}
                        >
                          {/* Brand Favicon ("geecon") + Platform Icon + Time */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                                alt={brand.name}
                                title={brand.name}
                                className="w-3.5 h-3.5 rounded object-contain shrink-0 bg-white p-0.2 border border-slate-200 dark:border-slate-700 shadow-2xs"
                              />
                              <span className="text-[10px] font-bold truncate text-slate-800 dark:text-slate-200">
                                {brand.name.split(' ')[0]}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {mediaCount > 0 && (
                                <ImageIcon className="w-2.5 h-2.5 text-slate-400" />
                              )}
                              <span className="text-[9px] font-mono opacity-70">
                                {p.scheduledAt
                                  ? format(new Date(p.scheduledAt), 'HH:mm')
                                  : isPublished
                                  ? 'Done'
                                  : 'Draft'}
                              </span>
                              <SocialPlatformIcon
                                platform={p.targets?.[0]?.platform || 'social'}
                                size="xs"
                                variant="brand"
                              />
                            </div>
                          </div>

                          {/* Post Title */}
                          <p className="text-[10.5px] font-semibold truncate leading-tight">
                            {p.title || p.globalContent}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Counter Indicator */}
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                    {dayPosts.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9.5px]">
                        {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'WEEK' && (
        <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs rounded-2xl">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-center text-xs font-bold text-slate-600 dark:text-slate-400 py-3">
            {weekDays.map((day, idx) => (
              <div key={idx} className={isToday(day) ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}>
                {format(day, 'EEE d')}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-950/40 min-h-[440px]">
            {weekDays.map((day, idx) => {
              const dayPosts = getPostsForDay(day);
              return (
                <div
                  key={idx}
                  onClick={() => setQuickScheduleDate(day)}
                  className="p-3 flex flex-col gap-2.5 hover:bg-indigo-50/40 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-extrabold text-slate-900 dark:text-white">{format(day, 'MMM d')}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                      + Schedule
                    </span>
                  </div>

                  <div className="space-y-2 overflow-y-auto">
                    {dayPosts.map((p) => {
                      const brand = getPostBrandMeta(p);
                      const isPublished = p.status === 'PUBLISHED';
                      return (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(p);
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-1.5 transition-all hover:scale-[1.02] shadow-2xs cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                                alt={brand.name}
                                className="w-4 h-4 rounded object-contain"
                              />
                              <span className="text-[11px] font-bold">{brand.name}</span>
                            </div>
                            <Badge
                              variant={isPublished ? 'success' : 'info'}
                              className="text-[9px] font-mono uppercase"
                            >
                              {p.status}
                            </Badge>
                          </div>

                          <p className="text-xs font-bold truncate">{p.title || 'Untitled Post'}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {p.globalContent}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.scheduledAt ? format(new Date(p.scheduledAt), 'HH:mm') : 'Immediate'}
                            </span>
                            <div className="flex items-center gap-1">
                              {p.targets?.map((t: any) => (
                                <SocialPlatformIcon key={t.id || t.platform} platform={t.platform} size="xs" />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* DAY VIEW */}
      {viewMode === 'DAY' && (
        <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getPostsForDay(currentDate).length} posts scheduled for this day
              </p>
            </div>
            <Button size="sm" onClick={() => setQuickScheduleDate(currentDate)} className="gap-1.5 rounded-xl">
              <Plus className="w-4 h-4" />
              <span>Schedule on This Day</span>
            </Button>
          </div>

          <div className="space-y-3">
            {getPostsForDay(currentDate).length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No scheduled posts for this date.</p>
                <Button variant="outline" size="sm" onClick={() => setQuickScheduleDate(currentDate)}>
                  Add First Post for Today
                </Button>
              </div>
            ) : (
              getPostsForDay(currentDate).map((p) => {
                const brand = getPostBrandMeta(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPost(p)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between gap-4 hover:border-indigo-400 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                          alt={brand.name}
                          className="w-4 h-4 rounded object-contain"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{brand.name}</span>
                        <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'info'} className="text-[10px]">
                          {p.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {p.scheduledAt
                            ? format(new Date(p.scheduledAt), 'h:mm a')
                            : 'Immediate'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{p.title || p.globalContent}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.globalContent}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.targets?.map((t: any) => (
                        <SocialPlatformIcon key={t.id || t.platform} platform={t.platform} size="sm" />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* LIST VIEW */}
      {viewMode === 'LIST' && (
        <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 space-y-3 shadow-xs rounded-2xl">
          {filteredPosts.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-500">
              No scheduled posts matching filter criteria.
            </p>
          ) : (
            filteredPosts.map((p) => {
              const brand = getPostBrandMeta(p);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPost(p)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-4 hover:border-indigo-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                      alt={brand.name}
                      className="w-8 h-8 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white p-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{brand.name}</span>
                        <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'info'} className="text-[10px]">
                          {p.status}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : 'Immediate'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {p.title || p.globalContent}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.targets?.map((t: any) => (
                      <SocialPlatformIcon key={t.id || t.platform} platform={t.platform} size="xs" />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}

      {/* QUICK SCHEDULE MODAL */}
      {quickScheduleDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Schedule Post on {format(quickScheduleDate, 'MMMM d, yyyy')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickScheduleDate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCreatePost} className="space-y-4 pt-4">
              {/* Brand Fleet Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Brand Fleet
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {activeFleetBrands.map((b) => (
                    <button
                      key={b.domain}
                      type="button"
                      onClick={() => setQuickBrandDomain(b.domain)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        quickBrandDomain === b.domain
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`}
                        alt={b.name}
                        className="w-4 h-4 rounded object-contain"
                      />
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Post Headline / Campaign Topic
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="e.g. Q4 Growth Launch Announcement"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Post Copy & Captions
                </label>
                <textarea
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  placeholder="Draft your post content here... It will sync across target networks."
                  rows={4}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Channels
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'THREADS'].map((p) => {
                      const isSel = quickPlatforms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            if (isSel && quickPlatforms.length > 1) {
                              setQuickPlatforms(quickPlatforms.filter((x) => x !== p));
                            } else if (!isSel) {
                              setQuickPlatforms([...quickPlatforms, p]);
                            }
                          }}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                            isSel
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                              : 'border-slate-200 dark:border-slate-800 opacity-40'
                          }`}
                        >
                          <SocialPlatformIcon platform={p} size="xs" variant="brand" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickScheduleDate(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmittingQuickPost} className="gap-1.5 shadow-md shadow-indigo-600/20 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Schedule</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST INSPECT & LIVE PREVIEW MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              {(() => {
                const brand = getPostBrandMeta(selectedPost);
                return (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                      alt={brand.name}
                      className="w-7 h-7 rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white p-0.5 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{brand.name}</span>
                        <Badge variant={selectedPost.status === 'PUBLISHED' ? 'success' : 'info'} className="text-[10px]">
                          {selectedPost.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        https://{brand.domain} • {selectedPost.scheduledAt ? new Date(selectedPost.scheduledAt).toLocaleString() : 'Immediate'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Title & Headline */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedPost.title || 'Untitled Post'}
              </h3>
            </div>

            {/* Live Social Media Preview Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Social Media Card Preview
                </span>
                <div className="flex items-center gap-1">
                  {['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'THREADS'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setPreviewPlatform(plat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        previewPlatform === plat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <SocialPlatformIcon platform={plat} size="xs" variant="brand" />
                      <span>{plat.charAt(0) + plat.slice(1).toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Authentic Platform Mockup Card */}
              {(() => {
                const brand = getPostBrandMeta(selectedPost);
                let mediaUrls: string[] = [];
                try {
                  if (selectedPost.mediaUrlsJson) {
                    mediaUrls = JSON.parse(selectedPost.mediaUrlsJson);
                  }
                } catch {}

                return (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    {/* LinkedIn Preview */}
                    {previewPlatform === 'LINKEDIN' && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                            alt={brand.name}
                            className="w-10 h-10 rounded-full object-contain border border-slate-200 dark:border-slate-700 bg-white p-1"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-900 dark:text-white">{brand.name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <span className="text-[10px] text-slate-500">28,400 followers • Just now • 🌐</span>
                          </div>
                        </div>

                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {selectedPost.globalContent}
                        </p>

                        {mediaUrls.length > 0 && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                            <img src={mediaUrls[0]} alt="Media" className="w-full h-52 object-cover" />
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-slate-500 text-xs">
                          <span>👍 Like</span>
                          <span>💬 Comment</span>
                          <span>🔁 Repost</span>
                          <span>🚀 Send</span>
                        </div>
                      </div>
                    )}

                    {/* Twitter / X Preview */}
                    {previewPlatform === 'TWITTER' && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black p-4 space-y-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                            alt={brand.name}
                            className="w-9 h-9 rounded-full object-contain border border-slate-200 dark:border-slate-800 bg-white p-1"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{brand.name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-slate-500 font-mono">{brand.handle} • now</span>
                            </div>

                            <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                              {selectedPost.globalContent}
                            </p>

                            {mediaUrls.length > 0 && (
                              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mt-2">
                                <img src={mediaUrls[0]} alt="Media" className="w-full h-48 object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Instagram Preview */}
                    {previewPlatform === 'INSTAGRAM' && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                        <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                              alt={brand.name}
                              className="w-7 h-7 rounded-full object-contain border border-slate-200 bg-white p-0.5"
                            />
                            <span className="font-bold text-slate-900 dark:text-white font-mono">{brand.handle}</span>
                          </div>
                        </div>

                        {mediaUrls.length > 0 && (
                          <div className="h-56 overflow-hidden bg-black">
                            <img src={mediaUrls[0]} alt="Media" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="p-3 space-y-1.5">
                          <p className="text-slate-800 dark:text-slate-200">
                            <b className="font-mono mr-1.5 text-slate-900 dark:text-white">{brand.handle}</b>
                            {selectedPost.globalContent}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Threads Preview */}
                    {previewPlatform === 'THREADS' && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                            alt={brand.name}
                            className="w-8 h-8 rounded-full object-contain border border-slate-200 bg-white p-0.5"
                          />
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{brand.handle}</span>
                          <span className="text-slate-400">now</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {selectedPost.globalContent}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Target Channels Details */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Target Distribution Channels ({selectedPost.targets?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPost.targets?.map((t: any) => (
                  <div
                    key={t.id || t.platform}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <SocialPlatformIcon platform={t.platform} size="sm" variant="brand" />
                    <span className="capitalize">{t.platform}</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      • {t.publishStatus || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
                Close Preview
              </Button>

              <div className="flex items-center gap-2">
                <Link href="/content/create">
                  <Button size="sm" className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open in Studio Composer</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
