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

export class ThreadsProvider extends SocialProvider {
  readonly platform: PlatformType = 'THREADS';

  readonly capabilities: ProviderCapabilities = {
    platform: 'THREADS',
    displayName: 'Threads',
    brandColor: '#000000',
    iconName: 'AtSign',
    characterLimit: 500,
    supportsImages: true,
    maxImages: 10,
    supportsVideo: true,
    maxVideoDurationSeconds: 300,
    supportsStories: false,
    supportsReels: false,
    supportsCarousel: true,
    supportsScheduling: true,
    supportsComments: true,
    supportsDirectMessages: false,
    supportsAnalytics: true,
    supportsLinkPreviews: true,
    requiresMediaForPosting: false,
  };

  private get appId(): string {
    return process.env.META_APP_ID || '';
  }

  private get appSecret(): string {
    return process.env.META_APP_SECRET || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent('threads_basic,threads_content_publish,threads_read_replies,threads_manage_replies,threads_manage_insights');
    return `https://threads.net/oauth/authorize?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scopes}&state=${state}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.appId || !this.appSecret) {
      throw new Error('Meta/Threads credentials are not configured.');
    }

    const res = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!res.ok) throw new Error(`Threads token error: ${await res.text()}`);
    const data = await res.json();

    // Fetch user info
    const meRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${data.access_token}`);
    if (!meRes.ok) throw new Error('Failed to retrieve Threads user info');
    const me = await meRes.json();

    return {
      accessToken: data.access_token,
      platformAccountId: me.id,
      accountName: me.username,
      accountHandle: `@${me.username}`,
      avatarUrl: me.threads_profile_picture_url,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresInSeconds?: number;
  }> {
    const res = await fetch(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${refreshToken}`);
    if (!res.ok) throw new Error('Threads token refresh failed');
    const data = await res.json();
    return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const validation = this.validatePayload(payload);
    if (!validation.valid) return { success: false, errorMessage: validation.error };

    try {
      // Step 1: Create Threads media container
      const containerRes = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: payload.mediaUrls?.length ? 'IMAGE' : 'TEXT',
          text: payload.content,
          image_url: payload.mediaUrls?.[0],
          access_token: accessToken,
        }),
      });

      if (!containerRes.ok) return { success: false, errorMessage: `Threads container error: ${await containerRes.text()}` };
      const container = await containerRes.json();

      // Step 2: Publish container
      const publishRes = await fetch(`https://graph.threads.net/v1.0/me/threads_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: accessToken,
        }),
      });

      if (!publishRes.ok) return { success: false, errorMessage: `Threads publish error: ${await publishRes.text()}` };
      const pub = await publishRes.json();

      return {
        success: true,
        platformPostId: pub.id,
        platformUrl: `https://threads.net/@user/post/${pub.id}`,
      };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'Threads publish failed' };
    }
  }

  async getComments(_accessToken: string, _platformPostId: string): Promise<SocialCommentItem[]> {
    return [];
  }

  async replyToComment(
    accessToken: string,
    platformCommentId: string,
    message: string
  ): Promise<{ success: boolean; replyId?: string; errorMessage?: string }> {
    try {
      const res = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: message,
          reply_to_id: platformCommentId,
          access_token: accessToken,
        }),
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
