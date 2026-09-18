"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { showToast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.post);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDeletePost = async (permanent: boolean) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}${permanent ? "?permanent=true" : ""}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          permanent
            ? "✓ Post permanently purged from database"
            : "✓ Post moved to trash recovery",
          "success"
        );
        router.push("/content");
      } else {
        showToast(data.error || "Failed to delete post", "error");
      }
    } catch {
      showToast("Network error deleting post", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading post details...</div>;
  }

  if (!post) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-500">Post not found.</p>
        <Link href="/content">
          <Button variant="outline" size="sm">
            Back to Content Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/content" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Posts</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs gap-1.5 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Post</span>
          </Button>
        </div>
      </div>

      {/* Main Post Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  post.status === "PUBLISHED"
                    ? "success"
                    : post.status === "SCHEDULED"
                    ? "info"
                    : post.status === "PENDING_APPROVAL"
                    ? "warning"
                    : "default"
                }
              >
                {post.status}
              </Badge>
              {post.campaign && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                  {post.campaign.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono">ID: {post.id}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <span>Created by </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {post.author?.name || "Workspace Member"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Post Message Body */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 mb-2">Message Copy</h3>
            <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Target Networks Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Networks & Execution Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.targets?.map((target: any) => (
                <div
                  key={target.id}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {target.socialAccount?.platform}
                    </span>
                    <p className="text-[10px] text-slate-500">@{target.socialAccount?.name || "account"}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        target.status === "PUBLISHED"
                          ? "success"
                          : target.status === "FAILED"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {target.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline & Metadata */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-500">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Created At</span>
              <span className="text-slate-800 dark:text-slate-200">
                {post.createdAt ? format(new Date(post.createdAt), "MMM d, yyyy · h:mm a") : "-"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Scheduled For</span>
              <span className="text-slate-800 dark:text-slate-200">
                {post.scheduledAt ? format(new Date(post.scheduledAt), "MMM d, yyyy · h:mm a") : "Immediate"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Published At</span>
              <span className="text-slate-800 dark:text-slate-200">
                {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy · h:mm a") : "Pending"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Content & Publication"
        description="Choose whether to move this item to Trash for recovery or permanently delete it from the database."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Post Details
              </span>
              <Badge
                variant={
                  post?.status === "PUBLISHED"
                    ? "success"
                    : post?.status === "SCHEDULED"
                    ? "info"
                    : post?.status === "FAILED"
                    ? "destructive"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {post?.status}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
              {post?.title || post?.content}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option 1: Move to Trash */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Trash2 className="w-4 h-4" />
                  <span>Move to Trash</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Soft-deletes this post. You can restore it anytime from the Trash & Recovery section.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                isLoading={isDeleting}
                onClick={() => handleDeletePost(false)}
                className="w-full text-xs font-semibold rounded-lg"
              >
                Move to Trash
              </Button>
            </div>

            {/* Option 2: Permanent Deletion */}
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Permanent Deletion</span>
                </div>
                <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 leading-relaxed">
                  Immediately and completely purges the post and all its delivery records from the database. Irreversible.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isDeleting}
                onClick={() => handleDeletePost(true)}
                className="w-full text-xs font-bold rounded-lg shadow-sm"
              >
                Delete Permanently
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
