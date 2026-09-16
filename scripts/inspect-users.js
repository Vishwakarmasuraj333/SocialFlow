const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isSuperAdmin: true,
      memberships: {
        select: {
          id: true,
          workspaceId: true,
          role: true,
          workspace: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
