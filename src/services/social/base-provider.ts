import {
  PlatformType,
  ProviderCapabilities,
  TokenExchangeResult,
  TokenRefreshResult,
  PublishPostPayload,
  PublishResult,
  SocialCommentItem,
  CommentReplyResult,
  SocialAnalyticsData,
  AccountProfileResult,
  SocialCapabilities,
} from './types';

export abstract class SocialProvider {
  abstract readonly platform: PlatformType;
  abstract readonly capabilities: ProviderCapabilities;

  /**
   * Generates official OAuth 2.0 authorization URL
   */
  abstract getAuthorizationUrl(state: string, redirectUri: string, codeChallenge?: string): string;

  /**
   * Exchanges authorization code for tokens and verified account details
   */
  abstract handleCallback(code: string, redirectUri: string, codeVerifier?: string): Promise<TokenExchangeResult>;

  /**
   * Backwards compatibility alias
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    return this.handleCallback(code, redirectUri);
  }

  /**
   * Refreshes access token if supported
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResult> {
    if (!this.capabilities.hasOAuth) {
      throw new Error(`[UNSUPPORTED] ${this.capabilities.displayName} does not support OAuth token refresh.`);
    }
    throw new Error(`[UNSUPPORTED] Token refresh not implemented or supported for ${this.capabilities.displayName}.`);
  }

  /**
   * Fetches authentic authorized account
   */
  async getAccount(accessToken: string, accountId?: string): Promise<AccountProfileResult> {
    return this.getProfile(accessToken);
  }

  /**
   * Fetches authorized user profile
   */
  abstract getProfile(accessToken: string): Promise<AccountProfileResult>;

  /**
   * Fetches real follower count
   */
  async getFollowers(accessToken: string, accountId: string): Promise<{ followers: number | null }> {
    if (!this.capabilities.supportsFollowers) {
      return { followers: null };
    }
    const profile = await this.getProfile(accessToken);
    return { followers: profile.followers ?? null };
  }

  /**
   * Fetches real following count
   */
  async getFollowing(accessToken: string, accountId: string): Promise<{ following: number | null }> {
    if (!this.capabilities.supportsFollowing) {
      return { following: null };
    }
    const profile = await this.getProfile(accessToken);
    return { following: profile.following ?? null };
  }

  /**
   * Fetches posts from the platform
   */
  async getPosts(accessToken: string, accountId: string): Promise<any[]> {
    if (!this.capabilities.supportsPublishing) {
      throw new Error(`[UNSUPPORTED] Fetching posts is not supported by ${this.capabilities.displayName} API.`);
    }
    return [];
  }

  /**
   * Creates a post on the platform
   */
  async createPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    return this.publishPost(accessToken, payload);
  }

  /**
   * Updates an existing post if supported
   */
  async updatePost(accessToken: string, platformPostId: string, payload: PublishPostPayload): Promise<PublishResult> {
    throw new Error(`[UNSUPPORTED] Editing posts is not supported through the official ${this.capabilities.displayName} API.`);
  }

  /**
   * Deletes a published post if supported
   */
  async deletePost(accessToken: string, platformPostId: string): Promise<{ success: boolean; errorMessage?: string }> {
    throw new Error(`[UNSUPPORTED] Deleting posts via API is not supported by ${this.capabilities.displayName}.`);
  }

  /**
   * Dispatches a post via official platform REST API
   */
  abstract publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult>;

  /**
   * Uploads media asset to platform
   */
  async uploadMedia(accessToken: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<{ mediaId: string }> {
    throw new Error(`[UNSUPPORTED] Direct media upload not supported by ${this.capabilities.displayName}.`);
  }

  /**
   * Fetches latest comments on a published post
   */
  async getComments(accessToken: string, platformPostId: string): Promise<SocialCommentItem[]> {
    if (!this.capabilities.supportsComments) {
      return [];
    }
    return [];
  }

  /**
   * Replies to a comment
   */
  async replyToComment(accessToken: string, platformCommentId: string, message: string): Promise<CommentReplyResult> {
    if (!this.capabilities.supportsComments) {
      return {
        success: false,
        errorMessage: `[UNSUPPORTED] Replying to comments is not available through the official API for ${this.capabilities.displayName}.`,
      };
    }
    return {
      success: false,
      errorMessage: `Replying to comments is not configured for ${this.capabilities.displayName}.`,
    };
  }

  /**
   * Fetches aggregated analytics from official platform API
   */
  abstract getAnalytics(
    accessToken: string,
    platformAccountId: string,
    timeframeDays: number
  ): Promise<SocialAnalyticsData>;

  /**
   * Revokes token / disconnects
   */
  async disconnect(accessToken: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  /**
   * Returns provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return this.capabilities;
  }

  /**
   * Returns standard social capabilities boolean matrix
   */
  getSocialCapabilities(): SocialCapabilities {
    return {
      publishing: this.capabilities.supportsPublishing,
      scheduling: this.capabilities.supportsScheduling,
      mediaUpload: this.capabilities.supportsMedia,
      analytics: this.capabilities.supportsAnalytics,
      comments: this.capabilities.supportsComments,
      messaging: this.capabilities.supportsMessaging,
    };
  }

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
