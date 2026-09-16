const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifs = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('Notifs found:', notifs.length);
  console.log(JSON.stringify(notifs, null, 2));

  const workspaces = await prisma.workspace.findMany();
  console.log('Workspaces:', workspaces.length, workspaces.map(w => ({ id: w.id, name: w.name, website: w.website, businessEmail: w.businessEmail })));
}

main().finally(() => prisma.$disconnect());
