const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isSuperAdmin: true, passwordHash: true }
  });
  console.log('All Users:', users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, isSuperAdmin: u.isSuperAdmin })));

  for (const u of users) {
    const isPw123 = await bcrypt.compare('Password123!', u.passwordHash);
    console.log(`User ${u.email} password is "Password123!":`, isPw123);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
