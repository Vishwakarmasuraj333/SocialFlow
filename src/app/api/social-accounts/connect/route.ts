import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { encryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(auth.workspace.role, 'accounts:connect')) {
    return NextResponse.json({ error: 'Permission denied: cannot connect accounts' }, { status: 403 });
  }

  try {
    const { platform, accountName, accountHandle, avatarUrl, customAccessToken, metadataJson } = await req.json();

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    const platformType = platform.toUpperCase() as PlatformType;
    const provider = providerFactory.getProvider(platformType);
    const isConfigured = providerFactory.isPlatformConfigured(platformType);

    // If OAuth app credentials exist, return OAuth redirect URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/social-accounts/callback/${platformType.toLowerCase()}`;
    const state = Buffer.from(JSON.stringify({ workspaceId: auth.workspace.id, userId: auth.user.id })).toString('base64');

    if (isConfigured && !accountName) {
      const authUrl = provider.getAuthorizationUrl(state, redirectUri);
      return NextResponse.json({
        mode: 'OAUTH_REDIRECT',
        authUrl,
      });
    }

    if (!isConfigured && !accountName && !customAccessToken) {
      return NextResponse.json(
        {
          error: `OAuth configuration required: ${platformType} API Client ID and Secret are not configured in .env.`,
          status: 'CONFIGURATION_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Connect account directly with encrypted credentials
    const cleanHandle = (accountHandle || `@${auth.workspace.slug}`).trim();
    const cleanName = (accountName || `${auth.workspace.name} (${provider.capabilities.displayName})`).trim();
    const rawToken = customAccessToken || `sf_token_${platformType.toLowerCase()}_${Date.now()}`;
    const encrypted = encryptSecret(rawToken);

    const platformAccountId = `${platformType.toLowerCase()}_${Date.now()}`;

    let parsedMetaFollowers = 0;
    if (metadataJson) {
      try {
        const p = typeof metadataJson === 'string' ? JSON.parse(metadataJson) : metadataJson;
        parsedMetaFollowers = Number(p.followers) || 0;
      } catch {}
    }

    const formattedMeta = typeof metadataJson === 'string'
      ? metadataJson
      : metadataJson
        ? JSON.stringify(metadataJson)
        : JSON.stringify({
            followers: parsedMetaFollowers,
            verified: false,
            category: `${provider.capabilities.displayName} Channel`,
          });

    const platformRef = await prisma.platform.findUnique({
      where: { slug: platformType.toLowerCase() },
    });

    const account = await prisma.socialAccount.create({
      data: {
        workspaceId: auth.workspace.id,
        platformId: platformRef?.id || null,
        platform: platformType,
        accountName: cleanName,
        accountHandle: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanHandle)}`,
        platformAccountId,
        status: 'CONNECTED',
        metadataJson: formattedMeta,
        lastSyncedAt: new Date(),
        credentials: {
          create: {
            encryptedAccessToken: encrypted.encrypted,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            scopes: 'all',
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        },
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'ACCOUNT_CONNECTED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: { platform: platformType, handle: account.accountHandle },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountHandle: account.accountHandle,
        avatarUrl: account.avatarUrl,
        status: account.status,
        lastSyncedAt: account.lastSyncedAt,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to connect account';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
