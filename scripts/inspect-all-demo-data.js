const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- POSTS IN DATABASE ---');
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, globalContent: true, status: true, isSoftDeleted: true }
  });
  console.log('Posts count:', posts.length);
  console.log(JSON.stringify(posts, null, 2));

  console.log('\n--- WEBSITES IN DATABASE ---');
  const websites = await prisma.website.findMany({
    include: { domains: true }
  });
  console.log('Websites count:', websites.length);
  console.log(JSON.stringify(websites.map(w => ({
    id: w.id,
    name: w.name,
    domain: w.domain,
    url: w.url,
    domainsCount: w.domains.length
  })), null, 2));

  console.log('\n--- SOCIAL ACCOUNT METRICS ---');
  const metrics = await prisma.socialAccountMetric.findMany({
    orderBy: { recordedAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(metrics, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
