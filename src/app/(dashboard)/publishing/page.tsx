"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

export default function PublishingPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPublishingQueue = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublishingQueue();
  }, []);

  const scheduledPosts = posts.filter((p) => p.status === "SCHEDULED");
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED");
  const failedPosts = posts.filter((p) => p.status === "FAILED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publishing Pipeline & Queue</h1>
          <p className="text-xs text-slate-500">
            Monitor real-time multi-platform dispatch, scheduled queue releases, and platform responses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPublishingQueue}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Queue</span>
          </Button>
          <Link href="/content/create">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Compose Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Scheduled in Queue</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {scheduledPosts.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Successfully Dispatched</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {publishedPosts.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Target Errors / Action Req.</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {failedPosts.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Queue Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Active Scheduled Releases</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading scheduled queue...</div>
          ) : scheduledPosts.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-slate-500">No posts currently waiting in the scheduled queue.</p>
              <Link href="/content/create">
                <Button size="sm" variant="outline" className="text-xs">
                  Schedule Your First Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">Scheduled</Badge>
                      {post.scheduledAt && (
                        <span className="text-xs font-mono text-slate-500">
                          Due: {format(new Date(post.scheduledAt), "MMM d, yyyy · h:mm a")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.targets?.map((t: any) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                        >
                          {t.socialAccount?.platform}: {t.status}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/content/${post.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispatched History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Recently Dispatched Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading published history...</div>
          ) : publishedPosts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No published posts yet.</div>
          ) : (
            <div className="space-y-3">
              {publishedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Published</Badge>
                      {post.publishedAt && (
                        <span className="text-xs text-slate-500">
                          {format(new Date(post.publishedAt), "MMM d, yyyy · h:mm a")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/content/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </Link>
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
