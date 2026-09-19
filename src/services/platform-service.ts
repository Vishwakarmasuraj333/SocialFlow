import prisma from '@/lib/db';
import { ALL_SUPPORTED_PLATFORMS } from '@/components/brand/platform-icons';
import { providerFactory } from '@/services/social/provider-factory';

export interface PlatformConfigStatus {
  isConfigured: boolean;
  hasConnectedAccounts: boolean;
  status: 'CONNECTED' | 'AVAILABLE' | 'CONFIGURATION_REQUIRED' | 'API_LIMITED' | 'DISABLED';
}

export function checkPlatformConfigStatus(slug: string, connectedCount = 0): PlatformConfigStatus {
  const isConfigured = providerFactory.isPlatformConfigured(slug);
  const hasConnectedAccounts = connectedCount > 0;
  let status: PlatformConfigStatus['status'] = 'CONFIGURATION_REQUIRED';

  if (hasConnectedAccounts) {
    status = 'CONNECTED';
  } else if (isConfigured) {
    status = 'AVAILABLE';
  } else {
    status = 'CONFIGURATION_REQUIRED';
  }

  return { isConfigured, hasConnectedAccounts, status };
}

/**
 * Ensures initial default platforms exist in the database.
 */
export async function ensureDefaultPlatforms() {
  const count = await prisma.platform.count();
  if (count > 0) return;

  const defaultPlatforms = ALL_SUPPORTED_PLATFORMS.map((p) => {
    const config = checkPlatformConfigStatus(p.id, 0);
    return {
      name: p.displayName || p.name,
      slug: p.id.toLowerCase(),
      logo: p.key,
      category: p.category,
      oauthEnabled: true,
      publishingEnabled: true,
      analyticsEnabled: true,
      messagingEnabled: ['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'discord'].includes(p.id.toLowerCase()),
      schedulingEnabled: true,
      characterLimit: p.characterLimit || p.charLimit || 2200,
      mediaLimit: p.maxImages || p.imgLimit || 4,
      videoSupport: Boolean(p.supportsVideo ?? p.video),
      imageSupport: true,
      apiVersion: p.apiBadge || 'REST v2',
      status: config.status,
    };
  });

  for (const plat of defaultPlatforms) {
    await prisma.platform.upsert({
      where: { slug: plat.slug },
      update: {},
      create: plat,
    });
  }
}

/**
 * Dynamically loads database-configured OAuth credentials into process.env
 * so all certified providers can operate seamlessly even without manual .env edits.
 */
export async function syncDbCredentialsToEnv() {
  try {
    // 1. One-time DB cleanup: remove invalid email values saved in clientId
    await prisma.platform.updateMany({
      where: {
        clientId: { contains: '@' },
      },
      data: {
        clientId: null,
        clientSecret: null,
      },
    }).catch(() => {});

    const configuredInDb = await prisma.platform.findMany({
      where: {
        isSoftDeleted: false,
        clientId: { not: null },
      },
      select: {
        slug: true,
        clientId: true,
        clientSecret: true,
      },
    });

    for (const p of configuredInDb) {
      if (!p.clientId || p.clientId.includes('@')) continue;
      const slug = p.slug.toLowerCase();
      const secret = p.clientSecret && !p.clientSecret.includes('@') ? p.clientSecret : '';

      switch (slug) {
        case 'facebook':
        case 'instagram':
        case 'threads':
          if (!process.env.META_APP_ID) process.env.META_APP_ID = p.clientId;
          if (secret && !process.env.META_APP_SECRET) process.env.META_APP_SECRET = secret;
          break;
        case 'linkedin':
          if (!process.env.LINKEDIN_CLIENT_ID) process.env.LINKEDIN_CLIENT_ID = p.clientId;
          if (secret && !process.env.LINKEDIN_CLIENT_SECRET) process.env.LINKEDIN_CLIENT_SECRET = secret;
          break;
        case 'x':
        case 'twitter':
          if (!process.env.X_CLIENT_ID) process.env.X_CLIENT_ID = p.clientId;
          if (secret && !process.env.X_CLIENT_SECRET) process.env.X_CLIENT_SECRET = secret;
          if (!process.env.TWITTER_CLIENT_ID) process.env.TWITTER_CLIENT_ID = p.clientId;
          if (secret && !process.env.TWITTER_CLIENT_SECRET) process.env.TWITTER_CLIENT_SECRET = secret;
          break;
        case 'youtube':
          if (!process.env.YOUTUBE_CLIENT_ID) process.env.YOUTUBE_CLIENT_ID = p.clientId;
          if (secret && !process.env.YOUTUBE_CLIENT_SECRET) process.env.YOUTUBE_CLIENT_SECRET = secret;
          if (!process.env.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = p.clientId;
          if (secret && !process.env.GOOGLE_CLIENT_SECRET) process.env.GOOGLE_CLIENT_SECRET = secret;
          break;
        case 'tiktok':
          if (!process.env.TIKTOK_CLIENT_KEY) process.env.TIKTOK_CLIENT_KEY = p.clientId;
          if (secret && !process.env.TIKTOK_CLIENT_SECRET) process.env.TIKTOK_CLIENT_SECRET = secret;
          break;
        case 'pinterest':
          if (!process.env.PINTEREST_APP_ID) process.env.PINTEREST_APP_ID = p.clientId;
          if (secret && !process.env.PINTEREST_APP_SECRET) process.env.PINTEREST_APP_SECRET = secret;
          break;
        case 'snapchat':
          if (!process.env.SNAPCHAT_CLIENT_ID) process.env.SNAPCHAT_CLIENT_ID = p.clientId;
          if (secret && !process.env.SNAPCHAT_CLIENT_SECRET) process.env.SNAPCHAT_CLIENT_SECRET = secret;
          break;
        case 'reddit':
          if (!process.env.REDDIT_CLIENT_ID) process.env.REDDIT_CLIENT_ID = p.clientId;
          if (secret && !process.env.REDDIT_CLIENT_SECRET) process.env.REDDIT_CLIENT_SECRET = secret;
          break;
        case 'whatsapp':
          if (!process.env.META_APP_ID) process.env.META_APP_ID = p.clientId;
          if (secret && !process.env.WHATSAPP_PHONE_NUMBER_ID) process.env.WHATSAPP_PHONE_NUMBER_ID = secret;
          break;
        case 'telegram':
          if (!process.env.TELEGRAM_BOT_TOKEN) process.env.TELEGRAM_BOT_TOKEN = p.clientId;
          break;
        case 'discord':
          if (!process.env.DISCORD_CLIENT_ID) process.env.DISCORD_CLIENT_ID = p.clientId;
          if (secret && !process.env.DISCORD_BOT_TOKEN) process.env.DISCORD_BOT_TOKEN = secret;
          break;
        case 'bluesky':
          if (!process.env.BLUESKY_IDENTIFIER) process.env.BLUESKY_IDENTIFIER = p.clientId;
          if (secret && !process.env.BLUESKY_APP_PASSWORD) process.env.BLUESKY_APP_PASSWORD = secret;
          break;
        case 'mastodon':
          if (!process.env.MASTODON_ACCESS_TOKEN) process.env.MASTODON_ACCESS_TOKEN = p.clientId;
          break;
        case 'tumblr':
          if (!process.env.TUMBLR_CONSUMER_KEY) process.env.TUMBLR_CONSUMER_KEY = p.clientId;
          if (secret && !process.env.TUMBLR_CONSUMER_SECRET) process.env.TUMBLR_CONSUMER_SECRET = secret;
          break;
        case 'medium':
          if (!process.env.MEDIUM_CLIENT_ID) process.env.MEDIUM_CLIENT_ID = p.clientId;
          if (secret && !process.env.MEDIUM_CLIENT_SECRET) process.env.MEDIUM_CLIENT_SECRET = secret;
          break;
        case 'quora':
          if (!process.env.QUORA_ACCESS_TOKEN) process.env.QUORA_ACCESS_TOKEN = p.clientId;
          break;
        case 'wordpress':
          if (!process.env.WORDPRESS_SITE_URL) process.env.WORDPRESS_SITE_URL = p.clientId;
          if (secret && !process.env.WORDPRESS_APP_PASSWORD) process.env.WORDPRESS_APP_PASSWORD = secret;
          break;
        case 'vimeo':
          if (!process.env.VIMEO_CLIENT_ID) process.env.VIMEO_CLIENT_ID = p.clientId;
          if (secret && !process.env.VIMEO_CLIENT_SECRET) process.env.VIMEO_CLIENT_SECRET = secret;
          break;
      }
    }
  } catch (err) {
    console.error('Error syncing DB credentials to env:', err);
  }
}

/**
 * Returns all database platforms merged with real connection status.
 */
export async function getPlatformsWithRealStatus(workspaceId?: string) {
  await ensureDefaultPlatforms();
  await syncDbCredentialsToEnv();

  const [platforms, accounts] = await Promise.all([
    prisma.platform.findMany({
      where: { isSoftDeleted: false },
      orderBy: { name: 'asc' },
    }),
    prisma.socialAccount.findMany({
      where: {
        isSoftDeleted: false,
        status: 'CONNECTED',
        ...(workspaceId ? { workspaceId } : {}),
      },
      select: { platform: true },
    }),
  ]);

  const platformCounts: Record<string, number> = {};
  for (const acc of accounts) {
    const key = acc.platform.toLowerCase();
    platformCounts[key] = (platformCounts[key] || 0) + 1;
  }

  return platforms.map((p) => {
    const connectedCount = platformCounts[p.slug.toLowerCase()] || 0;
    const config = checkPlatformConfigStatus(p.slug, connectedCount);

    return {
      ...p,
      connectedAccountsCount: connectedCount,
      isConfigured: config.isConfigured,
      computedStatus: p.status === 'DISABLED' ? 'DISABLED' : config.status,
    };
  });
}
