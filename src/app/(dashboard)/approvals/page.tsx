'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Send,
  User,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function ApprovalsPage() {
  const { showToast } = useToast();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal
  const [activeApproval, setActiveApproval] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'>('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/approvals');
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch {
      showToast('Failed to load approvals queue', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApproval) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: activeApproval.id,
          action: reviewAction,
          feedback: feedback.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Post review updated: ${reviewAction.replace(/_/g, ' ')}!`, 'success');
        setActiveApproval(null);
        setFeedback('');
        fetchApprovals();
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch {
      showToast('Network error during review submission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const reviewedApprovals = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          Agency Approval Queue
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review draft submissions from editors before multi-platform broadcasting.
        </p>
      </div>

      {/* Pending Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Pending Reviews ({pendingApprovals.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 skeleton-shimmer" />
            ))}
          </div>
        ) : pendingApprovals.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-12 shadow-sm dark:shadow-none">
            <CardContent className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 opacity-80" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Queue is clear</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All submitted content drafts have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((appr) => {
              const mediaList = appr.post.mediaUrlsJson ? JSON.parse(appr.post.mediaUrlsJson) : [];
              return (
                <Card key={appr.id} className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm dark:shadow-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={appr.post.author.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${appr.post.author.name}`}
                        alt={appr.post.author.name}
                        className="h-9 w-9 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{appr.post.author.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Submitted {new Date(appr.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {appr.post.targets.map((t: any) => (
                        <span key={t.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono">
                          {t.platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{appr.post.title || 'Untitled Post Draft'}</h3>
                    <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      {appr.post.globalContent}
                    </p>
                  </div>

                  {mediaList.length > 0 && (
                    <div className="flex gap-2">
                      {mediaList.map((url: string, i: number) => (
                        <img key={i} src={url} alt="Media" className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveApproval(appr);
                        setReviewAction('CHANGES_REQUESTED');
                      }}
                      className="h-8 text-xs text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20"
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setActiveApproval(appr);
                        setReviewAction('REJECTED');
                      }}
                      className="h-8 text-xs"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveApproval(appr);
                        setReviewAction('APPROVED');
                      }}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Approve & Schedule
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(activeApproval)}
        onClose={() => setActiveApproval(null)}
        title={`Confirm Review: ${reviewAction.replace(/_/g, ' ')}`}
        description="Provide optional reviewer feedback to the author."
        maxWidth="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reviewer Notes / Feedback
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Looks great, approved for automated scheduled blast."
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setActiveApproval(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
