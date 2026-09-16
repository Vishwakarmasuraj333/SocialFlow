"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: "Free Starter",
      desc: "Essential tools for solo creators and individuals testing their social reach.",
      priceMonthly: 0,
      priceAnnual: 0,
      badge: "Free Forever",
      popular: false,
      cta: "Start Free",
      href: "/register",
      features: [
        "Up to 3 connected social accounts",
        "30 scheduled posts per month",
        "Universal 3-column Studio Composer",
        "7 days of basic analytics history",
        "1 workspace member (Owner)",
        "Standard community support",
      ],
    },
    {
      name: "Professional",
      desc: "For growing creators and professional marketers scaling their channels.",
      priceMonthly: 29,
      priceAnnual: 24,
      badge: "Most Popular",
      popular: true,
      cta: "Start 14-Day Pro Trial",
      href: "/register?plan=pro",
      features: [
        "Up to 10 connected social accounts",
        "Unlimited scheduled posts",
        "Interactive monthly & list calendar",
        "Unified inbox for comments & DMs",
        "90 days of authentic historical analytics",
        "3 workspace team members",
        "Campaign management & tagging",
        "Priority email support",
      ],
    },
    {
      name: "Business Agency",
      desc: "Advanced multi-tenant workspaces and approval pipelines for agencies and teams.",
      priceMonthly: 79,
      priceAnnual: 64,
      badge: "For Agencies",
      popular: false,
      cta: "Start Business Trial",
      href: "/register?plan=business",
      features: [
        "Up to 25 connected social accounts",
        "Multi-tier agency approval workflows",
        "Unlimited historical analytics retention",
        "Executive CSV & PDF performance exports",
        "10 workspace team members with custom RBAC",
        "Media asset vault with folder tagging",
        "Dedicated workspace switcher",
        "24/7 priority support",
      ],
    },
    {
      name: "Enterprise",
      desc: "Maximum security, custom integrations, dedicated infrastructure and SLA.",
      priceMonthly: 249,
      priceAnnual: 199,
      badge: "Enterprise Security",
      popular: false,
      cta: "Contact Enterprise Sales",
      href: "/contact?tier=enterprise",
      features: [
        "Unlimited social channel connections",
        "Custom workspace and role provisioning",
        "Hardware-level AES-256-GCM token storage",
        "Custom OAuth application configuration",
        "Full immutable security audit log explorer",
        "Dedicated superadmin system health monitoring",
        "Custom SLA guarantees & SAML/SSO",
        "Dedicated customer success manager",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent, Predictable Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Simple Plans for <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Every Social Operation
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Zero hidden fees. Zero fake metrics. All plans backed by real official API integrations.
            </p>

            {/* Annual / Monthly Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !annual
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  annual
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500 text-white font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {tiers.map((tier) => {
              const currentPrice = annual ? tier.priceAnnual : tier.priceMonthly;
              return (
                <div
                  key={tier.name}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    tier.popular
                      ? "border-2 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xl shadow-indigo-500/10 scale-105"
                      : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {tier.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">
                      {tier.desc}
                    </p>

                    <div className="my-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                          ${currentPrice}
                        </span>
                        <span className="text-xs text-slate-500">/ workspace / month</span>
                      </div>
                      {annual && tier.priceAnnual > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Billed annually (${tier.priceAnnual * 12}/yr)
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link href={tier.href}>
                      <Button
                        variant={tier.popular ? "primary" : "outline"}
                        className="w-full justify-center text-xs"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Footer */}
          <div className="text-center text-xs text-slate-500 max-w-xl mx-auto">
            Need custom volume or dedicated database isolation? <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Talk to our solutions engineering team</Link>.
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
