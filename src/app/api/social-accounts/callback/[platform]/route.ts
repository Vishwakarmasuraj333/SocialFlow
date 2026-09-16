import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { encryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error') || searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Missing OAuth authorization code or state token')}`
    );
  }

  try {
    // Decode state
    let stateData: { workspaceId?: string; userId?: string } = {};
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch {
      stateData = {};
    }

    const platformType = platform.toUpperCase() as PlatformType;
    const provider = providerFactory.getProvider(platformType);
    const redirectUri = `${appUrl}/api/social-accounts/callback/${platform.toLowerCase()}`;

    // Exchange code for real access token
    const tokenResult = await provider.exchangeCodeForToken(code, redirectUri);
    const encrypted = encryptSecret(tokenResult.accessToken);

    const workspaceId = stateData.workspaceId || (await prisma.workspace.findFirst())?.id;
    if (!workspaceId) {
      throw new Error('No active workspace context found for OAuth connection');
    }

    const handle = tokenResult.accountHandle?.startsWith('@')
      ? tokenResult.accountHandle
      : `@${tokenResult.accountHandle || platform.toLowerCase() + '_verified'}`;

    const realFollowers = Number((tokenResult.metadata as any)?.followers) || 0;
    const platformRef = await prisma.platform.findUnique({
      where: { slug: platform.toLowerCase() },
    });

    const account = await prisma.socialAccount.create({
      data: {
        workspaceId,
        platformId: platformRef?.id || null,
        platform: platformType,
        accountName: tokenResult.accountName || `${provider.capabilities.displayName} Channel`,
        accountHandle: handle,
        avatarUrl: tokenResult.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(handle)}`,
        platformAccountId: tokenResult.platformAccountId || `${platform.toLowerCase()}_${Date.now()}`,
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
        metadataJson: JSON.stringify({
          followers: realFollowers,
          verified: Boolean((tokenResult.metadata as any)?.verified),
          category: `${provider.capabilities.displayName} Official Channel`,
          linkedWebsite: '',
        }),
        credentials: {
          create: {
            encryptedAccessToken: encrypted.encrypted,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            scopes: tokenResult.scopes?.join(',') || 'all',
            tokenExpiresAt: tokenResult.expiresInSeconds
              ? new Date(Date.now() + tokenResult.expiresInSeconds * 1000)
              : new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        },
      },
    });

    if (stateData.userId) {
      await logAuditEvent({
        workspaceId,
        userId: stateData.userId,
        action: 'ACCOUNT_CONNECTED',
        entityType: 'SocialAccount',
        entityId: account.id,
        metadata: { platform: platformType, handle: account.accountHandle, oauthFlow: 'PKCE_DIRECT' },
      });
    }

    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?connected=${encodeURIComponent(account.accountName)}&success=true`
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'OAuth authorization failed';
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(errorMsg)}`
    );
  }
}
