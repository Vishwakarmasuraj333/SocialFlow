import { SocialProvider } from '../base-provider';
import {
  PlatformType,
  ProviderCapabilities,
  TokenExchangeResult,
  PublishPostPayload,
  PublishResult,
  SocialAnalyticsData,
  AccountProfileResult,
} from '../types';

// ==========================================
// 1. FACEBOOK PROVIDER (Meta Pages Graph API)
// ==========================================
export class FacebookProvider extends SocialProvider {
  readonly platform: PlatformType = 'FACEBOOK';
  readonly capabilities: ProviderCapabilities = {
    platform: 'FACEBOOK',
    displayName: 'Facebook',
    brandColor: '#1877F2',
    iconName: 'Facebook',
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
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 63206,
    maxImages: 10,
    supportsVideo: true,
    maxVideoDurationSeconds: 14400,
    supportsStories: true,
    supportsReels: true,
    supportsCarousel: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['META_APP_ID', 'META_APP_SECRET'],
    configDocsUrl: 'https://developers.facebook.com/docs/pages-api',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const appId = process.env.META_APP_ID || '';
    const scopes = encodeURIComponent('pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content');
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const appId = process.env.META_APP_ID || '';
    const appSecret = process.env.META_APP_SECRET || '';
    if (!appId || !appSecret) throw new Error('Meta App credentials are not configured on server.');

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const res = await fetch(tokenUrl);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to exchange Facebook OAuth code');
    }
    const data = await res.json();
    const userToken = data.access_token;

    // Get user's pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture,fan_count&access_token=${userToken}`);
    const pagesData = await pagesRes.json().catch(() => ({}));
    const page = pagesData.data?.[0];

    return {
      accessToken: page?.access_token || userToken,
      expiresInSeconds: data.expires_in,
      platformAccountId: page?.id || `fb_${Date.now()}`,
      accountName: page?.name || 'Facebook Page',
      accountHandle: page?.name ? `@${page.name.toLowerCase().replace(/\s+/g, '')}` : '@facebook_page',
      avatarUrl: page?.picture?.data?.url,
      metadata: {
        pageId: page?.id,
        followers: page?.fan_count ?? null,
      },
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture,fan_count&access_token=${accessToken}`);
      if (res.ok) {
        const d = await res.json();
        return {
          platformAccountId: d.id,
          accountName: d.name,
          accountHandle: `@${d.name?.toLowerCase().replace(/\s+/g, '')}`,
          avatarUrl: d.picture?.data?.url,
          followers: d.fan_count ?? null,
          following: null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'Facebook Page', accountHandle: '@facebook_page', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const val = this.validatePayload(payload);
    if (!val.valid) return { success: false, errorMessage: val.error };

    try {
      const bodyPayload: Record<string, unknown> = { message: payload.content };
      if (payload.mediaUrls && payload.mediaUrls.length > 0) {
        bodyPayload.link = payload.mediaUrls[0];
      }
      const res = await fetch(`https://graph.facebook.com/v19.0/me/feed?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const d = await res.json();
      if (!res.ok || !d.id) {
        return { success: false, errorMessage: d.error?.message || 'Facebook publishing failed', errorCode: d.error?.code?.toString() };
      }
      return { success: true, platformPostId: d.id, platformUrl: `https://facebook.com/${d.id}` };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Facebook API network error' };
    }
  }

  async getAnalytics(accessToken: string, platformAccountId: string): Promise<SocialAnalyticsData> {
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
      dataSource: 'Facebook Graph API v19.0',
      lastSyncedAt: new Date(),
    };
  }
}

// Helper to validate and retrieve X OAuth credentials from server environment
function getXOAuthCredentials(): { clientId: string; clientSecret: string } {
  const clientId = (process.env.X_CLIENT_ID || process.env.TWITTER_CLIENT_ID || '').trim();
  const clientSecret = (process.env.X_CLIENT_SECRET || process.env.TWITTER_CLIENT_SECRET || '').trim();

  if (!clientId) {
    throw new Error('X OAuth Client ID is missing. Set X_CLIENT_ID in your server environment variables (e.g. Vercel Project Settings).');
  }

  if (
    clientId.includes('@') ||
    clientId.length < 3 ||
    ['placeholder', 'your_client_id', 'client_id', 'none', 'null', 'undefined'].includes(clientId.toLowerCase())
  ) {
    throw new Error(
      'Invalid X_CLIENT_ID: Your email address or a placeholder is configured instead of the official OAuth 2.0 Client ID from the X Developer Portal.'
    );
  }

  if (!clientSecret) {
    throw new Error('X OAuth Client Secret is missing. Set X_CLIENT_SECRET in your server environment variables.');
  }

  return { clientId, clientSecret };
}

// ==========================================
// 2. X / TWITTER PROVIDER (X API v2 with PKCE)
// ==========================================
export class XProvider extends SocialProvider {
  readonly platform: PlatformType = 'X';
  readonly capabilities: ProviderCapabilities = {
    platform: 'X',
    displayName: 'X (Twitter)',
    brandColor: '#000000',
    iconName: 'Twitter',
    apiVersion: 'v2',
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
    supportsFollowing: true,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 280,
    maxImages: 4,
    supportsVideo: true,
    maxVideoDurationSeconds: 140,
    requiresMediaForPosting: false,
    requiredEnvVars: ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
    configDocsUrl: 'https://developer.x.com/en/docs/x-api',
  };

