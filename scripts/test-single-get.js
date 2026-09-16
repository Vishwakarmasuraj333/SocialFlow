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

  const bm = await prisma.socialAccount.findFirst({
    where: { accountHandle: '@brownmonkeytv' }
  });

  const res = await fetch(`http://localhost:3000/api/admin/social-accounts/${bm.id}`, {
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    }
  });

  console.log('GET Account Status:', res.status);
  const data = await res.json();
  console.log('Account Details:', {
    id: data.account?.id,
    name: data.account?.accountName,
    handle: data.account?.accountHandle,
    platform: data.account?.platform,
    followers: data.account?.followers,
    status: data.account?.status
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
