import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { encryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';
import { verifyOAuthState } from '@/lib/oauth-state';

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
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(`Provider returned error: ${error}`)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Missing OAuth authorization code or state token')}`
    );
  }

  try {
    // Validate signed state token (CSRF protection)
    const stateData = await verifyOAuthState(state);
    if (!stateData) {
      return NextResponse.redirect(
        `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Invalid or expired OAuth state token. Please restart connection.')}`
      );
    }

    const platformType = (platform === 'TWITTER' ? 'X' : platform.toUpperCase()) as PlatformType;
    const provider = providerFactory.getProvider(platformType);
    const { getPlatformRedirectUri } = await import('@/services/social/redirect-uri');
    
    // Ensure the redirectUri exactly matches what was used during authorization
    const redirectUri = process.env.X_REDIRECT_URI && platformType === 'X'
      ? process.env.X_REDIRECT_URI
      : `${appUrl}/api/social-accounts/callback/${platform.toLowerCase()}`;

    // Exchange authorization code for real access tokens
    const tokenResult = await provider.handleCallback(code, redirectUri, stateData.codeVerifier);
    const encrypted = encryptSecret(tokenResult.accessToken);

    const workspaceId = stateData.workspaceId;
    if (!workspaceId) {
      throw new Error('No active workspace context found for OAuth connection');
    }

    const handle = tokenResult.accountHandle?.startsWith('@')
      ? tokenResult.accountHandle
      : `@${tokenResult.accountHandle || platform.toLowerCase() + '_user'}`;

    const realFollowers = tokenResult.metadata?.followers ?? null;
    const realFollowing = tokenResult.metadata?.following ?? null;

    const platformRef = await prisma.platform.findUnique({
      where: { slug: platformType.toLowerCase() },
    });

    // Check if this platform account is already connected in this workspace
    const existing = await prisma.socialAccount.findUnique({
      where: {
        workspaceId_platform_platformAccountId: {
          workspaceId,
          platform: platformType,
          platformAccountId: tokenResult.platformAccountId,
        },
      },
      include: { credentials: true },
    });

    let accountId: string;

    if (existing) {
      // Reconnect existing account
      const updated = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName: tokenResult.accountName || existing.accountName,
          accountHandle: handle,
          avatarUrl: tokenResult.avatarUrl || existing.avatarUrl,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
          isSoftDeleted: false,
          metadataJson: JSON.stringify({
            followers: realFollowers,
            following: realFollowing,
            verified: true,
            category: `${provider.capabilities.displayName} Channel`,
          }),
        },
      });

      if (existing.credentials) {
        await prisma.oAuthCredential.update({
          where: { id: existing.credentials.id },
          data: {
            encryptedAccessToken: encrypted.encrypted,
            encryptedRefreshToken: tokenResult.refreshToken ? encryptSecret(tokenResult.refreshToken).encrypted : null,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            scopes: tokenResult.scopes?.join(',') || 'all',
            tokenExpiresAt: tokenResult.expiresInSeconds
              ? new Date(Date.now() + tokenResult.expiresInSeconds * 1000)
              : new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        });
      }

      accountId = updated.id;
    } else {
      // Create new connected account
      const created = await prisma.socialAccount.create({
        data: {
          workspaceId,
          platformId: platformRef?.id || null,
          platform: platformType,
          accountName: tokenResult.accountName || `${provider.capabilities.displayName} Channel`,
          accountHandle: handle,
          avatarUrl: tokenResult.avatarUrl,
          platformAccountId: tokenResult.platformAccountId,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
          metadataJson: JSON.stringify({
            followers: realFollowers,
            following: realFollowing,
            verified: true,
            category: `${provider.capabilities.displayName} Official Channel`,
          }),
          credentials: {
            create: {
              encryptedAccessToken: encrypted.encrypted,
              encryptedRefreshToken: tokenResult.refreshToken ? encryptSecret(tokenResult.refreshToken).encrypted : null,
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

      accountId = created.id;
    }

    // Audit log
    await logAuditEvent({
      workspaceId,
      userId: stateData.userId,
      action: 'ACCOUNT_CONNECTED',
      entityType: 'SocialAccount',
      entityId: accountId,
      metadata: { platform: platformType, handle, oauthFlow: 'OAUTH2_STATE_VERIFIED' },
    });

    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?connected=${encodeURIComponent(tokenResult.accountName || provider.capabilities.displayName)}&success=true`
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'OAuth authorization failed';
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(errorMsg)}`
    );
  }
}
