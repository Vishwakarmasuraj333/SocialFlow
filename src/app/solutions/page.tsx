import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles, Building2, User, Users, Briefcase } from "lucide-react";

export default function SolutionsPage() {
  const personas = [
    {
      id: "creators",
      title: "Content Creators & Influencers",
      badge: "Solo & Creator Teams",
      icon: User,
      desc: "Amplify your personal brand across 8 networks with zero context-switching.",
      benefits: [
        "One-click multi-posting to YouTube Shorts, Instagram Reels, and TikTok",
        "Unified inbox for comments across all active videos and posts",
        "Audience growth and best-time-to-post intelligence",
        "Media vault with instant cloud asset retrieval",
      ],
    },
    {
      id: "businesses",
      title: "Small & Mid-Sized Businesses",
      badge: "Brand Growth",
      icon: Building2,
      desc: "Turn social media from a time sink into a reliable customer acquisition channel.",
      benefits: [
        "Plan your entire monthly editorial calendar in under an hour",
        "Never miss high-intent customer inquiries in the unified inbox",
        "Campaign-level tracking with UTM tagging for website conversions",
        "Clean executive performance summaries for founders and leadership",
      ],
    },
    {
      id: "agencies",
      title: "Marketing & Digital Agencies",
      badge: "Multi-Client Management",
      icon: Briefcase,
      desc: "Manage multiple client workspaces with strict tenant isolation and approval workflows.",
      benefits: [
        "Multi-tenant workspace isolation (zero cross-client data leakage)",
        "Client draft review & approval portal with internal feedback notes",
        "Granular role-based permissions (Editor, Manager, Client Viewer)",
        "White-labeled CSV & performance exports ready for client meetings",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise Social Media Teams",
      badge: "Enterprise Security & Scale",
      icon: Users,
      desc: "Maintain brand compliance, auditability, and governance across global marketing teams.",
      benefits: [
        "Hardware-grade AES-256-GCM token encryption and immutable audit logs",
        "6-tier RBAC authorization model with custom role provisioning",
        "Dedicated superadmin system health monitoring and SLA guarantees",
        "SSO, SAML architecture, and dedicated onboarding support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Solutions</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Purpose-Built for <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Every Growth Stage
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Discover how SocialFlow empowers creators, agencies, and enterprises to scale their audience and brand engagement.
            </p>
          </div>

          {/* Persona Solutions */}
          <div className="space-y-12 mb-16">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  id={p.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start justify-between"
                >
                  <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.badge}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{p.title}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{p.desc}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {p.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                    <Link href="/register">
                      <Button variant="primary" className="w-full md:w-auto gap-2">
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" className="w-full md:w-auto text-xs">
                        View Pricing Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
