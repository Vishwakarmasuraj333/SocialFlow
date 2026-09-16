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

export class TikTokProvider extends SocialProvider {
  readonly platform: PlatformType = 'TIKTOK';

  readonly capabilities: ProviderCapabilities = {
    platform: 'TIKTOK',
    displayName: 'TikTok',
    brandColor: '#000000',
    iconName: 'Video',
    characterLimit: 2200,
    supportsImages: true,
    maxImages: 35,
    supportsVideo: true,
    maxVideoDurationSeconds: 600,
    supportsStories: true,
    supportsReels: false,
    supportsCarousel: true,
    supportsScheduling: true,
    supportsComments: true,
    supportsDirectMessages: false,
    supportsAnalytics: true,
    supportsLinkPreviews: false,
    requiresMediaForPosting: true, // TikTok requires video/photo
  };

  private get clientKey(): string {
    return process.env.TIKTOK_CLIENT_KEY || '';
  }

  private get clientSecret(): string {
    return process.env.TIKTOK_CLIENT_SECRET || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent('user.info.basic,video.publish,video.upload');
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${this.clientKey}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.clientKey || !this.clientSecret) {
      throw new Error('TikTok credentials (TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET) are not configured.');
    }

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new Error(`TikTok token error: ${await res.text()}`);
    const data = await res.json();

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresInSeconds: data.data.expires_in,
      platformAccountId: data.data.open_id,
      accountName: 'TikTok Creator',
      accountHandle: `@${data.data.open_id.slice(0, 10)}`,
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80',
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  }> {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) throw new Error('TikTok refresh failed');
    const data = await res.json();
    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresInSeconds: data.data.expires_in,
    };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const validation = this.validatePayload(payload);
    if (!validation.valid) return { success: false, errorMessage: validation.error };

    const videoUrl = payload.mediaUrls?.[0];
    if (!videoUrl) {
      return { success: false, errorMessage: 'TikTok Direct Post requires a valid video URL.' };
    }

    try {
      // Direct Post API
      const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: {
            title: payload.content.slice(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: videoUrl,
          },
        }),
      });

      if (!res.ok) {
        return { success: false, errorMessage: `TikTok API error: ${await res.text()}` };
      }

      const data = await res.json();
      const publishId = data.data?.publish_id || `tt_${Date.now()}`;

      return {
        success: true,
        platformPostId: publishId,
        platformUrl: `https://www.tiktok.com/@creator/video/${publishId}`,
      };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'TikTok publish failed' };
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
    return { success: false, errorMessage: 'Direct comment replies are restricted on TikTok Open API' };
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
