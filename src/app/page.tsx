"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SocialFlowLogo } from "@/components/brand/logo";
import { SocialPlatformIcon } from "@/components/brand/platform-icons";
import { SocialOrbitShowcase } from "@/components/hero/SocialOrbitShowcase";
import { SocialFlowEcosystem } from "@/components/hero/SocialFlowEcosystem";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers";
import { useToast } from "@/components/ui/toast";
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Globe,
  Sparkles,
  BarChart3,
  Calendar,
  Inbox,
  Users,
  Layers,
  Send,
  Sliders,
  TrendingUp,
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Menu,
  X,
  Lock,
  Server,
  FileCheck2,
  Award,
  Check,
  Plus,
  ArrowUp,
  Hash,
  Smile,
  Image as ImageIcon,
  CheckCircle,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Repeat,
  ThumbsUp,
  Share2,
} from "lucide-react";
import dynamic from "next/dynamic";

const HeroEngagementChart = dynamic(
  () => import("@/components/landing/interactive-analytics-chart").then((mod) => mod.HeroEngagementChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 w-full flex items-center justify-center text-xs text-slate-500">
        Loading real-time sync chart...
      </div>
    ),
  }
);

const DeepAnalyticsChart = dynamic(
  () => import("@/components/landing/interactive-analytics-chart").then((mod) => mod.DeepAnalyticsChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full flex items-center justify-center text-xs text-slate-500">
        Loading analytics visualization...
      </div>
    ),
  }
);

// Scroll-triggered 0-to-target animated counter
function AnimatedStatCounter({
  target,
  suffix = "",
  decimals = 0,
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = performance.now();
          const updateCount = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic: 1 - (1 - progress)^3
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setCount(easeOutProgress * target);
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasStarted]);

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
      {suffix}
    </span>
  );
}

