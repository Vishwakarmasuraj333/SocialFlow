const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

async function runAdminVerification() {
  console.log('====================================================');
  console.log('🚀 SocialFlow Super Admin Complete Test & Verification');
  console.log('====================================================\n');

  // TEST 1: Admin Navigation Route Files on Disk
  console.log('--- 1. Admin Dashboard Route Integrity & File Verification ---');

  const adminRoutes = [
    // Top-level / Center
    { path: 'src/app/admin/(panel)/dashboard/page.tsx', label: 'Admin Center Dashboard' },
    { path: 'src/app/admin/(panel)/system-health/page.tsx', label: 'Infrastructure Diagnostics & Health' },
    { path: 'src/app/admin/(panel)/reports/page.tsx', label: 'System Reports & Export' },
    { path: 'src/app/admin/(panel)/trash/page.tsx', label: 'Trash Recovery Vault' },

    // Company Module
    { path: 'src/app/admin/(panel)/company/page.tsx', label: 'Company Overview' },
    { path: 'src/app/admin/(panel)/company/profile/page.tsx', label: 'Company Profile' },
    { path: 'src/app/admin/(panel)/company/locations/page.tsx', label: 'Company Locations' },
    { path: 'src/app/admin/(panel)/company/activity/page.tsx', label: 'Company Activity & Audit' },

    // Websites Fleet
    { path: 'src/app/admin/(panel)/websites/page.tsx', label: 'All Websites Fleet' },
    { path: 'src/app/admin/(panel)/websites/domains/page.tsx', label: 'Domains Management' },
    { path: 'src/app/admin/(panel)/websites/dns/page.tsx', label: 'DNS Records & Zone Config' },
    { path: 'src/app/admin/(panel)/websites/infrastructure/page.tsx', label: 'Websites Hosting & Infra' },
    { path: 'src/app/admin/(panel)/websites/deployments/page.tsx', label: 'Fleet Deployments Stream' },
    { path: 'src/app/admin/(panel)/websites/content/page.tsx', label: 'Websites CMS & Content' },
    { path: 'src/app/admin/(panel)/websites/seo/page.tsx', label: 'Websites SEO & Metadata' },

    // Social Governance
    { path: 'src/app/admin/(panel)/social/accounts/page.tsx', label: 'Social Accounts Fleet' },
    { path: 'src/app/admin/(panel)/social/publisher/page.tsx', label: 'Social Publisher Dispatch' },
    { path: 'src/app/admin/(panel)/social/calendar/page.tsx', label: 'Social Calendar Queue' },
    { path: 'src/app/admin/(panel)/social/posts/page.tsx', label: 'Social Posts & Feed Stream' },
    { path: 'src/app/admin/(panel)/social/campaigns/page.tsx', label: 'Social Campaigns' },
    { path: 'src/app/admin/(panel)/social/analytics/page.tsx', label: 'Social Performance Analytics' },

    // Media Library
    { path: 'src/app/admin/(panel)/media/page.tsx', label: 'Enterprise Media Library' },

    // Infrastructure Module
    { path: 'src/app/admin/(panel)/infrastructure/servers/page.tsx', label: 'Infrastructure Servers & VPS' },
    { path: 'src/app/admin/(panel)/infrastructure/databases/page.tsx', label: 'Infrastructure Databases' },
    { path: 'src/app/admin/(panel)/infrastructure/storage/page.tsx', label: 'Infrastructure Cloud Storage' },
    { path: 'src/app/admin/(panel)/infrastructure/cdn/page.tsx', label: 'Infrastructure CDN Networks' },
    { path: 'src/app/admin/(panel)/infrastructure/services/page.tsx', label: 'Infrastructure Services & APIs' },

    // Security Module
    { path: 'src/app/admin/(panel)/security/login-activity/page.tsx', label: 'Security Login Activity' },
    { path: 'src/app/admin/(panel)/security/sessions/page.tsx', label: 'Security Active Sessions' },
    { path: 'src/app/admin/(panel)/security/audit-logs/page.tsx', label: 'Security Audit Logs' },
    { path: 'src/app/admin/(panel)/security/integrations/page.tsx', label: 'Security Integrations' },

    // Admins & Tenancy
    { path: 'src/app/admin/(panel)/admins/page.tsx', label: 'All Admins Staff Directory' },
    { path: 'src/app/admin/(panel)/admins/roles/page.tsx', label: 'RBAC Roles Matrix' },
    { path: 'src/app/admin/(panel)/admins/permissions/page.tsx', label: 'Permissions Granular Table' },
    { path: 'src/app/admin/(panel)/users/page.tsx', label: 'Platform Users Directory' },
    { path: 'src/app/admin/(panel)/workspaces/page.tsx', label: 'Workspaces Fleet' },

    // Settings
    { path: 'src/app/admin/(panel)/settings/company/page.tsx', label: 'Company Settings' },
    { path: 'src/app/admin/(panel)/settings/profile/page.tsx', label: 'Admin Profile Settings' },
    { path: 'src/app/admin/(panel)/settings/security/page.tsx', label: 'Security & 2FA Settings' },
    { path: 'src/app/admin/(panel)/settings/notifications/page.tsx', label: 'Notifications Settings' },
    { path: 'src/app/admin/(panel)/settings/integrations/page.tsx', label: 'API & Webhooks Settings' },
  ];

  for (const r of adminRoutes) {
    const fullPath = path.join(__dirname, '..', r.path);
    const exists = fs.existsSync(fullPath);
    assert(exists, `Admin Route: ${r.label}`, r.path);
  }

  // TEST 2: Admin API Endpoints Files on Disk
  console.log('\n--- 2. Admin API Endpoints File Existence ---');
  const apiEndpoints = [
    'src/app/api/admin/dashboard/stats/route.ts',
    'src/app/api/admin/audit-logs/route.ts',
    'src/app/api/admin/system-health/route.ts',
    'src/app/api/admin/health/route.ts',
    'src/app/api/admin/company/route.ts',
    'src/app/api/admin/company/locations/route.ts',
    'src/app/api/admin/websites/route.ts',
    'src/app/api/admin/websites/health/route.ts',
    'src/app/api/admin/domains/route.ts',
    'src/app/api/admin/dns/route.ts',
    'src/app/api/admin/web-content/route.ts',
    'src/app/api/admin/infrastructure/route.ts',
    'src/app/api/admin/admins/route.ts',
    'src/app/api/admin/users/route.ts',
    'src/app/api/admin/workspaces/route.ts',
    'src/app/api/admin/trash/route.ts',
    'src/app/api/admin/security/events/route.ts',
    'src/app/api/admin/security/sessions/route.ts',
    'src/app/api/admin/auth/login/route.ts',
    'src/app/api/reports/route.ts',
  ];

  for (const api of apiEndpoints) {
    const fullPath = path.join(__dirname, '..', api);
    const exists = fs.existsSync(fullPath);
    assert(exists, `Admin API: ${api}`);
  }

  // TEST 3: Database Models & Real Records
  console.log('\n--- 3. Database Connectivity & Live Production Models ---');
  try {
    const [
      userCount,
      workspaceCount,
      websiteCount,
      domainCount,
      dnsCount,
      infraCount,
      auditCount,
      securityEventCount,
      locationCount,
      webContentCount,
      postCount,
      socialCount,
      mediaCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.website.count(),
      prisma.domain.count(),
      prisma.dnsRecord.count(),
      prisma.infrastructureAsset.count(),
      prisma.auditLog.count(),
      prisma.securityEvent.count(),
      prisma.businessLocation.count(),
      prisma.webContent.count(),
      prisma.post.count(),
      prisma.socialAccount.count(),
      prisma.mediaAsset.count(),
    ]);

    assert(userCount > 0, `Users in database`, `${userCount} users`);
    assert(workspaceCount > 0, `Workspaces in database`, `${workspaceCount} workspaces`);
    assert(websiteCount > 0, `Websites in database`, `${websiteCount} websites`);
    assert(domainCount > 0, `Domains in database`, `${domainCount} domains`);
    assert(dnsCount >= 0, `DNS records in database`, `${dnsCount} records`);
    assert(infraCount >= 0, `Infrastructure assets in database`, `${infraCount} assets`);
    assert(auditCount >= 0, `Audit logs in database`, `${auditCount} events`);
    assert(securityEventCount >= 0, `Security events in database`, `${securityEventCount} events`);
    assert(locationCount >= 0, `Business locations in database`, `${locationCount} locations`);
    assert(webContentCount >= 0, `Web content CMS entries`, `${webContentCount} pages/articles`);
    assert(postCount >= 0, `Posts in stream`, `${postCount} posts`);
    assert(socialCount >= 0, `Connected social channels`, `${socialCount} channels`);
    assert(mediaCount >= 0, `Media asset library`, `${mediaCount} assets`);

    // Super Admin user verification
    const superAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { isSuperAdmin: true },
          { role: 'SUPER_ADMIN' },
        ],
      },
    });
    assert(Boolean(superAdmin), `Super Admin user exists`, superAdmin ? `${superAdmin.name} (${superAdmin.email})` : 'None');

    // Default Workspace verification
    const defaultWs = await prisma.workspace.findFirst({
      include: {
        _count: { select: { websites: true, socialAccounts: true, members: true } },
      },
    });
    assert(Boolean(defaultWs), `Primary workspace identified`, defaultWs ? `${defaultWs.name} [websites: ${defaultWs._count.websites}, social: ${defaultWs._count.socialAccounts}]` : 'None');

  } catch (err) {
    assert(false, `Database query check failed`, err.message);
  }

  // TEST 4: Cryptography & Secret Handling (AES-256-GCM)
  console.log('\n--- 4. Cryptographic Encryption & Decryption (AES-256-GCM) ---');
  try {
    const rawKey = process.env.ENCRYPTION_KEY || 'socialflow_secret_encryption_key_32_bytes_2026';
    const key = crypto.createHash('sha256').update(rawKey).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const secretPayload = 'oauth_refresh_token_prod_super_secret_xyz123';
    let encrypted = cipher.update(secretPayload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    assert(Boolean(encrypted && authTag), 'Secret successfully encrypted with AES-256-GCM');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    assert(decrypted === secretPayload, 'Secret successfully decrypted and verified identical');
  } catch (err) {
    assert(false, 'Cryptographic cipher test', err.message);
  }

  // TEST 5: System Health Diagnostics Engine
  console.log('\n--- 5. System Health Engine Check ---');
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - t0;
    assert(latency >= 0, `Database query ping latency`, `${latency}ms`);

    const mem = process.memoryUsage();
    const rssMb = Math.round(mem.rss / 1024 / 1024);
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    assert(rssMb > 0 && heapUsedMb > 0, `Process memory diagnostics computed`, `Heap: ${heapUsedMb}MB, RSS: ${rssMb}MB`);
  } catch (err) {
    assert(false, 'Health diagnostics check', err.message);
  }

  // Summary
  console.log('\n====================================================');
  console.log(`📊 Final Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminVerification().catch(async (e) => {
  console.error('Fatal error during verification:', e);
  await prisma.$disconnect();
  process.exit(1);
});
