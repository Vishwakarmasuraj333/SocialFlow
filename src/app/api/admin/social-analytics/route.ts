import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get('workspaceId');
    const workspaceId = workspaceIdParam || (auth.user.isSuperAdmin ? undefined : auth.workspace?.id);

    const accountFilter = {
      isSoftDeleted: false,
      ...(workspaceId ? { workspaceId } : {}),
    };

    const postFilter = {
      isSoftDeleted: false,
      ...(workspaceId ? { workspaceId } : {}),
    };

    const [
      connectedAccounts,
      totalAccounts,
      publishedPosts,
      scheduledPosts,
      failedPosts,
      draftPosts,
      accountsWithMetrics,
      recentPostAnalytics,
    ] = await Promise.all([
      prisma.socialAccount.count({ where: { ...accountFilter, status: 'CONNECTED' } }),
      prisma.socialAccount.count({ where: accountFilter }),
      prisma.post.count({ where: { ...postFilter, status: 'PUBLISHED' } }),
      prisma.post.count({ where: { ...postFilter, status: 'SCHEDULED' } }),
      prisma.post.count({ where: { ...postFilter, status: 'FAILED' } }),
      prisma.post.count({ where: { ...postFilter, status: 'DRAFT' } }),
      prisma.socialAccount.findMany({
        where: accountFilter,
        select: {
          id: true,
          platform: true,
          status: true,
          metrics: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.postAnalytics.aggregate({
        _sum: {
          views: true,
          likes: true,
          comments: true,
          shares: true,
          reach: true,
          impressions: true,
        },
      }),
    ]);

    // Sum real follower counts strictly from latest snapshots (Section 21)
    let totalFollowers = 0;
    let totalReach = recentPostAnalytics._sum.reach || 0;
    let totalImpressions = recentPostAnalytics._sum.impressions || 0;
    let totalEngagementLikes = recentPostAnalytics._sum.likes || 0;

    for (const acc of accountsWithMetrics) {
      const m = acc.metrics[0];
      if (m) {
        totalFollowers += (m.followers || m.subscribers || 0);
        totalReach += (m.reach || 0);
        totalImpressions += (m.impressions || 0);
        totalEngagementLikes += (m.likes || 0);
      }
    }

    return NextResponse.json({
      metrics: {
        connectedAccounts,
        totalAccounts,
        totalFollowers,
        publishedPosts,
        scheduledPosts,
        failedPosts,
        draftPosts,
        reach: totalReach,
        impressions: totalImpressions,
        likes: totalEngagementLikes,
      },
      hasRealData: totalAccounts > 0 || publishedPosts > 0,
    });
  } catch (error: any) {
    console.error('Error fetching admin social analytics:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
