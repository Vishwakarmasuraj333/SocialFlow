"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, AlertCircle, ShieldCheck, Key, ExternalLink } from "lucide-react";

export default function AdminIntegrationsPage() {
  const providers = [
    {
      name: "LinkedIn",
      api: "Community Management API v2",
      envKeys: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
      scopes: ["r_liteprofile", "r_emailaddress", "w_member_social", "w_organization_social"],
      configured: true,
      status: "READY",
    },
    {
      name: "Meta / Facebook",
      api: "Meta Graph API v19.0",
      envKeys: ["META_APP_ID", "META_APP_SECRET"],
      scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "pages_messaging"],
      configured: true,
      status: "READY",
    },
    {
      name: "Instagram",
      api: "Instagram Graph API v19.0",
      envKeys: ["META_APP_ID", "META_APP_SECRET"],
      scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_comments", "instagram_manage_messages"],
      configured: true,
      status: "READY",
    },
    {
      name: "TikTok",
      api: "TikTok Content Posting API v2",
      envKeys: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
      scopes: ["user.info.basic", "video.publish", "video.upload"],
      configured: true,
      status: "READY",
    },
    {
      name: "X / Twitter",
      api: "X API v2 (OAuth 2.0 PKCE)",
      envKeys: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      configured: true,
      status: "READY",
    },
    {
      name: "YouTube",
      api: "YouTube Data API v3",
      envKeys: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"],
      scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
      configured: true,
      status: "READY",
    },
    {
      name: "Pinterest",
      api: "Pinterest API v5",
      envKeys: ["PINTEREST_CLIENT_ID", "PINTEREST_CLIENT_SECRET"],
      scopes: ["boards:read", "pins:read", "pins:write"],
      configured: true,
      status: "READY",
    },
    {
      name: "Threads",
      api: "Threads API v1",
      envKeys: ["META_APP_ID", "META_APP_SECRET"],
      scopes: ["threads_basic", "threads_content_publish", "threads_read_replies"],
      configured: true,
      status: "READY",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Provider Integrations & OAuth Health</h1>
        <p className="text-xs text-slate-500">
          Inspect external social developer credentials, authorized OAuth scopes, and encryption keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <Card key={p.name}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <span className="text-xs text-indigo-500 font-mono">{p.api}</span>
              </div>
              <Badge variant={p.configured ? "success" : "warning"}>
                {p.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Required Environment Variables
                </span>
                <div className="flex flex-wrap gap-1">
                  {p.envKeys.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Configured Scopes
                </span>
                <div className="flex flex-wrap gap-1">
                  {p.scopes.map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256-GCM Guarded
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
