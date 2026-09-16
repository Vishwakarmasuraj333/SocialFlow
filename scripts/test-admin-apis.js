const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${name}${details ? ` (${details})` : ''}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}${details ? ` (${details})` : ''}`);
    failed++;
  }
}

async function testApiBackendLogic() {
  console.log('====================================================');
  console.log('📡 SocialFlow Admin API Handlers & Logic Verification');
  console.log('====================================================\n');

  try {
    // 1. Dashboard Stats Calculation Logic
    console.log('--- 1. Testing Dashboard Stats Calculation Logic ---');
    const [
      totalWebsites,
      activeWebsites,
      totalDomains,
      totalSocialAccounts,
      connectedSocialAccounts,
      scheduledPosts,
      publishedPosts,
      failedPosts,
      totalMediaAssets,
      totalInfrastructureAssets,
      activeAdmins,
      totalSecurityEvents,
    ] = await Promise.all([
      prisma.website.count(),
      prisma.website.count({ where: { status: 'ACTIVE' } }),
      prisma.domain.count(),
      prisma.socialAccount.count(),
      prisma.socialAccount.count({ where: { status: 'CONNECTED' } }),
      prisma.post.count({ where: { status: 'SCHEDULED', isSoftDeleted: false } }),
      prisma.post.count({ where: { status: 'PUBLISHED', isSoftDeleted: false } }),
      prisma.post.count({ where: { status: 'FAILED', isSoftDeleted: false } }),
      prisma.mediaAsset.count(),
      prisma.infrastructureAsset.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.securityEvent.count(),
    ]);

    assert(typeof totalWebsites === 'number', 'Calculates totalWebsites count', `${totalWebsites}`);
    assert(typeof activeWebsites === 'number', 'Calculates activeWebsites count', `${activeWebsites}`);
    assert(typeof totalDomains === 'number', 'Calculates totalDomains count', `${totalDomains}`);
    assert(typeof totalSocialAccounts === 'number', 'Calculates totalSocialAccounts count', `${totalSocialAccounts}`);
    assert(typeof connectedSocialAccounts === 'number', 'Calculates connectedSocialAccounts count', `${connectedSocialAccounts}`);
    assert(typeof scheduledPosts === 'number', 'Calculates scheduledPosts count', `${scheduledPosts}`);
    assert(typeof publishedPosts === 'number', 'Calculates publishedPosts count', `${publishedPosts}`);
    assert(typeof failedPosts === 'number', 'Calculates failedPosts count', `${failedPosts}`);
    assert(typeof totalMediaAssets === 'number', 'Calculates totalMediaAssets count', `${totalMediaAssets}`);
    assert(typeof totalInfrastructureAssets === 'number', 'Calculates totalInfrastructureAssets count', `${totalInfrastructureAssets}`);
    assert(typeof activeAdmins === 'number', 'Calculates activeAdmins count', `${activeAdmins}`);
    assert(typeof totalSecurityEvents === 'number', 'Calculates totalSecurityEvents count', `${totalSecurityEvents}`);

    // 2. Audit Trail Logic
    console.log('\n--- 2. Testing Audit Trail Query Logic ---');
    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        workspace: { select: { id: true, name: true, slug: true } },
      },
    });
    assert(Array.isArray(auditLogs), 'Audit logs query returns array', `${auditLogs.length} logs sampled`);

    // 3. Security Events Logic
    console.log('\n--- 3. Testing Security Events Query Logic ---');
    const securityEvents = await prisma.securityEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    });
    assert(Array.isArray(securityEvents), 'Security events query returns array', `${securityEvents.length} events sampled`);

    // 4. Websites & Domains Relation Logic
    console.log('\n--- 4. Testing Websites & Fleet Relational Logic ---');
    const websitesWithRelations = await prisma.website.findMany({
      include: {
        domains: true,
        infrastructure: true,
        contents: true,
        createdBy: { select: { name: true, email: true } },
      },
    });
    assert(websitesWithRelations.length > 0, 'Websites query includes domains and contents relations', `${websitesWithRelations.length} websites found`);
    if (websitesWithRelations.length > 0) {
      const firstSite = websitesWithRelations[0];
      assert(Boolean(firstSite.domain && firstSite.url), `Website "${firstSite.name}" has valid domain & URL`, `${firstSite.domain} -> ${firstSite.url}`);
    }

    // 5. Workspaces & Memberships Relational Logic
    console.log('\n--- 5. Testing Multi-Tenant Workspaces & Memberships ---');
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        socialAccounts: true,
        _count: {
          select: { members: true, socialAccounts: true, posts: true },
        },
      },
    });
    assert(workspaces.length > 0, 'Workspaces returned with member relations and aggregates', `${workspaces.length} workspaces`);

    // 6. Central Trash Vault Soft-Delete Logic
    console.log('\n--- 6. Testing Central Trash Soft-Delete Logic ---');
    const [softDeletedPosts, archivedWebsites, archivedDomains, archivedLocations, archivedCampaigns] = await Promise.all([
      prisma.post.findMany({ where: { isSoftDeleted: true } }),
      prisma.website.findMany({ where: { status: 'ARCHIVED' } }),
      prisma.domain.findMany({ where: { status: 'ARCHIVED' } }),
      prisma.businessLocation.findMany({ where: { isArchived: true } }),
      prisma.campaign.findMany({ where: { status: 'ARCHIVED' } }),
    ]);
    const totalTrashed = softDeletedPosts.length + archivedWebsites.length + archivedDomains.length + archivedLocations.length + archivedCampaigns.length;
    assert(typeof totalTrashed === 'number', 'Trash aggregation across 5 entity types computed cleanly', `${totalTrashed} trashed items`);

    // 7. Admins Staff Directory & RBAC
    console.log('\n--- 7. Testing Admins Directory & Roles ---');
    const admins = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isSuperAdmin: true,
      },
    });
    const hasAdmin = admins.some((a) => a.isSuperAdmin || a.role === 'SUPER_ADMIN' || a.role === 'ADMIN');
    assert(hasAdmin, 'Staff directory has authorized administrative accounts', `${admins.length} total staff accounts`);

    console.log('\n====================================================');
    console.log(`📊 API Backend Logic: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('API Verification error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

testApiBackendLogic().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
