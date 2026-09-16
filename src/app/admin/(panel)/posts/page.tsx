"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminPostsAuditPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/admin/posts");
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publishing Stream & Audit</h1>
        <p className="text-xs text-slate-500">
          Platform-wide post records, multi-target executions, and delivery logs.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Post Content</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Targets</th>
                  <th className="px-6 py-3.5 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Loading publishing audit logs...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No posts recorded yet.
                    </td>
                  </tr>
                ) : (
                  posts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                          {p.globalContent || p.title || "Untitled Post"}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {p.author?.name || "Workspace Member"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.status === "PUBLISHED"
                              ? "success"
                              : p.status === "SCHEDULED"
                              ? "info"
                              : "default"
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.targets?.map((t: any) => (
                            <span
                              key={t.id}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                            >
                              {t.socialAccount?.platform}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono">
                        {p.createdAt ? format(new Date(p.createdAt), "MMM d · h:mm a") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
