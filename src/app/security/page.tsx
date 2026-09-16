"use client";

import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  UserCheck,
  FileCheck,
  RefreshCw,
  Eye,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: Lock,
      title: "AES-256-GCM Token Encryption",
      desc: "All OAuth 2.0 access and refresh tokens are encrypted at rest using industry-standard AES-256-GCM cipher with unique initialization vectors.",
    },
    {
      icon: Key,
      title: "Official OAuth 2.0 PKCE",
      desc: "Strict Proof Key for Code Exchange (PKCE) flow prevents authorization code interception attacks and eliminates the need to store static account passwords.",
    },
    {
      icon: Server,
      title: "Workspace Tenant Isolation",
      desc: "Database queries are strictly scoped by workspace context at the ORM layer, ensuring complete cryptographic and logical multi-tenant isolation.",
    },
    {
      icon: UserCheck,
      title: "Granular Role-Based Access (RBAC)",
      desc: "Four built-in authority tiers (Owner, Admin, Editor, Viewer) restrict who can publish, approve, connect channels, or manage billing.",
    },
    {
      icon: FileCheck,
      title: "Immutable Audit Logging",
      desc: "Every critical action—including token refreshes, account disconnections, post publications, and role changes—is permanently recorded with actor telemetry.",
    },
    {
      icon: RefreshCw,
      title: "Automated Token Rotation & Revocation",
      desc: "Expiring OAuth tokens are automatically refreshed via background cron jobs, and instant one-click revocation disconnects compromised credentials immediately.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24 lg:pt-36 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise-Grade Security Architecture</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Zero Compromise on <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Token & Data Protection
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              SocialFlow connects exclusively through verified official developer APIs. We enforce strict end-to-end token encryption, workspace isolation, and zero web-scraping.
            </p>
          </div>

          {/* Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {securityPillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-xs hover:shadow-lg transition-all space-y-3"
                >
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Compliance & Guarantees Section */}
          <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Official Platform API Compliance & Standards
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike legacy tools that rely on fragile browser automation or headless scrapers, SocialFlow adheres 100% to Meta Graph API, X Developer API v2, LinkedIn Share v2, and YouTube Data API v3 policies. Your brand accounts are completely immune to password leakage or unauthorized scraping penalties.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Browser Scraping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>TLS 1.3 Transport Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant Credential Revocation</span>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-16 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Have custom enterprise compliance requirements?</h3>
            <div className="flex items-center justify-center gap-3">
              <Link href="/contact">
                <Button variant="outline" className="rounded-xl text-xs font-semibold">
                  Contact Security Team
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-indigo-600/20">
                  <span>Start Free Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
