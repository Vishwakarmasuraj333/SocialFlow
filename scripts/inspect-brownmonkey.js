const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.socialAccount.findMany({
    where: {
      OR: [
        { accountHandle: { contains: 'brownmonkey' } },
        { accountName: { contains: 'brownmonkey' } }
      ]
    },
    include: {
      credentials: true,
      metrics: {
        orderBy: { recordedAt: 'desc' }
      }
    }
  });

  console.log('BROWNMONKEY_ACCOUNTS:', JSON.stringify(accounts, null, 2));

  // Also check all other accounts
  const allAccounts = await prisma.socialAccount.findMany({
    select: {
      id: true,
      platform: true,
      accountName: true,
      accountHandle: true,
      status: true,
      isSoftDeleted: true,
    }
  });
  console.log('ALL_ACCOUNTS_COUNT:', allAccounts.length);
  console.log('ACCOUNTS_SUMMARY:', JSON.stringify(allAccounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
