import prisma from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface DashboardKPICard {
  title: string;
  value: string | number;
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral';
  comparisonPeriod: string;
  hasData: boolean;
}

export interface DashboardAnalyticsSummary {
  kpis: {
    totalFollowers: DashboardKPICard;
    engagementRate: DashboardKPICard;
    totalReach: DashboardKPICard;
    totalImpressions: DashboardKPICard;
    publishedPosts: DashboardKPICard;
    scheduledPosts: DashboardKPICard;
  };
  timeSeries: Array<{
    date: string;
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    followers: number;
    engagementRate: number;
    postsCount: number;
    accountsCount: number;
    color: string;
  }>;
}

interface MetricRecord {
  id?: string;
  followers?: number;
  following?: number;
  subscribers?: number;
  reach?: number;
  impressions?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  saves?: number;
  clicks?: number;
  recordedAt: Date;
}

interface SocialAccountRecord {
  id: string;
  workspaceId: string;
  platformId?: string | null;
  platform: string;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string | null;
  platformAccountId: string;
  accountType?: string;
  status: string;
  publishingEnabled?: boolean;
  analyticsEnabled?: boolean;
  messagingEnabled?: boolean;
  metadataJson?: string | null;
  metrics?: MetricRecord[];
}

export async function getWorkspaceAnalytics(
  workspaceId: string,
  days = 30,
  platformFilter?: string
): Promise<DashboardAnalyticsSummary> {
  const now = new Date();
  const currentPeriodStart = startOfDay(subDays(now, days));
  const previousPeriodStart = startOfDay(subDays(now, days * 2));
  const previousPeriodEnd = endOfDay(subDays(now, days));

  // Current period snapshots from real SocialAccountMetric table
  const accountWhere = {
    workspaceId,
    isSoftDeleted: false,
    ...(platformFilter && platformFilter !== 'ALL' ? { platform: platformFilter.toUpperCase() } : {}),
  };

  const accounts = (await (prisma.socialAccount as any).findMany({
    where: accountWhere,
    include: {
      metrics: {
        where: { recordedAt: { gte: previousPeriodStart } },
        orderBy: { recordedAt: 'desc' },
      },
    },
  })) as SocialAccountRecord[];

  // Count published & scheduled posts
  const [publishedPostsCount, prevPublishedPostsCount, scheduledPostsCount] = await Promise.all([
    prisma.post.count({
      where: {
        workspaceId,
        status: 'PUBLISHED',
        isSoftDeleted: false,
        publishedAt: { gte: currentPeriodStart },
      },
    }),
    prisma.post.count({
      where: {
        workspaceId,
        status: 'PUBLISHED',
        isSoftDeleted: false,
        publishedAt: { gte: previousPeriodStart, lte: previousPeriodEnd },
      },
    }),
    prisma.post.count({
      where: {
        workspaceId,
        status: 'SCHEDULED',
        isSoftDeleted: false,
      },
    }),
  ]);

  // Sum real current metrics across accounts
  let curFollowers = 0;
  let prevFollowers = 0;
  let curReach = 0;
  let prevReach = 0;
  let curImpressions = 0;
  let prevImpressions = 0;
  let totalEngagementScore = 0;
  let metricPointsCount = 0;

  for (const acc of accounts) {
    let metaFollowers = 0;
    try {
      if (acc.metadataJson) {
        const meta = JSON.parse(acc.metadataJson);
        metaFollowers = Number(meta.followers) || 0;
      }
    } catch {}

    const accMetrics = acc.metrics || [];
    const curMetrics = accMetrics.filter((m) => m.recordedAt >= currentPeriodStart);
    const prevMetrics = accMetrics.filter((m) => m.recordedAt < currentPeriodStart);

    const latestCur = curMetrics[0];
    const latestPrev = prevMetrics[0];

    const fCur = latestCur?.followers || latestCur?.subscribers || metaFollowers || 0;
    const fPrev = latestPrev?.followers || latestPrev?.subscribers || 0;

    curFollowers += fCur;
    prevFollowers += fPrev;

    for (const m of curMetrics) {
      curReach += m.reach || 0;
      curImpressions += m.impressions || 0;
      const eng = m.engagement ?? 0;
      if (eng > 0) {
        totalEngagementScore += eng;
        metricPointsCount++;
      }
    }

    for (const m of prevMetrics) {
      prevReach += m.reach || 0;
      prevImpressions += m.impressions || 0;
    }
  }

  const avgEngagement = metricPointsCount > 0
    ? Number((totalEngagementScore / metricPointsCount).toFixed(2))
    : 0.0;

  function calcChange(cur: number, prev: number): { change: number | null; trend: 'up' | 'down' | 'neutral'; hasData: boolean } {
    if (prev === 0 && cur === 0) {
      return { change: null, trend: 'neutral', hasData: false };
    }
    if (prev === 0) {
      return { change: 100, trend: 'up', hasData: true };
    }
    const diff = ((cur - prev) / prev) * 100;
    return {
      change: Number(Math.abs(diff).toFixed(1)),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      hasData: true,
    };
  }

  const reachChange = calcChange(curReach, prevReach);
  const impressionsChange = calcChange(curImpressions, prevImpressions);
  const followersChange = calcChange(curFollowers, prevFollowers);
  const postsChange = calcChange(publishedPostsCount, prevPublishedPostsCount);

  // Time series strictly from real metric records
  const dateMap = new Map<string, { reach: number; impressions: number; engagement: number; followers: number }>();
  for (const acc of accounts) {
    const accMetrics = acc.metrics || [];
    for (const m of accMetrics) {
      if (m.recordedAt >= currentPeriodStart) {
        const key = m.recordedAt.toISOString().split('T')[0];
        const existing = dateMap.get(key) || { reach: 0, impressions: 0, engagement: 0, followers: 0 };
        existing.reach += m.reach || 0;
        existing.impressions += m.impressions || 0;
        existing.followers += (m.followers || m.subscribers || 0);
        existing.engagement = Math.max(existing.engagement, m.engagement || 0);
        dateMap.set(key, existing);
      }
    }
  }

  const timeSeries = Array.from(dateMap.entries()).map(([date, vals]) => ({
    date,
    reach: vals.reach,
    impressions: vals.impressions,
    engagement: vals.engagement,
    followers: vals.followers,
  }));

  // Platform breakdown strictly from real accounts
  const platformColors: Record<string, string> = {
    LINKEDIN: '#0A66C2',
    FACEBOOK: '#1877F2',
    INSTAGRAM: '#E4405F',
    TWITTER: '#000000',
    TIKTOK: '#FE2C55',
    YOUTUBE: '#FF0000',
    PINTEREST: '#E60023',
    THREADS: '#808080',
  };

  const platformMap = new Map<string, { platform: string; followers: number; engagementRates: number[]; accountsCount: number; color: string }>();

  for (const acc of accounts) {
    const p = acc.platform.toUpperCase();
    const accMetrics = acc.metrics || [];
    const latest = accMetrics[0];
    let followers = latest?.followers || latest?.subscribers || 0;
    if (followers === 0 && acc.metadataJson) {
      try {
        const meta = JSON.parse(acc.metadataJson);
        followers = Number(meta.followers) || 0;
      } catch {}
    }

    const engagement = latest?.engagement || 0;

    const existing = platformMap.get(p) || {
      platform: p,
      followers: 0,
      engagementRates: [],
      accountsCount: 0,
      color: platformColors[p] || '#6366f1',
    };

    existing.followers += followers;
    if (engagement > 0) existing.engagementRates.push(engagement);
    existing.accountsCount += 1;
    platformMap.set(p, existing);
  }

  const platformBreakdown = Array.from(platformMap.values()).map((p) => {
    const avgEng = p.engagementRates.length > 0
      ? Number((p.engagementRates.reduce((a, b) => a + b, 0) / p.engagementRates.length).toFixed(2))
      : 0.0;
    return {
      platform: p.platform,
      followers: p.followers,
      engagementRate: avgEng,
      postsCount: publishedPostsCount,
      accountsCount: p.accountsCount,
      color: p.color,
    };
  });

  return {
    kpis: {
      totalFollowers: {
        title: 'Total Followers',
        value: curFollowers > 0 ? curFollowers.toLocaleString('en-US') : '0',
        changePercent: followersChange.change,
        trend: followersChange.trend,
        comparisonPeriod: followersChange.hasData ? `vs prev ${days} days` : 'No previous baseline',
        hasData: curFollowers > 0,
      },
      engagementRate: {
        title: 'Avg. Engagement Rate',
        value: avgEngagement > 0 ? `${avgEngagement}%` : '0.0%',
        changePercent: null,
        trend: 'neutral',
        comparisonPeriod: 'Database metric average',
        hasData: avgEngagement > 0,
      },
      totalReach: {
        title: 'Total Reach',
        value: curReach > 0 ? curReach.toLocaleString('en-US') : '0',
        changePercent: reachChange.change,
        trend: reachChange.trend,
        comparisonPeriod: reachChange.hasData ? `vs prev ${days} days` : 'No reach records',
        hasData: curReach > 0,
      },
      totalImpressions: {
        title: 'Total Impressions',
        value: curImpressions > 0 ? curImpressions.toLocaleString('en-US') : '0',
        changePercent: impressionsChange.change,
        trend: impressionsChange.trend,
        comparisonPeriod: impressionsChange.hasData ? `vs prev ${days} days` : 'No impression records',
        hasData: curImpressions > 0,
      },
      publishedPosts: {
        title: 'Published Posts',
        value: publishedPostsCount,
        changePercent: postsChange.change,
        trend: postsChange.trend,
        comparisonPeriod: `vs prev ${days} days`,
        hasData: publishedPostsCount > 0,
      },
      scheduledPosts: {
        title: 'Scheduled Queue',
        value: scheduledPostsCount,
        changePercent: null,
        trend: 'neutral',
        comparisonPeriod: 'Active queue',
        hasData: scheduledPostsCount > 0,
      },
    },
    timeSeries,
    platformBreakdown,
  };
}
