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

export class YouTubeProvider extends SocialProvider {
  readonly platform: PlatformType = 'YOUTUBE';

  readonly capabilities: ProviderCapabilities = {
    platform: 'YOUTUBE',
    displayName: 'YouTube',
    brandColor: '#FF0000',
    iconName: 'Youtube',
    characterLimit: 5000,
    supportsImages: false,
    maxImages: 0,
    supportsVideo: true,
    maxVideoDurationSeconds: 43200,
    supportsStories: false,
    supportsReels: true, // Shorts
    supportsCarousel: false,
    supportsScheduling: true,
    supportsComments: true,
    supportsDirectMessages: false,
    supportsAnalytics: true,
    supportsLinkPreviews: true,
    requiresMediaForPosting: true,
  };

  private get clientId(): string {
    return process.env.YOUTUBE_CLIENT_ID || '';
  }

  private get clientSecret(): string {
    return process.env.YOUTUBE_CLIENT_SECRET || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scopes}&access_type=offline&state=${state}&prompt=consent`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google/YouTube OAuth credentials are not configured on server.');
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) throw new Error(`YouTube OAuth token error: ${await res.text()}`);
    const data = await res.json();

    // Fetch Channel info
    const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (!chRes.ok) throw new Error('Failed to retrieve YouTube channel data');
    const chData = await chRes.json();
    const item = chData.items?.[0];

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresInSeconds: data.expires_in,
      platformAccountId: item?.id || `yt_${Date.now()}`,
      accountName: item?.snippet?.title || 'YouTube Channel',
      accountHandle: item?.snippet?.customUrl || `@${item?.snippet?.title?.toLowerCase().replace(/\s+/g, '')}`,
      avatarUrl: item?.snippet?.thumbnails?.default?.url,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresInSeconds?: number;
  }> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error('YouTube token refresh failed');
    const data = await res.json();
    return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const validation = this.validatePayload(payload);
    if (!validation.valid) return { success: false, errorMessage: validation.error };

    const videoUrl = payload.mediaUrls?.[0];
    if (!videoUrl) {
      return { success: false, errorMessage: 'YouTube upload requires a valid video URL.' };
    }

    try {
      // YouTube Data API insert metadata
      const res = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet,status', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: payload.title || payload.content.slice(0, 70),
            description: payload.content,
            categoryId: '22',
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        }),
      });

      if (!res.ok) return { success: false, errorMessage: `YouTube API: ${await res.text()}` };
      const data = await res.json();
      return {
        success: true,
        platformPostId: data.id,
        platformUrl: `https://youtube.com/watch?v=${data.id}`,
      };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'YouTube publish failed' };
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
    return { success: false, errorMessage: 'YouTube comment replies require elevated audit approval.' };
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
