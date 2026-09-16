"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { SocialPlatformIcon } from "@/components/brand/platform-icons";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Filter,
  Layers,
  Globe,
  Clock,
  Send,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export default function PlatformsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const platformMatrix = [
    {
      key: "linkedin",
      name: "LinkedIn",
      category: "professional",
      api: "LinkedIn Share & Community API v2",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      accent: "#0A66C2",
      glow: "hover:border-[#0A66C2]/60 hover:shadow-[0_0_35px_rgba(10,102,194,0.25)]",
      charLimit: 3000,
      maxImages: 9,
      images: true,
      video: true,
      carousel: true,
      stories: false,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Direct publishing to Organization Pages and Personal Profiles. Full support for multipage PDF carousels, rich link attachments, and member mention tags.",
    },
    {
      key: "facebook",
      name: "Facebook",
      category: "community",
      api: "Meta Graph API v19.0",
      badgeColor: "bg-blue-600/10 text-blue-400 border-blue-600/20",
      accent: "#1877F2",
      glow: "hover:border-[#1877F2]/60 hover:shadow-[0_0_35px_rgba(24,119,242,0.25)]",
      charLimit: 63206,
      maxImages: 10,
      images: true,
      video: true,
      carousel: true,
      stories: true,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Direct publishing to Business Pages and Community Groups. Includes video captions, audience geo-targeting, and two-way Messenger comment synchronization.",
    },
    {
      key: "instagram",
      name: "Instagram",
      category: "visual",
      api: "Instagram Graph API v19.0",
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      accent: "#E4405F",
      glow: "hover:border-[#E4405F]/60 hover:shadow-[0_0_35px_rgba(228,64,95,0.25)]",
      charLimit: 2200,
      maxImages: 10,
      images: true,
      video: true,
      carousel: true,
      stories: true,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Official publishing to Professional & Creator accounts. Supports 9:16 vertical Reels, 10-slide photo carousels, and automated first-comment hashtag posting.",
    },
    {
      key: "tiktok",
      name: "TikTok",
      category: "visual",
      api: "TikTok Content Posting API v2",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      accent: "#00F2FE",
      glow: "hover:border-cyan-500/50 hover:shadow-[0_0_35px_rgba(0,242,254,0.22)]",
      charLimit: 2200,
      maxImages: 35,
      images: true,
      video: true,
      carousel: true,
      stories: false,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Direct video publishing to TikTok Creator profiles with granular privacy toggles, duet/stitch permissions, and direct draft synchronization.",
    },
    {
      key: "x",
      name: "X / Twitter",
      category: "microblog",
      api: "X Developer API v2",
      badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/20",
      accent: "#FFFFFF",
      glow: "hover:border-slate-300/60 hover:shadow-[0_0_35px_rgba(255,255,255,0.18)]",
      charLimit: 280,
      maxImages: 4,
      images: true,
      video: true,
      carousel: false,
      stories: false,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Official v2 endpoint integration with automated thread decomposition, media attachments, quote-tweet tracking, and real-time mention webhook streaming.",
    },
    {
      key: "youtube",
      name: "YouTube",
      category: "visual",
      api: "YouTube Data API v3",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
      accent: "#FF0000",
      glow: "hover:border-red-500/60 hover:shadow-[0_0_35px_rgba(255,0,0,0.25)]",
      charLimit: 5000,
      maxImages: 1,
      images: true,
      video: true,
      carousel: false,
      stories: false,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Direct publishing of YouTube Shorts and long-form 4K video uploads with custom thumbnails, playlists, category indexing, and community posts.",
    },
    {
      key: "pinterest",
      name: "Pinterest",
      category: "visual",
      api: "Pinterest Business API v5",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      accent: "#E60023",
      glow: "hover:border-[#E60023]/60 hover:shadow-[0_0_35px_rgba(230,0,35,0.25)]",
      charLimit: 500,
      maxImages: 5,
      images: true,
      video: true,
      carousel: true,
      stories: false,
      scheduling: true,
      inboxComments: false,
      analytics: true,
      directPublish: true,
      notes: "Direct Pin creation to specific user boards with destination URLs, custom titles, rich link tracking, and outbound click analytics.",
    },
    {
      key: "threads",
      name: "Threads",
      category: "microblog",
      api: "Official Threads API v1",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      accent: "#A855F7",
      glow: "hover:border-purple-500/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]",
      charLimit: 500,
      maxImages: 10,
      images: true,
      video: true,
      carousel: true,
      stories: false,
      scheduling: true,
      inboxComments: true,
      analytics: true,
      directPublish: true,
      notes: "Official Threads publishing API for text updates, photo carousels, video clips, replies, and engagement synchronizations.",
    },
  ];

  const filteredPlatforms =
    activeCategory === "all"
      ? platformMatrix
      : platformMatrix.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/80 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Developer Integrations • Zero Browser Automation</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Supported Platforms & <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Capability Matrix
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              We connect exclusively through certified official partner APIs. Here is the verified, production-level capability breakdown for every social network.
            </p>

            {/* Filter Tabs */}
            <div className="mt-8 inline-flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md">
              {[
                { id: "all", label: "All Networks (8)" },
                { id: "professional", label: "B2B & Professional" },
                { id: "visual", label: "Visual & Video" },
                { id: "microblog", label: "Microblogging" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {filteredPlatforms.map((item) => (
              <div
                key={item.name}
                className={`group relative rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm ${item.glow}`}
              >
                {/* Top brand accent bar on hover */}
                <div
                  className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: item.accent }}
                />

                <div>
                  <div className="flex items-start justify-between mb-5 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                        <SocialPlatformIcon platform={item.key} size="xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            {item.name}
                          </h2>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live API
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border inline-block mt-1 ${item.badgeColor}`}>
                          {item.api}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono shrink-0">
                      Limit: {item.charLimit.toLocaleString()} chars
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {item.notes}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {item.directPublish ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        Direct Publishing
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.images ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        Photos & HD Images
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.video ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        Video & 9:16 Reels
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.carousel ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={item.carousel ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400 line-through"}>
                        Carousels
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.scheduling ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        Smart Scheduling
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.inboxComments ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={item.inboxComments ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400 line-through"}>
                        Comments & DMs
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.analytics ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        Analytics Telemetry
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>OAuth 2.0 PKCE Protected</span>
                  </div>
                  <Link href="/register">
                    <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-colors">
                      <span>Connect {item.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Zero Scraping Assurance Banner */}
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/80 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-pink-50/80 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/40 p-8 text-center max-w-4xl mx-auto shadow-lg backdrop-blur-md">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Zero Web Scraping & 100% Policy-Compliant Architecture
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              SocialFlow never automates unauthorized headless browser clicks or violates platform developer terms. Your account safety is guaranteed through official token grants encrypted with AES-256-GCM at rest.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Meta Partner Verified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                LinkedIn Marketing Developer Approved
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                TikTok Content Posting Certified
              </span>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
