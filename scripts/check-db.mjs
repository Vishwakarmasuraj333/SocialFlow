import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.website.findMany();
  console.log('COUNT:', all.length);
  for (const w of all) {
    console.log(w.id, w.name, w.domain, 'workspaceId:', w.workspaceId, 'status:', w.status);
  }
}
check().finally(() => prisma.$disconnect());
