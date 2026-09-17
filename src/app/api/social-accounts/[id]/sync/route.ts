import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { decryptSecret } from '@/lib/encryption';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const account = await prisma.socialAccount.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: { credentials: true },
  });

  if (!account) {
    return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
  }

  try {
    const provider = providerFactory.getProvider(account.platform as PlatformType);

    if (account.credentials) {
      const accessToken = decryptSecret(
        account.credentials.encryptedAccessToken,
        account.credentials.iv,
        account.credentials.authTag
      );

      // Attempt to retrieve fresh insights from provider
      const analytics = await provider.getAnalytics(accessToken, account.platformAccountId, 30);

      // If provider returns data, store snapshot
      if ((analytics.followers ?? 0) > 0 || (analytics.reach ?? 0) > 0) {
        await prisma.analyticsSnapshot.upsert({
          where: {
            socialAccountId_date: {
              socialAccountId: account.id,
              date: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          create: {
            workspaceId: auth.workspace.id,
            socialAccountId: account.id,
            platform: account.platform,
            date: new Date(new Date().setHours(0, 0, 0, 0)),
            followers: analytics.followers ?? 0,
            reach: analytics.reach ?? 0,
            impressions: analytics.impressions ?? 0,
            likes: analytics.likes ?? 0,
            comments: analytics.comments ?? 0,
            shares: analytics.shares ?? 0,
            saves: analytics.saves ?? 0,
            clicks: analytics.clicks ?? 0,
            videoViews: analytics.videoViews ?? 0,
            engagementRate: analytics.engagementRate ?? 0,
          },
          update: {
            followers: analytics.followers ?? 0,
            reach: analytics.reach ?? 0,
            impressions: analytics.impressions ?? 0,
            likes: analytics.likes ?? 0,
            comments: analytics.comments ?? 0,
            shares: analytics.shares ?? 0,
            saves: analytics.saves ?? 0,
            clicks: analytics.clicks ?? 0,
            videoViews: analytics.videoViews ?? 0,
            engagementRate: analytics.engagementRate ?? 0,
          },
        });
      }
    }

    const updated = await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        lastSyncedAt: new Date(),
        status: 'CONNECTED',
      },
    });

    await logAuditEvent({
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action: 'ACCOUNT_SYNCED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: { platform: account.platform },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: updated.id,
        platform: updated.platform,
        accountName: updated.accountName,
        status: updated.status,
        lastSyncedAt: updated.lastSyncedAt,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
