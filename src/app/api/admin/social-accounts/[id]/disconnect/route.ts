import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

const db = prisma as any;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const resolved = await Promise.resolve(params);
    const id = resolved?.id;

    if (!id) {
      return NextResponse.json({ error: 'Social account ID is required' }, { status: 400 });
    }

    const account = await prisma.socialAccount.findUnique({
      where: { id },
      include: { credentials: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    // Revoke token on provider if supported (e.g. X / Twitter)
    if (account.credentials?.encryptedAccessToken && (account.platform === 'X' || account.platform === 'TWITTER')) {
      try {
        const { decryptSecret } = await import('@/lib/encryption');
        const { providerFactory } = await import('@/services/social/provider-factory');
        const plainToken = decryptSecret(
          account.credentials.encryptedAccessToken,
          account.credentials.iv,
          account.credentials.authTag
        );
        const xProvider = providerFactory.getProvider('X') as any;
        if (typeof xProvider.revokeToken === 'function') {
          await xProvider.revokeToken(plainToken);
        }
      } catch (revokeErr) {
        console.warn('Non-blocking token revocation error on disconnect:', revokeErr);
      }
    }

    if (account.status === 'DISCONNECTED') {
      return NextResponse.json({
        success: true,
        message: `${account.platform} account (${account.accountHandle}) is already disconnected.`,
        account: {
          id: account.id,
          status: 'DISCONNECTED',
        },
      });
    }

    const updated = await prisma.socialAccount.update({
      where: { id },
      data: {
        status: 'DISCONNECTED',
      },
    });

    try {
      await logAuditEvent({
        workspaceId: account.workspaceId,
        userId: auth.user.id,
        action: 'ACCOUNT_DISCONNECTED',
        entityType: 'SocialAccount',
        entityId: account.id,
        metadata: { platform: account.platform, handle: account.accountHandle },
      });
    } catch {
      // Non-blocking audit log
    }

    return NextResponse.json({
      success: true,
      message: `${account.platform} account ${account.accountHandle} disconnected successfully.`,
      account: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error('Error disconnecting social account:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect account' }, { status: 500 });
  }
}

