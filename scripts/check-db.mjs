import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  await prisma.website.updateMany({
    where: {
      NOT: {
        domain: {
          contains: 'socialflow'
        }
      }
    },
    data: {
      deploymentUrl: null
    }
  });

  const all = await prisma.website.findMany();
  console.log('COUNT:', all.length);
  for (const w of all) {
    console.log(w.id, w.name, w.domain, 'deploymentUrl:', w.deploymentUrl, 'url:', w.url);
  }
}
check().finally(() => prisma.$disconnect());
