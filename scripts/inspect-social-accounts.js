const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.socialAccount.findMany({
    select: {
      id: true,
      platform: true,
      accountHandle: true,
      accountName: true,
      status: true,
      isSoftDeleted: true,
      workspaceId: true,
    }
  });
  console.log('TOTAL_ACCOUNTS:', accounts.length);
  console.log(JSON.stringify(accounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
