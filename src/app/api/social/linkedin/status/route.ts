import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { decryptSecret } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetWorkspaceId = auth.workspace?.id;
    const account = await prisma.socialAccount.findFirst({
      where: {
        platform: 'LINKEDIN',
        status: { not: 'DISCONNECTED' },
        isSoftDeleted: false,
        ...(targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {}),
      },
      include: {
        credentials: true,
      },
    });

    if (!account || !account.credentials) {
      return NextResponse.json({
        connected: false,
        provider: 'linkedin',
        tokenValid: false,
        permissions: [],
        lastSync: null,
        message: 'LinkedIn account not connected in this workspace.',
      });
    }

    // Check expiration date
    const now = new Date();
    const tokenExpiresAt = account.credentials.tokenExpiresAt;
    const isExpired = tokenExpiresAt ? new Date(tokenExpiresAt) <= now : false;

    // Optional quick live verification with LinkedIn userinfo endpoint
    let livePingSuccess = !isExpired;
    if (!isExpired && account.credentials.encryptedAccessToken && account.credentials.iv && account.credentials.authTag) {
      try {
        const decryptedToken = decryptSecret(
          account.credentials.encryptedAccessToken,
          account.credentials.iv,
          account.credentials.authTag
        );
        // Only perform lightweight live ping if last synced over 30 mins ago
        const lastSyncTime = account.lastSyncedAt ? new Date(account.lastSyncedAt).getTime() : 0;
        if (Date.now() - lastSyncTime > 30 * 60 * 1000) {
          const testRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${decryptedToken}` },
          });
          livePingSuccess = testRes.ok;
          if (testRes.ok) {
            await prisma.socialAccount.update({
              where: { id: account.id },
              data: { lastSyncedAt: new Date() },
            });
          }
        }
      } catch (err) {
        console.warn('LinkedIn live token ping failed:', err);
        livePingSuccess = false;
      }
    }

    const permissions = account.credentials.scopes
      ? account.credentials.scopes.split(' ')
      : ['openid', 'profile', 'email', 'w_member_social'];

    return NextResponse.json({
      connected: account.status === 'CONNECTED' && !isExpired && livePingSuccess,
      provider: 'linkedin',
      tokenValid: !isExpired && livePingSuccess,
      status: isExpired || !livePingSuccess ? 'EXPIRED' : account.status,
      permissions,
      lastSync: account.lastSyncedAt?.toISOString() || null,
      accountName: account.accountName,
      accountHandle: account.accountHandle,
      avatarUrl: account.avatarUrl,
    });
  } catch (error: any) {
    console.error('Error checking LinkedIn status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check LinkedIn status' },
      { status: 500 }
    );
  }
}
