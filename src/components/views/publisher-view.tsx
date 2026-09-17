'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Share2,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Hash,
  Smile,
  Layers,
  ChevronRight,
  ShieldCheck,
  Video,
  X,
  Play,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Globe,
  Radio,
  ExternalLink,
  Calendar,
  Users,
  Check,
  ArrowUpRight,
  Music2,
  Plus,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';

const PLATFORMS_CONFIG: Record<string, { name: string; limit: number; color: string; maxImages: number; supportsVideo: boolean; requiresMedia: boolean }> = {
  LINKEDIN: { name: 'LinkedIn', limit: 3000, color: '#0A66C2', maxImages: 9, supportsVideo: true, requiresMedia: false },
  TWITTER: { name: 'X (Twitter)', limit: 280, color: '#000000', maxImages: 4, supportsVideo: true, requiresMedia: false },
  INSTAGRAM: { name: 'Instagram', limit: 2200, color: '#E4405F', maxImages: 10, supportsVideo: true, requiresMedia: true },
  FACEBOOK: { name: 'Facebook', limit: 63206, color: '#1877F2', maxImages: 10, supportsVideo: true, requiresMedia: false },
  THREADS: { name: 'Threads', limit: 500, color: '#000000', maxImages: 10, supportsVideo: true, requiresMedia: false },
  TIKTOK: { name: 'TikTok', limit: 2200, color: '#000000', maxImages: 35, supportsVideo: true, requiresMedia: true },
  YOUTUBE: { name: 'YouTube', limit: 5000, color: '#FF0000', maxImages: 1, supportsVideo: true, requiresMedia: true },
  PINTEREST: { name: 'Pinterest', limit: 500, color: '#E60023', maxImages: 5, supportsVideo: true, requiresMedia: true },
};

