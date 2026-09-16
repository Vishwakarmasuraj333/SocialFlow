import React from "react";

export type PlatformKey =
  | "behance"
  | "bluesky"
  | "discord"
  | "dribbble"
  | "facebook"
  | "github"
  | "instagram"
  | "kick"
  | "kik"
  | "linkedin"
  | "mastodon"
  | "medium"
  | "messenger"
  | "patreon"
  | "pinterest"
  | "quora"
  | "reddit"
  | "rss"
  | "rumble"
  | "skype"
  | "snapchat"
  | "soundcloud"
  | "spotify"
  | "telegram"
  | "threads"
  | "tiktok"
  | "tumblr"
  | "twitch"
  | "twitter"
  | "vimeo"
  | "whatsapp"
  | "wordpress"
  | "x"
  | "yelp"
  | "youtube";

export interface PlatformIconProps {
  platform?: PlatformKey | string;
  name?: PlatformKey | string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  variant?: "brand" | "monochrome" | "gradient-bg" | "glass";
}

const sizeMap: Record<string, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 44,
  "2xl": 56,
};

export interface SupportedPlatform {
  key: PlatformKey;
  id: PlatformKey;
  displayName: string;
  name: string;
  category: "Major" | "Video & Streaming" | "Messaging & Community" | "Creative & Niche";
  brandColor: string;
  characterLimit: number;
  charLimit: number;
  maxImages: number;
  imgLimit: number;
  supportsVideo: boolean;
  video: boolean;
  supportsComments: boolean;
  apiBadge: string;
}

