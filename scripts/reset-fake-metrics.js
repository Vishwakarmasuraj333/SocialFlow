const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- RESETTING FAKE METRICS & DEMO POSTS ---');

  // 1. Find brownmonkeytv
  const bm = await prisma.socialAccount.findFirst({
    where: {
      OR: [
        { accountHandle: '@brownmonkeytv' },
        { accountHandle: 'brownmonkeytv' }
      ]
    }
  });

  if (bm) {
    // Delete all fake metric snapshots
    await prisma.socialAccountMetric.deleteMany({
      where: { socialAccountId: bm.id }
    });

    // Create a real, clean 0-baseline snapshot
    await prisma.socialAccountMetric.create({
      data: {
        socialAccountId: bm.id,
        followers: 0,
        following: 0,
        subscribers: 0,
        reach: 0,
        impressions: 0,
        engagement: 0.0,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        saves: 0,
        clicks: 0,
        recordedAt: new Date()
      }
    });

    // Clean metadataJson
    await prisma.socialAccount.update({
      where: { id: bm.id },
      data: {
        status: 'CONNECTED',
        metadataJson: JSON.stringify({
          followers: 0,
          accountType: 'BUSINESS',
          authMethod: 'CREDENTIALS',
          category: 'Entertainment & Media',
          lastAuthenticatedAt: new Date().toISOString()
        })
      }
    });

    console.log('✓ brownmonkeytv followers reset to real clean 0 (ready for real sync/custom count).');
  }

  // 2. Soft-delete all fake demo posts
  const updatedPosts = await prisma.post.updateMany({
    where: {
      isSoftDeleted: false
    },
    data: {
      isSoftDeleted: true,
      status: 'DRAFT',
      deletedAt: new Date()
    }
  });
  console.log(`✓ Soft-deleted ${updatedPosts.count} fake demo posts.`);

  // 3. Verify clean metrics
  const activeMetrics = await prisma.socialAccountMetric.findMany({
    where: bm ? { socialAccountId: bm.id } : {},
    orderBy: { recordedAt: 'desc' }
  });
  console.log('Active metrics for brownmonkeytv:', JSON.stringify(activeMetrics, null, 2));

  // 4. Verify clean published posts
  const publishedPosts = await prisma.post.findMany({
    where: { status: 'PUBLISHED', isSoftDeleted: false }
  });
  console.log('Remaining published posts count (should be 0):', publishedPosts.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
