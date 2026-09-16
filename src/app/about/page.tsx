import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Heart, Sparkles, Globe, Lock, Terminal, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const principles = [
    {
      title: "Zero Fake Data Policy",
      desc: "We believe authentic marketing telemetry is non-negotiable. We never simulate vanity numbers or fabricate engagement.",
      icon: ShieldCheck,
    },
    {
      title: "100% Official API Compliance",
      desc: "Zero web scraping or unauthorized automation. We protect brand accounts through official platform partner agreements.",
      icon: Lock,
    },
    {
      title: "Enterprise Multi-Tenant Security",
      desc: "Every workspace is strictly isolated with AES-256-GCM encrypted secrets, role-based authorization, and immutable audits.",
      icon: Terminal,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Mission & Core Values</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Reimagining How Teams <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Manage Social Channels
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              SocialFlow was founded to replace brittle browser plugins and fragmented point solutions with an integrated, enterprise-grade social media control center.
            </p>
          </div>

          {/* Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{p.title}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Team CTA */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-8 sm:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Built for Serious Marketing Teams
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Ready to experience modern multi-channel publishing without the headaches of fake analytics or unreliable queues?
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg" className="gap-2">
                  <span>Start Your Workspace</span>
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
