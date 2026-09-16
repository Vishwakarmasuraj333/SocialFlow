import prisma from '@/lib/db';

export interface GrowthCalculationResult {
  growthAvailable: boolean;
  currentFollowers: number;
  previousFollowers: number | null;
  growthDelta: number | null;
  growthPercent: number | null;
  dailyGrowth: number | null;
  weeklyGrowth: number | null;
  monthlyGrowth: number | null;
  historicalPoints: Array<{
    recordedAt: string;
    followers: number;
    reach: number;
    impressions: number;
    engagement: number;
  }>;
}

export interface PlatformSupportedMetrics {
  platform: string;
  followersOrSubscribersLabel: 'Followers' | 'Subscribers' | 'Connections';
  supportedMetricKeys: string[];
  metrics: Record<string, number | null>;
}

/**
 * Filter and format metrics according to official platform API capabilities (Section 22).
 */
export function getOfficialPlatformMetrics(
  platform: string,
  rawMetrics: {
    followers?: number;
    following?: number;
    subscribers?: number;
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    saves?: number;
    clicks?: number;
    engagement?: number;
  }
): PlatformSupportedMetrics {
  const upper = platform.toUpperCase();

  switch (upper) {
    case 'INSTAGRAM':
      return {
        platform: 'INSTAGRAM',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'following', 'reach', 'impressions', 'likes', 'comments', 'saves', 'shares', 'views'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          following: rawMetrics.following ?? null,
          reach: rawMetrics.reach ?? null,
          impressions: rawMetrics.impressions ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
          saves: rawMetrics.saves ?? null,
          shares: rawMetrics.shares ?? null,
          views: rawMetrics.views ?? null,
        },
      };

    case 'YOUTUBE':
      return {
        platform: 'YOUTUBE',
        followersOrSubscribersLabel: 'Subscribers',
        supportedMetricKeys: ['subscribers', 'views', 'likes', 'comments'],
        metrics: {
          subscribers: rawMetrics.subscribers ?? rawMetrics.followers ?? null,
          views: rawMetrics.views ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
        },
      };

    case 'LINKEDIN':
      return {
        platform: 'LINKEDIN',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'impressions', 'likes', 'comments', 'shares', 'clicks'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          impressions: rawMetrics.impressions ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
          shares: rawMetrics.shares ?? null,
          clicks: rawMetrics.clicks ?? null,
        },
      };

    case 'TWITTER':
    case 'X':
      return {
        platform: 'TWITTER',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'following', 'impressions', 'likes', 'comments', 'shares'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          following: rawMetrics.following ?? null,
          impressions: rawMetrics.impressions ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
          shares: rawMetrics.shares ?? null,
        },
      };

    case 'TIKTOK':
      return {
        platform: 'TIKTOK',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'following', 'views', 'likes', 'comments', 'shares'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          following: rawMetrics.following ?? null,
          views: rawMetrics.views ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
          shares: rawMetrics.shares ?? null,
        },
      };

    case 'FACEBOOK':
      return {
        platform: 'FACEBOOK',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'reach', 'impressions', 'likes', 'comments', 'shares', 'clicks'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          reach: rawMetrics.reach ?? null,
          impressions: rawMetrics.impressions ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
          shares: rawMetrics.shares ?? null,
          clicks: rawMetrics.clicks ?? null,
        },
      };

    case 'PINTEREST':
      return {
        platform: 'PINTEREST',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'following', 'impressions', 'saves', 'clicks'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          following: rawMetrics.following ?? null,
          impressions: rawMetrics.impressions ?? null,
          saves: rawMetrics.saves ?? null,
          clicks: rawMetrics.clicks ?? null,
        },
      };

    case 'THREADS':
      return {
        platform: 'THREADS',
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'likes', 'comments', 'shares', 'views'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          likes: rawMetrics.likes ?? null,
          comments: rawMetrics.comments ?? null,
          shares: rawMetrics.shares ?? null,
          views: rawMetrics.views ?? null,
        },
      };

    default:
      return {
        platform: upper,
        followersOrSubscribersLabel: 'Followers',
        supportedMetricKeys: ['followers', 'following'],
        metrics: {
          followers: rawMetrics.followers ?? null,
          following: rawMetrics.following ?? null,
        },
      };
  }
}

