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

export class TwitterProvider extends SocialProvider {
  readonly platform: PlatformType = 'TWITTER';

  readonly capabilities: ProviderCapabilities = {
    platform: 'TWITTER',
    displayName: 'X / Twitter',
    brandColor: '#000000',
    iconName: 'Twitter',
    characterLimit: 280, // Standard X tweet limit
    supportsImages: true,
    maxImages: 4,
    supportsVideo: true,
    maxVideoDurationSeconds: 140,
    supportsStories: false,
    supportsReels: false,
    supportsCarousel: false,
    supportsScheduling: true,
    supportsComments: true,
    supportsDirectMessages: true,
    supportsAnalytics: true,
    supportsLinkPreviews: true,
    requiresMediaForPosting: false,
  };

  private get clientId(): string {
    return process.env.TWITTER_CLIENT_ID || '';
  }

  private get clientSecret(): string {
    return process.env.TWITTER_CLIENT_SECRET || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent('tweet.read tweet.write users.read offline.access');
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Twitter API credentials are not configured on server.');
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: 'challenge',
      }),
    });

    if (!res.ok) throw new Error(`Twitter token exchange failed: ${await res.text()}`);
    const tokenData = await res.json();

    // Fetch user info
    const meRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!meRes.ok) throw new Error('Failed to retrieve Twitter user info');
    const meData = await meRes.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresInSeconds: tokenData.expires_in,
      platformAccountId: meData.data.id,
      accountName: meData.data.name,
      accountHandle: `@${meData.data.username}`,
      avatarUrl: meData.data.profile_image_url,
      metadata: { metrics: meData.data.public_metrics },
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  }> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
      }),
    });

    if (!res.ok) throw new Error('Twitter refresh failed');
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

    try {
      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: payload.content }),
      });

      if (!res.ok) {
        return { success: false, errorMessage: `X API error: ${await res.text()}` };
      }

      const data = await res.json();
      return {
        success: true,
        platformPostId: data.data.id,
        platformUrl: `https://x.com/i/status/${data.data.id}`,
      };
    } catch (err: unknown) {
      return { success: false, errorMessage: err instanceof Error ? err.message : 'X publish failed' };
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
      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          reply: { in_reply_to_tweet_id: platformCommentId },
        }),
      });
      if (!res.ok) return { success: false, errorMessage: await res.text() };
      const data = await res.json();
      return { success: true, replyId: data.data.id };
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
