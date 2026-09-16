"use client";

import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24 lg:pt-36 lg:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Legal & Privacy
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Last updated: September 2026 • Version 2.4
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Introduction & Zero Web-Scraping Commitment</h2>
              <p>
                SocialFlow (“we”, “our”, or “us”) provides enterprise-grade social media management infrastructure. We connect to third-party social networks solely through official developer partner APIs (Meta Graph API, X API v2, LinkedIn API, YouTube Data API, etc.). We never employ web-scraping, headless browsers, or unauthorized credential interception.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
              <p>
                We collect information provided directly by you when creating an organization workspace, including your name, work email address, hashed authentication credentials, and official OAuth tokens granted during channel authorization.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. OAuth Token Security & Encryption</h2>
              <p>
                All access and refresh tokens returned by social network authorization flows are encrypted at rest using AES-256-GCM. Tokens are decrypted only in memory during authorized publishing or telemetry fetching jobs.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Data Isolation & Multi-Tenancy</h2>
              <p>
                Your content drafts, published logs, media files, and analytics are isolated per workspace. We do not sell, rent, or trade your social data to advertisers or data brokers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Token Revocation & Data Deletion</h2>
              <p>
                You may disconnect any social account at any time via the Connected Accounts panel. Disconnecting an account immediately purges the corresponding encrypted tokens from our database and invalidates local synchronization.
              </p>
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
