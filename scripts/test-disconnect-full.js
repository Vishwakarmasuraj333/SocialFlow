const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'socialflow_super_secret_jwt_key_32_chars_min_length_2026'
);

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const workspace = await prisma.workspace.findFirst();

  const token = await new SignJWT({
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    isSuperAdmin: true,
    workspaceId: workspace.id,
    role: admin.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const headers = {
    'Cookie': `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`,
    'Content-Type': 'application/json'
  };

  console.log('--- 1. Testing Single Disconnect API ---');
  const singleAccount = await prisma.socialAccount.findFirst();
  if (singleAccount) {
    const singleRes = await fetch(`http://localhost:3000/api/admin/social-accounts/${singleAccount.id}/disconnect`, {
      method: 'POST',
      headers,
    });
    console.log('Single Disconnect Status:', singleRes.status);
    const singleBody = await singleRes.json();
    console.log('Single Disconnect Response:', singleBody);
  }

  console.log('\n--- 2. Testing Atomic Bulk Disconnect API ---');
  const someAccounts = await prisma.socialAccount.findMany({ take: 3 });
  const ids = someAccounts.map(a => a.id);
  const bulkRes = await fetch(`http://localhost:3000/api/admin/social-accounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'bulk-disconnect', ids })
  });
  console.log('Bulk Disconnect Status:', bulkRes.status);
  const bulkBody = await bulkRes.json();
  console.log('Bulk Disconnect Response:', bulkBody);

  console.log('\n--- 3. Testing Single Disconnect Action API ---');
  if (ids[0]) {
    const actionRes = await fetch(`http://localhost:3000/api/admin/social-accounts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'disconnect', id: ids[0] })
    });
    console.log('Action Disconnect Status:', actionRes.status);
    const actionBody = await actionRes.json();
    console.log('Action Disconnect Response:', actionBody);
  }

  console.log('\nALL TESTS EXECUTED.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
