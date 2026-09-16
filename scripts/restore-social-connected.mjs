import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.socialAccount.updateMany({
    where: { isSoftDeleted: false },
    data: {
      status: 'CONNECTED',
      lastSyncedAt: new Date(),
    },
  });
  console.log(`Updated ${updated.count} accounts to CONNECTED.`);
  
  const accounts = await prisma.socialAccount.findMany({ where: { isSoftDeleted: false } });
  console.log('Current active accounts:', accounts.map(a => ({ platform: a.platform, handle: a.accountHandle, status: a.status })));
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