  getAuthorizationUrl(state: string, redirectUri: string, codeChallenge?: string): string {
    const { clientId } = getXOAuthCredentials();
    if (!clientId) {
      throw new Error('X API Client ID is not configured in server environment (X_CLIENT_ID).');
    }

    // Default challenge if not supplied by caller (SHA-256 fallback)
    const challenge = codeChallenge || 's256_pkce_challenge_required';
    const scopes = 'tweet.read tweet.write users.read offline.access';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, redirectUri: string, codeVerifier?: string): Promise<TokenExchangeResult> {
    const { clientId, clientSecret } = getXOAuthCredentials();
    if (!clientId) {
      throw new Error('X API Client ID is not configured in environment (X_CLIENT_ID).');
    }
    if (!codeVerifier) {
      throw new Error('PKCE verification failed: Missing code_verifier for X OAuth 2.0.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (clientSecret) {
      headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }

    const bodyParams = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: clientId,
    });

    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: bodyParams,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error_description || err.error || err.detail || err.title || 'Failed to exchange X authorization code';
      throw new Error(`X OAuth Error: ${msg}`);
    }

    const tokenData = await res.json();
    if (!tokenData.access_token) {
      throw new Error('X API returned a successful response but no access_token was found.');
    }

    const profile = await this.getProfile(tokenData.access_token);

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresInSeconds: tokenData.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
      metadata: { followers: profile.followers, following: profile.following },
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    const res = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified,description',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errorDetail = err.detail || err.title || `HTTP ${res.status}`;
      throw new Error(`Failed to retrieve authentic X user profile: ${errorDetail}`);
    }

    const d = await res.json();
    const user = d.data;

    if (!user || !user.id) {
      throw new Error('X API returned empty profile data for the authenticated user.');
    }

    return {
      platformAccountId: user.id,
      accountName: user.name || user.username,
      accountHandle: `@${user.username}`,
      avatarUrl: user.profile_image_url || undefined,
      followers: user.public_metrics?.followers_count ?? null,
      following: user.public_metrics?.following_count ?? null,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresInSeconds?: number }> {
    const { clientId, clientSecret } = getXOAuthCredentials();
    if (!clientId) throw new Error('X API Client ID not configured.');

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (clientSecret) {
      headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }

    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || 'Failed to refresh X access token');
    }

    const d = await res.json();
    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresInSeconds: d.expires_in,
    };
  }

  async revokeToken(token: string): Promise<boolean> {
    const { clientId, clientSecret } = getXOAuthCredentials();
    if (!clientId || !token) return false;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (clientSecret) {
        headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
      }

      const res = await fetch('https://api.twitter.com/2/oauth2/revoke', {
        method: 'POST',
        headers,
        body: new URLSearchParams({
          token,
          token_type_hint: 'access_token',
          client_id: clientId,
        }),
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const val = this.validatePayload(payload);
    if (!val.valid) return { success: false, errorMessage: val.error };

    try {
      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: payload.content }),
      });

      const d = await res.json();
      if (!res.ok || !d.data?.id) {
        return { success: false, errorMessage: d.detail || d.title || 'X API rejected tweet', errorCode: d.type };
      }
      return { success: true, platformPostId: d.data.id, platformUrl: `https://x.com/i/status/${d.data.id}` };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'X API connection error' };
    }
  }

  async getAnalytics(accessToken: string): Promise<SocialAnalyticsData> {
    const profile = await this.getProfile(accessToken);
    return {
      followers: profile.followers ?? null,
      following: profile.following ?? null,
      reach: null,
      impressions: null,
      likes: null,
      comments: null,
      shares: null,
      saves: null,
      clicks: null,
      videoViews: null,
      engagementRate: null,
      dataSource: 'X API v2',
      lastSyncedAt: new Date(),
    };
  }
}

// Helper to validate and retrieve LinkedIn OAuth credentials from server environment
function getLinkedInOAuthCredentials(): { clientId: string; clientSecret: string } {
  const clientId = (process.env.LINKEDIN_CLIENT_ID || '').trim();
  const clientSecret = (process.env.LINKEDIN_CLIENT_SECRET || '').trim();

  if (!clientId) {
    throw new Error('LinkedIn OAuth Client ID is missing. Set LINKEDIN_CLIENT_ID in your server environment variables (e.g. Vercel Project Settings).');
  }

  if (
    clientId.includes('@') ||
    clientId.length < 3 ||
    ['placeholder', 'your_client_id', 'client_id', 'none', 'null', 'undefined', 'your_linkedin_client_id'].includes(clientId.toLowerCase())
  ) {
    throw new Error(
      'Invalid LINKEDIN_CLIENT_ID: Your email address or a placeholder is configured instead of the official OAuth 2.0 Client ID from the LinkedIn Developer Portal.'
    );
  }

  return { clientId, clientSecret };
}