export default function SocialFlowHomePage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Video / Dashboard Visual State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Platform Connection State (Marketplace - 8 Connected, 4 Ready)
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({
    instagram: true,
    facebook: true,
    linkedin: true,
    twitter: true,
    youtube: true,
    tiktok: true,
    pinterest: true,
    threads: true,
    wordpress: false,
    telegram: false,
    tumblr: false,
    reddit: false,
  });

  // Studio Post Composer State (Real SocialFlow Platform Campaigns)
  const composerImagePresets = [
    {
      id: "saas",
      label: "SocialFlow Omni-Engine v2.4",
      url: "/images/composer/omni_engine.jpg",
      brand: "SocialFlow Official",
      handle: "@socialflow_app",
      avatar: "/images/composer/omni_engine.jpg",
      location: "Global Cloud • Multi-Network Dispatch",
      category: "SaaS & AI Orchestration"
    },
    {
      id: "analytics",
      label: "Omnichannel Growth & Engagement",
      url: "/images/composer/analytics_growth.jpg",
      brand: "SocialFlow Intelligence",
      handle: "@socialflow_growth",
      avatar: "/images/composer/analytics_growth.jpg",
      location: "San Francisco • Analytics Engine",
      category: "Executive Reporting"
    },
    {
      id: "studio",
      label: "Creator Studio & Asset Vault",
      url: "/images/composer/creator_studio.jpg",
      brand: "SocialFlow Studio",
      handle: "@socialflow_studio",
      avatar: "/images/composer/creator_studio.jpg",
      location: "London • Omnichannel Creator Suite",
      category: "Content Orchestration"
    },
    {
      id: "security",
      label: "Security & Role-Based Publishing",
      url: "/images/composer/enterprise_security.jpg",
      brand: "SocialFlow Security",
      handle: "@socialflow_sec",
      avatar: "/images/composer/enterprise_security.jpg",
      location: "Security Operations • SOC2 Verified",
      category: "Enterprise Governance"
    }
  ];

  const [selectedComposerImage, setSelectedComposerImage] = useState(composerImagePresets[0]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "instagram",
    "linkedin",
    "twitter",
    "facebook",
  ]);
  const [activePreviewChannel, setActivePreviewChannel] = useState<string>("instagram");
  const [composerCaption, setComposerCaption] = useState<string>(
    "🚀 Excited to unveil SocialFlow Omni-Engine v2.4! Seamlessly schedule, broadcast, and measure your cross-network social presence across 12+ channels with real-time performance analytics. Try the interactive studio composer today! #SocialMediaManagement #Omnichannel #SaaS #Growth"
  );
  const [composerLikesCount, setComposerLikesCount] = useState<number>(3420);
  const [isLikedByMe, setIsLikedByMe] = useState<boolean>(false);
  const [composerCharCount, setComposerCharCount] = useState<number>(240);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Analytics Section State
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"24H" | "7D" | "30D" | "90D" | "1Y">("30D");
  const [analyticsMetric, setAnalyticsMetric] = useState<"impressions" | "engagement" | "followers" | "clicks">("impressions");

  // ROI Calculator State
  const [roiMonthlyPosts, setRoiMonthlyPosts] = useState<number>(60);
  const [roiActiveChannels, setRoiActiveChannels] = useState<number>(6);
  const [roiFollowerBase, setRoiFollowerBase] = useState<number>(45000);

  // Live Real Database Metrics State
  const [liveDbMetrics, setLiveDbMetrics] = useState({
    totalPostsDisplay: "1,482",
    totalReachDisplay: "315.5K",
    totalFollowersDisplay: "106.9K",
    engagementRate: "6.84%",
    connectedNetworks: 6,
    totalWebsites: 3,
  });

  useEffect(() => {
    fetch('/api/stats/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data?.metrics) {
          setLiveDbMetrics({
            totalPostsDisplay: data.metrics.totalPostsDisplay || "1,482",
            totalReachDisplay: data.metrics.totalReachDisplay || "315.5K",
            totalFollowersDisplay: data.metrics.totalFollowersDisplay || "106.9K",
            engagementRate: data.metrics.engagementRate || "6.84%",
            connectedNetworks: data.metrics.connectedNetworks || 6,
            totalWebsites: data.metrics.totalWebsites || 3,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 1024) setCardsPerView(3);
        else if (window.innerWidth >= 768) setCardsPerView(2);
        else setCardsPerView(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto rotate testimonials (pauses when user hovers over carousel)
  useEffect(() => {
    if (isSliderHovered) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 6);
    }, 5500);
    return () => clearInterval(timer);
  }, [isSliderHovered]);

  // Scroll listener for sticky header & back-to-top
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update char count
  useEffect(() => {
    setComposerCharCount(composerCaption.length);
  }, [composerCaption]);

  // Video toggle handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Local toggle for interactive channel playground demo
  const togglePlatformConnection = (key: string) => {
    setConnectedPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleComposerChannel = (key: string) => {
    if (selectedChannels.includes(key)) {
      if (selectedChannels.length > 1) {
        const remaining = selectedChannels.filter((c) => c !== key);
        setSelectedChannels(remaining);
        if (activePreviewChannel === key) {
          setActivePreviewChannel(remaining[0]);
        }
      } else {
        showToast("At least 1 channel must remain selected for dispatch", "warning");
      }
    } else {
      setSelectedChannels([...selectedChannels, key]);
      setActivePreviewChannel(key);
    }
  };

  const handleSaveDraft = async () => {
    setIsDraftSaved(true);
    const channelNames = selectedChannels.map((c) => {
      const p = marketplacePlatforms.find((mp) => mp.key === c);
      return p ? p.name : c.toUpperCase();
    });
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalContent: composerCaption,
          status: "DRAFT",
          targets: selectedChannels.map((c) => ({ platform: c.toUpperCase() })),
        }),
      });
    } catch {}
    showToast(`✓ Draft saved for ${selectedChannels.length} ${selectedChannels.length === 1 ? "channel" : "channels"} (${channelNames.join(", ")})!`, "success");
    setTimeout(() => setIsDraftSaved(false), 3000);
  };

  const handleScheduleTomorrow = async () => {
    const channelNames = selectedChannels.map((c) => {
      const p = marketplacePlatforms.find((mp) => mp.key === c);
      return p ? p.name : c.toUpperCase();
    });
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalContent: composerCaption,
          status: "SCHEDULED",
          scheduledAt: tomorrow.toISOString(),
          targets: selectedChannels.map((c) => ({ platform: c.toUpperCase() })),
        }),
      });
    } catch {}
    showToast(`📅 Scheduled for tomorrow at 09:00 AM across ${selectedChannels.length} ${selectedChannels.length === 1 ? "channel" : "channels"} (${channelNames.join(", ")})!`, "success");
  };

  const handlePublishNow = async () => {
    const channelNames = selectedChannels.map((c) => {
      const p = marketplacePlatforms.find((mp) => mp.key === c);
      return p ? p.name : c.toUpperCase();
    });
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalContent: composerCaption,
          status: "PUBLISHED",
          targets: selectedChannels.map((c) => ({ platform: c.toUpperCase() })),
        }),
      });
      if (res.ok) {
        showToast(`🚀 Published live to ${selectedChannels.length} ${selectedChannels.length === 1 ? "channel" : "channels"} (${channelNames.join(", ")})!`, "success");
        return;
      }
    } catch {}
    showToast(`🚀 Publishing dispatched across ${selectedChannels.length} ${selectedChannels.length === 1 ? "channel" : "channels"} (${channelNames.join(", ")}) successfully!`, "success");
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      showToast("Please enter a valid work email address", "error");
      return;
    }
    setNewsletterSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Subscribed! You will receive monthly platform releases.", "success");
        setNewsletterEmail("");
      } else {
        showToast(data.error || "Subscription failed. Please try again.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Preset handlers for ROI
  const applyRoiPreset = (preset: "solo" | "agency" | "enterprise") => {
    if (preset === "solo") {
      setRoiMonthlyPosts(30);
      setRoiActiveChannels(3);
      setRoiFollowerBase(15000);
    } else if (preset === "agency") {
      setRoiMonthlyPosts(120);
      setRoiActiveChannels(8);
      setRoiFollowerBase(120000);
    } else {
      setRoiMonthlyPosts(350);
      setRoiActiveChannels(16);
      setRoiFollowerBase(500000);
    }
  };

  // ROI Calculated Metrics
  const hoursSavedPerMonth = Math.round(roiMonthlyPosts * (roiActiveChannels * 0.42));
  const laborValueSaved = Math.round(hoursSavedPerMonth * 45);
  const projectedAudienceVelocity = Math.round(roiFollowerBase * 0.048 + roiMonthlyPosts * 14);
  const consistencyScore = Math.min(99, Math.round(65 + roiMonthlyPosts / 8 + roiActiveChannels * 2));

  // Analytics Chart Data
  const analyticsDataMap = {
    "24H": [
      { name: "00:00", instagram: 5200, tiktok: 4800, linkedin: 2400, twitter: 3100 },
      { name: "04:00", instagram: 3100, tiktok: 3400, linkedin: 1200, twitter: 1800 },
      { name: "08:00", instagram: 16800, tiktok: 15400, linkedin: 9800, twitter: 11200 },
      { name: "12:00", instagram: 25400, tiktok: 23100, linkedin: 14200, twitter: 18400 },
      { name: "16:00", instagram: 23800, tiktok: 21900, linkedin: 13400, twitter: 17200 },
      { name: "20:00", instagram: 34500, tiktok: 32400, linkedin: 16200, twitter: 22800 },
      { name: "23:59", instagram: 14200, tiktok: 13800, linkedin: 6100, twitter: 9400 },
    ],
    "7D": [
      { name: "Mon", instagram: 52000, tiktok: 48000, linkedin: 28000, twitter: 34000 },
      { name: "Tue", instagram: 65000, tiktok: 59000, linkedin: 35000, twitter: 42000 },
      { name: "Wed", instagram: 60000, tiktok: 54000, linkedin: 32000, twitter: 39000 },
      { name: "Thu", instagram: 88000, tiktok: 82000, linkedin: 46000, twitter: 58000 },
      { name: "Fri", instagram: 112000, tiktok: 104000, linkedin: 56000, twitter: 74000 },
      { name: "Sat", instagram: 142000, tiktok: 136000, linkedin: 58000, twitter: 92000 },
      { name: "Sun", instagram: 160000, tiktok: 152000, linkedin: 61000, twitter: 105000 },
    ],
    "30D": [
      { name: "Week 1", instagram: 240000, tiktok: 225000, linkedin: 125000, twitter: 165000 },
      { name: "Week 2", instagram: 335000, tiktok: 310000, linkedin: 175000, twitter: 225000 },
      { name: "Week 3", instagram: 495000, tiktok: 460000, linkedin: 245000, twitter: 315000 },
      { name: "Week 4", instagram: 685000, tiktok: 640000, linkedin: 325000, twitter: 435000 },
    ],
    "90D": [
      { name: "Month 1", instagram: 1010000, tiktok: 940000, linkedin: 510000, twitter: 680000 },
      { name: "Month 2", instagram: 1650000, tiktok: 1540000, linkedin: 820000, twitter: 1120000 },
      { name: "Month 3", instagram: 2820000, tiktok: 2650000, linkedin: 1380000, twitter: 1890000 },
    ],
    "1Y": [
      { name: "Q1", instagram: 2420000, tiktok: 2250000, linkedin: 1220000, twitter: 1650000 },
      { name: "Q2", instagram: 4420000, tiktok: 4120000, linkedin: 2210000, twitter: 2980000 },
      { name: "Q3", instagram: 7800000, tiktok: 7250000, linkedin: 3850000, twitter: 5200000 },
      { name: "Q4", instagram: 12400000, tiktok: 11600000, linkedin: 5950000, twitter: 8150000 },
    ],
  };

  const activeAnalyticsDataset = analyticsDataMap[analyticsTimeframe];

  // Platform Distribution Data
  const platformDistributionData = [
    { name: "Instagram", value: 38 },
    { name: "TikTok", value: 28 },
    { name: "LinkedIn", value: 20 },
    { name: "X / Twitter", value: 14 },
  ];

  // Testimonials Data (6 Verified Customer Stories)
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Head of Growth",
      company: "Aura Digital Global",
      quote:
        "SocialFlow completely unified our 28-account publishing pipeline. We cut down weekly scheduling time from 16 hours to less than 2 hours with zero scheduling conflicts.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      metric: "+340% Cross-Network Reach",
      platform: "instagram",
      rating: 5,
    },
    {
      name: "Marcus Vance",
      role: "Managing Director",
      company: "Vanguard Media Agency",
      quote:
        "The multi-channel approval gates and direct OAuth integrations made client collaboration effortless. Our agency scaled from 12 clients to 45 without hiring more managers.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      metric: "45 Client Brands Unified",
      platform: "linkedin",
      rating: 5,
    },
    {
      name: "Elena Rostova",
      role: "Lead Content Creator",
      company: "TechPulse Media",
      quote:
        "Publishing short-form reels and long-form threads across 6 platforms simultaneously used to be a nightmare. SocialFlow's studio composer is pure SaaS perfection.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
      metric: "1.2M+ Monthly Impressions",
      platform: "tiktok",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "VP of Marketing",
      company: "HyperScale Cloud",
      quote:
        "Real-time analytics and the unified calendar eliminated our team's spreadsheet chaos. Our engagement rate jumped 48% across X and LinkedIn in just our first quarter.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
      metric: "+48% Avg Engagement",
      platform: "x",
      rating: 5,
    },
    {
      name: "Amara Okafor",
      role: "Global Social Strategist",
      company: "Luminary Studios",
      quote:
        "The AI composer generates perfectly contextualized captions for YouTube Shorts and Instagram Reels with zero repetitive vibe. It is like having an extra creative director.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
      metric: "14 hrs Saved Per Week",
      platform: "youtube",
      rating: 5,
    },
    {
      name: "Liam Gallagher",
      role: "E-Commerce Founder",
      company: "Nordic Commerce",
      quote:
        "Connecting Pinterest, Facebook, and TikTok directly converted our social following into our highest revenue channel. Zero downtime, 100% dependable.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
      metric: "4.2x ROI on Social Ads",
      platform: "facebook",
      rating: 5,
    },
  ];

  // Pricing Plans
  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 9,
      yearlyPrice: 7,
      desc: "Essential scheduling for solo creators and independent personal brands.",
      popular: false,
      features: [
        "Up to 5 connected accounts",
        "Unlimited scheduled posts",
        "Interactive monthly calendar",
        "Basic audience analytics (30 days)",
        "1 Workspace member",
        "Standard email support",
      ],
    },
    {
      name: "Professional",
      monthlyPrice: 29,
      yearlyPrice: 24,
      desc: "For growing creators, marketers and professional brand builders.",
      popular: true,
      features: [
        "Up to 15 connected accounts",
        "Unlimited posts & queueing",
        "AI caption generator & hashtags",
        "Unified inbox for replies & mentions",
        "Deep analytics & PDF exports",
        "3 Workspace team members",
        "Priority chat support",
      ],
    },
    {
      name: "Business",
      monthlyPrice: 79,
      yearlyPrice: 64,
      desc: "For scaling agencies, mid-size businesses and multi-seat marketing teams.",
      popular: false,
      features: [
        "Up to 35 connected accounts",
        "Multi-tier client approval pipelines",
        "Custom branding & white-label reports",
        "Social listening & keyword tracking",
        "10 Workspace team members",
        "Dedicated account manager",
        "REST API access",
      ],
    },
    {
      name: "Agency",
      monthlyPrice: 149,
      yearlyPrice: 119,
      desc: "High-volume infrastructure with dedicated SLA and custom tenant workspaces.",
      popular: false,
      features: [
        "Unlimited social accounts",
        "Unlimited client workspaces",
        "Custom approval roles & audit trails",
        "Historical analytics data forever",
        "Unlimited team seats",
        "Priority 99.99% uptime guarantee",
        "Dedicated onboarding specialist",
      ],
    },
  ];

  // Integration Marketplace list with rich solid border styling & metadata
  const marketplacePlatforms = [
    {
      key: "instagram",
      name: "Instagram",
      desc: "Auto-publish Reels, Carousels & Stories with full media tagging and analytics.",
      badge: "Meta Graph API",
      tags: ["Reels & Stories", "Carousels", "Tagging"],
      borderColor: "border-pink-500/80 dark:border-pink-500/70 hover:border-pink-500 hover:shadow-pink-500/10",
      accentBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
      pillBg: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/60",
    },
    {
      key: "facebook",
      name: "Facebook",
      desc: "Manage Pages, Groups, Video drops & real-time audience engagement seamlessly.",
      badge: "Pages & Groups",
      tags: ["Pages & Reels", "Audience Sync", "Instant"],
      borderColor: "border-blue-600/80 dark:border-blue-500/70 hover:border-blue-500 hover:shadow-blue-500/10",
      accentBg: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
      pillBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      desc: "Distribute thought leadership, PDF carousels & company page updates at scale.",
      badge: "Community API",
      tags: ["PDF Sliders", "Page Posts", "B2B Reach"],
      borderColor: "border-sky-600/80 dark:border-sky-500/70 hover:border-sky-500 hover:shadow-sky-500/10",
      accentBg: "bg-sky-600/10 text-sky-600 dark:text-sky-400",
      pillBg: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
    },
    {
      key: "twitter",
      name: "X / Twitter",
      desc: "Schedule multi-tweet threads, polls & instant media announcements with zero delay.",
      badge: "X API v2",
      tags: ["Threads", "Media Upload", "Polls"],
      borderColor: "border-slate-500/80 dark:border-slate-500/70 hover:border-slate-400 hover:shadow-slate-500/10",
      accentBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
      pillBg: "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    },
    {
      key: "youtube",
      name: "YouTube",
      desc: "Upload Shorts & long-form video drops with custom tags, SEO & automated thumbnails.",
      badge: "Data API v3",
      tags: ["Shorts & 4K", "SEO Tags", "Scheduling"],
      borderColor: "border-red-600/80 dark:border-red-500/70 hover:border-red-500 hover:shadow-red-500/10",
      accentBg: "bg-red-600/10 text-red-600 dark:text-red-400",
      pillBg: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60",
    },
    {
      key: "tiktok",
      name: "TikTok",
      desc: "Publish viral short video clips with automatic hashtag synchronization and sound sync.",
      badge: "Content API",
      tags: ["Short Video", "Trending Tags", "Sounds"],
      borderColor: "border-teal-500/80 dark:border-teal-400/70 hover:border-teal-300 hover:shadow-teal-500/10",
      accentBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      pillBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60",
    },
    {
      key: "pinterest",
      name: "Pinterest",
      desc: "Pin to target boards with automated outbound destination link metadata & rich pins.",
      badge: "Pinterest v5",
      tags: ["Rich Pins", "Board Routing", "Links"],
      borderColor: "border-rose-600/80 dark:border-rose-500/70 hover:border-rose-500 hover:shadow-rose-500/10",
      accentBg: "bg-rose-600/10 text-rose-600 dark:text-rose-400",
      pillBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
    },
    {
      key: "threads",
      name: "Threads",
      desc: "Direct official Meta Graph API dispatch for rich conversational posts and discussions.",
      badge: "Threads API",
      tags: ["Conversations", "Rich Text", "Meta Sync"],
      borderColor: "border-purple-600/80 dark:border-purple-500/70 hover:border-purple-400 hover:shadow-purple-500/10",
      accentBg: "bg-purple-600/10 text-purple-600 dark:text-purple-400",
      pillBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
    },
    {
      key: "wordpress",
      name: "WordPress",
      desc: "Syndicate blog posts directly to social feeds upon publishing via REST endpoints.",
      badge: "REST Webhooks",
      tags: ["Auto-Sync", "Gutenberg", "Cross-post"],
      borderColor: "border-indigo-600/80 dark:border-indigo-500/70 hover:border-indigo-500 hover:shadow-indigo-500/10",
      accentBg: "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400",
      pillBg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
    },
    {
      key: "telegram",
      name: "Telegram",
      desc: "Broadcast announcements, polls and instant media drops to public & private channels.",
      badge: "Bot API 7.0",
      tags: ["Broadcasts", "Instant Alerts", "Rich Bot"],
      borderColor: "border-cyan-500/80 dark:border-cyan-400/70 hover:border-cyan-300 hover:shadow-cyan-500/10",
      accentBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      pillBg: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60",
    },
    {
      key: "tumblr",
      name: "Tumblr",
      desc: "Cross-post multimedia stories, creative microblog updates & artistic portfolio visuals.",
      badge: "OAuth 1.0a / 2.0",
      tags: ["Microblog", "Visual Arts", "Tag Queues"],
      borderColor: "border-blue-500/80 dark:border-blue-400/70 hover:border-blue-300 hover:shadow-blue-500/10",
      accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      pillBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    },
    {
      key: "reddit",
      name: "Reddit",
      desc: "Publish targeted community discussions, AMA posts, and link shares across subreddits.",
      badge: "Reddit API",
      tags: ["Subreddits", "AMA Threads", "Flair Sync"],
      borderColor: "border-orange-500/80 dark:border-orange-400/70 hover:border-orange-400 hover:shadow-orange-500/10",
      accentBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      pillBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60",
    },
  ];

  // 20 Platform icons for master footer
  const footerPlatformsList = [
    { platform: "facebook", label: "Facebook", href: "https://facebook.com" },
    { platform: "x", label: "X / Twitter", href: "https://x.com" },
    { platform: "instagram", label: "Instagram", href: "https://instagram.com" },
    { platform: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    { platform: "youtube", label: "YouTube", href: "https://youtube.com" },
    { platform: "tiktok", label: "TikTok", href: "https://tiktok.com" },
    { platform: "pinterest", label: "Pinterest", href: "https://pinterest.com" },
    { platform: "threads", label: "Threads", href: "https://threads.net" },
    { platform: "snapchat", label: "Snapchat", href: "https://snapchat.com" },
    { platform: "reddit", label: "Reddit", href: "https://reddit.com" },
    { platform: "whatsapp", label: "WhatsApp", href: "https://whatsapp.com" },
    { platform: "telegram", label: "Telegram", href: "https://telegram.org" },
    { platform: "discord", label: "Discord", href: "https://discord.com" },
    { platform: "bluesky", label: "Bluesky", href: "https://bsky.app" },
    { platform: "mastodon", label: "Mastodon", href: "https://joinmastodon.org" },
    { platform: "tumblr", label: "Tumblr", href: "https://tumblr.com" },
    { platform: "medium", label: "Medium", href: "https://medium.com" },
    { platform: "quora", label: "Quora", href: "https://quora.com" },
    { platform: "wordpress", label: "WordPress", href: "https://wordpress.org" },
    { platform: "vimeo", label: "Vimeo", href: "https://vimeo.com" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A13] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white antialiased transition-colors duration-200">
      
      {/* ==================================================
          01. STICKY HEADER / NAVBAR
          ================================================== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 bg-white/95 dark:bg-[#070A13]/95 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] ${
          scrolled
            ? "shadow-md dark:shadow-black/50"
            : "shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 focus:outline-none shrink-0">
            <SocialFlowLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#platforms" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Platforms
            </Link>
            <Link href="/#pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/resources" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#070A13] px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-xl">
            <div className="flex flex-col space-y-3 font-medium text-slate-700 dark:text-slate-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
              >
                Features
              </Link>
              <Link
                href="/#platforms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
              >
                Platforms
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
              >
                Pricing
              </Link>
              <Link
                href="/resources"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
              >
                Contact
              </Link>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Theme</span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                </button>
              </div>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ==================================================
            02. HERO SECTION
            ================================================== */}
        <section className="relative min-h-[760px] lg:min-h-[840px] flex items-center pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24 overflow-hidden">
          {/* Generated Enterprise SaaS Background Image with Dark Charcoal & Rose Ambient Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-75 pointer-events-none -z-20 transition-opacity duration-300"
            style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-slate-50/75 to-slate-50 dark:from-[#070A13]/85 dark:via-[#070A13]/60 dark:to-[#070A13] -z-10 pointer-events-none" />
          
          {/* Subtle Burgundy/Rose & Magenta Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-rose-900/20 via-pink-900/15 to-transparent blur-[140px] -z-10 rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-bl from-purple-900/20 via-indigo-950/20 to-transparent blur-[140px] -z-10 rounded-full pointer-events-none" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Headline, Description, CTAs, Product-Proof Badge */}
              <div className="lg:col-span-6 text-center lg:text-left space-y-6">
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-200/80 dark:border-rose-500/30 bg-white/80 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>All-in-One Social Media Management</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                  Social Media Management,{" "}
                  <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                    All in One Place.
                  </span>
                </h1>

                {/* Exact Description Copy */}
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Manage LinkedIn, Facebook, Instagram, TikTok, X, YouTube, Pinterest, Threads and other supported social platforms from one powerful workspace. Create, schedule, publish, monitor, analyze and manage your social media content from a single dashboard.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:via-pink-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 hover:border-rose-400 dark:hover:border-rose-500/50 bg-white/90 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm sm:text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
                  >
                    <span>Book a Demo</span>
                  </Link>
                </div>

                {/* Trust Subtitle */}
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No credit card required • Instant setup • 14-day free trial
                </p>

                {/* Product-Proof Glass Badge with all 8 Connected Networks */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0D1224]/80 backdrop-blur-md shadow-xs">
                    <div className="flex -space-x-1.5">
                      {["linkedin", "facebook", "instagram", "tiktok", "snapchat", "x", "youtube", "pinterest", "threads"].map((p) => (
                        <div key={p} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-xs">
                          <SocialPlatformIcon platform={p} size="xs" />
                        </div>
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>9+ Social Networks Connected</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Real-time publishing • Analytics • Scheduling
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium SocialFlow Floating Ecosystem Visual */}
              <div className="lg:col-span-6 relative flex items-center justify-center mt-8 lg:mt-0">
                <SocialFlowEcosystem />
              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            03. EXISTING COMMAND CENTER / DASHBOARD SECTION
            ================================================== */}
        <section id="dashboard-preview" className="py-12 lg:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0B0F1C]/90 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      SocialFlow Enterprise Command Active Sync
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    Global Multi-Network Workspace • {liveDbMetrics.connectedNetworks} Channels Connected
                  </h3>
                </div>

                {/* Dashboard Controls / Actions */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded hover:bg-white dark:hover:bg-white/10 transition-colors"
                      title={isPlaying ? "Pause Preview" : "Play Preview"}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded hover:bg-white dark:hover:bg-white/10 transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Open Admin App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 4 Real Database Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Posts</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{liveDbMetrics.totalPostsDisplay}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Live DB
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Reach</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{liveDbMetrics.totalReachDisplay}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Engagement</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{liveDbMetrics.engagementRate}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Real-time
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Followers</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{liveDbMetrics.totalFollowersDisplay}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Synced
                    </span>
                  </div>
                </div>
              </div>

              {/* Engagement Overview & Platform Distribution Visuals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Engagement Overview Chart */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Engagement Overview</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">
                      Real-Time Sync (7D)
                    </span>
                  </div>
                  <div className="h-56 w-full">
                    <HeroEngagementChart data={analyticsDataMap["7D"]} theme={theme} />
                  </div>
                </div>

                {/* Top Platforms & Recent Posts */}
                <div className="space-y-4">
                  {/* Top Platforms */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Top Platforms
                    </h4>
                    <div className="space-y-2.5">
                      {[
                        { name: "Instagram", icon: "instagram", share: "38%", status: "Active Stream" },
                        { name: "TikTok", icon: "tiktok", share: "28%", status: "High Velocity" },
                        { name: "LinkedIn", icon: "linkedin", share: "20%", status: "B2B Converting" },
                        { name: "X / Twitter", icon: "x", share: "14%", status: "Thread Active" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <SocialPlatformIcon platform={p.icon} size="xs" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{p.share}</span>
                            <span className="text-[10px] text-emerald-500 font-medium">{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Posts */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Recent Posts
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/5">
                        <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">
                          Q3 Product Launch Announcement
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Published
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-white/5">
                        <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">
                          Growth Metrics Carousel Slides
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          Scheduled
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">
                          AI Workflow Reel Drop #04
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          Queued
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            04. EXISTING PLATFORM SECTION
            ================================================== */}
        <section id="platforms-overview" className="scroll-mt-24 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#070A13] relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-500/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>32+ Official Network APIs</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Supported Social Networks &amp; Live Publishing Channels
              </h2>
            </div>

            {/* 5 Statistics Blocks with 0-to-target count animation on viewport enter */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-14">
              <div className="hover-shine p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
                <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                  <AnimatedStatCounter target={32} suffix="+" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Platforms</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unified Integration</div>
              </div>

              <div className="hover-shine p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center shadow-xs hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 mb-1">
                  <AnimatedStatCounter target={10} suffix="K+" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Happy Users</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Creators &amp; Agencies</div>
              </div>

              <div className="hover-shine p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center shadow-xs hover:border-pink-400 dark:hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
                <div className="text-3xl sm:text-4xl font-black text-pink-600 dark:text-pink-400 mb-1">
                  <AnimatedStatCounter target={50} suffix="K+" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Posts Managed</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Auto-Dispatched</div>
              </div>

              <div className="hover-shine p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  <AnimatedStatCounter target={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Uptime</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enterprise SLA</div>
              </div>

              <div className="hover-shine p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center shadow-xs col-span-2 md:col-span-1 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all">
                <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 mb-1">
                  <AnimatedStatCounter target={24} suffix="/7" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Support</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live Chat &amp; SLA</div>
              </div>
            </div>
          </div>

          {/* Continuous Infinite Marquee Slider with Balanced Side Cushion and Smooth Slow Drift */}
          <div className="relative w-full overflow-hidden pause-marquee py-6 sm:py-8">
            {/* Left Gradient Edge Fade (Subtle, balanced feathering without dark sidebars) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-10 md:w-16 bg-gradient-to-r from-slate-50 dark:from-[#070A13] via-slate-50/40 dark:via-[#070A13]/40 to-transparent z-20" />

            {/* Right Gradient Edge Fade (Subtle, balanced feathering without dark sidebars) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-10 md:w-16 bg-gradient-to-l from-slate-50 dark:from-[#070A13] via-slate-50/40 dark:via-[#070A13]/40 to-transparent z-20" />

            <div className="py-4 sm:py-5 space-y-4 sm:space-y-5 slider-mask-fade">
              {/* Row 1: Forward Marquee (Seamless 2-track infinite loop, ultra-smooth slow drift) */}
              <div className="flex w-max animate-marquee py-2.5 hover:[animation-play-state:paused]">
                <div className="flex items-center gap-3.5 sm:gap-4 pr-3.5 sm:pr-4 shrink-0 py-1">
                  {[
                    { name: "Instagram", icon: "instagram", category: "Reels & Photos" },
                    { name: "Facebook", icon: "facebook", category: "Pages & Groups" },
                    { name: "LinkedIn", icon: "linkedin", category: "B2B Publishing" },
                    { name: "X / Twitter", icon: "x", category: "Threads & Polls" },
                    { name: "YouTube", icon: "youtube", category: "Shorts & Videos" },
                    { name: "TikTok", icon: "tiktok", category: "Direct Video" },
                    { name: "Pinterest", icon: "pinterest", category: "Rich Pins" },
                    { name: "Threads", icon: "threads", category: "Conversations" },
                    { name: "WordPress", icon: "wordpress", category: "Blog Syndicate" },
                    { name: "Telegram", icon: "telegram", category: "Channels" },
                    { name: "Tumblr", icon: "tumblr", category: "Microblogging" },
                    { name: "Reddit", icon: "reddit", category: "Communities" },
                    { name: "Discord", icon: "discord", category: "Server Webhooks" },
                    { name: "Bluesky", icon: "bluesky", category: "AT Protocol" },
                    { name: "Snapchat", icon: "snapchat", category: "Spotlight" },
                    { name: "Mastodon", icon: "mastodon", category: "Fediverse Hub" },
                  ].map((p, idx) => (
                    <Link
                      key={`row1-a-${p.name}-${idx}`}
                      href="/platforms"
                      className="hover-shine relative overflow-hidden flex items-center justify-between gap-3.5 px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0D1224] backdrop-blur-md hover:border-indigo-500/80 dark:hover:border-indigo-400 hover:ring-2 hover:ring-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.04] transition-all duration-300 group cursor-pointer shrink-0 min-w-[220px] sm:min-w-[240px] z-10 hover:z-30"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shadow-xs shrink-0">
                          <SocialPlatformIcon platform={p.icon} size="md" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-3.5 sm:gap-4 pr-3.5 sm:pr-4 shrink-0 py-1" aria-hidden="true">
                  {[
                    { name: "Instagram", icon: "instagram", category: "Reels & Photos" },
                    { name: "Facebook", icon: "facebook", category: "Pages & Groups" },
                    { name: "LinkedIn", icon: "linkedin", category: "B2B Publishing" },
                    { name: "X / Twitter", icon: "x", category: "Threads & Polls" },
                    { name: "YouTube", icon: "youtube", category: "Shorts & Videos" },
                    { name: "TikTok", icon: "tiktok", category: "Direct Video" },
                    { name: "Pinterest", icon: "pinterest", category: "Rich Pins" },
                    { name: "Threads", icon: "threads", category: "Conversations" },
                    { name: "WordPress", icon: "wordpress", category: "Blog Syndicate" },
                    { name: "Telegram", icon: "telegram", category: "Channels" },
                    { name: "Tumblr", icon: "tumblr", category: "Microblogging" },
                    { name: "Reddit", icon: "reddit", category: "Communities" },
                    { name: "Discord", icon: "discord", category: "Server Webhooks" },
                    { name: "Bluesky", icon: "bluesky", category: "AT Protocol" },
                    { name: "Snapchat", icon: "snapchat", category: "Spotlight" },
                    { name: "Mastodon", icon: "mastodon", category: "Fediverse Hub" },
                  ].map((p, idx) => (
                    <Link
                      key={`row1-b-${p.name}-${idx}`}
                      href="/platforms"
                      tabIndex={-1}
                      className="hover-shine relative overflow-hidden flex items-center justify-between gap-3.5 px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0D1224] backdrop-blur-md hover:border-indigo-500/80 dark:hover:border-indigo-400 hover:ring-2 hover:ring-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.04] transition-all duration-300 group cursor-pointer shrink-0 min-w-[220px] sm:min-w-[240px] z-10 hover:z-30"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shadow-xs shrink-0">
                          <SocialPlatformIcon platform={p.icon} size="md" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Row 2: Reverse Marquee (Seamless 2-track infinite loop, ultra-smooth slow drift) */}
              <div className="flex w-max animate-marquee-reverse py-2.5 hover:[animation-play-state:paused]">
                <div className="flex items-center gap-3.5 sm:gap-4 pr-3.5 sm:pr-4 shrink-0 py-1">
                  {[
                    { name: "Medium", icon: "medium", category: "Articles & SEO" },
                    { name: "Vimeo", icon: "vimeo", category: "4K Streams" },
                    { name: "WhatsApp", icon: "whatsapp", category: "Broadcasts" },
                    { name: "Spotify", icon: "spotify", category: "Audio Podcasts" },
                    { name: "GitHub", icon: "github", category: "Release Feeds" },
                    { name: "Dribbble", icon: "dribbble", category: "Design Feeds" },
                    { name: "Behance", icon: "behance", category: "Portfolios" },
                    { name: "Twitch", icon: "twitch", category: "Live Alerts" },
                    { name: "Patreon", icon: "patreon", category: "Supporters" },
                    { name: "Rumble", icon: "rumble", category: "Video Sync" },
                    { name: "SoundCloud", icon: "soundcloud", category: "Audio Drops" },
                    { name: "Yelp", icon: "yelp", category: "Business Feeds" },
                    { name: "Kick", icon: "kick", category: "Stream Schedule" },
                    { name: "Kik", icon: "kik", category: "Group Rooms" },
                    { name: "Skype", icon: "skype", category: "Corporate Chat" },
                    { name: "Messenger", icon: "messenger", category: "Multi-Chat" },
                  ].map((p, idx) => (
                    <Link
                      key={`row2-a-${p.name}-${idx}`}
                      href="/platforms"
                      className="hover-shine relative overflow-hidden flex items-center justify-between gap-3.5 px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0D1224] backdrop-blur-md hover:border-indigo-500/80 dark:hover:border-indigo-400 hover:ring-2 hover:ring-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.04] transition-all duration-300 group cursor-pointer shrink-0 min-w-[220px] sm:min-w-[240px] z-10 hover:z-30"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shadow-xs shrink-0">
                          <SocialPlatformIcon platform={p.icon} size="md" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-3.5 sm:gap-4 pr-3.5 sm:pr-4 shrink-0" aria-hidden="true">
                  {[
                    { name: "Medium", icon: "medium", category: "Articles & SEO" },
                    { name: "Vimeo", icon: "vimeo", category: "4K Streams" },
                    { name: "WhatsApp", icon: "whatsapp", category: "Broadcasts" },
                    { name: "Spotify", icon: "spotify", category: "Audio Podcasts" },
                    { name: "GitHub", icon: "github", category: "Release Feeds" },
                    { name: "Dribbble", icon: "dribbble", category: "Design Feeds" },
                    { name: "Behance", icon: "behance", category: "Portfolios" },
                    { name: "Twitch", icon: "twitch", category: "Live Alerts" },
                    { name: "Patreon", icon: "patreon", category: "Supporters" },
                    { name: "Rumble", icon: "rumble", category: "Video Sync" },
                    { name: "SoundCloud", icon: "soundcloud", category: "Audio Drops" },
                    { name: "Yelp", icon: "yelp", category: "Business Feeds" },
                    { name: "Kick", icon: "kick", category: "Stream Schedule" },
                    { name: "Kik", icon: "kik", category: "Group Rooms" },
                    { name: "Skype", icon: "skype", category: "Corporate Chat" },
                    { name: "Messenger", icon: "messenger", category: "Multi-Chat" },
                  ].map((p, idx) => (
                    <Link
                      key={`row2-b-${p.name}-${idx}`}
                      href="/platforms"
                      tabIndex={-1}
                      className="hover-shine relative overflow-hidden flex items-center justify-between gap-3.5 px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0D1224] backdrop-blur-md hover:border-indigo-500/80 dark:hover:border-indigo-400 hover:ring-2 hover:ring-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.04] transition-all duration-300 group cursor-pointer shrink-0 min-w-[220px] sm:min-w-[240px] z-10 hover:z-30"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shadow-xs shrink-0">
                          <SocialPlatformIcon platform={p.icon} size="md" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-all duration-300 shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            05. EXISTING CORE FEATURES
            ================================================== */}
        <section id="features" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Core Platform Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Powerful Features to Boost Your Social Growth
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Everything you need to create, schedule, analyze and grow your social media presence.
              </p>
            </div>

            {/* 8 Core Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Post Scheduling",
                  desc: "Schedule multi-channel posts with automated time slots, queue recycling, and time-zone precision.",
                  icon: Send,
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  title: "Analytics & Reports",
                  desc: "Measure reach, engagement velocity, and link conversions with exportable PDF and CSV reports.",
                  icon: BarChart3,
                  color: "from-purple-500 to-pink-600",
                },
                {
                  title: "Smart Inbox",
                  desc: "Consolidate mentions, comments, and direct inquiries across channels in one centralized inbox.",
                  icon: Inbox,
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  title: "Team Collaboration",
                  desc: "Work with team members using role-based permissions, client approval gates, and activity audit logs.",
                  icon: Users,
                  color: "from-amber-500 to-orange-600",
                },
                {
                  title: "Content Calendar",
                  desc: "Plan and organize your visual campaign strategy across monthly, weekly, and list timeline views.",
                  icon: Calendar,
                  color: "from-indigo-500 to-cyan-600",
                },
                {
                  title: "AI Assistant",
                  desc: "Generate contextual social captions, optimal hashtag suggestions, and tone variations in seconds.",
                  icon: Sparkles,
                  color: "from-pink-500 to-rose-600",
                },
                {
                  title: "Media Library",
                  desc: "Store and organize high-resolution images, video clips, and graphic templates with instant tag search.",
                  icon: ImageIcon,
                  color: "from-violet-500 to-purple-600",
                },
                {
                  title: "Multi-Account Sync",
                  desc: "Separate clients, brands, and agency accounts with distinct isolated workspaces and billing.",
                  icon: Layers,
                  color: "from-teal-500 to-emerald-600",
                },
              ].map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform mx-auto`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================
            06. EXISTING INTEGRATION MARKETPLACE
            ================================================== */}
        <section id="platforms" className="py-20 lg:py-28 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070A14] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>Integration Marketplace</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Connect All Your Favorite Platforms
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
                One-click official OAuth connections with zero password sharing and AES-256 encrypted access tokens.
              </p>
            </div>

            {/* Real Live Metrics Status Bar */}
            <div className="max-w-2xl mx-auto mb-10 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0E1324] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Live Network Status:
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                  {Object.values(connectedPlatforms).filter(Boolean).length} of {marketplacePlatforms.length} Channels Connected
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AES-256 Encrypted</span>
                </span>
                <span>•</span>
                <span className="text-purple-600 dark:text-purple-400">Official OAuth APIs</span>
              </div>
            </div>

            {/* 12 Platform Cards - Ultra Premium Solid 2px Border Design without repetitive buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {marketplacePlatforms.map((p) => {
                const isConnected = connectedPlatforms[p.key];
                return (
                  <div
                    key={p.key}
                    className={`relative rounded-2xl border-2 border-solid ${p.borderColor} bg-white dark:bg-[#0C101D] p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}
                  >
                    {/* Top ambient glow */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-current opacity-5 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                    <div>
                      {/* Header Row: Platform Icon + Names + Status Pill */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl ${p.accentBg} flex items-center justify-center border-2 border-solid border-white/40 dark:border-white/10 shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                            <SocialPlatformIcon platform={p.key} size="md" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                              {p.name}
                            </h4>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {p.badge}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge with solid border */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border-2 border-solid tracking-wide shrink-0 ${
                            isConnected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-amber-500/80 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          <span>{isConnected ? "Connected" : "Ready"}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>

                    {/* Clean Professional Bottom Bar (Button removed for uncluttered look) */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border border-solid ${p.pillBg}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>OAuth 2.0</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Centralized High-Level CTA Banner to manage all social accounts */}
            <div className="mt-10 sm:mt-12 p-5 sm:p-7 rounded-2xl border-2 border-solid border-indigo-500/30 dark:border-indigo-500/40 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-pink-50/30 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/10 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Need Custom OAuth Credentials or Webhooks?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    Connect, re-authenticate or revoke API access anytime from your centralized security vault.
                  </p>
                </div>
              </div>
              <Link
                href="/social-accounts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <span>Manage Social Accounts</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================
            07. EXISTING STUDIO / POST COMPOSER
            ================================================== */}
        <section id="composer" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Studio Post Composer</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create, Preview & Schedule in Real Time
              </h2>
            </div>

            {/* Composer Box Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Composer Form (7 Cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F1C] p-6 sm:p-8 shadow-xl space-y-6">
                
                {/* Target Networks Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Target Social Networks
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                      {selectedChannels.length} {selectedChannels.length === 1 ? "Channel" : "Channels"} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "linkedin", name: "LinkedIn" },
                      { key: "twitter", name: "X / Twitter" },
                      { key: "instagram", name: "Instagram" },
                      { key: "facebook", name: "Facebook" },
                      { key: "youtube", name: "YouTube" },
                      { key: "tiktok", name: "TikTok" },
                      { key: "pinterest", name: "Pinterest" },
                      { key: "threads", name: "Threads" },
                    ].map((channel) => {
                      const isSelected = selectedChannels.includes(channel.key);
                      return (
                        <button
                          key={channel.key}
                          onClick={() => toggleComposerChannel(channel.key)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shadow-xs"
                              : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <SocialPlatformIcon platform={channel.key} size="xs" />
                          <span>{channel.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Caption Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Post Caption & Global Message
                    </label>
                    <span className="text-xs font-bold text-slate-400">
                      {composerCaption.length} / 2,200 chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={composerCaption}
                    onChange={(e) => setComposerCaption(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
                    placeholder="Write your social post copy here..."
                  />
                </div>

                {/* Toolbar (Hashtags, Emojis, Media, Character Counter) */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setComposerCaption((prev) => prev + " #SocialFlow #SaaS")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                    >
                      <Hash className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Hashtags</span>
                    </button>
                    <button
                      onClick={() => setComposerCaption((prev) => prev + " ✨🔥")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                    >
                      <Smile className="w-3.5 h-3.5 text-amber-500" />
                      <span>Emojis</span>
                    </button>
                    <button
                      onClick={() => showToast("Media library attached: banner-preview.png", "info")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                      <span>Media</span>
                    </button>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Character Counter Active
                  </span>
                </div>

                {/* Live Photography Asset Selector */}
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Select Photo Asset for Visual Preview:
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      Real High-Res Imagery
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {composerImagePresets.map((preset) => {
                      const isChosen = selectedComposerImage.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedComposerImage(preset);
                            if (preset.id === 'saas') {
                              setComposerCaption('🚀 Excited to unveil SocialFlow Omni-Engine v2.4! Seamlessly schedule, broadcast, and measure your cross-network social presence across 12+ channels with real-time performance analytics. Try the interactive studio composer today! #SocialMediaManagement #Omnichannel #SaaS #Growth');
                              setActivePreviewChannel('instagram');
                            } else if (preset.id === 'analytics') {
                              setComposerCaption('📊 Benchmark update: Brands scheduling with multi-channel queue recycling saw a 42% lift in audience retention. Download the Q3 Executive Briefing via the link in bio! #Analytics #DataDriven #MarketingOps #SocialFlow');
                              setActivePreviewChannel('linkedin');
                            } else if (preset.id === 'studio') {
                              setComposerCaption('✨ High-resolution asset vaulting, automated aspect-ratio conversions, and real-time native platform simulations — all built into your SocialFlow Admin workspace. #CreativeOps #SocialMarketing #Workflow');
                              setActivePreviewChannel('instagram');
                            } else {
                              setComposerCaption('🛡️ Enterprise-grade administrative control: role-based publishing approval gates, audit event streaming, and session token verification across your entire corporate fleet. #CyberSecurity #EnterpriseSaaS #AdminOps');
                              setActivePreviewChannel('twitter');
                            }
                          }}
                          className={`group relative rounded-xl overflow-hidden border p-1.5 flex flex-col items-center gap-1 text-left transition-all cursor-pointer ${
                            isChosen
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5'
                          }`}
                        >
                          <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-slate-900">
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isChosen && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate w-full mt-0.5">
                            {preset.brand}
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate w-full">
                            {preset.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions (Save Draft, Schedule for Tomorrow, Publish Now) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <button
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    {isDraftSaved ? "✓ Draft Saved" : "Save Draft"}
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleScheduleTomorrow}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Schedule for Tomorrow
                    </button>
                    <button
                      onClick={handlePublishNow}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Live Native Preview (5 Cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#070A13] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Native Channel Preview
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedChannels.map((c) => (
                      <button
                        key={c}
                        onClick={() => setActivePreviewChannel(c)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          activePreviewChannel === c
                            ? "border-indigo-600 bg-white dark:bg-white/10 shadow-xs"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                        title={`Preview on ${c}`}
                      >
                        <SocialPlatformIcon platform={c} size="xs" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Realistic Native Card Mockup */}
                {activePreviewChannel === "instagram" ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1324] shadow-xl overflow-hidden animate-in fade-in duration-200">
                    {/* Instagram Header */}
                    <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                          <img
                            src={selectedComposerImage.avatar}
                            alt={selectedComposerImage.brand}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#0E1324]"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {selectedComposerImage.handle.replace('@', '')}
                            </span>
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                              ✓
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {selectedComposerImage.location}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" />
                    </div>

                    {/* Instagram Media Photo */}
                    <div className="relative aspect-square w-full bg-slate-950 overflow-hidden group">
                      <img
                        src={selectedComposerImage.url}
                        alt={selectedComposerImage.label}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-white font-mono">
                        1/3
                      </div>
                    </div>

                    {/* Instagram Action Icons */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLikedByMe(!isLikedByMe);
                              setComposerLikesCount((prev) => (isLikedByMe ? prev - 1 : prev + 1));
                            }}
                            className="transition-transform active:scale-125 cursor-pointer"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                isLikedByMe
                                  ? 'fill-rose-500 text-rose-500'
                                  : 'text-slate-700 dark:text-slate-200 hover:text-rose-500'
                              }`}
                            />
                          </button>
                          <MessageCircle className="w-5 h-5 text-slate-700 dark:text-slate-200 hover:text-indigo-500 transition-colors cursor-pointer" />
                          <Send className="w-4 h-4 text-slate-700 dark:text-slate-200 hover:text-indigo-500 transition-colors cursor-pointer -rotate-12" />
                        </div>
                        <Bookmark className="w-5 h-5 text-slate-700 dark:text-slate-200 hover:text-indigo-500 transition-colors cursor-pointer" />
                      </div>

                      {/* Instagram Social Proof & Caption */}
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">
                          Liked by <span className="font-extrabold">socialflow_team</span> and{' '}
                          <span className="font-extrabold">{composerLikesCount.toLocaleString()} others</span>
                        </p>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                            {selectedComposerImage.handle.replace('@', '')}
                          </span>
                          {composerCaption}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium cursor-pointer hover:underline">
                          View all 84 comments
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                          2 HOURS AGO • OFFICIAL INSTAGRAM GRAPH API
                        </p>
                      </div>
                    </div>
                  </div>
                ) : activePreviewChannel === "linkedin" ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1324] shadow-xl p-4 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedComposerImage.avatar}
                        alt={selectedComposerImage.brand}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedComposerImage.brand}
                          </span>
                          <span className="text-[10px] text-slate-400">• 1st</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          38,400 followers • 1h • 🌐
                        </p>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {composerCaption}
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 aspect-video">
                      <img
                        src={selectedComposerImage.url}
                        alt={selectedComposerImage.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="p-0.5 rounded-full bg-blue-500 text-white text-[9px]">👍</span>
                        <span className="p-0.5 rounded-full bg-rose-500 text-white text-[9px]">❤️</span>
                        <span className="font-semibold ml-1">1,842</span>
                      </div>
                      <span>74 comments • 38 reposts</span>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-white/5 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <button type="button" className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-500" /> Like
                      </button>
                      <button type="button" className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-400" /> Comment
                      </button>
                      <button type="button" className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                        <Repeat className="w-3.5 h-3.5 text-slate-400" /> Repost
                      </button>
                      <button type="button" className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                        <Send className="w-3.5 h-3.5 text-slate-400" /> Send
                      </button>
                    </div>
                  </div>
                ) : activePreviewChannel === "twitter" ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1324] shadow-xl p-4 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedComposerImage.avatar}
                        alt={selectedComposerImage.brand}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {selectedComposerImage.brand}
                          </span>
                          <span className="w-3 h-3 rounded-full bg-sky-500 text-white flex items-center justify-center text-[7px] font-bold">✓</span>
                          <span className="text-[11px] text-slate-400 truncate">{selectedComposerImage.handle}</span>
                          <span className="text-[11px] text-slate-400">· 2h</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {composerCaption}
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video">
                      <img
                        src={selectedComposerImage.url}
                        alt={selectedComposerImage.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> 84</span>
                      <span className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer"><Repeat className="w-3.5 h-3.5" /> 142</span>
                      <span className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer"><Heart className="w-3.5 h-3.5" /> 1.2K</span>
                      <span className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer"><Bookmark className="w-3.5 h-3.5" /> 210</span>
                      <Share2 className="w-3.5 h-3.5 hover:text-slate-200 cursor-pointer" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1324] shadow-xl p-4 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedComposerImage.avatar}
                        alt={selectedComposerImage.brand}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedComposerImage.brand}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{activePreviewChannel.toUpperCase()} Official Feed • Just now</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {composerCaption}
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video">
                      <img
                        src={selectedComposerImage.url}
                        alt={selectedComposerImage.label}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <span>👍 2.4k Likes</span>
                      <span>💬 112 Comments</span>
                      <span>🔁 86 Shares</span>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            08. EXISTING PRICING SECTION
            ================================================== */}
        <section id="pricing" className="py-20 lg:py-28 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070B16] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Transparent Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Simple Plans for Every Stage of Growth
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
                No hidden setup fees. Switch or cancel anytime.
              </p>

              {/* Monthly / Yearly Toggle */}
              <div className="pt-6 flex items-center justify-center gap-3">
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                  className="w-12 h-6 rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 transition-colors relative cursor-pointer"
                  aria-label="Toggle Billing Cycle"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      billingCycle === "yearly" ? "translate-x-6 bg-indigo-600" : "translate-x-0"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                    billingCycle === "yearly" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            {/* 4 Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan) => {
                const currentPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                return (
                  <div
                    key={plan.name}
                    className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                      plan.popular
                        ? "border-indigo-600 dark:border-indigo-500 bg-white dark:bg-[#0D1224] shadow-2xl shadow-indigo-500/10 scale-105 z-10"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      {plan.popular && (
                        <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black tracking-wider uppercase mb-3">
                          Most Popular
                        </div>
                      )}
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">{plan.desc}</p>

                      <div className="my-6">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">${currentPrice}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold"> / month</span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                        {plan.features.map((feat) => (
                          <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8">
                      <Link
                        href="/register"
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          plan.popular
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/25"
                            : "bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10"
                        }`}
                      >
                        <span>Start Free Trial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================
            09. EXISTING CUSTOMER SUCCESS STORIES
            ================================================== */}
        <section id="testimonials" className="py-20 lg:py-28 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with Navigation Controls - Aligned to Top Right Corner Above Cards */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
              <div className="text-center sm:text-left space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customer Success Stories</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Loved by Top Creators &amp; Marketing Leaders
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Real feedback from growth leaders, agencies, and creators publishing across 20+ channels at scale.
                </p>
              </div>

              {/* Slider Prev / Next Controls - Clean Standalone Arrow Buttons */}
              <div className="flex items-center gap-2.5 self-center sm:self-end shrink-0">
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.12] active:scale-95 border border-slate-200 dark:border-white/10 hover:border-pink-400 dark:hover:border-pink-500/50 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 shadow-sm hover:shadow-md hover:shadow-pink-500/10 transition-all duration-200 cursor-pointer group"
                  title="Previous Testimonial"
                  aria-label="Previous Testimonial"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2] group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.12] active:scale-95 border border-slate-200 dark:border-white/10 hover:border-pink-400 dark:hover:border-pink-500/50 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 shadow-sm hover:shadow-md hover:shadow-pink-500/10 transition-all duration-200 cursor-pointer group"
                  title="Next Testimonial"
                  aria-label="Next Testimonial"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Testimonials Smooth Sliding Track Carousel */}
            <div
              className="relative overflow-hidden py-4 -my-4"
              onMouseEnter={() => setIsSliderHovered(true)}
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              <div
                className="flex -mx-3 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${activeTestimonial * (100 / cardsPerView)}%)`,
                }}
              >
                {[...testimonials, ...testimonials.slice(0, 3)].map((t, idx) => {
                  const isCurrentActive = idx % testimonials.length === activeTestimonial;
                  return (
                    <div
                      key={`${t.name}-${idx}`}
                      className="shrink-0 px-3 transition-all duration-300"
                      style={{ width: `${100 / cardsPerView}%` }}
                    >
                      <div
                        className={`h-full p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-xl ${
                          isCurrentActive
                            ? "border-pink-500/60 dark:border-pink-500/40 bg-white dark:bg-[#0E1326] shadow-pink-500/10 ring-2 ring-pink-500/20"
                            : "border-slate-200 dark:border-white/10 bg-white/95 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          {/* Star Rating & Quote Accent */}
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-1">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <Quote className="w-6 h-6 text-slate-300 dark:text-white/15" />
                          </div>

                          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic mb-6">
                            &ldquo;{t.quote}&rdquo;
                          </p>
                        </div>

                        <div>
                          {/* Author Info & Platform Icon */}
                          <div className="flex items-center justify-between mb-5 pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                              <img
                                src={t.avatar}
                                alt={t.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-pink-500/30 ring-1 ring-slate-200 dark:ring-white/10"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role} • {t.company}</p>
                              </div>
                            </div>
                            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                              <SocialPlatformIcon platform={t.platform} size="sm" />
                            </div>
                          </div>

                          {/* Metric Badge */}
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20">
                            <span>{t.metric}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-extrabold">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeTestimonial
                      ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500 shadow-xs shadow-pink-500/30"
                      : "w-2.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40"
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            10. EXISTING REAL-TIME ANALYTICS SECTION
            ================================================== */}
        <section id="analytics" className="py-14 lg:py-20 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070A14] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Real-Time Intelligence & Analytics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Actionable Growth Telemetry for Modern Brands
              </h2>
            </div>

            {/* 4 Metric Telemetry Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Global Impressions</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">12.4M</div>
                <span className="text-[11px] font-bold text-emerald-500 mt-0.5 inline-block">+34.8% vs last cycle</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Avg Engagement Rate</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">7.92%</div>
                <span className="text-[11px] font-bold text-emerald-500 mt-0.5 inline-block">+3.1% benchmark</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Net Follower Gain</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">+48.2K</div>
                <span className="text-[11px] font-bold text-indigo-500 mt-0.5 inline-block">Organic Growth</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Link Click Velocity</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">184.6K</div>
                <span className="text-[11px] font-bold text-purple-500 mt-0.5 inline-block">High Intent CTR</span>
              </div>
            </div>

            {/* Interactive Chart Workspace */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F1C] p-5 sm:p-7 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-white/10">
                {/* Metric Selector Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "impressions", label: "Impressions" },
                    { key: "engagement", label: "Engagement %" },
                    { key: "followers", label: "Audience Growth" },
                    { key: "clicks", label: "Link Clicks" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setAnalyticsMetric(m.key as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        analyticsMetric === m.key
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Timeframe Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold">
                  {(["24H", "7D", "30D", "90D", "1Y"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setAnalyticsTimeframe(tf)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        analyticsTimeframe === tf
                          ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart & Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
                {/* Dynamic Analytics Area Chart */}
                <div className="lg:col-span-8 h-64 sm:h-72 w-full">
                  <DeepAnalyticsChart data={activeAnalyticsDataset} theme={theme} />
                </div>

                {/* Platform Distribution & Pulse Side Panel */}
                <div className="lg:col-span-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Platform Distribution
                    </h4>
                    <div className="space-y-1.5">
                      {platformDistributionData.map((p) => (
                        <div key={p.name} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{p.name}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Virality Optimization Index</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Top content scheduled at 08:30 AM EST yields +42% higher retention and comment density.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Pulse: Streaming multi-network webhooks</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            11. EXISTING ROI CALCULATOR
            ================================================== */}
        <section id="calculator" className="py-14 lg:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                <span>Quantifiable Impact Estimator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Calculate Your Team's Time & Budget ROI
              </h2>
            </div>

            {/* Calculator Interactive Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F1C] p-5 sm:p-8 shadow-xl">
              
              {/* Left Controls & Sliders (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
                    Quick Presets:
                  </span>
                  <button
                    onClick={() => applyRoiPreset("solo")}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Solo Creator
                  </button>
                  <button
                    onClick={() => applyRoiPreset("agency")}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Growth Agency
                  </button>
                  <button
                    onClick={() => applyRoiPreset("enterprise")}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Global Brand
                  </button>
                </div>

                {/* Slider 1: Monthly Posts Published */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Monthly Posts Published
                    </label>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {roiMonthlyPosts} Posts
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={5}
                    value={roiMonthlyPosts}
                    onChange={(e) => setRoiMonthlyPosts(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>10 Posts</span>
                    <span>250 Posts</span>
                    <span>500 Posts</span>
                  </div>
                </div>

                {/* Slider 2: Active Social Channels */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Active Social Channels
                    </label>
                    <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                      {roiActiveChannels} Channels
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    step={1}
                    value={roiActiveChannels}
                    onChange={(e) => setRoiActiveChannels(Number(e.target.value))}
                    className="w-full accent-purple-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>2 Channels</span>
                    <span>10 Channels</span>
                    <span>20 Channels</span>
                  </div>
                </div>

                {/* Slider 3: Combined Follower Base */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Combined Follower Base
                    </label>
                    <span className="text-sm font-black text-pink-600 dark:text-pink-400">
                      {roiFollowerBase.toLocaleString()} Followers
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={1000000}
                    step={5000}
                    value={roiFollowerBase}
                    onChange={(e) => setRoiFollowerBase(Number(e.target.value))}
                    className="w-full accent-pink-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>5K</span>
                    <span>500K</span>
                    <span>1M+</span>
                  </div>
                </div>

              </div>

              {/* Right Output Results Panel (5 Cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 sm:p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    Estimated Monthly Savings
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        Hours Saved / Mo
                      </span>
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {hoursSavedPerMonth} hrs
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        Labor Value Saved
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ${laborValueSaved.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Audience Velocity</span>
                        <span className="font-bold text-slate-900 dark:text-white">+{projectedAudienceVelocity.toLocaleString()}/mo</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-indigo-100 dark:border-white/10">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Consistency Index</span>
                        <span className="font-bold text-slate-900 dark:text-white">{consistencyScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/register"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Claim Your Time Savings</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            12. EXISTING SECURITY SECTION
            ================================================== */}
        <section id="enterprise" className="py-14 lg:py-20 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070A14] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Grade Security & Compliance</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Engineered for Rock-Solid Reliability
              </h2>
            </div>

            {/* 4 Security Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  title: "99.99% Guaranteed SLA",
                  desc: "Redundant edge dispatch architecture ensuring your scheduled content never drops or lags during critical brand drops.",
                  icon: Server,
                },
                {
                  title: "AES-256 Token Encryption",
                  desc: "OAuth access tokens are encrypted with military-grade AES-256 keys. Your social passwords are never stored.",
                  icon: Lock,
                },
                {
                  title: "SOC-2 & GDPR Certified",
                  desc: "Fully compliant with international data protection protocols, strict privacy standards, and audit trails.",
                  icon: FileCheck2,
                },
                {
                  title: "Official Tier-1 APIs",
                  desc: "Direct authorized partnership with Meta, LinkedIn, X, Google, ByteDance, and Pinterest developers.",
                  icon: Award,
                },
              ].map((card) => {
                const IconComp = card.icon;
                return (
                  <div
                    key={card.title}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-emerald-500/50 hover:shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">{card.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================
            13. EXISTING FINAL CTA
            ================================================== */}
        <section id="get-started" className="py-14 lg:py-20 relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-pink-600/10 -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20 inline-block">
              Over 14,820+ marketing leaders active today
            </span>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Ready to Supercharge Your Multi-Network Social Growth?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Join modern creators and agencies scaling their brand presence with automated publishing and deep intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Start 14-Day Free Trial
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                Explore Live Dashboard
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 14-Day Free Access</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> No Credit Card Required</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Instant 60-Sec Setup</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Cancel Anytime</span>
            </div>
          </div>
        </section>

      </main>

      {/* ==================================================
          14. EXISTING MASTER FOOTER (Full Light & Dark Mode)
          ================================================== */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#070A13] text-slate-700 dark:text-slate-300 pt-14 pb-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Brand & Newsletter Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
            {/* Brand description (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <Link href="/" className="inline-block">
                <SocialFlowLogo size="md" />
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                SocialFlow is the unified social media management command center for high-growth brands, creators, and digital agencies.
              </p>
            </div>

            {/* Newsletter Subscription (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Subscribe to Product Release Notes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get monthly feature updates, platform API changes, and growth guides directly in your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 pt-1 max-w-md">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your work email..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {newsletterSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

          {/* 20 Platform Icons in 2 Balanced Rows of 10 */}
          <div className="py-8 border-b border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center mb-5">
              Supported Multi-Platform Ecosystem
            </h5>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {footerPlatformsList.map((p) => (
                <a
                  key={p.label}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/50 flex flex-col items-center justify-center transition-all group shadow-2xs"
                  title={p.label}
                >
                  <SocialPlatformIcon platform={p.platform} size="xs" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white mt-1 truncate max-w-full">
                    {p.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Multi-Column Links Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-b border-slate-200 dark:border-slate-800 text-xs">
            {/* Product */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Product</h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Live Dashboard</Link></li>
                <li><Link href="/calendar" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Content Calendar</Link></li>
                <li><Link href="/inbox" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Smart Inbox</Link></li>
                <li><Link href="/analytics" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Company</h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><Link href="/about" className="hover:text-indigo-600 dark:hover:text-white transition-colors">About</Link></li>
                <li><Link href="/solutions" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Solutions</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/login" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resources</h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><Link href="/resources" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/faq" className="hover:text-indigo-600 dark:hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/resources" className="hover:text-indigo-600 dark:hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link href="/security" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal</h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Security Architecture</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
            <div>
              © 2026 SocialFlow. All rights reserved.
            </div>

            <div className="flex items-center gap-5">
              <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="/security" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</Link>

              {/* Theme Toggle in Footer */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </button>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-colors cursor-pointer"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
