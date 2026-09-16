import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';
import { calculateAccountGrowth, getOfficialPlatformMetrics } from '@/services/social-metric-service';

export async function GET(
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
        platformRef: true,
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    // Calculate actual growth strictly from real snapshots
    const growth = await calculateAccountGrowth(id);

    // Latest snapshot
    const latestSnapshot = account.metrics[0];

    // Filter to official platform capabilities
    const officialMetrics = getOfficialPlatformMetrics(account.platform, {
      followers: latestSnapshot?.followers,
      following: latestSnapshot?.following,
      subscribers: latestSnapshot?.subscribers,
      reach: latestSnapshot?.reach,
      impressions: latestSnapshot?.impressions,
      likes: latestSnapshot?.likes,
      comments: latestSnapshot?.comments,
      shares: latestSnapshot?.shares,
      views: latestSnapshot?.views,
      saves: latestSnapshot?.saves,
      clicks: latestSnapshot?.clicks,
      engagement: latestSnapshot?.engagement,
    });

    return NextResponse.json({
      accountId: account.id,
      platform: account.platform,
      accountName: account.accountName,
      accountHandle: account.accountHandle,
      status: account.status,
      lastSyncedAt: account.lastSyncedAt,
      officialMetrics,
      growth,
      hasData: account.metrics.length > 0,
    });
  } catch (error: any) {
    console.error('Error fetching account analytics:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
