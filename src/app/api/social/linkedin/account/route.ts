import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

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
        credentials: {
          select: {
            tokenExpiresAt: true,
            scopes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!account) {
      return NextResponse.json({
        connected: false,
        account: null,
        message: 'No LinkedIn account is currently connected.',
      });
    }

    // Check token expiration
    const isTokenExpired = account.credentials?.tokenExpiresAt
      ? new Date(account.credentials.tokenExpiresAt) < new Date()
      : false;

    let metadata: Record<string, any> = {};
    if (account.metadataJson) {
      try {
        metadata = JSON.parse(account.metadataJson);
      } catch {}
    }

    return NextResponse.json({
      connected: account.status === 'CONNECTED' && !isTokenExpired,
      status: isTokenExpired ? 'EXPIRED' : account.status,
      isTokenExpired,
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountHandle: account.accountHandle,
        avatarUrl: account.avatarUrl,
        platformAccountId: account.platformAccountId,
        email: metadata.email || null,
        status: isTokenExpired ? 'EXPIRED' : account.status,
        lastSyncedAt: account.lastSyncedAt,
        connectedAt: account.createdAt,
        tokenExpiresAt: account.credentials?.tokenExpiresAt || null,
        scopes: account.credentials?.scopes ? account.credentials.scopes.split(' ') : ['openid', 'profile', 'email', 'w_member_social'],
      },
    });
  } catch (error: any) {
    console.error('Error fetching LinkedIn account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch LinkedIn account' },
      { status: 500 }
    );
  }
}
