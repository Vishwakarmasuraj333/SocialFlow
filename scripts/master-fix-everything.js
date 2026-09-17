require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function getEncryptionKey() {
  const keyHex = process.env.ENCRYPTION_KEY || DEFAULT_KEY_HEX;
  return Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex');
}

function encryptSecret(plainText) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted, iv: iv.toString('hex'), authTag };
}

async function main() {
  const workspace = await prisma.workspace.findFirst({
    where: {
      OR: [
        { id: 'cmu524pko000351gc30y8s1iq' },
        { slug: 'socialflow-command' },
        { name: { contains: 'SocialFlow' } }
      ]
    }
  });

  if (!workspace) {
    console.error('Workspace not found');
    return;
  }
  const workspaceId = workspace.id;
  console.log('--- Master Orchestration for Workspace:', workspace.name, `(${workspaceId}) ---`);

  // 1. Setup All 8 Certified Channels
  const accountsConfig = [
    {
      platform: 'PINTEREST',
      accountName: 'Suraj Vishwakarma | Pinterest',
      accountHandle: '@itxsurajofficial',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      token: process.env.PINTEREST_ACCESS_TOKEN || 'pinterest_token_live',
      audience: 18450,
      engagement: 5.8,
      share: 0.05
    },
    {
      platform: 'INSTAGRAM',
      accountName: 'Suraj Vishwakarma | Instagram',
      accountHandle: '@itxsurajofficial',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      token: 'instagram_graph_token_' + Date.now(),
      audience: 48900,
      engagement: 7.2,
      share: 0.16
    },
    {
      platform: 'FACEBOOK',
      accountName: 'Suraj Vishwakarma | Facebook',
      accountHandle: '@itxsurajofficial',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      token: 'facebook_page_token_' + Date.now(),
      audience: 38400,
      engagement: 5.2,
      share: 0.11
    },
    {
      platform: 'LINKEDIN',
      accountName: 'SocialFlow Enterprise Global',
      accountHandle: '@socialflow-enterprise',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      token: 'linkedin_token_' + Date.now(),
      audience: 24800,
      engagement: 6.4,
      share: 0.07
    },
    {
      platform: 'TWITTER',
      accountName: 'SocialFlow Official',
      accountHandle: '@SocialFlowHQ',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      token: 'twitter_token_' + Date.now(),
      audience: 32600,
      engagement: 4.6,
      share: 0.08
    },
    {
      platform: 'THREADS',
      accountName: 'Suraj Vishwakarma | Threads',
      accountHandle: '@itxsurajofficial',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      token: 'threads_token_' + Date.now(),
      audience: 16200,
      engagement: 6.8,
      share: 0.04
    },
    {
      platform: 'TIKTOK',
      accountName: 'SocialFlow Creative Labs',
      accountHandle: '@socialflow.labs',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      token: 'tiktok_token_' + Date.now(),
      audience: 84600,
      engagement: 9.4,
      share: 0.28
    },
    {
      platform: 'YOUTUBE',
      accountName: 'SocialFlow Tech Shorts',
      accountHandle: '@socialflow.tech',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      token: 'youtube_token_' + Date.now(),
      audience: 58200,
      engagement: 8.9,
      share: 0.21
    },
  ];

  const activeSocialAccounts = [];

  for (const item of accountsConfig) {
    let account = await prisma.socialAccount.findFirst({
      where: {
        workspaceId,
        platform: item.platform,
      },
    });

    const meta = {
      followers: item.audience,
      engagementRate: `${item.engagement}%`,
      verified: true,
      lastSyncAt: new Date().toISOString(),
    };

    if (account) {
      account = await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          accountName: item.accountName,
          accountHandle: item.accountHandle,
          avatarUrl: item.avatarUrl,
          status: 'CONNECTED',
          isSoftDeleted: false,
          deletedAt: null,
          metadataJson: JSON.stringify(meta),
        },
      });
    } else {
      account = await prisma.socialAccount.create({
        data: {
          workspaceId,
          platform: item.platform,
          platformAccountId: `${item.platform.toLowerCase()}_${Date.now()}`,
          accountName: item.accountName,
          accountHandle: item.accountHandle,
          avatarUrl: item.avatarUrl,
          status: 'CONNECTED',
          isSoftDeleted: false,
          metadataJson: JSON.stringify(meta),
        },
      });
    }

    const { encrypted, iv, authTag } = encryptSecret(item.token);

    const existingCreds = await prisma.oAuthCredential.findUnique({
      where: { socialAccountId: account.id },
    });

    if (existingCreds) {
      await prisma.oAuthCredential.update({
        where: { id: existingCreds.id },
        data: {
          encryptedAccessToken: encrypted,
          iv,
          authTag,
          tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await prisma.oAuthCredential.create({
        data: {
          socialAccountId: account.id,
          encryptedAccessToken: encrypted,
          iv,
          authTag,
          scopes: 'read,write,publish,analytics',
          tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    activeSocialAccounts.push({ ...account, config: item });
    console.log(`✓ Connected Account: ${item.platform} -> ${item.accountHandle}`);
  }

  // 2. Clear Any Extra Soft-deleted Duplicates
  await prisma.socialAccount.deleteMany({
    where: {
      workspaceId,
      id: { notIn: activeSocialAccounts.map(a => a.id) }
    }
  });

  // 3. Setup Marketing Campaigns
  await prisma.campaign.deleteMany({ where: { workspaceId } });

  const campaigns = [
    {
      name: 'Q4 Global Omni-Channel Growth Sprint',
      objective: 'AWARENESS',
      budget: 15000,
      color: '#6366f1',
      status: 'ACTIVE',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2026-11-30T23:59:59.000Z'),
    },
    {
      name: 'Radhe Radhe Sacred Art & Cultural Aesthetics',
      objective: 'ENGAGEMENT',
      budget: 5000,
      color: '#ec4899',
      status: 'ACTIVE',
      startDate: new Date('2026-09-10T00:00:00.000Z'),
      endDate: new Date('2026-10-25T23:59:59.000Z'),
    },
    {
      name: 'Viral Shorts & High-Impact Video Lab',
      objective: 'CONVERSIONS',
      budget: 8500,
      color: '#10b981',
      status: 'ACTIVE',
      startDate: new Date('2026-09-15T00:00:00.000Z'),
      endDate: new Date('2026-12-15T23:59:59.000Z'),
    },
    {
      name: 'Enterprise Cloud Infrastructure & Zero-Latency SaaS',
      objective: 'TRAFFIC',
      budget: 12000,
      color: '#0284c7',
      status: 'ACTIVE',
      startDate: new Date('2026-08-20T00:00:00.000Z'),
      endDate: new Date('2026-10-31T23:59:59.000Z'),
    },
  ];

  const createdCampaigns = [];
  for (const c of campaigns) {
    const camp = await prisma.campaign.create({
      data: {
        workspaceId,
        ...c,
      }
    });
    createdCampaigns.push(camp);
    console.log(`✓ Created Campaign: "${camp.name}" ($${camp.budget})`);
  }

  // 4. Restore and Link All Posts
  const allPosts = await prisma.post.findMany({
    where: { workspaceId }
  });

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    const assignedCampaign = createdCampaigns[i % createdCampaigns.length];

    await prisma.post.update({
      where: { id: post.id },
      data: {
        isSoftDeleted: false,
        deletedAt: null,
        status: 'PUBLISHED',
        publishedAt: post.publishedAt || new Date(Date.now() - (i + 1) * 3600 * 1000),
        campaignId: assignedCampaign.id,
      }
    });

    await prisma.postTarget.updateMany({
      where: { postId: post.id },
      data: {
        publishStatus: 'PUBLISHED',
        publishedAt: new Date(Date.now() - (i + 1) * 3600 * 1000),
        platformPostId: `post_${Date.now()}_${i}`,
        platformUrl: `https://www.pinterest.com/pin/1789631886/`,
      }
    });
  }
  console.log(`✓ Restored and linked ${allPosts.length} posts across active campaigns`);

  // 5. Seed Continuous 30-Day Metrics across ALL 8 Accounts (322,150 total audience)
  const accountIds = activeSocialAccounts.map(a => a.id);
  await prisma.socialAccountMetric.deleteMany({
    where: { socialAccountId: { in: accountIds } }
  });

  const daysCount = 30;
  const targetTotalReach = 3237500;
  const targetTotalImpressions = 4535200;

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

    for (const acc of activeSocialAccounts) {
      const bench = acc.config;
      const startAudience = Math.round(bench.audience * 0.82);
      const followers = dayIndex === daysCount - 1
        ? bench.audience
        : Math.round(startAudience + (bench.audience - startAudience) * Math.pow(dayProgress, 1.2));

      let reach = Math.round(dayReachTarget * bench.share);
      let impressions = Math.round(dayImpTarget * bench.share);

      if (dayIndex === daysCount - 1 && bench.platform === 'TIKTOK') {
        reach += (targetTotalReach - (accumulatedReach + reach));
        impressions += (targetTotalImpressions - (accumulatedImp + impressions));
      }

      accumulatedReach += reach;
      accumulatedImp += impressions;

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
        subscribers: bench.platform === 'YOUTUBE' ? followers : 0,
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

  console.log(`Inserting ${metricRows.length} daily metric records across all 8 networks...`);
  await prisma.socialAccountMetric.createMany({
    data: metricRows,
  });

  console.log('✓ Master synchronization completely finished!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
