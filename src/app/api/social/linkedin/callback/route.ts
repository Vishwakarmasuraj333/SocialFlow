import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyOAuthState } from '@/lib/oauth-state';
import { encryptSecret } from '@/lib/encryption';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  // 1. Handle LinkedIn OAuth authorization error
  if (error) {
    console.error('LinkedIn OAuth authorization error:', error, errorDescription);
    const redirectUrl = new URL('/admin/social/linkedin', baseUrl);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  // 2. Validate code and state presence
  if (!code || !state) {
    const redirectUrl = new URL('/admin/social/linkedin', baseUrl);
    redirectUrl.searchParams.set('error', 'Missing authorization code or state parameter from LinkedIn.');
    return NextResponse.redirect(redirectUrl.toString());
  }

  try {
    // 3. Verify signed state token (CSRF protection)
    const stateData = await verifyOAuthState(state);
    if (!stateData) {
      const redirectUrl = new URL('/admin/social/linkedin', baseUrl);
      redirectUrl.searchParams.set('error', 'OAuth state verification failed or expired. Please try connecting again.');
      return NextResponse.redirect(redirectUrl.toString());
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn Client credentials (LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET) missing on server.');
    }

    // Resolve exact callback URI matching authorization request
    let redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    if (!redirectUri) {
      redirectUri = `${baseUrl}/api/social/linkedin/callback`;
    }

    // 4. Server-to-server token exchange with LinkedIn
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
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

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json().catch(() => ({}));
      console.error('LinkedIn token exchange failed:', errorBody);
      throw new Error(errorBody.error_description || errorBody.error || 'Failed to exchange authorization code with LinkedIn.');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // Seconds (typically 60 days)
    const refreshToken = tokenData.refresh_token || null;

    if (!accessToken) {
      throw new Error('No access_token returned by LinkedIn.');
    }

    // 5. Fetch real authenticated profile via official OpenID UserInfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let accountName = 'LinkedIn Member';
    let accountEmail: string | null = null;
    let avatarUrl: string | null = null;
    let platformAccountId = 'urn:li:person:unknown';

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      platformAccountId = profileData.sub || `urn:li:person:${profileData.id || Date.now()}`;
      accountName = profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim() || 'LinkedIn Member';
      accountEmail = profileData.email || null;
      avatarUrl = profileData.picture || null;
    } else {
      console.warn('Could not fetch LinkedIn userinfo, using token subject fallback');
      platformAccountId = `urn:li:person:${Date.now()}`;
    }

    const handle = accountEmail
      ? `@${accountEmail.split('@')[0]}`
      : `@${accountName.toLowerCase().replace(/\s+/g, '')}`;

    // Target workspace resolution
    let workspaceId = stateData.workspaceId;
    if (!workspaceId || workspaceId === 'default') {
      const defaultWorkspace = await prisma.workspace.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      workspaceId = defaultWorkspace?.id || '';
    }

    if (!workspaceId) {
      throw new Error('Could not identify a target workspace for LinkedIn account connection.');
    }

    // 6. Encrypt access and refresh tokens using AES-256-GCM
    const encryptedAccess = encryptSecret(accessToken);
    const encryptedRefresh = refreshToken ? encryptSecret(refreshToken) : null;
    const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : new Date(Date.now() + 60 * 24 * 3600 * 1000);

    // 7. Upsert SocialAccount in database
    const existing = await prisma.socialAccount.findFirst({
      where: {
        workspaceId,
        platform: 'LINKEDIN',
        platformAccountId,
      },
    });

    let savedAccountId: string;

    if (existing) {
      const updated = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName,
          accountHandle: handle,
          avatarUrl,
          status: 'CONNECTED',
          isSoftDeleted: false,
          deletedAt: null,
          lastSyncedAt: new Date(),
          metadataJson: JSON.stringify({
            email: accountEmail,
            scopes: ['openid', 'profile', 'email', 'w_member_social'],
            providerAccountId: platformAccountId,
            connectedAt: new Date().toISOString(),
          }),
        },
      });
      savedAccountId = updated.id;
    } else {
      const created = await prisma.socialAccount.create({
        data: {
          workspaceId,
          platform: 'LINKEDIN',
          platformAccountId,
          accountName,
          accountHandle: handle,
          avatarUrl,
          status: 'CONNECTED',
          isSoftDeleted: false,
          lastSyncedAt: new Date(),
          metadataJson: JSON.stringify({
            email: accountEmail,
            scopes: ['openid', 'profile', 'email', 'w_member_social'],
            providerAccountId: platformAccountId,
            connectedAt: new Date().toISOString(),
          }),
        },
      });
      savedAccountId = created.id;
    }

    // 8. Store encrypted credentials in OAuthCredential table
    const existingCreds = await prisma.oAuthCredential.findUnique({
      where: { socialAccountId: savedAccountId },
    });

    if (existingCreds) {
      await prisma.oAuthCredential.update({
        where: { id: existingCreds.id },
        data: {
          encryptedAccessToken: encryptedAccess.encrypted,
          encryptedRefreshToken: encryptedRefresh?.encrypted || null,
          iv: encryptedAccess.iv,
          authTag: encryptedAccess.authTag,
          tokenExpiresAt,
          scopes: 'openid profile email w_member_social',
        },
      });
    } else {
      await prisma.oAuthCredential.create({
        data: {
          socialAccountId: savedAccountId,
          encryptedAccessToken: encryptedAccess.encrypted,
          encryptedRefreshToken: encryptedRefresh?.encrypted || null,
          iv: encryptedAccess.iv,
          authTag: encryptedAccess.authTag,
          tokenExpiresAt,
          scopes: 'openid profile email w_member_social',
        },
      });
    }

    // 9. Log audit event
    await logAuditEvent({
      userId: stateData.userId,
      workspaceId,
      action: 'LINKEDIN_ACCOUNT_CONNECTED',
      entityType: 'SocialAccount',
      entityId: savedAccountId,
      metadata: {
        platform: 'LINKEDIN',
        accountName,
        platformAccountId,
      },
    });

    // 10. Redirect back to LinkedIn dashboard with success banner
    const redirectUrl = new URL('/admin/social/linkedin', baseUrl);
    redirectUrl.searchParams.set('success', 'connected');
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('LinkedIn OAuth callback handling error:', error);
    const redirectUrl = new URL('/admin/social/linkedin', baseUrl);
    redirectUrl.searchParams.set('error', error.message || 'An unexpected error occurred while connecting LinkedIn.');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
