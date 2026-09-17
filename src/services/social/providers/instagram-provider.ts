import { SocialProvider } from '../base-provider';
import {
  PlatformType,
  ProviderCapabilities,
  TokenExchangeResult,
  PublishPostPayload,
  PublishResult,
  SocialCommentItem,
  SocialAnalyticsData,
  AccountProfileResult,
} from '../types';

export class InstagramProvider extends SocialProvider {
  readonly platform: PlatformType = 'INSTAGRAM';

  readonly capabilities: ProviderCapabilities = {
    platform: 'INSTAGRAM',
    displayName: 'Instagram',
    brandColor: '#E4405F',
    iconName: 'Instagram',
    apiVersion: 'v19.0',
    category: 'Major',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: true,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: false, // Not exposed by Meta Instagram Graph API
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: true,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 2200,
    maxImages: 10,
    supportsVideo: true,
    maxVideoDurationSeconds: 3600,
    supportsStories: true,
    supportsReels: true,
    supportsCarousel: true,
    requiresMediaForPosting: true,
    requiredEnvVars: ['META_APP_ID', 'META_APP_SECRET'],
    configDocsUrl: 'https://developers.facebook.com/docs/instagram-platform',
  };

  private get appId(): string {
    return process.env.META_APP_ID || '';
  }

  private get appSecret(): string {
    return process.env.META_APP_SECRET || '';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const scopes = encodeURIComponent(
      'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement'
    );
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=${scopes}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    if (!this.appId || !this.appSecret) {
      throw new Error('Meta App credentials are not configured on server.');
    }

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${this.appSecret}&code=${code}`;

    const res = await fetch(tokenUrl);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Failed to exchange Instagram authorization code');
    }
    const tokenData = await res.json();
    const accessToken = tokenData.access_token;

    // Fetch authorized user profile from Meta Graph API
    let profileData: any = {};
    try {
      const profileRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`
      );
      if (profileRes.ok) {
        profileData = await profileRes.json();
      }
    } catch {}

    const igAccount = profileData.data?.[0]?.instagram_business_account;

    return {
      accessToken,
      expiresInSeconds: tokenData.expires_in,
      platformAccountId: igAccount?.id || `ig_${Date.now()}`,
      accountName: igAccount?.name || 'Instagram Business Account',
      accountHandle: igAccount?.username ? `@${igAccount.username}` : '@instagram_user',
      avatarUrl: igAccount?.profile_picture_url,
      metadata: {
        followers: igAccount?.followers_count ?? null,
        following: null, // Meta does not expose following count
      },
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`
      );
      if (res.ok) {
        const data = await res.json();
        const acc = data.data?.[0]?.instagram_business_account;
        if (acc) {
          return {
            platformAccountId: acc.id,
            accountName: acc.name || acc.username,
            accountHandle: `@${acc.username}`,
            avatarUrl: acc.profile_picture_url,
            followers: acc.followers_count ?? null,
            following: null,
          };
        }
      }
    } catch {}

    return {
      platformAccountId: 'unknown',
      accountName: 'Instagram Business',
      accountHandle: '@instagram_account',
      followers: null,
      following: null,
    };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const validation = this.validatePayload(payload);
    if (!validation.valid) {
      return { success: false, errorMessage: validation.error };
    }

    const mediaUrl = payload.mediaUrls?.[0];
    if (!mediaUrl) {
      return { success: false, errorMessage: 'Instagram requires an image or video URL to publish.' };
    }

    try {
      // Step 1: Create Media Container
      const containerRes = await fetch(`https://graph.facebook.com/v19.0/me/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption: payload.content,
          access_token: accessToken,
        }),
      });

      const containerData = await containerRes.json();
      if (!containerRes.ok || !containerData.id) {
        return {
          success: false,
          errorMessage: containerData.error?.message || 'Failed to create Instagram media container',
          errorCode: containerData.error?.code?.toString(),
        };
      }

      // Step 2: Publish Media
      const publishRes = await fetch(`https://graph.facebook.com/v19.0/me/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok || !publishData.id) {
        return {
          success: false,
          errorMessage: publishData.error?.message || 'Failed to publish media container to Instagram',
          errorCode: publishData.error?.code?.toString(),
        };
      }

      return {
        success: true,
        platformPostId: publishData.id,
        platformUrl: `https://www.instagram.com/p/${publishData.id}/`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error communicating with Meta Graph API';
      return { success: false, errorMessage: errorMsg };
    }
  }

  async getAnalytics(
    accessToken: string,
    platformAccountId: string,
    timeframeDays: number
  ): Promise<SocialAnalyticsData> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${platformAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
      );
      if (res.ok) {
        const data = await res.json();
        const metrics = data.data || [];
        const reachVal = metrics.find((m: any) => m.name === 'reach')?.values?.[0]?.value ?? null;
        const impressionsVal = metrics.find((m: any) => m.name === 'impressions')?.values?.[0]?.value ?? null;

        return {
          followers: null,
          following: null,
          reach: reachVal,
          impressions: impressionsVal,
          likes: null,
          comments: null,
          shares: null,
          saves: null,
          clicks: null,
          videoViews: null,
          engagementRate: null,
          dataSource: 'Instagram Graph API v19.0',
          lastSyncedAt: new Date(),
        };
      }
    } catch {}

    return {
      followers: null,
      following: null,
      reach: null,
      impressions: null,
      likes: null,
      comments: null,
      shares: null,
      saves: null,
      clicks: null,
      videoViews: null,
      engagementRate: null,
      dataSource: 'Instagram Graph API (Insights pending)',
      lastSyncedAt: new Date(),
    };
  }
}
