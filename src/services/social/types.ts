export type PlatformType =
  | 'FACEBOOK'
  | 'X'
  | 'TWITTER'
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'PINTEREST'
  | 'THREADS'
  | 'SNAPCHAT'
  | 'REDDIT'
  | 'WHATSAPP'
  | 'TELEGRAM'
  | 'DISCORD'
  | 'BLUESKY'
  | 'MASTODON'
  | 'TUMBLR'
  | 'MEDIUM'
  | 'QUORA'
  | 'WORDPRESS'
  | 'VIMEO';

export type ConfigurationStatus =
  | 'READY'
  | 'CONFIGURATION_REQUIRED'
  | 'API_APPROVAL_REQUIRED'
  | 'BUSINESS_VERIFICATION_REQUIRED'
  | 'NOT_SUPPORTED';

export interface ProviderCapabilities {
  platform: PlatformType;
  displayName: string;
  brandColor: string;
  iconName: string;
  apiVersion: string;
  category: 'Major' | 'Video & Streaming' | 'Messaging & Community' | 'Blogging & Publishing' | 'Creative & Niche';
  
  // Specific capability flags required by Part 12
  hasOAuth: boolean;
  hasApi: boolean;
  supportsPublishing: boolean;
  supportsAnalytics: boolean;
  supportsComments: boolean;
  supportsMessaging: boolean;
  supportsMedia: boolean;
  supportsAccountInfo: boolean;
  supportsFollowers: boolean;
  supportsFollowing: boolean;
  supportsScheduling: boolean;
  supportsWebhooks: boolean;
  
  // Requirements
  requiresBusinessAccount: boolean;
  requiresDeveloperApproval: boolean;
  requiresSpecificApiAccess: boolean;

  // Limits
  characterLimit: number;
  maxImages: number;
  maxVideoDurationSeconds?: number;
  supportsVideo: boolean;
  supportsStories?: boolean;
  supportsReels?: boolean;
  supportsCarousel?: boolean;
  requiresMediaForPosting?: boolean;

  // Setup guides & requirements description
  configDocsUrl?: string;
  requiredEnvVars: string[];
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

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
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

export interface CommentReplyResult {
  success: boolean;
  replyId?: string;
  errorMessage?: string;
}

export interface SocialAnalyticsData {
  followers: number | null; // null if not available from API
  following: number | null; // null if not available from API
  reach: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;
  videoViews: number | null;
  engagementRate: number | null;
  dataSource: string;
  lastSyncedAt: Date;
}

export interface AccountProfileResult {
  platformAccountId: string;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  accountType?: string;
  followers?: number | null;
  following?: number | null;
  metadata?: Record<string, unknown>;
}