// ==========================================
// 3. LINKEDIN PROVIDER
// ==========================================
export class LinkedInProvider extends SocialProvider {
  readonly platform: PlatformType = 'LINKEDIN';
  readonly capabilities: ProviderCapabilities = {
    platform: 'LINKEDIN',
    displayName: 'LinkedIn',
    brandColor: '#0A66C2',
    iconName: 'Linkedin',
    apiVersion: 'v2',
    category: 'Major',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 3000,
    maxImages: 9,
    supportsVideo: true,
    maxVideoDurationSeconds: 600,
    requiresMediaForPosting: false,
    requiredEnvVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    configDocsUrl: 'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const { clientId } = getLinkedInOAuthCredentials();
    const rawScopes = (process.env.LINKEDIN_SCOPES || 'openid profile email w_member_social').trim();
    const scopes = encodeURIComponent(rawScopes);
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const { clientId, clientSecret } = getLinkedInOAuthCredentials();
    if (!clientSecret) {
      throw new Error('LinkedIn OAuth Client Secret is missing. Set LINKEDIN_CLIENT_SECRET in your server environment variables.');
    }

    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || 'Failed to exchange LinkedIn authorization code');
    }

    const data = await res.json();
    const profile = await this.getProfile(data.access_token);

    return {
      accessToken: data.access_token,
      expiresInSeconds: data.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
      metadata: { followers: profile.followers },
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const d = await res.json();
        return {
          platformAccountId: d.sub || `urn:li:person:${d.id}`,
          accountName: d.name || `${d.given_name} ${d.family_name}`,
          accountHandle: d.email ? `@${d.email.split('@')[0]}` : `@${d.name?.toLowerCase().replace(/\s+/g, '')}`,
          avatarUrl: d.picture,
          followers: null, // Requires Community Management API approval
          following: null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'LinkedIn Profile', accountHandle: '@linkedin_user', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const val = this.validatePayload(payload);
    if (!val.valid) return { success: false, errorMessage: val.error };

    const profile = await this.getProfile(accessToken);
    const authorUrn = profile.platformAccountId.startsWith('urn:li:') ? profile.platformAccountId : `urn:li:person:${profile.platformAccountId}`;

    try {
      const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: payload.content },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }),
      });

      const d = await res.json();
      if (!res.ok || !d.id) {
        return { success: false, errorMessage: d.message || 'LinkedIn UGC post rejected', errorCode: d.status?.toString() };
      }
      return { success: true, platformPostId: d.id, platformUrl: `https://www.linkedin.com/feed/update/${d.id}` };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'LinkedIn API connection error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'LinkedIn REST v2',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 4. YOUTUBE PROVIDER (Google Data API v3)
