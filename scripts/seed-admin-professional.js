const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Professional Admin Data Seeding ---');

  const workspaceId = 'cmtpen74x000451g8bzitk8s4'; // Acme Media & Growth
  const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const adminId = adminUser?.id || 'cmtpen73e000051g8ggsdtxjj';

  // 1. Fix Broken Websites & Domains
  console.log('1. Polishing Websites and Domains...');
  
  // Fix "cola" -> "AERØX OG – High-Performance Brand Studio"
  const colaWeb = await prisma.website.findFirst({
    where: { OR: [{ domain: 'https:' }, { url: { contains: 'aerox1' } }, { name: 'cola' }] },
  });
  if (colaWeb) {
    await prisma.website.update({
      where: { id: colaWeb.id },
      data: {
        name: 'AERØX OG – Digital Experience Agency',
        domain: 'aerox1.vercel.app',
        url: 'https://aerox1.vercel.app/',
        environment: 'PRODUCTION',
        cms: 'Custom',
        framework: 'Next.js 15 / WebGL',
        hostingProvider: 'Vercel Enterprise',
        sslStatus: 'ACTIVE',
        notes: 'High-performance interactive 3D web experience, digital brand transformation, and UI/UX engineering studio.',
      },
    });
    console.log('Updated AERØX website.');

    // Fix corresponding domain record
    await prisma.domain.updateMany({
      where: { OR: [{ domain: 'https:' }, { websiteId: colaWeb.id }] },
      data: {
        domain: 'aerox1.vercel.app',
        sslStatus: 'ACTIVE',
        isVerified: true,
        status: 'ACTIVE',
        dnsProvider: 'Vercel DNS / Cloudflare',
      },
    });
    console.log('Updated AERØX domain record.');
  }

  // Polish Tillu
  const tilluWeb = await prisma.website.findFirst({ where: { domain: 'tillu.co.uk' } });
  if (tilluWeb) {
    await prisma.website.update({
      where: { id: tilluWeb.id },
      data: {
        name: 'Tillu – Modern Direct Commerce',
        cms: 'Shopify / Custom Headless',
        framework: 'Next.js',
        hostingProvider: 'Cloudflare Pages / Vercel',
        sslStatus: 'ACTIVE',
        notes: 'UK-based lifestyle e-commerce and retail merchandising platform with automated checkout.',
      },
    });
  }

  // Polish Suraj Portfolio
  const surajWeb = await prisma.website.findFirst({ where: { domain: { contains: 'suraj-animation' } } });
  if (surajWeb) {
    await prisma.website.update({
      where: { id: surajWeb.id },
      data: {
        name: 'Suraj Vishwakarma | 3D Creative Portfolio',
        cms: 'Custom WebGL',
        framework: 'Three.js / React',
        hostingProvider: 'Vercel',
        sslStatus: 'ACTIVE',
        notes: 'Award-winning 3D motion design, character animation, and interactive WebGL showcase.',
      },
    });
  }

  // Polish WorkComposer
  const workComposerWeb = await prisma.website.findFirst({ where: { domain: { contains: 'workcomposer' } } });
  if (workComposerWeb) {
    await prisma.website.update({
      where: { id: workComposerWeb.id },
      data: {
        name: 'WorkComposer | Enterprise Productivity Suite',
        cms: 'Custom SaaS',
        framework: 'Next.js / Node.js',
        hostingProvider: 'AWS / Vercel',
        sslStatus: 'ACTIVE',
        notes: 'Intelligent workflow orchestration, automated time tracking, and enterprise team analytics platform.',
      },
    });
  }

  // 2. Seed Infrastructure Assets
  console.log('2. Seeding Infrastructure Assets...');
  const existingInfraCount = await prisma.infrastructureAsset.count({ where: { workspaceId } });
  if (existingInfraCount === 0) {
    const infraAssets = [
      {
        workspaceId,
        websiteId: colaWeb?.id || null,
        name: 'edge-cluster-us-east',
        type: 'CLOUD_SERVER',
        provider: 'AWS EC2',
        environment: 'PRODUCTION',
        region: 'us-east-1 (N. Virginia)',
        publicIp: '54.210.142.88',
        privateIp: '10.0.12.45',
        status: 'RUNNING',
        os: 'Ubuntu 24.04 LTS (HVM)',
        resourcesJson: JSON.stringify({ cpu: '16 vCPU', ram: '64 GB High-Memory', storage: '500 GB NVMe SSD', bandwidth: '10 Gbps' }),
        notes: 'High-throughput Node.js microservices cluster for webhook routing and batch processing.',
      },
      {
        workspaceId,
        websiteId: null,
        name: 'aurora-pg-cluster-prod',
        type: 'DATABASE',
        provider: 'AWS RDS Aurora',
        environment: 'PRODUCTION',
        region: 'us-east-1 (N. Virginia)',
        publicIp: null,
        privateIp: '10.0.34.12',
        status: 'RUNNING',
        os: 'PostgreSQL 16.2 Enterprise Engine',
        resourcesJson: JSON.stringify({ storage: '1.2 TB Multi-AZ Replicated', iops: '15,000 Provisioned IOPS', connections: 'Max 2,000' }),
        notes: 'Primary relational database for workspace entities, analytics snapshots, and security audit log streams.',
      },
      {
        workspaceId,
        websiteId: null,
        name: 'cloudflare-enterprise-cdn',
        type: 'CDN',
        provider: 'Cloudflare Enterprise',
        environment: 'PRODUCTION',
        region: 'Global (310+ Edge Data Centers)',
        publicIp: '104.21.68.92',
        privateIp: null,
        status: 'RUNNING',
        os: 'Edge Anycast CDN OS',
        resourcesJson: JSON.stringify({ edgeCache: 'Tiered Enterprise Caching', tls: 'TLS 1.3 / HTTP/3 QUIC', ddosMitigation: 'Layer 3/4/7 Unlimited' }),
        notes: 'Global asset acceleration, automated image optimization, and WAF DDoS security shield.',
      },
      {
        workspaceId,
        websiteId: null,
        name: 'r2-media-vault-storage',
        type: 'STORAGE',
        provider: 'Cloudflare R2 / AWS S3',
        environment: 'PRODUCTION',
        region: 'Global Multi-Region Distributed',
        publicIp: null,
        privateIp: null,
        status: 'RUNNING',
        os: 'Object Storage Fabric',
        resourcesJson: JSON.stringify({ capacity: '18.4 TB Used', objects: '142,500 Objects', redundancy: '99.999999999% Durability' }),
        notes: 'S3-compatible immutable storage vault for media assets, client campaign video renders, and exports.',
      },
      {
        workspaceId,
        websiteId: null,
        name: 'redis-queue-cluster',
        type: 'SERVICE',
        provider: 'Upstash / AWS ElastiCache',
        environment: 'PRODUCTION',
        region: 'us-east-1',
        publicIp: null,
        privateIp: '10.0.52.8',
        status: 'RUNNING',
        os: 'Redis 7.2 In-Memory KeyDB',
        resourcesJson: JSON.stringify({ memory: '16 GB RAM In-Memory', latency: '0.8ms P99', throughput: '45,000 ops/sec' }),
        notes: 'Low-latency in-memory cache for OAuth session verification, rate limiting, and social posting dispatch queues.',
      },
      {
        workspaceId,
        websiteId: tilluWeb?.id || null,
        name: 'vercel-edge-runtime-mesh',
        type: 'HOSTING',
        provider: 'Vercel Enterprise',
        environment: 'PRODUCTION',
        region: 'Global Edge Runtime',
        publicIp: '76.76.21.21',
        privateIp: null,
        status: 'RUNNING',
        os: 'Vercel Edge Functions (V8)',
        resourcesJson: JSON.stringify({ concurrency: 'Unlimited Serverless', deploymentCadence: 'Continuous CI/CD', coldStart: '<15ms' }),
        notes: 'Server-side rendering, API route proxies, and static generation mesh for brand web applications.',
      },
    ];

    for (const item of infraAssets) {
      await prisma.infrastructureAsset.create({ data: item });
    }
    console.log(`Created ${infraAssets.length} infrastructure assets.`);
  } else {
    console.log(`Infrastructure assets already exist (${existingInfraCount}).`);
  }

  // 3. Seed Media Assets
  console.log('3. Seeding Media Assets...');
  const existingMediaCount = await prisma.mediaAsset.count({ where: { workspaceId } });
  if (existingMediaCount === 0) {
    const mediaAssets = [
      {
        workspaceId,
        filename: 'acme-brand-master-logomark.svg',
        originalName: 'Acme_Brand_Master_Logomark_Vector.svg',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        mimeType: 'image/svg+xml',
        sizeBytes: 24580,
        width: 1200,
        height: 1200,
        folder: 'Brand Identity',
        tagsJson: JSON.stringify(['brand', 'vector', 'logo', 'master']),
      },
      {
        workspaceId,
        filename: 'campaign-spring-key-visual.jpg',
        originalName: 'Campaign_Spring_Omnichannel_KV_4K.jpg',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 1845000,
        width: 3840,
        height: 2160,
        folder: 'Campaigns 2026',
        tagsJson: JSON.stringify(['spring-growth', 'banner', 'omnichannel', '4k']),
      },
      {
        workspaceId,
        filename: 'foto-trendz-editorial-portrait-01.jpg',
        originalName: 'Studio_Editorial_Portrait_HighRes.jpg',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 2140000,
        width: 2400,
        height: 3000,
        folder: 'Foto Trendz',
        tagsJson: JSON.stringify(['editorial', 'studio', 'portrait', 'lighting']),
      },
      {
        workspaceId,
        filename: 'aerox-futuristic-abstract-render.png',
        originalName: 'AEROX_3D_CGI_Keyframe_Render.png',
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&auto=format&fit=crop&q=80',
        mimeType: 'image/png',
        sizeBytes: 3450000,
        width: 3200,
        height: 1800,
        folder: '3D & Motion',
        tagsJson: JSON.stringify(['aerox', '3d', 'render', 'abstract', 'webgl']),
      },
      {
        workspaceId,
        filename: 'social-infographic-q1-metrics.png',
        originalName: 'Q1_Executive_Performance_Summary.png',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        mimeType: 'image/png',
        sizeBytes: 980000,
        width: 1920,
        height: 1080,
        folder: 'Analytics Reports',
        tagsJson: JSON.stringify(['infographic', 'metrics', 'social-roi', 'q1']),
      },
      {
        workspaceId,
        filename: 'tuvaa-community-summit-banner.jpg',
        originalName: 'TUVAA_Annual_Convention_Banner.jpg',
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 1540000,
        width: 2560,
        height: 1440,
        folder: 'Community Events',
        tagsJson: JSON.stringify(['tuvaa', 'convention', 'community', 'keynote']),
      },
      {
        workspaceId,
        filename: 'ecommerce-lifestyle-tillu-collection.jpg',
        originalName: 'Tillu_Summer_Collection_Hero.jpg',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 2420000,
        width: 2800,
        height: 1860,
        folder: 'E-Commerce',
        tagsJson: JSON.stringify(['tillu', 'fashion', 'retail', 'lookbook']),
      },
    ];

    for (const item of mediaAssets) {
      await prisma.mediaAsset.create({ data: item });
    }
    console.log(`Created ${mediaAssets.length} media assets.`);
  } else {
    console.log(`Media assets already exist (${existingMediaCount}).`);
  }

  // 4. Seed Diverse, High-Level Security Events
  console.log('4. Seeding High-Tier Security Events...');
  // Add fresh security events that give the live feed real enterprise context
  const securityEvents = [
    {
      adminId,
      action: 'DOMAIN_DNS_VERIFIED',
      resource: 'aerox1.vercel.app',
      ipAddress: '104.28.19.42',
      userAgent: 'Cloudflare-Edge-Verifier/2.4',
      result: 'SUCCESS',
      metadataJson: JSON.stringify({ domain: 'aerox1.vercel.app', record: 'CNAME', target: 'cname.vercel-dns.com', latencyMs: 18 }),
      createdAt: new Date(Date.now() - 4 * 60 * 1000), // 4 mins ago
    },
    {
      adminId,
      action: 'SSL_CERTIFICATE_RENEWED',
      resource: 'tillu.co.uk',
      ipAddress: '52.204.14.80',
      userAgent: 'LetsEncrypt-ACME-Automator/3.1',
      result: 'SUCCESS',
      metadataJson: JSON.stringify({ certType: 'Wildcard ECDSA TLS 1.3', validDays: 90, ocspStapling: true }),
      createdAt: new Date(Date.now() - 18 * 60 * 1000), // 18 mins ago
    },
    {
      adminId,
      action: 'OAUTH_TOKEN_ROTATED',
      resource: 'Instagram & LinkedIn APIs',
      ipAddress: '172.56.21.89',
      userAgent: 'SocialFlow-KMS/256-GCM',
      result: 'SUCCESS',
      metadataJson: JSON.stringify({ keyVersion: 'v3', accountsEncrypted: 17, algorithm: 'AES-256-GCM' }),
      createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
    },
    {
      adminId,
      action: 'FIREWALL_RULE_ENFORCED',
      resource: 'WAF Rate Limiter',
      ipAddress: '198.51.100.24',
      userAgent: 'Cloudflare-Security-Engine',
      result: 'BLOCKED',
      metadataJson: JSON.stringify({ blockedProbes: 42, ruleId: 'WAF-90021-SQLi-Bot-Shield', sourceCountry: 'RO' }),
      createdAt: new Date(Date.now() - 58 * 60 * 1000), // 58 mins ago
    },
    {
      adminId,
      action: 'DATABASE_BACKUP_COMPLETED',
      resource: 'aurora-pg-cluster-prod',
      ipAddress: '3.212.80.15',
      userAgent: 'AWS-Backup-Orchestrator',
      result: 'SUCCESS',
      metadataJson: JSON.stringify({ snapshotId: 'snap-pg-20260910-auto', sizeGb: 48.2, encrypted: true }),
      createdAt: new Date(Date.now() - 110 * 60 * 1000), // ~1.8h ago
    },
    {
      adminId,
      action: 'POST_AUTO_DISPATCHED',
      resource: 'Social Dispatch Queue',
      ipAddress: '142.250.190.46',
      userAgent: 'SocialFlow-Publisher-Worker/1.4',
      result: 'SUCCESS',
      metadataJson: JSON.stringify({ platforms: ['LinkedIn', 'Twitter', 'Facebook'], status: 'DELIVERED', postId: 'cmtp-post-902' }),
      createdAt: new Date(Date.now() - 145 * 60 * 1000), // ~2.4h ago
    },
  ];

  for (const ev of securityEvents) {
    await prisma.securityEvent.create({ data: ev });
  }
  console.log(`Created ${securityEvents.length} fresh security events.`);

  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
  })
  .finally(() => prisma.$disconnect());
