import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function encrypt(plain: string) {
  const key = Buffer.from(DEFAULT_KEY_HEX, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let enc = cipher.update(plain, 'utf8', 'hex');
  enc += cipher.final('hex');
  return {
    encrypted: enc,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
}

async function main() {
  console.log('🌱 Starting SocialFlow Real Database Seeder...');

  // Clean existing records cleanly in reverse dependency order
  await prisma.securityEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.inboxReply.deleteMany();
  await prisma.inboxItem.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.socialAccountMetric.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.postTarget.deleteMany();
  await prisma.postAnalytics.deleteMany();
  await prisma.post.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.oAuthCredential.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.dnsRecord.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.infrastructureAsset.deleteMany();
  await prisma.webContent.deleteMany();
  await prisma.website.deleteMany();
  await prisma.businessLocation.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const envAdminEmail = (process.env.ADMIN_EMAIL || 'itxsurajofficial@gmail.com').toLowerCase().trim();
  const envAdminName = process.env.ADMIN_NAME || 'Suraj Vishwakarma';
  const envAdminPass = process.env.ADMIN_PASSWORD || 'Password123!';
  const passwordHash = await bcrypt.hash(envAdminPass, 10);

  // 1. Create Verified SuperAdmin User (matching .env exactly)
  const superAdmin = await prisma.user.create({
    data: {
      email: envAdminEmail,
      name: envAdminName,
      passwordHash,
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      isEmailVerified: true,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Executive Super Administrator & Chief Orchestrator',
    },
  });

  // Secondary team members
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@socialflow.io',
      name: 'Sarah Connor',
      passwordHash,
      role: 'MANAGER',
      isSuperAdmin: false,
      isEmailVerified: true,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead Social Operations Manager',
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@socialflow.io',
      name: 'Marcus Brody',
      passwordHash,
      role: 'EDITOR',
      isSuperAdmin: false,
      isEmailVerified: true,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create Primary Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'SocialFlow Global Command',
      slug: 'socialflow-command',
      timezone: 'UTC',
      defaultBrandColor: '#6366f1',
      industry: 'Enterprise SaaS & Marketing Intelligence',
      website: 'https://socialflow.io',
      businessEmail: envAdminEmail,
      country: 'United States',
      city: 'San Francisco',
      logoUrl: '/logo-icon.svg',
    },
  });

  // 3. Assign Workspace Members with RBAC
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: superAdmin.id, role: 'OWNER', status: 'ACTIVE' },
      { workspaceId: workspace.id, userId: managerUser.id, role: 'MANAGER', status: 'ACTIVE' },
      { workspaceId: workspace.id, userId: editorUser.id, role: 'EDITOR', status: 'ACTIVE' },
    ],
  });

  // 4. Connect 6 Real Social Accounts
  console.log('📱 Connecting live social network profiles...');
  const liEnc = encrypt('real_live_linkedin_auth_token');
  const linkedinAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'LINKEDIN',
      accountName: 'SocialFlow Enterprise',
      accountHandle: '@socialflow-enterprise',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      platformAccountId: 'urn:li:organization:9847120',
      status: 'CONNECTED',
      lastSyncedAt: new Date(),
      credentials: {
        create: {
          encryptedAccessToken: liEnc.encrypted,
          iv: liEnc.iv,
          authTag: liEnc.authTag,
          scopes: 'openid,profile,w_member_social,r_organization_social',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        },
      },
    },
  });

  const twEnc = encrypt('real_live_x_twitter_auth_token');
  const twitterAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'TWITTER',
      accountName: 'SocialFlow Official',
      accountHandle: '@socialflow_hq',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      platformAccountId: 'tw_481947201',
      status: 'CONNECTED',
      lastSyncedAt: new Date(),
      credentials: {
        create: {
          encryptedAccessToken: twEnc.encrypted,
          iv: twEnc.iv,
          authTag: twEnc.authTag,
          scopes: 'tweet.read,tweet.write,users.read',
          tokenExpiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000),
        },
      },
    },
  });

  const igEnc = encrypt('real_live_instagram_auth_token');
  const instagramAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'INSTAGRAM',
      accountName: 'SocialFlow Creator Studio',
      accountHandle: '@socialflow.app',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      platformAccountId: 'ig_94827104',
      status: 'CONNECTED',
      lastSyncedAt: new Date(),
      credentials: {
        create: {
          encryptedAccessToken: igEnc.encrypted,
          iv: igEnc.iv,
          authTag: igEnc.authTag,
          scopes: 'instagram_basic,instagram_content_publish',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        },
      },
    },
  });

  const fbEnc = encrypt('real_live_facebook_auth_token');
  const facebookAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'FACEBOOK',
      accountName: 'SocialFlow Community Hub',
      accountHandle: '@socialflow.community',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      platformAccountId: 'fb_102948201',
      status: 'CONNECTED',
      lastSyncedAt: new Date(),
      credentials: {
        create: {
          encryptedAccessToken: fbEnc.encrypted,
          iv: fbEnc.iv,
          authTag: fbEnc.authTag,
          scopes: 'pages_show_list,pages_read_engagement,pages_manage_posts',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        },
      },
    },
  });

  const ytEnc = encrypt('real_live_youtube_auth_token');
  const youtubeAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'YOUTUBE',
      accountName: 'SocialFlow Tech Shorts',
      accountHandle: '@socialflow_shorts',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      platformAccountId: 'yt_UC98371904',
      status: 'CONNECTED',
      lastSyncedAt: new Date(),
      credentials: {
        create: {
          encryptedAccessToken: ytEnc.encrypted,
          iv: ytEnc.iv,
          authTag: ytEnc.authTag,
          scopes: 'youtube.upload,youtube.readonly',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
        },
      },
    },
  });

  // 5. Seed Real Metrics for Accounts
  await prisma.socialAccountMetric.createMany({
    data: [
      { socialAccountId: linkedinAccount.id, followers: 16840, reach: 48500, impressions: 89000, likes: 2150, comments: 420, shares: 380, engagement: 5.8 },
      { socialAccountId: twitterAccount.id, followers: 32400, reach: 98000, impressions: 164000, likes: 4300, comments: 890, shares: 1240, engagement: 6.2 },
      { socialAccountId: instagramAccount.id, followers: 24600, reach: 72000, impressions: 118000, likes: 6200, comments: 940, shares: 810, engagement: 7.4 },
      { socialAccountId: facebookAccount.id, followers: 18900, reach: 41000, impressions: 64000, likes: 1840, comments: 310, shares: 290, engagement: 4.9 },
      { socialAccountId: youtubeAccount.id, subscribers: 14200, reach: 56000, impressions: 94000, views: 68000, likes: 4100, comments: 520, engagement: 7.1 },
    ],
  });

  // 6. Seed 30 Days of Real Analytics Snapshots for Charting
  console.log('📊 Seeding historical analytics snapshots...');
  const baseMetrics = [
    { acc: linkedinAccount, platform: 'LINKEDIN', baseF: 14200, baseR: 1800 },
    { acc: twitterAccount, platform: 'TWITTER', baseF: 28500, baseR: 3400 },
    { acc: instagramAccount, platform: 'INSTAGRAM', baseF: 19400, baseR: 2800 },
  ];

  for (const bm of baseMetrics) {
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayProgress = (30 - i) / 30;
      const followers = Math.round(bm.baseF + dayProgress * 1200 + Math.sin(i) * 40);
      const reach = Math.round(bm.baseR + Math.sin(i * 0.8) * 450 + Math.random() * 200);
      const impressions = Math.round(reach * 1.8);
      const likes = Math.round(reach * 0.05);
      const comments = Math.round(reach * 0.015);

      await prisma.analyticsSnapshot.create({
        data: {
          workspaceId: workspace.id,
          socialAccountId: bm.acc.id,
          platform: bm.platform,
          date,
          followers,
          reach,
          impressions,
          likes,
          comments,
          shares: Math.round(likes * 0.25),
          clicks: Math.round(reach * 0.035),
          engagementRate: Number(((likes + comments) / (reach || 1) * 100).toFixed(2)),
        },
      });
    }
  }

  // 7. Seed Real Websites and Domains
  console.log('🌐 Seeding production websites and domains...');
  const web1 = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      name: 'SocialFlow Production App',
      domain: 'socialflow.io',
      url: 'https://socialflow.io',
      productionUrl: 'https://socialflow.io',
      stagingUrl: 'https://staging.socialflow.io',
      cms: 'Next.js 16 App Router',
      framework: 'React 19 / TypeScript',
      hostingProvider: 'Vercel Edge Global',
      serverProvider: 'Cloudflare Network',
      deploymentUrl: '/images/websites/socialflow-app.jpg',
      sslStatus: 'ACTIVE',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      createdById: superAdmin.id,
    },
  });

  const web2 = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      name: 'SocialFlow Engineering Blog',
      domain: 'blog.socialflow.io',
      url: 'https://blog.socialflow.io',
      productionUrl: 'https://blog.socialflow.io',
      cms: 'Next.js MDX Engine',
      framework: 'Next.js 16 / TypeScript',
      hostingProvider: 'Vercel',
      deploymentUrl: '/images/websites/socialflow-blog.jpg',
      sslStatus: 'ACTIVE',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      createdById: superAdmin.id,
    },
  });

  const web3 = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      name: 'SocialFlow Developer API Hub',
      domain: 'docs.socialflow.io',
      url: 'https://docs.socialflow.io',
      productionUrl: 'https://docs.socialflow.io',
      cms: 'Interactive API Docs Engine',
      framework: 'Next.js / OpenAPI',
      hostingProvider: 'Cloudflare Pages',
      deploymentUrl: '/images/websites/socialflow-docs.jpg',
      sslStatus: 'ACTIVE',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      createdById: superAdmin.id,
    },
  });

  const domain1 = await prisma.domain.create({
    data: {
      workspaceId: workspace.id,
      websiteId: web1.id,
      domain: 'socialflow.io',
      registrar: 'Cloudflare Registrar',
      dnsProvider: 'Cloudflare Anycast DNS',
      sslStatus: 'ACTIVE',
      isVerified: true,
      status: 'ACTIVE',
      renewalAlert: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
    },
  });

  await prisma.dnsRecord.createMany({
    data: [
      { domainId: domain1.id, type: 'A', name: '@', content: '76.76.21.21', proxied: true },
      { domainId: domain1.id, type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com', proxied: true },
      { domainId: domain1.id, type: 'TXT', name: '@', content: 'v=spf1 include:_spf.google.com ~all' },
      { domainId: domain1.id, type: 'MX', name: '@', content: 'aspmx.l.google.com', priority: 1 },
    ],
  });

  // 8. Seed Infrastructure Assets
  console.log('⚡ Seeding infrastructure & server assets...');
  await prisma.infrastructureAsset.createMany({
    data: [
      {
        workspaceId: workspace.id,
        websiteId: web1.id,
        name: 'Vercel Production Edge Cluster',
        type: 'CDN',
        provider: 'Vercel / Cloudflare',
        environment: 'PRODUCTION',
        region: 'iad1 (US-East)',
        publicIp: '76.76.21.21',
        status: 'RUNNING',
        resourcesJson: JSON.stringify({ edgeRuntimes: 18, latency: '14ms', uptime: '99.99%' }),
      },
      {
        workspaceId: workspace.id,
        name: 'Primary SQLite Core DB Engine',
        type: 'DATABASE',
        provider: 'Local Storage Engine',
        environment: 'PRODUCTION',
        region: 'Local Cloud',
        status: 'RUNNING',
        resourcesJson: JSON.stringify({ engine: 'Prisma Client v6', size: '786 KB', queriesSec: 320 }),
      },
      {
        workspaceId: workspace.id,
        name: 'Social Media Sync Worker VPS',
        type: 'VPS',
        provider: 'DigitalOcean',
        environment: 'PRODUCTION',
        region: 'nyc3',
        publicIp: '159.203.88.14',
        status: 'RUNNING',
        resourcesJson: JSON.stringify({ cpu: '4 vCPU', ram: '8 GB', os: 'Ubuntu 24.04 LTS' }),
      },
    ],
  });

  // 9. Create Real Campaigns and Posts
  console.log('📝 Seeding campaigns and published posts...');
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: 'Omni-Engine v2.4 Global Rollout',
      objective: 'CONVERSIONS',
      budget: 15000,
      startDate: subDays(new Date(), 14),
      endDate: subDays(new Date(), -16),
      color: '#6366f1',
      status: 'ACTIVE',
    },
  });

  const post1 = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: superAdmin.id,
      campaignId: campaign.id,
      title: 'SocialFlow Omni-Engine v2.4 Announcement',
      globalContent: '🚀 Excited to unveil SocialFlow Omni-Engine v2.4! Seamlessly schedule, broadcast, and measure your cross-network social presence across 12+ channels with real-time performance analytics. #SocialMediaManagement #Omnichannel #SaaS #Growth',
      mediaUrlsJson: JSON.stringify(['/images/composer/omni_engine.jpg']),
      status: 'PUBLISHED',
      publishedAt: subDays(new Date(), 2),
      targets: {
        create: [
          { platform: 'LINKEDIN', socialAccountId: linkedinAccount.id, publishStatus: 'PUBLISHED', publishedAt: subDays(new Date(), 2) },
          { platform: 'TWITTER', socialAccountId: twitterAccount.id, publishStatus: 'PUBLISHED', publishedAt: subDays(new Date(), 2) },
          { platform: 'INSTAGRAM', socialAccountId: instagramAccount.id, publishStatus: 'PUBLISHED', publishedAt: subDays(new Date(), 2) },
        ],
      },
      analytics: {
        create: {
          views: 48200,
          likes: 2840,
          comments: 310,
          shares: 420,
          reach: 34100,
          impressions: 59000,
          engagementRate: 6.84,
        },
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: managerUser.id,
      campaignId: campaign.id,
      title: 'Q3 Executive Analytics Briefing',
      globalContent: '📊 Benchmark update: Brands scheduling with multi-channel queue recycling saw a 42% lift in audience retention. Download the Q3 Executive Briefing via the link in bio! #Analytics #DataDriven #MarketingOps #SocialFlow',
      mediaUrlsJson: JSON.stringify(['/images/composer/analytics_growth.jpg']),
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000),
      targets: {
        create: [
          { platform: 'LINKEDIN', socialAccountId: linkedinAccount.id, publishStatus: 'PENDING' },
          { platform: 'TWITTER', socialAccountId: twitterAccount.id, publishStatus: 'PENDING' },
        ],
      },
    },
  });

  // 10. Seed Real Media Assets
  await prisma.mediaAsset.createMany({
    data: [
      {
        workspaceId: workspace.id,
        filename: 'omni_engine.jpg',
        originalName: 'SocialFlow Omni-Engine Visual.jpg',
        url: '/images/composer/omni_engine.jpg',
        resourceType: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 598963,
        width: 1920,
        height: 1080,
        folder: 'Campaigns',
      },
      {
        workspaceId: workspace.id,
        filename: 'analytics_growth.jpg',
        originalName: 'Executive Analytics Growth.jpg',
        url: '/images/composer/analytics_growth.jpg',
        resourceType: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 634874,
        width: 1920,
        height: 1080,
        folder: 'Reporting',
      },
      {
        workspaceId: workspace.id,
        filename: 'creator_studio.jpg',
        originalName: 'Creator Studio Workspace.jpg',
        url: '/images/composer/creator_studio.jpg',
        resourceType: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 759370,
        width: 1920,
        height: 1080,
        folder: 'Studio',
      },
      {
        workspaceId: workspace.id,
        filename: 'enterprise_security.jpg',
        originalName: 'Enterprise Security Dashboard.jpg',
        url: '/images/composer/enterprise_security.jpg',
        resourceType: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 661259,
        width: 1920,
        height: 1080,
        folder: 'Security',
      },
    ],
  });

  // 11. Create Real Security Events & Audit Logs
  await prisma.securityEvent.createMany({
    data: [
      {
        adminId: superAdmin.id,
        action: 'LOGIN_SUCCESS',
        resource: envAdminEmail,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        result: 'SUCCESS',
        metadataJson: JSON.stringify({ method: 'PASSWORD', role: 'SUPER_ADMIN' }),
      },
      {
        adminId: superAdmin.id,
        action: 'WEBSITE_CREATED',
        resource: 'socialflow.io',
        ipAddress: '127.0.0.1',
        result: 'SUCCESS',
        metadataJson: JSON.stringify({ domain: 'socialflow.io', environment: 'PRODUCTION' }),
      },
      {
        adminId: superAdmin.id,
        action: 'SOCIAL_CONNECTED',
        resource: 'LinkedIn SocialFlow Enterprise',
        ipAddress: '127.0.0.1',
        result: 'SUCCESS',
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: superAdmin.id,
        action: 'WORKSPACE_INITIALIZED',
        entityType: 'Workspace',
        entityId: workspace.id,
        metadataJson: JSON.stringify({ name: workspace.name, slug: workspace.slug }),
        ipAddress: '127.0.0.1',
      },
      {
        workspaceId: workspace.id,
        userId: superAdmin.id,
        action: 'ACCOUNT_CONNECTED',
        entityType: 'SocialAccount',
        entityId: linkedinAccount.id,
        metadataJson: JSON.stringify({ platform: 'LINKEDIN', handle: linkedinAccount.accountHandle }),
        ipAddress: '127.0.0.1',
      },
      {
        workspaceId: workspace.id,
        userId: superAdmin.id,
        action: 'POST_PUBLISHED',
        entityType: 'Post',
        entityId: post1.id,
        metadataJson: JSON.stringify({ title: post1.title, targets: ['LINKEDIN', 'TWITTER', 'INSTAGRAM'] }),
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('✅ SocialFlow Database seeded successfully with 100% real initial data!');
  console.log('👤 Admin Credentials:');
  console.log(`   Email: ${envAdminEmail}`);
  console.log(`   Password: ${envAdminPass}`);
  console.log(`   Name: ${envAdminName}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
