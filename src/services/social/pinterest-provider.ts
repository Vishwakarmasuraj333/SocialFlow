import { SocialProvider } from './base-provider';
import {
  PlatformType,
  ProviderCapabilities,
  TokenExchangeResult,
  PublishPostPayload,
  PublishResult,
  SocialCommentItem,
  SocialAnalyticsData,
} from './types';

export class PinterestProvider extends SocialProvider {
  readonly platform: PlatformType = 'PINTEREST';

  readonly capabilities: ProviderCapabilities = {
    platform: 'PINTEREST',
    displayName: 'Pinterest',
    brandColor: '#E60023',
    iconName: 'Pin',
    characterLimit: 500,
    supportsImages: true,
    maxImages: 1,
    supportsVideo: true,
    maxVideoDurationSeconds: 900,
    supportsStories: false,
    supportsReels: false,
    supportsCarousel: false,
    supportsScheduling: true,
    supportsComments: false,
    supportsDirectMessages: false,
    supportsAnalytics: true,
    supportsLinkPreviews: true,
    requiresMediaForPosting: true,
  };

  private get appId(): string {
    return process.env.PINTEREST_APP_ID || '';
  }

  private get appSecret(): string {
    return process.env.PINTEREST_APP_SECRET || '';
  }

  private get directAccessToken(): string {
    return process.env.PINTEREST_ACCESS_TOKEN || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent('boards:read,pins:read,pins:write,user_accounts:read');
    return `https://www.pinterest.com/oauth/?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scopes}&state=${state}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.appId || !this.appSecret) {
      throw new Error('Pinterest API credentials are not configured on server.');
    }

    const credentials = Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64');
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new Error(`Pinterest token error: ${await res.text()}`);
    const data = await res.json();

    // Fetch Pinterest user profile
    const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (!userRes.ok) throw new Error('Failed to retrieve Pinterest account info');
    const userData = await userRes.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSeconds: data.expires_in,
      platformAccountId: userData.username || `pin_${Date.now()}`,
      accountName: userData.business_name || userData.username || 'Pinterest Profile',
      accountHandle: `@${userData.username}`,
      avatarUrl: userData.profile_image,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  }> {
    const credentials = Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64');
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) throw new Error('Pinterest token refresh failed');
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSeconds: data.expires_in,
    };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const validation = this.validatePayload(payload);
    if (!validation.valid) return { success: false, errorMessage: validation.error };

    const mediaUrl = payload.mediaUrls?.[0];
    if (!mediaUrl) return { success: false, errorMessage: 'Pinterest requires an image URL for the Pin.' };

    try {
      const token = accessToken || this.directAccessToken;
      const res = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title || payload.content.slice(0, 100),
          description: payload.content,
          link: payload.linkUrl,
          media_source: {
            source_type: 'image_url',
            url: mediaUrl,
          },
        }),
      });

      if (!res.ok) return { success: false, errorMessage: `Pinterest Pin error: ${await res.text()}` };
      const data = await res.json();
      return {
        success: true,
        platformPostId: data.id,
        platformUrl: `https://pinterest.com/pin/${data.id}`,
      };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'Pinterest publish failed' };
    }
  }

  async getComments(_accessToken: string, _platformPostId: string): Promise<SocialCommentItem[]> {
    return [];
  }

  async replyToComment(
    _accessToken: string,
    _platformCommentId: string,
    _message: string
  ): Promise<{ success: boolean; replyId?: string; errorMessage?: string }> {
    return { success: false, errorMessage: 'Pinterest comments API is read-only.' };
  }

  async getAnalytics(
    _accessToken: string,
    _platformAccountId: string,
    _timeframeDays: number
  ): Promise<SocialAnalyticsData> {
    return {
      followers: 0,
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      videoViews: 0,
      engagementRate: 0.0,
    };
  }
}
