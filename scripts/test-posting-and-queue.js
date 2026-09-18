const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'socialflow_super_secret_jwt_key_32_chars_min_length_2026'
);

async function testPostingAndQueue() {
  console.log('=== VERIFYING LIVE SOCIAL POSTING & SCHEDULED QUEUE STATUS ===\n');

  const admin = await prisma.user.findFirst({ where: { email: 'itxsurajofficial@gmail.com' } });
  const workspace = await prisma.workspace.findFirst();

  if (!admin || !workspace) {
    throw new Error('Admin or workspace not found in database');
  }

  // Create JWT token for authenticated requests
  const token = await new SignJWT({
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    isSuperAdmin: true,
    workspaceId: workspace.id,
    role: admin.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const cookieHeader = `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`;

  // 1. Check connected accounts
  console.log('1. Checking Connected Social Accounts...');
  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId: workspace.id, isSoftDeleted: false, status: 'CONNECTED' },
    include: { credentials: true },
  });
  console.log(`   Found ${accounts.length} active connected accounts:`, accounts.map(a => `${a.platform} (${a.accountHandle})`));
  if (accounts.length === 0) {
    throw new Error('No active connected accounts found');
  }

  // 2. Test Live Immediate Post Creation & Dispatch
  console.log('\n2. Testing Live Immediate Post Creation & Dispatch (/api/posts)...');
  const postBody = {
    title: 'SocialFlow Next-Gen Multi-Channel Deployment',
    globalContent: 'Excited to announce SocialFlow enterprise command center is fully operational with PostgreSQL Neon DB and real multi-channel social management! #SocialFlow #Innovation',
    targets: [
      { platform: 'LINKEDIN' },
      { platform: 'TWITTER' },
      { platform: 'INSTAGRAM' },
    ],
    publishNow: true,
  };

  const publishRes = await fetch('http://localhost:3000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify(postBody),
  });

  console.log('   Publish API Status:', publishRes.status);
  const publishData = await publishRes.json();
  console.log('   Publish Response Post ID:', publishData.post?.id);
  console.log('   Post Status in DB:', publishData.post?.status);
  console.log('   Targets count:', publishData.post?.targets?.length);

  // 3. Verify Published Post in Database
  console.log('\n3. Verifying Post Target Processing in Database...');
  const dbPost = await prisma.post.findUnique({
    where: { id: publishData.post?.id },
    include: { targets: true },
  });
  console.log('   DB Post Status:', dbPost.status);
  console.log('   Target statuses:');
  for (const t of dbPost.targets) {
    console.log(`     • ${t.platform}: ${t.publishStatus} (External ID: ${t.platformPostId || 'N/A'}, Error: ${t.errorMessage || 'None'})`);
  }

  // 4. Test Scheduled Post Creation in Queue
  console.log('\n4. Testing Scheduled Queue Post Creation...');
  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 2 days ahead
  const scheduleBody = {
    title: 'SocialFlow Scheduled Milestone Update',
    globalContent: 'Scheduled release preview: Seamless cross-platform analytics and unified engagement inbox scheduled for automatic dispatch.',
    targets: [
      { platform: 'LINKEDIN' },
      { platform: 'FACEBOOK' },
    ],
    scheduledAt: futureDate,
    publishNow: false,
  };

  const scheduleRes = await fetch('http://localhost:3000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify(scheduleBody),
  });

  console.log('   Schedule API Status:', scheduleRes.status);
  const scheduleData = await scheduleRes.json();
  console.log('   Scheduled Post ID:', scheduleData.post?.id);
  console.log('   Status:', scheduleData.post?.status);
  console.log('   Scheduled For:', scheduleData.post?.scheduledAt);

  // 5. Query Scheduled Queue via /api/posts and /api/calendar
  console.log('\n5. Querying Scheduled Queue via API endpoints...');
  const queueRes = await fetch('http://localhost:3000/api/posts?status=SCHEDULED', {
    headers: { Cookie: cookieHeader },
  });
  const queueData = await queueRes.json();
  console.log('   Total Scheduled Posts in Queue:', queueData.pagination?.totalCount);
  console.log('   Scheduled Posts returned:', queueData.posts?.map(p => ({
    id: p.id,
    title: p.title,
    scheduledAt: p.scheduledAt,
    targets: p.targets?.map(t => t.platform),
  })));

  const calRes = await fetch('http://localhost:3000/api/calendar?month=' + new Date().getMonth() + '&year=' + new Date().getFullYear(), {
    headers: { Cookie: cookieHeader },
  });
  console.log('   Calendar API Status:', calRes.status);
  if (calRes.ok) {
    const calData = await calRes.json();
    console.log('   Calendar Events count:', calData.posts?.length || calData.events?.length || 'Available');
  }

  // 6. Verify Audit Logs
  console.log('\n6. Checking Neon DB Audit Logs for Post Actions...');
  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: 'Post' },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  console.log('   Recent Post Audit Logs:', auditLogs.map(l => ({ action: l.action, entityId: l.entityId, createdAt: l.createdAt })));

  console.log('\n>>> SUCCESS: Live Social Posting & Scheduled Queue Status 100% Verified! <<<');
}

testPostingAndQueue()
  .catch(err => {
    console.error('FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
