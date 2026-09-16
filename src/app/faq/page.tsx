import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Sparkles, HelpCircle, ArrowRight } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does SocialFlow work?",
      a: "SocialFlow acts as a centralized mission control for all your social media channels. You connect your brand accounts once using official OAuth 2.0 PKCE authentication. From there, you can compose multi-network posts, schedule campaigns, triage unified inbox comments, and inspect real-time performance analytics without ever sharing passwords.",
    },
    {
      q: "Which platforms are supported?",
      a: "We officially support 8 platforms: LinkedIn (Company Pages & Profiles), Facebook (Pages & Groups), Instagram (Business & Creator accounts), TikTok, X (Twitter API v2), YouTube (Data API v3 for Videos and Shorts), Pinterest (API v5 for Boards & Pins), and Threads (Official API v1).",
    },
    {
      q: "Can I schedule posts for different timezones?",
      a: "Yes. SocialFlow provides an interactive calendar with multi-timezone scheduling. You can target specific posting hours tailored to when your followers on each network are most active.",
    },
    {
      q: "Can multiple people use one workspace?",
      a: "Yes. SocialFlow has enterprise-grade Role-Based Access Control (RBAC). You can invite team members as Owners, Admins, Managers, Editors, Analysts, or Viewers. Editors can draft posts, and Managers or Admins can review and approve them before they are dispatched to networks.",
    },
    {
      q: "How does OAuth work in SocialFlow?",
      a: "When you click 'Connect', you are securely redirected to the social network's official login screen. After approving permissions, an authorization code is sent back to our server and exchanged for a token. All tokens are encrypted at rest using AES-256-GCM symmetric encryption.",
    },
    {
      q: "Can I disconnect accounts at any time?",
      a: "Yes. Disconnecting an account immediately purges the encrypted OAuth access token from our database and stops all background synchronization tasks.",
    },
    {
      q: "How is our data protected?",
      a: "We implement strict multi-tenant isolation where every database query is scoped by workspace ID. In addition, all secret keys, passwords, and tokens are protected by bcryptjs hashing, AES-256-GCM encryption, secure HTTP-only cookies, and an immutable audit log trail.",
    },
    {
      q: "What happens if a social network API is temporarily down?",
      a: "If an external API experiences an outage, SocialFlow catches the platform error safely, flags the post target as FAILED with the exact human-readable error from the platform, and notifies workspace managers so you can retry with a single click once the network recovers.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Everything You Need to Know</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Platform & Architecture <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                FAQ
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Clear, transparent details about our official API connections, security policies, and scheduling infrastructure.
            </p>
          </div>

          <div className="space-y-4 mb-16">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm"
              >
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Still have questions?</h2>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Our engineering and product teams are always happy to help.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/contact">
                <Button variant="primary" size="sm" className="gap-2">
                  <span>Contact Support</span>
                  <ArrowRight className="w-4 h-4" />
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
