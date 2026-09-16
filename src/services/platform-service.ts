import prisma from '@/lib/db';
import { ALL_SUPPORTED_PLATFORMS, SupportedPlatform } from '@/components/brand/platform-icons';

export interface PlatformConfigStatus {
  isConfigured: boolean;
  hasConnectedAccounts: boolean;
  status: 'CONNECTED' | 'AVAILABLE' | 'CONFIGURATION_REQUIRED' | 'API_LIMITED' | 'DISABLED';
}

export function checkPlatformConfigStatus(slug: string, connectedCount = 0): PlatformConfigStatus {
  const upper = slug.toUpperCase();
  let isConfigured = false;

  switch (upper) {
    case 'LINKEDIN':
      isConfigured = Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
      break;
    case 'FACEBOOK':
    case 'INSTAGRAM':
    case 'THREADS':
      isConfigured = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
      break;
    case 'TWITTER':
    case 'X':
      isConfigured = Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET);
      break;
    case 'TIKTOK':
      isConfigured = Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
      break;
    case 'YOUTUBE':
      isConfigured = Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET);
      break;
    case 'PINTEREST':
      isConfigured = Boolean(process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET);
      break;
    default:
      isConfigured = false;
  }

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
      oauthEnabled: ['linkedin', 'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'pinterest', 'threads'].includes(p.id.toLowerCase()),
      publishingEnabled: true,
      analyticsEnabled: ['linkedin', 'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'pinterest', 'threads'].includes(p.id.toLowerCase()),
      messagingEnabled: ['facebook', 'instagram', 'twitter', 'linkedin'].includes(p.id.toLowerCase()),
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
 * Returns all database platforms merged with real connection status.
 */
export async function getPlatformsWithRealStatus(workspaceId?: string) {
  await ensureDefaultPlatforms();

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
