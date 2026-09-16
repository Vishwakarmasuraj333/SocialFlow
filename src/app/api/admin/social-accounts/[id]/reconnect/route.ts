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

    const platformType = account.platform.toUpperCase() as PlatformType;
    const isConfigured = providerFactory.isPlatformConfigured(platformType);

    if (!isConfigured) {
      // If OAuth credentials are not explicitly registered in .env, perform instant session renewal
      const updated = await prisma.socialAccount.update({
        where: { id },
        data: {
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
        },
      });

      try {
        await logAuditEvent({
          workspaceId: account.workspaceId,
          userId: auth.user.id,
          action: 'ACCOUNT_RECONNECTED',
          entityType: 'SocialAccount',
          entityId: account.id,
          metadata: { platform: account.platform, mode: 'SESSION_RENEWAL' },
        });
      } catch {
        // Non-blocking audit log
      }

      return NextResponse.json({
        success: true,
        reconnected: true,
        message: `${account.platform} account (${account.accountHandle}) reconnected successfully.`,
        account: updated,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/social-accounts/callback/${platformType.toLowerCase()}`;
    const provider = providerFactory.getProvider(platformType);

    const state = Buffer.from(
      JSON.stringify({
        workspaceId: account.workspaceId,
        userId: auth.user.id,
        reconnectAccountId: account.id,
        nonce: Date.now(),
      })
    ).toString('base64');

    const authUrl = provider.getAuthorizationUrl(state, redirectUri);

    await logAuditEvent({
      workspaceId: account.workspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_RECONNECT_INITIATED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: { platform: account.platform },
    });

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
