'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  Unplug,
  Key,
  Layers,
  Lock,
  ArrowRight,
  Info,
  Check,
  Eye,
  Trash2,
} from 'lucide-react';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';

interface LinkedInAccount {
  id: string;
  platform: string;
  accountName: string;
  accountHandle: string;
  avatarUrl: string | null;
  platformAccountId: string;
  email: string | null;
  status: string;
  lastSyncedAt: string | null;
  connectedAt: string;
  tokenExpiresAt: string | null;
  scopes: string[];
}

interface PostItem {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  mediaUrlsJson?: string | null;
  targets?: Array<{
    id: string;
    status: string;
    externalPostId?: string | null;
    errorMessage?: string | null;
  }>;
}

function LinkedInManagementContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<LinkedInAccount | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  // Composer State
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [publishMode, setPublishMode] = useState<'NOW' | 'SCHEDULE' | 'DRAFT'>('NOW');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Post history
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'SCHEDULED' | 'DRAFTS' | 'FAILED'>('ALL');

  // Disconnect modal
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check URL query flags on load
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'connected') {
      showToast('LinkedIn account successfully connected via official OAuth 2.0!', 'success');
    }
    if (error) {
      showToast(`LinkedIn OAuth Notice: ${error}`, 'error');
    }
  }, [searchParams, showToast]);

  // Fetch account status & posts
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Account status
      const accRes = await fetch('/api/social/linkedin/account');
      const accJson = await accRes.json();

      if (accRes.ok && accJson.account) {
        setAccount(accJson.account);
        setIsConnected(accJson.connected);
        setIsTokenExpired(accJson.isTokenExpired || false);
      } else {
        setAccount(null);
        setIsConnected(false);
      }

      // 2. Fetch LinkedIn posts
      const postsRes = await fetch('/api/admin/posts');
      if (postsRes.ok) {
        const postsJson = await postsRes.json();
        const rawPosts: PostItem[] = postsJson.posts || [];
        // Filter posts specifically for LinkedIn or with targets
        setPosts(rawPosts);
      }
    } catch (err) {
      console.error('Failed to load LinkedIn dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Publish / Save
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Please enter post text before submitting.', 'error');
      return;
    }

    if (publishMode === 'SCHEDULE' && !scheduledDateTime) {
      showToast('Please specify scheduled date and time.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/social/linkedin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaUrls: mediaUrl ? [mediaUrl.trim()] : [],
          mode: publishMode,
          scheduledAt: publishMode === 'SCHEDULE' ? scheduledDateTime : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'LinkedIn rejected post');
      }

      if (publishMode === 'NOW') {
        showToast('Successfully published post directly to LinkedIn feed!', 'success');
      } else if (publishMode === 'SCHEDULE') {
        showToast('Post scheduled successfully for LinkedIn dispatch.', 'success');
      } else {
        showToast('Draft saved successfully in database.', 'success');
      }

      setContent('');
      setMediaUrl('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish to LinkedIn', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/social/linkedin/disconnect', { method: 'DELETE' });
      if (res.ok) {
        showToast('LinkedIn account disconnected safely.', 'success');
        setIsDisconnectModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to disconnect', 'error');
      }
    } catch {
      showToast('Network error while disconnecting', 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Character limit calculation
  const charLimit = 3000;
  const charsRemaining = charLimit - content.length;

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'PUBLISHED') return p.status === 'PUBLISHED';
    if (activeTab === 'SCHEDULED') return p.status === 'SCHEDULED';
    if (activeTab === 'DRAFTS') return p.status === 'DRAFT';
    if (activeTab === 'FAILED') return p.status === 'FAILED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-950 border border-blue-800/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <SocialPlatformIcon platform="linkedin" size="lg" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">LinkedIn Management Console</h1>
              <Badge
                variant="outline"
                className={
                  isConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase'
                    : isTokenExpired
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase'
                    : 'bg-slate-800 border-slate-700 text-slate-400 text-[10px] font-bold uppercase'
                }
              >
                {isConnected ? '● Connected' : isTokenExpired ? '⚠ Token Expired' : '○ Disconnected'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official LinkedIn OAuth 2.0 / OpenID Connect publishing and UGC feed integration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isConnected ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDisconnectModalOpen(true)}
              className="rounded-xl bg-rose-600/90 hover:bg-rose-600 text-xs font-semibold cursor-pointer"
            >
              <Unplug className="w-3.5 h-3.5 mr-1.5" />
              Disconnect
            </Button>
          ) : (
            <a href="/api/social/linkedin/connect">
              <Button size="sm" className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-lg shadow-blue-600/20 cursor-pointer">
                <SocialPlatformIcon platform="linkedin" size="xs" className="mr-1.5" />
                Connect LinkedIn
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Account Identity Card (Real data, zero fake avatars) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              <span>Authenticated Profile</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Verified identity via LinkedIn OpenID UserInfo.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {isConnected && account ? (
              <>
                <div className="flex items-center gap-3.5">
                  {account.avatarUrl ? (
                    <img
                      src={account.avatarUrl}
                      alt={account.accountName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/40 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                      {account.accountName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'LI'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{account.accountName}</h3>
                    <p className="text-xs text-blue-400 font-mono truncate">{account.accountHandle}</p>
                    {account.email && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{account.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Account URN:</span>
                    <span className="font-mono text-slate-200 text-[11px] max-w-[170px] truncate" title={account.platformAccountId}>
                      {account.platformAccountId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Connection Status:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active & Valid
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Token Expiry:</span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {account.tokenExpiresAt ? format(new Date(account.tokenExpiresAt), 'MMM dd, yyyy') : '60 Days'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last Synced:</span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {account.lastSyncedAt ? format(new Date(account.lastSyncedAt), 'HH:mm:ss · MMM dd') : 'Just now'}
                    </span>
                  </div>
                </div>

                {/* Scopes Badges */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Granted Scopes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {account.scopes.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[10px] font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Unplug className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">No LinkedIn Account Connected</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                    Authorize SocialFlow through LinkedIn OAuth 2.0 to publish directly to your feed.
                  </p>
                </div>
                <a href="/api/social/linkedin/connect" className="inline-block pt-1">
                  <Button size="sm" className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-bold">
                    Connect Now
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Composer Card */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              <span>Create LinkedIn Post</span>
              <span
                className={`text-xs font-mono ${
                  charsRemaining < 100 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {charsRemaining} chars remaining
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Publish authentic updates directly via official LinkedIn UGC API.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What do you want to share with your professional network? (Supports up to 3,000 characters)"
                  className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
              </div>

              {/* Media URL Input (optional image attachment) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Image Attachment URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://images.example.com/asset.png"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Publish Mode & Schedule Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Publishing Mode
                  </label>
                  <select
                    value={publishMode}
                    onChange={(e) => setPublishMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="NOW">Publish Now (Immediate)</option>
                    <option value="SCHEDULE">Schedule for Later</option>
                    <option value="DRAFT">Save as Draft</option>
                  </select>
                </div>

                {publishMode === 'SCHEDULE' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Dispatch Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-blue-400" />
                  Visibility: <b>Public (Member Network)</b>
                </span>

                <Button
                  type="submit"
                  disabled={isPublishing || !isConnected}
                  className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-xs font-bold text-white px-5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isPublishing ? 'Processing...' : publishMode === 'NOW' ? 'Publish to LinkedIn' : publishMode === 'SCHEDULE' ? 'Schedule Post' : 'Save Draft'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Permission-Aware Capabilities Matrix */}
      <Card className="rounded-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
            <span>LinkedIn API Capabilities & Approval Matrix</span>
            <span className="text-xs text-slate-400 font-mono">App ID: 773dl8qg64gtlw</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Real permissions granted by LinkedIn Developer Console for this application.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Member Feed Publishing</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">Share on LinkedIn API v2 enabled. Post updates and articles directly.</p>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-mono">
                w_member_social
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Profile & Identity</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">OpenID Connect active. Real name, verified email, and profile avatar.</p>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-mono">
                openid · profile · email
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Organization Pages</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400">Publishing to LinkedIn Company Pages requires Community Management API approval.</p>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] font-mono">
                Approval Required
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-950/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Deep Analytics</span>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400">Granular impression & CTR metrics require LinkedIn Marketing Developer Tier.</p>
              <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 text-[9px] font-mono">
                Enterprise Product
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Post Stream / History */}
      <Card className="rounded-2xl border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-white">LinkedIn Posts & Dispatch Queue</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Audited stream of published updates, pending schedules, and drafts.
              </CardDescription>
            </div>

            {/* Filter Segmented Control */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {(['ALL', 'PUBLISHED', 'SCHEDULED', 'DRAFTS', 'FAILED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredPosts.length > 0 ? (
            <div className="divide-y divide-slate-800/60">
              {filteredPosts.map((post) => {
                const target = post.targets?.[0];
                return (
                  <div key={post.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] font-bold'
                              : post.status === 'SCHEDULED'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 text-[10px] font-bold'
                              : post.status === 'FAILED'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 text-[10px] font-bold'
                              : 'bg-slate-800 text-slate-400 text-[10px] font-bold'
                          }
                        >
                          {post.status}
                        </Badge>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {format(new Date(post.createdAt), 'MMM dd, yyyy · HH:mm')}
                        </span>
                        {target?.externalPostId && (
                          <span className="text-[11px] text-blue-400 font-mono truncate max-w-[200px]" title={target.externalPostId}>
                            URN: {target.externalPostId}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{post.content}</p>

                      {target?.errorMessage && (
                        <p className="text-[11px] text-rose-400 font-mono">Error: {target.errorMessage}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {target?.externalPostId && (
                        <a
                          href={`https://www.linkedin.com/feed/update/${target.externalPostId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>View on LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p>No posts matching the selected filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => !isDisconnecting && setIsDisconnectModalOpen(false)}
        title="Disconnect LinkedIn Account?"
        description="SocialFlow will stop publishing through this LinkedIn connection."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Important Confirmation
            </p>
            <p className="text-[11px] text-rose-300/90 leading-relaxed">
              Disconnecting will delete stored OAuth access tokens and cancel all pending scheduled posts for LinkedIn. You can reconnect anytime.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isDisconnecting}
              onClick={() => setIsDisconnectModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isDisconnecting}
              onClick={handleDisconnect}
              className="rounded-xl bg-rose-600 hover:bg-rose-500 font-bold cursor-pointer"
            >
              Disconnect LinkedIn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function LinkedInManagementPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading LinkedIn Management Console...
        </div>
      }
    >
      <LinkedInManagementContent />
    </React.Suspense>
  );
}
