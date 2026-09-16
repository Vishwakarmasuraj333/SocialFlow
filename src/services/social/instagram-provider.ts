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

export class InstagramProvider extends SocialProvider {
  readonly platform: PlatformType = 'INSTAGRAM';

  readonly capabilities: ProviderCapabilities = {
    platform: 'INSTAGRAM',
    displayName: 'Instagram',
    brandColor: '#E4405F',
    iconName: 'Instagram',
    characterLimit: 2200,
    supportsImages: true,
    maxImages: 10,
    supportsVideo: true,
    maxVideoDurationSeconds: 3600,
    supportsStories: true,
    supportsReels: true,
    supportsCarousel: true,
    supportsScheduling: true,
    supportsComments: true,
    supportsDirectMessages: true,
    supportsAnalytics: true,
    supportsLinkPreviews: false,
    requiresMediaForPosting: true, // Instagram requires at least one photo or video
  };

  private get appId(): string {
    return process.env.META_APP_ID || '';
  }

  private get appSecret(): string {
    return process.env.META_APP_SECRET || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent('instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights');
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=${scopes}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.appId || !this.appSecret) {
      throw new Error('Meta App credentials are not configured on server.');
    }

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${this.appSecret}&code=${code}`;

    const res = await fetch(tokenUrl);
    if (!res.ok) throw new Error('Failed to exchange Instagram authorization code');
    const tokenData = await res.json();

    return {
      accessToken: tokenData.access_token,
      expiresInSeconds: tokenData.expires_in,
      platformAccountId: `ig_${Date.now()}`,
      accountName: 'Instagram Business',
      accountHandle: '@business_profile',
      avatarUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=80',
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresInSeconds?: number;
  }> {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${refreshToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Instagram refresh failed');
    const data = await res.json();
    return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const validation = this.validatePayload(payload);
    if (!validation.valid) return { success: false, errorMessage: validation.error };

    try {
      const mediaUrl = payload.mediaUrls?.[0];
      if (!mediaUrl) {
        return { success: false, errorMessage: 'Instagram requires an image or video URL to publish.' };
      }

      // Step 1: Create Container
      const containerRes = await fetch(`https://graph.facebook.com/v19.0/me/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption: payload.content,
          access_token: accessToken,
        }),
      });

      if (!containerRes.ok) {
        return { success: false, errorMessage: `IG Container Error: ${await containerRes.text()}` };
      }

      const containerData = await containerRes.json();
      const creationId = containerData.id;

      // Step 2: Publish Container
      const publishRes = await fetch(`https://graph.facebook.com/v19.0/me/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      });

      if (!publishRes.ok) {
        return { success: false, errorMessage: `IG Publish Error: ${await publishRes.text()}` };
      }

      const publishData = await publishRes.json();
      return {
        success: true,
        platformPostId: publishData.id,
        platformUrl: `https://instagram.com/p/${publishData.id}`,
      };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'Instagram publish failed' };
    }
  }

  async getComments(accessToken: string, platformPostId: string): Promise<SocialCommentItem[]> {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${platformPostId}/comments?access_token=${accessToken}&fields=id,text,timestamp,username`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((c: Record<string, unknown>) => ({
        id: String(c.id),
        postId: platformPostId,
        authorName: String(c.username || 'ig_user'),
        authorHandle: `@${String(c.username || 'ig_user')}`,
        content: String(c.text || ''),
        createdAt: new Date(String(c.timestamp || Date.now())),
      }));
    } catch {
      return [];
    }
  }

  async replyToComment(
    accessToken: string,
    platformCommentId: string,
    message: string
  ): Promise<{ success: boolean; replyId?: string; errorMessage?: string }> {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${platformCommentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, access_token: accessToken }),
      });
      if (!res.ok) return { success: false, errorMessage: await res.text() };
      const data = await res.json();
      return { success: true, replyId: data.id };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'Reply failed' };
    }
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
