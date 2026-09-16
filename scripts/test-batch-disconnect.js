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

  const accounts = await prisma.socialAccount.findMany({
    where: { isSoftDeleted: false },
    take: 5
  });

  for (const acc of accounts) {
    const url = `http://localhost:3000/api/admin/social-accounts/${acc.id}/disconnect`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': `socialflow_session=${token}; socialflow_active_workspace=${workspace.id}`,
        'Content-Type': 'application/json'
      }
    });
    const body = await res.text();
    console.log(`${acc.platform} (${acc.accountHandle}) [${acc.id}] -> Status: ${res.status} Body: ${body.substring(0, 100)}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
