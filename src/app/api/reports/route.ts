import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { getWorkspaceAnalytics } from '@/services/analytics-service';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !auth.workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');
  const platform = searchParams.get('platform') || 'ALL';
  const format = searchParams.get('format') || 'json';

  const analytics = await getWorkspaceAnalytics(auth.workspace.id, days, platform);

  const topPosts = await prisma.post.findMany({
    where: {
      workspaceId: auth.workspace.id,
      status: 'PUBLISHED',
      isSoftDeleted: false,
    },
    include: {
      targets: true,
      author: { select: { name: true } },
    },
    take: 10,
    orderBy: { publishedAt: 'desc' },
  });

  if (format === 'csv') {
    // Generate CSV output
    const headers = 'Date,Reach,Impressions,Engagement Rate (%),Followers\n';
    const rows = analytics.timeSeries
      .map((t) => `${t.date},${t.reach},${t.impressions},${t.engagement},${t.followers}`)
      .join('\n');
    const csvContent = headers + rows;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="socialflow-report-${days}d.csv"`,
      },
    });
  }

  return NextResponse.json({
    summary: analytics.kpis,
    timeSeries: analytics.timeSeries,
    platformBreakdown: analytics.platformBreakdown,
    topPosts,
    meta: {
      generatedAt: new Date().toISOString(),
      workspaceName: auth.workspace.name,
      timeframeDays: days,
    },
  });
}
