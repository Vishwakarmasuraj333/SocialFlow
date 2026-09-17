'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  ArrowLeft,
  Search,
  CheckCircle2,
  Square,
  CheckSquare,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { SocialPlatformIcon } from '@/components/brand/platform-icons';

export default function TrashPage() {
  const { showToast } = useToast();
  const [deletedPosts, setDeletedPosts] = useState<any[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [permanentDeletePost, setPermanentDeletePost] = useState<any>(null);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [restoreAllModalOpen, setRestoreAllModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTrash = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trash');
      if (res.ok) {
        const data = await res.json();
        setDeletedPosts(data.posts || []);
        setSelectedPostIds([]);
      }
    } catch {
      showToast('Failed to load trash items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // Selection logic
  const toggleSelectPost = (id: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPostIds.length === filteredPosts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(filteredPosts.map((p) => p.id));
    }
  };

  // Restore single post
  const handleRestore = async (postId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'RESTORE' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Post restored to active feed successfully!', 'success');
        fetchTrash();
      } else {
        showToast(data.error || 'Failed to restore post', 'error');
      }
    } catch {
      showToast('Network error restoring post', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore selected posts
  const handleBulkRestore = async () => {
    if (!selectedPostIds.length) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds: selectedPostIds, action: 'RESTORE' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `${selectedPostIds.length} post(s) restored successfully!`, 'success');
        setSelectedPostIds([]);
        fetchTrash();
      } else {
        showToast(data.error || 'Failed to restore selected posts', 'error');
      }
    } catch {
      showToast('Network error restoring posts', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore all posts
  const handleRestoreAll = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE_ALL' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'All posts restored to active feed!', 'success');
        setRestoreAllModalOpen(false);
        fetchTrash();
      } else {
        showToast(data.error || 'Failed to restore all posts', 'error');
      }
    } catch {
      showToast('Network error restoring all posts', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Permanent delete single post
  const handlePermanentDelete = async () => {
    if (!permanentDeletePost) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: permanentDeletePost.id, action: 'PERMANENT_DELETE' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Post permanently purged from database', 'success');
        setPermanentDeletePost(null);
        fetchTrash();
      } else {
        showToast(data.error || 'Permanent delete failed', 'error');
      }
    } catch {
      showToast('Network error purging post', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Permanent delete selected posts
  const handleBulkPermanentDelete = async () => {
    if (!selectedPostIds.length) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds: selectedPostIds, action: 'PERMANENT_DELETE' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `${selectedPostIds.length} post(s) permanently deleted`, 'success');
        setBulkDeleteModalOpen(false);
        setSelectedPostIds([]);
        fetchTrash();
      } else {
        showToast(data.error || 'Permanent delete failed', 'error');
      }
    } catch {
      showToast('Network error deleting posts', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty entire trash
  const handleEmptyTrash = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EMPTY_TRASH' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Trash emptied completely from database', 'success');
        setEmptyTrashModalOpen(false);
        fetchTrash();
      } else {
        showToast(data.error || 'Failed to empty trash', 'error');
      }
    } catch {
      showToast('Network error emptying trash', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPosts = deletedPosts.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.globalContent?.toLowerCase().includes(query) ||
      p.author?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/content"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Content & Publishing
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <Trash2 className="h-6 w-6" />
            </span>
            Trash & Content Recovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Safely restore soft-deleted posts back to your active queue, or permanently purge them from the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrash}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          {deletedPosts.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoreAllModalOpen(true)}
                className="gap-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore All ({deletedPosts.length})</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setEmptyTrashModalOpen(true)}
                className="gap-1.5 rounded-xl shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Empty Trash</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (When items are selected) */}
      {selectedPostIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedPostIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {selectedPostIds.length} post(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRestore}
              isLoading={isProcessing}
              className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 rounded-xl"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Restore Selected ({selectedPostIds.length})
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="h-8 text-xs font-bold rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Real Delete Selected (Permanent)
            </Button>
          </div>
        </div>
      )}

      {/* Search Filter Toolbar & Select All */}
      {deletedPosts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer px-1"
          >
            {selectedPostIds.length > 0 && selectedPostIds.length === filteredPosts.length ? (
              <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Square className="h-4 w-4 text-slate-400" />
            )}
            <span>
              {selectedPostIds.length === filteredPosts.length
                ? 'Deselect All'
                : 'Select All'}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              ({filteredPosts.length} items)
            </span>
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by headline, content text, or author..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Deleted Posts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
          ))}
        </div>
      ) : deletedPosts.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 shadow-xs rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Trash is completely clean</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              No soft-deleted posts are pending recovery or purging. All active content is safely preserved in Content & Publishing.
            </p>
            <Link href="/content">
              <Button size="sm" variant="outline" className="rounded-xl mt-2">
                Return to Content Feed
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isSelected = selectedPostIds.includes(post.id);

            return (
              <Card
                key={post.id}
                className={`border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl shadow-xs transition-all ${
                  isSelected ? 'ring-2 ring-indigo-500/50 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' : 'hover:border-indigo-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox & Content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
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

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="destructive" className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5">
                          Soft-Deleted
                        </Badge>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Moved to Trash: {post.deletedAt ? new Date(post.deletedAt).toLocaleString() : 'Recently'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                          Author: {post.author?.name || 'Workspace Member'}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {post.title || post.globalContent || 'Untitled Post'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {post.globalContent}
                      </p>

                      {/* Connected Target Channel Icons */}
                      {post.targets && post.targets.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Channels:</span>
                          {post.targets.map((t: any) => (
                            <SocialPlatformIcon key={t.id} platform={t.platform} size="xs" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleRestore(post.id)}
                      className="h-8 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 rounded-xl"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      <span>Restore</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isProcessing}
                      onClick={() => setPermanentDeletePost(post)}
                      className="h-8 text-xs font-semibold rounded-xl"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Single Item Permanent Delete Modal */}
      <Modal
        isOpen={Boolean(permanentDeletePost)}
        onClose={() => !isProcessing && setPermanentDeletePost(null)}
        title="Permanently Delete Post?"
        description="This action cannot be undone. All target delivery data and history will be permanently deleted."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Irreversible Deletion</span>
              <p className="text-[11px] leading-relaxed">
                You are about to permanently delete: <b>&quot;{permanentDeletePost?.title || permanentDeletePost?.globalContent?.slice(0, 45)}...&quot;</b>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setPermanentDeletePost(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handlePermanentDelete}
              className="rounded-xl font-medium"
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Permanent Delete Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => !isProcessing && setBulkDeleteModalOpen(false)}
        title={`Permanently Delete ${selectedPostIds.length} Posts?`}
        description="This action cannot be undone. Selected items will be permanently erased from the database."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Delete {selectedPostIds.length} Posts Forever</span>
              <p className="text-[11px] leading-relaxed mt-1">
                These {selectedPostIds.length} items will be permanently removed from database and cannot be recovered.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setBulkDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleBulkPermanentDelete}
              className="rounded-xl font-medium"
            >
              Delete Permanently ({selectedPostIds.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore All Modal */}
      <Modal
        isOpen={restoreAllModalOpen}
        onClose={() => !isProcessing && setRestoreAllModalOpen(false)}
        title={`Restore All ${deletedPosts.length} Posts?`}
        description="All soft-deleted items will be restored to your active Content & Publishing stream."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>This will reactivate all {deletedPosts.length} posts and restore their original scheduling.</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setRestoreAllModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              isLoading={isProcessing}
              onClick={handleRestoreAll}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Confirm Restore All
            </Button>
          </div>
        </div>
      </Modal>

      {/* Empty Trash Modal */}
      <Modal
        isOpen={emptyTrashModalOpen}
        onClose={() => !isProcessing && setEmptyTrashModalOpen(false)}
        title="Empty Entire Content Trash?"
        description="Are you sure you want to permanently purge all soft-deleted posts? This action is completely irreversible."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Permanent Database Wipe</span>
              <p className="text-[11px] leading-relaxed mt-1">
                This will destroy all {deletedPosts.length} pending items across all connected social channels permanently.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setEmptyTrashModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isProcessing}
              onClick={handleEmptyTrash}
              className="rounded-xl font-bold"
            >
              Confirm Empty Trash Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
