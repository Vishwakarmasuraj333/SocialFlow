import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export async function DELETE(req: NextRequest) {
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
        ...(targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {}),
      },
      include: {
        credentials: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: 'No active LinkedIn account found to disconnect.' },
        { status: 200 }
      );
    }

    // 1. Delete stored OAuth credentials securely
    if (account.credentials) {
      await prisma.oAuthCredential.delete({
        where: { id: account.credentials.id },
      });
    }

    // 2. Mark account as DISCONNECTED and soft deleted
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        status: 'DISCONNECTED',
        isSoftDeleted: true,
        deletedAt: new Date(),
      },
    });

    // 3. Cancel any pending scheduled posts targeted specifically for LinkedIn
    const pendingTargets = await prisma.postTarget.findMany({
      where: {
        socialAccountId: account.id,
        publishStatus: { in: ['PENDING', 'PUBLISHING'] },
      },
    });

    if (pendingTargets.length > 0) {
      await prisma.postTarget.updateMany({
        where: {
          socialAccountId: account.id,
          publishStatus: { in: ['PENDING', 'PUBLISHING'] },
        },
        data: {
          publishStatus: 'FAILED',
          errorMessage: 'Post cancelled because LinkedIn account was disconnected.',
        },
      });
    }

    // 4. Log audit log event
    await logAuditEvent({
      userId: auth.user.id,
      workspaceId: account.workspaceId,
      action: 'LINKEDIN_ACCOUNT_DISCONNECTED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: {
        platform: 'LINKEDIN',
        accountName: account.accountName,
        cancelledScheduledPostsCount: pendingTargets.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected and credentials safely removed.',
    });
  } catch (error: any) {
    console.error('Error disconnecting LinkedIn account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect LinkedIn account' },
      { status: 500 }
    );
  }
}
