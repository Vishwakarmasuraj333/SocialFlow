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
 * Sanitizes legacy database records that might contain emails or invalid credentials.
 * Architectural rule: Database records NEVER inject credentials into process.env.
 * All OAuth credentials must come strictly from server-side environment variables.
 */
export async function sanitizeLegacyPlatformCredentials() {
  try {
    await prisma.platform.updateMany({
      where: {
        OR: [
          { clientId: { contains: '@' } },
          { clientSecret: { contains: '@' } },
        ],
      },
      data: {
        clientId: null,
        clientSecret: null,
      },
    }).catch(() => {});
  } catch (err) {
    console.error('Error sanitizing legacy platform credentials:', err);
  }
}

/**
 * Legacy compatibility stub: Database-to-environment synchronization is disabled.
 * OAuth Client IDs and Secrets are loaded strictly from server-side environment variables.
 */
export async function syncDbCredentialsToEnv() {
  await sanitizeLegacyPlatformCredentials();
}

/**
 * Returns all database platforms merged with real connection status.
 * Client secrets are NEVER returned to the client/API response.
 */
export async function getPlatformsWithRealStatus(workspaceId?: string) {
  await ensureDefaultPlatforms();
  await sanitizeLegacyPlatformCredentials();

  const [platforms, accounts] = await Promise.all([
    prisma.platform.findMany({
      where: { isSoftDeleted: false },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        category: true,
        oauthEnabled: true,
        publishingEnabled: true,
        analyticsEnabled: true,
        messagingEnabled: true,
        schedulingEnabled: true,
        characterLimit: true,
        mediaLimit: true,
        videoSupport: true,
        imageSupport: true,
        apiVersion: true,
        status: true,
        clientId: true,
        // clientSecret is strictly omitted for security
        createdAt: true,
        updatedAt: true,
      },
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
