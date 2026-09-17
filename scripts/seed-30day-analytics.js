const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Calibrating Exact Analytics Numbers & 30-Day Trajectory ---');

  const workspace = await prisma.workspace.findFirst({
    where: {
      OR: [
        { id: 'cmu524pko000351gc30y8s1iq' },
        { slug: 'socialflow-command' },
        { name: { contains: 'SocialFlow' } }
      ]
    },
    include: {
      socialAccounts: true
    }
  });

  if (!workspace || workspace.socialAccounts.length === 0) {
    console.error('No accounts found in workspace!');
    process.exit(1);
  }

  const accountIds = workspace.socialAccounts.map((a) => a.id);
  await prisma.socialAccountMetric.deleteMany({
    where: { socialAccountId: { in: accountIds } }
  });

  // Exact figures from user:
  // FACEBOOK:  Audience 38,400  |  Avg Engagement 5.2%
  // INSTAGRAM: Audience 48,900  |  Avg Engagement 7.2%
  // LINKEDIN:  Audience 24,800  |  Avg Engagement 6.4%
  // PINTEREST: Audience 18,450  |  Avg Engagement 5.8%
  // THREADS:   Audience 16,200  |  Avg Engagement 6.8%
  // TIKTOK:    Audience 84,600  |  Avg Engagement 9.4%
  // TWITTER:   Audience 32,600  |  Avg Engagement 4.6%
  // YOUTUBE:   Audience 58,200  |  Avg Engagement 8.9%
  // Total Audience: 322,150

  const platformBenchmarks = {
    FACEBOOK:  { audience: 38400, engagement: 5.2, share: 0.11 },
    INSTAGRAM: { audience: 48900, engagement: 7.2, share: 0.16 },
    LINKEDIN:  { audience: 24800, engagement: 6.4, share: 0.07 },
    PINTEREST: { audience: 18450, engagement: 5.8, share: 0.05 },
    THREADS:   { audience: 16200, engagement: 6.8, share: 0.04 },
    TIKTOK:    { audience: 84600, engagement: 9.4, share: 0.28 },
    TWITTER:   { audience: 32600, engagement: 4.6, share: 0.08 },
    YOUTUBE:   { audience: 58200, engagement: 8.9, share: 0.21 },
  };

  const daysCount = 30;
  const targetTotalReach = 3237500;
  const targetTotalImpressions = 4535200;

  // Day weights for smooth natural growth over 30 days
  const dayWeights = [];
  let weightSum = 0;
  for (let i = 0; i < daysCount; i++) {
    const progress = i / (daysCount - 1);
    const dayOfWeek = (i + 3) % 7;
    const weekendFactor = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.2 : 1.0;
    const w = (0.7 + 0.6 * Math.pow(progress, 1.3)) * weekendFactor;
    dayWeights.push(w);
    weightSum += w;
  }

  const metricRows = [];
  let accumulatedReach = 0;
  let accumulatedImp = 0;

  for (let d = 0; d < daysCount; d++) {
    const dayIndex = d;
    const date = new Date(Date.now() - (daysCount - 1 - dayIndex) * 24 * 3600 * 1000);
    date.setHours(12, 0, 0, 0);

    const dayFraction = dayWeights[dayIndex] / weightSum;
    const dayReachTarget = Math.round(targetTotalReach * dayFraction);
    const dayImpTarget = Math.round(targetTotalImpressions * dayFraction);

    const dayProgress = dayIndex / (daysCount - 1);

    for (const acc of workspace.socialAccounts) {
      const p = acc.platform.toUpperCase();
      const bench = platformBenchmarks[p] || { audience: 20000, engagement: 6.0, share: 0.1 };

      // Followers growth: starts at 82% 30 days ago, smoothly increases to exact audience today
      const startAudience = Math.round(bench.audience * 0.82);
      const followers = dayIndex === daysCount - 1
        ? bench.audience
        : Math.round(startAudience + (bench.audience - startAudience) * Math.pow(dayProgress, 1.2));

      let reach = Math.round(dayReachTarget * bench.share);
      let impressions = Math.round(dayImpTarget * bench.share);

      // Distribute exact difference on final day
      if (dayIndex === daysCount - 1 && p === 'TIKTOK') {
        reach += (targetTotalReach - (accumulatedReach + reach));
        impressions += (targetTotalImpressions - (accumulatedImp + impressions));
      }

      accumulatedReach += reach;
      accumulatedImp += impressions;

      // Realistic engagement slight day variance while preserving benchmark average
      const variance = (Math.sin(dayIndex * 1.7) * 0.3);
      const engagement = dayIndex === daysCount - 1
        ? bench.engagement
        : Number((bench.engagement + variance).toFixed(2));

      const likes = Math.round(impressions * (engagement / 100) * 0.62);
      const comments = Math.max(1, Math.round(likes * 0.11));
      const shares = Math.max(1, Math.round(likes * 0.20));
      const saves = Math.max(1, Math.round(likes * 0.16));
      const clicks = Math.round(impressions * 0.036);
      const views = impressions;

      metricRows.push({
        socialAccountId: acc.id,
        followers,
        following: Math.round(followers * 0.02),
        subscribers: p === 'YOUTUBE' ? followers : 0,
        reach,
        impressions,
        engagement,
        likes,
        comments,
        shares,
        saves,
        clicks,
        views,
        recordedAt: date,
      });
    }
  }

  console.log(`Inserting ${metricRows.length} daily metric records across 30 days...`);
  await prisma.socialAccountMetric.createMany({
    data: metricRows,
  });

  // Synchronize exact audience numbers in socialAccount metadataJson
  for (const acc of workspace.socialAccounts) {
    const p = acc.platform.toUpperCase();
    const bench = platformBenchmarks[p] || { audience: 20000, engagement: 6.0 };
    let meta = {};
    try {
      meta = acc.metadataJson ? JSON.parse(acc.metadataJson) : {};
    } catch {}
    meta.followers = bench.audience;
    meta.engagementRate = `${bench.engagement}%`;
    meta.verified = true;
    await prisma.socialAccount.update({
      where: { id: acc.id },
      data: {
        metadataJson: JSON.stringify(meta),
      }
    });
    console.log(`✓ Synchronized ${p}: ${bench.audience.toLocaleString()} audience (${bench.engagement}% eng)`);
  }

  console.log('✓ Successfully calibrated all channels and 30-Day metrics!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
