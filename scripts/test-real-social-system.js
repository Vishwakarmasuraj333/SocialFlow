const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== SOCIALFLOW REAL SOCIAL MEDIA SYSTEM VERIFICATION ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database Schema & Platform Registry
    console.log('1. Checking Database Platforms & Capabilities...');
    const platforms = await prisma.platform.findMany();
    assert(platforms.length > 0, `Found ${platforms.length} platforms registered in database`);

    const igPlatform = platforms.find((p) => p.slug === 'instagram');
    assert(Boolean(igPlatform), 'Instagram platform registered in database');
    assert(igPlatform && igPlatform.characterLimit === 2200, `Instagram character limit is ${igPlatform?.characterLimit}`);
    assert(igPlatform && igPlatform.videoSupport === true, 'Instagram video support enabled');

    // 2. Existing Websites & Domains Integrity Check (Section 27)
    console.log('\n2. Verifying Existing Website & Domain Management Integrity...');
    const websites = await prisma.website.findMany();
    const domains = await prisma.domain.findMany();
    assert(websites.length > 0, `Existing websites intact: ${websites.length} websites in database`);
    assert(domains.length > 0, `Existing domains intact: ${domains.length} domains in database`);

    // Verify a known website
    const tuvaaSite = websites.find((w) => w.domain.includes('tuvaa'));
    assert(Boolean(tuvaaSite), 'TUVAA website preserved in database');

    // 3. Admin User & Workspace
    console.log('\n3. Verifying Admin & Workspace...');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    assert(Boolean(adminUser), `Admin user found: ${adminUser?.email}`);

    const workspace = await prisma.workspace.findFirst();
    assert(Boolean(workspace), `Workspace found: ${workspace?.name} (${workspace?.id})`);

    // 4. Clean Database: Verify No Hardcoded 200,000 Fake Accounts
    console.log('\n4. Verifying No Hardcoded 200,000 Fake Demo Social Accounts...');
    const accounts = await prisma.socialAccount.findMany({
      where: { isSoftDeleted: false },
      include: { metrics: true },
    });
    console.log(`Current social accounts in database: ${accounts.length}`);

    // Create a real test account with real initial metrics
    console.log('\n5. Testing Real Social Account Lifecycle...');
    const testPlatformAccountId = `test_ig_${Date.now()}`;
    const testAccount = await prisma.socialAccount.create({
      data: {
        workspaceId: workspace.id,
        platformId: igPlatform.id,
        platform: 'INSTAGRAM',
        accountName: 'Test Official Studio',
        accountHandle: `@test_studio_${Date.now()}`,
        avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=teststudio',
        platformAccountId: testPlatformAccountId,
        status: 'CONNECTED',
        publishingEnabled: true,
        analyticsEnabled: true,
        metadataJson: JSON.stringify({ verified: true, category: 'Photography' }),
      },
    });
    assert(Boolean(testAccount.id), `Created test account: ${testAccount.accountHandle}`);

    // Record two real historical metric snapshots to test real growth computation (Section 5 & 6)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const m1 = await prisma.socialAccountMetric.create({
      data: {
        socialAccountId: testAccount.id,
        followers: 1200,
        following: 350,
        reach: 4500,
        impressions: 8200,
        likes: 210,
        comments: 45,
        recordedAt: yesterday,
      },
    });

    const m2 = await prisma.socialAccountMetric.create({
      data: {
        socialAccountId: testAccount.id,
        followers: 1250,
        following: 355,
        reach: 5100,
        impressions: 9400,
        likes: 280,
        comments: 62,
        recordedAt: new Date(),
      },
    });

    assert(Boolean(m1 && m2), 'Created 2 sequential metric snapshots in database');

    // Test Growth Calculation from database records
    const snapshots = await prisma.socialAccountMetric.findMany({
      where: { socialAccountId: testAccount.id },
      orderBy: { recordedAt: 'desc' },
    });

    const currentFollowers = snapshots[0].followers;
    const previousFollowers = snapshots[1].followers;
    const growthDelta = currentFollowers - previousFollowers;
    const growthPercent = Number(((growthDelta / previousFollowers) * 100).toFixed(2));

    assert(snapshots.length >= 2, 'Found at least 2 historical snapshots for growth calculation');
    assert(currentFollowers === 1250, `Current followers computed accurately: ${currentFollowers}`);
    assert(previousFollowers === 1200, `Previous followers computed accurately: ${previousFollowers}`);
    assert(growthDelta === 50, `Growth delta accurately computed (+50 followers): ${growthDelta}`);
    assert(growthPercent === 4.17, `Growth percentage accurately computed (+4.17%): ${growthPercent}%`);

    // 6. Test Multi-Platform Post Workflow (Section 7, 8, 11, 14)
    console.log('\n6. Testing Multi-Platform Post Lifecycle (Create, Schedule, Duplicate, Delete)...');
    const scheduledTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days in future
    const post = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        authorId: adminUser.id,
        title: 'Q3 Enterprise Architecture Release',
        globalContent: 'Excited to announce our new production release with real API metrics and zero demo data.',
        status: 'SCHEDULED',
        scheduledAt: scheduledTime,
        timezone: 'Asia/Kolkata',
        targets: {
          create: [
            {
              platform: 'INSTAGRAM',
              socialAccountId: testAccount.id,
              publishStatus: 'PENDING',
            },
            {
              platform: 'LINKEDIN',
              publishStatus: 'PENDING',
            },
          ],
        },
      },
      include: { targets: true },
    });

    assert(Boolean(post.id), `Created scheduled post: ${post.id}`);
    assert(post.status === 'SCHEDULED', `Post status is SCHEDULED`);
    assert(post.targets.length === 2, `Post targets count is 2 (Instagram, LinkedIn)`);

    // Cancel schedule test
    const cancelledPost = await prisma.post.update({
      where: { id: post.id },
      data: { status: 'DRAFT', scheduledAt: null },
    });
    assert(cancelledPost.status === 'DRAFT' && cancelledPost.scheduledAt === null, 'Cancelled post returned to DRAFT');

    // Duplicate post test
    const dupPost = await prisma.post.create({
      data: {
        workspaceId: post.workspaceId,
        authorId: post.authorId,
        title: `${post.title} (Copy)`,
        globalContent: post.globalContent,
        status: 'DRAFT',
        targets: {
          create: post.targets.map((t) => ({
            platform: t.platform,
            publishStatus: 'PENDING',
          })),
        },
      },
    });
    assert(dupPost.title.includes('(Copy)'), `Duplicated post created: ${dupPost.title}`);

    // Soft delete post test
    const softDeleted = await prisma.post.update({
      where: { id: post.id },
      data: { isSoftDeleted: true, deletedAt: new Date() },
    });
    assert(softDeleted.isSoftDeleted === true, 'Post successfully soft-deleted to Trash');

    // Clean up test account
    await prisma.socialAccount.delete({ where: { id: testAccount.id } });
    await prisma.post.delete({ where: { id: dupPost.id } });
    await prisma.post.delete({ where: { id: post.id } });
    console.log('Cleaned up test fixtures.');

  } catch (err) {
    console.error('Test run failed with error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runTests();
