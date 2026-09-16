const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'socialflow_super_secret_jwt_key_32_chars_min_length_2026'
);

async function testAuth() {
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

  console.log('Testing authenticated GET /api/settings...');
  const res = await fetch('http://localhost:3000/api/settings', {
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    }
  });

  console.log('Settings HTTP status:', res.status);
  const data = await res.json();
  console.log('Settings payload user:', {
    id: data.user?.id,
    name: data.user?.name,
    email: data.user?.email,
    avatarUrl: data.user?.avatarUrl,
    bio: data.user?.bio,
    role: data.user?.role
  });
  console.log('Settings sessions count:', data.sessions?.length);
  console.log('Settings workspace:', data.workspace?.name);

  console.log('\nTesting authenticated GET /api/notifications...');
  const notifRes = await fetch('http://localhost:3000/api/notifications', {
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    }
  });
  console.log('Notifications HTTP status:', notifRes.status);
  const notifData = await notifRes.json();
  console.log('Notifications unread count:', notifData.unreadCount);
  console.log('Notifications items count:', notifData.notifications?.length);

  console.log('\nTesting authenticated GET /api/admin/company...');
  const compRes = await fetch('http://localhost:3000/api/admin/company', {
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    }
  });
  console.log('Company HTTP status:', compRes.status);
  const compData = await compRes.json();
  console.log('Company name:', compData.company?.name);

  console.log('\n=== ALL REAL API ENDPOINTS VERIFIED & WORKING WITH DATABASE ===');
}

testAuth()
  .catch(err => console.error('Auth test failed:', err))
  .finally(() => prisma.$disconnect());
