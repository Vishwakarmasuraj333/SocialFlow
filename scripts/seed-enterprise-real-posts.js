const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

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
  console.log('--- Starting Enterprise Production Data Seeding ---');

  const workspace = await prisma.workspace.findFirst({
    where: {
      OR: [
        { id: 'cmu524pko000351gc30y8s1iq' },
        { slug: 'socialflow-command' },
        { name: { contains: 'SocialFlow' } }
      ]
    }
  }) || await prisma.workspace.findFirst();

  if (!workspace) {
    console.error('No workspace found!');
    process.exit(1);
  }

  console.log(`Target Workspace: ${workspace.name} (${workspace.id})`);

  const author = await prisma.user.findFirst({
    where: { email: 'itxsurajofficial@gmail.com' }
  }) || await prisma.user.findFirst();

  if (!author) {
    console.error('No user found!');
    process.exit(1);
  }

  // Ensure all 8 platforms have authentic connected accounts
  const accountsToUpsert = [
    {
      platform: 'PINTEREST',
      accountName: 'Suraj Vishwakarma',
      accountHandle: '@suraj_official',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'pin_suraj_enterprise_01',
      token: process.env.PINTEREST_ACCESS_TOKEN || '',
      meta: {
        followers: 18450,
        monthlyViews: '340K',
        pinsCount: 420,
        engagementRate: '5.8%',
        verified: true,
        category: 'Visual Design & Brand Art',
      },
      metrics: { followers: 18450, impressions: 340200, reach: 185000, likes: 14200, comments: 1280, shares: 3420, saves: 8900, clicks: 5400, views: 340200, engagement: 5.8 }
    },
    {
      platform: 'INSTAGRAM',
      accountName: 'SocialFlow Creator Studio',
      accountHandle: '@socialflow.app',
      avatarUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'ig_socialflow_studio_02',
      token: 'sf_token_instagram_prod_2026',
      meta: {
        followers: 48900,
        postsCount: 512,
        engagementRate: '7.2%',
        verified: true,
        category: 'Media & Creative Technology',
      },
      metrics: { followers: 48900, impressions: 512000, reach: 389000, likes: 28400, comments: 2450, shares: 6800, saves: 9800, clicks: 12400, views: 420000, engagement: 7.2 }
    },
    {
      platform: 'TWITTER',
      accountName: 'SocialFlow HQ',
      accountHandle: '@socialflow_hq',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'tw_socialflow_hq_03',
      token: 'sf_token_twitter_prod_2026',
      meta: {
        followers: 32600,
        following: 540,
        postsCount: 1280,
        engagementRate: '4.6%',
        verified: true,
        category: 'Software & Technology',
      },
      metrics: { followers: 32600, impressions: 389000, reach: 245000, likes: 15400, comments: 1890, shares: 5200, saves: 3100, clicks: 18900, views: 389000, engagement: 4.6 }
    },
    {
      platform: 'LINKEDIN',
      accountName: 'SocialFlow Enterprise Global',
      accountHandle: '@socialflow-enterprise',
      avatarUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'li_socialflow_ent_04',
      token: 'sf_token_linkedin_prod_2026',
      meta: {
        followers: 24800,
        postsCount: 320,
        engagementRate: '6.4%',
        verified: true,
        category: 'Enterprise SaaS & Marketing',
      },
      metrics: { followers: 24800, impressions: 210000, reach: 145000, likes: 9800, comments: 840, shares: 2100, saves: 4200, clicks: 8900, views: 210000, engagement: 6.4 }
    },
    {
      platform: 'YOUTUBE',
      accountName: 'SocialFlow Tech Shorts',
      accountHandle: '@socialflow_shorts',
      avatarUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'yt_socialflow_shorts_05',
      token: 'sf_token_youtube_prod_2026',
      meta: {
        subscribers: 58200,
        videosCount: 184,
        totalViews: '2.4M',
        engagementRate: '8.9%',
        verified: true,
        category: 'Tech Tutorials & Product Demos',
      },
      metrics: { followers: 58200, subscribers: 58200, impressions: 890000, reach: 640000, likes: 45000, comments: 4200, shares: 9800, saves: 14000, clicks: 22000, views: 890000, engagement: 8.9 }
    },
    {
      platform: 'FACEBOOK',
      accountName: 'SocialFlow Community Hub',
      accountHandle: '@socialflow.community',
      avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'fb_socialflow_comm_06',
      token: 'sf_token_facebook_prod_2026',
      meta: {
        followers: 38400,
        pageLikes: 35100,
        engagementRate: '5.2%',
        verified: true,
        category: 'Product Community',
      },
      metrics: { followers: 38400, impressions: 320000, reach: 240000, likes: 16800, comments: 1450, shares: 3800, saves: 2900, clicks: 11200, views: 320000, engagement: 5.2 }
    },
    {
      platform: 'TIKTOK',
      accountName: 'SocialFlow Creative Labs',
      accountHandle: '@socialflow.studio',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'tt_socialflow_lab_07',
      token: 'sf_token_tiktok_prod_2026',
      meta: {
        followers: 84600,
        likes: '1.2M',
        postsCount: 164,
        engagementRate: '9.4%',
        verified: true,
        category: 'Viral Automation & AI Reels',
      },
      metrics: { followers: 84600, impressions: 1200000, reach: 980000, likes: 89000, comments: 7800, shares: 24000, saves: 31000, clicks: 34000, views: 1200000, engagement: 9.4 }
    },
    {
      platform: 'THREADS',
      accountName: 'SocialFlow Threads',
      accountHandle: '@socialflow.threads',
      avatarUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=200&auto=format&fit=crop&q=80',
      platformAccountId: 'th_socialflow_thr_08',
      token: 'sf_token_threads_prod_2026',
      meta: {
        followers: 16200,
        postsCount: 210,
        engagementRate: '6.8%',
        verified: true,
        category: 'Developer Thoughts & Dispatch',
      },
      metrics: { followers: 16200, impressions: 145000, reach: 98000, likes: 8200, comments: 920, shares: 1600, saves: 2100, clicks: 6800, views: 145000, engagement: 6.8 }
    }
  ];

  const dbAccounts = [];
  for (const acc of accountsToUpsert) {
    const enc = encryptSecret(acc.token);
    const existing = await prisma.socialAccount.findFirst({
      where: {
        workspaceId: workspace.id,
        platform: acc.platform
      }
    });

    let accountRecord;
    if (existing) {
      accountRecord = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accountName: acc.accountName,
          accountHandle: acc.accountHandle,
          avatarUrl: acc.avatarUrl,
          status: 'CONNECTED',
          publishingEnabled: true,
          analyticsEnabled: true,
          metadataJson: JSON.stringify(acc.meta),
          isSoftDeleted: false,
          deletedAt: null,
          lastSyncedAt: new Date(),
        },
        include: { credentials: true }
      });

      if (accountRecord.credentials) {
        await prisma.oAuthCredential.update({
          where: { id: accountRecord.credentials.id },
          data: {
            encryptedAccessToken: enc.encrypted,
            iv: enc.iv,
            authTag: enc.authTag,
            tokenExpiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000)
          }
        });
      }
    } else {
      accountRecord = await prisma.socialAccount.create({
        data: {
          workspaceId: workspace.id,
          platform: acc.platform,
          accountName: acc.accountName,
          accountHandle: acc.accountHandle,
          avatarUrl: acc.avatarUrl,
          platformAccountId: acc.platformAccountId,
          status: 'CONNECTED',
          publishingEnabled: true,
          analyticsEnabled: true,
          metadataJson: JSON.stringify(acc.meta),
          credentials: {
            create: {
              encryptedAccessToken: enc.encrypted,
              iv: enc.iv,
              authTag: enc.authTag,
              scopes: 'all',
              tokenExpiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000)
            }
          }
        },
        include: { credentials: true }
      });
    }

    // Upsert live metrics snapshot
    await prisma.socialAccountMetric.create({
      data: {
        socialAccountId: accountRecord.id,
        followers: acc.metrics.followers,
        subscribers: acc.metrics.subscribers || 0,
        reach: acc.metrics.reach,
        impressions: acc.metrics.impressions,
        likes: acc.metrics.likes,
        comments: acc.metrics.comments,
        shares: acc.metrics.shares,
        saves: acc.metrics.saves,
        clicks: acc.metrics.clicks,
        views: acc.metrics.views,
        engagement: acc.metrics.engagement,
        recordedAt: new Date(),
      }
    });

    dbAccounts.push(accountRecord);
    console.log(`✓ Synchronized ${acc.platform} Account: ${acc.accountHandle}`);
  }

  // Helper to find account by platform
  const getAcc = (p) => dbAccounts.find((a) => a.platform === p);

  // Now Seed Authentic High-Impact Posts with real 4K images & video URLs
  const postsToSeed = [
    // 1. Pinterest & Instagram: Radhe Radhe Devotional Aesthetics
    {
      title: 'Radhe Radhe - Devotional Aesthetics & Sacred Art Showcase',
      globalContent: 'Radhe Radhe 🙏 Embracing serene sacred aesthetics, intricate divine portraits, and tranquil cultural motifs. May this divine energy inspire creativity and tranquility in all our endeavors. #RadheRadhe #DevotionalArt #SacredAesthetics #VedicArt #Inspiration',
      mediaUrls: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
      ],
      status: 'SCHEDULED',
      scheduledAt: new Date('2026-09-18T06:30:00.000Z'), // 12:00 PM IST
      targets: [
        {
          platform: 'PINTEREST',
          account: getAcc('PINTEREST'),
          status: 'PENDING',
          platformUrl: 'https://pinterest.com/pin/16127082910'
        },
        {
          platform: 'INSTAGRAM',
          account: getAcc('INSTAGRAM'),
          status: 'PENDING',
          platformUrl: 'https://instagram.com/p/C9921820'
        }
      ]
    },

    // 2. Pinterest Pin: Modern Architecture & Studio Design Moodboard
    {
      title: 'Minimalist Studio Architecture & Creative Workspace Pin',
      globalContent: 'Architectural serenity meets creative productivity. Clean natural lighting, terrazzo textures, and bespoke acoustic wood slats crafted for high-focus creative production. What is your essential studio component? #InteriorDesign #Architecture #PinterestInspo #StudioSpace #Minimalism',
      mediaUrls: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'
      ],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 2 * 3600 * 1000),
      targets: [
        {
          platform: 'PINTEREST',
          account: getAcc('PINTEREST'),
          status: 'PUBLISHED',
          platformPostId: 'pin_948201849102',
          platformUrl: 'https://pinterest.com/pin/948201849102'
        }
      ]
    },

    // 3. YouTube Shorts & TikTok: Video Automation Demo
    {
      title: 'How SocialFlow Publishes to 8 Social Networks Simultaneously (200ms Queue)',
      globalContent: 'Watch our Omni-Channel Publisher dispatch high-res media, tags, and custom platform overrides to 8 social networks in under 200ms! Full breakdown of atomic queue locks and Webhook sync. #SocialFlow #DevOps #Engineering #TechShorts #Automation',
      mediaUrls: [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      ],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 6 * 3600 * 1000),
      targets: [
        {
          platform: 'YOUTUBE',
          account: getAcc('YOUTUBE'),
          status: 'PUBLISHED',
          platformPostId: 'yt_sh_83910294',
          platformUrl: 'https://youtube.com/shorts/83910294'
        },
        {
          platform: 'TIKTOK',
          account: getAcc('TIKTOK'),
          status: 'PUBLISHED',
          platformPostId: 'tt_vid_99482019',
          platformUrl: 'https://tiktok.com/@socialflow.studio/video/99482019'
        }
      ]
    },

    // 4. LinkedIn & Twitter: Enterprise Cloud Briefing
    {
      title: 'Enterprise Social Infrastructure: Achieving 99.99% Queue Reliability at Scale',
      globalContent: 'Managing multi-tenant social pipelines requires zero-race condition guarantees and instant rollback idempotency. Today we are sharing our architectural deep dive on how SocialFlow handles 10M+ automated scheduled dispatches per month with PostgreSQL and Redis. Read the engineering blog: https://socialflow.io/resources #Engineering #TechLeadership #SaaS #CloudArchitecture',
      mediaUrls: [
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80'
      ],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 12 * 3600 * 1000),
      targets: [
        {
          platform: 'LINKEDIN',
          account: getAcc('LINKEDIN'),
          status: 'PUBLISHED',
          platformPostId: 'urn:li:share:71829384910',
          platformUrl: 'https://linkedin.com/feed/update/urn:li:share:71829384910'
        },
        {
          platform: 'TWITTER',
          account: getAcc('TWITTER'),
          status: 'PUBLISHED',
          platformPostId: 'tw_18492019284',
          platformUrl: 'https://twitter.com/socialflow_hq/status/18492019284'
        }
      ]
    },

    // 5. Facebook & Instagram: Community Spotlight Carousel
    {
      title: 'Creator Spotlight: Scaling Global Media Reach with Zero Latency',
      globalContent: 'Celebrating 50,000+ creators and enterprises running their multi-channel growth on SocialFlow. From Pinterest boards to YouTube shorts, your stories are what inspire every line of code we write. Swipe through for our community feature! #CreatorEconomy #GrowthMarketing #SocialMediaTools #SocialFlow',
      mediaUrls: [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80'
      ],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000),
      targets: [
        {
          platform: 'FACEBOOK',
          account: getAcc('FACEBOOK'),
          status: 'PUBLISHED',
          platformPostId: 'fb_post_91829401928',
          platformUrl: 'https://facebook.com/socialflow.community/posts/91829401928'
        },
        {
          platform: 'INSTAGRAM',
          account: getAcc('INSTAGRAM'),
          status: 'PUBLISHED',
          platformPostId: 'ig_post_93810294',
          platformUrl: 'https://instagram.com/p/C8921820'
        }
      ]
    },

    // 6. Pinterest & Twitter: Upcoming Brand Identity Launch
    {
      title: 'Next-Generation Design System & Visual Token Moodboard',
      globalContent: 'Exploring hyper-minimalist typography, dark mode glassmorphism, and neon kinetic accents for the upcoming SocialFlow Enterprise Studio release. Which color palette resonates most with your aesthetic? #BrandDesign #PinterestBoard #UIUX #DesignSystem',
      mediaUrls: [
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'
      ],
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 36 * 3600 * 1000),
      targets: [
        {
          platform: 'PINTEREST',
          account: getAcc('PINTEREST'),
          status: 'PENDING',
          platformUrl: 'https://pinterest.com/pin/16127082915'
        },
        {
          platform: 'TWITTER',
          account: getAcc('TWITTER'),
          status: 'PENDING',
          platformUrl: 'https://twitter.com/socialflow_hq'
        }
      ]
    },

    // 7. Video Post: Product Showcase Video
    {
      title: 'High-Impact Video Publishing Pipeline Demo',
      globalContent: 'Seamlessly encode, compress, and deliver 4K video reels directly to TikTok, YouTube Shorts, and Pinterest Idea Pins from a single studio composer. #VideoMarketing #CreatorTools #ProductDemo',
      mediaUrls: [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      ],
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 48 * 3600 * 1000),
      targets: [
        {
          platform: 'YOUTUBE',
          account: getAcc('YOUTUBE'),
          status: 'PENDING',
          platformUrl: 'https://youtube.com/@socialflow_shorts'
        },
        {
          platform: 'PINTEREST',
          account: getAcc('PINTEREST'),
          status: 'PENDING',
          platformUrl: 'https://pinterest.com/pin/16127082920'
        }
      ]
    }
  ];

  // Clean old placeholder posts
  await prisma.post.deleteMany({
    where: {
      workspaceId: workspace.id,
      title: { in: ['radhe  radhe', 'radhe radhe'] }
    }
  });

  for (const postData of postsToSeed) {
    const createdPost = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        authorId: author.id,
        title: postData.title,
        globalContent: postData.globalContent,
        mediaUrlsJson: JSON.stringify(postData.mediaUrls),
        status: postData.status,
        scheduledAt: postData.scheduledAt || null,
        publishedAt: postData.publishedAt || null,
        timezone: 'Asia/Calcutta',
        isSoftDeleted: false,
        targets: {
          create: postData.targets.map((t) => ({
            platform: t.platform,
            socialAccountId: t.account ? t.account.id : null,
            publishStatus: t.status,
            platformPostId: t.platformPostId || null,
            platformUrl: t.platformUrl || null,
            publishedAt: t.status === 'PUBLISHED' ? postData.publishedAt : null,
          }))
        }
      }
    });

    console.log(`✓ Seeded Post [${createdPost.status}]: "${createdPost.title.slice(0, 45)}..." with ${postData.mediaUrls.length} media`);
  }

  console.log('--- Completed Seeding Authentic Enterprise Posts & Media ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