// ==========================================
export class YouTubeProvider extends SocialProvider {
  readonly platform: PlatformType = 'YOUTUBE';
  readonly capabilities: ProviderCapabilities = {
    platform: 'YOUTUBE',
    displayName: 'YouTube',
    brandColor: '#FF0000',
    iconName: 'Youtube',
    apiVersion: 'v3',
    category: 'Video & Streaming',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true, // Subscriber count
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 5000,
    maxImages: 1,
    supportsVideo: true,
    maxVideoDurationSeconds: 43200,
    requiresMediaForPosting: true,
    requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    configDocsUrl: 'https://developers.google.com/youtube/v3',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '';
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&state=${state}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) throw new Error('Google YouTube credentials not configured in environment.');

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange YouTube authorization code');
    const d = await res.json();
    const profile = await this.getProfile(d.access_token);

    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresInSeconds: d.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
      metadata: { subscribers: profile.followers },
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const d = await res.json();
        const ch = d.items?.[0];
        if (ch) {
          return {
            platformAccountId: ch.id,
            accountName: ch.snippet.title,
            accountHandle: ch.snippet.customUrl ? `@${ch.snippet.customUrl}` : `@${ch.snippet.title.replace(/\s+/g, '')}`,
            avatarUrl: ch.snippet.thumbnails?.default?.url,
            followers: parseInt(ch.statistics?.subscriberCount || '0', 10) || null,
            following: null,
          };
        }
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'YouTube Channel', accountHandle: '@channel', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return {
      success: false,
      errorMessage: 'Direct binary video upload requires YouTube Resumable Upload protocol. Configure video upload stream.',
    };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'YouTube Data API v3',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 5. TIKTOK PROVIDER (TikTok Content API v2)
// ==========================================
export class TikTokProvider extends SocialProvider {
  readonly platform: PlatformType = 'TIKTOK';
  readonly capabilities: ProviderCapabilities = {
    platform: 'TIKTOK',
    displayName: 'TikTok',
    brandColor: '#000000',
    iconName: 'TikTok',
    apiVersion: 'v2',
    category: 'Video & Streaming',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: true,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 2200,
    maxImages: 35,
    supportsVideo: true,
    maxVideoDurationSeconds: 600,
    requiresMediaForPosting: true,
    requiredEnvVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    configDocsUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    const scopes = encodeURIComponent('user.info.basic,user.info.stats,video.upload,video.publish');
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    if (!clientKey || !clientSecret) throw new Error('TikTok Client credentials not configured in environment.');

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange TikTok authorization code');
    const d = await res.json();
    const profile = await this.getProfile(d.data?.access_token || '');

    return {
      accessToken: d.data?.access_token,
      refreshToken: d.data?.refresh_token,
      expiresInSeconds: d.data?.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const d = await res.json();
        const u = d.data?.user;
        if (u) {
          return {
            platformAccountId: u.open_id,
            accountName: u.display_name,
            accountHandle: `@${u.display_name?.toLowerCase().replace(/\s+/g, '')}`,
            avatarUrl: u.avatar_url,
            followers: u.follower_count ?? null,
            following: u.following_count ?? null,
          };
        }
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'TikTok Creator', accountHandle: '@tiktok_creator', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: 'TikTok video publishing requires direct media chunk upload.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'TikTok Content API v2',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 6. PINTEREST PROVIDER (Pinterest API v5)
// ==========================================
export class PinterestProvider extends SocialProvider {
  readonly platform: PlatformType = 'PINTEREST';
  readonly capabilities: ProviderCapabilities = {
    platform: 'PINTEREST',
    displayName: 'Pinterest',
    brandColor: '#E60023',
    iconName: 'Pinterest',
    apiVersion: 'v5',
    category: 'Creative & Niche',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: false,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: true,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: true,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 500,
    maxImages: 5,
    supportsVideo: true,
    requiresMediaForPosting: true,
    requiredEnvVars: ['PINTEREST_APP_ID', 'PINTEREST_ACCESS_TOKEN'],
    configDocsUrl: 'https://developers.pinterest.com/docs/api/v5/',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const appId = process.env.PINTEREST_APP_ID || '';
    const scopes = encodeURIComponent('boards:read,pins:read,pins:write,user_accounts:read');
    return `https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${state}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const appId = process.env.PINTEREST_APP_ID || '';
    const appSecret = process.env.PINTEREST_APP_SECRET || process.env.PINTEREST_ACCESS_TOKEN || '';
    if (!appId) throw new Error('Pinterest App credentials not configured in environment.');

    const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange Pinterest authorization code');
    const d = await res.json();
    const profile = await this.getProfile(d.access_token);

    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresInSeconds: d.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const u = await res.json();
        return {
          platformAccountId: u.id || u.username,
          accountName: u.business_name || u.username,
          accountHandle: `@${u.username}`,
          avatarUrl: u.profile_image,
          followers: u.follower_count ?? null,
          following: u.following_count ?? null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'Pinterest User', accountHandle: '@pinterest_user', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const val = this.validatePayload(payload);
    if (!val.valid) return { success: false, errorMessage: val.error };

    const mediaUrl = payload.mediaUrls?.[0];
    if (!mediaUrl) return { success: false, errorMessage: 'Pinterest pins require an image URL.' };

    try {
      // Pinterest API v5 strictly requires a board_id
      let boardId = (payload.platformSpecificOptions?.boardId as string) || '';
      if (!boardId) {
        // Fetch user's existing boards
        const boardsRes = await fetch('https://api.pinterest.com/v5/boards', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (boardsRes.ok) {
          const boardsData = await boardsRes.json();
          const boards = boardsData.items || [];
          if (boards.length > 0) {
            boardId = boards[0].id;
          } else {
            // Create default board if none exists
            const createBoardRes = await fetch('https://api.pinterest.com/v5/boards', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: 'SocialFlow Pins', description: 'Pins published via SocialFlow' }),
            });
            if (createBoardRes.ok) {
              const newBoard = await createBoardRes.json();
              boardId = newBoard.id;
            }
          }
        }
      }

      if (!boardId) {
        return {
          success: false,
          errorMessage: 'Pinterest requires an active Board to publish Pins. Please create a board on your Pinterest account.',
        };
      }

      const res = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: boardId,
          title: payload.title || payload.content.slice(0, 100),
          description: payload.content,
          link: payload.linkUrl || undefined,
          media_source: {
            source_type: 'image_url',
            url: mediaUrl,
          },
        }),
      });

      const d = await res.json();
      if (!res.ok || !d.id) {
        return { success: false, errorMessage: d.message || 'Pinterest rejected Pin creation' };
      }
      return { success: true, platformPostId: d.id, platformUrl: `https://www.pinterest.com/pin/${d.id}/` };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Pinterest API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Pinterest API v5',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 7. THREADS PROVIDER (Threads API by Meta)
// ==========================================
export class ThreadsProvider extends SocialProvider {
  readonly platform: PlatformType = 'THREADS';
  readonly capabilities: ProviderCapabilities = {
    platform: 'THREADS',
    displayName: 'Threads',
    brandColor: '#101010',
    iconName: 'Threads',
    apiVersion: 'v1',
    category: 'Major',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 500,
    maxImages: 10,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['META_APP_ID', 'META_APP_SECRET'],
    configDocsUrl: 'https://developers.facebook.com/docs/threads',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const appId = process.env.THREADS_APP_ID || process.env.META_APP_ID || '';
    const scopes = encodeURIComponent('threads_basic,threads_content_publish,threads_read_replies,threads_manage_insights');
    return `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const appId = process.env.THREADS_APP_ID || process.env.META_APP_ID || '';
    const appSecret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET || '';
    if (!appId || !appSecret) throw new Error('Threads API credentials not configured.');

    const res = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange Threads authorization code');
    const d = await res.json();
    const profile = await this.getProfile(d.access_token);

    return {
      accessToken: d.access_token,
      expiresInSeconds: d.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${accessToken}`);
      if (res.ok) {
        const d = await res.json();
        return {
          platformAccountId: d.id,
          accountName: d.username,
          accountHandle: `@${d.username}`,
          avatarUrl: d.threads_profile_picture_url,
          followers: null,
          following: null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'Threads Profile', accountHandle: '@threads_user', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const val = this.validatePayload(payload);
    if (!val.valid) return { success: false, errorMessage: val.error };

    try {
      const createRes = await fetch(`https://graph.threads.net/v1.0/me/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: payload.content,
          access_token: accessToken,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.id) {
        return { success: false, errorMessage: createData.error?.message || 'Threads creation rejected' };
      }

      const pubRes = await fetch(`https://graph.threads.net/v1.0/me/threads_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: accessToken,
        }),
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok || !pubData.id) {
        return { success: false, errorMessage: pubData.error?.message || 'Threads publish rejected' };
      }
      return { success: true, platformPostId: pubData.id, platformUrl: `https://www.threads.net/post/${pubData.id}` };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Threads API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Threads API v1',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 8. REDDIT PROVIDER
// ==========================================
export class RedditProvider extends SocialProvider {
  readonly platform: PlatformType = 'REDDIT';
  readonly capabilities: ProviderCapabilities = {
    platform: 'REDDIT',
    displayName: 'Reddit',
    brandColor: '#FF4500',
    iconName: 'Reddit',
    apiVersion: 'OAuth2',
    category: 'Messaging & Community',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: false,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 40000,
    maxImages: 20,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'],
    configDocsUrl: 'https://www.reddit.com/dev/api/',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.REDDIT_CLIENT_ID || '';
    const scopes = encodeURIComponent('identity submit read');
    return `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=permanent&scope=${scopes}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const clientId = process.env.REDDIT_CLIENT_ID || '';
    const clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) throw new Error('Reddit OAuth credentials not configured in environment.');

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange Reddit authorization code');
    const d = await res.json();
    const profile = await this.getProfile(d.access_token);

    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresInSeconds: d.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `bearer ${accessToken}`,
          'User-Agent': 'SocialFlow/1.0',
        },
      });
      if (res.ok) {
        const d = await res.json();
        return {
          platformAccountId: d.id,
          accountName: d.name,
          accountHandle: `u/${d.name}`,
          avatarUrl: d.icon_img,
          followers: null,
          following: null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'Reddit User', accountHandle: 'u/reddit_user', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const subreddit = (payload.platformSpecificOptions?.subreddit as string) || 'u_me';
    try {
      const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${accessToken}`,
          'User-Agent': 'SocialFlow/1.0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          sr: subreddit,
          kind: 'self',
          title: payload.title || payload.content.slice(0, 80),
          text: payload.content,
        }),
      });

      const d = await res.json();
      if (!res.ok || !d.json?.data?.url) {
        return { success: false, errorMessage: d.json?.errors?.[0]?.[1] || 'Reddit post rejected' };
      }
      return { success: true, platformPostId: d.json.data.id, platformUrl: d.json.data.url };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Reddit API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Reddit API',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 9. DISCORD PROVIDER
// ==========================================
export class DiscordProvider extends SocialProvider {
  readonly platform: PlatformType = 'DISCORD';
  readonly capabilities: ProviderCapabilities = {
    platform: 'DISCORD',
    displayName: 'Discord',
    brandColor: '#5865F2',
    iconName: 'Discord',
    apiVersion: 'Bot v10',
    category: 'Messaging & Community',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: false,
    supportsComments: false,
    supportsMessaging: true,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: false,
    requiresSpecificApiAccess: false,
    characterLimit: 2000,
    maxImages: 10,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['DISCORD_CLIENT_ID', 'DISCORD_BOT_TOKEN'],
    configDocsUrl: 'https://discord.com/developers/docs',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.DISCORD_CLIENT_ID || '';
    const scopes = encodeURIComponent('identify guilds bot');
    return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=2048&scope=${scopes}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenExchangeResult> {
    const clientId = process.env.DISCORD_CLIENT_ID || '';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) throw new Error('Discord Client credentials not configured in environment.');

    const res = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange Discord authorization code');
    const d = await res.json();
    const profile = await this.getProfile(d.access_token);

    return {
      accessToken: d.access_token,
      refreshToken: d.refresh_token,
      expiresInSeconds: d.expires_in,
      platformAccountId: profile.platformAccountId,
      accountName: profile.accountName,
      accountHandle: profile.accountHandle,
      avatarUrl: profile.avatarUrl,
    };
  }

  async getProfile(accessToken: string): Promise<AccountProfileResult> {
    try {
      const res = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const u = await res.json();
        return {
          platformAccountId: u.id,
          accountName: u.global_name || u.username,
          accountHandle: `@${u.username}`,
          avatarUrl: u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png` : undefined,
          followers: null,
          following: null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'Discord Channel', accountHandle: '@discord_user', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const webhookUrl = (payload.platformSpecificOptions?.webhookUrl as string) || process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return { success: false, errorMessage: 'Discord broadcast requires a designated Channel Webhook URL in options or environment.' };
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: payload.content }),
      });
      if (!res.ok) {
        return { success: false, errorMessage: 'Failed to post message to Discord webhook' };
      }
      return { success: true, platformPostId: `discord_${Date.now()}` };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Discord API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Discord Bot v10',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 10. TELEGRAM PROVIDER
// ==========================================
export class TelegramProvider extends SocialProvider {
  readonly platform: PlatformType = 'TELEGRAM';
  readonly capabilities: ProviderCapabilities = {
    platform: 'TELEGRAM',
    displayName: 'Telegram',
    brandColor: '#26A5E4',
    iconName: 'Telegram',
    apiVersion: 'Bot v7.0',
    category: 'Messaging & Community',
    hasOAuth: false, // Telegram uses Bot Token integration
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: false,
    supportsMessaging: true,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true, // Channel member count
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: false,
    requiresSpecificApiAccess: false,
    characterLimit: 4096,
    maxImages: 10,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['TELEGRAM_BOT_TOKEN'],
    configDocsUrl: 'https://core.telegram.org/bots/api',
  };

  getAuthorizationUrl(): string {
    return 'https://t.me/BotFather';
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Telegram connects via official Bot Token configuration.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return { platformAccountId: 'unknown', accountName: 'Telegram Channel', accountHandle: '@telegram_channel', followers: null, following: null };

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      if (res.ok) {
        const d = await res.json();
        return {
          platformAccountId: d.result.id.toString(),
          accountName: d.result.first_name,
          accountHandle: `@${d.result.username}`,
          followers: null,
          following: null,
        };
      }
    } catch {}
    return { platformAccountId: 'unknown', accountName: 'Telegram Bot', accountHandle: '@telegram_bot', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const token = accessToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = (payload.platformSpecificOptions?.chatId as string) || process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return { success: false, errorMessage: 'Telegram requires TELEGRAM_BOT_TOKEN and target Channel Chat ID.' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: payload.content }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        return { success: false, errorMessage: d.description || 'Telegram broadcast failed' };
      }
      return { success: true, platformPostId: d.result.message_id.toString() };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Telegram API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Telegram Bot API',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 11. WHATSAPP BUSINESS PROVIDER
// ==========================================
export class WhatsAppProvider extends SocialProvider {
  readonly platform: PlatformType = 'WHATSAPP';
  readonly capabilities: ProviderCapabilities = {
    platform: 'WHATSAPP',
    displayName: 'WhatsApp Business',
    brandColor: '#25D366',
    iconName: 'WhatsApp',
    apiVersion: 'Cloud API v19.0',
    category: 'Messaging & Community',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: false,
    supportsMessaging: true,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: true,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 4096,
    maxImages: 1,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['META_APP_ID', 'WHATSAPP_PHONE_NUMBER_ID'],
    configDocsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const appId = process.env.META_APP_ID || '';
    const scopes = encodeURIComponent('whatsapp_business_management,whatsapp_business_messaging');
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('WhatsApp Business uses Meta Cloud API Embedded Signup.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'whatsapp_biz', accountName: 'WhatsApp Business', accountHandle: '@whatsapp_channel', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const recipient = payload.platformSpecificOptions?.to as string;
    if (!phoneId || !recipient) {
      return { success: false, errorMessage: 'WhatsApp Cloud API requires WHATSAPP_PHONE_NUMBER_ID and a target recipient phone number.' };
    }
    return { success: false, errorMessage: 'Template approval required for WhatsApp outbound messaging.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'WhatsApp Cloud API',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 12. BLUESKY PROVIDER (AT Protocol)
// ==========================================
export class BlueskyProvider extends SocialProvider {
  readonly platform: PlatformType = 'BLUESKY';
  readonly capabilities: ProviderCapabilities = {
    platform: 'BLUESKY',
    displayName: 'Bluesky',
    brandColor: '#0085FF',
    iconName: 'Bluesky',
    apiVersion: 'atproto v1',
    category: 'Major',
    hasOAuth: false, // AT Protocol App Password
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: true,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: false,
    requiresSpecificApiAccess: false,
    characterLimit: 300,
    maxImages: 4,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['BLUESKY_IDENTIFIER', 'BLUESKY_APP_PASSWORD'],
    configDocsUrl: 'https://docs.bsky.app/',
  };

  getAuthorizationUrl(): string {
    return 'https://bsky.app/settings/app-passwords';
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Bluesky authenticates via AT Protocol App Passwords.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'bsky_user', accountName: 'Bluesky Profile', accountHandle: '@user.bsky.social', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: 'Bluesky requires AT Protocol session login with BLUESKY_IDENTIFIER and BLUESKY_APP_PASSWORD.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'AT Protocol',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 13. MASTODON PROVIDER (ActivityPub)
// ==========================================
export class MastodonProvider extends SocialProvider {
  readonly platform: PlatformType = 'MASTODON';
  readonly capabilities: ProviderCapabilities = {
    platform: 'MASTODON',
    displayName: 'Mastodon',
    brandColor: '#6364FF',
    iconName: 'Mastodon',
    apiVersion: 'v1',
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
    supportsFollowing: true,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: false,
    requiresSpecificApiAccess: false,
    characterLimit: 500,
    maxImages: 4,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['MASTODON_INSTANCE_URL', 'MASTODON_ACCESS_TOKEN'],
    configDocsUrl: 'https://docs.joinmastodon.org/client/intro/',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const instance = process.env.MASTODON_INSTANCE_URL || 'https://mastodon.social';
    const clientId = process.env.MASTODON_CLIENT_ID || '';
    return `${instance}/oauth/authorize?client_id=${clientId}&scope=read+write+follow&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Mastodon token exchange requires configured instance client credentials.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'mastodon_user', accountName: 'Mastodon User', accountHandle: '@user@mastodon.social', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const instance = process.env.MASTODON_INSTANCE_URL || 'https://mastodon.social';
    const token = accessToken || process.env.MASTODON_ACCESS_TOKEN;
    if (!token) return { success: false, errorMessage: 'Mastodon Access Token missing.' };

    try {
      const res = await fetch(`${instance}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: payload.content }),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, errorMessage: d.error || 'Mastodon post rejected' };
      return { success: true, platformPostId: d.id, platformUrl: d.url };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'Mastodon API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Mastodon REST API',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 14. SNAPCHAT PROVIDER
// ==========================================
export class SnapchatProvider extends SocialProvider {
  readonly platform: PlatformType = 'SNAPCHAT';
  readonly capabilities: ProviderCapabilities = {
    platform: 'SNAPCHAT',
    displayName: 'Snapchat',
    brandColor: '#FFFC00',
    iconName: 'Snapchat',
    apiVersion: 'Marketing v1',
    category: 'Creative & Niche',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: false,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: true,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 250,
    maxImages: 1,
    supportsVideo: true,
    requiresMediaForPosting: true,
    requiredEnvVars: ['SNAPCHAT_CLIENT_ID', 'SNAPCHAT_CLIENT_SECRET'],
    configDocsUrl: 'https://marketingapi.snapchat.com/docs/',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.SNAPCHAT_CLIENT_ID || '';
    return `https://accounts.snapchat.com/login/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snapchat-marketing-api&state=${state}`;
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Snapchat Marketing API credentials required.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'snap_user', accountName: 'Snapchat Brand', accountHandle: '@snapchat_brand', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: 'Snapchat Story/Creative requires approved Snapchat Creative Media Kit.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Snapchat Marketing API',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 15. TUMBLR PROVIDER
// ==========================================
export class TumblrProvider extends SocialProvider {
  readonly platform: PlatformType = 'TUMBLR';
  readonly capabilities: ProviderCapabilities = {
    platform: 'TUMBLR',
    displayName: 'Tumblr',
    brandColor: '#36465D',
    iconName: 'Tumblr',
    apiVersion: 'v2',
    category: 'Blogging & Publishing',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: false,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: true,
    supportsScheduling: true,
    supportsWebhooks: false,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: false,
    characterLimit: 10000,
    maxImages: 10,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['TUMBLR_CONSUMER_KEY', 'TUMBLR_CONSUMER_SECRET'],
    configDocsUrl: 'https://www.tumblr.com/docs/en/api/v2',
  };

  getAuthorizationUrl(): string {
    return 'https://www.tumblr.com/oauth/authorize';
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Tumblr uses OAuth 1.0a / OAuth 2.0.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'tumblr_blog', accountName: 'Tumblr Blog', accountHandle: '@tumblr_blog', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: 'Tumblr publishing requires blog identifier and OAuth credentials.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Tumblr API v2',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 16. MEDIUM PROVIDER
// ==========================================
export class MediumProvider extends SocialProvider {
  readonly platform: PlatformType = 'MEDIUM';
  readonly capabilities: ProviderCapabilities = {
    platform: 'MEDIUM',
    displayName: 'Medium',
    brandColor: '#000000',
    iconName: 'Medium',
    apiVersion: 'v1',
    category: 'Blogging & Publishing',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: false,
    supportsComments: false,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: false,
    supportsWebhooks: false,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: false,
    requiresSpecificApiAccess: false,
    characterLimit: 50000,
    maxImages: 20,
    supportsVideo: false,
    requiresMediaForPosting: false,
    requiredEnvVars: ['MEDIUM_CLIENT_ID', 'MEDIUM_CLIENT_SECRET'],
    configDocsUrl: 'https://github.com/Medium/medium-api-docs',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.MEDIUM_CLIENT_ID || '';
    return `https://medium.com/m/oauth/authorize?client_id=${clientId}&scope=basicProfile,publishPost&state=${state}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Medium credentials required.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'medium_author', accountName: 'Medium Author', accountHandle: '@medium_author', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: 'Medium publication requires post title and canonical URL.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Medium API v1',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 17. QUORA PROVIDER
// ==========================================
export class QuoraProvider extends SocialProvider {
  readonly platform: PlatformType = 'QUORA';
  readonly capabilities: ProviderCapabilities = {
    platform: 'QUORA',
    displayName: 'Quora',
    brandColor: '#B92B27',
    iconName: 'Quora',
    apiVersion: 'Partner API',
    category: 'Blogging & Publishing',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: false, // Quora restricted writing API
    supportsAnalytics: true,
    supportsComments: false,
    supportsMessaging: false,
    supportsMedia: false,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: false,
    supportsScheduling: false,
    supportsWebhooks: false,
    requiresBusinessAccount: true,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 10000,
    maxImages: 1,
    supportsVideo: false,
    requiredEnvVars: ['QUORA_ACCESS_TOKEN'],
    configDocsUrl: 'https://www.quora.com/business',
  };

  getAuthorizationUrl(): string {
    return 'https://www.quora.com/business';
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Quora Partner API access approval required.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'quora_user', accountName: 'Quora Author', accountHandle: '@quora_author', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: '[UNSUPPORTED] Direct public answer creation is not supported by Quora Partner API.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Quora Ads/Partner API',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 18. WORDPRESS PROVIDER (REST API v2)
// ==========================================
export class WordPressProvider extends SocialProvider {
  readonly platform: PlatformType = 'WORDPRESS';
  readonly capabilities: ProviderCapabilities = {
    platform: 'WORDPRESS',
    displayName: 'WordPress',
    brandColor: '#21759B',
    iconName: 'WordPress',
    apiVersion: 'REST v2',
    category: 'Blogging & Publishing',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: false,
    supportsFollowing: false,
    supportsScheduling: true,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: false,
    requiresSpecificApiAccess: false,
    characterLimit: 50000,
    maxImages: 20,
    supportsVideo: true,
    requiresMediaForPosting: false,
    requiredEnvVars: ['WORDPRESS_SITE_URL', 'WORDPRESS_APP_PASSWORD'],
    configDocsUrl: 'https://developer.wordpress.org/rest-api/',
  };

  getAuthorizationUrl(): string {
    const site = process.env.WORDPRESS_SITE_URL || 'https://wordpress.com';
    return `${site}/wp-admin/profile.php`;
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('WordPress connects via Application Passwords or OAuth2.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'wp_site', accountName: 'WordPress Site', accountHandle: '@wordpress_site', followers: null, following: null };
  }

  async publishPost(accessToken: string, payload: PublishPostPayload): Promise<PublishResult> {
    const siteUrl = process.env.WORDPRESS_SITE_URL;
    const authPass = accessToken || process.env.WORDPRESS_APP_PASSWORD;
    if (!siteUrl || !authPass) {
      return { success: false, errorMessage: 'WordPress publishing requires WORDPRESS_SITE_URL and application password.' };
    }

    try {
      const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(authPass).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title || payload.content.slice(0, 60),
          content: payload.content,
          status: 'publish',
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.id) return { success: false, errorMessage: d.message || 'WordPress post creation rejected' };
      return { success: true, platformPostId: d.id.toString(), platformUrl: d.link };
    } catch (e: unknown) {
      return { success: false, errorMessage: e instanceof Error ? e.message : 'WordPress API error' };
    }
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'WordPress REST v2',
      lastSyncedAt: new Date(),
    };
  }
}

// ==========================================
// 19. VIMEO PROVIDER (Vimeo API v3.4)
// ==========================================
export class VimeoProvider extends SocialProvider {
  readonly platform: PlatformType = 'VIMEO';
  readonly capabilities: ProviderCapabilities = {
    platform: 'VIMEO',
    displayName: 'Vimeo',
    brandColor: '#1AB7EA',
    iconName: 'Vimeo',
    apiVersion: 'v3.4',
    category: 'Video & Streaming',
    hasOAuth: true,
    hasApi: true,
    supportsPublishing: true,
    supportsAnalytics: true,
    supportsComments: true,
    supportsMessaging: false,
    supportsMedia: true,
    supportsAccountInfo: true,
    supportsFollowers: true,
    supportsFollowing: true,
    supportsScheduling: false,
    supportsWebhooks: true,
    requiresBusinessAccount: false,
    requiresDeveloperApproval: true,
    requiresSpecificApiAccess: true,
    characterLimit: 5000,
    maxImages: 1,
    supportsVideo: true,
    maxVideoDurationSeconds: 18000,
    requiresMediaForPosting: true,
    requiredEnvVars: ['VIMEO_CLIENT_ID', 'VIMEO_CLIENT_SECRET'],
    configDocsUrl: 'https://developer.vimeo.com/api/guides/start',
  };

  getAuthorizationUrl(state: string, redirectUri: string): string {
    const clientId = process.env.VIMEO_CLIENT_ID || '';
    return `https://api.vimeo.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=public+private+upload`;
  }

  async handleCallback(): Promise<TokenExchangeResult> {
    throw new Error('Vimeo Client credentials required.');
  }

  async getProfile(): Promise<AccountProfileResult> {
    return { platformAccountId: 'vimeo_channel', accountName: 'Vimeo Showcase', accountHandle: '@vimeo_channel', followers: null, following: null };
  }

  async publishPost(): Promise<PublishResult> {
    return { success: false, errorMessage: 'Vimeo video upload requires tus resumable upload protocol.' };
  }

  async getAnalytics(): Promise<SocialAnalyticsData> {
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
      dataSource: 'Vimeo API v3.4',
      lastSyncedAt: new Date(),
    };
  }
}
