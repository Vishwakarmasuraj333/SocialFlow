import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const account = await prisma.socialAccount.findUnique({
      where: { id },
      include: { credentials: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    const platformType = (account.platform === 'TWITTER' ? 'X' : account.platform.toUpperCase()) as PlatformType;
    const isConfigured = providerFactory.isPlatformConfigured(platformType);

    if (!isConfigured) {
      return NextResponse.json({
        error: `${platformType} integration credentials are not configured in the server environment.`,
      }, { status: 400 });
    }

    const provider = providerFactory.getProvider(platformType) as any;

    // 1. Attempt silent token refresh if a refresh token is stored
    if (account.credentials?.encryptedRefreshToken && typeof provider.refreshAccessToken === 'function') {
      try {
        const { decryptSecret, encryptSecret } = await import('@/lib/encryption');
        const plainRefreshToken = decryptSecret(
          account.credentials.encryptedRefreshToken,
          account.credentials.iv,
          account.credentials.authTag
        );

        const refreshResult = await provider.refreshAccessToken(plainRefreshToken);
        if (refreshResult?.accessToken) {
          const encAccess = encryptSecret(refreshResult.accessToken);
          const encRefresh = refreshResult.refreshToken ? encryptSecret(refreshResult.refreshToken) : null;

          await prisma.oAuthCredential.update({
            where: { id: account.credentials.id },
            data: {
              encryptedAccessToken: encAccess.encrypted,
              ...(encRefresh ? { encryptedRefreshToken: encRefresh.encrypted } : {}),
              iv: encAccess.iv,
              authTag: encAccess.authTag,
              tokenExpiresAt: refreshResult.expiresInSeconds
                ? new Date(Date.now() + refreshResult.expiresInSeconds * 1000)
                : new Date(Date.now() + 60 * 24 * 3600 * 1000),
            },
          });

          const updatedAccount = await prisma.socialAccount.update({
            where: { id: account.id },
            data: {
              status: 'CONNECTED',
              lastSyncedAt: new Date(),
            },
          });

          await logAuditEvent({
            workspaceId: account.workspaceId,
            userId: auth.user.id,
            action: 'ACCOUNT_RECONNECTED',
            entityType: 'SocialAccount',
            entityId: account.id,
            metadata: { platform: account.platform, mode: 'TOKEN_REFRESH_SUCCESS' },
          }).catch(() => {});

          return NextResponse.json({
            success: true,
            reconnected: true,
            message: `${account.platform} access token was securely refreshed. No re-authorization needed!`,
            account: updatedAccount,
          });
        }
      } catch (refreshErr) {
        console.warn('Silent token refresh failed, falling back to full OAuth flow:', refreshErr);
      }
    }

    // 2. Fallback: Initiate full OAuth flow with cryptographically signed state & PKCE
    const { generateOAuthState, generatePKCEVerifier, generatePKCEChallenge } = await import('@/lib/oauth-state');
    const { getPlatformRedirectUri } = await import('@/services/social/redirect-uri');
    const redirectUri = getPlatformRedirectUri(platformType);

    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (platformType === 'X') {
      codeVerifier = generatePKCEVerifier();
      codeChallenge = generatePKCEChallenge(codeVerifier);
    }

    const state = await generateOAuthState({
      workspaceId: account.workspaceId,
      userId: auth.user.id,
      platform: platformType,
      reconnectAccountId: account.id,
      codeVerifier,
    });

    const authUrl = provider.getAuthorizationUrl(state, redirectUri, codeChallenge);

    await logAuditEvent({
      workspaceId: account.workspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_RECONNECT_INITIATED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: { platform: account.platform },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      mode: 'OAUTH_REDIRECT',
      authUrl,
    });
  } catch (error: any) {
    console.error('Error initiating account reconnect:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate reconnect' }, { status: 500 });
  }
}
