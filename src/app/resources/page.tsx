"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { SocialPlatformIcon } from "@/components/brand/platform-icons";
import {
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
  ArrowLeft,
  Key,
  Layers,
  Cpu,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function ResourcesPage() {
  const docs = [
    {
      title: "OAuth 2.0 Integration Guides",
      desc: "Step-by-step developer guides for setting up Meta, LinkedIn, X, TikTok, and YouTube developer apps.",
      icon: ShieldCheck,
      tag: "Developer Docs",
      image: "/images/docs/oauth-guides.jpg",
      href: "/admin/integrations",
      platforms: ["meta", "linkedin", "x", "tiktok", "youtube"],
      features: [
        "Granular token scopes & refresh pipelines",
        "Encrypted AES-256 secret vault",
        "One-click OAuth callback handlers",
      ],
      badgeColor: "from-blue-500 to-indigo-600",
    },
    {
      title: "API Reference & SDK",
      desc: "Complete REST API specifications for publishing, calendar scheduling, inbox synchronization, and analytics webhooks.",
      icon: Code2,
      tag: "API v1.0",
      image: "/images/docs/api-sdk.jpg",
      href: "/admin/integrations",
      platforms: ["instagram", "facebook", "linkedin", "x"],
      features: [
        "OpenAPI 3.1 & Postman collection export",
        "Streaming webhooks with SHA256 signatures",
        "TypeScript, Python, and Go official SDKs",
      ],
      badgeColor: "from-purple-500 to-pink-600",
    },
    {
      title: "Agency Playbook & RBAC Best Practices",
      desc: "Architecting multi-tenant client workspaces, role delegation, and post review workflows.",
      icon: BookOpen,
      tag: "Best Practices",
      image: "/images/docs/agency-playbook.jpg",
      href: "/team",
      platforms: ["threads", "pinterest", "reddit", "discord"],
      features: [
        "Role hierarchy (Owner, Admin, Editor, Client)",
        "Audit logging for publishing approvals",
        "White-label client reporting & domain mapping",
      ],
      badgeColor: "from-emerald-500 to-teal-600",
    },
    {
      title: "Automated Scheduler & Cron Architecture",
      desc: "Deep dive into background job scheduling, rate limit backoff, and idempotent dispatch guarantees.",
      icon: Terminal,
      tag: "Engineering",
      image: "/images/docs/cron-scheduler.jpg",
      href: "/publishing",
      platforms: ["youtube", "tiktok", "spotify", "telegram"],
      features: [
        "Distributed queue with Redis & BullMQ",
        "Exponential backoff & dynamic rate-limit retry",
        "Sub-millisecond timezone dispatch accuracy",
      ],
      badgeColor: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A13] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <MarketingNavbar />

      <main className="flex-1 pt-28 pb-24 relative overflow-hidden">
        {/* Ambient Top Glow & Grid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/10 blur-[130px] -z-10 rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Back Navigation Bar */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-xs hover:-translate-x-0.5 transition-all duration-200 group backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-white/90 dark:bg-indigo-500/10 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Developer & Knowledge Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Resources & Technical <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Technical guides, API specifications, and architectural documentation for SocialFlow developers and teams.
            </p>
          </div>

          {/* 4 Rich Documentation Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {docs.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-white/[0.03] backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Generated Illustration Card Image Header */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-950">
                    <img
                      src={d.image}
                      alt={d.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Tag Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{d.tag}</span>
                      </span>
                    </div>

                    {/* Connected Social Badges */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
                      {d.platforms.map((p) => (
                        <div
                          key={p}
                          className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xs"
                        >
                          <SocialPlatformIcon platform={p} size="xs" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {d.title}
                      </h2>
                      <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        {d.desc}
                      </p>

                      {/* Feature Bullet Points */}
                      <div className="mt-5 space-y-2">
                        {d.features.map((feat) => (
                          <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 pt-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                      <Link href={d.href} className="w-full">
                        <Button
                          variant="ghost"
                          className="w-full justify-between rounded-xl py-3 px-4 bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white font-bold text-xs sm:text-sm transition-all group-hover:shadow-md cursor-pointer"
                        >
                          <span>Explore Documentation</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Back & Navigation Action Bar */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Need customized API endpoints or enterprise webhooks?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Our engineering team provides dedicated webhook SLAs and custom tenant connectors.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold text-xs sm:text-sm">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20">
                  <span>Contact Engineers</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
