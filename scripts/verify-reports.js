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

  const res = await fetch('http://localhost:3000/api/reports?days=30&format=json', {
    headers: {
      Cookie: `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`
    }
  });

  console.log('HTTP Status:', res.status);
  const data = await res.json();
  console.log('Report Summary:', JSON.stringify(data.summary, null, 2));
  console.log('Top Posts Count:', data.topPosts?.length);
  console.log('Top Posts:', JSON.stringify(data.topPosts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
