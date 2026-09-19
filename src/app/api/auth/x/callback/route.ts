import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { providerFactory } from '@/services/social/provider-factory';
import { encryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';
import { verifyOAuthState } from '@/lib/oauth-state';
import { syncDbCredentialsToEnv } from '@/services/platform-service';
import { getPlatformRedirectUri } from '@/services/social/redirect-uri';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error') || searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(`X rejected authorization: ${error}`)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Missing OAuth authorization code or state token from X')}`
    );
  }

  try {
    // 1. Validate tamper-proof state token (CSRF check & retrieve workspaceId + codeVerifier)
    const stateData = await verifyOAuthState(state);
    if (!stateData) {
      return NextResponse.redirect(
        `${appUrl}/admin/social/accounts?error=${encodeURIComponent('Invalid or expired OAuth state token. Please restart connection.')}`
      );
    }

    if (!stateData.codeVerifier) {
      return NextResponse.redirect(
        `${appUrl}/admin/social/accounts?error=${encodeURIComponent('PKCE code verifier is missing from session. Please restart connection.')}`
      );
    }

    await syncDbCredentialsToEnv();

    const provider = providerFactory.getProvider('X');
    const redirectUri = getPlatformRedirectUri('X');

    // 2. Exchange authorization code for real X access tokens using PKCE verifier
    const tokenResult = await provider.handleCallback(code, redirectUri, stateData.codeVerifier);
    const encrypted = encryptSecret(tokenResult.accessToken);

    const workspaceId = stateData.workspaceId;
    if (!workspaceId) {
      throw new Error('No active workspace context found in OAuth state.');
    }

    const handle = tokenResult.accountHandle?.startsWith('@')
      ? tokenResult.accountHandle
      : `@${tokenResult.accountHandle || 'x_user'}`;

    const realFollowers = tokenResult.metadata?.followers ?? null;
    const realFollowing = tokenResult.metadata?.following ?? null;

    const platformRef = await prisma.platform.findFirst({
      where: { slug: { in: ['x', 'twitter'] } },
    });

    // 3. Upsert real connected account into Database
    const existing = await prisma.socialAccount.findUnique({
      where: {
        workspaceId_platform_platformAccountId: {
          workspaceId,
          platform: 'X',
        platformAccountId: tokenResult.platformAccountId,
        },
      },
      include: { credentials: true },
    });

    let accountId: string;

    if (existing) {
      const updated = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName: tokenResult.accountName || existing.accountName,
          accountHandle: handle,
          avatarUrl: tokenResult.avatarUrl || existing.avatarUrl,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
          isSoftDeleted: false,
          deletedAt: null,
          metadataJson: JSON.stringify({
            followers: realFollowers,
            following: realFollowing,
            verified: true,
            network: 'X (Twitter API v2)',
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
            scopes: tokenResult.scopes?.join(',') || 'tweet.read,tweet.write,users.read,offline.access',
            tokenExpiresAt: tokenResult.expiresInSeconds
              ? new Date(Date.now() + tokenResult.expiresInSeconds * 1000)
              : new Date(Date.now() + 60 * 24 * 3600 * 1000),
          },
        });
      }

      accountId = updated.id;
    } else {
      const created = await prisma.socialAccount.create({
        data: {
          workspaceId,
          platformId: platformRef?.id || null,
          platform: 'X',
          accountName: tokenResult.accountName || 'X Profile',
          accountHandle: handle,
          avatarUrl: tokenResult.avatarUrl,
          platformAccountId: tokenResult.platformAccountId,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
          metadataJson: JSON.stringify({
            followers: realFollowers,
            following: realFollowing,
            verified: true,
            network: 'X (Twitter API v2)',
          }),
          credentials: {
            create: {
              encryptedAccessToken: encrypted.encrypted,
              encryptedRefreshToken: tokenResult.refreshToken ? encryptSecret(tokenResult.refreshToken).encrypted : null,
              iv: encrypted.iv,
              authTag: encrypted.authTag,
              scopes: tokenResult.scopes?.join(',') || 'tweet.read,tweet.write,users.read,offline.access',
              tokenExpiresAt: tokenResult.expiresInSeconds
                ? new Date(Date.now() + tokenResult.expiresInSeconds * 1000)
                : new Date(Date.now() + 60 * 24 * 3600 * 1000),
            },
          },
        },
      });

      accountId = created.id;
    }

    // 4. Audit log event
    await logAuditEvent({
      workspaceId,
      userId: stateData.userId,
      action: 'ACCOUNT_CONNECTED',
      entityType: 'SocialAccount',
      entityId: accountId,
      metadata: { platform: 'X', handle, oauthFlow: 'OAUTH2_PKCE_S256' },
    }).catch(() => {});

    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?connected=${encodeURIComponent(handle)}&success=true`
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'X OAuth authentication failed';
    return NextResponse.redirect(
      `${appUrl}/admin/social/accounts?error=${encodeURIComponent(errorMsg)}`
    );
  }
}