export default function PublisherView() {
  const router = useRouter();
  const { showToast } = useToast();

  // Connected accounts loaded from real database (Zero fake fleet identities)
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Selected destination accounts / platforms
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<string>('LINKEDIN');

  // Form states
  const [title, setTitle] = useState('');
  const [globalContent, setGlobalContent] = useState('');
  const [customOverrides, setCustomOverrides] = useState<Record<string, string>>({});
  const [activeOverrideTab, setActiveOverrideTab] = useState<string>('GLOBAL');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Publishing & scheduling states
  const [campaignId, setCampaignId] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Set default tomorrow date for scheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);

    // Fetch real connected accounts
    setIsLoadingAccounts(true);
    fetch('/api/admin/social-accounts')
      .then((res) => res.json())
      .then((data) => {
        const accs = data.accounts || [];
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id);
          setSelectedAccountIds([accs[0].id]);
          setActivePreviewPlatform(accs[0].platform.toUpperCase());
        }
      })
      .catch(() => {
        showToast('Failed to load connected social accounts', 'error');
      })
      .finally(() => {
        setIsLoadingAccounts(false);
      });

    // Fetch campaigns
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(() => {});
  }, []);

  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const toggleAccountSelection = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    if (!acc) return;

    if (selectedAccountIds.includes(accId)) {
      if (selectedAccountIds.length === 1) {
        showToast('At least one social account must be selected', 'warning');
        return;
      }
      const updated = selectedAccountIds.filter((id) => id !== accId);
      setSelectedAccountIds(updated);
      const remainingAcc = accounts.find((a) => a.id === updated[0]);
      if (remainingAcc) {
        setActivePreviewPlatform(remainingAcc.platform.toUpperCase());
      }
    } else {
      setSelectedAccountIds([...selectedAccountIds, accId]);
      setActivePreviewPlatform(acc.platform.toUpperCase());
    }
  };

  const handleSelectAll = () => {
    if (selectedAccountIds.length === accounts.length) {
      if (accounts.length > 0) setSelectedAccountIds([accounts[0].id]);
    } else {
      setSelectedAccountIds(accounts.map((a) => a.id));
    }
  };

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) return;
    try {
      new URL(newMediaUrl.trim());
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl('');
      showToast('Media asset attached successfully', 'success');
    } catch {
      showToast('Please enter a valid HTTP/HTTPS media URL', 'error');
    }
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
  };

  const activePlatformConfig = PLATFORMS_CONFIG[activePreviewPlatform] || {
    name: activePreviewPlatform,
    limit: 2200,
    color: '#6366F1',
    maxImages: 4,
    supportsVideo: true,
    requiresMedia: false,
  };

  const charLimit = activePlatformConfig.limit;
  const previewContent = customOverrides[activePreviewPlatform] || globalContent;
  const isOverLimit = previewContent.length > charLimit;
  const isMissingRequiredMedia = activePlatformConfig.requiresMedia && mediaUrls.length === 0;

  const handleSubmit = async (publishNow = false) => {
    if (!globalContent.trim()) {
      showToast('Caption / content cannot be empty', 'error');
      return;
    }
    if (selectedAccountIds.length === 0) {
      showToast('Select at least one destination social account', 'error');
      return;
    }

    if (isOverLimit) {
      showToast(`Content exceeds character limit for ${activePlatformConfig.name}`, 'error');
      return;
    }

    const selectedAccountObjects = accounts.filter((a) => selectedAccountIds.includes(a.id));
    const requiresMediaTarget = selectedAccountObjects.find(
      (a) => PLATFORMS_CONFIG[a.platform.toUpperCase()]?.requiresMedia
    );
    if (requiresMediaTarget && mediaUrls.length === 0) {
      showToast(`${requiresMediaTarget.platform} requires an image or video for posting. Please attach media below.`, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      let scheduledAtISO: string | null = null;
      if (isScheduled && scheduledDate && scheduledTime) {
        scheduledAtISO = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }

      const payload = {
        title: title.trim() || undefined,
        globalContent,
        mediaUrls,
        scheduledAt: isScheduled ? scheduledAtISO : undefined,
        timezone,
        publishNow,
        targets: selectedAccountObjects.map((acc) => ({
          platform: acc.platform.toUpperCase(),
          socialAccountId: acc.id,
          customContent: customOverrides[acc.platform.toUpperCase()] || undefined,
        })),
      };

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          publishNow
            ? 'Post dispatched and published live!'
            : isScheduled
            ? 'Post scheduled in editorial queue!'
            : 'Draft post saved successfully!',
          'success'
        );
        router.push('/admin/social/posts');
      } else {
        showToast(data.error || 'Failed to submit post', 'error');
      }
    } catch {
      showToast('Network exception while submitting post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAccounts) {
    return (
      <div className="py-16 text-center space-y-3 animate-pulse">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
        <p className="text-xs text-slate-500">Loading authorized channels...</p>
      </div>
    );
  }

  // Section 8 & 32: If zero accounts connected, display honest call to action
  if (accounts.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4 text-center">
        <Card className="p-8 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Share2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Connected Social Channels Found</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SocialFlow requires at least one connected social account to compose and dispatch multi-platform posts.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/admin/social/accounts">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                <span>Connect Social Accounts</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Omnichannel Publisher
            </Badge>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Direct Platform Validation Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Multi-Platform Post Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Compose once, validate platform capability constraints, and schedule to verified channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            isLoading={isSubmitting}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold"
          >
            Save Draft
          </Button>

          <Button
            size="sm"
            onClick={() => handleSubmit(true)}
            isLoading={isSubmitting}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold gap-1.5 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish Now</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Composer Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target Social Accounts Selector */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Select Target Channels</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {selectedAccountIds.length} of {accounts.length} Selected
                </Badge>
              </label>

              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {selectedAccountIds.length === accounts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {accounts.map((acc) => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggleAccountSelection(acc.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <SocialPlatformIcon platform={acc.platform.toLowerCase()} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{acc.accountName}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{acc.accountHandle}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Post Title & Content Composer */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Internal Post Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Product Launch Announcement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Global Caption & Text
                </label>
                <span className={`text-[11px] font-mono font-bold ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                  {previewContent.length} / {charLimit} chars ({activePlatformConfig.name})
                </span>
              </div>

              <textarea
                rows={5}
                required
                value={globalContent}
                onChange={(e) => setGlobalContent(e.target.value)}
                placeholder="Write your update here... Include key highlights, links, and hashtags."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
              />
            </div>

            {/* Media Attachment Vault */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Media Assets ({mediaUrls.length})</span>
                </label>
                {isMissingRequiredMedia && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    * {activePlatformConfig.name} requires media
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="Paste direct HTTPS image or video URL..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedia}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach</span>
                </Button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    const sampleImages = [
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
                    ];
                    const chosen = sampleImages[mediaUrls.length % sampleImages.length];
                    setMediaUrls([...mediaUrls, chosen]);
                    showToast('High-resolution 4K image attached', 'success');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  📸 Add 4K Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                    if (!mediaUrls.includes(videoUrl)) {
                      setMediaUrls([...mediaUrls, videoUrl]);
                      showToast('HD video asset attached', 'success');
                    }
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                >
                  🎬 Add HD Video
                </button>
              </div>

              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video">
                      <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(i)}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition-colors"
                        title="Remove media"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Real Scheduling Toggle & Date/Time Picker */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Schedule Dispatch</p>
                    <p className="text-[11px] text-slate-500">Pick specific publication date, time, and timezone</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  id="schedule-toggle"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              {isScheduled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Timezone</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Platform Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 shadow-2xs space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <SocialPlatformIcon platform={activePreviewPlatform.toLowerCase()} size="sm" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {activePlatformConfig.name} Feed Preview
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                Official REST
              </Badge>
            </div>

            {/* Preview Post Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
              {/* Profile Header */}
              <div className="flex items-center gap-2.5">
                <img
                  src={currentAccount?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentAccount?.accountHandle || 'preview'}`}
                  alt="Avatar"
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentAccount?.accountName || 'SocialFlow Channel'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {currentAccount?.accountHandle || '@channel'}
                  </p>
                </div>
              </div>

              {/* Caption Content */}
              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {previewContent || 'Your post caption will be previewed here in real-time...'}
              </p>

              {/* Media Preview */}
              {mediaUrls.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-black/40">
                  <img src={mediaUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Simulated Feed Action Footer */}
              <div className="flex items-center justify-between text-slate-400 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Like</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Comment</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </div>
              </div>
            </div>

            {/* Platform Constraints Summary */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Character Limit:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {charLimit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Media Assets:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activePlatformConfig.maxImages}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Requires Media:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activePlatformConfig.requiresMedia ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
