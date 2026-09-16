export type PlatformType =
  | 'LINKEDIN'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'TWITTER'
  | 'YOUTUBE'
  | 'PINTEREST'
  | 'THREADS';

export interface ProviderCapabilities {
  platform: PlatformType;
  displayName: string;
  brandColor: string;
  iconName: string;
  characterLimit: number;
  supportsImages: boolean;
  maxImages: number;
  supportsVideo: boolean;
  maxVideoDurationSeconds?: number;
  supportsStories: boolean;
  supportsReels: boolean;
  supportsCarousel: boolean;
  supportsScheduling: boolean;
  supportsComments: boolean;
  supportsDirectMessages: boolean;
  supportsAnalytics: boolean;
  supportsLinkPreviews: boolean;
  requiresMediaForPosting: boolean;
}

export interface OAuthAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export interface TokenExchangeResult {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  scopes?: string[];
  platformAccountId: string;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PublishPostPayload {
  content: string;
  mediaUrls?: string[];
  title?: string;
  linkUrl?: string;
  platformSpecificOptions?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  errorMessage?: string;
  errorCode?: string;
}

export interface SocialCommentItem {
  id: string;
  postId: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface SocialAnalyticsData {
  followers: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  videoViews: number;
  engagementRate: number;
}
