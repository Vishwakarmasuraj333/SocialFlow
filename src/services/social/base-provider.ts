import {
  PlatformType,
  ProviderCapabilities,
  TokenExchangeResult,
  PublishPostPayload,
  PublishResult,
  SocialCommentItem,
  SocialAnalyticsData,
} from './types';

export abstract class SocialProvider {
  abstract readonly platform: PlatformType;
  abstract readonly capabilities: ProviderCapabilities;

  /**
   * Generates the official OAuth authorization URL with state for CSRF protection
   */
  abstract getAuthorizationUrl(state: string, redirectUri: string): string;

  /**
   * Exchanges an authorization code for access & refresh tokens and user profile
   */
  abstract exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult>;

  /**
   * Refreshes an expired access token if supported by the platform
   */
  abstract refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  }>;

  /**
   * Dispatches a post to the platform via its official REST API
   */
  abstract publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult>;

  /**
   * Fetches latest comments/interactions on a published post
   */
  abstract getComments(accessToken: string, platformPostId: string): Promise<SocialCommentItem[]>;

  /**
   * Replies to a comment on the platform
   */
  abstract replyToComment(
    accessToken: string,
    platformCommentId: string,
    message: string
  ): Promise<{ success: boolean; replyId?: string; errorMessage?: string }>;

  /**
   * Fetches latest aggregated analytics / insights from the platform API
   */
  abstract getAnalytics(
    accessToken: string,
    platformAccountId: string,
    timeframeDays: number
  ): Promise<SocialAnalyticsData>;

  /**
   * Validates post content against platform capability constraints
   */
  validatePayload(payload: PublishPostPayload): { valid: boolean; error?: string } {
    if (payload.content.length > this.capabilities.characterLimit) {
      return {
        valid: false,
        error: `${this.capabilities.displayName} posts cannot exceed ${this.capabilities.characterLimit} characters. (Current: ${payload.content.length})`,
      };
    }

    if (this.capabilities.requiresMediaForPosting && (!payload.mediaUrls || payload.mediaUrls.length === 0)) {
      return {
        valid: false,
        error: `${this.capabilities.displayName} requires at least one media asset (image/video).`,
      };
    }

    if (payload.mediaUrls && payload.mediaUrls.length > this.capabilities.maxImages) {
      return {
        valid: false,
        error: `${this.capabilities.displayName} supports a maximum of ${this.capabilities.maxImages} media attachments.`,
      };
    }

    return { valid: true };
  }
}
