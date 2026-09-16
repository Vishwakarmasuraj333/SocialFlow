import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.socialAccount.findMany();
  console.log('Total social accounts:', accounts.length);
  for (const acc of accounts) {
    console.log(`- [${acc.status}] [softDeleted: ${acc.isSoftDeleted}] id=${acc.id} ${acc.platform} ${acc.accountName} (${acc.accountHandle})`);
  }
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
