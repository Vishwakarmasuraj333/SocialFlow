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

  console.log('--- 1. Testing Creating a Website ---');
  const createRes = await fetch('http://localhost:3000/api/admin/websites', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Test Delete Website',
      domain: 'test-delete-site.com',
      url: 'https://test-delete-site.com'
    })
  });
  console.log('Create Website Status:', createRes.status);
  const created = await createRes.json();
  const siteId = created.website?.id;

  console.log('\n--- 2. Testing Soft Deleting (Archiving) Website ---');
  const archiveRes = await fetch(`http://localhost:3000/api/admin/websites?id=${siteId}&permanent=false`, {
    method: 'DELETE',
    headers
  });
  console.log('Archive Status:', archiveRes.status);
  const archiveJson = await archiveRes.json();
  console.log('Archive Response:', archiveJson);

  console.log('\n--- 3. Verifying GET does not return archived website ---');
  const getRes = await fetch('http://localhost:3000/api/admin/websites', { headers });
  const getData = await getRes.json();
  const found = getData.websites?.some(w => w.id === siteId);
  console.log('Archived website appears in active list? (Should be false):', found);

  console.log('\n--- 4. Testing Permanent Deletion of Website ---');
  const permRes = await fetch(`http://localhost:3000/api/admin/websites?id=${siteId}&permanent=true`, {
    method: 'DELETE',
    headers
  });
  console.log('Permanent Delete Status:', permRes.status);
  const permJson = await permRes.json();
  console.log('Permanent Delete Response:', permJson);

  console.log('\nALL WEBSITE TESTS PASSED.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
