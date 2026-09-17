const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workspaces = await prisma.workspace.findMany();
  console.log('Workspaces:', workspaces.map(w => ({ id: w.id, name: w.name })));

  const allAccounts = await prisma.socialAccount.findMany({
    include: { credentials: true }
  });
  console.log('All Social Accounts count:', allAccounts.length);
  for (const acc of allAccounts) {
    console.log({
      id: acc.id,
      platform: acc.platform,
      workspaceId: acc.workspaceId,
      accountName: acc.accountName,
      status: acc.status,
      isSoftDeleted: acc.isSoftDeleted,
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
