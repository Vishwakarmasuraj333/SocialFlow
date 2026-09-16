import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { SocialPlatformIcon } from "@/components/brand/platform-icons";
import {
  Send,
  Calendar,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Globe
} from "lucide-react";

export default function FeaturesPage() {
  const sections = [
    {
      id: "publishing",
      title: "Universal Multi-Target Publishing Engine",
      subtitle: "Author once, customize per network, and eliminate copy-paste chaos.",
      icon: Send,
      badge: "Publishing Studio",
      points: [
        "Dynamic character counters for Twitter/X (280), LinkedIn (3,000), and Threads (500)",
        "Live interactive desktop and mobile native previews for LinkedIn, X, and Instagram",
        "Per-network caption overrides without rewriting the global post message",
        "Multi-image carousel and direct HD video attachment validations",
        "Automatic link preview scraping and UTM parameter injection",
      ],
      mockVisual: (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4 text-xs font-mono text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-indigo-400 font-bold">Studio Composer v2.0</span>
            <span className="text-emerald-400">● Live Validation Active</span>
          </div>
          <p className="text-slate-400 font-sans text-xs">
            "Excited to announce our new Q3 enterprise features! Check out the product breakdown below."
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <SocialPlatformIcon platform="linkedin" size="xs" />
                <span className="text-slate-400">LinkedIn</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono">82/3k</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <SocialPlatformIcon platform="x" size="xs" />
                <span className="text-slate-400">X / Twitter</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono">82/280</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <SocialPlatformIcon platform="instagram" size="xs" />
                <span className="text-slate-400">Instagram</span>
              </div>
              <span className="text-amber-400 font-bold font-mono">Needs Reel</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "calendar",
      title: "Interactive Content Calendar & Scheduler",
      subtitle: "Visualize your multi-platform cadence across days, weeks, and months.",
      icon: Calendar,
      badge: "Smart Scheduling",
      points: [
        "Drag-and-drop rescheduling across monthly and weekly calendar grids",
        "Multi-timezone automated dispatch matching your audience peak activity hours",
        "Visual color-coded tags for campaigns, authors, and approval statuses",
        "Queue-based automated backfill slots for recurring editorial series",
      ],
      mockVisual: (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-semibold text-white">September 2026</span>
            <span className="text-indigo-400 font-mono">14 Scheduled</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            {["Mon 14", "Tue 15", "Wed 16", "Thu 17"].map((d, i) => (
              <div key={i} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-slate-500 font-bold">{d}</span>
                <div className="p-1 rounded bg-indigo-950/60 border border-indigo-900/60 text-indigo-300 truncate flex items-center gap-1">
                  <SocialPlatformIcon platform="linkedin" size="xs" />
                  <span className="truncate">Product Launch</span>
                </div>
                {i % 2 === 0 && (
                  <div className="p-1 rounded bg-pink-950/60 border border-pink-900/60 text-pink-300 truncate flex items-center gap-1">
                    <SocialPlatformIcon platform="instagram" size="xs" />
                    <span className="truncate">Feature Reel</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "inbox",
      title: "Unified Omnichannel Inbox",
      subtitle: "Turn social noise into customer conversations and resolved tickets.",
      icon: MessageSquare,
      badge: "Real-Time Inbox",
      points: [
        "Aggregates comments, DMs, mentions, and reviews from all 8 connected networks",
        "Live two-way direct reply dispatching directly through official platform APIs",
        "Status resolution workflow (Open, Pending, Resolved, Archived)",
        "Internal team assignment and private collaboration notes per message",
      ],
      mockVisual: (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="font-semibold text-white">Live Conversation Stream</span>
            <span className="text-emerald-400 font-mono text-[10px]">● 3 Unread</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="text-indigo-400 font-semibold">@alex_creator (LinkedIn)</span>
                <span>2m ago</span>
              </div>
              <p className="text-slate-300 text-xs">"Does SocialFlow support team approval workflows?"</p>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Assigned to Manager
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      title: "Authentic Telemetry & Performance Reports",
      subtitle: "Zero simulated metrics. Real historical math for true ROI visibility.",
      icon: BarChart3,
      badge: "Zero Fake Data",
      points: [
        "Period-over-period comparison (Current 30d vs Previous 30d) across reach & clicks",
        "Per-post attribution tracking top performing content by net engagements",
        "Audience growth trajectories across LinkedIn, Facebook, Instagram, TikTok & X",
        "One-click CSV data export for spreadsheet modeling and client reporting",
      ],
      mockVisual: (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-white font-semibold">Performance Aggregation</span>
            <span className="text-indigo-400 font-mono text-[10px]">CSV Ready</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">Total Net Impressions</span>
              <p className="text-base font-bold text-white mt-0.5">148,920</p>
              <span className="text-[10px] text-emerald-400">+22.4% vs prev</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">Avg. Click Rate</span>
              <p className="text-base font-bold text-white mt-0.5">3.41%</p>
              <span className="text-[10px] text-emerald-400">+0.8% vs prev</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities Overview</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Built for High-Velocity <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Social Media Execution
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Explore the complete suite of publishing, analytics, collaboration, and inbox tools engineered into SocialFlow.
          </p>
        </div>

        {/* Deep Dive Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            const isEven = idx % 2 === 0;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  isEven ? "" : "lg:grid-flow-dense"
                }`}
              >
                <div className={`lg:col-span-7 space-y-6 ${isEven ? "" : "lg:col-start-6"}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Icon className="w-4 h-4" />
                    <span>{sec.badge}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {sec.title}
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.subtitle}
                  </p>
                  <ul className="space-y-3 pt-2">
                    {sec.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link href="/register">
                      <Button variant="primary" className="gap-2">
                        <span>Try This Feature</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className={`lg:col-span-5 ${isEven ? "" : "lg:col-start-1"}`}>
                  <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-slate-200 dark:border-slate-800 shadow-xl">
                    {sec.mockVisual}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
