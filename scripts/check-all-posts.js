const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, globalContent: true, status: true, campaignId: true, isSoftDeleted: true }
  });
  console.log('Posts in DB count:', posts.length);
  for (const p of posts) {
    console.log({
      id: p.id,
      title: p.title,
      content: p.globalContent.slice(0, 40),
      status: p.status,
      campaignId: p.campaignId,
      isSoftDeleted: p.isSoftDeleted,
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
