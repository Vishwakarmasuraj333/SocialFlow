import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.socialAccount.findMany({ where: { isSoftDeleted: false } });
  console.log(`Active accounts count: ${accounts.length}`);
  for (const a of accounts) {
    console.log(`- ${a.platform}: ${a.accountName} (${a.accountHandle}) -> [${a.status}]`);
  }
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
