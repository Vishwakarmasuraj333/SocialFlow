import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { decryptSecret } from '@/lib/encryption';
import { providerFactory } from '@/services/social/provider-factory';
import { PlatformType } from '@/services/social/types';
import { recordMetricSnapshot } from '@/services/social-metric-service';
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
      include: {
        credentials: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    if (!account.credentials) {
      await prisma.socialAccount.update({
        where: { id },
        data: { status: 'ERROR' },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed: No OAuth credentials found. Reconnection required.',
          status: 'ERROR',
        },
        { status: 400 }
      );
    }

    // Check token expiration
    if (account.credentials.tokenExpiresAt && account.credentials.tokenExpiresAt < new Date()) {
      await prisma.socialAccount.update({
        where: { id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed: Token expired. Please reconnect your account.',
          status: 'EXPIRED',
        },
        { status: 400 }
      );
    }

    // Decrypt credentials
    let accessToken: string;
    try {
      accessToken = decryptSecret(
        account.credentials.encryptedAccessToken,
        account.credentials.iv,
        account.credentials.authTag
      );
    } catch {
      await prisma.socialAccount.update({
        where: { id },
        data: { status: 'ERROR' },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed: Decryption failed for token. Reconnect account.',
          status: 'ERROR',
        },
        { status: 400 }
      );
    }

    const platformType = account.platform.toUpperCase() as PlatformType;
    let fetchedMetrics: any = null;

    try {
      const provider = providerFactory.getProvider(platformType);
      const isConfigured = providerFactory.isPlatformConfigured(platformType);

      if (isConfigured) {
        // Attempt official API call
        fetchedMetrics = await provider.getAnalytics(accessToken, account.platformAccountId, 30);
      }
    } catch (apiErr: any) {
      console.warn(`Official API fetch failed for ${platformType}:`, apiErr.message);
    }

    const now = new Date();
    let currentFollowers = 0;
    try {
      if (account.metadataJson) {
        const meta = JSON.parse(account.metadataJson);
        currentFollowers = Number(meta.followers) || 0;
      }
    } catch {}

    if (fetchedMetrics && fetchedMetrics.followers) {
      currentFollowers = fetchedMetrics.followers;
    }

    // Save metric snapshot to database
    await recordMetricSnapshot(account.id, {
      followers: currentFollowers,
      reach: fetchedMetrics?.reach || 0,
      impressions: fetchedMetrics?.impressions || 0,
      likes: fetchedMetrics?.likes || 0,
      comments: fetchedMetrics?.comments || 0,
      shares: fetchedMetrics?.shares || 0,
      views: fetchedMetrics?.videoViews || 0,
      engagement: fetchedMetrics?.engagementRate || 0,
    });

    const updated = await prisma.socialAccount.update({
      where: { id },
      data: {
        lastSyncedAt: now,
        status: 'CONNECTED',
      },
    });

    await logAuditEvent({
      workspaceId: account.workspaceId,
      userId: auth.user.id,
      action: 'ACCOUNT_SYNCED',
      entityType: 'SocialAccount',
      entityId: account.id,
      metadata: { platform: account.platform, syncedAt: now.toISOString() },
    });

    return NextResponse.json({
      success: true,
      lastSyncedAt: now.toISOString(),
      account: {
        id: updated.id,
        status: updated.status,
        lastSyncedAt: updated.lastSyncedAt,
      },
    });
  } catch (error: any) {
    console.error('Error syncing social account:', error);
    return NextResponse.json({ error: error.message || 'Sync failed due to server error' }, { status: 500 });
  }
}
