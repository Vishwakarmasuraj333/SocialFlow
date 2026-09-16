"use client";

import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24 lg:pt-36 lg:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Last updated: September 2026 • Version 2.4
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
              <p>
                By creating a SocialFlow workspace or using our platform, you agree to comply with these Terms of Service and all applicable developer terms of the connected social platforms (Meta, X, LinkedIn, YouTube, TikTok, etc.).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Acceptable Use & Content Guidelines</h2>
              <p>
                You agree not to use SocialFlow for spamming, distributing malicious payloads, or publishing content that violates third-party platform community standards or copyright laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. API Rate Limits & Availability</h2>
              <p>
                SocialFlow dispatches publishing calls subject to official network rate limits. While our system guarantees 99.99% core uptime, third-party network API maintenance or temporary outages are beyond our direct control.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Subscription, Workspaces & Governance</h2>
              <p>
                Organization workspaces are governed by their designated Workspace Owners. Workspace Owners maintain full administrative authority to add, modify, or revoke member permissions.
              </p>
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
