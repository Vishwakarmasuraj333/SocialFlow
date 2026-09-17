const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Real Production Campaigns ---');

  const workspace = await prisma.workspace.findFirst({
    where: {
      OR: [
        { id: 'cmu524pko000351gc30y8s1iq' },
        { slug: 'socialflow-command' },
        { name: { contains: 'SocialFlow' } }
      ]
    },
    include: {
      posts: true
    }
  });

  if (!workspace) {
    console.error('No workspace found!');
    process.exit(1);
  }

  // Clear existing dummy campaigns
  await prisma.campaign.deleteMany({
    where: { workspaceId: workspace.id }
  });

  const campaignsToCreate = [
    {
      name: 'Q4 Global Omni-Channel Growth Sprint',
      objective: 'AWARENESS',
      budget: 15000,
      color: '#6366f1',
      status: 'ACTIVE',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2026-11-30T23:59:59.000Z'),
      postTitles: [
        'Next-Generation Design System & Visual Token Moodboard',
        'SocialFlow Omni-Engine v2.4 Announcement'
      ]
    },
    {
      name: 'Radhe Radhe Sacred Art & Cultural Aesthetics',
      objective: 'ENGAGEMENT',
      budget: 5000,
      color: '#ec4899',
      status: 'ACTIVE',
      startDate: new Date('2026-09-10T00:00:00.000Z'),
      endDate: new Date('2026-10-25T23:59:59.000Z'),
      postTitles: [
        'Radhe Radhe - Devotional Aesthetics & Sacred Art Showcase',
        'Minimalist Studio Architecture & Creative Workspace Pin'
      ]
    },
    {
      name: 'Viral Shorts & High-Impact Video Lab',
      objective: 'CONVERSIONS',
      budget: 8500,
      color: '#10b981',
      status: 'ACTIVE',
      startDate: new Date('2026-09-15T00:00:00.000Z'),
      endDate: new Date('2026-12-15T23:59:59.000Z'),
      postTitles: [
        'High-Impact Video Publishing Pipeline Demo',
        'How SocialFlow Publishes to 8 Social Networks Simultaneously (200ms Queue)'
      ]
    },
    {
      name: 'Enterprise Cloud Infrastructure & Zero-Latency SaaS',
      objective: 'TRAFFIC',
      budget: 12000,
      color: '#0284c7',
      status: 'ACTIVE',
      startDate: new Date('2026-08-20T00:00:00.000Z'),
      endDate: new Date('2026-10-31T23:59:59.000Z'),
      postTitles: [
        'Enterprise Social Infrastructure: Achieving 99.99% Queue Reliability at Scale',
        'Creator Spotlight: Scaling Global Media Reach with Zero Latency',
        'Q3 Executive Analytics Briefing'
      ]
    }
  ];

  for (const c of campaignsToCreate) {
    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: workspace.id,
        name: c.name,
        objective: c.objective,
        budget: c.budget,
        color: c.color,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
      }
    });

    // Link posts to this campaign
    for (const pTitle of c.postTitles) {
      await prisma.post.updateMany({
        where: {
          workspaceId: workspace.id,
          title: { contains: pTitle.slice(0, 30) }
        },
        data: {
          campaignId: campaign.id
        }
      });
    }

    console.log(`✓ Created Campaign: "${campaign.name}" ($${campaign.budget}) with linked posts`);
  }

  console.log('--- Successfully Seeded Enterprise Campaigns ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