/**
 * Record a metric snapshot in the database.
 */
export async function recordMetricSnapshot(socialAccountId: string, metrics: {
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
}) {
  return prisma.socialAccountMetric.create({
    data: {
      socialAccountId,
      followers: metrics.followers || 0,
      following: metrics.following || 0,
      subscribers: metrics.subscribers || 0,
      reach: metrics.reach || 0,
      impressions: metrics.impressions || 0,
      engagement: metrics.engagement || 0.0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      views: metrics.views || 0,
      saves: metrics.saves || 0,
      clicks: metrics.clicks || 0,
      recordedAt: new Date(),
    },
  });
}

/**
 * Calculate actual growth based strictly on real historical snapshots (Section 5 & 6).
 */
export async function calculateAccountGrowth(socialAccountId: string): Promise<GrowthCalculationResult> {
  const snapshots = await prisma.socialAccountMetric.findMany({
    where: { socialAccountId },
    orderBy: { recordedAt: 'desc' },
    take: 30,
  });

  const historicalPoints = snapshots.slice().reverse().map((s) => ({
    recordedAt: s.recordedAt.toISOString(),
    followers: s.followers || s.subscribers || 0,
    reach: s.reach,
    impressions: s.impressions,
    engagement: s.engagement,
  }));

  if (snapshots.length === 0) {
    return {
      growthAvailable: false,
      currentFollowers: 0,
      previousFollowers: null,
      growthDelta: null,
      growthPercent: null,
      dailyGrowth: null,
      weeklyGrowth: null,
      monthlyGrowth: null,
      historicalPoints: [],
    };
  }

  const latest = snapshots[0];
  const currentFollowers = latest.followers || latest.subscribers || 0;

  if (snapshots.length === 1) {
    return {
      growthAvailable: false, // Need at least two snapshots to compute real delta
      currentFollowers,
      previousFollowers: null,
      growthDelta: null,
      growthPercent: null,
      dailyGrowth: null,
      weeklyGrowth: null,
      monthlyGrowth: null,
      historicalPoints,
    };
  }

  const previous = snapshots[1];
  const previousFollowers = previous.followers || previous.subscribers || 0;
  const growthDelta = currentFollowers - previousFollowers;
  const growthPercent = previousFollowers > 0
    ? Number(((growthDelta / previousFollowers) * 100).toFixed(2))
    : 0;

  // Daily growth (look back ~1 day)
  const oneDayAgo = new Date(latest.recordedAt.getTime() - 24 * 60 * 60 * 1000);
  const dayOldSnapshot = snapshots.find((s) => s.recordedAt <= oneDayAgo);
  const dailyGrowth = dayOldSnapshot
    ? currentFollowers - (dayOldSnapshot.followers || dayOldSnapshot.subscribers || 0)
    : growthDelta;

  // Weekly growth (look back ~7 days)
  const sevenDaysAgo = new Date(latest.recordedAt.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekOldSnapshot = snapshots.find((s) => s.recordedAt <= sevenDaysAgo);
  const weeklyGrowth = weekOldSnapshot
    ? currentFollowers - (weekOldSnapshot.followers || weekOldSnapshot.subscribers || 0)
    : null;

  // Monthly growth (look back ~30 days)
  const thirtyDaysAgo = new Date(latest.recordedAt.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthOldSnapshot = snapshots.find((s) => s.recordedAt <= thirtyDaysAgo);
  const monthlyGrowth = monthOldSnapshot
    ? currentFollowers - (monthOldSnapshot.followers || monthOldSnapshot.subscribers || 0)
    : null;

  return {
    growthAvailable: true,
    currentFollowers,
    previousFollowers,
    growthDelta,
    growthPercent,
    dailyGrowth,
    weeklyGrowth,
    monthlyGrowth,
    historicalPoints,
  };
}