export const ALL_SUPPORTED_PLATFORMS: SupportedPlatform[] = [
  { key: "linkedin", id: "linkedin", displayName: "LinkedIn", name: "LinkedIn", category: "Major", brandColor: "#0A66C2", characterLimit: 3000, charLimit: 3000, maxImages: 9, imgLimit: 9, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Share API v2" },
  { key: "facebook", id: "facebook", displayName: "Facebook", name: "Facebook", category: "Major", brandColor: "#1877F2", characterLimit: 63206, charLimit: 63206, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Meta Graph v19" },
  { key: "instagram", id: "instagram", displayName: "Instagram", name: "Instagram", category: "Major", brandColor: "#E4405F", characterLimit: 2200, charLimit: 2200, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "IG Graph API" },
  { key: "x", id: "x", displayName: "X (Twitter)", name: "X / Twitter", category: "Major", brandColor: "#000000", characterLimit: 280, charLimit: 280, maxImages: 4, imgLimit: 4, supportsVideo: true, video: true, supportsComments: true, apiBadge: "X API v2" },
  { key: "threads", id: "threads", displayName: "Threads", name: "Threads", category: "Major", brandColor: "#000000", characterLimit: 500, charLimit: 500, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Threads API v1" },
  { key: "tiktok", id: "tiktok", displayName: "TikTok", name: "TikTok", category: "Video & Streaming", brandColor: "#000000", characterLimit: 2200, charLimit: 2200, maxImages: 35, imgLimit: 35, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Content API v2" },
  { key: "youtube", id: "youtube", displayName: "YouTube", name: "YouTube", category: "Video & Streaming", brandColor: "#FF0000", characterLimit: 5000, charLimit: 5000, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Data API v3" },
  { key: "twitch", id: "twitch", displayName: "Twitch", name: "Twitch", category: "Video & Streaming", brandColor: "#9146FF", characterLimit: 500, charLimit: 500, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Twitch Helix" },
  { key: "vimeo", id: "vimeo", displayName: "Vimeo", name: "Vimeo", category: "Video & Streaming", brandColor: "#1AB7EA", characterLimit: 5000, charLimit: 5000, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Vimeo API v3" },
  { key: "rumble", id: "rumble", displayName: "Rumble", name: "Rumble", category: "Video & Streaming", brandColor: "#85C742", characterLimit: 2000, charLimit: 2000, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Rumble Video v1" },
  { key: "kick", id: "kick", displayName: "Kick", name: "Kick", category: "Video & Streaming", brandColor: "#53FC18", characterLimit: 500, charLimit: 500, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Kick API v1" },
  { key: "pinterest", id: "pinterest", displayName: "Pinterest", name: "Pinterest", category: "Creative & Niche", brandColor: "#E60023", characterLimit: 500, charLimit: 500, maxImages: 5, imgLimit: 5, supportsVideo: true, video: true, supportsComments: false, apiBadge: "Pinterest v5" },
  { key: "reddit", id: "reddit", displayName: "Reddit", name: "Reddit", category: "Messaging & Community", brandColor: "#FF4500", characterLimit: 40000, charLimit: 40000, maxImages: 20, imgLimit: 20, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Reddit OAuth v2" },
  { key: "discord", id: "discord", displayName: "Discord", name: "Discord", category: "Messaging & Community", brandColor: "#5865F2", characterLimit: 2000, charLimit: 2000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Discord Bot v10" },
  { key: "telegram", id: "telegram", displayName: "Telegram", name: "Telegram", category: "Messaging & Community", brandColor: "#26A5E4", characterLimit: 4096, charLimit: 4096, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Telegram Bot API" },
  { key: "whatsapp", id: "whatsapp", displayName: "WhatsApp Channels", name: "WhatsApp", category: "Messaging & Community", brandColor: "#25D366", characterLimit: 1000, charLimit: 1000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Cloud API v19" },
  { key: "messenger", id: "messenger", displayName: "Messenger", name: "Messenger", category: "Messaging & Community", brandColor: "#00B2FF", characterLimit: 2000, charLimit: 2000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Meta Send API" },
  { key: "snapchat", id: "snapchat", displayName: "Snapchat", name: "Snapchat", category: "Messaging & Community", brandColor: "#FFFC00", characterLimit: 250, charLimit: 250, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Snap Kit v2" },
  { key: "skype", id: "skype", displayName: "Skype", name: "Skype", category: "Messaging & Community", brandColor: "#00AFF0", characterLimit: 1000, charLimit: 1000, maxImages: 5, imgLimit: 5, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Bot Framework" },
  { key: "kik", id: "kik", displayName: "Kik", name: "Kik", category: "Messaging & Community", brandColor: "#82BC23", characterLimit: 1000, charLimit: 1000, maxImages: 5, imgLimit: 5, supportsVideo: false, video: false, supportsComments: true, apiBadge: "Kik Bot API" },
  { key: "spotify", id: "spotify", displayName: "Spotify Podcasts", name: "Spotify", category: "Creative & Niche", brandColor: "#1DB954", characterLimit: 4000, charLimit: 4000, maxImages: 1, imgLimit: 1, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Spotify Web API" },
  { key: "soundcloud", id: "soundcloud", displayName: "SoundCloud", name: "SoundCloud", category: "Creative & Niche", brandColor: "#FF5500", characterLimit: 4000, charLimit: 4000, maxImages: 1, imgLimit: 1, supportsVideo: false, video: false, supportsComments: true, apiBadge: "SoundCloud API" },
  { key: "behance", id: "behance", displayName: "Behance", name: "Behance", category: "Creative & Niche", brandColor: "#1769FF", characterLimit: 5000, charLimit: 5000, maxImages: 25, imgLimit: 25, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Adobe Behance" },
  { key: "dribbble", id: "dribbble", displayName: "Dribbble", name: "Dribbble", category: "Creative & Niche", brandColor: "#EA4C89", characterLimit: 2000, charLimit: 2000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Dribbble v2" },
  { key: "github", id: "github", displayName: "GitHub Releases", name: "GitHub", category: "Creative & Niche", brandColor: "#181717", characterLimit: 65536, charLimit: 65536, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "GitHub REST API" },
  { key: "medium", id: "medium", displayName: "Medium", name: "Medium", category: "Creative & Niche", brandColor: "#000000", characterLimit: 50000, charLimit: 50000, maxImages: 50, imgLimit: 50, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Medium Publishing" },
  { key: "tumblr", id: "tumblr", displayName: "Tumblr", name: "Tumblr", category: "Creative & Niche", brandColor: "#36465D", characterLimit: 10000, charLimit: 10000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Tumblr API v2" },
  { key: "patreon", id: "patreon", displayName: "Patreon", name: "Patreon", category: "Creative & Niche", brandColor: "#FF424D", characterLimit: 10000, charLimit: 10000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Patreon v2" },
  { key: "mastodon", id: "mastodon", displayName: "Mastodon", name: "Mastodon", category: "Messaging & Community", brandColor: "#6364FF", characterLimit: 500, charLimit: 500, maxImages: 4, imgLimit: 4, supportsVideo: true, video: true, supportsComments: true, apiBadge: "ActivityPub" },
  { key: "yelp", id: "yelp", displayName: "Yelp Business", name: "Yelp", category: "Creative & Niche", brandColor: "#D32323", characterLimit: 5000, charLimit: 5000, maxImages: 10, imgLimit: 10, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Yelp Fusion" },
  { key: "rss", id: "rss", displayName: "RSS Feed Dispatch", name: "RSS Feed", category: "Creative & Niche", brandColor: "#EE802F", characterLimit: 10000, charLimit: 10000, maxImages: 5, imgLimit: 5, supportsVideo: true, video: true, supportsComments: false, apiBadge: "RSS 2.0 / Atom" },
  { key: "wordpress", id: "wordpress", displayName: "WordPress", name: "WordPress", category: "Creative & Niche", brandColor: "#21759B", characterLimit: 50000, charLimit: 50000, maxImages: 20, imgLimit: 20, supportsVideo: true, video: true, supportsComments: true, apiBadge: "REST API v2" },
  { key: "twitter", id: "twitter", displayName: "Twitter (Legacy)", name: "Twitter", category: "Major", brandColor: "#1DA1F2", characterLimit: 280, charLimit: 280, maxImages: 4, imgLimit: 4, supportsVideo: true, video: true, supportsComments: true, apiBadge: "Twitter API v2" },
];

export const PLATFORM_CONFIG: Record<
  string,
  {
    name: string;
    brandColor: string;
    glowColor: string;
    bgGradient: string;
    hoverBorder: string;
    apiName: string;
    charLimit: number;
    description: string;
  }
> = {
  linkedin: {
    name: "LinkedIn",
    brandColor: "#0A66C2",
    glowColor: "rgba(10, 102, 194, 0.4)",
    bgGradient: "from-[#0A66C2]/15 via-[#004182]/10 to-transparent",
    hoverBorder: "hover:border-[#0A66C2]/60 hover:shadow-[0_0_25px_rgba(10,102,194,0.25)]",
    apiName: "LinkedIn Share & Community API v2",
    charLimit: 3000,
    description: "Enterprise partner publishing for profiles, company pages, PDF carousels, and article syndication.",
  },
  facebook: {
    name: "Facebook",
    brandColor: "#1877F2",
    glowColor: "rgba(24, 119, 242, 0.4)",
    bgGradient: "from-[#1877F2]/15 via-[#0C58BD]/10 to-transparent",
    hoverBorder: "hover:border-[#1877F2]/60 hover:shadow-[0_0_25px_rgba(24,119,242,0.25)]",
    apiName: "Meta Graph API v19.0",
    charLimit: 63206,
    description: "Scheduled publishing to Facebook Business Pages and Groups with video reels and geo-targeting.",
  },
  instagram: {
    name: "Instagram",
    brandColor: "#E4405F",
    glowColor: "rgba(228, 64, 95, 0.4)",
    bgGradient: "from-[#833AB4]/20 via-[#FD1D1D]/15 to-[#FCAF45]/15",
    hoverBorder: "hover:border-[#E4405F]/60 hover:shadow-[0_0_25px_rgba(228,64,95,0.25)]",
    apiName: "Instagram Graph API v19.0",
    charLimit: 2200,
    description: "Publish photo carousels, stories, and high-framerate 9:16 Instagram Reels with first-comment scheduling.",
  },
  tiktok: {
    name: "TikTok",
    brandColor: "#000000",
    glowColor: "rgba(0, 242, 254, 0.4)",
    bgGradient: "from-[#FE2C55]/15 via-slate-900/40 to-[#00F2FE]/15",
    hoverBorder: "hover:border-[#00F2FE]/50 hover:shadow-[0_0_25px_rgba(254,44,85,0.25)]",
    apiName: "TikTok Content Posting API v2",
    charLimit: 2200,
    description: "Direct creator profile video dispatch with duet/stitch permissions and commercial sound verification.",
  },
  x: {
    name: "X (Twitter)",
    brandColor: "#000000",
    glowColor: "rgba(148, 163, 184, 0.4)",
    bgGradient: "from-slate-700/20 via-slate-800/15 to-transparent",
    hoverBorder: "hover:border-slate-400/60 hover:shadow-[0_0_20px_rgba(148,163,184,0.2)]",
    apiName: "X Developer API v2",
    charLimit: 280,
    description: "Native 280-character microblogging, multi-tweet thread builder, automated polls, and mention streaming.",
  },
  threads: {
    name: "Threads",
    brandColor: "#000000",
    glowColor: "rgba(148, 163, 184, 0.4)",
    bgGradient: "from-slate-700/20 via-zinc-800/20 to-transparent",
    hoverBorder: "hover:border-zinc-400/60 hover:shadow-[0_0_20px_rgba(148,163,184,0.2)]",
    apiName: "Official Meta Threads API v1",
    charLimit: 500,
    description: "Publish text updates, photo carousels, and synced conversation threads with Meta's official API.",
  },
  youtube: {
    name: "YouTube",
    brandColor: "#FF0000",
    glowColor: "rgba(255, 0, 0, 0.4)",
    bgGradient: "from-[#FF0000]/15 via-[#990000]/10 to-transparent",
    hoverBorder: "hover:border-[#FF0000]/60 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)]",
    apiName: "YouTube Data API v3",
    charLimit: 5000,
    description: "Publish YouTube Shorts & long-form 4K video uploads with custom thumbnails, tags, and indexing.",
  },
  pinterest: {
    name: "Pinterest",
    brandColor: "#E60023",
    glowColor: "rgba(230, 0, 35, 0.4)",
    bgGradient: "from-[#E60023]/15 via-[#AD001B]/10 to-transparent",
    hoverBorder: "hover:border-[#E60023]/60 hover:shadow-[0_0_25px_rgba(230,0,35,0.25)]",
    apiName: "Pinterest Business API v5",
    charLimit: 500,
    description: "High-resolution Idea and Standard Pin creation with board target routing and rich visual SEO.",
  },
  wordpress: {
    name: "WordPress",
    brandColor: "#21759B",
    glowColor: "rgba(33, 117, 155, 0.4)",
    bgGradient: "from-[#21759B]/15 via-[#135E7E]/10 to-transparent",
    hoverBorder: "hover:border-[#21759B]/60 hover:shadow-[0_0_25px_rgba(33,117,155,0.25)]",
    apiName: "WordPress REST API v2",
    charLimit: 50000,
    description: "Self-hosted and WordPress.com blog publishing with Gutenberg blocks, featured media, and tags.",
  },
};

export function SocialPlatformIcon({
  platform,
  name,
  size = "md",
  className = "",
  variant = "brand",
}: PlatformIconProps) {
  const plat = platform || name || "linkedin";
  const normKey = plat.toLowerCase().replace(/[\s\-_/()]/g, "");
  const px = sizeMap[size] || 24;


  // Normalized Platform Resolution
  let key: PlatformKey | string = "other";
  if (normKey.includes("behance")) key = "behance";
  else if (normKey.includes("bluesky") || normKey.includes("bsky")) key = "bluesky";
  else if (normKey.includes("discord")) key = "discord";
  else if (normKey.includes("dribbble")) key = "dribbble";
  else if (normKey.includes("facebook") || normKey === "fb") key = "facebook";
  else if (normKey.includes("github")) key = "github";
  else if (normKey.includes("instagram") || normKey === "ig") key = "instagram";
  else if (normKey.includes("kick")) key = "kick";
  else if (normKey.includes("kik")) key = "kik";
  else if (normKey.includes("linkedin") || normKey === "li") key = "linkedin";
  else if (normKey.includes("mastodon")) key = "mastodon";
  else if (normKey.includes("medium")) key = "medium";
  else if (normKey.includes("messenger")) key = "messenger";
  else if (normKey.includes("patreon")) key = "patreon";
  else if (normKey.includes("pinterest") || normKey === "pin") key = "pinterest";
  else if (normKey.includes("quora")) key = "quora";
  else if (normKey.includes("reddit")) key = "reddit";
  else if (normKey.includes("rss")) key = "rss";
  else if (normKey.includes("rumble")) key = "rumble";
  else if (normKey.includes("skype")) key = "skype";
  else if (normKey.includes("snapchat") || normKey === "snap") key = "snapchat";
  else if (normKey.includes("soundcloud")) key = "soundcloud";
  else if (normKey.includes("spotify")) key = "spotify";
  else if (normKey.includes("telegram") || normKey === "tg") key = "telegram";
  else if (normKey.includes("threads")) key = "threads";
  else if (normKey.includes("tiktok") || normKey === "tt") key = "tiktok";
  else if (normKey.includes("tumblr")) key = "tumblr";
  else if (normKey.includes("twitch")) key = "twitch";
  else if (normKey.includes("twitter") || normKey === "tw") key = "twitter";
  else if (normKey.includes("vimeo")) key = "vimeo";
  else if (normKey.includes("whatsapp") || normKey === "wa") key = "whatsapp";
  else if (normKey.includes("wordpress") || normKey === "wp") key = "wordpress";
  else if (normKey === "x" || normKey.includes("xtwitter")) key = "x";
  else if (normKey.includes("yelp")) key = "yelp";
  else if (normKey.includes("youtube") || normKey === "yt") key = "youtube";
  else key = normKey;

  const isBrand = variant === "brand" || variant === "gradient-bg";

  switch (key) {
    case "behance":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#000000" />
              <path d="M6 8.5h3.4c1.4 0 2.3.6 2.3 1.7 0 .8-.5 1.3-1.2 1.5 1 .3 1.6.9 1.6 1.9 0 1.3-1.1 2-2.5 2H6V8.5zm2.1 2.8h1.1c.6 0 1-.3 1-.8 0-.6-.4-.8-1-.8H8.1v1.6zm0 3.1h1.3c.7 0 1.2-.3 1.2-.9 0-.6-.5-.9-1.2-.9H8.1v1.8zm6.4-1.7h3.4c-.2 1.3-1.2 2-2.3 2-1.3 0-2.3-1-2.3-2.3 0-1.4 1-2.4 2.4-2.4 1.4 0 2.3 1 2.3 2.5v.2h-3.5zm2.2-.9c0-.6-.4-1-1.1-1-.6 0-1 .4-1.1 1h2.2zm-2.8-3.4h2.4v.8h-2.4v-.8z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M7 6h4.5c2.2 0 3.5 1.2 3.5 2.8 0 1.2-.8 2-1.8 2.4 1.4.4 2.3 1.4 2.3 2.9 0 2-1.6 3.1-3.8 3.1H7V6zm3 4.2h1.4c.8 0 1.3-.4 1.3-1.1 0-.7-.5-1.1-1.3-1.1H10v2.2zm0 4.8h1.6c.9 0 1.5-.4 1.5-1.2 0-.8-.6-1.2-1.5-1.2H10V15zm8.5-3.2h5c-.3 2-1.8 3.2-3.6 3.2-2 0-3.6-1.6-3.6-3.7 0-2.2 1.6-3.8 3.7-3.8 2.2 0 3.7 1.6 3.7 3.9v.4h-5.4zm3.4-1.4c0-1-.7-1.6-1.7-1.6-1 0-1.6.6-1.7 1.6h3.4zM18.5 7h4v1.2h-4V7z" fill="currentColor" />
          )}
        </svg>
      );

    case "bluesky":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#1185FE" />
              <path d="M12 10.8c-1.3-2.5-3.8-5.3-6.5-6.6C2.8 2.9 1.5 3.5 1.5 5.5c0 1.6.8 6.4 1.3 7.8 1.4 3.9 4.3 4.9 7.4 4.5-4.4 1.5-6.6 4.1-3.7 7 4.4 4.4 5.5-2.2 5.5-2.2s1.1 6.6 5.5 2.2c2.9-2.9.7-5.5-3.7-7 3.1.4 6-.6 7.4-4.5.5-1.4 1.3-6.2 1.3-7.8 0-2-1.3-2.6-4-1.3-2.7 1.3-5.2 4.1-6.5 6.6z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 10.8c-1.3-2.5-3.8-5.3-6.5-6.6C2.8 2.9 1.5 3.5 1.5 5.5c0 1.6.8 6.4 1.3 7.8 1.4 3.9 4.3 4.9 7.4 4.5-4.4 1.5-6.6 4.1-3.7 7 4.4 4.4 5.5-2.2 5.5-2.2s1.1 6.6 5.5 2.2c2.9-2.9.7-5.5-3.7-7 3.1.4 6-.6 7.4-4.5.5-1.4 1.3-6.2 1.3-7.8 0-2-1.3-2.6-4-1.3-2.7 1.3-5.2 4.1-6.5 6.6z" fill="currentColor" />
          )}
        </svg>
      );

    case "discord":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#5865F2" />
              <path d="M16.5 7.8s-.9-.7-2-.8l-.1.2c1.1.3 1.6.8 1.6.8-1-.5-2-.8-3-.9-1-.1-2-.1-3 .1-.8.2-1.7.5-2.6 1 0 0 .5-.5 1.7-.8l-.1-.2c-1.1.1-2 .8-2 .8-1.5 2.2-1.9 4.3-1.7 6.4 1 1 2.3 1.1 2.3 1.1l.6-.8c-.8-.2-1.2-.6-1.2-.6.1.1.2.1.3.2 1 .5 2.3.9 3.7.9s2.7-.4 3.7-.9c.2-.1.3-.1.4-.2 0 0-.4.4-1.2.6l.6.8s1.3-.1 2.3-1.1c.3-2.1-.1-4.2-1.6-6.4zm-6.2 5.1c-.6 0-1-.5-1-1.2s.5-1.2 1-1.2 1 .5 1 1.2-.4 1.2-1 1.2zm3.4 0c-.6 0-1-.5-1-1.2s.5-1.2 1-1.2 1 .5 1 1.2-.5 1.2-1 1.2z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.1.1 0 0 0-.1.1c-.2.4-.4.9-.6 1.3a18.3 18.3 0 0 0-5.4 0c-.2-.4-.4-.9-.6-1.3a.1.1 0 0 0-.1-.1A19.7 19.7 0 0 0 3.7 4.4a.1.1 0 0 0 0 .1C.8 8.8 0 13.1.4 17.3a.1.1 0 0 0 .1.1 19.9 19.9 0 0 0 6 3 .1.1 0 0 0 .1 0c.5-.6.9-1.3 1.3-2a.1.1 0 0 0-.1-.1 13 13 0 0 1-1.9-.9.1.1 0 0 1 0-.2c.1-.1.3-.2.4-.3a14.2 14.2 0 0 0 11.4 0c.1.1.3.2.4.3a.1.1 0 0 1 0 .2c-.6.3-1.2.6-1.9.9a.1.1 0 0 0-.1.1c.4.7.8 1.4 1.3 2a.1.1 0 0 0 .1 0 19.8 19.8 0 0 0 6-3 .1.1 0 0 0 .1-.1c.5-4.8-.8-9.1-3.3-12.9a.1.1 0 0 0 0-.1zM8.5 14.8c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5zm7 0c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5z" fill="currentColor" />
          )}
        </svg>
      );

    case "dribbble":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#000000" />
              <path d="M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm4.5 3.3c-.6.5-1.5.9-2.6 1.1a12.6 12.6 0 0 0-1.8-3.1 5.3 5.3 0 0 1 4.4 2zm-5.7-2.3c.7.9 1.4 2 1.8 3.1a17.8 17.8 0 0 1-5.3 1 5.3 5.3 0 0 1 3.5-4.1zm-4.4 5.3a19 19 0 0 0 5-.9c.2.6.4 1.2.6 1.8-2.7.8-5.3.8-5.6.8v-.2a5.4 5.4 0 0 1 0-1.5zm1.5 3.4c.5 0 2.6 0 5-.7.4 1.1.7 2.1.8 2.7a5.3 5.3 0 0 1-5.8-2zm7 1.3c-.2-.6-.5-1.5-.8-2.6 1-.2 2.2-.2 3.4-.2a5.3 5.3 0 0 1-2.6 2.8zm1.6-3.8c-1.1 0-2.2 0-3.2.2-.2-.6-.4-1.2-.6-1.7 1-.2 2.1-.6 2.8-1.2a5.3 5.3 0 0 1 1 2.7z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.9 8.2c-.8.8-2.2 1.4-3.9 1.7a18.8 18.8 0 0 0-2.8-4.7 8.1 8.1 0 0 1 6.7 3zm-8.8-3.5c1 1.4 2 3 2.8 4.7a26.7 26.7 0 0 1-8 1.5A8.1 8.1 0 0 1 10.1 6.7zm-6.6 8a28.5 28.5 0 0 0 7.6-1.4c.3.9.6 1.8 1 2.7-4.1 1.2-8 1.2-8.5 1.2a8.1 8.1 0 0 1-.1-2.5zm2.3 5.1c.8 0 4-.1 7.6-1.1.6 1.6 1 3.1 1.2 4a8.1 8.1 0 0 1-8.8-2.9zm10.5 2a30.8 30.8 0 0 1-1.3-3.9c1.6-.3 3.4-.3 5.1-.3a8.1 8.1 0 0 1-3.8 4.2zm2.4-5.8c-1.7 0-3.3 0-4.8.3-.3-.9-.6-1.8-.9-2.6 1.6-.3 3.2-.9 4.2-1.8a8.1 8.1 0 0 1 1.5 4.1z" fill="currentColor" />
          )}
        </svg>
      );

    case "facebook":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#1877F2" />
              <path d="M13.6 21.6V13.9H16.2L16.6 10.9H13.6V9C13.6 8.1 13.8 7.5 15.1 7.5H16.7V4.8C16.4 4.8 15.4 4.7 14.3 4.7C11.9 4.7 10.3 6.1 10.3 8.7V10.9H7.7V13.9H10.3V21.6C10.8 21.7 11.4 21.8 12 21.8C12.5 21.8 13.1 21.7 13.6 21.6Z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" fill="currentColor" />
          )}
        </svg>
      );

    case "github":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#181717" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
              <path d="M12 5.5a6.5 6.5 0 0 0-2.1 12.7c.3.1.4-.1.4-.3v-1.1c-1.8.4-2.2-.9-2.2-.9-.3-.8-.7-1-.7-1-.6-.4 0-.4 0-.4.7 0 1 .7 1 .7.6 1 1.5.7 1.9.5 0-.4.2-.7.4-.9-1.4-.2-3-.7-3-3.1 0-.7.2-1.3.7-1.7 0-.2-.3-.8.1-1.7 0 0 .5-.2 1.8.7a6.2 6.2 0 0 1 3.3 0c1.3-.9 1.8-.7 1.8-.7.4.9.1 1.5.1 1.7.5.4.7 1 .7 1.7 0 2.4-1.5 2.9-3 3.1.2.2.4.6.4 1.2v1.8c0 .2.1.4.4.3A6.5 6.5 0 0 0 12 5.5z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.4 3.5 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.4 18.3 4.7 18.3 4.7c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" fill="currentColor" />
          )}
        </svg>
      );

    case "instagram":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          <defs>
            <radialGradient id={`ig-round-grad-${px}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6.5 22.5) rotate(-65.7) scale(25.5 26.5)">
              <stop offset="0%" stopColor="#FFDD55" />
              <stop offset="15%" stopColor="#FF543E" />
              <stop offset="55%" stopColor="#C837AB" />
              <stop offset="100%" stopColor="#7F3FB8" />
            </radialGradient>
          </defs>
          {isBrand ? (
            <>
              <rect width="24" height="24" rx="5.5" fill={`url(#ig-round-grad-${px})`} />
              <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
              <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
              <circle cx="15.6" cy="8.4" r="0.9" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor" />
          )}
        </svg>
      );

    case "kick":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#53FC18" />
              <path d="M5.5 8h2.2v8H5.5V8zm4 3.8L12.7 8h2.5l-3.6 4 3.9 4h-2.5l-3.5-4.2z" fill="#000000" />
            </>
          ) : (
            <path d="M4 4h4v16H4V4zm8 7.5L16.5 4h5L14.8 11.8 22 20h-5l-5-7.5v-1z" fill="currentColor" />
          )}
        </svg>
      );

    case "kik":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#82BC23" />
              <path d="M6 7.5h1.8v3.2l2.4-3.2h2.2l-2.8 3.6 3 4.4h-2.2L8 11.8v3.7H6V7.5zm7.8 2.2a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2zm-.9 1.3h1.8v4.5h-1.8V11zm3.2-3.5h1.8v3.2l2.4-3.2h2.2l-2.8 3.6 3 4.4h-2.2l-2.4-3.7v3.7h-1.8V7.5z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M2 6h3v5l4-5h3.5L8 11.5 13 18H9.5L5 12.8V18H2V6zm12 3.5a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm-1.5 2h3V18h-3v-6.5zm5.5-5.5h3v5l4-5h3.5L20 11.5 25 18h-3.5l-4.5-5.2V18H18V6z" fill="currentColor" />
          )}
        </svg>
      );

    case "linkedin":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <rect width="24" height="24" rx="5" fill="#0A66C2" />
              <path
                d="M6.9 18.5H4.3V10H6.9V18.5zM5.6 8.85a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM19.7 18.5h-2.6v-4.2c0-1.05-.38-1.75-1.32-1.75-.72 0-1.15.49-1.34.96-.07.17-.09.41-.09.65v4.34h-2.6s.03-7.65 0-8.5h2.6v1.2c.35-.54.97-1.32 2.39-1.32 1.75 0 3.06 1.14 3.06 3.6v4.97z"
                fill="#FFFFFF"
              />
            </>
          ) : (
            <path
              d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
              fill="currentColor"
            />
          )}
        </svg>
      );

    case "mastodon":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#6364FF" />
              <path d="M17.4 9.5c-.2-2.1-1.8-2.7-1.8-2.7-1.7-.8-4.2-.8-4.2-.8h-.1s-2.5 0-4.2.8c0 0-1.6.6-1.8 2.7-.2 2.3-.2 4.7-.2 4.7s0 2.6.4 4c.4 1.3 2 1.4 3.4 1.4 1.8 0 2.8-.5 2.8-.5l-.1-1s-.8.3-2 .3c-1.2 0-2.4-.4-2.5-1.5 0 0 1.2.3 2.8.4 1 .1 2.2 0 3.3-.1 1.7-.2 3.1-1.1 3.3-2.5.3-2.3.2-5.2.2-5.2zm-2.4 5.3h-1.5v-3.8c0-.9-.4-1.3-1.1-1.3-.8 0-1.2.5-1.2 1.5v2.2H9.8v-2.2c0-1-.4-1.5-1.2-1.5-.7 0-1.1.4-1.1 1.3v3.8H6.1V11c0-1 .3-1.8.8-2.3.6-.5 1.3-.8 2.2-.8 1 0 1.9.4 2.4 1.2.6-.8 1.4-1.2 2.4-1.2.9 0 1.6.3 2.2.8.6.5.8 1.3.8 2.3v3.8z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M21.3 10.5c-.3-3.2-2.4-4.1-2.4-4.1-2.3-1.1-5.7-1.1-5.7-1.1h-.1s-3.4 0-5.7 1.1c0 0-2.1.9-2.4 4.1-.3 3.5-.3 7-.3 7s0 4 .5 6c.5 2 2.7 2.1 4.6 2.1 2.4 0 3.8-.7 3.8-.7l-.2-1.5s-1.1.4-2.7.4c-1.6 0-3.3-.6-3.4-2.3 0 0 1.6.4 3.8.5 1.4.1 3 0 4.5-.2 2.3-.3 4.2-1.6 4.5-3.8.4-3.5.3-7.5.3-7.5zm-3.3 7.9h-2.3v-5.7c0-1.3-.6-2-1.7-2-1.2 0-1.8.8-1.8 2.3v3.3h-1.8v-3.3c0-1.5-.6-2.3-1.8-2.3-1.1 0-1.7.7-1.7 2v5.7H4.6v-5.8c0-1.5.4-2.7 1.2-3.5.9-.8 2-1.2 3.3-1.2 1.5 0 2.8.6 3.6 1.8.8-1.2 2.1-1.8 3.6-1.8 1.3 0 2.4.4 3.3 1.2.9.8 1.2 2 1.2 3.5v5.8z" fill="currentColor" />
          )}
        </svg>
      );

    case "medium":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#000000" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
              <ellipse cx="8.5" cy="12" rx="3.5" ry="3.8" fill="#FFFFFF" />
              <ellipse cx="14" cy="12" rx="1.8" ry="3.6" fill="#FFFFFF" />
              <ellipse cx="17.2" cy="12" rx="0.7" ry="3.2" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M13.5 12c0 3.6-2.9 6.5-6.5 6.5S.5 15.6.5 12 3.4 5.5 7 5.5s6.5 2.9 6.5 6.5zm5.5 0c0 3.4-1.5 6.2-3.3 6.2S12.4 15.4 12.4 12s1.5-6.2 3.3-6.2 3.3 2.8 3.3 6.2zm4.5 0c0 3.1-.5 5.6-1.1 5.6s-1.1-2.5-1.1-5.6.5-5.6 1.1-5.6 1.1 2.5 1.1 5.6z" fill="currentColor" />
          )}
        </svg>
      );

    case "messenger":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          <defs>
            <linearGradient id={`msgr-grad-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C6FF" />
              <stop offset="50%" stopColor="#0078FF" />
              <stop offset="100%" stopColor="#A033FF" />
            </linearGradient>
          </defs>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill={`url(#msgr-grad-${px})`} />
              <path d="M12 5.5C8.4 5.5 5.5 8.1 5.5 11.4c0 1.9 1 3.6 2.5 4.6v2.3l2.2-1.2c.6.2 1.2.3 1.8.3 3.6 0 6.5-2.6 6.5-5.9S15.6 5.5 12 5.5zm.7 7.9l-1.8-1.9-3.4 1.9 3.8-4 1.8 1.9 3.4-1.9-3.8 4z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2C6.4 2 1.8 6.2 1.8 11.5c0 3 1.5 5.7 3.8 7.3V23l4.2-2.3c.7.2 1.5.3 2.2.3 5.6 0 10.2-4.2 10.2-9.5S17.6 2 12 2zm1.2 12.8L10 11.7l-5.8 3.1 6.3-6.7 3.3 3.1 5.7-3.1-6.3 6.7z" fill="currentColor" />
          )}
        </svg>
      );

    case "patreon":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#FF424D" />
              <circle cx="14.5" cy="10" r="3.8" fill="#FFFFFF" />
              <rect x="6.5" y="6.5" width="2.4" height="11" rx="0.5" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M14.8 3a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6zM2 3h3.6v18H2V3z" fill="currentColor" />
          )}
        </svg>
      );

    case "pinterest":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#E60023" />
              <path d="M12 3.6C7.36 3.6 3.6 7.36 3.6 12c0 3.56 2.22 6.6 5.37 7.82-.07-.66-.14-1.68.03-2.4.15-.65 1.01-4.28 1.01-4.28s-.26-.52-.26-1.28c0-1.2.7-2.1 1.56-2.1.74 0 1.09.55 1.09 1.22 0 .74-.47 1.85-.72 2.88-.2.86.43 1.56 1.28 1.56 1.54 0 2.72-1.62 2.72-3.96 0-2.07-1.49-3.52-3.62-3.52-2.47 0-3.92 1.85-3.92 3.77 0 .75.29 1.54.65 1.98.07.09.08.17.06.26-.07.28-.22.88-.25 1-.04.17-.14.2-.32.12-1.2-.56-1.95-2.31-1.95-3.72 0-3.03 2.2-5.81 6.35-5.81 3.34 0 5.93 2.38 5.93 5.56 0 3.31-2.09 5.98-4.99 5.98-.97 0-1.89-.51-2.2-.11l-.6 2.29c-.22.84-.81 1.9-1.21 2.54.91.28 1.88.43 2.89.43 4.64 0 8.4-3.76 8.4-8.4 0-4.64-3.76-8.4-8.4-8.4z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.67 11.17-.11-.95-.2-2.4.04-3.43.22-.93 1.44-6.12 1.44-6.12s-.37-.74-.37-1.83c0-1.71.99-3 2.23-3 1.05 0 1.56.79 1.56 1.74 0 1.06-.68 2.64-1.03 4.11-.29 1.23.62 2.23 1.83 2.23 2.2 0 3.89-2.32 3.89-5.66 0-2.96-2.13-5.03-5.17-5.03-3.52 0-5.6 2.64-5.6 5.38 0 1.06.41 2.2 0.93 2.83.1.12.12.23.09.35-.1.4-.32 1.3-.36 1.48-.06.24-.2.29-.46.17-1.71-.8-2.78-3.3-2.78-5.31 0-4.32 3.14-8.3 9.07-8.3 4.77 0 8.47 3.4 8.47 7.94 0 4.74-2.98 8.55-7.13 8.55-1.39 0-2.7-.72-3.15-1.58l-.86 3.28c-.31 1.2-1.16 2.71-1.73 3.63 1.3.4 2.68.62 4.12.62 6.63 0 12-5.37 12-12S18.63 0 12 0z" fill="currentColor" />
          )}
        </svg>
      );

    case "quora":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#B92B27" />
              <path d="M13.2 17.5c-.7.3-1.5.4-2.4.4-3.5 0-5.8-2.6-5.8-6.1 0-3.6 2.4-6.1 5.9-6.1 3.5 0 5.8 2.5 5.8 6.1 0 1.6-.5 3-1.4 4.1l1.5 2.1c.3.4.1.7-.3.7h-.9c-.4 0-.8-.2-1-.5l-1.4-2zm-2.4-1.7c2.4 0 3.9-1.9 3.9-4.3 0-2.4-1.5-4.3-3.9-4.3-2.4 0-3.9 1.9-3.9 4.3 0 2.4 1.5 4.3 3.9 4.3z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M13.2 17.5c-.7.3-1.5.4-2.4.4-3.5 0-5.8-2.6-5.8-6.1 0-3.6 2.4-6.1 5.9-6.1 3.5 0 5.8 2.5 5.8 6.1 0 1.6-.5 3-1.4 4.1l1.5 2.1c.3.4.1.7-.3.7h-.9c-.4 0-.8-.2-1-.5l-1.4-2zm-2.4-1.7c2.4 0 3.9-1.9 3.9-4.3 0-2.4-1.5-4.3-3.9-4.3-2.4 0-3.9 1.9-3.9 4.3 0 2.4 1.5 4.3 3.9 4.3z" fill="currentColor" />
          )}
        </svg>
      );

    case "reddit":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#FF4500" />
              <path d="M17.8 11.2c0-.7-.6-1.2-1.3-1.2-.3 0-.7.1-.9.4-1-.7-2.3-1.1-3.8-1.2l.6-3 2.1.5c0 .6.5 1.1 1.1 1.1.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1 .8l-2.4-.5c-.1 0-.3.1-.3.2l-.8 3.5c-1.5 0-2.8.5-3.8 1.2-.3-.3-.6-.4-1-.4-.7 0-1.3.5-1.3 1.2 0 .5.3.9.7 1.1 0 .2-.1.4-.1.7 0 2.2 2.6 4 5.8 4s5.8-1.8 5.8-4c0-.2 0-.5-.1-.7.4-.2.7-.6.7-1.1zm-8.2 1.4c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm4.8 3.1c-.7.7-2 .7-2.4.7s-1.7 0-2.4-.7c-.1-.1-.1-.3 0-.4s.3-.1.4 0c.5.5 1.4.6 2 .6s1.5-.1 2-.6c.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.4-2.2c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.8 11.2c0 .7-.6 1.3-1.3 1.3-.4 0-.7-.2-.9-.4-1 .7-2.3 1.2-3.8 1.2l.6-3 2.1.5c0 .6.5 1.1 1.1 1.1.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1 .8l-2.4-.5c-.1 0-.3.1-.3.2l-.8 3.5c-1.5 0-2.8.5-3.8 1.2-.3-.3-.6-.4-1-.4-.7 0-1.3.5-1.3 1.2 0 .5.3.9.7 1.1 0 .2-.1.4-.1.7 0 2.2 2.6 4 5.8 4s5.8-1.8 5.8-4c0-.2 0-.5-.1-.7.4-.2.7-.6.7-1.1z" fill="currentColor" />
          )}
        </svg>
      );

    case "rss":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#EE802F" />
              <circle cx="7.8" cy="16.2" r="1.6" fill="#FFFFFF" />
              <path d="M6.2 10.6c3.2 0 5.8 2.6 5.8 5.8h1.9c0-4.3-3.4-7.7-7.7-7.7v1.9zm0-4.3c5.6 0 10.1 4.5 10.1 10.1h1.9c0-6.6-5.4-12-12-12v1.9z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27zm0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93z" fill="currentColor" />
          )}
        </svg>
      );

    case "rumble":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#85C742" />
              <path d="M8.2 6.8c-.8 0-1.5.6-1.7 1.4L5.2 13c-.3 1.2.6 2.3 1.8 2.3h2.8l4.8 3.5c1 .7 2.4 0 2.4-1.2V6.4c0-1.2-1.4-1.9-2.4-1.2L9.8 8.7H8.2zm4.1 3.5l2.2-1.6v6.6l-2.2-1.6V10.3z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.5H7.4c-1.2 0-2.1-1.1-1.8-2.3l1.3-4.8c.2-.8.9-1.4 1.7-1.4h1.6l4.8-3.5c1-.7 2.4 0 2.4 1.2v11.9c0 1.2-1.4 1.9-2.4 1.2l-4.8-3.5z" fill="currentColor" />
          )}
        </svg>
      );

    case "skype":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#00AFF0" />
              <path d="M16.5 13.8c0-2-1.3-2.8-3.2-3.2l-1.3-.3c-.9-.2-1.2-.5-1.2-.9 0-.6.5-1 1.4-1 .8 0 1.8.3 2.5.8l.8-1.5c-.9-.6-2.1-.9-3.3-.9-2.2 0-3.6 1.3-3.6 3 0 1.8 1.2 2.6 3 3l1.3.3c.9.2 1.4.6 1.4 1.1 0 .7-.7 1.1-1.6 1.1-1.2 0-2.4-.5-3.2-1.1l-.8 1.5c1 .8 2.4 1.3 3.9 1.3 2.3.1 3.9-1.2 3.9-3.2z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2a10 10 0 0 0-4.6 1.1A6.2 6.2 0 0 0 3.1 7.4 10 10 0 0 0 2 12a10 10 0 0 0 1.1 4.6 6.2 6.2 0 0 0 4.3 4.3A10 10 0 0 0 12 22a10 10 0 0 0 4.6-1.1 6.2 6.2 0 0 0 4.3-4.3A10 10 0 0 0 22 12a10 10 0 0 0-1.1-4.6 6.2 6.2 0 0 0-4.3-4.3A10 10 0 0 0 12 2zm4.5 11.8c0 2-1.6 3.3-3.9 3.3-1.5 0-2.9-.5-3.9-1.3l.8-1.5c.8.6 2 1.1 3.2 1.1.9 0 1.6-.4 1.6-1.1 0-.5-.5-.9-1.4-1.1l-1.3-.3c-1.8-.4-3-1.2-3-3 0-1.7 1.4-3 3.6-3 1.2 0 2.4.3 3.3.9l-.8 1.5c-.7-.5-1.7-.8-2.5-.8-.9 0-1.4.4-1.4 1 0 .4.3.7 1.2.9l1.3.3c1.9.4 3.2 1.2 3.2 3.2z" fill="currentColor" />
          )}
        </svg>
      );

    case "snapchat":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#FFFC00" />
              <path d="M12 6.2c-1.8 0-3.1 1.4-3.1 3.2 0 .5.2 1.2.2 1.4-.3.1-.9.4-1.2.6-.2.1-.3.3-.1.5.2.2.6.3 1 .2.2.5.4 1.1.8 1.5-.7.2-1.6.5-1.6 1.1 0 .5.7.7 1.2.8.5.1 1 .2 1.4.7.4.4.9.4 1.4.2.5.2 1 .2 1.4-.2.4-.5.9-.6 1.4-.7.5-.1 1.2-.3 1.2-.8 0-.6-.9-.9-1.6-1.1.4-.4.6-1 .8-1.5.4.1.8 0 1-.2.2-.2.1-.4-.1-.5-.3-.2-.9-.5-1.2-.6 0-.2.2-.9.2-1.4 0-1.8-1.3-3.2-3.1-3.2z" fill="#000000" />
              <path d="M12 6.8c-1.4 0-2.5 1.1-2.5 2.6 0 .4.1 1 .2 1.2-.3.1-.7.3-1 .5 0 0 0 .1.1.1.2.1.5.1.8.1.2.5.4 1 .7 1.4-.7.2-1.3.4-1.3.8 0 .3.5.5 1 .6.4.1.8.2 1.2.6.4.4.8.4 1.2.2.4.2.8.2 1.2-.2.4-.4.8-.5 1.2-.6.5-.1 1-.3 1-.6 0-.4-.6-.6-1.3-.8.3-.4.5-.9.7-1.4.3 0 .6 0 .8-.1.1 0 .1-.1.1-.1-.3-.2-.7-.4-1-.5 0-.2.2-.8.2-1.2 0-1.5-1.1-2.6-2.5-2.6z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2.5C8.8 2.5 6.5 5 6.5 8.2c0 .9.3 2.1.4 2.5-.5.2-1.6.7-2.1 1-.4.2-.5.5-.2.9.4.4 1.1.5 1.8.4.4.9.7 2 1.4 2.7-1.2.4-2.8.9-2.8 2 0 .9 1.2 1.3 2.1 1.4.9.2 1.8.4 2.5 1.3.7.7 1.6.7 2.5.4.9.3 1.8.3 2.5-.4.7-.9 1.6-1.1 2.5-1.3.9-.1 2.1-.5 2.1-1.4 0-1.1-1.6-1.6-2.8-2 .7-.7 1-1.8 1.4-2.7.7.1 1.4 0 1.8-.4.3-.4.2-.7-.2-.9-.5-.3-1.6-.8-2.1-1 .1-.4.4-1.6.4-2.5 0-3.2-2.3-5.7-5.5-5.7z" fill="currentColor" />
          )}
        </svg>
      );

    case "soundcloud":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#FF5500" />
              <path d="M5.5 14.5h.7v-2.3h-.7v2.3zm1.4.5h.7V11h-.7v4zm1.4.3h.7V9.5h-.7v5.8zm1.4 0h.7V8.8h-.7v6.5zm1.4 0h.7V9.2h-.7v6.1zm1.4 0h.7V9.8h-.7v5.5zm4.8-6.1c-.3 0-.6.1-.8.2-.4-.8-1.2-1.3-2.1-1.3-.4 0-.8.1-1.1.3v7h5.4c1.3 0 2.3-1 2.3-2.3 0-1.3-1-2.4-2.3-2.4-.5-.9-1.4-1.5-2.4-1.5h1z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M1.5 12h1v4h-1zm2-2h1v6h-1zm2-1h1v7h-1zm2-2h1v9h-1zm2 1h1v8h-1zm2-1h1v9h-1zm8 2c-.4 0-.8.1-1.1.3-.6-1.2-1.8-2-3.2-2-.6 0-1.2.2-1.7.5v9.2h8.5c2 0 3.5-1.6 3.5-3.5 0-2-1.6-3.6-3.5-3.6-.8-1.5-2.2-2.4-3.8-2.4h1.3z" fill="currentColor" />
          )}
        </svg>
      );

    case "spotify":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#1DB954" />
              <path d="M16.4 16.2c-.2.3-.6.4-.9.2-2.4-1.5-5.4-1.8-8.9-1-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3.9zm1.3-2.7c-.2.4-.7.5-1.1.3-2.7-1.7-6.9-2.2-10.1-1.2-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.7-1.1 8.3-.6 11.3 1.3.4.3.6.8.3 1.2zm.1-2.9c-3.3-2-8.7-2.1-11.8-1.2-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.7-1.1 9.6-.9 13.4 1.4.5.3.6.9.3 1.4-.3.4-.9.5-1.3.2z" fill="#000000" />
            </>
          ) : (
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3c-.2.4-.7.5-1.1.3-3-1.8-6.8-2.3-11.2-1.2-.4.1-.9-.2-1-.6-.1-.4.2-.9.6-1 4.9-1.1 9.1-.6 12.4 1.4.4.3.5.7.3 1.1zm1.5-3.3c-.3.4-.8.6-1.3.3-3.4-2.1-8.6-2.7-12.7-1.5-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 4.6-1.4 10.3-.7 14.2 1.7.4.3.6.8.4 1.3zm.1-3.4c-4.1-2.4-10.8-2.6-14.7-1.5-.6.2-1.3-.2-1.5-.8-.2-.6.2-1.3.8-1.5 4.5-1.4 11.9-1.1 16.6 1.7.6.3.7 1.1.4 1.7-.3.5-1.1.7-1.6.4z" fill="currentColor" />
          )}
        </svg>
      );

    case "telegram":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#26A5E4" />
              <path d="M6.2 11.8l10.4-4.3c.5-.2.9.1.8.7l-1.8 8.3c-.1.6-.5.7-1 .4l-2.7-2-1.3 1.3c-.1.1-.3.3-.6.3l.2-2.7 5-4.5c.2-.2 0-.3-.3-.1l-6.1 3.9-2.6-.8c-.6-.2-.6-.6.1-.8z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 7.6l-2.2 10.4c-.2.7-.6.9-1.2.5l-3.4-2.5-1.6 1.6c-.2.2-.3.3-.7.3l.2-3.4 6.2-5.6c.3-.3-.1-.4-.4-.2l-7.7 4.9-3.3-1c-.7-.2-.7-.7.1-1l13-5c.6-.2 1.1.1.9.8z" fill="currentColor" />
          )}
        </svg>
      );

    case "threads":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <rect width="24" height="24" rx="5.5" fill="#000000" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <g transform="translate(3.4, 3.4) scale(0.71)">
                <path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" fill="#FFFFFF" />
              </g>
            </>
          ) : (
            <path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" fill="currentColor" />
          )}
        </svg>
      );

    case "tiktok":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#000000" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <path d="M15.4 6.8c.6.7 1.4 1.2 2.3 1.3V10c-.8 0-1.6-.3-2.3-.7v4.6c0 2.4-1.9 4.3-4.3 4.3-2.4 0-4.3-1.9-4.3-4.3 0-2.4 1.9-4.3 4.3-4.3.3 0 .5 0 .8.1v2.1c-.3-.1-.5-.1-.8-.1-1.3 0-2.3 1-2.3 2.3 0 1.3 1 2.3 2.3 2.3 1.3 0 2.3-1 2.3-2.3V5.5h2.1v1.3z" fill="#00F2FE" />
              <path d="M15 6.4c.6.7 1.4 1.2 2.3 1.3V9.6c-.8 0-1.6-.3-2.3-.7v4.6c0 2.4-1.9 4.3-4.3 4.3-2.4 0-4.3-1.9-4.3-4.3 0-2.4 1.9-4.3 4.3-4.3.3 0 .5 0 .8.1v2.1c-.3-.1-.5-.1-.8-.1-1.3 0-2.3 1-2.3 2.3 0 1.3 1 2.3 2.3 2.3 1.3 0 2.3-1 2.3-2.3V5.1h2.1v1.3z" fill="#FE2C55" />
              <path d="M15.2 6.6c.6.7 1.4 1.2 2.3 1.3V9.8c-.8 0-1.6-.3-2.3-.7v4.6c0 2.4-1.9 4.3-4.3 4.3-2.4 0-4.3-1.9-4.3-4.3 0-2.4 1.9-4.3 4.3-4.3.3 0 .5 0 .8.1v2.1c-.3-.1-.5-.1-.8-.1-1.3 0-2.3 1-2.3 2.3 0 1.3 1 2.3 2.3 2.3 1.3 0 2.3-1 2.3-2.3V5.3h2.1v1.3z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.34 6.34 0 0 0 1.86-4.48v-6.9a8.16 8.16 0 0 0 4.91 1.63V6.95a4.83 4.83 0 0 1-1-.26z" fill="currentColor" />
          )}
        </svg>
      );

    case "tumblr":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#36465D" />
              <path d="M14.5 17.5c-1.8 0-2.8-.9-2.8-2.6V11h3.2V8.5h-3.2V5.8h-2.1c-.2 2.2-1.4 3.4-3.6 3.7v2h2v4.8c0 2.8 1.8 4.2 4.6 4.2 1.3 0 2.6-.4 3.3-.9l-.6-2.1c-.3.2-.6.3-.8.3z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M14.5 18c-2 0-3-1-3-3v-4.5H15V8h-3.5V4.5h-2.5C9 7 7.5 8.5 5 9v2.5h2.5V16c0 3.5 2.5 5.5 6 5.5 1.5 0 3-.5 4-1l-.8-2.5c-.7.4-1.4.5-2.2.5z" fill="currentColor" />
          )}
        </svg>
      );

    case "twitch":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#9146FF" />
              <path d="M6 6.5h12v7.2l-3.3 3.3h-2.5l-1.8 1.8h-1.8v-1.8H6V6.5zm7.4 6.8l2-2V7.7h-7v8h2.6v1.4l1.4-1.4h2l-1-1zm-2.8-3.9h1.4v2.8h-1.4V9.4zm3.8 0h1.4v2.8h-1.4V9.4z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M2.1 0L.4 4.3v15.3h5.1V24l4.3-4.3h3.4L21.9 11V0H2.1zm17.9 9.8l-3.4 3.4h-3.4l-2.6 2.6v-2.6H6.8V2.1h13.2v7.7zm-7.7-3.4h2.1v4.3h-2.1V6.4zm5.1 0h2.1v4.3h-2.1V6.4z" fill="currentColor" />
          )}
        </svg>
      );

    case "twitter":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#1DA1F2" />
              <path d="M17.5 8.5c-.5.2-1 .4-1.6.5.6-.4 1-1 1.2-1.6-.6.3-1.2.6-1.8.7-.5-.6-1.3-.9-2.1-.9-1.6 0-2.9 1.3-2.9 2.9 0 .2 0 .5.1.7-2.4-.1-4.6-1.3-6-3.1-.2.4-.4.9-.4 1.5 0 1 .5 1.9 1.3 2.4-.5 0-1-.1-1.4-.4v.1c0 1.4 1 2.6 2.3 2.9-.2.1-.5.1-.8.1-.2 0-.4 0-.5-.1.4 1.2 1.5 2 2.8 2-1 1-2.4 1.5-3.8 1.5-.3 0-.5 0-.8-.1 1.3.8 2.9 1.3 4.6 1.3 5.5 0 8.5-4.6 8.5-8.5v-.4c.6-.4 1.1-.9 1.5-1.5z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M23.95 4.57c-.88.39-1.83.65-2.82.77 1.01-.61 1.8-1.57 2.16-2.72-.95.56-2 .97-3.13 1.2A4.92 4.92 0 0 0 16.56 2.4c-2.72 0-4.93 2.21-4.93 4.93 0 .39.04.76.13 1.13C7.66 8.27 4.07 6.33 1.66 3.37c-.43.74-.67 1.59-.67 2.48 0 1.71.87 3.21 2.19 4.1-.8-.03-1.56-.25-2.22-.61v.06c0 2.39 1.7 4.38 3.95 4.83-.41.11-.85.17-1.3.17-.32 0-.63-.03-.93-.09.63 1.96 2.45 3.38 4.61 3.42-1.69 1.32-3.81 2.11-6.12 2.11-.4 0-.79-.02-1.18-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.51 14.01-14.01 0-.21 0-.43-.02-.64.96-.69 1.8-1.56 2.46-2.55z" fill="currentColor" />
          )}
        </svg>
      );

    case "vimeo":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#1AB7EA" />
              <path d="M18.5 8.2c-.1 2-1.5 4.6-4.1 7.8-2.7 3.3-5 5-6.8 5-.9 0-1.7-.8-2.3-2.5l-1.3-4.8C3.5 12 3 11.2 2.6 11.2c-.2 0-.8.4-1.7 1.1L0 11.1c1.2-1 2.3-2.1 3.5-3.2 1.6-1.4 2.7-2.1 3.5-2.1 1.8 0 2.9 1.2 3.2 3.7.4 2.6.7 4.2 1 4.8.6 1.4 1.3 2.1 2 2.1.6 0 1.2-.5 1.9-1.6.7-1.1 1.1-2 1.1-2.7 0-1.1-.5-1.7-1.5-1.7-.5 0-1 .1-1.5.3 1-3.3 2.9-4.9 5.8-4.8 2.1.1 3.2 1.3 3.1 3.4z" transform="translate(4, 3) scale(0.65)" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M22.84 8.23c-.12 2.5-1.85 5.92-5.18 10.25-3.45 4.49-6.37 6.74-8.75 6.74-1.47 0-2.72-1.36-3.75-4.08L2.9 13.06C2.17 10.27 1.48 8.87.84 8.87c-.24 0-1.07.51-2.48 1.53L-2.5 8.9C-1 7.57.48 6.09 1.94 4.46 3.96 2.67 5.43 1.74 6.35 1.67c2.31-.22 3.74 1.36 4.3 4.74.6 3.6 1 5.8 1.22 6.6.78 3.5 1.82 5.25 3.13 5.25 1 0 2.13-1.39 3.39-4.17 1.26-2.78 1.92-4.9 1.98-6.36.12-2.34-1.04-3.56-3.48-3.66-.96-.04-1.92.16-2.88.6 1.9-6.22 5.5-9.3 10.8-9.24 3.9.04 5.75 2.54 5.55 7.5z" transform="translate(1, 1) scale(0.9)" fill="currentColor" />
          )}
        </svg>
      );

    case "whatsapp":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#25D366" />
              <path d="M16.8 14.7c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.8.9-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.4.1-.5.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3 0-.1 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.3-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.3.1.2 1.6 2.5 3.9 3.5.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1 0-.3-.1-.5-.2zm-4.8 4.3c-1.3 0-2.5-.3-3.6-1l-.3-.2-2.7.7.7-2.6-.2-.3c-.8-1.2-1.2-2.5-1.2-3.9 0-3.9 3.2-7.1 7.3-7.1 1.9 0 3.8.8 5.1 2.1 1.4 1.3 2.1 3.2 2.1 5.1 0 4-3.2 7.2-7.2 7.2zm6.2-13.3C16.5 4.1 14.3 3.2 12 3.2 7.2 3.2 3.2 7.1 3.2 12c0 1.5.4 3.1 1.2 4.4L3 21l4.8-1.3c1.3.7 2.7 1.1 4.2 1.1 4.8 0 8.8-3.9 8.8-8.8 0-2.3-.9-4.5-2.6-6.3z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.68 10.92c-.26-.13-1.52-.75-1.75-.84-.23-.09-.4-.13-.57.13-.17.26-.66.84-.81 1.01-.15.18-.3.2-.56.07-.26-.13-1.1-.41-2.09-1.29-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45s-.57-1.37-.78-1.88c-.2-.49-.41-.43-.57-.44h-.48c-.17 0-.43.06-.66.3-.23.26-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.59.13.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.52-.62 1.73-1.22.22-.6.22-1.12.15-1.23-.06-.11-.23-.17-.49-.3z" fill="currentColor" />
          )}
        </svg>
      );

    case "wordpress":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="11" fill="#FFFFFF" />
              <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0" fill="#21759B" />
            </>
          ) : (
            <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0" fill="currentColor" />
          )}
        </svg>
      );

    case "x":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <rect width="24" height="24" rx="5.5" fill="#000000" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
              <path d="M15.4 6.5h2.2l-4.8 5.5 5.6 7.4h-4.4l-3.5-4.5-4 4.5H4.3l5.1-5.9L4 6.5h4.5l3.1 4.2 3.8-4.2zm-.8 11.6h1.2L8.9 7.8H7.6l7 10.3z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
          )}
        </svg>
      );

    case "yelp":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <circle cx="12" cy="12" r="12" fill="#D32323" />
              <path d="M12.5 10.5l2.4-4.8c.3-.6 1.1-.7 1.6-.3.4.4.5 1 .2 1.5l-2.4 4.2 2.8 1.4c.6.3.8 1.1.5 1.7-.3.5-.9.7-1.5.4l-4-2 .8 4.6c.1.6-.3 1.2-.9 1.3-.6.1-1.2-.3-1.3-.9l-.8-4.6-3.8 2.6c-.5.4-1.3.2-1.6-.3-.4-.5-.2-1.3.3-1.6l3.8-2.6-3.4-3.1c-.5-.4-.5-1.2-.1-1.7.4-.4 1.2-.5 1.7-.1l3.4 3.1 2.2-4.9c.3-.6 1-.9 1.6-.6.6.3.9 1 .6 1.6l-1.8 4.5z" transform="scale(0.85) translate(2, 2)" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-1 4.5c-.1.5-.6.8-1.1.7-.5-.1-.8-.6-.7-1.1l1-4.5-3.8 2.5c-.4.3-1 .2-1.3-.2-.3-.4-.2-1 .2-1.3l3.8-2.5-3.5-3c-.4-.3-.5-.9-.2-1.3.3-.4.9-.5 1.3-.2l3.5 3 2.1-4.8c.2-.5.8-.7 1.3-.5.5.2.7.8.5 1.3l-2.1 4.8 4.1 2c.5.2.7.8.5 1.3-.2.5-.8.7-1.3.5l-4.1-2 .9 4.6z" fill="currentColor" />
          )}
        </svg>
      );

    case "youtube":
      return (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
          {isBrand ? (
            <>
              <rect x="1" y="3.5" width="22" height="17" rx="5" fill="#FF0000" />
              <path d="M10 8.5L15.8 12L10 15.5V8.5Z" fill="#FFFFFF" />
            </>
          ) : (
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor" />
          )}
        </svg>
      );

    default:
      return (
        <div
          style={{ width: px, height: px }}
          className={`rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] ${className}`}
        >
          {plat.substring(0, 2).toUpperCase()}
        </div>
      );
  }
}

export const PlatformPillIcon = SocialPlatformIcon;

