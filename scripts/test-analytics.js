const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accs = await prisma.socialAccount.findMany({
    where: { workspaceId: 'cmu524pko000351gc30y8s1iq', isSoftDeleted: false },
    include: { metrics: { orderBy: { recordedAt: 'desc' }, take: 1 } }
  });

  let totalAud = 0;
  for (const a of accs) {
    const f = a.metrics[0]?.followers || 0;
    totalAud += f;
    console.log(`${a.platform} (${a.accountHandle}): ${f.toLocaleString()} followers`);
  }
  console.log('--- TOTAL AUDIENCE ACROSS ALL PLATFORMS:', totalAud.toLocaleString());

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: 'cmu524pko000351gc30y8s1iq' },
    include: { _count: { select: { posts: true } } }
  });
  console.log('--- CAMPAIGNS & POSTS:');
  for (const c of campaigns) {
    console.log(`Campaign "${c.name}": ${c._count.posts} posts linked, Budget: $${c.budget}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
