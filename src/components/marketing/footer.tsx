"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SocialFlowLogo } from "@/components/brand/logo";
import { SocialPlatformIcon } from "@/components/brand/platform-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/providers";
import {
  ArrowUp,
  Sun,
  Moon,
} from "lucide-react";

export function MarketingFooter() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      showToast("Please enter a valid work or corporate email address", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribed(true);
        showToast(data.message || "Subscribed! You will receive our monthly platform release notes.", "success");
        setEmail("");
      } else {
        showToast(data.error || "Subscription failed. Please check your email and try again.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 20 Core Top-tier social platforms for footer presence (2 balanced rows of 10)
  const footerSocials = [
    // Row 1 (10 Global Social & Video Channels)
    { platform: "facebook", label: "Facebook", href: "https://facebook.com" },
    { platform: "x", label: "X / Twitter", href: "https://x.com" },
    { platform: "instagram", label: "Instagram", href: "https://instagram.com" },
    { platform: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    { platform: "youtube", label: "YouTube", href: "https://youtube.com" },
    { platform: "pinterest", label: "Pinterest", href: "https://pinterest.com" },
    { platform: "tiktok", label: "TikTok", href: "https://tiktok.com" },
    { platform: "threads", label: "Threads", href: "https://threads.net" },
    { platform: "reddit", label: "Reddit", href: "https://reddit.com" },
    { platform: "discord", label: "Discord", href: "https://discord.com" },
    // Row 2 (10 Messaging, Developer & Creator Channels)
    { platform: "whatsapp", label: "WhatsApp", href: "https://whatsapp.com" },
    { platform: "telegram", label: "Telegram", href: "https://telegram.org" },
    { platform: "github", label: "GitHub", href: "https://github.com" },
    { platform: "twitch", label: "Twitch", href: "https://twitch.tv" },
    { platform: "medium", label: "Medium", href: "https://medium.com" },
    { platform: "snapchat", label: "Snapchat", href: "https://snapchat.com" },
    { platform: "spotify", label: "Spotify", href: "https://spotify.com" },
    { platform: "tumblr", label: "Tumblr", href: "https://tumblr.com" },
    { platform: "dribbble", label: "Dribbble", href: "https://dribbble.com" },
    { platform: "behance", label: "Behance", href: "https://behance.net" },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A13] text-slate-600 dark:text-slate-400 relative transition-colors duration-200">
      {/* Back to Top Floating Action */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group backdrop-blur-md flex items-center gap-2 border border-indigo-400/30 text-xs font-bold"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline">Back to Top</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
              <SocialFlowLogo size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-sm">
              SocialFlow is an all-in-one social media management platform built to help creators, agencies, and businesses create, schedule, analyze and grow across 32 global networks.
            </p>

            {/* Supported Social Networks (2 Equal Rows of 10) */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 block mb-2.5">
                Supported Social Networks
              </span>
              <div className="space-y-1.5 max-w-sm">
                {/* Row 1: 10 Major Social Networks */}
                <div className="grid grid-cols-10 gap-1.5">
                  {footerSocials.slice(0, 10).map((s) => (
                    <a
                      key={s.platform}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Connect on ${s.label}`}
                      title={`Connect on ${s.label}`}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.12] hover:scale-115 hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center group aspect-square"
                    >
                      <SocialPlatformIcon platform={s.platform} size="sm" className="group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>

                {/* Row 2: 10 Messaging & Creator Platforms */}
                <div className="grid grid-cols-10 gap-1.5">
                  {footerSocials.slice(10, 20).map((s) => (
                    <a
                      key={s.platform}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Connect on ${s.label}`}
                      title={`Connect on ${s.label}`}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.12] hover:scale-115 hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center group aspect-square"
                    >
                      <SocialPlatformIcon platform={s.platform} size="sm" className="group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Stay Ahead Newsletter Subscription */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 block mb-1">
                Stay Ahead
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                Subscribe to our weekly social growth and algorithm breakdown newsletter.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email..."
                  disabled={isSubmitting}
                  required
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20 whitespace-nowrap"
                >
                  {isSubmitting ? "Subscribing..." : subscribed ? "Subscribed!" : "Subscribe to Updates"}
                </Button>
              </form>
            </div>
          </div>

          {/* Product Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Product
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Core Features
                </Link>
              </li>
              <li>
                <Link href="/platforms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Platform Marketplace
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Plans & Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Content Calendar
                </Link>
              </li>
              <li>
                <Link href="/inbox" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Smart Inbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About SocialFlow
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Careers & Press
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Contact Sales
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-1 group">
                  Client Sign In <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Resources
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Security & Compliance
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p>© {new Date().getFullYear()} SocialFlow Inc. All rights reserved.</p>
            <span className="hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (99.99%)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-medium">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle color theme"
              className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Security & Compliance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
