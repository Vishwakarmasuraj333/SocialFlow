'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Plus,
  Search,
  Filter,
  Send,
  Calendar,
  Trash2,
  CheckSquare,
  Square,
  MoreHorizontal,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Edit,
  AlertTriangle,
  RotateCcw,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';

function cleanHandle(handle?: string | null): string {
  if (!handle) return '';
  let clean = handle.trim();
  if (clean.includes('@') && clean.includes('.')) {
    const parts = clean.split('@').filter(Boolean);
    clean = parts[0] || clean;
  }
  clean = clean.replace(/^@+/, '');
  return `@${clean}`;
}

export default function PostsView() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Bulk Selection
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Single Post Details Modal (Section 14)
  const [selectedPostDetails, setSelectedPostDetails] = useState<any | null>(null);

  // Single Post Deletion Modal
  const [postToDelete, setPostToDelete] = useState<any | null>(null);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        platform: platformFilter,
        search: searchQuery,
        page: String(page),
        limit: '15',
      });
      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setPagination(data.pagination);
      } else {
        // Fallback to /api/posts if needed
        const resFallback = await fetch(`/api/posts?${params.toString()}`);
        if (resFallback.ok) {
          const data = await resFallback.json();
          setPosts(data.posts || []);
          setPagination(data.pagination);
        }
      }
    } catch {
      showToast('Failed to load posts from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, platformFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleSelectAll = () => {
    if (selectedPostIds.length === posts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(posts.map((p) => p.id));
    }
  };

  const toggleSelectPost = (id: string) => {
    if (selectedPostIds.includes(id)) {
      setSelectedPostIds(selectedPostIds.filter((pId) => pId !== id));
    } else {
      setSelectedPostIds([...selectedPostIds, id]);
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      showToast('Dispatching post to official platform APIs...', 'info');
      const res = await fetch(`/api/admin/posts/${id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Post published successfully!', 'success');
        fetchPosts();
      } else {
        showToast(data.errorMessage || data.error || 'Publishing failed on platform API', 'error');
        fetchPosts();
      }
    } catch {
      showToast('Network error during publishing', 'error');
    }
  };

  const handleCancelSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Post schedule cancelled and returned to draft.', 'success');
        fetchPosts();
        if (selectedPostDetails?.id === id) setSelectedPostDetails(null);
      } else {
        showToast(data.error || 'Failed to cancel schedule', 'error');
      }
    } catch {
      showToast('Network error while cancelling schedule', 'error');
    }
  };

  const handleRetryPost = async (id: string) => {
    try {
      showToast('Retrying publication with platform APIs...', 'info');
      const res = await fetch(`/api/admin/posts/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Post retried and published successfully!', 'success');
        fetchPosts();
        if (selectedPostDetails?.id === id) setSelectedPostDetails(null);
      } else {
        showToast(data.errorMessage || data.error || 'Retry failed on platform API', 'error');
        fetchPosts();
      }
    } catch {
      showToast('Network error while retrying post', 'error');
    }
  };

  const handleDuplicatePost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Post duplicated as draft.', 'success');
        fetchPosts();
      } else {
        showToast(data.error || 'Failed to duplicate post', 'error');
      }
    } catch {
      showToast('Network error while duplicating post', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    setIsDeleteProcessing(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Post deleted and moved to trash successfully.', 'success');
        setPostToDelete(null);
        setSelectedPostIds(selectedPostIds.filter((pId) => pId !== id));
        fetchPosts();
      } else {
        showToast(data.error || 'Failed to delete post', 'error');
      }
    } catch {
      showToast('Network error while deleting post', 'error');
    } finally {
      setIsDeleteProcessing(false);
    }
  };

  const handleBulkDelete = async (permanent: boolean = false) => {
    if (selectedPostIds.length === 0) return;
    setIsBulkActionLoading(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPostIds, permanent }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Successfully processed ${selectedPostIds.length} posts.`, 'success');
      } else {
        // Fallback to individual deletions
        for (const id of selectedPostIds) {
          await fetch(`/api/admin/posts/${id}?permanent=${permanent}`, { method: 'DELETE' });
        }
        showToast(`Processed ${selectedPostIds.length} posts.`, 'success');
      }
      setSelectedPostIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchPosts();
    } catch {
      showToast('Failed to complete bulk deletion', 'error');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Content & Publications</h1>
          <p className="text-xs text-slate-500">
            Real-time feed of multi-channel publications, scheduled releases, and platform dispatch statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/social/publisher">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-3.5 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search post captions, titles, or campaign tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
                <option value="FAILED">Failed</option>
                <option value="PUBLISHING">Processing</option>
              </select>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">All Platforms</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="TIKTOK">TikTok</option>
                <option value="TWITTER">X / Twitter</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="PINTEREST">Pinterest</option>
                <option value="THREADS">Threads</option>
              </select>

              {posts.length > 0 && (
                <Button
                  variant={selectedPostIds.length === posts.length && posts.length > 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 rounded-xl px-2.5 text-xs font-semibold gap-1.5 shrink-0"
                  title={selectedPostIds.length === posts.length ? 'Deselect all' : 'Select all visible posts'}
                >
                  {selectedPostIds.length === posts.length && posts.length > 0 ? (
                    <>
                      <CheckSquare className="h-3.5 w-3.5 text-white" />
                      <span className="hidden sm:inline">Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Select All</span>
                      <span>({posts.length})</span>
                    </>
                  )}
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={fetchPosts} className="h-8 rounded-xl px-2.5" title="Refresh posts">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Querying posts from database...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-dashed text-center py-16 rounded-2xl">
          <CardContent className="space-y-3">
            <PenTool className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No posts match criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first scheduled publication or adjust your search filters to browse content.
            </p>
            <Link href="/admin/social/publisher">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl mt-2">
                Create Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isSelected = selectedPostIds.includes(post.id);
            let mediaList: string[] = [];
            try {
              if (post.mediaUrlsJson) mediaList = JSON.parse(post.mediaUrlsJson);
            } catch {}

            const isFailed = post.status === 'FAILED';
            const isScheduled = post.status === 'SCHEDULED';
            const isPublished = post.status === 'PUBLISHED';

            return (
              <Card
                key={post.id}
                className={`border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 transition-all ${
                  isSelected ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/10' : ''
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Checkbox & Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSelectPost(post.id)}
                      className="mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    {mediaList.length > 0 && (
                      <div
                        onClick={() => setSelectedPostDetails(post)}
                        className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 cursor-pointer shadow-xs group/media bg-slate-900"
                        title="Click to view media"
                      >
                        {mediaList[0].endsWith('.mp4') || mediaList[0].endsWith('.webm') || mediaList[0].includes('video') ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950">
                            <Play className="w-5 h-5 text-white fill-white group-hover/media:scale-110 transition-transform" />
                          </div>
                        ) : (
                          <img
                            src={mediaList[0]}
                            alt="Media"
                            className="w-full h-full object-cover group-hover/media:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        {mediaList.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-bold text-white px-1 py-0.5 rounded shadow">
                            +{mediaList.length - 1}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            isPublished
                              ? 'default'
                              : isScheduled
                              ? 'secondary'
                              : isFailed
                              ? 'destructive'
                              : 'outline'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {post.status.replace(/_/g, ' ')}
                        </Badge>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {post.targets?.map((t: any) => {
                            const handle = t.socialAccount?.accountHandle;
                            return (
                              <span
                                key={t.id}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold"
                                title={handle || t.platform}
                              >
                                <SocialPlatformIcon platform={t.platform.toLowerCase()} size="xs" />
                                <span>{t.platform}</span>
                                {handle && <span className="opacity-70 font-mono text-[9px]">({cleanHandle(handle)})</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPostDetails(post)}
                        className="text-left group cursor-pointer block"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {post.title || post.globalContent}
                        </p>
                      </button>

                      {isFailed && post.errorMessage && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Error: {post.errorMessage}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Author: <b className="text-slate-800 dark:text-slate-200">{post.author?.name || 'Suraj Vishwakarma'}</b></span>
                        {post.scheduledAt && (
                          <span>Scheduled: <b>{new Date(post.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</b></span>
                        )}
                        {post.publishedAt && (
                          <span>Published: <b>{new Date(post.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</b></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPostDetails(post)}
                      className="h-8 px-2.5 text-xs rounded-xl"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>

                    {isFailed && (
                      <Button
                        size="sm"
                        onClick={() => handleRetryPost(post.id)}
                        className="h-8 px-2.5 text-xs rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                        title="Retry Publication"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry
                      </Button>
                    )}

                    {isScheduled && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handlePublishNow(post.id)}
                          className="h-8 px-2.5 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                          title="Publish Now Immediately"
                        >
                          <Send className="h-3 w-3 mr-1" /> Publish Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelSchedule(post.id)}
                          className="h-8 px-2.5 text-xs rounded-xl border-amber-300 text-amber-600 hover:bg-amber-50"
                          title="Cancel Schedule"
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                      </>
                    )}

                    {post.status === 'PUBLISHING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelSchedule(post.id)}
                        className="h-8 px-2.5 text-xs rounded-xl border-amber-300 text-amber-600 hover:bg-amber-50"
                        title="Reset stuck status"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Reset
                      </Button>
                    )}

                    {!isPublished && !isScheduled && !isFailed && post.status !== 'PUBLISHING' && (
                      <Button
                        size="sm"
                        onClick={() => handlePublishNow(post.id)}
                        className="h-8 px-2.5 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        <Send className="h-3 w-3 mr-1" /> Publish
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicatePost(post.id)}
                      className="h-8 px-2 rounded-xl"
                      title="Duplicate as Draft"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPostToDelete(post)}
                      className="h-8 px-2 rounded-xl"
                      title="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post Details Modal (Section 14) */}
      {selectedPostDetails && (
        <Modal
          isOpen={Boolean(selectedPostDetails)}
          onClose={() => setSelectedPostDetails(null)}
          title={selectedPostDetails.title || 'Post Details'}
          description="Detailed delivery status, platform IDs, and official API response status."
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Post Status & Overview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Dispatch Status</span>
                <Badge
                  variant={
                    selectedPostDetails.status === 'PUBLISHED'
                      ? 'default'
                      : selectedPostDetails.status === 'SCHEDULED'
                      ? 'secondary'
                      : selectedPostDetails.status === 'FAILED'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="font-bold uppercase text-[9px]"
                >
                  {selectedPostDetails.status}
                </Badge>
              </div>

              <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {selectedPostDetails.globalContent}
              </p>

              {selectedPostDetails.mediaUrlsJson && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      Attached Media Assets ({JSON.parse(selectedPostDetails.mediaUrlsJson).length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {JSON.parse(selectedPostDetails.mediaUrlsJson).map((url: string, i: number) => {
                      const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video');
                      return isVideo ? (
                        <div key={i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video flex flex-col justify-center">
                          <video src={url} controls className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video shadow-xs">
                          <img
                            src={url}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-indigo-600 transition-colors"
                            title="Open full resolution in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Target Channels & Platform Post IDs */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                Destination Target Channels ({selectedPostDetails.targets?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedPostDetails.targets?.map((target: any) => (
                  <div
                    key={target.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <SocialPlatformIcon platform={target.platform.toLowerCase()} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {target.socialAccount?.accountName || target.platform}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate">
                          External ID: {target.platformPostId || 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={target.publishStatus === 'PUBLISHED' ? 'default' : target.publishStatus === 'FAILED' ? 'destructive' : 'outline'}
                        className="text-[9px] uppercase"
                      >
                        {target.publishStatus}
                      </Badge>

                      {target.platformUrl && (
                        <a
                          href={target.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600"
                          title="View on platform"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message if Failed */}
            {selectedPostDetails.errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> API Error Details
                </span>
                <p className="font-mono text-[11px]">{selectedPostDetails.errorMessage}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-2 text-slate-500 font-mono text-[10px]">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                Created: {new Date(selectedPostDetails.createdAt).toLocaleString()}
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                Scheduled / Published: {selectedPostDetails.publishedAt ? new Date(selectedPostDetails.publishedAt).toLocaleString() : selectedPostDetails.scheduledAt ? new Date(selectedPostDetails.scheduledAt).toLocaleString() : 'Not set'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const post = selectedPostDetails;
                  setSelectedPostDetails(null);
                  setPostToDelete(post);
                }}
              >
                Delete Post
              </Button>

              <div className="flex gap-2">
                {selectedPostDetails.status === 'FAILED' && (
                  <Button
                    size="sm"
                    onClick={() => handleRetryPost(selectedPostDetails.id)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Now
                  </Button>
                )}

                {selectedPostDetails.status === 'SCHEDULED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelSchedule(selectedPostDetails.id)}
                    className="border-amber-300 text-amber-600 hover:bg-amber-50"
                  >
                    Cancel Schedule
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => setSelectedPostDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Single Post Deletion Confirmation Modal */}
      {postToDelete && (
        <Modal
          isOpen={Boolean(postToDelete)}
          onClose={() => setPostToDelete(null)}
          title="Delete Post?"
          description="Confirm post deletion. This will archive the post in the internal Trash system."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Are you sure you want to delete post &ldquo;{postToDelete.title || postToDelete.globalContent.slice(0, 40)}...&rdquo;?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPostToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeletePost(postToDelete.id)}
                isLoading={isDeleteProcessing}
                className="font-bold"
              >
                Delete Post
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating Sticky Bulk Actions Bar */}
      {selectedPostIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
              {selectedPostIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {selectedPostIds.length === 1 ? '1 post selected' : `${selectedPostIds.length} posts selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPostIds([])}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="rounded-xl text-xs font-bold gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedPostIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <Modal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => !isBulkActionLoading && setIsBulkDeleteModalOpen(false)}
          title={`Delete ${selectedPostIds.length} Selected Posts`}
          description="Choose whether to archive posts or permanently remove them from the database."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Batch Post Deletion</p>
              <p className="text-[11px] leading-relaxed">
                You have selected <strong>{selectedPostIds.length}</strong> post(s). Choose whether to move them to trash or permanently purge them.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Move to Trash
                </span>
                <p className="text-[11px] text-slate-500">
                  Archive all {selectedPostIds.length} posts. Recoverable anytime from Trash.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isBulkActionLoading}
                  onClick={() => handleBulkDelete(false)}
                  className="w-full text-xs font-semibold rounded-lg"
                >
                  Move to Trash ({selectedPostIds.length})
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Real Delete (Permanent)
                </span>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                  Permanently purge {selectedPostIds.length} posts and targets forever.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={isBulkActionLoading}
                  onClick={() => handleBulkDelete(true)}
                  className="w-full text-xs font-bold rounded-lg"
                >
                  Delete Forever ({selectedPostIds.length})
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={isBulkActionLoading}
                onClick={() => setIsBulkDeleteModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
